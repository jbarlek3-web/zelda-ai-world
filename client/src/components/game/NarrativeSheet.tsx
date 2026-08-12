import React from "react";

interface NarrativeSheetProps {
  readonly open: boolean;
  readonly pending: boolean;
  readonly text: string;
  readonly onClose: () => void;
}

export function NarrativeSheet({ open, pending, text, onClose }: NarrativeSheetProps) {
  if (!open) return null;
  return (
    <section role="dialog" aria-modal="true" aria-labelledby="river-guide-title" className="pointer-events-auto fixed inset-x-3 bottom-[8.5rem] z-30 rounded-sm border border-[#69ddd4]/55 bg-[#08251e]/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-[0.6rem] uppercase tracking-[0.18em] text-[#69ddd4]">Guide of the Tideglass</p><h2 id="river-guide-title" className="mt-1 font-serif text-xl text-[#f7e9c2]">A river answer</h2></div>
        <button type="button" aria-label="Close river guide" onClick={onClose} className="rounded-full border border-[#d9b867]/35 px-2 py-1 text-xs text-[#f0dfb6]">Close</button>
      </div>
      <p aria-live="polite" className="mt-3 text-sm leading-6 text-[#d8e4ca]">{pending ? "Reading the river’s surface…" : text}</p>
    </section>
  );
}
