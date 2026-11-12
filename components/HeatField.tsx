"use client";

import { useEffect, useRef } from "react";

/**
 * Thermal-camera style backdrop: the pointer is a heat source that leaves a
 * warm trail which slowly cools. With no pointer, a faint source drifts on its own.
 * Drawn on a quarter-resolution canvas and blurred by CSS, so it stays cheap.
 */
export function HeatField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const host = c?.parentElement;
    const ctx = c?.getContext("2d");
    if (!c || !host || !ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const S = 0.25;
    let raf = 0, x = -1, y = -1, t = 0, visible = true;
    const size = () => { c.width = c.offsetWidth * S; c.height = c.offsetHeight * S; };
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      x = (e.clientX - r.left) * S;
      y = (e.clientY - r.top) * S;
    };
    const leave = () => { x = -1; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });

    const blob = (bx: number, by: number, r: number, a: number) => {
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
      g.addColorStop(0, `rgba(255,150,80,${a})`);
      g.addColorStop(0.5, `rgba(255,90,40,${a * 0.4})`);
      g.addColorStop(1, "rgba(255,90,40,0)");
      ctx.fillStyle = g;
      ctx.fillRect(bx - r, by - r, 2 * r, 2 * r);
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      t += 0.006;
      ctx.globalCompositeOperation = "destination-out"; // everything cools a little each frame
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = "lighter";
      if (x >= 0) blob(x, y, c.height * 0.3, 0.06);
      else blob(c.width * (0.3 + 0.22 * Math.sin(t)), c.height * (0.55 + 0.3 * Math.cos(t * 1.3)), c.height * 0.4, 0.02);
    };

    size();
    frame();
    io.observe(c);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      removeEventListener("resize", size);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full opacity-60 blur-2xl" />;
}
