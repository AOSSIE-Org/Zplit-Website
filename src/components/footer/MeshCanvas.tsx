"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type MeshNode = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
type Ripple = { x: number; y: number; r: number; alpha: number };

const LINK_DISTANCE = 130;
const POINTER_DISTANCE = 190;

/**
 * An interactive peer-to-peer "mesh": every dot is a device, nearby devices link
 * up, the cursor acts as your phone syncing with everything in range, and a click
 * sends out a sync pulse. Listens for pointer events on its parent element.
 */
export default function MeshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let nodes: MeshNode[] = [];
    const ripples: Ripple[] = [];
    const pointer = { x: -9999, y: -9999 };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        if (!reduce) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_DISTANCE && dist > 1) {
            n.vx += (dx / dist) * 0.012;
            n.vy += (dy / dist) * 0.012;
          }
          n.vx *= 0.985;
          n.vy *= 0.985;
          // keep a gentle drift
          if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.04;
          if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.04;
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          n.x = Math.max(0, Math.min(width, n.x));
          n.y = Math.max(0, Math.min(height, n.y));
        }
      }

      // device ↔ device links
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(74, 222, 128, ${(1 - d / LINK_DISTANCE) * 0.16})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // your device (pointer) ↔ devices in range
      for (const n of nodes) {
        const d = Math.hypot(pointer.x - n.x, pointer.y - n.y);
        if (d < POINTER_DISTANCE) {
          const k = 1 - d / POINTER_DISTANCE;
          ctx.strokeStyle = `rgba(134, 239, 172, ${k * 0.55})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      // sync pulses
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 5;
        rp.alpha *= 0.955;
        ctx.strokeStyle = `rgba(74, 222, 128, ${rp.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
        if (rp.alpha < 0.02) ripples.splice(i, 1);
      }

      // devices
      for (const n of nodes) {
        const dPointer = Math.hypot(pointer.x - n.x, pointer.y - n.y);
        const near = dPointer < POINTER_DISTANCE ? 1 - dPointer / POINTER_DISTANCE : 0;
        const hitByRipple = ripples.some((rp) => Math.abs(Math.hypot(rp.x - n.x, rp.y - n.y) - rp.r) < 14);
        const twinkle = reduce ? 0.6 : 0.45 + 0.3 * Math.sin(time / 900 + n.phase);
        const glow = hitByRipple ? 1 : Math.max(near, 0);
        ctx.fillStyle = glow > 0 ? `rgba(187, 247, 208, ${Math.min(1, twinkle + glow)})` : `rgba(134, 239, 172, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.max(24, Math.floor((width * height) / 17000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.9,
        phase: Math.random() * Math.PI * 2,
      }));
      if (!running) draw(0);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      if (reduce) draw(0);
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      if (reduce) draw(0);
    };
    const onDown = (e: PointerEvent) => {
      if (reduce) return;
      const rect = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 4, alpha: 0.7 });
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(parent);

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    parent.addEventListener("pointerdown", onDown);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      parent.removeEventListener("pointerdown", onDown);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10" />;
}
