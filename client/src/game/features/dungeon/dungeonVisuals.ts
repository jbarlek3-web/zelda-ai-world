import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Material } from "@babylonjs/core/Materials/material";
import type { Node } from "@babylonjs/core/node";
import type { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { DungeonEnemyName } from "./dungeonEncounters";

export interface DungeonVisualMaterials {
  readonly shell: StandardMaterial;
  readonly skin: StandardMaterial;
  readonly accent: StandardMaterial;
  readonly eyes: StandardMaterial;
  readonly weapon: StandardMaterial;
}

export interface DungeonEnemyVisual {
  readonly root: TransformNode;
  readonly materials: DungeonVisualMaterials;
  readonly meshCount: number;
}

function material(scene: Scene, name: string, hex: string, emissiveHex?: string): StandardMaterial {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = Color3.FromHexString(hex);
  result.specularColor = Color3.Black();
  result.disableLighting = true;
  if (emissiveHex) result.emissiveColor = Color3.FromHexString(emissiveHex);
  return result;
}

export function createDungeonVisualMaterials(scene: Scene): DungeonVisualMaterials {
  return {
    shell: material(scene, "dungeon-shell", "#233E38"),
    skin: material(scene, "dungeon-skin", "#9B684C"),
    accent: material(scene, "dungeon-accent", "#C98D50", "#5D3320"),
    eyes: material(scene, "dungeon-eyes", "#63E6D3", "#63E6D3"),
    weapon: material(scene, "dungeon-weapon", "#6D7E78"),
  };
}

function attach<T extends { parent: Node | null; position: Vector3; rotation: Vector3; material: Material | null }>(mesh: T, root: TransformNode, materialValue: StandardMaterial): T {
  mesh.parent = root;
  mesh.material = materialValue;
  return mesh;
}

function buildSkulltula(scene: Scene, root: TransformNode, materials: DungeonVisualMaterials): number {
  const body = attach(MeshBuilder.CreateSphere("skulltula-body", { diameter: 0.92, segments: 6 }, scene), root, materials.shell);
  body.position.y = 0.72;
  const abdomen = attach(MeshBuilder.CreateSphere("skulltula-abdomen", { diameter: 0.72, segments: 6 }, scene), root, materials.accent);
  abdomen.position = new Vector3(0, 0.54, -0.38);
  const eye = attach(MeshBuilder.CreateSphere("skulltula-eye", { diameter: 0.16, segments: 5 }, scene), root, materials.eyes);
  eye.position = new Vector3(0, 0.82, 0.43);
  let count = 3;
  for (let index = 0; index < 8; index += 1) {
    const angle = index * (Math.PI * 2 / 8);
    const leg = attach(MeshBuilder.CreateCylinder(`skulltula-leg-${index}`, { height: 0.92, diameter: 0.075, tessellation: 5 }, scene), root, materials.shell);
    leg.position = new Vector3(Math.cos(angle) * 0.52, 0.42, Math.sin(angle) * 0.52);
    leg.rotation.z = Math.cos(angle) * 0.82;
    leg.rotation.x = Math.sin(angle) * 0.82;
    count += 1;
  }
  return count;
}

function buildMoblin(scene: Scene, root: TransformNode, materials: DungeonVisualMaterials): number {
  const torso = attach(MeshBuilder.CreateBox("moblin-torso", { width: 0.9, height: 1.1, depth: 0.55 }, scene), root, materials.skin);
  torso.position.y = 1.03;
  const head = attach(MeshBuilder.CreateSphere("moblin-head", { diameter: 0.7, segments: 6 }, scene), root, materials.skin);
  head.position.y = 1.82;
  const brow = attach(MeshBuilder.CreateBox("moblin-brow", { width: 0.62, height: 0.14, depth: 0.16 }, scene), root, materials.accent);
  brow.position = new Vector3(0, 1.89, 0.3);
  const eye = attach(MeshBuilder.CreateSphere("moblin-eye", { diameter: 0.1, segments: 5 }, scene), root, materials.eyes);
  eye.position = new Vector3(0.17, 1.79, 0.31);
  const armLeft = attach(MeshBuilder.CreateCylinder("moblin-arm-left", { height: 0.78, diameter: 0.18, tessellation: 5 }, scene), root, materials.skin);
  armLeft.position = new Vector3(-0.58, 1.03, 0);
  armLeft.rotation.z = -0.42;
  const armRight = attach(MeshBuilder.CreateCylinder("moblin-arm-right", { height: 0.78, diameter: 0.18, tessellation: 5 }, scene), root, materials.skin);
  armRight.position = new Vector3(0.58, 1.03, 0);
  armRight.rotation.z = 0.42;
  const club = attach(MeshBuilder.CreateCylinder("moblin-club", { height: 1.12, diameter: 0.17, tessellation: 6 }, scene), root, materials.weapon);
  club.position = new Vector3(0.94, 0.91, 0.08);
  club.rotation.z = -0.58;
  const tuskLeft = attach(MeshBuilder.CreateCylinder("moblin-tusk-left", { height: 0.25, diameterTop: 0.02, diameterBottom: 0.12, tessellation: 5 }, scene), root, materials.accent);
  tuskLeft.position = new Vector3(-0.18, 1.57, 0.32);
  tuskLeft.rotation.z = 0.35;
  const tuskRight = attach(MeshBuilder.CreateCylinder("moblin-tusk-right", { height: 0.25, diameterTop: 0.02, diameterBottom: 0.12, tessellation: 5 }, scene), root, materials.accent);
  tuskRight.position = new Vector3(0.18, 1.57, 0.32);
  tuskRight.rotation.z = -0.35;
  return 9;
}

function buildDungeonBoss(scene: Scene, root: TransformNode, materials: DungeonVisualMaterials): number {
  const body = attach(MeshBuilder.CreateCylinder("dungeon-boss-body", { height: 1.8, diameterTop: 1.15, diameterBottom: 1.45, tessellation: 7 }, scene), root, materials.shell);
  body.position.y = 1.08;
  const mask = attach(MeshBuilder.CreateSphere("dungeon-boss-mask", { diameter: 0.92, segments: 6 }, scene), root, materials.accent);
  mask.position = new Vector3(0, 2.12, 0.08);
  const eye = attach(MeshBuilder.CreateSphere("dungeon-boss-eye", { diameter: 0.2, segments: 5 }, scene), root, materials.eyes);
  eye.position = new Vector3(0, 2.14, 0.51);
  const crown = attach(MeshBuilder.CreateTorus("dungeon-boss-crown", { diameter: 1.3, thickness: 0.11, tessellation: 7 }, scene), root, materials.weapon);
  crown.position.y = 2.42;
  crown.rotation.x = Math.PI / 2;
  const aura = attach(MeshBuilder.CreateTorus("dungeon-boss-aura", { diameter: 1.9, thickness: 0.06, tessellation: 10 }, scene), root, materials.eyes);
  aura.position.y = 0.12;
  aura.rotation.x = Math.PI / 2;
  return 6;
}

export function buildDungeonEnemyVisual(scene: Scene, name: DungeonEnemyName, materials = createDungeonVisualMaterials(scene)): DungeonEnemyVisual {
  const root = new TransformNode(`dungeon-${name.toLowerCase().replaceAll(" ", "-")}-root`, scene);
  const meshCount = name === "Skulltula" ? buildSkulltula(scene, root, materials) : name === "Moblin" ? buildMoblin(scene, root, materials) : buildDungeonBoss(scene, root, materials);
  return { root, materials, meshCount };
}
