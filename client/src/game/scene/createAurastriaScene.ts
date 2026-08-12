import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { EventBus } from "@/game/core/eventBus";
import { generateGreatRiverSpine, type RiverSpineTileKind } from "@/game/world/greatRiverSpine";

const TILE_WORLD_SIZE = 1.55;
const MAP_WIDTH = 32;
const MAP_HEIGHT = 24;
const PLAYER_SPEED = 7;

type MovementKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "KeyW" | "KeyA" | "KeyS" | "KeyD";

export interface AurastriaSceneHandle {
  readonly scene: Scene;
  getPlayerPosition(): Readonly<{ x: number; y: number; z: number }>;
  onStatus(listener: (status: string) => void): () => void;
  dispose(): void;
}

function createMaterial(scene: Scene, name: string, color: string, emissive?: string): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.emissiveColor = Color3.FromHexString(emissive ?? "#000000");
  material.specularColor = Color3.Black();
  return material;
}

function createTerrainMaterials(scene: Scene): Readonly<Record<RiverSpineTileKind, StandardMaterial>> {
  return {
    grass: createMaterial(scene, "terrain-grass", "#3F6B45"),
    fertile: createMaterial(scene, "terrain-fertile", "#6A7F3F"),
    river: createMaterial(scene, "terrain-river", "#2D7787", "#0C3340"),
    shallows: createMaterial(scene, "terrain-shallows", "#4E9AA0", "#174A51"),
    sandbar: createMaterial(scene, "terrain-sandbar", "#C4A66B"),
    trail: createMaterial(scene, "terrain-trail", "#957448"),
    grove: createMaterial(scene, "terrain-grove", "#234636"),
  };
}

function toWorldPosition(x: number, y: number): Vector3 {
  return new Vector3((x - MAP_WIDTH / 2) * TILE_WORLD_SIZE, 0, (y - MAP_HEIGHT / 2) * TILE_WORLD_SIZE);
}

function buildFoundingCamp(scene: Scene): void {
  const timber = createMaterial(scene, "camp-timber", "#6B4328");
  const roof = createMaterial(scene, "camp-roof", "#967040");
  const hearth = createMaterial(scene, "camp-hearth", "#D9A549", "#4B2807");
  const campOrigin = toWorldPosition(7, 12);

  [
    { x: 0, z: 0, scale: 1 },
    { x: 2.4, z: -0.7, scale: 0.82 },
    { x: -2.1, z: -1.1, scale: 0.72 },
  ].forEach(({ x, z, scale }, index) => {
    const body = MeshBuilder.CreateBox(`camp-home-${index}`, { width: 1.8 * scale, height: 0.72 * scale, depth: 1.25 * scale }, scene);
    body.position = campOrigin.add(new Vector3(x, 0.45 * scale, z));
    body.material = timber;

    const roofMesh = MeshBuilder.CreateCylinder(`camp-roof-${index}`, { height: 1.05 * scale, diameterTop: 0, diameterBottom: 2.15 * scale, tessellation: 4 }, scene);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position = campOrigin.add(new Vector3(x, 1.26 * scale, z));
    roofMesh.material = roof;
  });

  const fire = MeshBuilder.CreateSphere("camp-hearth", { diameter: 0.52, segments: 8 }, scene);
  fire.position = campOrigin.add(new Vector3(0.25, 0.37, 1.95));
  fire.material = hearth;
}

function buildRiverSpineTerrain(scene: Scene): void {
  const map = generateGreatRiverSpine({ width: MAP_WIDTH, height: MAP_HEIGHT });
  const terrainMaterials = createTerrainMaterials(scene);

  map.tiles.forEach((tile) => {
    const mesh = MeshBuilder.CreateBox(`tile-${tile.position.x}-${tile.position.y}`, { width: TILE_WORLD_SIZE, depth: TILE_WORLD_SIZE, height: 0.18 }, scene);
    const worldPosition = toWorldPosition(tile.position.x, tile.position.y);
    mesh.position = new Vector3(worldPosition.x, tile.kind === "river" ? -0.12 : 0, worldPosition.z);
    mesh.material = terrainMaterials[tile.kind];
  });

  buildFoundingCamp(scene);
}

function movementVector(pressed: ReadonlySet<MovementKey>): Vector3 {
  const horizontal = (pressed.has("KeyD") || pressed.has("ArrowRight") ? 1 : 0) - (pressed.has("KeyA") || pressed.has("ArrowLeft") ? 1 : 0);
  const vertical = (pressed.has("KeyS") || pressed.has("ArrowDown") ? 1 : 0) - (pressed.has("KeyW") || pressed.has("ArrowUp") ? 1 : 0);
  const direction = new Vector3(horizontal, 0, vertical);
  return direction.lengthSquared() > 0 ? direction.normalize() : direction;
}

export function createAurastriaScene(engine: Engine, canvas: HTMLCanvasElement): AurastriaSceneHandle {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.018, 0.065, 0.05, 1);
  const events = new EventBus<{ readonly status: string }>();

  const player = MeshBuilder.CreateCylinder("wanderer", { height: 1.35, diameterTop: 0.42, diameterBottom: 0.64, tessellation: 6 }, scene);
  player.position = toWorldPosition(10, 14);
  player.position.y = 0.72;
  player.material = createMaterial(scene, "wanderer-material", "#D8A940", "#3D2707");

  const camera = new ArcRotateCamera("river-spine-camera", -Math.PI / 2, 1.08, 27, player.position.clone(), scene);
  camera.lowerRadiusLimit = 15;
  camera.upperRadiusLimit = 34;
  camera.lowerBetaLimit = 0.65;
  camera.upperBetaLimit = 1.34;
  camera.wheelPrecision = 45;
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("river-dawn-light", new Vector3(0.2, 1, -0.25), scene);
  light.intensity = 1.25;
  light.diffuse = Color3.FromHexString("#F3D9A2");
  light.groundColor = Color3.FromHexString("#173B32");

  buildRiverSpineTerrain(scene);
  const pressed = new Set<MovementKey>();
  const movementKeys = new Set<MovementKey>(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code === "KeyE") {
      event.preventDefault();
      const camp = toWorldPosition(7, 12);
      const distanceToCamp = Vector3.Distance(player.position, camp);
      events.emit(
        "status",
        distanceToCamp <= 6
          ? "The river camp welcomes your return. Press on: a granary would protect the next harvest."
          : "The river camp is beyond the reed beds. Follow the teal water south-west to return.",
      );
      return;
    }
    if (movementKeys.has(event.code as MovementKey)) {
      event.preventDefault();
      pressed.add(event.code as MovementKey);
    }
  };
  const onKeyUp = (event: KeyboardEvent) => pressed.delete(event.code as MovementKey);
  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);

  const beforeRender = scene.onBeforeRenderObservable.add(() => {
    const direction = movementVector(pressed);
    if (direction.lengthSquared() === 0) {
      return;
    }

    const distance = PLAYER_SPEED * engine.getDeltaTime() / 1000;
    const nextX = Math.max(-MAP_WIDTH * TILE_WORLD_SIZE / 2 + 0.6, Math.min(MAP_WIDTH * TILE_WORLD_SIZE / 2 - 0.6, player.position.x + direction.x * distance));
    const nextZ = Math.max(-MAP_HEIGHT * TILE_WORLD_SIZE / 2 + 0.6, Math.min(MAP_HEIGHT * TILE_WORLD_SIZE / 2 - 0.6, player.position.z + direction.z * distance));
    player.position.x = nextX;
    player.position.z = nextZ;
    player.rotation.y = Math.atan2(direction.x, direction.z);
    camera.target.copyFrom(player.position);
  });

  return {
    scene,
    getPlayerPosition: () => ({ x: player.position.x, y: player.position.y, z: player.position.z }),
    onStatus: (listener) => events.on("status", listener),
    dispose: () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      scene.onBeforeRenderObservable.remove(beforeRender);
      camera.detachControl();
      events.clear();
      scene.dispose();
    },
  };
}
