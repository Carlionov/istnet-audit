"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

const pixelRatio = (width: number, height: number, mobile: boolean) =>
  Math.max(.75, Math.min(window.devicePixelRatio || 1, mobile ? 1.05 : 1.5, Math.sqrt(2.4e6 / Math.max(1, width * height))));

const particleBudget = (width: number, height: number, mobile: boolean) => {
  const k = Math.min(1, 1.65 / (window.devicePixelRatio || 1) + .25);
  return Math.round(Math.max(55, Math.min(mobile ? 88 : 460, (width * height) / (mobile ? 13500 : 5600) * k)));
};

export function useThreeBackground(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas || initialized.current) return;

    const wrap = canvas.parentElement;
    if (!wrap) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const low = (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || navigator.hardwareConcurrency <= 2;
    if (reducedMotion || nav.connection?.saveData || low) return;

    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "auto";

    let webglContext: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      webglContext = canvas.getContext("webgl2", { alpha: true, antialias: false, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false }) ||
        canvas.getContext("webgl", { alpha: true, antialias: false, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false });
    } catch {
      return;
    }
    if (!webglContext) return;

    initialized.current = true;

    const mobile = low || window.matchMedia("(max-width: 960px)").matches || window.matchMedia("(pointer: coarse)").matches;
    let width = Math.max(1, wrap.clientWidth);
    let height = Math.max(1, wrap.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, .1, 100);
    camera.position.z = 6;

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

    const count = particleBudget(width, height, mobile);
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - .5) * 14;
      positions[i * 3 + 1] = (Math.random() - .5) * 10;
      positions[i * 3 + 2] = (Math.random() - .5) * 8;
      velocities[i * 3] = (Math.random() - .5) * .0018;
      velocities[i * 3 + 1] = (Math.random() - .5) * .0018;
      velocities[i * 3 + 2] = (Math.random() - .5) * .0018;
      seeds[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uSize: { value: mobile ? 1.7 : 2 }, uPR: { value: renderer.getPixelRatio() }, c1: { value: new THREE.Color(0x00d2ff) }, c2: { value: new THREE.Color(0x7c3aed) } }, vertexShader: `uniform float uTime,uSize,uPR;attribute float aSeed;varying float vP;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vP=.5+.5*sin(uTime*1.6+aSeed*6.2832);gl_PointSize=uSize*uPR*(1.+vP*.45)*(6./-mv.z);gl_Position=projectionMatrix*mv;}`, fragmentShader: `precision mediump float;uniform vec3 c1,c2;varying float vP;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float g=smoothstep(.5,0.,r);gl_FragColor=vec4(mix(c1,c2,vP),g*g*(.16+.34*vP));}` });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(count * 6);
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x39c9e6, transparent: true, opacity: .055, blending: THREE.AdditiveBlending });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const mouse = new THREE.Vector2(999, 999);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const world = new THREE.Vector3();
    const handlePointerMove = (e: PointerEvent) => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; };
    const handleClick = () => { for (let i = 0; i < count; i++) { velocities[i * 3] += (Math.random() - .5) * .022; velocities[i * 3 + 1] += (Math.random() - .5) * .022; } };
    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("click", handleClick);

    let inView = false;
    let visible = false;
    let running = true;
    let raf = 0;
    let last = 0;

    const loop = (now: number) => {
      if (!running || !visible || document.hidden) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      if (now - last < (mobile ? 1000 / 30 : 1000 / 45)) return;
      last = now;
      const pa = geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = pa.array as Float32Array;
      const la = lineGeometry.getAttribute("position").array as Float32Array;
      let li = 0;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, world);
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        arr[ix] += velocities[ix]; arr[ix + 1] += velocities[ix + 1]; arr[ix + 2] += velocities[ix + 2];
        if (Math.abs(arr[ix]) > 7) velocities[ix] *= -1;
        if (Math.abs(arr[ix + 1]) > 5) velocities[ix + 1] *= -1;
        if (Math.abs(arr[ix + 2]) > 4) velocities[ix + 2] *= -1;
        const dx = arr[ix] - world.x, dy = arr[ix + 1] - world.y, d = Math.hypot(dx, dy);
        if (d > .001 && d < 2.1) {
          const f = (2.1 - d) * .0009;
          velocities[ix] += dx / d * f; velocities[ix + 1] += dy / d * f;
          for (let j = i + 1; j < count && li < count * 6 - 6; j++) {
            const jx = j * 3, dx2 = arr[jx] - arr[ix], dy2 = arr[jx + 1] - arr[ix + 1];
            if (dx2 * dx2 + dy2 * dy2 < 1.05) {
              la[li++] = arr[ix]; la[li++] = arr[ix + 1]; la[li++] = arr[ix + 2];
              la[li++] = arr[jx]; la[li++] = arr[jx + 1]; la[li++] = arr[jx + 2];
            }
          }
        }
        velocities[ix] *= .99; velocities[ix + 1] *= .99; velocities[ix + 2] *= .99;
      }
      pa.needsUpdate = true;
      lineGeometry.setDrawRange(0, li / 3);
      lineGeometry.getAttribute("position").needsUpdate = true;
      const sp = (window as Window & { __scrollP?: number }).__scrollP || 0;
      camera.position.z = 6.4 + sp * 1.7;
      points.rotation.x = lines.rotation.x = sp * .4;
      material.uniforms.uTime.value = performance.now() * .001;
      points.rotation.y += .00025; lines.rotation.y += .00025;
      renderer.render(scene, camera);
    };

    const observer = new IntersectionObserver((entries) => {
      if (!running) return;
      inView = entries[0]?.isIntersecting ?? false;
      visible = inView && !document.hidden;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    }, { threshold: .01, rootMargin: "120px" });
    observer.observe(canvas);

    const visibility = () => {
      if (!running) return;
      visible = inView && !document.hidden;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", visibility);

    const resize = () => {
      if (!running) return;
      width = Math.max(1, wrap.clientWidth); height = Math.max(1, wrap.clientHeight);
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      running = false;
      visible = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("click", handleClick);
      geometry.dispose(); material.dispose(); lineGeometry.dispose(); lineMaterial.dispose();
      renderer.dispose();
      scene.clear();
      initialized.current = false;
    };
  }, [canvasRef]);
}
