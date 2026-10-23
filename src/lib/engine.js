// Mesin 3D bersama: satu renderer, satu scene per topik.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Stage {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.05, 2000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.clock = new THREE.Clock();
    this.params = {};
    this.paused = false;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  resize() {
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.view) this.frame();
  }

  // Jarak kamera diperbesar di layar sempit (ponsel) agar objek tetap muat.
  frame() {
    const { camera = [6, 4, 8], target = [0, 1, 0] } = this.view;
    const fit = Math.max(1, 1.25 / this.camera.aspect);
    this.controls.target.set(...target);
    this.camera.position.set(...camera.map((c, i) => target[i] + (c - target[i]) * fit));
    this.controls.update();
  }

  load(topic, params) {
    if (this.scene) disposeScene(this.scene);
    this.scene = new THREE.Scene();
    this.params = params;
    this.t = 0;
    const hemi = new THREE.HemisphereLight(0xffffff, 0x445544, 0.9);
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(6, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
    this.scene.add(hemi, sun);
    this.view = topic.view || {};
    this.frame();
    this.sim = topic.scene({ THREE, scene: this.scene, camera: this.camera, sun, hemi, stage: this }) || {};
  }

  setParams(params) { this.params = params; }

  tick() {
    if (!this.scene) return;
    const dt = Math.min(this.clock.getDelta(), 0.05) * (this.paused ? 0 : this.reduced ? 0.25 : 1);
    this.t += dt;
    this.sim.update?.(this.params, this.t, dt);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

function disposeScene(scene) {
  scene.traverse((o) => {
    o.geometry?.dispose();
    const m = o.material;
    (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => { mm.map?.dispose(); mm.dispose(); });
  });
}
