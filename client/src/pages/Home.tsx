import { useAuth } from "@/_core/hooks/useAuth";
import { GameCanvas } from "@/components/game/GameCanvas";
import { GAME_TITLE } from "@shared/game/constants";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06130f] text-[#f7e9c2]">
      <GameCanvas className="absolute inset-0 h-full w-full touch-none" />
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-between p-5 sm:p-8 lg:p-12">
        <header className="max-w-xl rounded-sm border border-[#d9b867]/50 bg-[#08251e]/80 px-5 py-4 shadow-[0_14px_55px_rgba(0,0,0,0.36)] backdrop-blur-sm">
          <p className="font-serif text-xs uppercase tracking-[0.26em] text-[#d9b867]">Great River Spine · Founding Season</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-none sm:text-4xl">{GAME_TITLE}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#f0dfb6]/85">
            The simulation foundation is live. Explore the river basin while the first settlement systems are being built.
          </p>
        </header>

        <section className="ml-auto max-w-sm rounded-sm border border-[#d9b867]/40 bg-[#08251e]/80 px-5 py-4 text-right shadow-[0_14px_55px_rgba(0,0,0,0.36)] backdrop-blur-sm">
          <p className="font-serif text-lg text-[#f7e9c2]">Founding Camp</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d9b867]">Mouse drag to survey · Scroll to set perspective</p>
        </section>
      </div>
    </main>
  );
}
