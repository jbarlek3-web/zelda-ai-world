import { Engine } from "@babylonjs/core/Engines/engine";
import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { createAurastriaScene, type AurastriaSceneHandle } from "@/game/scene/createAurastriaScene";

interface GameCanvasProps extends ComponentPropsWithoutRef<"canvas"> {
  readonly onReady?: (handle: AurastriaSceneHandle) => void;
}

export function GameCanvas({ className, onReady, ...canvasProps }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !canvasRef.current) {
      return;
    }

    initializedRef.current = true;
    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true });
    const gameScene = createAurastriaScene(engine, canvas);
    const resize = () => engine.resize();

    engine.runRenderLoop(() => gameScene.scene.render());
    window.addEventListener("resize", resize);
    onReady?.(gameScene);

    return () => {
      window.removeEventListener("resize", resize);
      engine.stopRenderLoop();
      gameScene.dispose();
      engine.dispose();
      initializedRef.current = false;
    };
  }, [onReady]);

  return <canvas ref={canvasRef} className={className} aria-label="Aurastria Great River Spine game view" {...canvasProps} />;
}
