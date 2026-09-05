import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Material } from "@babylonjs/core/Materials/material";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import "@babylonjs/core/Meshes/instancedMesh";
import "@babylonjs/core/Shaders/ShadersInclude/instancesDeclaration";
import "@babylonjs/core/Shaders/ShadersInclude/instancesVertex";
import "@babylonjs/core/Shaders/default.fragment";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { EventBus } from "@/game/core/eventBus";
import { resolveFoundingLoopLayout } from "@/game/world/foundingLoopLayout";
import { hashCoordinates } from "@/game/world/prng";
import { deriveRiverArtDirection } from "@/game/render/riverArtDirection";
import { beaconArrivalScale } from "@/game/render/beaconMotion";
import { FRAME_BUDGET_MS, FrameBudgetCollector } from "@/game/render/frameBudget";
import { beaconNavigation, type BeaconNavigation } from "@/game/navigation/beaconCompass";
import { combinedMoveDirection, isGamepadActionPressed, isKeyboardAction, writeCombinedMoveDirection } from "@/game/input/inputActions";
import { isRollReady, resolveRoll, rollRejectionMessage } from "@/game/features/movement/dodgeRoll";
import { createRiverWisp, stepRiverWisp, type RiverWispState } from "@/game/features/combat/riverWispCombat";
import { createSceneSaveState, restoreFoundingQuest } from "@/game/features/saves/sceneSaveState";
import { recoverFromRiverWisp } from "@/game/features/survival/foundingLoopRecovery";
import { applySettleWispSafeReturn } from "@/game/scene/foundingLoopSceneRecovery";
import type { SaveStateInput } from "@shared/game/schemas";
import { DEFAULT_WORLD_SEED } from "@shared/game/constants";
import { createFirstDungeon } from "@/game/features/dungeon/firstDungeon";
import { createFirstDungeonWorldLayout } from "@/game/features/dungeon/dungeonLayout";
import { buildDungeonEnemyVisual, createDungeonVisualMaterials } from "@/game/features/dungeon/dungeonVisuals";
import { createDungeonRuntime, stepDungeonRuntime, type DungeonRuntimeState } from "@/game/features/dungeon/dungeonRuntime";
import {
  attuneTideglass,
  collectFoundingMaterial,
  createFoundingQuest,
  deliverFoundingMaterials,
  foundingObjective,
  foundingProgress,
  settleRiverWisp,
  type FoundingInventory,
  type GatherableKind,
} from "@/game/features/survival/foundingQuest";

const TILE_WORLD_SIZE = 1.55;
const MAP_WIDTH = 32;
const MAP_HEIGHT = 24;
const PLAYER_SPEED = 7;
/** Canonical founding-loop spawn tile; also the reachability origin for objective validation. */
const PLAYER_SPAWN_TILE = { x: 10, y: 14 } as const;
/** Founding camp tile; the founding loop must be able to walk spawn → Tideglass → camp. */
const FOUNDING_CAMP_TILE = { x: 7, y: 12 } as const;
const REQUIRED_REED_NODES = 3;
const REQUIRED_STONE_NODES = 2;
const GREAT_RIVER_MOBILE_PLATE_URL = "/manus-storage/aurastria-great-river-mobile-plate_e54226c6.png";
const TIDEWALKER_TOKEN_URL = "/manus-storage/aurastria-expedition-token_547c361d.png";
const FOUNDING_CAMP_MARKER_URL = "/manus-storage/aurastria-founding-camp-token_8cc3f7db.png";
const TIDEGLASS_BEACON_SPRITE_URL = "/manus-storage/aurastria-tideglass-beacon-token_c944b6ed.png";
const RIVER_REED_TOKEN_URL = "/manus-storage/aurastria-river-reed-topdown-token_e3a0da75.png";
const SMOOTH_STONE_TOKEN_URL = "/manus-storage/aurastria-smooth-stone-topdown-token_4da7b272.png";

interface RiverTerrainRuntime {
  readonly worldSeed: number;
  readonly waterMaterials: readonly { readonly material: StandardMaterial; readonly baseEmissive: Color3; readonly phase: number }[];
  readonly beacon: Mesh;
  readonly beaconPosition: Vector3;
  readonly motes: readonly { readonly mesh: Mesh; readonly basePosition: Vector3; readonly phase: number }[];
  readonly gatherPlacements: readonly { readonly kind: GatherableKind; readonly tile: Readonly<{ x: number; y: number }> }[];
  readonly campPosition: Vector3;
}

interface GatherNode {
  readonly kind: GatherableKind;
  readonly mesh: Mesh;
  readonly position: Vector3;
  collected: boolean;
}

interface RiverWispRuntime {
  readonly mesh: Mesh;
  readonly halo: Mesh;
  readonly light: PointLight;
}

interface DungeonPreviewRuntime {
  readonly root: TransformNode;
  readonly origin: Vector3;
  readonly key: Mesh;
  readonly chest: Mesh;
  readonly door: Mesh;
  readonly enemies: readonly { readonly name: "Skulltula" | "Moblin" | "Dungeon Boss"; readonly root: TransformNode }[];
}

export interface AurastriaHud {
  readonly objective: string;
  readonly progress: string;
  readonly actionHint: string;
  readonly inventory: FoundingInventory;
  readonly navigation: BeaconNavigation;
  readonly vitality: number;
  readonly wispHealth: number;
  readonly strikeReady: boolean;
  readonly rollReady: boolean;
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
  triggerAction(action: "interact" | "gather" | "strike" | "roll" | "pause"): void;
  /**
   * Move the explorer directly to a world position, clamped to the map. Used by
   * verification harnesses to reach objective sites without simulating a long
   * input session, and by future fast-travel features.
   */
  movePlayerTo(position: Readonly<{ x: number; z: number }>): void;
  /** World positions of objective sites, for navigation aids and verification. */
  getObjectiveSites(): Readonly<{
    readonly camp: Readonly<{ x: number; z: number }>;
    readonly beacon: Readonly<{ x: number; z: number }>;
    readonly wisp: Readonly<{ x: number; z: number }>;
    readonly gatherNodes: readonly Readonly<{ kind: string; x: number; z: number; collected: boolean }>[];
  }>;
  /** Development-only world positions for stable dungeon visual inspection. */
  getDungeonSites(): Readonly<{
    readonly entry: Readonly<{ x: number; z: number }>;
    readonly key: Readonly<{ x: number; z: number }>;
    readonly cache: Readonly<{ x: number; z: number }>;
    readonly gate: Readonly<{ x: number; z: number }>;
    readonly treasure: Readonly<{ x: number; z: number }>;
    readonly boss: Readonly<{ x: number; z: number }>;
  }>;
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

interface HumanoidCharacterRuntime {
  readonly root: TransformNode;
  readonly marker: Mesh;
  readonly heading: Mesh;
}

/**
 * Aurastria's first character pass uses a compact Babylon-native humanoid rather
 * than a billboard or flat token. It deliberately stays asset-light: shared
 * materials, low tessellation, and a single root make it safe for mobile while
 * leaving room for a verified GLB replacement later.
 */
function buildHumanoidCharacter(
  scene: Scene,
  name: string,
  palette: { readonly cloak: string; readonly trim: string; readonly skin: string; readonly hair: string; readonly accent: string },
): HumanoidCharacterRuntime {
  const root = new TransformNode(`${name}-root`, scene);
  const cloak = createMaterial(scene, `${name}-cloak`, palette.cloak);
  const trim = createMaterial(scene, `${name}-trim`, palette.trim, palette.accent);
  const skin = createMaterial(scene, `${name}-skin`, palette.skin);
  const hair = createMaterial(scene, `${name}-hair`, palette.hair);
  [cloak, trim, skin, hair].forEach((material) => { material.disableLighting = true; });

  const torso = MeshBuilder.CreateCylinder(`${name}-torso`, { height: 0.82, diameterTop: 0.48, diameterBottom: 0.68, tessellation: 6 }, scene);
  torso.position.y = 0.86;
  torso.material = cloak;
  torso.parent = root;

  const belt = MeshBuilder.CreateTorus(`${name}-belt`, { diameter: 0.56, thickness: 0.075, tessellation: 8 }, scene);
  belt.position.y = 0.68;
  belt.rotation.x = Math.PI / 2;
  belt.material = trim;
  belt.parent = root;

  const head = MeshBuilder.CreateSphere(`${name}-head`, { diameter: 0.48, segments: 8 }, scene);
  head.position.y = 1.48;
  head.material = skin;
  head.parent = root;

  const hairCap = MeshBuilder.CreateCylinder(`${name}-hair-cap`, { height: 0.18, diameterTop: 0.3, diameterBottom: 0.55, tessellation: 8 }, scene);
  hairCap.position.y = 1.7;
  hairCap.material = hair;
  hairCap.parent = root;

  const leftArm = MeshBuilder.CreateCylinder(`${name}-arm-l`, { height: 0.64, diameter: 0.16, tessellation: 6 }, scene);
  leftArm.position.set(-0.38, 0.86, 0);
  leftArm.rotation.z = -0.18;
  leftArm.material = cloak;
  leftArm.parent = root;
  const rightArm = leftArm.clone(`${name}-arm-r`);
  rightArm.position.x = 0.38;
  rightArm.rotation.z = 0.18;
  rightArm.parent = root;

  const leftLeg = MeshBuilder.CreateCylinder(`${name}-leg-l`, { height: 0.64, diameter: 0.18, tessellation: 6 }, scene);
  leftLeg.position.set(-0.18, 0.3, 0);
  leftLeg.material = trim;
  leftLeg.parent = root;
  const rightLeg = leftLeg.clone(`${name}-leg-r`);
  rightLeg.position.x = 0.18;
  rightLeg.parent = root;

  const staff = MeshBuilder.CreateCylinder(`${name}-staff`, { height: 1.55, diameter: 0.055, tessellation: 6 }, scene);
  staff.position.set(0.55, 0.86, 0.08);
  staff.rotation.z = -0.08;
  staff.material = trim;
  staff.parent = root;
  const staffGem = MeshBuilder.CreateSphere(`${name}-staff-gem`, { diameter: 0.16, segments: 6 }, scene);
  staffGem.position.set(0.55, 1.67, 0.08);
  staffGem.material = trim;
  staffGem.parent = root;

  const marker = MeshBuilder.CreateCylinder(`${name}-ground-marker`, { height: 0.06, diameter: 0.78, tessellation: 12 }, scene);
  marker.position.y = 0.05;
  marker.material = trim;
  marker.parent = root;

  const heading = MeshBuilder.CreateCylinder(`${name}-heading`, { height: 0.07, diameterTop: 0, diameterBottom: 0.2, tessellation: 3 }, scene);
  heading.position.set(0, 0.08, 0.52);
  heading.rotation.y = Math.PI;
  heading.material = trim;
  heading.parent = root;

  return { root, marker, heading };
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
  texture.getAlphaFromRGB = false;
  material.diffuseTexture = texture;
  material.useAlphaFromDiffuseTexture = true;
  material.transparencyMode = Material.MATERIAL_ALPHABLEND;
  material.specularColor = Color3.Black();
  material.backFaceCulling = false;
  material.disableLighting = true;
  marker.material = material;
  return marker;
}

function buildFoundingCamp(scene: Scene, campTile: Readonly<{ x: number; y: number }>): void {
  const campOrigin = toWorldPosition(campTile.x, campTile.y);
  const marker = buildIllustratedGroundMarker(scene, "founding-camp-marker", FOUNDING_CAMP_MARKER_URL, campOrigin.add(new Vector3(0, 0.04, 0)), 4.8);
  marker.setEnabled(false);

  const timber = createMaterial(scene, "camp-timber", "#70452C");
  const roof = createMaterial(scene, "camp-roof", "#A57942");
  const hearth = createMaterial(scene, "camp-hearth", "#F0AC4E", "#73390E");
  const campRing = MeshBuilder.CreateCylinder("camp-ring", { height: 0.07, diameter: 2.1, tessellation: 12 }, scene);
  campRing.position = campOrigin.add(new Vector3(0, 0.04, 0));
  campRing.material = timber;
  [
    { x: 0.54, z: -0.34, scale: 0.58 },
    { x: -0.52, z: -0.3, scale: 0.54 },
    { x: 0.03, z: 0.54, scale: 0.5 },
  ].forEach(({ x, z, scale }, index) => {
    const shelter = MeshBuilder.CreateCylinder(`camp-shelter-${index}`, { height: 0.78 * scale, diameterTop: 0.02, diameterBottom: 1.08 * scale, tessellation: 5 }, scene);
    shelter.position = campOrigin.add(new Vector3(x, 0.42 * scale, z));
    shelter.rotation.y = Math.PI / 5 + index * 0.38;
    shelter.material = roof;
  });
  const fire = MeshBuilder.CreateSphere("camp-hearth", { diameter: 0.3, segments: 6 }, scene);
  fire.position = campOrigin.add(new Vector3(0, 0.2, 0));
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
  const marker = buildIllustratedGroundMarker(scene, "tideglass-beacon-sprite", TIDEGLASS_BEACON_SPRITE_URL, position.add(new Vector3(0, 0.07, 0)), 3.7);
  const stone = createMaterial(scene, "beacon-stone", "#3A5B58", "#0C201F");
  const glow = createMaterial(scene, "beacon-glow", "#47BFC1", "#39DDD8");
  glow.disableLighting = true;
  const base = MeshBuilder.CreateCylinder("tideglass-beacon-base", { height: 0.18, diameterTop: 1.26, diameterBottom: 1.48, tessellation: 8 }, scene);
  base.position = position.add(new Vector3(0, 0.08, 0));
  base.material = stone;
  const beacon = MeshBuilder.CreateCylinder("tideglass-beacon", { height: 1.28, diameterTop: 0.02, diameterBottom: 0.62, tessellation: 5 }, scene);
  beacon.position = position.add(new Vector3(0, 0.72, 0));
  beacon.material = glow;
  const aura = MeshBuilder.CreateTorus("tideglass-beacon-aura", { diameter: 1.18, thickness: 0.055, tessellation: 10 }, scene);
  aura.position = position.add(new Vector3(0, 0.23, 0));
  aura.rotation.x = Math.PI / 2;
  aura.material = glow;
  for (let shardIndex = 0; shardIndex < 3; shardIndex += 1) {
    const shard = MeshBuilder.CreateCylinder(`tideglass-shard-${shardIndex}`, { height: 0.42, diameterTop: 0.015, diameterBottom: 0.12, tessellation: 5 }, scene);
    const angle = shardIndex * (Math.PI * 2 / 3);
    shard.position = position.add(new Vector3(Math.cos(angle) * 0.42, 0.34, Math.sin(angle) * 0.42));
    shard.rotation.z = Math.cos(angle) * 0.32;
    shard.rotation.x = Math.sin(angle) * 0.32;
    shard.material = glow;
  }
  marker.setEnabled(false);
  return beacon;
}

function buildTideglassRoute(scene: Scene, start: Vector3, destination: Vector3): void {
  const routeMaterial = createMaterial(scene, "tideglass-route", "#87EEE2", "#43BFB5");
  routeMaterial.disableLighting = true;
  routeMaterial.alpha = 0.82;
  const delta = destination.subtract(start);
  const markerCount = 7;
  for (let index = 1; index <= markerCount; index += 1) {
    const progress = index / (markerCount + 1);
    const marker = MeshBuilder.CreateCylinder(`tideglass-route-${index}`, { height: 0.045, diameterTop: 0, diameterBottom: 0.26, tessellation: 3 }, scene);
    const drift = Math.sin(progress * Math.PI * 2) * 0.45;
    marker.position.set(start.x + delta.x * progress + drift, 0.058, start.z + delta.z * progress);
    marker.rotation.y = Math.atan2(delta.x, delta.z);
    marker.material = routeMaterial;
  }
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

function buildRiverWisp(scene: Scene): RiverWispRuntime {
  const position = toWorldPosition(13, 14).add(new Vector3(0, 0.58, 0));
  const material = createMaterial(scene, "river-wisp-material", "#6EE9DA", "#2CBDBA");
  material.disableLighting = true;
  const mesh = MeshBuilder.CreateSphere("river-wisp", { diameter: 0.62, segments: 6 }, scene);
  mesh.position = position;
  mesh.material = material;
  const haloMaterial = createMaterial(scene, "river-wisp-halo-material", "#B3FFF4", "#4BE0D1");
  haloMaterial.disableLighting = true;
  const halo = MeshBuilder.CreateTorus("river-wisp-halo", { diameter: 1.08, thickness: 0.1, tessellation: 12 }, scene);
  halo.position = position.add(new Vector3(0, -0.28, 0));
  halo.rotation.x = Math.PI / 2;
  halo.material = haloMaterial;
  const light = new PointLight("river-wisp-light", position.clone(), scene);
  light.diffuse = Color3.FromHexString("#6EE9DA");
  light.intensity = 0.62;
  light.range = 3.2;
  return { mesh, halo, light };
}

function buildGatherNodes(scene: Scene, placements: readonly { readonly kind: GatherableKind; readonly tile: Readonly<{ x: number; y: number }> }[]): GatherNode[] {
  const reedMaterial = createMaterial(scene, "quest-river-reed", "#B8D978", "#527843");
  reedMaterial.disableLighting = true;
  const stoneMaterial = createMaterial(scene, "quest-smooth-stone", "#8BA9A0", "#314A4B");
  stoneMaterial.disableLighting = true;
  return placements.map((definition, index) => {
    const position = toWorldPosition(definition.tile.x, definition.tile.y);
    if (definition.kind === "river-reed") {
      const mesh = MeshBuilder.CreateCylinder(`quest-reed-${index}`, { height: 0.98, diameterTop: 0.03, diameterBottom: 0.34, tessellation: 5 }, scene);
      mesh.position = position.add(new Vector3(0, 0.48, 0));
      mesh.material = reedMaterial;
      const glowRing = MeshBuilder.CreateTorus(`quest-reed-ring-${index}`, { diameter: 0.72, thickness: 0.045, tessellation: 10 }, scene);
      glowRing.position = position.add(new Vector3(0, 0.055, 0));
      glowRing.rotation.x = Math.PI / 2;
      glowRing.material = reedMaterial;
      const token = buildIllustratedGroundMarker(scene, `quest-reed-token-${index}`, RIVER_REED_TOKEN_URL, position.add(new Vector3(0, 0.045, 0)), 1.35);
      token.setEnabled(false);
      return { kind: definition.kind, mesh, position, collected: false };
    }

    const mesh = MeshBuilder.CreateSphere(`quest-stone-${index}`, { diameter: 0.7, segments: 5 }, scene);
    mesh.scaling.y = 0.48;
    mesh.position = position.add(new Vector3(0, 0.18, 0));
    mesh.material = stoneMaterial;
    const glowRing = MeshBuilder.CreateTorus(`quest-stone-ring-${index}`, { diameter: 0.68, thickness: 0.04, tessellation: 10 }, scene);
    glowRing.position = position.add(new Vector3(0, 0.055, 0));
    glowRing.rotation.x = Math.PI / 2;
    glowRing.material = stoneMaterial;
    const token = buildIllustratedGroundMarker(scene, `quest-stone-token-${index}`, SMOOTH_STONE_TOKEN_URL, position.add(new Vector3(0, 0.045, 0)), 1.15);
    token.setEnabled(false);
    return { kind: definition.kind, mesh, position, collected: false };
  });
}

function buildDungeonPreview(scene: Scene, seed: number): DungeonPreviewRuntime {
  const dungeonPlan = createFirstDungeon(seed);
  const layout = createFirstDungeonWorldLayout(dungeonPlan);
  const root = new TransformNode("first-dungeon-preview", scene);
  const origin = toWorldPosition(3, 3);
  const floorMaterial = createMaterial(scene, "dungeon-floor", "#17332F", "#0B1514");
  const wallMaterial = createMaterial(scene, "dungeon-wall", "#2E554E", "#102522");
  const goldMaterial = createMaterial(scene, "dungeon-gold", "#D7AE5B", "#4D3515");
  floorMaterial.disableLighting = true;
  wallMaterial.disableLighting = true;
  goldMaterial.disableLighting = true;

  layout.rooms.forEach((room) => {
    const floor = MeshBuilder.CreateBox(`dungeon-floor-${room.roomId}`, { width: room.halfExtent.x * 2, height: 0.12, depth: room.halfExtent.z * 2 }, scene);
    floor.position = origin.add(new Vector3(room.center.x, -0.06, room.center.z));
    floor.material = floorMaterial;
    floor.parent = root;
    const wallThickness = 0.16;
    const wallHeight = 1.3;
    const wallNorth = MeshBuilder.CreateBox(`dungeon-wall-north-${room.roomId}`, { width: room.halfExtent.x * 2, height: wallHeight, depth: wallThickness }, scene);
    wallNorth.position = origin.add(new Vector3(room.center.x, wallHeight / 2, room.center.z - room.halfExtent.z));
    wallNorth.material = wallMaterial;
    wallNorth.parent = root;
    const wallSouth = MeshBuilder.CreateBox(`dungeon-wall-south-${room.roomId}`, { width: room.halfExtent.x * 2, height: wallHeight, depth: wallThickness }, scene);
    wallSouth.position = origin.add(new Vector3(room.center.x, wallHeight / 2, room.center.z + room.halfExtent.z));
    wallSouth.material = wallMaterial;
    wallSouth.parent = root;
    const wallWest = MeshBuilder.CreateBox(`dungeon-wall-west-${room.roomId}`, { width: wallThickness, height: wallHeight, depth: room.halfExtent.z * 2 }, scene);
    wallWest.position = origin.add(new Vector3(room.center.x - room.halfExtent.x, wallHeight / 2, room.center.z));
    wallWest.material = wallMaterial;
    wallWest.parent = root;
    const wallEast = MeshBuilder.CreateBox(`dungeon-wall-east-${room.roomId}`, { width: wallThickness, height: wallHeight, depth: room.halfExtent.z * 2 }, scene);
    wallEast.position = origin.add(new Vector3(room.center.x + room.halfExtent.x, wallHeight / 2, room.center.z));
    wallEast.material = wallMaterial;
    wallEast.parent = root;
  });

  const door = MeshBuilder.CreateBox("dungeon-locked-door", { width: 1.2, height: 1.8, depth: 0.22 }, scene);
  door.position = origin.add(new Vector3(layout.doorPosition.x, 0.9, layout.doorPosition.z));
  door.material = goldMaterial;
  door.parent = root;
  const chest = MeshBuilder.CreateBox("dungeon-treasure-chest", { width: 0.9, height: 0.45, depth: 0.6 }, scene);
  chest.position = origin.add(new Vector3(layout.chestPosition.x, 0.28, layout.chestPosition.z));
  chest.material = goldMaterial;
  chest.parent = root;
  const key = MeshBuilder.CreateTorus("dungeon-key-marker", { diameter: 0.34, thickness: 0.07, tessellation: 8 }, scene);
  key.position = origin.add(new Vector3(layout.keyPosition.x, 1.12, layout.keyPosition.z));
  key.rotation.x = Math.PI / 2;
  key.material = goldMaterial;
  key.parent = root;

  const visualMaterials = createDungeonVisualMaterials(scene);
  const enemies: { name: "Skulltula" | "Moblin" | "Dungeon Boss"; root: TransformNode }[] = [];
  layout.encounters.forEach((placement) => {
    const visual = buildDungeonEnemyVisual(scene, placement.name, visualMaterials);
    visual.root.position = origin.add(new Vector3(placement.position.x, 0, placement.position.z));
    visual.root.parent = root;
    enemies.push({ name: placement.name, root: visual.root });
  });
  return { root, origin, key, chest, door, enemies };
}

function buildRiverSpineTerrain(scene: Scene, seed: number): RiverTerrainRuntime {
  // The layout module validates reachability and throws on an unplayable world;
  // the tiles it returns are the tiles rendered below, with no substitution here.
  const layout = resolveFoundingLoopLayout({
    seed,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    spawnTile: PLAYER_SPAWN_TILE,
    preferredCampTile: FOUNDING_CAMP_TILE,
    reedCount: REQUIRED_REED_NODES,
    stoneCount: REQUIRED_STONE_NODES,
  });
  const map = layout.map;
  buildPaintedTerrainPlate(scene);
  buildRiverArtDetails(scene, deriveRiverArtDirection(map).details);
  buildFoundingCamp(scene, layout.campTile);
  const campPosition = toWorldPosition(layout.campTile.x, layout.campTile.y);
  const beaconPosition = toWorldPosition(layout.beaconTile.x, layout.beaconTile.y);
  const beacon = buildTideglassBeacon(scene, beaconPosition);
  buildTideglassRoute(scene, toWorldPosition(PLAYER_SPAWN_TILE.x, PLAYER_SPAWN_TILE.y), beaconPosition);
  const motes = buildRiverMotes(scene, beaconPosition, map.seed);
  return {
    worldSeed: map.seed,
    waterMaterials: [],
    beacon,
    beaconPosition,
    motes,
    gatherPlacements: layout.gatherPlacements,
    campPosition,
  };
}

export function createAurastriaScene(
  engine: Engine,
  canvas: HTMLCanvasElement,
  worldSeed: number = DEFAULT_WORLD_SEED,
): AurastriaSceneHandle {
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
    vitality: 3,
    wispHealth: 3,
    strikeReady: true,
    rollReady: true,
    paused: false,
  };

  const playerVisual = buildHumanoidCharacter(scene, "tidewalker", {
    cloak: "#1D5C59",
    trim: "#EBC563",
    skin: "#B97855",
    hair: "#2A211D",
    accent: "#42D1C2",
  });
  const player = playerVisual.root;
  player.position = toWorldPosition(10, 14);
  player.position.y = 0;
  const playerCore = playerVisual.marker;
  const playerChevron = playerVisual.heading;
  const playerToken = buildIllustratedGroundMarker(scene, "tidewalker-token", TIDEWALKER_TOKEN_URL, player.position.add(new Vector3(0, 0.055, 0)), 1.65);
  playerToken.setEnabled(false);

  const camera = new ArcRotateCamera("river-spine-camera", -Math.PI / 2, 0.64, 26, player.position.clone(), scene);
  camera.lowerRadiusLimit = 20;
  camera.upperRadiusLimit = 32;
  camera.lowerBetaLimit = 0.52;
  camera.upperBetaLimit = 0.82;
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

  const terrainRuntime = buildRiverSpineTerrain(scene, worldSeed);
  const dungeonPreview = buildDungeonPreview(scene, worldSeed);
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reducedMotion) {
    terrainRuntime.motes.forEach((mote) => mote.mesh.setEnabled(false));
  }
  const beaconLight = new PointLight("tideglass-beacon-light", terrainRuntime.beaconPosition.add(new Vector3(0, 2.3, 0)), scene);
  beaconLight.diffuse = Color3.FromHexString("#54DDD8");
  beaconLight.intensity = 1.1;
  beaconLight.range = 6.2;
  // Bound per-pixel lighting cost. The hemispheric fill and directional key are the only lights
  // allowed to touch arbitrary geometry; each glow light below is restricted to the meshes it is
  // meant to affect, so adding scenery can never silently multiply lighting work.
  beaconLight.includedOnlyMeshes = [terrainRuntime.beacon];

  const hearthLight = new PointLight("camp-hearth-light", terrainRuntime.campPosition.add(new Vector3(0.25, 0.72, 1.95)), scene);
  hearthLight.diffuse = Color3.FromHexString("#FFB64D");
  hearthLight.intensity = 0.78;
  hearthLight.range = 5;
  hearthLight.includedOnlyMeshes = scene.meshes.filter((mesh) => mesh.name.startsWith("camp-"));
  const gatherNodes = buildGatherNodes(scene, terrainRuntime.gatherPlacements);
  const riverWispRuntime = buildRiverWisp(scene);
  riverWispRuntime.light.includedOnlyMeshes = [riverWispRuntime.mesh, riverWispRuntime.halo];
  const campPosition = terrainRuntime.campPosition;
  const campGuide = buildHumanoidCharacter(scene, "camp-guide", {
    cloak: "#7A4B38",
    trim: "#D6B66A",
    skin: "#A9674D",
    hair: "#241C19",
    accent: "#D08A5A",
  });
  campGuide.root.position = campPosition.add(new Vector3(1.45, 0, 1.12));
  campGuide.root.rotation.y = Math.PI * 0.82;
  const pressed = new Set<string>();
  const movementKeys = new Set<string>(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"]);
  let quest = createFoundingQuest();
  let renderedFrames = 0;
  let renderBudgetLogged = false;
  const frameBudget = new FrameBudgetCollector();
  /** Scratch vector reused by the per-frame movement path to avoid allocation churn. */
  const moveScratch = new Vector3(0, 0, 0);
  /** Scratch input vector reused by the per-frame movement read. */
  const inputScratch = { x: 0, y: 0 };
  /** Wall-clock cost of the scene's own per-frame update work, used to separate
   *  scene-bound frames from presentation/refresh-bound frames. */
  const sceneCpuSamples: number[] = [];
  const medianOf = (values: readonly number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  let wasInteractPressed = false;
  let wasGatherPressed = false;
  let wasStrikePressed = false;
  let wasRollPressed = false;
  let wasPausePressed = false;
  let beaconArrivalStartedAt: number | undefined;
  let wasNearBeacon = false;
  let lastActionHint = hud.actionHint;
  let touchMove: Readonly<{ x: number; y: number }> | null = null;
  let lastNavigationUpdateAt = 0;
  let riverWisp: RiverWispState = createRiverWisp();
  let playerVitality = 3;
  let strikeCooldownEndsAt = 0;
  let rollCooldownEndsAt = 0;
  let dungeonRuntime: DungeonRuntimeState = createDungeonRuntime(worldSeed);

  const syncWispEncounter = () => {
    const active = quest.step === "settle-wisp" && riverWisp.phase !== "defeated";
    riverWispRuntime.mesh.setEnabled(active);
    riverWispRuntime.halo.setEnabled(active);
    riverWispRuntime.light.setEnabled(active);
  };
  syncWispEncounter();

  const syncPlayerMarker = () => {
    // The humanoid's marker and heading are parented to the player root, so only
    // the legacy illustrated token needs an explicit world-space update.
    playerToken.position.set(player.position.x, 0.055, player.position.z);
    playerToken.rotation.y = player.rotation.y;
    playerCore.position.y = 0.05;
    playerChevron.position.set(0, 0.08, 0.52);
    playerChevron.rotation.y = Math.PI;
  };

  const currentNavigation = () => beaconNavigation(
    { x: player.position.x, z: player.position.z },
    { x: terrainRuntime.beaconPosition.x, z: terrainRuntime.beaconPosition.z },
  );
  const isStrikeReady = () => performance.now() >= strikeCooldownEndsAt;
  const isPlayerRollReady = () => isRollReady(performance.now(), rollCooldownEndsAt);
  const worldBounds = {
    minX: -MAP_WIDTH * TILE_WORLD_SIZE / 2 + 0.6,
    maxX: MAP_WIDTH * TILE_WORLD_SIZE / 2 - 0.6,
    minZ: -MAP_HEIGHT * TILE_WORLD_SIZE / 2 + 0.6,
    maxZ: MAP_HEIGHT * TILE_WORLD_SIZE / 2 - 0.6,
  } as const;
  const currentObjective = () => quest.step === "settle-wisp" && riverWisp.phase !== "defeated"
    ? "Settle the river wisp before returning to camp"
    : foundingObjective(quest);
  hud = { ...hud, objective: currentObjective(), navigation: currentNavigation() };

  const publishHud = (actionHint: string) => {
    hud = {
      objective: currentObjective(),
      progress: foundingProgress(quest),
      actionHint,
      inventory: quest.inventory,
      navigation: currentNavigation(),
      vitality: playerVitality,
      wispHealth: riverWisp.health,
      strikeReady: isStrikeReady(),
      rollReady: isPlayerRollReady(),
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

  const dungeonActionHint = () => {
    const playerPosition = { x: player.position.x - dungeonPreview.origin.x, z: player.position.z - dungeonPreview.origin.z };
    const distanceTo = (point: Readonly<{ x: number; z: number }>) => Math.hypot(playerPosition.x - point.x, playerPosition.z - point.z);
    if (dungeonRuntime.run.currentRoomId === dungeonRuntime.plan.keyRoomId && dungeonRuntime.run.keys === 0 && distanceTo(dungeonRuntime.layout.keyPosition) <= 1.8) return "Dungeon key nearby. Press E / X to collect it.";
    if (dungeonRuntime.run.currentRoomId === dungeonRuntime.plan.keyRoomId && !dungeonRuntime.run.openedDoor && distanceTo(dungeonRuntime.layout.doorPosition) <= 2.1) return "The locked threshold answers the key. Press E / X to open it.";
    if (dungeonRuntime.run.currentRoomId === "treasure" && !dungeonRuntime.run.openedChestIds.includes("first-dungeon-chest") && distanceTo(dungeonRuntime.layout.chestPosition) <= 1.8) return "Treasure chest nearby. Press E / X to open it.";
    if (dungeonRuntime.run.currentRoomId === dungeonRuntime.plan.bossRoomId && !dungeonRuntime.run.bossDefeated) return "Dungeon Boss domain. Strike when the opening appears.";
    return undefined;
  };

  const dungeonEventMessage = (event: DungeonRuntimeState["lastEvent"]) => {
    if (event === "key-collected") return "A small key answers from the dungeon’s dark alcove.";
    if (event === "door-opened") return "The Tideglass key opens the sealed dungeon threshold.";
    if (event === "chest-opened") return "The treasure chest opens; the river road grows richer.";
    if (event === "boss-defeated") return "The dungeon boss falls, and the first domain grows quiet.";
    return undefined;
  };

  const syncDungeonPreview = () => {
    dungeonPreview.key.setEnabled(dungeonRuntime.run.keys === 0);
    dungeonPreview.door.setEnabled(!dungeonRuntime.run.openedDoor);
    dungeonPreview.chest.scaling.y = dungeonRuntime.run.openedChestIds.includes("first-dungeon-chest") ? 1.16 : 1;
    dungeonPreview.enemies.forEach((visual) => {
      const state = dungeonRuntime.enemies.find((enemy) => enemy.name === visual.name)?.state;
      if (!state) return;
      visual.root.setEnabled(state.phase !== "defeated");
      visual.root.scaling.setAll(state.phase === "windup" ? 1.08 : state.phase === "recover" ? 0.94 : 1);
      visual.root.position.y = state.phase === "strike" ? 0.16 : state.phase === "approach" ? 0.04 : 0;
    });
  };

  const stepDungeon = (deltaMs: number, playerStrike: boolean, interact: boolean) => {
    const previousHealth = dungeonRuntime.enemies.reduce((total, enemy) => total + enemy.state.health, 0);
    dungeonRuntime = stepDungeonRuntime(dungeonRuntime, {
      playerPosition: { x: player.position.x - dungeonPreview.origin.x, z: player.position.z - dungeonPreview.origin.z },
      deltaMs,
      playerStrike,
      interact,
    });
    syncDungeonPreview();
    const eventMessage = dungeonEventMessage(dungeonRuntime.lastEvent);
    if (eventMessage) events.emit("status", eventMessage);
    const currentHealth = dungeonRuntime.enemies.reduce((total, enemy) => total + enemy.state.health, 0);
    return { event: dungeonRuntime.lastEvent, enemyHit: currentHealth < previousHealth };
  };

  syncDungeonPreview();

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
    if (quest.step === "return-to-camp" || quest.step === "complete") {
      riverWisp = { phase: "defeated", health: 0, phaseElapsedMs: 0 };
    }
    syncWispEncounter();
    publishHud("Journey restored. Follow the river’s living light.");
    events.emit("status", "Journey restored from the river archive.");
  };

  const attemptInteract = () => {
    const dungeonStep = stepDungeon(0, false, true);
    if (dungeonStep.event !== "none") return;
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
        : quest.step === "settle-wisp"
          ? "The camp asks you to settle the river wisp before carrying these materials home."
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
    publishHud(quest.step === "settle-wisp"
      ? "Materials complete. Settle the river wisp, then return to Founding Camp."
      : "Continue gathering beside the river; every material is recorded for the shared camp.");
    events.emit("status", `Collected ${label}. ${foundingProgress(quest)}.`);
  };

  const attemptStrike = () => {
    const dungeonStep = stepDungeon(0, true, false);
    if (dungeonStep.enemyHit || dungeonStep.event === "boss-defeated") {
      publishHud(dungeonStep.event === "boss-defeated" ? "The dungeon boss is defeated." : "The dungeon enemy recoils from the river-staff.");
      return;
    }
    if (quest.step !== "settle-wisp") {
      events.emit("status", "The river staff waits for the Tideglass and camp materials to name this current’s purpose.");
      return;
    }
    if (riverWisp.phase === "defeated") {
      events.emit("status", "The river wisp has dissolved into harmless Tideglass light.");
      return;
    }
    if (!isStrikeReady()) {
      events.emit("status", "Your river-staff is recovering. Hold your ground for a breath.");
      return;
    }
    strikeCooldownEndsAt = performance.now() + 360;
    const distance = Vector3.Distance(player.position, riverWispRuntime.mesh.position);
    const result = stepRiverWisp(riverWisp, { distanceToPlayer: distance, deltaMs: 0, playerStrike: true });
    riverWisp = result.state;
    if (result.state.health < hud.wispHealth) {
      if (result.state.phase === "defeated") {
        quest = settleRiverWisp(quest);
        syncWispEncounter();
        publishHud("The river is quiet. Return the gathered materials to Founding Camp.");
        events.emit("status", "River wisp settled. The camp recognizes your steady hand and waits for your return.");
      } else {
        publishHud(`River wisp steadied. ${result.state.health} breaths of turbulence remain.`);
        events.emit("status", "Your river-staff meets the wisp’s current.");
      }
      return;
    }
    publishHud("Your strike finds only water. Move closer to the river wisp.");
  };

  const attemptRoll = () => {
    const gamepad = navigator.getGamepads?.()[0] ?? undefined;
    const result = resolveRoll({
      origin: { x: player.position.x, z: player.position.z },
      direction: touchMove ?? combinedMoveDirection(pressed, gamepad),
      bounds: worldBounds,
      nowMs: performance.now(),
      cooldownEndsAtMs: rollCooldownEndsAt,
    });
    if (!result.ok) {
      events.emit("status", rollRejectionMessage(result.reason));
      return;
    }
    rollCooldownEndsAt = result.cooldownEndsAtMs;
    player.position.x = result.position.x;
    player.position.z = result.position.z;
    player.rotation.y = result.headingRadians;
    syncPlayerMarker();
    camera.target.copyFrom(player.position);
    lastNavigationUpdateAt = 0;
    publishNavigation(performance.now());
    events.emit("status", "The explorer rolls clear along the riverbank.");
  };

  const triggerAction = (action: "interact" | "gather" | "strike" | "roll" | "pause") => {
    if (action === "pause") {
      setPaused(!hud.paused);
      return;
    }
    if (hud.paused) return;
    if (action === "interact") attemptInteract();
    if (action === "gather") attemptGather();
    if (action === "strike") attemptStrike();
    if (action === "roll") attemptRoll();
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
    if (isKeyboardAction("strike", event.code)) {
      event.preventDefault();
      if (!event.repeat) {
        attemptStrike();
      }
      return;
    }
    if (isKeyboardAction("roll", event.code)) {
      event.preventDefault();
      if (!event.repeat) {
        attemptRoll();
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
    if (!renderBudgetLogged) {
      // Diagnostics only run until the budget sample completes, so production
      // frames pay nothing for measurement.
      const sceneUpdateStartedAt = performance.now();
      scene.onAfterRenderObservable.addOnce(() => {
        if (sceneCpuSamples.length < 200) {
          sceneCpuSamples.push(performance.now() - sceneUpdateStartedAt);
        }
      });
    }
    if (!renderBudgetLogged) {
      const sample = frameBudget.record(engine.getDeltaTime());
      if (sample) {
        renderBudgetLogged = true;
        console.info("[aurastria:render-budget]", {
          ...sample,
          budgetMs: FRAME_BUDGET_MS,
          activeMeshes: scene.getActiveMeshes().length,
          totalMeshes: scene.meshes.length,
          drawCallsCumulative: engine._drawCalls?.current ?? null,
          drawCallsPerFrame: engine._drawCalls?.current !== undefined
            ? Number((engine._drawCalls.current / Math.max(1, renderedFrames)).toFixed(1))
            : null,
          lights: scene.lights.length,
          textures: scene.textures.length,
          materials: scene.materials.length,
          ambientMotes: terrainRuntime.motes.length,
          // If the scene's own CPU work per frame is a small fraction of the frame
          // interval, the frame time is presentation/refresh-bound, not scene-bound.
          sceneCpuMedianMs: Number(medianOf(sceneCpuSamples).toFixed(3)),
          sceneCpuShareOfFrame: sample.medianFrameMs > 0
            ? Number(((medianOf(sceneCpuSamples) / sample.medianFrameMs) * 100).toFixed(1))
            : null,
        });
      }
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
    const strikePressed = isGamepadActionPressed("strike", gamepad);
    const rollPressed = isGamepadActionPressed("roll", gamepad);
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
    if (!hud.paused && strikePressed && !wasStrikePressed) {
      attemptStrike();
    }
    if (!hud.paused && rollPressed && !wasRollPressed) {
      attemptRoll();
    }
    wasInteractPressed = interactPressed;
    wasGatherPressed = gatherPressed;
    wasStrikePressed = strikePressed;
    wasRollPressed = rollPressed;
    if (hud.paused) {
      return;
    }

    stepDungeon(engine.getDeltaTime(), false, false);
    const dungeonHint = dungeonActionHint();
    if (dungeonHint) publishActionHint(dungeonHint);

    if (quest.step === "settle-wisp" && riverWisp.phase !== "defeated") {
      const wispDistance = Vector3.Distance(player.position, riverWispRuntime.mesh.position);
      const result = stepRiverWisp(riverWisp, {
        distanceToPlayer: wispDistance,
        deltaMs: engine.getDeltaTime(),
        playerStrike: false,
      });
      riverWisp = result.state;
      if (riverWisp.phase === "approach" && wispDistance > 1.35) {
        const moveScale = Math.min(1, engine.getDeltaTime() / 1000 * 1.1 / wispDistance);
        riverWispRuntime.mesh.position.x += (player.position.x - riverWispRuntime.mesh.position.x) * moveScale;
        riverWispRuntime.mesh.position.z += (player.position.z - riverWispRuntime.mesh.position.z) * moveScale;
        riverWispRuntime.halo.position.x = riverWispRuntime.mesh.position.x;
        riverWispRuntime.halo.position.z = riverWispRuntime.mesh.position.z;
        riverWispRuntime.light.position.copyFrom(riverWispRuntime.mesh.position);
      }
      if (!reducedMotion) {
        riverWispRuntime.halo.rotation.z += engine.getDeltaTime() * 0.0018;
        const haloPulse = 0.92 + Math.sin(elapsedSeconds * 2.2) * 0.08;
        riverWispRuntime.halo.scaling.setAll(haloPulse);
      }
      if (result.playerDamage > 0) {
        playerVitality = Math.max(0, playerVitality - result.playerDamage);
        if (playerVitality === 0) {
          const recovery = recoverFromRiverWisp(quest);
          if (recovery.returnToCamp) {
            const sceneRecovery = applySettleWispSafeReturn({
              quest: recovery.quest,
              vitality: recovery.vitality,
              playerPosition: { x: player.position.x, y: player.position.y, z: player.position.z },
            }, { x: campPosition.x, y: campPosition.y, z: campPosition.z });
            quest = sceneRecovery.quest;
            playerVitality = sceneRecovery.vitality;
            player.position.set(sceneRecovery.playerPosition.x, sceneRecovery.playerPosition.y, sceneRecovery.playerPosition.z);
            syncPlayerMarker();
            publishHud("The camp steadies you. Return to the river when ready.");
            events.emit("status", "The river carries you safely back to camp. No journey progress was lost.");
          } else {
            playerVitality = recovery.vitality;
          }
        } else {
          publishHud("The river wisp’s current stings. Keep space, then strike when ready.");
        }
      }
    }
    if (hud.strikeReady !== isStrikeReady() || hud.rollReady !== isPlayerRollReady()) {
      hud = {
        ...hud,
        strikeReady: isStrikeReady(),
        rollReady: isPlayerRollReady(),
        vitality: playerVitality,
        wispHealth: riverWisp.health,
      };
      events.emit("hud", hud);
    }

    const inputDirection = touchMove ?? writeCombinedMoveDirection(inputScratch, pressed, gamepad);
    // Reuse a scratch vector: this runs every frame, and a fresh Vector3 per frame
    // is pure garbage-collector pressure for no benefit.
    const direction = moveScratch.set(inputDirection.x, 0, inputDirection.y);
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
    movePlayerTo: ({ x, z }) => {
      player.position.x = Math.max(worldBounds.minX, Math.min(worldBounds.maxX, x));
      player.position.z = Math.max(worldBounds.minZ, Math.min(worldBounds.maxZ, z));
      syncPlayerMarker();
      publishNavigation(performance.now());
      camera.target.copyFrom(player.position);
    },
    getObjectiveSites: () => ({
      camp: { x: campPosition.x, z: campPosition.z },
      beacon: { x: terrainRuntime.beaconPosition.x, z: terrainRuntime.beaconPosition.z },
      wisp: { x: riverWispRuntime.mesh.position.x, z: riverWispRuntime.mesh.position.z },
      gatherNodes: gatherNodes.map((node) => ({
        kind: node.kind,
        x: node.position.x,
        z: node.position.z,
        collected: node.collected,
      })),
    }),
    getDungeonSites: () => {
      const worldPoint = (point: Readonly<{ x: number; z: number }>) => ({
        x: dungeonPreview.origin.x + point.x,
        z: dungeonPreview.origin.z + point.z,
      });
      const room = (roomId: string) => {
        const layoutRoom = dungeonRuntime.layout.rooms.find((candidate) => candidate.roomId === roomId);
        return worldPoint(layoutRoom?.center ?? { x: 0, z: 0 });
      };
      return {
        entry: room("entry"),
        key: room(dungeonRuntime.plan.keyRoomId),
        cache: room("cache"),
        gate: room("gate"),
        treasure: room("treasure"),
        boss: room(dungeonRuntime.plan.bossRoomId),
      };
    },
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
