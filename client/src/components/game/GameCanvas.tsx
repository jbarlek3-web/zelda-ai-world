import { Engine } from "@babylonjs/core/Engines/engine";
import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { createAurastriaScene, type AurastriaSceneHandle } from "@/game/scene/createAurastriaScene";

interface GameCanvasProps extends ComponentPropsWithoutRef<"canvas"> {
  readonly onReady?: (handle: AurastriaSceneHandle) => void;
  readonly onStatus?: (status: string) => void;
  readonly onHud?: (hud: AurastriaSceneHandle["hud"]) => void;
}

export function GameCanvas({ className, onReady, onStatus, onHud, ...canvasProps }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const initializedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onStatusRef = useRef(onStatus);
  const onHudRef = useRef(onHud);
  onReadyRef.current = onReady;
  onStatusRef.current = onStatus;
  onHudRef.current = onHud;

  useEffect(() => {
    if (initializedRef.current || !canvasRef.current) {
      return;
    }

    initializedRef.current = true;
    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true });
    const gameScene = createAurastriaScene(engine, canvas);
    const resize = () => engine.resize();
    const unsubscribeStatus = gameScene.onStatus((status) => onStatusRef.current?.(status));
    const unsubscribeHud = gameScene.onHud((hud) => onHudRef.current?.(hud));

    engine.runRenderLoop(() => gameScene.scene.render());
    window.addEventListener("resize", resize);
    onReadyRef.current?.(gameScene);
    onHudRef.current?.(gameScene.hud);

    return () => {
      window.removeEventListener("resize", resize);
      unsubscribeStatus();
      unsubscribeHud();
      engine.stopRenderLoop();
      gameScene.dispose();
      engine.dispose();
      initializedRef.current = false;
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-label="Aurastria Great River Spine game view" {...canvasProps} />;
}
