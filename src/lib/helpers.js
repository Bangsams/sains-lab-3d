// Utilitas kecil untuk menyusun objek 3D di setiap topik.
import * as THREE from 'three';

export const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, ...opts });

export function mesh(geo, material, { x = 0, y = 0, z = 0, shadow = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

export function ground(scene, { size = 30, color = 0xcfd8d3 } = {}) {
  // lantai sedikit digelapkan agar serasi dengan tema langit malam
  const g = mesh(new THREE.CircleGeometry(size, 64), mat(new THREE.Color(color).multiplyScalar(0.62), { roughness: 1 }), { shadow: false });
  g.rotation.x = -Math.PI / 2;
  scene.add(g);
  return g;
}

// Label teks yang selalu menghadap kamera.
export function label(text, { size = 0.5, color = '#e8eef9', bg = 'rgba(9,16,32,0.86)' } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, transparent: true }));
  sprite.renderOrder = 10;
  sprite.setText = (t) => {
    if (t === sprite.userData.text) return;
    sprite.userData.text = t;
    const font = '600 44px "Familjen Grotesk", system-ui, sans-serif';
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(t).width) + 36;
    canvas.width = w; canvas.height = 68;
    ctx.font = font;
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.roundRect(0, 0, w, 68, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(95,214,196,0.55)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = color; ctx.textBaseline = 'middle';
    ctx.fillText(t, 18, 36);
    sprite.material.map?.dispose();
    sprite.material.map = new THREE.CanvasTexture(canvas);
    sprite.material.map.colorSpace = THREE.SRGBColorSpace;
    sprite.material.needsUpdate = true;
    sprite.scale.set((size * w) / 68, size, 1);
  };
  sprite.setText(text);
  return sprite;
}

export function arrow(dir, origin, length, color) {
  const a = new THREE.ArrowHelper(new THREE.Vector3(...dir).normalize(), new THREE.Vector3(...origin), length, color, 0.35, 0.22);
  a.setLen = (len) => a.setLength(Math.max(len, 0.01), Math.min(0.35, len * 0.4), Math.min(0.22, len * 0.3));
  return a;
}

// Kumpulan partikel sederhana (gelembung, molekul, gas buang).
export function particles(count, color, size = 0.08, opacity = 0.9) {
  const geo = new THREE.SphereGeometry(size, 8, 6);
  const m = new THREE.InstancedMesh(geo, mat(color, { transparent: opacity < 1, opacity }), count);
  m.userData.dummy = new THREE.Object3D();
  m.setAt = (i, x, y, z, s = 1) => {
    const d = m.userData.dummy;
    d.position.set(x, y, z); d.scale.setScalar(s); d.updateMatrix();
    m.setMatrixAt(i, d.matrix);
  };
  return m;
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
