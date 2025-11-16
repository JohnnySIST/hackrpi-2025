"use client";

import { useEffect, useRef, useState } from "react";
import Slider from '@mui/material/Slider';
import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { addHeatSpheres } from "./globePoints";

export default function Earth({ startDate = "2021-01-01", endDate = "2021-12-31", mode = "day" }: { startDate?: string; endDate?: string; mode?: 'day' | 'night' }) {
      const [grid, setGrid] = useState<number>(1);
      const [gridPreview, setGridPreview] = useState<number>(1);
      useEffect(() => {
        setGridPreview(grid);
      }, [grid]);
      const datasets = [
        { key: 'birdcollision', label: 'Bird Collision' },
        { key: 'caterpillar', label: 'Caterpillar' },
        { key: 'spider', label: 'Spider' },
      ];
      const [dataset, setDataset] = useState<'birdcollision' | 'caterpillar' | 'spider'>('birdcollision');
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const dayMapRef = useRef<THREE.Texture | null>(null);
  const nightMapRef = useRef<THREE.Texture | null>(null);
  const ambientRef = useRef<THREE.AmbientLight | null>(null);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    let renderer: THREE.WebGPURenderer | null = null;
    let animationFrameId: number;

    const init = async () => {
      const width = mountRef.current!.clientWidth || window.innerWidth;
      const height = mountRef.current!.clientHeight || window.innerHeight;

      // Scene & Camera
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 3);

      // Canvas + WebGPU Renderer
      const canvas = document.createElement("canvas");
      mountRef.current!.appendChild(canvas);

      renderer = new THREE.WebGPURenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      await renderer.init();

      // Orbit Controls
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = false;
      controls.rotateSpeed = 0.1;
      controls.enableZoom = true;
      controls.minDistance = 1.4;
      controls.maxDistance = 45;

      // Load Textures
      const loader = new THREE.TextureLoader();
      const dayMap = loader.load("/textures/8k_earth_daymap.jpg");
      const nightMap = loader.load("/textures/8k_earth_nightmap.jpg");
      dayMapRef.current = dayMap;
      nightMapRef.current = nightMap;
      const normalMap = loader.load("/textures/8k_earth_normal_map.tif");
      const heightMap = loader.load("/textures/height_map.png");

      // Earth Material
      const earthMaterial = mode === 'night'
        ? new THREE.MeshBasicMaterial({ map: nightMap })
        : new THREE.MeshStandardMaterial({
            map: dayMap,
            normalMap,
            displacementMap: heightMap,
            displacementScale: 0.03,
            metalness: 0.05,
            roughness: 0.95,
          });

      // Earth Mesh
      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1, 512, 512),
        earthMaterial
      );
      earthMeshRef.current = earth;
      scene.add(earth);

      // Background Universe Sphere
      const universeGeometry = new THREE.SphereGeometry(50, 64, 64);
      const universeMaterial = new THREE.MeshBasicMaterial({
        map: loader.load("/textures/8k_stars_milky_way.jpg"),
        side: THREE.BackSide,
      });
      const universe = new THREE.Mesh(universeGeometry, universeMaterial);
      scene.add(universe);

      // Lighting
      if (mode === 'night') {
        ambientRef.current = null;
        pointLightsRef.current = [];
      } else {
        const lights = [
          [5, 3, 5],
          [-5, -3, 5],
          [5, -3, -5],
          [-5, 3, -5],
        ].map(pos => {
          const light = new THREE.PointLight(0xffffff, 1, 20, 0.5);
          light.position.set(pos[0], pos[1], pos[2]);
          scene.add(light);
          return light;
        });
        pointLightsRef.current = lights;
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        ambientRef.current = ambient;
        scene.add(ambient);
      }

      // Animation Loop
      const animate = () => {
        if (!renderer) return;
        controls.update();
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();

      // Handle Resize
      const onResize = () => {
        const w = mountRef.current?.clientWidth || window.innerWidth;
        const h = mountRef.current?.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer!.setSize(w, h);
      };
      window.addEventListener("resize", onResize);
    };

    init();

    // Cleanup
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
      sceneRef.current = null;
      earthMeshRef.current = null;
    };
  }, []);

  // Update earth texture and ambient when mode changes
  useEffect(() => {
    if (!earthMeshRef.current || !dayMapRef.current || !nightMapRef.current) return;
    earthMeshRef.current.material = mode === 'night'
      ? new THREE.MeshBasicMaterial({ map: nightMapRef.current })
      : new THREE.MeshStandardMaterial({
          map: dayMapRef.current,
          normalMap: null,
          displacementMap: null,
          displacementScale: 0.03,
          metalness: 0.05,
          roughness: 0.95,
        });
    (earthMeshRef.current.material as any).needsUpdate = true;
    if (ambientRef.current) ambientRef.current.intensity = mode === 'night' ? 0 : 0.5;
    if (pointLightsRef.current && pointLightsRef.current.length) {
      for (const light of pointLightsRef.current) {
        light.intensity = mode === 'night' ? 0 : 1;
      }
    }
  }, [mode]);

  // Fetch and draw points when date changes
  useEffect(() => {
    if (!sceneRef.current) return;
    // Remove previous heat points only (keep earth and universe)
    const children = sceneRef.current.children;
    // Assume earth is first, universe is second, lights/ambient after
    // Remove all meshes that are not the earth or universe
    for (let i = children.length - 1; i >= 0; i--) {
      const obj = children[i];
      // Keep earth (SphereGeometry) and universe (SphereGeometry with large radius)
      if (
        obj instanceof THREE.Mesh &&
        obj.geometry instanceof THREE.SphereGeometry &&
        ((obj.geometry.parameters.radius === 1) || (obj.geometry.parameters.radius === 50))
      ) {
        continue;
      }
      // Keep lights and ambient
      if (
        obj instanceof THREE.Light ||
        obj instanceof THREE.AmbientLight
      ) {
        continue;
      }
      sceneRef.current.remove(obj);
    }
    fetch(`http://localhost:8000/${dataset}?start=${startDate}&end=${endDate}&grid=${grid*0.4}`)
      .then((res) => res.json())
      .then((data) => {
        addHeatSpheres(sceneRef.current!, data.points, 1, grid);
      });
  }, [startDate, endDate, dataset, grid]);

  return (
    <div className="w-screen h-screen relative" ref={mountRef}>
      <div style={{ position: 'absolute', right: 20, top: 20, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
          {datasets.map(ds => (
            <button
              key={ds.key}
              style={{
                padding: '8px 20px',
                background: dataset === ds.key ? '#d97706' : '#222',
                color: dataset === ds.key ? '#fff' : '#ccc',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px #0002',
                cursor: 'pointer',
                opacity: dataset === ds.key ? 1 : 0.7,
                transition: 'background 0.2s,color 0.2s',
              }}
              onClick={() => setDataset(ds.key as typeof dataset)}
            >
              {ds.label}
            </button>
          ))}
        </div>
        <div style={{ width: 280, marginTop: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24, whiteSpace: 'nowrap', transform: 'translateX(-20px)' }}>
          <span style={{ color: '#d97706', fontWeight: 700, fontSize: 18, minWidth: 80 }}>Grid Size</span>
          <Slider
            value={gridPreview}
            min={1}
            max={5}
            step={1}
            onChange={(_, val) => setGridPreview(val as number)}
            onChangeCommitted={(_, val) => setGrid(val as number)}
            valueLabelDisplay="off"
            sx={{
              width: '100%',
              height: 6,
              background: 'transparent',
              color: '#d97706',
              '& .MuiSlider-markLabel': { fontWeight: 700, fontSize: 18, color: '#d97706' },
              '& .MuiSlider-thumb': { backgroundColor: '#d97706' },
              '& .MuiSlider-track': { backgroundColor: '#d97706' },
              '& .MuiSlider-rail': { backgroundColor: '#ffe0b2' },
            }}
            marks={Array.from({length: 5}, (_, i) => ({
              value: i + 1,
              label: `${i + 1}`
            }))}
          />
        </div>
      </div>
    </div>
  );
}
