"use client";

import type { FocusRegion, Marker } from "@arco/project-schema";
import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

type FocusRegionOverlayProps = {
  marker: Marker | null;
  enabled: boolean;
  onChange: (focus: FocusRegion) => void;
};

export function FocusRegionOverlay({
  marker,
  enabled,
  onChange,
}: FocusRegionOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    startFocus: FocusRegion;
  } | null>(null);

  const focus = marker?.focus ?? {
    x: 0.5,
    y: 0.5,
    width: 0.4,
    height: 0.35,
  };

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current;
      const container = containerRef.current;
      if (!drag || !container || !marker) return;

      const rect = container.getBoundingClientRect();
      const dx = (clientX - drag.startX) / rect.width;
      const dy = (clientY - drag.startY) / rect.height;
      const start = drag.startFocus;

      if (drag.mode === "move") {
        onChange({
          ...start,
          x: clamp(start.x + dx, start.width / 2, 1 - start.width / 2),
          y: clamp(start.y + dy, start.height / 2, 1 - start.height / 2),
        });
        return;
      }

      onChange({
        ...start,
        width: clamp(start.width + dx * 2, 0.1, 0.95),
        height: clamp(start.height + dy * 2, 0.1, 0.95),
      });
    },
    [marker, onChange],
  );

  if (!enabled || !marker) return null;

  const left = `${(focus.x - focus.width / 2) * 100}%`;
  const top = `${(focus.y - focus.height / 2) * 100}%`;
  const width = `${focus.width * 100}%`;
  const height = `${focus.height * 100}%`;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      onPointerMove={(event) => {
        if (!dragRef.current) return;
        updateFromPointer(event.clientX, event.clientY);
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onPointerLeave={() => {
        dragRef.current = null;
      }}
    >
      <div
        className={cn(
          "pointer-events-auto absolute rounded-lg border-2 border-[#55b3ff] bg-[#55b3ff]/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]",
        )}
        style={{ left, top, width, height }}
        onPointerDown={(event) => {
          event.preventDefault();
          dragRef.current = {
            mode: event.target === event.currentTarget ? "move" : "resize",
            startX: event.clientX,
            startY: event.clientY,
            startFocus: focus,
          };
        }}
      >
        <div
          className="absolute right-0 bottom-0 size-4 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-sm border border-[#55b3ff] bg-background"
          onPointerDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
            dragRef.current = {
              mode: "resize",
              startX: event.clientX,
              startY: event.clientY,
              startFocus: focus,
            };
          }}
        />
        <span className="absolute -top-6 left-0 text-[10px] font-medium text-[#55b3ff]">
          Focus area
        </span>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
