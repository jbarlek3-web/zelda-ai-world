import React from "react";
import { AURASTRIA_ATLAS, atlasAccessibilityLabel } from "@/game/world/aurastriaAtlas";
import { MenuFrame } from "./JourneyMenus";

interface WorldAtlasPanelProps {
  readonly onClose: () => void;
}

export function WorldAtlasPanel({ onClose }: WorldAtlasPanelProps) {
  return (
    <MenuFrame eyebrow="Aurastria atlas" title="Routes of the First Dawn">
      <p className="mt-3 text-sm leading-6 text-[#f0dfb6]/85">The river chart records places as relationships, not territory. The Great River Spine is open; other routes remain glimpsed or sealed until the founding season is secure.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Aurastria regional atlas">
        {AURASTRIA_ATLAS.map((region) => (
          <article key={region.id} aria-label={atlasAccessibilityLabel(region)} className={`rounded-sm border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ${region.accentClass} ${region.unlock === "sealed" ? "opacity-65" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.58rem] uppercase tracking-[0.16em] text-[#f7e9c2]/80">{region.route}</p>
                <h3 className="mt-1 font-serif text-lg text-[#fff4d4]">{region.name}</h3>
              </div>
              <span className="rounded-full border border-[#fff4d4]/45 px-2 py-1 text-[0.55rem] uppercase tracking-[0.12em] text-[#fff4d4]">{region.unlock}</span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#fff4d4]/85">{region.element}</p>
            <p className="mt-2 text-sm leading-5 text-[#fff4d4]/90">{region.description}</p>
          </article>
        ))}
      </div>
      <button type="button" autoFocus className="mt-6 rounded-sm bg-[#d9b867] px-4 py-2.5 font-serif text-lg text-[#08251e] transition active:scale-[0.97] hover:bg-[#efd488] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7e9c2]" onClick={onClose}>Return to journey</button>
    </MenuFrame>
  );
}
