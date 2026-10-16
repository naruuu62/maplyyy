"use client";

import React, { useEffect, useState, useRef } from "react";

type BgTheme = "light" | "dark" | "blue";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [bgTheme, setBgTheme] = useState<BgTheme>("light");

  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate for devices with a fine pointer (mouse/trackpad, not touch)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    setMounted(true);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;

    const detectBgTheme = (target: HTMLElement | null): BgTheme => {
      let el = target;
      while (el && el !== document.documentElement && el !== document.body) {
        // Fast class-based detection for Tailwind/Maply dark & blue elements
        const classNames = el.className || "";
        if (typeof classNames === "string") {
          if (
            classNames.includes("bg-[#0038D1]") ||
            classNames.includes("bg-[#1A4BDB]") ||
            classNames.includes("bg-[#2F54EB]") ||
            classNames.includes("bg-blue-")
          ) {
            return "blue";
          }
          if (
            classNames.includes("bg-[#1B1B1E]") ||
            classNames.includes("bg-black") ||
            classNames.includes("bg-gray-900") ||
            classNames.includes("bg-zinc-900") ||
            classNames.includes("bg-[#2A1700]")
          ) {
            return "dark";
          }
        }

        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
          const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (match) {
            const r = parseInt(match[1], 10);
            const g = parseInt(match[2], 10);
            const b = parseInt(match[3], 10);
            const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
            if (a > 0.35) {
              // Maply brand blue check
              if (b > 160 && r < 80 && g < 120) {
                return "blue";
              }
              // Dark element check
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum < 95) {
                return "dark";
              }
              return "light";
            }
          }
        }
        el = el.parentElement;
      }
      return "light";
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Instantly position the center precision dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        // Check if interactive
        const interactive = Boolean(
          target.closest(
            'button, a, input, select, textarea, [role="button"], label, .cursor-pointer, [data-interactive="true"]'
          )
        );
        setIsHovered(interactive);

        // Detect underlying background theme for automatic contrast adaptation
        const currentTheme = detectBgTheme(target);
        setBgTheme(currentTheme);
      }
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Smooth fluid lerp animation loop for outer follower ring
    const render = () => {
      ringX += (mouseX - ringX) * 0.28;
      ringY += (mouseY - ringY) * 0.28;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    animId = requestAnimationFrame(render);

    document.documentElement.classList.add("custom-cursor-active");

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [isVisible]);

  if (!mounted) return null;

  // Determine dynamic styles based on hover state and detected background theme
  const getRingStyles = () => {
    if (isHovered) {
      if (bgTheme === "blue") {
        // High contrast amber/yellow on blue elements
        return "w-12 h-12 -ml-2 -mt-2 bg-[#FFEAA7]/25 border-[#FFEAA7] shadow-[0_0_16px_rgba(255,234,167,0.7)] scale-110";
      }
      if (bgTheme === "dark") {
        // High contrast crisp white on dark elements
        return "w-12 h-12 -ml-2 -mt-2 bg-white/20 border-white shadow-[0_0_16px_rgba(255,255,255,0.7)] scale-110";
      }
      // Light background: Brand blue accent
      return "w-12 h-12 -ml-2 -mt-2 bg-[#0038D1]/15 border-[#0038D1] shadow-[0_0_14px_rgba(0,56,209,0.35)] scale-110";
    }

    if (isPressed) {
      if (bgTheme === "blue") {
        return "w-7 h-7 ml-0.5 mt-0.5 bg-[#FFEAA7]/40 border-[#FFEAA7] scale-90";
      }
      if (bgTheme === "dark") {
        return "w-7 h-7 ml-0.5 mt-0.5 bg-white/40 border-white scale-90";
      }
      return "w-7 h-7 ml-0.5 mt-0.5 bg-[#1B1B1E]/15 border-[#1B1B1E] scale-90";
    }

    // Default neutral state
    if (bgTheme === "blue") {
      return "w-8 h-8 bg-[#FFEAA7]/10 border-[#FFEAA7] shadow-[0_0_8px_rgba(255,234,167,0.4)]";
    }
    if (bgTheme === "dark") {
      return "w-8 h-8 bg-white/10 border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]";
    }
    return "w-8 h-8 bg-transparent border-[#1B1B1E]/75";
  };

  const getDotStyles = () => {
    if (isHovered) {
      if (bgTheme === "blue") {
        return "w-2.5 h-2.5 bg-[#FFEAA7] shadow-[0_0_8px_#FFEAA7]";
      }
      if (bgTheme === "dark") {
        return "w-2.5 h-2.5 bg-white shadow-[0_0_8px_#FFFFFF]";
      }
      return "w-2.5 h-2.5 bg-[#0038D1] shadow-[0_0_8px_#0038D1]";
    }

    if (isPressed) {
      return "w-2 h-2 bg-[#DA3437] shadow-[0_0_6px_#DA3437]";
    }

    if (bgTheme === "blue") {
      return "w-2 h-2 bg-[#FFEAA7]";
    }
    if (bgTheme === "dark") {
      return "w-2 h-2 bg-white";
    }
    return "w-2 h-2 bg-[#1B1B1E]";
  };

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Outer Circle Ring (Smooth fluid follower + dynamic contrast adaptation) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 -ml-4 -mt-4 will-change-transform pointer-events-none"
      >
        <div
          className={`rounded-full transition-all duration-200 ease-out border-2 flex items-center justify-center ${getRingStyles()}`}
        />
      </div>

      {/* Center Precision Click Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 will-change-transform pointer-events-none"
      >
        <div
          className={`rounded-full transition-all duration-150 ${getDotStyles()}`}
        />
      </div>
    </div>
  );
}
