import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
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
import { generateGreatRiverSpine } from "@/game/world/greatRiverSpine";
import { hashCoordinates } from "@/game/world/prng";
import { deriveRiverArtDirection } from "@/game/render/riverArtDirection";
import { beaconArrivalScale } from "@/game/render/beaconMotion";
import { beaconNavigation, type BeaconNavigation } from "@/game/navigation/beaconCompass";
import { combinedMoveDirection, isGamepadActionPressed, isKeyboardAction } from "@/game/input/inputActions";
import { createSceneSaveState, restoreFoundingQuest } from "@/game/features/saves/sceneSaveState";
import type { SaveStateInput } from "@shared/game/schemas";
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
const GREAT_RIVER_MOBILE_PLATE_URL = "/manus-storage/aurastria-great-river-mobile-plate_e54226c6.png";
const TIDEWALKER_TOKEN_URL = "/manus-storage/aurastria-tidewalker-token_62d240e1.png";
const FOUNDING_CAMP_MARKER_URL = "/manus-storage/aurastria-founding-camp-marker_c7a362ba.png";
const TIDEGLASS_BEACON_SPRITE_URL = "/manus-storage/aurastria-tideglass-beacon-sprite_2655aa3a.png";

interface RiverTerrainRuntime {
  readonly worldSeed: number;
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
  readonly navigation: BeaconNavigation;
  readonly paused: boolean;
}

export interface AurastriaSceneHandle {
  readonly scene: Scene;
  readonly hud: AurastriaHud;
  getPlayerPosition(): Readonly<{ x: number; y: number; z: number }>;
  saveState(): SaveStateInput;
  loadState(state: SaveStateInput): void;
  setPaused(paused: boolean): void;
  setTouchMove(direction: Readonly<{ x: number; y: number }> | null): void;
  triggerAction(action: "interact" | "gather" | "pause"): void;
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

function toWorldPosition(x: number, y: number): Vector3 {
  return new Vector3((x - MAP_WIDTH / 2) * TILE_WORLD_SIZE, 0, (y - MAP_HEIGHT / 2) * TILE_WORLD_SIZE);
}

function buildPaintedTerrainPlate(scene: Scene): void {
  const terrain = MeshBuilder.CreateGround("great-river-painted-terrain", {
    width: MAP_WIDTH * TILE_WORLD_SIZE * 1.65,
    height: MAP_HEIGHT * TILE_WORLD_SIZE * 1.65,
    subdivisions: 1,
  }, scene);
  terrain.position.y = -0.17;
  terrain.isPickable = false;

  const material = new StandardMaterial("great-river-painted-material", scene);
  const terrainTexture = new Texture(GREAT_RIVER_MOBILE_PLATE_URL, scene, false, false);
  terrainTexture.hasAlpha = false;
  material.diffuseTexture = terrainTexture;
  material.diffuseColor = Color3.White();
  material.emissiveColor = Color3.FromHexString("#18342C");
  material.specularColor = Color3.Black();
  terrain.material = material;
}

function buildIllustratedGroundMarker(scene: Scene, name: string, source: string, position: Vector3, size: number): Mesh {
  const marker = MeshBuilder.CreatePlane(name, { size }, scene);
  marker.rotation.x = Math.PI / 2;
  marker.position = position.clone();
  marker.isPickable = false;

  const material = new StandardMaterial(`${name}-material`, scene);
  const texture = new Texture(source, scene, false, false);
  texture.hasAlpha = true;
  material.diffuseTexture = texture;
  material.opacityTexture = texture;
  material.useAlphaFromDiffuseTexture = true;
  material.specularColor = Color3.Black();
  material.backFaceCulling = false;
  material.disableLighting = true;
  marker.material = material;
  return marker;
}

function buildFoundingCamp(scene: Scene): void {
  const campOrigin = toWorldPosition(7, 12);
  const marker = buildIllustratedGroundMarker(scene, "founding-camp-marker", FOUNDING_CAMP_MARKER_URL, campOrigin.add(new Vector3(0, 0.035, 0)), 6.7);
  marker.setEnabled(false);

  const timber = createMaterial(scene, "camp-timber", "#70452C");
  const roof = createMaterial(scene, "camp-roof", "#A57942");
  const hearth = createMaterial(scene, "camp-hearth", "#F0AC4E", "#73390E");
  [
    { x: 0, z: 0, scale: 1 },
    { x: 1.82, z: -0.62, scale: 0.75 },
    { x: -1.64, z: -0.84, scale: 0.72 },
  ].forEach(({ x, z, scale }, index) => {
    const shelter = MeshBuilder.CreateCylinder(`camp-shelter-${index}`, { height: 0.7 * scale, diameterTop: 0.34 * scale, diameterBottom: 1.62 * scale, tessellation: 5 }, scene);
    shelter.position = campOrigin.add(new Vector3(x, 0.36 * scale, z));
    shelter.rotation.y = Math.PI / 5 + index * 0.38;
    shelter.material = index === 0 ? roof : timber;
  });
  const fire = MeshBuilder.CreateSphere("camp-hearth", { diameter: 0.38, segments: 6 }, scene);
  fire.position = campOrigin.add(new Vector3(0.1, 0.25, 1.38));
  fire.material = hearth;
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
  const marker = buildIllustratedGroundMarker(scene, "tideglass-beacon-sprite", TIDEGLASS_BEACON_SPRITE_URL, position.add(new Vector3(0, 0.06, 0)), 4.6);
  marker.setEnabled(false);
  const stone = createMaterial(scene, "beacon-stone", "#3A5B58", "#0C201F");
  const glow = createMaterial(scene, "beacon-glow", "#47BFC1", "#39DDD8");
  const base = MeshBuilder.CreateCylinder("tideglass-beacon-base", { height: 0.18, diameterTop: 1.26, diameterBottom: 1.48, tessellation: 8 }, scene);
  base.position = position.add(new Vector3(0, 0.08, 0));
  base.material = stone;
  const beacon = MeshBuilder.CreateSphere("tideglass-beacon", { diameter: 0.66, segments: 8 }, scene);
  beacon.scaling.y = 0.72;
  beacon.position = position.add(new Vector3(0, 0.38, 0));
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
  const visualPlan = deriveRiverArtDirection(map);
  buildPaintedTerrainPlate(scene);
  buildRiverArtDetails(scene, visualPlan.details);
  buildFoundingCamp(scene);
  const beaconPosition = toWorldPosition(visualPlan.landmarkTile.x, visualPlan.landmarkTile.y);
  const beacon = buildTideglassBeacon(scene, beaconPosition);
  const motes = buildRiverMotes(scene, beaconPosition, map.seed);
  return { worldSeed: map.seed, waterMaterials: [], beacon, beaconPosition, motes };
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
    navigation: { bearingDegrees: 0, distance: 0 },
    paused: false,
  };

  const player = MeshBuilder.CreateCylinder("wanderer", { height: 0.16, diameter: 0.84, tessellation: 12 }, scene);
  player.position = toWorldPosition(10, 14);
  player.position.y = 0.09;
  player.material = createMaterial(scene, "wanderer-material", "#E5BC55", "#5A3D14");
  const playerChevron = MeshBuilder.CreateCylinder("wanderer-heading", { height: 0.06, diameterTop: 0, diameterBottom: 0.44, tessellation: 3 }, scene);
  playerChevron.position = player.position.add(new Vector3(0, 0.12, 0.24));
  playerChevron.rotation.y = Math.PI;
  playerChevron.material = createMaterial(scene, "wanderer-heading-material", "#2E5A55", "#12322D");
  const playerToken = buildIllustratedGroundMarker(scene, "tidewalker-token", TIDEWALKER_TOKEN_URL, player.position.add(new Vector3(0, -0.63, 0)), 2.05);
  playerToken.setEnabled(false);

  const camera = new ArcRotateCamera("river-spine-camera", -Math.PI / 2, 0.56, 21, player.position.clone(), scene);
  camera.lowerRadiusLimit = 16;
  camera.upperRadiusLimit = 28;
  camera.lowerBetaLimit = 0.42;
  camera.upperBetaLimit = 0.76;
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
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reducedMotion) {
    terrainRuntime.motes.forEach((mote) => mote.mesh.setEnabled(false));
  }
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
  let beaconArrivalStartedAt: number | undefined;
  let wasNearBeacon = false;
  let lastActionHint = hud.actionHint;
  let touchMove: Readonly<{ x: number; y: number }> | null = null;
  let lastNavigationUpdateAt = 0;

  const syncPlayerMarker = () => {
    playerToken.position.set(player.position.x, 0.09, player.position.z);
    playerToken.rotation.y = player.rotation.y;
    playerChevron.position.set(player.position.x, 0.12, player.position.z);
    playerChevron.position.addInPlace(new Vector3(Math.sin(player.rotation.y) * 0.25, 0, Math.cos(player.rotation.y) * 0.25));
    playerChevron.rotation.y = player.rotation.y;
  };

  const currentNavigation = () => beaconNavigation(
    { x: player.position.x, z: player.position.z },
    { x: terrainRuntime.beaconPosition.x, z: terrainRuntime.beaconPosition.z },
  );
  hud = { ...hud, navigation: currentNavigation() };

  const publishHud = (actionHint: string) => {
    hud = {
      objective: foundingObjective(quest),
      progress: foundingProgress(quest),
      actionHint,
      inventory: quest.inventory,
      navigation: currentNavigation(),
      paused: hud.paused,
    };
    events.emit("hud", hud);
  };

  const publishNavigation = (nowMs: number) => {
    if (nowMs - lastNavigationUpdateAt < 180) return;
    lastNavigationUpdateAt = nowMs;
    hud = { ...hud, navigation: currentNavigation() };
    events.emit("hud", hud);
  };

  const publishActionHint = (actionHint: string) => {
    if (actionHint === lastActionHint) {
      return;
    }
    lastActionHint = actionHint;
    hud = { ...hud, actionHint };
    events.emit("hud", hud);
  };

  const setPaused = (paused: boolean) => {
    hud = { ...hud, paused };
    events.emit("hud", hud);
    events.emit("status", paused ? "Journey paused. The river waits without judgment." : "Journey resumed. Follow the river’s living light.");
  };

  const loadState = (state: SaveStateInput) => {
    if (state.regionId !== "great-river-spine") {
      events.emit("status", "This save belongs to a region not yet reachable in the current journey slice.");
      return;
    }
    player.position.set(state.playerPosition.x, state.playerPosition.y, state.playerPosition.z);
    syncPlayerMarker();
    camera.target.copyFrom(player.position);
    quest = restoreFoundingQuest(state);
    publishHud("Journey restored. Follow the river’s living light.");
    events.emit("status", "Journey restored from the river archive.");
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

  const triggerAction = (action: "interact" | "gather" | "pause") => {
    if (action === "pause") {
      setPaused(!hud.paused);
      return;
    }
    if (hud.paused) return;
    if (action === "interact") attemptInteract();
    if (action === "gather") attemptGather();
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
      const currentScale = reducedMotion ? 1 : 0.72 + (Math.sin(elapsedSeconds * 0.9 + waterMaterial.phase) + 1) * 0.14;
      waterMaterial.material.emissiveColor = waterMaterial.baseEmissive.scale(currentScale);
    });
    const distanceToBeacon = Vector3.Distance(player.position, terrainRuntime.beaconPosition);
    const isNearBeacon = distanceToBeacon <= 5.5;
    if (!hud.paused && isNearBeacon && !wasNearBeacon && quest.step === "seek-beacon") {
      beaconArrivalStartedAt = elapsedSeconds;
      publishActionHint("Tideglass answers nearby. Press E / A to attune the beacon.");
    }
    if (!hud.paused && !isNearBeacon && wasNearBeacon && quest.step === "seek-beacon") {
      publishActionHint("Follow the turquoise beacon to begin the founding task.");
    }
    wasNearBeacon = isNearBeacon;
    const arrivalScale = beaconArrivalStartedAt === undefined ? 1 : beaconArrivalScale(elapsedSeconds - beaconArrivalStartedAt, reducedMotion);
    const beaconPulse = reducedMotion ? arrivalScale : arrivalScale * (1 + Math.sin(elapsedSeconds * 1.15) * 0.045);
    terrainRuntime.beacon.scaling.setAll(beaconPulse);
    beaconLight.intensity = reducedMotion ? 1.03 : 1.03 + Math.sin(elapsedSeconds * 1.15) * 0.16;
    if (!reducedMotion) {
      terrainRuntime.motes.forEach((mote) => {
        mote.mesh.position.y = mote.basePosition.y + Math.sin(elapsedSeconds * 0.72 + mote.phase) * 0.3;
        mote.mesh.position.x = mote.basePosition.x + Math.cos(elapsedSeconds * 0.46 + mote.phase) * 0.16;
        mote.mesh.visibility = 0.36 + (Math.sin(elapsedSeconds * 1.2 + mote.phase) + 1) * 0.22;
      });
    }

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

    const inputDirection = touchMove ?? combinedMoveDirection(pressed, gamepad);
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
    syncPlayerMarker();
    publishNavigation(performance.now());
    camera.target.copyFrom(player.position);
  });

  return {
    scene,
    get hud() {
      return hud;
    },
    getPlayerPosition: () => ({ x: player.position.x, y: player.position.y, z: player.position.z }),
    saveState: () => createSceneSaveState({
      worldSeed: terrainRuntime.worldSeed,
      playerPosition: { x: player.position.x, y: player.position.y, z: player.position.z },
      quest,
    }),
    loadState,
    setPaused,
    setTouchMove: (direction) => { touchMove = direction; },
    triggerAction,
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
