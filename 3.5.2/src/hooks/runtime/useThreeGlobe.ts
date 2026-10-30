"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

const pixelRatio = (width: number, height: number, mobile: boolean) =>
  Math.max(.75, Math.min(window.devicePixelRatio || 1, mobile ? 1.05 : 1.5, Math.sqrt(2.4e6 / Math.max(1, width * height))));

export function useThreeGlobe(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas || initialized.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrap = canvas.parentElement;
    if (!wrap) return;

    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "0";
    canvas.style.touchAction = "none";

    let webglContext: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      webglContext = canvas.getContext("webgl2", { alpha: true, antialias: true, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false }) ||
        canvas.getContext("webgl", { alpha: true, antialias: true, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false });
    } catch {
      return;
    }
    if (!webglContext) return;

    initialized.current = true;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const low = Boolean((nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || navigator.hardwareConcurrency <= 2 || nav.connection?.saveData);
    const mobile = Boolean(low || window.matchMedia("(max-width: 960px)").matches || window.matchMedia("(pointer: coarse)").matches);
    let width = Math.max(1, wrap.clientWidth);
    let height = Math.max(1, wrap.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, .1, 100);
    camera.position.z = 4.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, context: webglContext, antialias: !mobile, alpha: true, powerPreference: mobile ? "default" : "high-performance" });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(pixelRatio(width, height, mobile));
      renderer.setSize(width, height, false);
    } catch {
      initialized.current = false;
      return;
    }

    const group = new THREE.Group();
    scene.add(group);
    const sphereGeometry = new THREE.SphereGeometry(1.4, 36, 28);
    const sphereMaterial = new THREE.ShaderMaterial({ wireframe: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x00d2ff) } }, vertexShader: `varying float vY;void main(){vY=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: `precision mediump float;uniform float uTime;uniform vec3 uColor;varying float vY;void main(){float band=smoothstep(.55,1.,sin(vY*2.4-uTime*1.4)*.5+.5);gl_FragColor=vec4(uColor,.08+band*.4);}` });
    group.add(new THREE.Mesh(sphereGeometry, sphereMaterial));

    const innerGeometry = new THREE.SphereGeometry(1.37, 32, 24);
    const innerMaterial = new THREE.MeshBasicMaterial({ color: 0x00a0ff, transparent: true, opacity: .04 });
    group.add(new THREE.Mesh(innerGeometry, innerMaterial));

    const coordinates: [number, number][] = [[40.7, -74], [60.2, 24.9], [52.4, 4.9], [41.01384, 28.94966]];
    const toVector = (latitude: number, longitude: number, radius: number) => {
      const phi = (90 - latitude) * Math.PI / 180;
      const theta = (longitude + 180) * Math.PI / 180;
      return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    };
    const nodes: THREE.Vector3[] = [];

    coordinates.forEach(([latitude, longitude]) => {
      const point = toVector(latitude, longitude, 1.42);
      nodes.push(point);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
      dot.position.copy(point);
      group.add(dot);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: .19 }));
      glow.position.copy(point);
      group.add(glow);
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const middle = a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(1.42 + a.distanceTo(b) * .35);
        const geometry = new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, middle, b).getPoints(50));
        group.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x33ddff, transparent: true, opacity: .25 })));
      }
    }

    let dragging = false;
    let lastX = 0, lastY = 0;
    let rotationX = 0, rotationY = 0, targetRotationX = 0, targetRotationY = 0;
    let inView = false, visible = false, running = true, animationFrame = 0, lastFrame = 0;
    const hint = document.getElementById("globeHint");
    let hintHidden = false;

    const handlePointerDown = (event: PointerEvent) => {
      if (!running) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      try { canvas.setPointerCapture(event.pointerId); } catch {}
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging || !running) return;
      targetRotationY += (event.clientX - lastX) * .008;
      targetRotationX = Math.max(-1.2, Math.min(1.2, targetRotationX + (event.clientY - lastY) * .008));
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const handlePointerUp = (event: PointerEvent) => {
      dragging = false;
      try { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch {}
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    const animate = (now: number) => {
      if (!running || !visible || document.hidden) { animationFrame = 0; return; }
      animationFrame = requestAnimationFrame(animate);
      if (now - lastFrame < (mobile ? 1000 / 30 : 1000 / 45)) return;
      lastFrame = now;
      if (!dragging) targetRotationY += .00135;
      rotationX += (targetRotationX - rotationX) * .08;
      rotationY += (targetRotationY - rotationY) * .08;
      group.rotation.x = rotationX;
      group.rotation.y = rotationY;
      group.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (!(child.geometry instanceof THREE.SphereGeometry)) return;
        const radius = child.geometry.parameters.radius;
        if (radius !== .06) return;
        const scale = 1 + Math.sin(Date.now() * .003 + child.position.x * 2) * .3;
        child.scale.setScalar(scale);
      });
      sphereMaterial.uniforms.uTime.value = performance.now() * .001;
      renderer.render(scene, camera);
      if (dragging && hint && !hintHidden) { hint.style.opacity = "0"; hintHidden = true; }
    };

    const observer = new IntersectionObserver((entries) => {
      if (!running) return;
      inView = entries[0]?.isIntersecting ?? false;
      visible = inView && !document.hidden;
      if (visible && !animationFrame) animationFrame = requestAnimationFrame(animate);
    }, { threshold: .01, rootMargin: "120px" });
    observer.observe(canvas);

    const handleVisibility = () => {
      if (!running) return;
      visible = inView && !document.hidden;
      if (visible && !animationFrame) animationFrame = requestAnimationFrame(animate);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleResize = () => {
      if (!running) return;
      width = Math.max(1, wrap.clientWidth);
      height = Math.max(1, wrap.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      running = false;
      visible = false;
      dragging = false;
      if (animationFrame) { window.cancelAnimationFrame(animationFrame); animationFrame = 0; }
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      if (hint) hint.style.opacity = "";
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
          child.geometry.dispose();
          const material = child.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      scene.clear();
      initialized.current = false;
    };
  }, [canvasRef]);
}
