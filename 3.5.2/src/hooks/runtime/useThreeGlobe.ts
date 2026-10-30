"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

const pixelRatio = (width: number, height: number, mobile: boolean) =>
  Math.max(
    0.75,
    Math.min(
      window.devicePixelRatio || 1,
      mobile ? 1.05 : 1.5,
      Math.sqrt(2.4e6 / Math.max(1, width * height)),
    ),
  );

export function useThreeGlobe(
  canvasRef: RefObject<HTMLCanvasElement | null>,
): void {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas || initialized.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrap = canvas.parentElement;
    if (!wrap) return;

    initialized.current = true;

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };

    const low = Boolean(
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
        navigator.hardwareConcurrency <= 2 ||
        nav.connection?.saveData,
    );

    const mobile = Boolean(
      low ||
        window.matchMedia("(max-width: 960px)").matches ||
        window.matchMedia("(pointer: coarse)").matches,
    );

    let width = Math.max(1, wrap.clientWidth);
    let height = Math.max(1, wrap.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100,
    );
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: true,
      powerPreference: mobile ? "default" : "high-performance",
    });

    renderer.setPixelRatio(pixelRatio(width, height, mobile));
    renderer.setSize(width, height, false);

    const group = new THREE.Group();
    scene.add(group);

    const sphereGeometry = new THREE.SphereGeometry(1.4, 36, 28);
    const sphereMaterial = new THREE.ShaderMaterial({
      wireframe: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00d2ff) },
      },
      vertexShader: `
        varying float vY;
        void main() {
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform float uTime;
        uniform vec3 uColor;
        varying float vY;
        void main() {
          float band = smoothstep(
            0.55,
            1.0,
            sin(vY * 2.4 - uTime * 1.4) * 0.5 + 0.5
          );
          gl_FragColor = vec4(uColor, 0.08 + band * 0.4);
        }
      `,
    });

    group.add(
      new THREE.Mesh(
        sphereGeometry,
        sphereMaterial,
      ),
    );

    const innerGeometry = new THREE.SphereGeometry(1.37, 32, 24);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00a0ff,
      transparent: true,
      opacity: 0.04,
    });

    group.add(
      new THREE.Mesh(
        innerGeometry,
        innerMaterial,
      ),
    );

    const coordinates: [number, number][] = [
      [40.7, -74],
      [60.2, 24.9],
      [52.4, 4.9],
      [41.01384, 28.94966],
    ];

    const toVector = (
      latitude: number,
      longitude: number,
      radius: number,
    ) => {
      const phi =
        (90 - latitude) * Math.PI / 180;
      const theta =
        (longitude + 180) * Math.PI / 180;

      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
    };

    const nodes: THREE.Vector3[] = [];

    coordinates.forEach(([latitude, longitude]) => {
      const point = toVector(latitude, longitude, 1.42);
      nodes.push(point);

      const dotGeometry = new THREE.SphereGeometry(0.03, 12, 12);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
      });
      const dot = new THREE.Mesh(
        dotGeometry,
        dotMaterial,
      );
      dot.position.copy(point);
      group.add(dot);

      const glowGeometry = new THREE.SphereGeometry(0.06, 12, 12);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.19,
      });
      const glow = new THREE.Mesh(
        glowGeometry,
        glowMaterial,
      );
      glow.position.copy(point);
      group.add(glow);
    });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const middle = a
          .clone()
          .add(b)
          .multiplyScalar(0.5);

        middle.normalize().multiplyScalar(
          1.42 + a.distanceTo(b) * 0.35,
        );

        const geometry = new THREE.BufferGeometry().setFromPoints(
          new THREE.QuadraticBezierCurve3(
            a,
            middle,
            b,
          ).getPoints(50),
        );

        group.add(
          new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
              color: 0x33ddff,
              transparent: true,
              opacity: 0.25,
            }),
          ),
        );
      }
    }

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotationX = 0;
    let rotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return;

      targetRotationY +=
        (event.clientX - lastX) * 0.008;

      targetRotationX = Math.max(
        -1.2,
        Math.min(
          1.2,
          targetRotationX +
            (event.clientY - lastY) * 0.008,
        ),
      );

      lastX = event.clientX;
      lastY = event.clientY;
    };

    const handlePointerUp = (event: PointerEvent) => {
      dragging = false;

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    let inView = false;
    let visible = false;
    let animationFrame = 0;
    let lastFrame = 0;

    const hint = document.getElementById("globeHint");
    let hintHidden = false;

    const animate = (now: number) => {
      if (!visible || document.hidden) {
        animationFrame = 0;
        return;
      }

      animationFrame = window.requestAnimationFrame(animate);

      if (
        now - lastFrame <
        (mobile ? 1000 / 30 : 1000 / 45)
      ) {
        return;
      }

      lastFrame = now;

      if (!dragging) {
        targetRotationY += 0.00135;
      }

      rotationX +=
        (targetRotationX - rotationX) * 0.08;

      rotationY +=
        (targetRotationY - rotationY) * 0.08;

      group.rotation.x = rotationX;
      group.rotation.y = rotationY;

      group.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (!(child.geometry instanceof THREE.SphereGeometry)) return;

        const radius = child.geometry.parameters.radius;

        if (radius !== 0.06) return;

        const scale =
          1 +
          Math.sin(
            Date.now() * 0.003 +
              child.position.x * 2,
          ) * 0.3;

        child.scale.setScalar(scale);
      });

      sphereMaterial.uniforms.uTime.value =
        performance.now() * 0.001;

      renderer.render(scene, camera);

      if (dragging && hint && !hintHidden) {
        hint.style.opacity = "0";
        hintHidden = true;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        visible = inView && !document.hidden;

        if (visible && !animationFrame) {
          animationFrame = window.requestAnimationFrame(animate);
        }
      },
      {
        threshold: 0.01,
        rootMargin: "120px",
      },
    );

    observer.observe(canvas);

    const handleVisibility = () => {
      visible = inView && !document.hidden;

      if (visible && !animationFrame) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
    );

    const handleResize = () => {
      width = Math.max(1, wrap.clientWidth);
      height = Math.max(1, wrap.clientHeight);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height,
        false,
      );
    };

    window.addEventListener(
      "resize",
      handleResize,
      { passive: true },
    );

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      observer.disconnect();

      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      canvas.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      canvas.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      canvas.removeEventListener(
        "pointerup",
        handlePointerUp,
      );

      canvas.removeEventListener(
        "pointercancel",
        handlePointerUp,
      );

      if (hint) {
        hint.style.opacity = "";
      }

      group.traverse((child) => {
        if (
          child instanceof THREE.Mesh ||
          child instanceof THREE.Line ||
          child instanceof THREE.Points
        ) {
          child.geometry.dispose();

          const material = child.material;

          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
          } else {
            material.dispose();
          }
        }
      });

      renderer.dispose();
      renderer.forceContextLoss();
      scene.clear();
      initialized.current = false;
    };
  }, [canvasRef]);
}
