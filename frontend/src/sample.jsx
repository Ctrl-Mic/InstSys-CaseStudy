import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Sample() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || mountRef.current.hasChildNodes()) return;

    // ==========================================
    // Load Visualizer Texture (Idk maybe if we will add texture someday)
    // ==========================================
    const texture = new THREE.TextureLoader().load("./images/graduation.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    // ==========================================
    // Set up the container to render visualizer
    // ==========================================
    const current = mountRef.current;
    const width = current.clientWidth;
    const height = current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
    camera.position.z = 100;
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor("#333333");
    current.appendChild(renderer.domElement);

    // ==========================================
    // Set up the audio visualizer
    // ==========================================
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const sound = new THREE.Audio(listener);

    // ==========================================
    // Loads audio
    // ==========================================
    const audioLoader = new THREE.AudioLoader();

    // ==========================================
    // Makes the actual visualizer
    // ==========================================
    const geometry = new THREE.IcosahedronGeometry(70, 10);
    const material = new THREE.MeshLambertMaterial({
      color: 0x404040,
      wireframe: true,
    });

    const sphere = new THREE.Mesh(geometry, material);

    // ==========================================
    // Visualizer lighting
    // ==========================================
    const light = new THREE.DirectionalLight("#ffffff", 1);
    light.position.set(50, 100, 50);
    const ambient = new THREE.AmbientLight("#ffffff", 0.1);
    scene.add(ambient);
    scene.add(light);
    scene.add(sphere);

    // ==========================================
    // We create the analyser once sound is ready
    // ==========================================
    let analyser; // declare outside animate
    let animationId;

    audioLoader.load(
      "./Lil Uzi Vert - Homecoming (Instrumental).mp3",
      function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1);

        analyser = new THREE.AudioAnalyser(sound, 32);

        const handleClick = () => {
          sound.play();
          animate(); // start animation after sound starts
          window.removeEventListener("click", handleClick);
        };

        window.addEventListener("click", handleClick);
      }
    );

    // ==========================================
    // Rotation + reactive scaling animation
    // ==========================================
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (analyser) {
        const avg = analyser.getAverageFrequency();
        console.log(avg);
        const scale = 1 + avg / 2000;
        const rotationSpeed = 0.001 + avg / 30000;
        sphere.scale.set(scale, scale, scale);

        const hue = avg / 256;
        const currentColor = new THREE.Color();
        sphere.material.color.getHSL(currentColor);
        const newHue = THREE.MathUtils.lerp(currentColor.h, hue, 0.1); // smooth color change
        sphere.material.color.setHSL(newHue, 0.8, 0.5);
        sphere.rotation.x += rotationSpeed;
        sphere.rotation.y += rotationSpeed;
      }

      sphere.rotation.x += 0.001;
      sphere.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // ==========================================
    // Removes duplicate and unmounts visualizer
    // ==========================================
    return () => {
      cancelAnimationFrame(animationId);
      current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen p-2 gap-2 bg-white">
      <div className="flex justify-center w-full p-2 rounded-2xl bg-gray-200">
        <span className="text-gray-600">
          This is a developer page / testing ground
        </span>
      </div>

      <div className="flex-1 bg-gray-200 rounded-2xl" ref={mountRef}></div>
    </div>
  );
}
