"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadSeatingImage } from "@/lib/client-upload";
import {
  saveSeatingElements,
  setMapActive,
  deleteSeatingMap,
  updateMapMeta,
  type ElementInput,
} from "@/server/seating-admin";
import {
  Card,
  adminInputClass,
  adminLabelClass,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  RoomCanvas,
  ElementBox,
  KIND_META,
  KIND_ORDER,
  type ElementKind,
  type ElementShape,
  type FloorElement,
} from "@/components/seating/floor";

export type EditorElement = {
  id: string;
  kind: ElementKind;
  shape: ElementShape;
  label: string;
  party: string;
  table: string;
  names: string[];
  seats: number | null;
  color: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
};

type Tool = "select" | ElementKind;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const clampSize = (n: number) => Math.min(1.5, Math.max(0.02, n));

const COLOR_PRESETS = [
  "#4c7188", // dusty blue
  "#765f93", // lavender
  "#586b46", // sage
  "#e68c61", // peach
  "#b8975a", // gold
  "#9a9a93", // stone
];

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `el-${Date.now()}-${Math.random()}`;
}

const TOOL_LABEL: Record<Tool, string> = {
  select: "Select",
  table: "Table",
  area: "Area",
  door: "Door",
  text: "Text",
  misc: "Item",
};

export function SeatingMapEditor({
  mapId,
  name,
  imageUrl,
  imgWidth,
  imgHeight,
  roomWidth,
  roomHeight,
  unit,
  isActive,
  initialElements,
}: {
  mapId: string;
  name: string;
  imageUrl: string | null;
  imgWidth: number | null;
  imgHeight: number | null;
  roomWidth: number | null;
  roomHeight: number | null;
  unit: string;
  isActive: boolean;
  initialElements: EditorElement[];
}) {
  const router = useRouter();
  const [els, setEls] = useState<EditorElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ moved: boolean } | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const selected = els.find((e) => e.id === selectedId) ?? null;
  const sizeUnit = roomWidth ? unit : "%";
  const toDisplay = (frac: number) =>
    roomWidth ? Math.round(frac * roomWidth) : Math.round(frac * 100);
  const fromDisplay = (val: number) =>
    roomWidth ? val / roomWidth : val / 100;

  function update(id: string, patch: Partial<EditorElement>) {
    setEls((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    setDirty(true);
  }

  function addAt(kind: ElementKind, x: number, y: number) {
    const meta = KIND_META[kind];
    const id = newId();
    const el: EditorElement = {
      id,
      kind,
      shape: meta.shape,
      label:
        kind === "table"
          ? `Table ${els.filter((e) => e.kind === "table").length + 1}`
          : kind === "text"
            ? "Label"
            : meta.label,
      party: "",
      table:
        kind === "table"
          ? `Table ${els.filter((e) => e.kind === "table").length + 1}`
          : "",
      names: [],
      seats: kind === "table" ? 8 : null,
      color: null,
      x: clamp01(x),
      y: clamp01(y),
      w: meta.w,
      h: meta.h,
      rotation: 0,
    };
    setEls((prev) => [...prev, el]);
    setSelectedId(id);
    setDirty(true);
  }

  function pointFromEvent(clientX: number, clientY: number) {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
      rect,
    };
  }

  function onStageClick(e: React.MouseEvent) {
    if (draggingRef.current) return; // ignore the click that ends a drag
    if (tool === "select") {
      setSelectedId(null);
      return;
    }
    const { x, y } = pointFromEvent(e.clientX, e.clientY);
    addAt(tool, x, y);
  }

  function onElementPointerDown(e: React.PointerEvent, el: EditorElement) {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(el.id);
    const rect = stageRef.current!.getBoundingClientRect();
    draggingRef.current = { moved: false };

    const onMove = (ev: PointerEvent) => {
      const x = clamp01((ev.clientX - rect.left) / rect.width);
      const y = clamp01((ev.clientY - rect.top) / rect.height);
      if (draggingRef.current) draggingRef.current.moved = true;
      setEls((prev) => prev.map((p) => (p.id === el.id ? { ...p, x, y } : p)));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const moved = draggingRef.current?.moved;
      setTimeout(() => {
        draggingRef.current = null;
      }, 0);
      if (moved) setDirty(true);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onResizePointerDown(e: React.PointerEvent, el: EditorElement) {
    e.stopPropagation();
    e.preventDefault();
    const rect = stageRef.current!.getBoundingClientRect();
    const cx = rect.left + el.x * rect.width;
    const cy = rect.top + el.y * rect.height;
    draggingRef.current = { moved: true };

    const onMove = (ev: PointerEvent) => {
      const newW = clampSize((2 * Math.abs(ev.clientX - cx)) / rect.width);
      const newHpx = 2 * Math.abs(ev.clientY - cy);
      const newH = clampSize(newHpx / rect.width);
      setEls((prev) =>
        prev.map((p) =>
          p.id === el.id
            ? p.shape === "circle"
              ? { ...p, w: newW, h: newW }
              : { ...p, w: newW, h: newH }
            : p
        )
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setTimeout(() => {
        draggingRef.current = null;
      }, 0);
      setDirty(true);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function deleteSelected() {
    if (!selected) return;
    setEls((prev) => prev.filter((e) => e.id !== selected.id));
    setSelectedId(null);
    setDirty(true);
  }

  function save() {
    startSave(async () => {
      const payload: ElementInput[] = els.map((e) => ({
        kind: e.kind,
        shape: e.shape,
        label: e.label,
        party: e.party,
        table: e.table,
        names: e.names,
        seats: e.seats,
        color: e.color,
        x: e.x,
        y: e.y,
        w: e.w,
        h: e.h,
        rotation: e.rotation,
      }));
      const res = await saveSeatingElements(mapId, payload);
      if (res.ok) {
        setDirty(false);
        setSavedAt(new Date().toLocaleTimeString());
        router.refresh();
      }
    });
  }

  async function onReplaceFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacing(true);
    const res = await uploadSeatingImage(file, mapId);
    setReplacing(false);
    if (!res.error) router.refresh();
  }

  function togglePublish() {
    startSave(async () => {
      await setMapActive(mapId, !isActive);
      router.refresh();
    });
  }

  function removeMap() {
    if (!confirm("Delete this map and everything on it? This can't be undone."))
      return;
    startSave(async () => {
      await deleteSeatingMap(mapId);
      router.refresh();
    });
  }

  const tableCount = els.filter((e) => e.kind === "table").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
      {/* Canvas + toolbar */}
      <div>
        {/* Tool palette */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["select", ...KIND_ORDER] as Tool[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTool(t)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                tool === t
                  ? "border-dustyblue-500 bg-dustyblue-600 text-white"
                  : "border-sage-200 bg-white text-ink/70 hover:border-sage-400"
              )}
            >
              {TOOL_LABEL[t]}
            </button>
          ))}
          <span
            className={cn(
              "ml-auto rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              isActive ? "bg-sage-100 text-sage-700" : "bg-ink/10 text-ink/50"
            )}
          >
            {isActive ? "Published" : "Draft"}
          </span>
        </div>

        <p className="mb-2 text-xs text-ink/55">
          {tool === "select"
            ? "Click an item to select · drag to move · use the corner to resize"
            : `Click on the room to place a ${TOOL_LABEL[tool].toLowerCase()}`}
        </p>

        <RoomCanvas
          stageRef={stageRef}
          imageUrl={imageUrl}
          imgWidth={imgWidth}
          imgHeight={imgHeight}
          roomWidth={roomWidth}
          roomHeight={roomHeight}
          unit={unit}
          onClick={onStageClick}
          className={cn(
            "overflow-hidden rounded-2xl",
            !imageUrl && "mt-6 mb-6",
            tool === "select" ? "cursor-default" : "cursor-crosshair"
          )}
        >
          {els.map((el) => (
            <ElementBox
              key={el.id}
              el={el as FloorElement}
              draggable
              state={{ selected: selectedId === el.id }}
              onPointerDown={(e) => onElementPointerDown(e, el)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(el.id);
              }}
            >
              {selectedId === el.id && (
                <span
                  onPointerDown={(e) => onResizePointerDown(e, el)}
                  className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-dustyblue-600 shadow"
                  title="Drag to resize"
                />
              )}
            </ElementBox>
          ))}
        </RoomCanvas>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
          {savedAt && !dirty && (
            <span className="text-xs text-ink/45">Saved at {savedAt}</span>
          )}
          <span className="ml-auto text-xs text-ink/45">
            {tableCount} table{tableCount === 1 ? "" : "s"} · {els.length} item
            {els.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        {selected ? (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg text-sage-800">
                Edit {TOOL_LABEL[selected.kind].toLowerCase()}
              </h3>
              <button
                type="button"
                onClick={deleteSelected}
                className="text-xs uppercase tracking-widest text-blush-500 hover:text-blush-400"
              >
                Delete
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={adminLabelClass}>
                  {selected.kind === "text" ? "Text" : "Label"}
                </label>
                <input
                  value={selected.label}
                  onChange={(e) => update(selected.id, { label: e.target.value })}
                  className={adminInputClass}
                  placeholder={
                    selected.kind === "area"
                      ? "e.g. Dance Floor"
                      : selected.kind === "door"
                        ? "e.g. Entrance"
                        : selected.kind === "table"
                          ? "e.g. The Johnson Family"
                          : "Label"
                  }
                />
              </div>

              {selected.kind === "table" && (
                <>
                  <div>
                    <label className={adminLabelClass}>Table name/number</label>
                    <input
                      value={selected.table}
                      onChange={(e) =>
                        update(selected.id, { table: e.target.value })
                      }
                      className={adminInputClass}
                      placeholder="e.g. Table 5"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={adminLabelClass}>Party / family</label>
                      <input
                        value={selected.party}
                        onChange={(e) =>
                          update(selected.id, { party: e.target.value })
                        }
                        className={adminInputClass}
                        placeholder="e.g. Johnson"
                      />
                    </div>
                    <div className="w-20">
                      <label className={adminLabelClass}>Seats</label>
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={selected.seats ?? ""}
                        onChange={(e) =>
                          update(selected.id, {
                            seats: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className={adminInputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={adminLabelClass}>
                      Guest names (one per line)
                    </label>
                    <textarea
                      value={selected.names.join("\n")}
                      onChange={(e) =>
                        update(selected.id, {
                          names: e.target.value.split("\n"),
                        })
                      }
                      rows={4}
                      className={`${adminInputClass} resize-y`}
                      placeholder={"Robert Johnson\nMary Johnson"}
                    />
                    <p className="mt-1 text-xs text-ink/45">
                      Guests can search any of these names.
                    </p>
                  </div>
                </>
              )}

              {/* Shape toggle (not for text/door) */}
              {(selected.kind === "table" ||
                selected.kind === "area" ||
                selected.kind === "misc") && (
                <div>
                  <label className={adminLabelClass}>Shape</label>
                  <div className="inline-flex rounded-full border border-sage-200 bg-white p-1">
                    {(["circle", "rect"] as ElementShape[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update(selected.id, { shape: s })}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs capitalize transition-colors",
                          selected.shape === s
                            ? "bg-sage-600 text-ivory"
                            : "text-ink/60"
                        )}
                      >
                        {s === "rect" ? "Rectangle" : "Round"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className={adminLabelClass}>Width ({sizeUnit})</label>
                  <input
                    type="number"
                    min={1}
                    value={toDisplay(selected.w)}
                    onChange={(e) =>
                      update(selected.id, {
                        w: clampSize(fromDisplay(Number(e.target.value))),
                        ...(selected.shape === "circle"
                          ? { h: clampSize(fromDisplay(Number(e.target.value))) }
                          : {}),
                      })
                    }
                    className={adminInputClass}
                  />
                </div>
                {selected.shape !== "circle" && (
                  <div className="flex-1">
                    <label className={adminLabelClass}>
                      Height ({sizeUnit})
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={toDisplay(selected.h)}
                      onChange={(e) =>
                        update(selected.id, {
                          h: clampSize(fromDisplay(Number(e.target.value))),
                        })
                      }
                      className={adminInputClass}
                    />
                  </div>
                )}
              </div>

              {/* Rotation */}
              <div>
                <label className={adminLabelClass}>
                  Rotation: {Math.round(selected.rotation)}°
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={359}
                    value={selected.rotation}
                    onChange={(e) =>
                      update(selected.id, { rotation: Number(e.target.value) })
                    }
                    className="flex-1 accent-dustyblue-600"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(selected.id, {
                        rotation: (selected.rotation + 90) % 360,
                      })
                    }
                    className="rounded-lg border border-sage-200 px-2 py-1 text-xs text-ink/70 hover:bg-sage-50"
                  >
                    +90°
                  </button>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className={adminLabelClass}>Color</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => update(selected.id, { color: null })}
                    className={cn(
                      "rounded-full border px-2 py-1 text-xs",
                      selected.color === null
                        ? "border-dustyblue-500 bg-dustyblue-50 text-dustyblue-700"
                        : "border-sage-200 text-ink/55"
                    )}
                  >
                    Default
                  </button>
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => update(selected.id, { color: c })}
                      style={{ backgroundColor: c }}
                      className={cn(
                        "h-7 w-7 rounded-full border-2",
                        selected.color === c
                          ? "border-ink/60"
                          : "border-white shadow"
                      )}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="text-sm text-ink/55">
            Pick a tool above, then click the room to place it. Click an item to
            edit its name, guests, size, and color here.
          </Card>
        )}

        {/* Tables quick list */}
        {tableCount > 0 && (
          <Card>
            <h3 className="mb-2 text-sm font-medium text-ink/70">Tables</h3>
            <ul className="max-h-48 space-y-1 overflow-auto">
              {els
                .filter((e) => e.kind === "table")
                .map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(e.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                        selectedId === e.id
                          ? "bg-sage-50 text-sage-700"
                          : "hover:bg-sage-50"
                      )}
                    >
                      <span className="truncate">{e.label || e.table}</span>
                      <span className="ml-2 shrink-0 text-xs text-ink/45">
                        {e.names.length
                          ? `${e.names.length} guest${e.names.length === 1 ? "" : "s"}`
                          : e.table}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </Card>
        )}

        {/* Map actions */}
        <Card className="space-y-2">
          <h3 className="text-sm font-medium text-ink/70">Map</h3>
          <RoomMeta
            name={name}
            roomWidth={roomWidth}
            roomHeight={roomHeight}
            hasImage={!!imageUrl}
            onSave={(meta) =>
              startSave(async () => {
                await updateMapMeta(mapId, meta);
                router.refresh();
              })
            }
            disabled={saving}
          />
          <button
            type="button"
            onClick={() => replaceInputRef.current?.click()}
            disabled={replacing}
            className="block w-full rounded-lg border border-sage-200 px-3 py-2 text-left text-sm text-ink/75 transition-colors hover:bg-sage-50 disabled:opacity-60"
          >
            {replacing
              ? "Uploading…"
              : imageUrl
                ? "Replace background image"
                : "Add background image"}
          </button>
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onReplaceFile}
          />
          <button
            type="button"
            onClick={togglePublish}
            disabled={saving}
            className="block w-full rounded-lg border border-sage-200 px-3 py-2 text-left text-sm text-ink/75 transition-colors hover:bg-sage-50 disabled:opacity-60"
          >
            {isActive ? "Unpublish (hide from guests)" : "Publish to guests"}
          </button>
          <button
            type="button"
            onClick={removeMap}
            disabled={saving}
            className="block w-full rounded-lg border border-blush-200 px-3 py-2 text-left text-sm text-blush-500 transition-colors hover:bg-blush-50 disabled:opacity-60"
          >
            Delete map
          </button>
        </Card>
      </div>
    </div>
  );
}

function RoomMeta({
  name,
  roomWidth,
  roomHeight,
  hasImage,
  onSave,
  disabled,
}: {
  name: string;
  roomWidth: number | null;
  roomHeight: number | null;
  hasImage: boolean;
  onSave: (meta: {
    name: string;
    roomWidth?: number;
    roomHeight?: number;
  }) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(name);
  const [w, setW] = useState(roomWidth ?? 40);
  const [h, setH] = useState(roomHeight ?? 30);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-lg border border-sage-200 px-3 py-2 text-left text-sm text-ink/75 transition-colors hover:bg-sage-50"
      >
        Room name &amp; size
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-sage-200 p-3">
      <label className={adminLabelClass}>Room name</label>
      <input
        value={n}
        onChange={(e) => setN(e.target.value)}
        className={adminInputClass}
      />
      {!hasImage && (
        <div className="mt-2 flex items-end gap-2">
          <div className="flex-1">
            <label className={adminLabelClass}>Width (ft)</label>
            <input
              type="number"
              value={w}
              onChange={(e) => setW(Number(e.target.value))}
              className={adminInputClass}
            />
          </div>
          <div className="flex-1">
            <label className={adminLabelClass}>Length (ft)</label>
            <input
              type="number"
              value={h}
              onChange={(e) => setH(Number(e.target.value))}
              className={adminInputClass}
            />
          </div>
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="px-4 py-1.5 text-xs"
          disabled={disabled}
          onClick={() => {
            onSave(
              hasImage
                ? { name: n }
                : { name: n, roomWidth: w, roomHeight: h }
            );
            setOpen(false);
          }}
        >
          Save
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink/50 hover:text-ink/70"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
