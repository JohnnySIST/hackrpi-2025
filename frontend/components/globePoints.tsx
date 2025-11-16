import * as THREE from "three";
import { max } from "three/tsl";

export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export type HeatPoint = {
  lat: number;
  lon: number;
  count: number;
  grid?: number;
};

export function computeHeatColor(t: number): THREE.Color {
  const color = new THREE.Color();
  // Yellow (1,1,0) to Red (1,0,0), deeper as t increases
  t = Math.max(0, Math.min(1, t));
  // As proportion increases, color becomes more red; above 5% is pure red
  t = Math.max(0, Math.min(1, t));
  const max_portion = 0.01;
  if (t > max_portion) {
    color.setRGB(1, 0, 0); // pure red
  } else {
    // yellow to red gradient for t in [0, max_portion]
    const k = t / max_portion;
    color.setRGB(1, 1 - k, 0);
  }
  // Optionally, keep brightness adjustment for visual depth
  const brightness = 0.2 + 0.8 * (1 - t);
  color.multiplyScalar(brightness);
  return color;
}

/**
 * Main function: add heat spheres to the earth scene
 */
export function addHeatSpheres(
  scene: THREE.Scene,
  points: HeatPoint[],
  earthRadius: number,
  grid?: number
) {
  if (!points || points.length === 0) return;

  // Filter out points with count < 10
  const filteredPoints = points.filter((p) => p.count >= 10);
  if (filteredPoints.length === 0) return;

  // Sort by count ascending
  filteredPoints.sort((a, b) => a.count - b.count);

  // Calculate total count for proportion
  const totalCount = filteredPoints.reduce((sum, p) => sum + p.count, 0);
  if (totalCount === 0) return;

  // Use shared geometry for better performance
  const baseGeo = new THREE.BoxGeometry(1, 1, 1);

  // Maximum proportion is 1 / filteredPoints.length
  const maxProportion = 100 / filteredPoints.length;

  filteredPoints.forEach((pt) => {
    const size = 0.014 * (grid ? grid : 1) * 0.4;

    // t is the proportion of this point's count to the total, normalized by maxProportion
    const t = (pt.count / totalCount) / maxProportion;
    const color = computeHeatColor(t);
    
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color.clone().multiplyScalar(0.3),
      transparent: true,
      opacity: 0.6, // 60% opacity
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(baseGeo, mat);

    // Position: on the earth surface + slightly raised to avoid z-fighting
    const pos = latLonToVector3(pt.lat, pt.lon, earthRadius);
    mesh.position.copy(pos);
    mesh.scale.set(size, size, size);

    // Orient cube to face the center (origin)
    mesh.lookAt(0, 0, 0);

    scene.add(mesh);
  });
}
