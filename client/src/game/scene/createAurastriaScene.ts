import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

export interface AurastriaSceneHandle {
  readonly scene: Scene;
  dispose(): void;
}

export function createAurastriaScene(engine: Engine, canvas: HTMLCanvasElement): AurastriaSceneHandle {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.021, 0.071, 0.055, 1);

  const camera = new ArcRotateCamera("river-spine-camera", -Math.PI / 2, 1.08, 25, Vector3.Zero(), scene);
  camera.lowerRadiusLimit = 12;
  camera.upperRadiusLimit = 32;
  camera.lowerBetaLimit = 0.65;
  camera.upperBetaLimit = 1.34;
  camera.wheelPrecision = 45;
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("river-dawn-light", new Vector3(0.2, 1, -0.25), scene);
  light.intensity = 1.25;
  light.diffuse = Color3.FromHexString("#F3D9A2");
  light.groundColor = Color3.FromHexString("#173B32");

  const ground = MeshBuilder.CreateGround("river-spine-ground", { width: 44, height: 32, subdivisions: 2 }, scene);
  const groundMaterial = new StandardMaterial("river-spine-ground-mat", scene);
  groundMaterial.diffuseColor = Color3.FromHexString("#315F44");
  groundMaterial.specularColor = Color3.Black();
  ground.material = groundMaterial;

  const river = MeshBuilder.CreateGround("river-channel", { width: 6, height: 34, subdivisions: 1 }, scene);
  river.position.y = 0.025;
  const riverMaterial = new StandardMaterial("river-channel-mat", scene);
  riverMaterial.diffuseColor = Color3.FromHexString("#3B8490");
  riverMaterial.emissiveColor = Color3.FromHexString("#164650");
  riverMaterial.specularColor = Color3.FromHexString("#B4E5DE");
  river.material = riverMaterial;

  const marker = MeshBuilder.CreateCylinder("founding-camp-marker", { height: 1.4, diameterTop: 0, diameterBottom: 1.5, tessellation: 5 }, scene);
  marker.position = new Vector3(-6, 0.7, 2);
  const markerMaterial = new StandardMaterial("founding-camp-marker-mat", scene);
  markerMaterial.diffuseColor = Color3.FromHexString("#C9973C");
  markerMaterial.emissiveColor = Color3.FromHexString("#35230D");
  markerMaterial.specularColor = Color3.Black();
  marker.material = markerMaterial;

  return {
    scene,
    dispose: () => {
      camera.detachControl();
      scene.dispose();
    },
  };
}
