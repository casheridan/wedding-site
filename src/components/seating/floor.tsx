"use client";

import { cn } from "@/lib/utils";

export type ElementKind = "table" | "area" | "door" | "text" | "misc";
export type ElementShape = "circle" | "rect";

export type FloorElement = {
  id: string;
  kind: ElementKind;
  shape: ElementShape;
  label: string;
  party?: string | null;
  table?: string | null;
  names?: string[];
  seats?: number | null;
  color?: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
};

/** Palette + display defaults per element kind. */
export const KIND_META: Record<
  ElementKind,
  { label: string; shape: ElementShape; w: number; h: number }
> = {
  table: { label: "Table", shape: "circle", w: 0.1, h: 0.1 },
  area: { label: "Area", shape: "rect", w: 0.28, h: 0.2 },
  door: { label: "Door", shape: "rect", w: 0.09, h: 0.025 },
  text: { label: "Text", shape: "rect", w: 0.22, h: 0.05 },
  misc: { label: "Item", shape: "rect", w: 0.12, h: 0.08 },
};

export const KIND_ORDER: ElementKind[] = [
  "table",
  "area",
  "door",
  "text",
  "misc",
];

/** Draw order — areas sit behind everything, text on top. */
export function elementZ(kind: ElementKind): number {
  const order: Record<ElementKind, number> = {
    area: 1,
    door: 2,
    misc: 3,
    table: 4,
    text: 5,
  };
  return order[kind] ?? 3;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/** Compact label for a table badge, e.g. "Table 12" → "12". */
export function shortTable(el: Pick<FloorElement, "table" | "label">): string {
  const src = el.table || el.label;
  const m = src.match(/\d+/);
  if (m) return m[0];
  return src.slice(0, 2).toUpperCase();
}

/** Pick readable text color for a custom background hex. */
function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#33372e" : "#ffffff";
}

type ElementState = {
  selected?: boolean;
  dimmed?: boolean;
  matched?: boolean;
};

/** A single positioned, sized, rotated floor element. */
export function ElementBox({
  el,
  state,
  showCaption,
  onPointerDown,
  onClick,
  draggable,
  children,
}: {
  el: FloorElement;
  state?: ElementState;
  showCaption?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  children?: React.ReactNode;
}) {
  const { selected, dimmed, matched } = state ?? {};
  const isText = el.kind === "text";

  const wrapStyle: React.CSSProperties = {
    left: `${el.x * 100}%`,
    top: `${el.y * 100}%`,
    width: `${el.w * 100}%`,
    transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
    zIndex: elementZ(el.kind) + (selected ? 10 : 0),
  };
  if (!isText) wrapStyle.aspectRatio = `${el.w} / ${el.h}`;

  // Font size scales with the stage via container query units (cqw).
  const tableFont = `${clamp(el.w * 38, 2, 8)}cqw`;
  const areaFont = `${clamp(el.w * 11, 1.3, 3.2)}cqw`;
  const textFont = `${clamp(el.h * 90, 1.6, 12)}cqw`;

  return (
    <div
      style={wrapStyle}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={cn(
        "absolute select-none",
        draggable && "cursor-grab touch-none active:cursor-grabbing",
        onClick && !draggable && "cursor-pointer",
        dimmed && "opacity-25"
      )}
      title={el.label}
    >
      {el.kind === "table" && (
        <Visual
          el={el}
          rounded="full"
          className={cn(
            selected
              ? "bg-dustyblue-600 text-white ring-4 ring-dustyblue-200"
              : matched
                ? "bg-dustyblue-500 text-white"
                : "bg-white text-dustyblue-700"
          )}
          borderClass={
            selected || matched ? "border-white" : "border-dustyblue-300"
          }
          style={el.color ? customStyle(el.color) : undefined}
        >
          <span style={{ fontSize: tableFont }} className="font-semibold">
            {shortTable(el)}
          </span>
        </Visual>
      )}

      {el.kind === "area" && (
        <Visual
          el={el}
          rounded="xl"
          className={cn(
            "bg-lavender-100/80 text-lavender-700",
            selected && "ring-4 ring-lavender-200"
          )}
          borderClass="border-lavender-200 border-dashed"
          style={el.color ? customStyle(el.color) : undefined}
        >
          <span
            style={{ fontSize: areaFont, letterSpacing: "0.12em" }}
            className="px-1 text-center font-medium uppercase leading-tight"
          >
            {el.label}
          </span>
        </Visual>
      )}

      {el.kind === "door" && (
        <Visual
          el={el}
          rounded="sm"
          className={cn(
            "bg-sage-200 text-sage-700",
            selected && "ring-4 ring-sage-200"
          )}
          borderClass="border-sage-400"
          style={el.color ? customStyle(el.color) : undefined}
        >
          <span style={{ fontSize: areaFont }} className="px-0.5 truncate">
            {el.label}
          </span>
        </Visual>
      )}

      {el.kind === "misc" && (
        <Visual
          el={el}
          rounded="lg"
          className={cn(
            "bg-peach-100 text-ink/75",
            selected && "ring-4 ring-peach-200"
          )}
          borderClass="border-peach-300"
          style={el.color ? customStyle(el.color) : undefined}
        >
          <span
            style={{ fontSize: areaFont }}
            className="px-1 text-center leading-tight"
          >
            {el.label}
          </span>
        </Visual>
      )}

      {el.kind === "text" && (
        <span
          style={{ fontSize: textFont }}
          className={cn(
            "block w-full text-center font-display leading-tight text-ink",
            selected && "rounded-md ring-4 ring-lavender-200"
          )}
        >
          {el.label}
        </span>
      )}

      {/* Full caption under a selected table */}
      {showCaption && el.kind === "table" && selected && el.label && (
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink/90 px-2.5 py-1 text-xs text-white shadow-lg">
          {el.label}
          {el.table ? ` · ${el.table}` : ""}
        </span>
      )}

      {children}
    </div>
  );
}

function customStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: color,
    color: readableOn(color),
    borderColor: color,
  };
}

function Visual({
  el,
  rounded,
  className,
  borderClass,
  style,
  children,
}: {
  el: FloorElement;
  rounded: "full" | "xl" | "lg" | "sm";
  className?: string;
  borderClass?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const radius =
    el.shape === "circle"
      ? "rounded-full"
      : rounded === "xl"
        ? "rounded-xl"
        : rounded === "lg"
          ? "rounded-lg"
          : rounded === "sm"
            ? "rounded-sm"
            : "rounded-md";
  return (
    <div
      style={style}
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden border-2 shadow-sm",
        radius,
        borderClass,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * The room canvas: an image background, or a blank room sized by its
 * dimensions with a subtle grid and a scale label. Children (elements) are
 * positioned absolutely within it.
 */
export function RoomCanvas({
  imageUrl,
  imgWidth,
  imgHeight,
  roomWidth,
  roomHeight,
  unit = "ft",
  stageRef,
  className,
  style,
  onPointerDown,
  onClick,
  children,
}: {
  imageUrl?: string | null;
  imgWidth?: number | null;
  imgHeight?: number | null;
  roomWidth?: number | null;
  roomHeight?: number | null;
  unit?: string;
  stageRef?: React.Ref<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: (e: React.PointerEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}) {
  const blank = !imageUrl;
  const aspect =
    roomWidth && roomHeight
      ? `${roomWidth} / ${roomHeight}`
      : imgWidth && imgHeight
        ? `${imgWidth} / ${imgHeight}`
        : "4 / 3";

  return (
    <div
      ref={stageRef}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={cn("relative w-full", className)}
      style={{
        containerType: "inline-size",
        aspectRatio: blank ? aspect : undefined,
        ...style,
      }}
    >
      {blank ? (
        <>
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl border-2 border-sage-300 bg-cream/40"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(112,134,89,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(112,134,89,0.10) 1px, transparent 1px)",
              backgroundSize: "5% 5%",
            }}
          />
          {roomWidth && roomHeight && (
            <>
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-widest text-ink/40">
                {roomWidth} {unit}
              </span>
              <span className="pointer-events-none absolute top-1/2 -left-3 -translate-x-full -translate-y-1/2 -rotate-90 text-[11px] uppercase tracking-widest text-ink/40">
                {roomHeight} {unit}
              </span>
            </>
          )}
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Seating map"
          className="block w-full select-none"
          draggable={false}
        />
      )}
      {children}
    </div>
  );
}
