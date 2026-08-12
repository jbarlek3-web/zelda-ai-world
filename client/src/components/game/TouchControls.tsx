import { useRef } from "react";

type TouchAction = "interact" | "gather" | "strike" | "pause";

interface TouchControlsProps {
  readonly onMove: (direction: Readonly<{ x: number; y: number }> | null) => void;
  readonly onAction: (action: TouchAction) => void;
  readonly strikeReady: boolean;
}

function clampDirection(x: number, y: number): Readonly<{ x: number; y: number }> {
  const length = Math.hypot(x, y);
  if (length <= 0.08) return { x: 0, y: 0 };
  return length > 1 ? { x: x / length, y: y / length } : { x, y };
}

export function TouchControls({ onMove, onAction, strikeReady }: TouchControlsProps) {
  const padRef = useRef<HTMLButtonElement | null>(null);

  const updateDirection = (clientX: number, clientY: number) => {
    const bounds = padRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;
    onMove(clampDirection((clientX - (bounds.left + halfWidth)) / halfWidth, (clientY - (bounds.top + halfHeight)) / halfHeight));
  };

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:hidden">
      <button
        ref={padRef}
        type="button"
        aria-label="Move explorer"
        className="grid h-28 w-28 touch-none place-items-center rounded-full border border-[#d9b867]/45 bg-[#061d17]/75 shadow-[0_10px_35px_rgba(0,0,0,0.38)] backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]"
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); updateDirection(event.clientX, event.clientY); }}
        onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateDirection(event.clientX, event.clientY); }}
        onPointerUp={(event) => { event.currentTarget.releasePointerCapture(event.pointerId); onMove(null); }}
        onPointerCancel={() => onMove(null)}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full border border-[#d9b867]/55 bg-[#12382d]/80 text-xs uppercase tracking-[0.12em] text-[#f0dfb6]">Move</span>
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" aria-label="Interact with nearby landmark" className="min-h-12 min-w-12 rounded-full border border-[#d9b867]/65 bg-[#173f34]/90 px-4 text-xs uppercase tracking-[0.12em] text-[#f7e9c2] shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onPointerDown={() => onAction("interact")}>Use</button>
        <button type="button" aria-label="Gather nearby resource" className="min-h-12 min-w-12 rounded-full border border-[#d9b867]/65 bg-[#174a42]/90 px-4 text-xs uppercase tracking-[0.12em] text-[#f7e9c2] shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onPointerDown={() => onAction("gather")}>Gather</button>
        <button type="button" aria-label="Strike nearby river wisp" disabled={!strikeReady} className="min-h-12 min-w-12 rounded-full border border-[#65ddd4]/65 bg-[#164b4b]/90 px-4 text-xs uppercase tracking-[0.12em] text-[#e2fffa] shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:scale-[0.97] disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onPointerDown={() => onAction("strike")}>{strikeReady ? "Strike" : "Wait"}</button>
        <button type="button" aria-label="Pause journey" className="col-span-3 min-h-10 rounded-full border border-[#d9b867]/35 bg-[#061d17]/80 px-4 text-[0.65rem] uppercase tracking-[0.16em] text-[#d9b867] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onPointerDown={() => onAction("pause")}>Pause</button>
      </div>
    </div>
  );
}
