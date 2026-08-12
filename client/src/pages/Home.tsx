import { useAuth } from "@/_core/hooks/useAuth";
import { GameCanvas } from "@/components/game/GameCanvas";
import type { AurastriaSceneHandle } from "@/game/scene/createAurastriaScene";
import { GAME_TITLE } from "@shared/game/constants";
import { useState } from "react";

const INITIAL_HUD: AurastriaSceneHandle["hud"] = {
  objective: "Seek the Tideglass Beacon",
  progress: "0/3 reeds · 0/2 stones",
  actionHint: "Follow the turquoise beacon to begin the founding task.",
  inventory: { "river-reed": 0, "smooth-stone": 0 },
  paused: false,
};

export default function Home() {
  const [status, setStatus] = useState("Survey the river basin, then press E near the camp to hear its next need.");
  const [hud, setHud] = useState<AurastriaSceneHandle["hud"]>(INITIAL_HUD);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06130f] text-[#f7e9c2]">
      <GameCanvas className="absolute inset-0 h-full w-full touch-none" onHud={setHud} onStatus={setStatus} />
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-between px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
        <header className="max-w-xl rounded-sm border border-[#d9b867]/50 bg-[#08251e]/80 px-5 py-4 shadow-[0_14px_55px_rgba(0,0,0,0.36)] backdrop-blur-sm">
          <p className="font-serif text-xs uppercase tracking-[0.26em] text-[#d9b867]">Great River Spine · Founding Season</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-none sm:text-4xl">{GAME_TITLE}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#f0dfb6]/85">
            {status}
          </p>
        </header>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-end sm:justify-between">
          <section aria-live="polite" className="max-w-sm rounded-sm border border-[#d9b867]/40 bg-[#08251e]/85 px-5 py-4 shadow-[0_14px_55px_rgba(0,0,0,0.36)] backdrop-blur-sm">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#d9b867]">Founding Objective</p>
            <p className="mt-1 font-serif text-lg leading-tight text-[#f7e9c2]">{hud.objective}</p>
            <p className="mt-1 text-sm text-[#f0dfb6]/85">{hud.progress}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#d9b867]">Satchel · {hud.inventory["river-reed"]} reeds · {hud.inventory["smooth-stone"]} stones</p>
            <p className="mt-3 text-xs leading-5 text-[#c8d7b6]">{hud.actionHint}</p>
          </section>

          <section className="ml-auto max-w-sm rounded-sm border border-[#d9b867]/40 bg-[#08251e]/85 px-5 py-4 text-right shadow-[0_14px_55px_rgba(0,0,0,0.36)] backdrop-blur-sm">
            <p className="font-serif text-lg text-[#f7e9c2]">Founding Camp</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d9b867]">WASD / arrows or left stick · E / A interact · F / X gather · Esc / Start pause</p>
          </section>
        </div>
      </div>
      {hud.paused ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#03110d]/65 p-6 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Journey paused">
          <div className="max-w-sm rounded-sm border border-[#d9b867]/65 bg-[#08251e]/95 px-7 py-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.5)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d9b867]">Journey Paused</p>
            <p className="mt-3 font-serif text-2xl text-[#f7e9c2]">The river keeps its counsel.</p>
            <p className="mt-3 text-sm leading-6 text-[#f0dfb6]/85">Press Esc, P, or Start to return to the journey.</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
