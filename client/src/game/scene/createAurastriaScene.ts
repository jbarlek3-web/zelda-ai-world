import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import "@babylonjs/core/Meshes/instancedMesh";
import "@babylonjs/core/Shaders/ShadersInclude/instancesDeclaration";
import "@babylonjs/core/Shaders/ShadersInclude/instancesVertex";
import "@babylonjs/core/Shaders/default.fragment";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { EventBus } from "@/game/core/eventBus";
import { generateGreatRiverSpine, type RiverSpineTileKind } from "@/game/world/greatRiverSpine";
import { hashCoordinates } from "@/game/world/prng";
import { deriveRiverArtDirection } from "@/game/render/riverArtDirection";
import { combinedMoveDirection, isGamepadActionPressed, isKeyboardAction } from "@/game/input/inputActions";
import {
  attuneTideglass,
  collectFoundingMaterial,
  createFoundingQuest,
  deliverFoundingMaterials,
  foundingObjective,
  foundingProgress,
  type FoundingInventory,
  type GatherableKind,
} from "@/game/features/survival/foundingQuest";

const TILE_WORLD_SIZE = 1.55;
const MAP_WIDTH = 32;
const MAP_HEIGHT = 24;
const PLAYER_SPEED = 7;

interface RiverTerrainRuntime {
  readonly waterMaterials: readonly { readonly material: StandardMaterial; readonly baseEmissive: Color3; readonly phase: number }[];
  readonly beacon: Mesh;
  readonly beaconPosition: Vector3;
  readonly motes: readonly { readonly mesh: Mesh; readonly basePosition: Vector3; readonly phase: number }[];
}

interface GatherNode {
  readonly kind: GatherableKind;
  readonly mesh: Mesh;
  readonly position: Vector3;
  collected: boolean;
}

export interface AurastriaHud {
  readonly objective: string;
  readonly progress: string;
  readonly actionHint: string;
  readonly inventory: FoundingInventory;
  readonly paused: boolean;
}

export interface AurastriaSceneHandle {
  readonly scene: Scene;
  readonly hud: AurastriaHud;
  getPlayerPosition(): Readonly<{ x: number; y: number; z: number }>;
  onStatus(listener: (status: string) => void): () => void;
  onHud(listener: (hud: AurastriaHud) => void): () => void;
  dispose(): void;
}

function createMaterial(scene: Scene, name: string, color: string, emissive?: string): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.emissiveColor = Color3.FromHexString(emissive ?? "#000000");
  material.specularColor = Color3.Black();
  return material;
}

function createTerrainMaterials(scene: Scene): Readonly<Record<RiverSpineTileKind, readonly StandardMaterial[]>> {
  const variants = (name: string, primary: string, secondary?: string): readonly StandardMaterial[] => [
    createMaterial(scene, `${name}-base`, primary, secondary),
    createMaterial(scene, `${name}-sunlit`, Color3.FromHexString(primary).scale(1.025).toHexString(), secondary),
    createMaterial(scene, `${name}-deep`, Color3.FromHexString(primary).scale(0.94).toHexString(), secondary),
  ];

  return {
    grass: variants("terrain-grass", "#3D6247"),
    fertile: variants("terrain-fertile", "#62733E"),
    river: variants("terrain-river", "#246F76", "#0E3037"),
    shallows: variants("terrain-shallows", "#37878B", "#155B5D"),
    sandbar: variants("terrain-sandbar", "#B89B64"),
    trail: variants("terrain-trail", "#806440"),
    grove: variants("terrain-grove", "#1C4636"),
  };
}

function toWorldPosition(x: number, y: number): Vector3 {
  return new Vector3((x - MAP_WIDTH / 2) * TILE_WORLD_SIZE, 0, (y - MAP_HEIGHT / 2) * TILE_WORLD_SIZE);
}

function buildFoundingCamp(scene: Scene): void {
  const timber = createMaterial(scene, "camp-timber", "#6B4328");
  const roof = createMaterial(scene, "camp-roof", "#967040");
  const hearth = createMaterial(scene, "camp-hearth", "#D9A549", "#4B2807");
  const supply = createMaterial(scene, "camp-supply", "#9E6C39");
  const lantern = createMaterial(scene, "camp-lantern", "#F4C269", "#D77C23");
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

  [
    { x: -1.45, z: 1.1, rotation: Math.PI / 2 },
    { x: 1.3, z: 1.35, rotation: Math.PI / 2 },
  ].forEach(({ x, z, rotation }, index) => {
    const log = MeshBuilder.CreateCylinder(`camp-log-${index}`, { height: 1.3, diameter: 0.24, tessellation: 6 }, scene);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = rotation;
    log.position = campOrigin.add(new Vector3(x, 0.2, z));
    log.material = timber;
  });

  [
    { x: -2.2, z: 0.75, height: 0.42 },
    { x: -1.85, z: 1.1, height: 0.58 },
  ].forEach(({ x, z, height }, index) => {
    const crate = MeshBuilder.CreateBox(`camp-supply-${index}`, { width: 0.5, height, depth: 0.48 }, scene);
    crate.position = campOrigin.add(new Vector3(x, height / 2, z));
    crate.rotation.y = index * 0.24;
    crate.material = supply;
  });

  const campLantern = MeshBuilder.CreateSphere("camp-lantern", { diameter: 0.2, segments: 6 }, scene);
  campLantern.position = campOrigin.add(new Vector3(1.9, 1.1, 0.55));
  campLantern.material = lantern;
}

function buildRiverArtDetails(scene: Scene, details: ReturnType<typeof deriveRiverArtDirection>["details"]): void {
  const trunk = createMaterial(scene, "river-tree-trunk", "#593B29");
  const canopy = createMaterial(scene, "river-tree-canopy", "#255940");
  const reeds = createMaterial(scene, "river-reeds", "#86A85D");
  const rock = createMaterial(scene, "river-rock", "#465149");

  const trunkMaster = MeshBuilder.CreateCylinder("canopy-trunk-master", { height: 1.75, diameter: 0.22, tessellation: 5 }, scene);
  trunkMaster.material = trunk;
  const canopyMaster = MeshBuilder.CreateCylinder("canopy-crown-master", { height: 1.55, diameterTop: 0.18, diameterBottom: 1.25, tessellation: 6 }, scene);
  canopyMaster.material = canopy;
  const lowerCanopyMaster = MeshBuilder.CreateCylinder("canopy-lower-master", { height: 0.86, diameterTop: 0.14, diameterBottom: 1.5, tessellation: 6 }, scene);
  lowerCanopyMaster.material = canopy;
  const reedMaster = MeshBuilder.CreateCylinder("reed-master", { height: 0.68, diameter: 0.052, tessellation: 4 }, scene);
  reedMaster.material = reeds;
  const rockMaster = MeshBuilder.CreateSphere("river-rock-master", { diameter: 0.55, segments: 5 }, scene);
  rockMaster.material = rock;

  [trunkMaster, canopyMaster, lowerCanopyMaster, reedMaster, rockMaster].forEach((master) => {
    master.isVisible = false;
    master.isPickable = false;
  });

  details.forEach((detail, index) => {
    const origin = toWorldPosition(detail.tile.x, detail.tile.y);
    if (detail.kind === "canopy-tree") {
      const treeTrunk = trunkMaster.createInstance(`canopy-trunk-${index}`);
      treeTrunk.position = origin.add(new Vector3(0, 0.95 * detail.scale, 0));
      treeTrunk.scaling.setAll(detail.scale);
      treeTrunk.rotation.y = detail.rotation;

      const treeCanopy = canopyMaster.createInstance(`canopy-crown-${index}`);
      treeCanopy.position = origin.add(new Vector3(0, 2.35 * detail.scale, 0));
      treeCanopy.rotation.y = detail.rotation;
      treeCanopy.scaling.setAll(detail.scale);

      const lowerCanopy = lowerCanopyMaster.createInstance(`canopy-lower-${index}`);
      lowerCanopy.position = origin.add(new Vector3(0, 1.78 * detail.scale, 0));
      lowerCanopy.rotation.y = detail.rotation + 0.24;
      lowerCanopy.scaling.setAll(detail.scale);
      return;
    }

    if (detail.kind === "reed-cluster") {
      for (let blade = 0; blade < 3; blade += 1) {
        const reed = reedMaster.createInstance(`reed-${index}-${blade}`);
        reed.position = origin.add(new Vector3((blade - 1) * 0.12, 0.32 * detail.scale, ((blade % 2) - 0.5) * 0.14));
        reed.rotation.z = (blade - 1) * 0.12;
        reed.scaling = new Vector3(detail.scale, ((0.52 + blade * 0.08) / 0.68) * detail.scale, detail.scale);
      }
      return;
    }

    const riverRock = rockMaster.createInstance(`river-rock-${index}`);
    riverRock.scaling = new Vector3(detail.scale, detail.scale * 0.55, detail.scale);
    riverRock.position = origin.add(new Vector3(0, 0.12, 0));
    riverRock.rotation.y = detail.rotation;
  });
}

function buildTideglassBeacon(scene: Scene, position: Vector3): Mesh {
  const stone = createMaterial(scene, "beacon-stone", "#31484A");
  const glow = createMaterial(scene, "beacon-glow", "#3B9A9F", "#2FD4D3");
  const base = MeshBuilder.CreateCylinder("tideglass-beacon-base", { height: 1.02, diameterTop: 1.06, diameterBottom: 1.45, tessellation: 6 }, scene);
  base.position = position.add(new Vector3(0, 0.36, 0));
  base.material = stone;

  const beacon = MeshBuilder.CreateCylinder("tideglass-beacon", { height: 3.35, diameterTop: 0.08, diameterBottom: 0.58, tessellation: 5 }, scene);
  beacon.position = position.add(new Vector3(0, 2.3, 0));
  beacon.rotation.y = Math.PI / 5;
  beacon.material = glow;
  return beacon;
}

function buildRiverMotes(scene: Scene, anchor: Vector3, seed: number): readonly { mesh: Mesh; basePosition: Vector3; phase: number }[] {
  const moteMaterial = createMaterial(scene, "river-mote", "#5CE4D5", "#3AC9C0");
  moteMaterial.alpha = 0.72;
  moteMaterial.disableLighting = true;
  const motes: { mesh: Mesh; basePosition: Vector3; phase: number }[] = [];

  for (let index = 0; index < 20; index += 1) {
    const horizontal = hashCoordinates(seed + 17, index, 1) / 0x1_0000_0000;
    const depth = hashCoordinates(seed + 29, index, 1) / 0x1_0000_0000;
    const vertical = hashCoordinates(seed + 41, index, 1) / 0x1_0000_0000;
    const phase = hashCoordinates(seed + 53, index, 1) / 0x1_0000_0000 * Math.PI * 2;
    const basePosition = anchor.add(new Vector3((horizontal - 0.5) * 5.6, 0.65 + vertical * 1.7, (depth - 0.5) * 4.4));
    const mesh = MeshBuilder.CreateSphere(`river-mote-${index}`, { diameter: 0.075 + vertical * 0.06, segments: 4 }, scene);
    mesh.position.copyFrom(basePosition);
    mesh.material = moteMaterial;
    motes.push({ mesh, basePosition, phase });
  }

  return motes;
}

function buildGatherNodes(scene: Scene): GatherNode[] {
  const reedMaterial = createMaterial(scene, "quest-river-reed", "#A5C46B", "#315C42");
  const stoneMaterial = createMaterial(scene, "quest-smooth-stone", "#5B716A");
  const definitions: readonly { readonly kind: GatherableKind; readonly tile: Readonly<{ x: number; y: number }> }[] = [
    { kind: "river-reed", tile: { x: 14, y: 13 } },
    { kind: "river-reed", tile: { x: 14, y: 15 } },
    { kind: "river-reed", tile: { x: 16, y: 14 } },
    { kind: "smooth-stone", tile: { x: 11, y: 13 } },
    { kind: "smooth-stone", tile: { x: 12, y: 16 } },
  ];

  return definitions.map((definition, index) => {
    const position = toWorldPosition(definition.tile.x, definition.tile.y);
    if (definition.kind === "river-reed") {
      const mesh = MeshBuilder.CreateCylinder(`quest-reed-${index}`, { height: 0.82, diameter: 0.15, tessellation: 5 }, scene);
      mesh.position = position.add(new Vector3(0, 0.38, 0));
      mesh.material = reedMaterial;
      return { kind: definition.kind, mesh, position, collected: false };
    }

    const mesh = MeshBuilder.CreateSphere(`quest-stone-${index}`, { diameter: 0.58, segments: 5 }, scene);
    mesh.scaling.y = 0.56;
    mesh.position = position.add(new Vector3(0, 0.16, 0));
    mesh.material = stoneMaterial;
    return { kind: definition.kind, mesh, position, collected: false };
  });
}

function buildRiverSpineTerrain(scene: Scene): RiverTerrainRuntime {
  const map = generateGreatRiverSpine({ width: MAP_WIDTH, height: MAP_HEIGHT });
  const terrainMaterials = createTerrainMaterials(scene);
  const visualPlan = deriveRiverArtDirection(map);
  const terrainBatches = new Map<string, Mesh[]>();
  const waterMaterials = new Map<StandardMaterial, { material: StandardMaterial; baseEmissive: Color3; phase: number }>();

  map.tiles.forEach((tile) => {
    const mesh = MeshBuilder.CreateBox(`tile-${tile.position.x}-${tile.position.y}`, { width: TILE_WORLD_SIZE, depth: TILE_WORLD_SIZE, height: 0.18 }, scene);
    const worldPosition = toWorldPosition(tile.position.x, tile.position.y);
    const baseY = tile.kind === "river" ? -0.12 : tile.kind === "shallows" ? -0.03 : 0;
    mesh.position = new Vector3(worldPosition.x, baseY, worldPosition.z);
    const materialVariants = terrainMaterials[tile.kind];
    const materialVariant = Math.floor(tile.elevation * 100) % materialVariants.length;
    const material = materialVariants[materialVariant];
    mesh.material = material;
    const batchKey = `${tile.kind}-${materialVariant}`;
    const batch = terrainBatches.get(batchKey) ?? [];
    batch.push(mesh);
    terrainBatches.set(batchKey, batch);
    if (tile.kind === "river" || tile.kind === "shallows") {
      waterMaterials.set(material, {
        material,
        baseEmissive: material.emissiveColor.clone(),
        phase: materialVariant * 0.78 + (tile.kind === "shallows" ? 0.42 : 0),
      });
    }
  });

  Array.from(terrainBatches.entries()).forEach(([batchKey, meshes]) => {
    const merged = Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
    if (merged) {
      merged.name = `terrain-batch-${batchKey}`;
      merged.isPickable = false;
    }
  });

  buildRiverArtDetails(scene, visualPlan.details);
  buildFoundingCamp(scene);
  const beaconPosition = toWorldPosition(visualPlan.landmarkTile.x, visualPlan.landmarkTile.y);
  const beacon = buildTideglassBeacon(scene, beaconPosition);
  const motes = buildRiverMotes(scene, beaconPosition, map.seed);
  return { waterMaterials: Array.from(waterMaterials.values()), beacon, beaconPosition, motes };
}

export function createAurastriaScene(engine: Engine, canvas: HTMLCanvasElement): AurastriaSceneHandle {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.025, 0.085, 0.08, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogColor = Color3.FromHexString("#1F4C49");
  scene.fogDensity = 0.024;
  const events = new EventBus<{ readonly status: string; readonly hud: AurastriaHud }>();
  let hud: AurastriaHud = {
    objective: "Seek the Tideglass Beacon",
    progress: "0/3 reeds · 0/2 stones",
    actionHint: "Follow the turquoise beacon to begin the founding task.",
    inventory: { "river-reed": 0, "smooth-stone": 0 },
    paused: false,
  };

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

  const skyFill = new HemisphericLight("river-sky-fill", new Vector3(0.2, 1, -0.25), scene);
  skyFill.intensity = 0.58;
  skyFill.diffuse = Color3.FromHexString("#BFD9C8");
  skyFill.groundColor = Color3.FromHexString("#173B32");

  const dawnLight = new DirectionalLight("river-dawn-key", new Vector3(-0.42, -1, 0.32), scene);
  dawnLight.position = new Vector3(18, 28, -12);
  dawnLight.intensity = 0.88;
  dawnLight.diffuse = Color3.FromHexString("#FFD69A");

  const terrainRuntime = buildRiverSpineTerrain(scene);
  const beaconLight = new PointLight("tideglass-beacon-light", terrainRuntime.beaconPosition.add(new Vector3(0, 2.3, 0)), scene);
  beaconLight.diffuse = Color3.FromHexString("#54DDD8");
  beaconLight.intensity = 1.1;
  beaconLight.range = 6.2;

  const hearthLight = new PointLight("camp-hearth-light", toWorldPosition(7, 12).add(new Vector3(0.25, 0.72, 1.95)), scene);
  hearthLight.diffuse = Color3.FromHexString("#FFB64D");
  hearthLight.intensity = 0.78;
  hearthLight.range = 5;
  const gatherNodes = buildGatherNodes(scene);
  const campPosition = toWorldPosition(7, 12);
  const pressed = new Set<string>();
  const movementKeys = new Set<string>(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"]);
  let quest = createFoundingQuest();
  let renderedFrames = 0;
  let renderBudgetLogged = false;
  let wasInteractPressed = false;
  let wasGatherPressed = false;
  let wasPausePressed = false;

  const publishHud = (actionHint: string) => {
    hud = {
      objective: foundingObjective(quest),
      progress: foundingProgress(quest),
      actionHint,
      inventory: quest.inventory,
      paused: hud.paused,
    };
    events.emit("hud", hud);
  };

  const setPaused = (paused: boolean) => {
    hud = { ...hud, paused };
    events.emit("hud", hud);
    events.emit("status", paused ? "Journey paused. The river waits without judgment." : "Journey resumed. Follow the river’s living light.");
  };

  const attemptInteract = () => {
    const distanceToCamp = Vector3.Distance(player.position, campPosition);
    const distanceToBeacon = Vector3.Distance(player.position, terrainRuntime.beaconPosition);
    if (distanceToBeacon <= 5.5 && quest.step === "seek-beacon") {
      quest = attuneTideglass(quest);
      publishHud("Press F / X near the marked reeds and stones to gather materials.");
      events.emit("status", "Tideglass patterns resolve into a camp need: three reeds and two smooth stones for the first granary marker.");
      return;
    }

    if (distanceToCamp <= 6 && quest.step === "return-to-camp") {
      quest = deliverFoundingMaterials(quest);
      publishHud("The camp stores the material and preserves the first granary plans.");
      events.emit("status", "Founding need met. The camp records its first granary plan and opens the river road ahead.");
      return;
    }

    if (distanceToCamp <= 6) {
      events.emit("status", quest.step === "complete"
        ? "The camp stewards review the granary plan. Explore freely; more needs will emerge with the season."
        : "The river camp needs a Tideglass reading before it can name the next shared task.");
      return;
    }

    if (distanceToBeacon <= 5.5) {
      events.emit("status", "The Tideglass Beacon holds a steady route through the reed banks.");
      return;
    }

    events.emit("status", "No nearby landmark answers. Follow the river’s turquoise light toward the beacon.");
  };

  const attemptGather = () => {
    const nearest = gatherNodes
      .filter((node) => !node.collected)
      .map((node) => ({ node, distance: Vector3.Distance(player.position, node.position) }))
      .sort((left, right) => left.distance - right.distance)[0];
    if (!nearest || nearest.distance > 2.2) {
      events.emit("status", "No gathering material is close enough. Look for pale reeds or smooth river stones.");
      return;
    }
    if (quest.step !== "gather-materials") {
      events.emit("status", "The camp has not named this material’s purpose yet. Read the Tideglass Beacon first.");
      return;
    }

    nearest.node.collected = true;
    nearest.node.mesh.setEnabled(false);
    quest = collectFoundingMaterial(quest, nearest.node.kind);
    const label = nearest.node.kind === "river-reed" ? "river reed" : "smooth stone";
    publishHud(quest.step === "return-to-camp"
      ? "Materials complete. Return to Founding Camp and press E / A to deliver them."
      : "Continue gathering beside the river; every material is recorded for the shared camp.");
    events.emit("status", `Collected ${label}. ${foundingProgress(quest)}.`);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (isKeyboardAction("pause", event.code)) {
      event.preventDefault();
      if (!event.repeat) {
        setPaused(!hud.paused);
      }
      return;
    }
    if (hud.paused) {
      return;
    }
    if (isKeyboardAction("interact", event.code)) {
      event.preventDefault();
      if (!event.repeat) {
        attemptInteract();
      }
      return;
    }
    if (isKeyboardAction("gather", event.code)) {
      event.preventDefault();
      if (!event.repeat) {
        attemptGather();
      }
      return;
    }
    if (movementKeys.has(event.code)) {
      event.preventDefault();
      pressed.add(event.code);
    }
  };
  const onKeyUp = (event: KeyboardEvent) => pressed.delete(event.code);
  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);

  const beforeRender = scene.onBeforeRenderObservable.add(() => {
    renderedFrames += 1;
    if (!renderBudgetLogged && renderedFrames >= 5) {
      renderBudgetLogged = true;
      console.info("[aurastria:render-budget]", {
        activeMeshes: scene.getActiveMeshes().length,
        frameTimeMs: Number(engine.getDeltaTime().toFixed(2)),
        fps: Number(engine.getFps().toFixed(1)),
        waterMaterials: terrainRuntime.waterMaterials.length,
        ambientMotes: terrainRuntime.motes.length,
      });
    }
    const elapsedSeconds = performance.now() / 1000;
    terrainRuntime.waterMaterials.forEach((waterMaterial) => {
      const currentScale = 0.72 + (Math.sin(elapsedSeconds * 0.9 + waterMaterial.phase) + 1) * 0.14;
      waterMaterial.material.emissiveColor = waterMaterial.baseEmissive.scale(currentScale);
    });
    const beaconPulse = 1 + Math.sin(elapsedSeconds * 1.15) * 0.045;
    terrainRuntime.beacon.scaling.setAll(beaconPulse);
    beaconLight.intensity = 1.03 + Math.sin(elapsedSeconds * 1.15) * 0.16;
    terrainRuntime.motes.forEach((mote) => {
      mote.mesh.position.y = mote.basePosition.y + Math.sin(elapsedSeconds * 0.72 + mote.phase) * 0.3;
      mote.mesh.position.x = mote.basePosition.x + Math.cos(elapsedSeconds * 0.46 + mote.phase) * 0.16;
      mote.mesh.visibility = 0.36 + (Math.sin(elapsedSeconds * 1.2 + mote.phase) + 1) * 0.22;
    });

    const gamepad = navigator.getGamepads?.()[0] ?? undefined;
    const interactPressed = isGamepadActionPressed("interact", gamepad);
    const gatherPressed = isGamepadActionPressed("gather", gamepad);
    const pausePressed = isGamepadActionPressed("pause", gamepad);
    if (pausePressed && !wasPausePressed) {
      setPaused(!hud.paused);
    }
    wasPausePressed = pausePressed;
    if (!hud.paused && interactPressed && !wasInteractPressed) {
      attemptInteract();
    }
    if (!hud.paused && gatherPressed && !wasGatherPressed) {
      attemptGather();
    }
    wasInteractPressed = interactPressed;
    wasGatherPressed = gatherPressed;
    if (hud.paused) {
      return;
    }

    const inputDirection = combinedMoveDirection(pressed, gamepad);
    const direction = new Vector3(inputDirection.x, 0, inputDirection.y);
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
    get hud() {
      return hud;
    },
    getPlayerPosition: () => ({ x: player.position.x, y: player.position.y, z: player.position.z }),
    onStatus: (listener) => events.on("status", listener),
    onHud: (listener) => events.on("hud", listener),
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
