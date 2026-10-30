"use client";
import { useRef, type JSX } from "react";
import { useThreeGlobe } from "@/hooks/runtime/useThreeGlobe";
export function GlobeVisual():JSX.Element{const canvasRef=useRef<HTMLCanvasElement|null>(null);useThreeGlobe(canvasRef);return <div className="globe-stage"><canvas ref={canvasRef} id="globeCanvas" aria-label="Интерактивный 3D-глобус с серверами MISTNET" role="img"/><div className="globe-hint" id="globeHint">перетащи, чтобы вращать</div></div>}
