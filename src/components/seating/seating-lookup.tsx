"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  RoomCanvas,
  ElementBox,
  type FloorElement,
} from "@/components/seating/floor";

function haystack(e: FloorElement): string {
  return [e.label, e.party, e.table, ...(e.names ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function SeatingLookup({
  imageUrl,
  imgWidth,
  imgHeight,
  roomWidth,
  roomHeight,
  unit,
  elements,
}: {
  imageUrl: string | null;
  imgWidth: number | null;
  imgHeight: number | null;
  roomWidth: number | null;
  roomHeight: number | null;
  unit: string;
  elements: FloorElement[];
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"map" | "list">("map");
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const tables = useMemo(
    () => elements.filter((e) => e.kind === "table"),
    [elements]
  );

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const matches = useMemo(
    () => (searching ? tables.filter((e) => haystack(e).includes(q)) : []),
    [tables, q, searching]
  );
  const matchedIds = useMemo(() => new Set(matches.map((e) => e.id)), [matches]);

  function focusTable(el: FloorElement) {
    setSelectedId(el.id);
    setView("map");
    requestAnimationFrame(() => {
      const c = scrollRef.current;
      const stage = stageRef.current;
      if (!c || !stage) return;
      const px = el.x * stage.clientWidth;
      const py = el.y * stage.clientHeight;
      c.scrollTo({
        left: px - c.clientWidth / 2,
        top: py - c.clientHeight / 2,
        behavior: "smooth",
      });
    });
  }

  const listTables = useMemo(() => {
    const base = searching ? matches : tables;
    return [...base].sort(
      (a, b) =>
        (a.table ?? "~").localeCompare(b.table ?? "~", undefined, {
          numeric: true,
        }) || a.label.localeCompare(b.label)
    );
  }, [tables, matches, searching]);

  const selected = elements.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Search + view toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your name or party…"
            className="w-full rounded-full border border-sage-200 bg-white px-5 py-3 text-sm text-ink outline-none transition-colors focus:border-dustyblue-400 focus:ring-2 focus:ring-dustyblue-100"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
            >
              ✕
            </button>
          )}
        </div>
        <div className="inline-flex rounded-full border border-sage-200 bg-white p-1">
          {(["map", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm capitalize transition-colors",
                view === v ? "bg-dustyblue-600 text-ivory" : "text-ink/60"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Search results summary */}
      {searching && (
        <div className="mt-4">
          {matches.length === 0 ? (
            <p className="rounded-xl bg-blush-50 px-4 py-3 text-sm text-blush-500">
              No match for “{query}”. Try a last name or party name, or check
              with the couple.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matches.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => focusTable(e)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors",
                    selectedId === e.id
                      ? "border-dustyblue-500 bg-dustyblue-600 text-ivory"
                      : "border-sage-200 bg-white text-ink/80 hover:border-dustyblue-400"
                  )}
                >
                  {e.label}
                  {e.table && (
                    <span className="ml-2 text-xs opacity-80">· {e.table}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map view */}
      {view === "map" && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-end gap-1">
            <ZoomButton onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>
              −
            </ZoomButton>
            <span className="w-12 text-center text-xs text-ink/50">
              {Math.round(zoom * 100)}%
            </span>
            <ZoomButton onClick={() => setZoom((z) => Math.min(4, z + 0.5))}>
              +
            </ZoomButton>
          </div>
          <div
            ref={scrollRef}
            className="relative max-h-[70vh] overflow-auto rounded-2xl border border-sage-100 bg-cream/20 p-4 sm:p-8"
          >
            <div style={{ width: `${zoom * 100}%` }}>
              <RoomCanvas
                stageRef={stageRef}
                imageUrl={imageUrl}
                imgWidth={imgWidth}
                imgHeight={imgHeight}
                roomWidth={roomWidth}
                roomHeight={roomHeight}
                unit={unit}
                className="overflow-visible rounded-2xl"
              >
                {elements.map((el) => {
                  const isTable = el.kind === "table";
                  const dim = searching && isTable && !matchedIds.has(el.id);
                  const hot = searching && matchedIds.has(el.id);
                  return (
                    <ElementBox
                      key={el.id}
                      el={el}
                      showCaption
                      state={{
                        selected: selectedId === el.id,
                        dimmed: dim,
                        matched: hot,
                      }}
                      onClick={
                        isTable
                          ? (ev) => {
                              ev.stopPropagation();
                              focusTable(el);
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </RoomCanvas>
            </div>
          </div>
          {selected && selected.kind === "table" && (
            <SelectedDetails el={selected} />
          )}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-sage-100">
          {listTables.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink/55">
              No seating to show.
            </p>
          ) : (
            <ul className="divide-y divide-sage-50">
              {listTables.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 bg-white px-5 py-3"
                >
                  <div>
                    <p className="text-sage-800">{e.label}</p>
                    {(e.party || (e.names && e.names.length > 0)) && (
                      <p className="text-xs text-ink/55">
                        {e.party && <span>{e.party}</span>}
                        {e.party && e.names && e.names.length > 0 && (
                          <span> · </span>
                        )}
                        {e.names && e.names.length > 0 && (
                          <span>{e.names.join(", ")}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <span className="font-display text-lg text-dustyblue-700">
                    {e.table ?? ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SelectedDetails({ el }: { el: FloorElement }) {
  return (
    <div className="mt-4 rounded-2xl border border-sage-100 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl text-sage-800">{el.label}</h3>
        {el.table && (
          <span className="font-display text-2xl text-dustyblue-700">
            {el.table}
          </span>
        )}
      </div>
      {el.party && <p className="mt-1 text-sm text-ink/60">{el.party}</p>}
      {el.names && el.names.length > 0 && (
        <p className="mt-2 text-sm text-ink/70">{el.names.join(", ")}</p>
      )}
    </div>
  );
}

function ZoomButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-sage-200 bg-white text-lg text-ink/70 transition-colors hover:bg-sage-50"
    >
      {children}
    </button>
  );
}
