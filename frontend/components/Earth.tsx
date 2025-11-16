"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function Earth() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let renderer: THREE.WebGPURenderer | null = null;
    let animationFrameId: number;

    const init = async () => {
      const width = mountRef.current!.clientWidth || window.innerWidth;
      const height = mountRef.current!.clientHeight || window.innerHeight;

      // Scene & Camera
      const scene = new THREE.Scene();
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
      const normalMap = loader.load("/textures/8k_earth_normal_map.tif");
      const heightMap = loader.load("/textures/height_map.png");

      // Earth Material
      const earthMaterial = new THREE.MeshStandardMaterial({
        map: dayMap,
        normalMap: normalMap,
        displacementMap: heightMap,
        displacementScale: 0.05,
        metalness: 0.05,
        roughness: 0.95,
      });

      // Earth Mesh
      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1, 512, 512),
        earthMaterial
      );
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
      const lightA = new THREE.PointLight(0xffffff, 1, 20, 0.5);
      lightA.position.set(5, 3, 5);
      scene.add(lightA);
      const lightB = new THREE.PointLight(0xffffff, 1, 20, 0.5);
      lightB.position.set(-5, -3, 5);
      scene.add(lightB);
      const lightC = new THREE.PointLight(0xffffff, 1, 20, 0.5);
      lightC.position.set(5, -3, -5);
      scene.add(lightC);
      const lightD = new THREE.PointLight(0xffffff, 1, 20, 0.5);
      lightD.position.set(-5, 3, -5);
      scene.add(lightD);
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

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
    };
  }, []);

  return <div ref={mountRef} className="w-screen h-screen" />;
}
