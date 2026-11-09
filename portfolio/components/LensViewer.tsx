"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

import type { LensScene } from "@/lib/lensScene";

const DRAG_TO_TURN = 44;
const DRAG_PER_MARK = 130;
const MAX_DRAG_PREVIEW = 0.4;
const WHEEL_TO_TURN = 60;
const WHEEL_COOLDOWN_MS = 380;

type LensViewerProps = {
  mark: number;
  accent: string;
  onTurn: (direction: number) => void;
};

export default function LensViewer({ mark, accent, onTurn }: LensViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LensScene | null>(null);
  const dragStartRef = useRef<number | null>(null);
  const previousMarkRef = useRef(mark);
  const onTurnRef = useRef(onTurn);
  const latestRef = useRef({ mark, accent });
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    onTurnRef.current = onTurn;
    latestRef.current = { mark, accent };
  });

  // Three.js is large, so it only loads in the browser once the lens is on screen.
  useEffect(() => {
    let cancelled = false;
    let scene: LensScene | null = null;

    import("@/lib/lensScene")
      .then(({ createLensScene }) => {
        if (cancelled || !hostRef.current) return;
        scene = createLensScene(hostRef.current, latestRef.current.accent);
        scene.setRing(latestRef.current.mark);
        sceneRef.current = scene;
        return scene.ready.then((loaded) => {
          if (cancelled) return;
          if (loaded) setIsReady(true);
          else setHasFailed(true);
        });
      })
      .catch((error: unknown) => {
        console.error("Could not start the 3D lens", error);
        if (!cancelled) setHasFailed(true);
      });

    return () => {
      cancelled = true;
      sceneRef.current = null;
      scene?.dispose();
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setRing(mark);
    if (previousMarkRef.current !== mark) {
      sceneRef.current?.engage(accent, mark > previousMarkRef.current ? 1 : -1);
      previousMarkRef.current = mark;
    }
  }, [mark, accent]);

  // React registers wheel listeners as passive, which would not allow preventDefault.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    let accumulated = 0;
    let lockedUntil = 0;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.timeStamp < lockedUntil) return;
      accumulated += event.deltaY;
      if (Math.abs(accumulated) < WHEEL_TO_TURN) return;
      onTurnRef.current(accumulated > 0 ? 1 : -1);
      accumulated = 0;
      lockedUntil = event.timeStamp + WHEEL_COOLDOWN_MS;
    };

    viewer.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewer.removeEventListener("wheel", handleWheel);
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = event.clientX;
    setIsDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current === null) return;
    const preview = (event.clientX - dragStartRef.current) / DRAG_PER_MARK;
    const limited = Math.max(-MAX_DRAG_PREVIEW, Math.min(MAX_DRAG_PREVIEW, preview));
    sceneRef.current?.setRing(mark + limited);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current === null) return;
    const distance = event.clientX - dragStartRef.current;
    dragStartRef.current = null;
    setIsDragging(false);
    sceneRef.current?.setRing(mark);
    if (Math.abs(distance) >= DRAG_TO_TURN) onTurn(distance > 0 ? 1 : -1);
  }

  if (hasFailed) return null;

  // The film strip buttons are the accessible way to change lenses, so this is hidden from screen readers.
  return (
    <div
      ref={viewerRef}
      className={`lens-viewer${isDragging ? " is-dragging" : ""}`}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div ref={hostRef} className={`lens-canvas${isReady ? " is-ready" : ""}`} />
      <p className="lens-hint">Drag or scroll the lens</p>
    </div>
  );
}
