import { PauseMenu, SettingsMenu, TitleMenu } from "@/components/game/JourneyMenus";
import { TouchControls } from "@/components/game/TouchControls";
import type { AurastriaSceneHandle } from "@/game/scene/createAurastriaScene";
import type { SaveStateInput } from "@shared/game/schemas";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { GAME_TITLE } from "@shared/game/constants";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const GameCanvas = lazy(async () => {
  const module = await import("@/components/game/GameCanvas");
  return { default: module.GameCanvas };
});
const GREAT_RIVER_MOBILE_PLATE_URL = "/manus-storage/aurastria-great-river-mobile-plate_e54226c6.png";

const INITIAL_HUD: AurastriaSceneHandle["hud"] = {
  objective: "Seek the Tideglass Beacon",
  progress: "0/3 reeds · 0/2 stones",
  actionHint: "Follow the turquoise beacon to begin the founding task.",
  inventory: { "river-reed": 0, "smooth-stone": 0 },
  navigation: { bearingDegrees: 0, distance: 0 },
  paused: false,
};

export default function Home() {
  const [status, setStatus] = useState("Survey the river basin, then press E near the camp to hear its next need.");
  const [hud, setHud] = useState<AurastriaSceneHandle["hud"]>(INITIAL_HUD);
  const [scene, setScene] = useState<AurastriaSceneHandle | null>(null);
  const [screen, setScreen] = useState<"title" | "play" | "settings">(() => {
    return new URLSearchParams(window.location.search).get("journey") === "play" ? "play" : "title";
  });
  const pendingSaveRef = useRef<SaveStateInput | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [uiScale, setUiScale] = useState(100);
  const [settingsReturnTo, setSettingsReturnTo] = useState<"title" | "play">("title");
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const savesQuery = trpc.saves.list.useQuery(undefined, { enabled: isAuthenticated });
  const loadSave = trpc.saves.load.useQuery(selectedSlot, { enabled: false, retry: false });
  const upsertSave = trpc.saves.upsert.useMutation();
  const removeSave = trpc.saves.remove.useMutation();
  const savedSlots = savesQuery.data ?? [];
  const selectedSave = useMemo(() => savedSlots.find((save) => save.slot === selectedSlot), [savedSlots, selectedSlot]);

  useEffect(() => {
    const stored = window.localStorage.getItem("aurastria-ui-scale");
    if (stored) {
      const parsed = Number(stored);
      if (parsed >= 90 && parsed <= 120) setUiScale(parsed);
    }
  }, []);

  useEffect(() => {
    const updateConnectivity = () => setOnline(navigator.onLine);
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    return () => {
      window.removeEventListener("online", updateConnectivity);
      window.removeEventListener("offline", updateConnectivity);
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
    };
  }, []);

  const updateUiScale = (value: number) => {
    setUiScale(value);
    window.localStorage.setItem("aurastria-ui-scale", String(value));
  };

  const requestInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const beginJourney = async () => {
    if (isAuthenticated && selectedSave) {
      const loaded = await loadSave.refetch();
      if (loaded.data) {
        pendingSaveRef.current = loaded.data.state;
      }
    }
    setScreen("play");
  };

  const returnToTitle = () => {
    scene?.setPaused(true);
    setScene(null);
    setScreen("title");
  };

  const handleGameReady = (handle: AurastriaSceneHandle) => {
    setScene(handle);
    if (pendingSaveRef.current) {
      handle.loadState(pendingSaveRef.current);
      pendingSaveRef.current = null;
    }
    handle.setPaused(false);
  };

  const saveJourney = async () => {
    if (!scene || !isAuthenticated) return;
    await upsertSave.mutateAsync({
      slot: selectedSlot,
      label: selectedSave?.label ?? "Founding Camp",
      state: scene.saveState(),
    });
    await utils.saves.list.invalidate();
    setStatus("The river archive receives your journey record.");
  };

  const deleteSlot = async (slot: number) => {
    if (!window.confirm(`Clear archive slot ${slot}? This cannot be undone.`)) return;
    await removeSave.mutateAsync({ slot });
    await utils.saves.list.invalidate();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06130f] text-[#f7e9c2]" style={{ fontSize: `${uiScale}%`, backgroundImage: `linear-gradient(rgba(3, 18, 14, 0.58), rgba(3, 18, 14, 0.76)), url(${GREAT_RIVER_MOBILE_PLATE_URL})`, backgroundPosition: "center", backgroundSize: "cover" }}>
      {screen === "play" ? (
        <Suspense fallback={<div className="absolute inset-0 grid place-items-center bg-[#06130f]/75 text-sm uppercase tracking-[0.2em] text-[#d9b867]">Preparing river chart…</div>}>
          <GameCanvas className="absolute inset-0 h-full w-full touch-none" onReady={handleGameReady} onHud={setHud} onStatus={setStatus} />
        </Suspense>
      ) : null}
      <div className={`pointer-events-none relative z-10 flex min-h-screen flex-col justify-between px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-12 ${screen === "play" && !hud.paused ? "" : "opacity-55"}`}>
        <header className="flex max-w-xl items-start justify-between gap-3 rounded-sm border border-[#d9b867]/50 bg-[#08251e]/80 px-3 py-2.5 shadow-[0_14px_55px_rgba(0,0,0,0.36)] backdrop-blur-sm sm:block sm:px-5 sm:py-4">
          <div>
            <p className="font-serif text-[0.6rem] uppercase tracking-[0.2em] text-[#d9b867] sm:text-xs sm:tracking-[0.26em]">Great River Spine · Founding Season</p>
            <h1 className="mt-2 hidden font-serif text-3xl font-semibold leading-none sm:block sm:text-4xl">{GAME_TITLE}</h1>
            <p className="mt-1 max-w-lg text-xs leading-5 text-[#f0dfb6]/85 sm:mt-3 sm:text-sm sm:leading-6">{screen === "play" ? hud.objective : status}</p>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#3dd4cc]/60 bg-[#12382d]/80 text-center text-[#bceee5] sm:hidden" aria-label={`Tideglass Beacon ${hud.navigation.distance} steps away, bearing ${hud.navigation.bearingDegrees} degrees`}>
            <span className="text-sm leading-none" style={{ display: "inline-block", transform: `rotate(${hud.navigation.bearingDegrees}deg)` }}>▲</span>
            <span className="text-[0.46rem] uppercase tracking-[0.06em]">{hud.navigation.distance}m</span>
          </div>
        </header>

        <div className="mb-24 flex flex-col-reverse gap-3 sm:mb-0 sm:flex-row sm:items-end sm:justify-between">
          <section aria-live="polite" className="max-w-sm rounded-sm border border-[#d9b867]/40 bg-[#08251e]/85 px-3 py-2 shadow-[0_14px_55px_rgba(0,0,0,0.36)] backdrop-blur-sm sm:px-5 sm:py-4">
            <p className="text-[0.55rem] uppercase tracking-[0.18em] text-[#d9b867] sm:text-[0.65rem] sm:tracking-[0.2em]">Founding Objective</p>
            <p className="mt-1 font-serif text-base leading-tight text-[#f7e9c2] sm:text-lg">{hud.objective}</p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.65rem] uppercase tracking-[0.1em] text-[#d9b867] sm:block sm:text-xs sm:tracking-[0.15em]">
              <span>{hud.progress}</span>
              <span>Satchel · {hud.inventory["river-reed"]} reeds · {hud.inventory["smooth-stone"]} stones</span>
            </div>
            <p className="mt-1 line-clamp-1 text-[0.68rem] leading-4 text-[#c8d7b6] sm:mt-3 sm:line-clamp-2 sm:text-xs sm:leading-5">{hud.actionHint}</p>
          </section>

          <section className="ml-auto hidden max-w-sm rounded-sm border border-[#d9b867]/40 bg-[#08251e]/85 px-5 py-4 text-right shadow-[0_14px_55px_rgba(0,0,0,0.36)] backdrop-blur-sm sm:block">
            <p className="font-serif text-lg text-[#f7e9c2]">Founding Camp</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d9b867]">WASD / arrows or left stick · E / A interact · F / X gather · Esc / Start pause</p>
          </section>
        </div>
      </div>
      {screen === "title" ? <TitleMenu signedIn={isAuthenticated} online={online} canInstall={installPrompt !== null} slots={savedSlots} selectedSlot={selectedSlot} busy={authLoading || loadSave.isFetching} onSelectSlot={setSelectedSlot} onBegin={() => void beginJourney()} onSignIn={startLogin} onInstall={() => void requestInstall()} onSettings={() => { setSettingsReturnTo("title"); setScreen("settings"); }} onDeleteSlot={(slot) => void deleteSlot(slot)} /> : null}
      {screen === "play" && hud.paused ? <PauseMenu signedIn={isAuthenticated} online={online} saving={upsertSave.isPending} onResume={() => scene?.setPaused(false)} onSave={() => void saveJourney()} onSettings={() => { setSettingsReturnTo("play"); setScreen("settings"); }} onTitle={returnToTitle} /> : null}
      {screen === "settings" ? <SettingsMenu uiScale={uiScale} onUiScaleChange={updateUiScale} onClose={() => setScreen(settingsReturnTo)} /> : null}
      {screen === "play" && !hud.paused ? <TouchControls onMove={(direction) => scene?.setTouchMove(direction)} onAction={(action) => scene?.triggerAction(action)} /> : null}
    </main>
  );
}
