// components/DragScrollRow.tsx
import React, { useRef } from 'react';

type DragScrollRowProps = {
  children: React.ReactNode;
  className?: string;
};

export default function DragScrollRow({
  children,
  className,
}: DragScrollRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // for momentum
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);

  const stopAnimation = () => {
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rowRef.current) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftRef.current = rowRef.current.scrollLeft;

    // reset momentum info
    lastXRef.current = e.pageX;
    velocityRef.current = 0;
    stopAnimation();
  };

  const startMomentum = () => {
  const el = rowRef.current;
  if (!el) return;

  const friction = 0.985;    // glides a bit longer
  const minVelocity = 0.05;  // when to stop throwing
  const overshoot = 160;     // ⬅ big overshoot distance in px

  const step = (time?: number) => {
    const node = rowRef.current;
    if (!node) return;

    // apply velocity (the usual momentum)
    node.scrollLeft -= velocityRef.current;

    const maxScroll = node.scrollWidth - node.clientWidth;

    // --- rubber-band damping when outside [0, maxScroll] ---
    if (node.scrollLeft < 0) {
      const past = -node.scrollLeft;                    // how far past left edge
      const ratio = Math.min(1, past / overshoot);      // 0 → 1
      const edgeFriction = 1 - 0.7 * ratio;             // 1 → 0.3
      velocityRef.current *= edgeFriction;              // slows more as you stretch
    } else if (node.scrollLeft > maxScroll) {
      const past = node.scrollLeft - maxScroll;         // how far past right edge
      const ratio = Math.min(1, past / overshoot);
      const edgeFriction = 1 - 0.7 * ratio;
      velocityRef.current *= edgeFriction;
    }

    // global friction
    velocityRef.current *= friction;

    if (Math.abs(velocityRef.current) > minVelocity) {
      frameIdRef.current = requestAnimationFrame(step);
    } else {
      // stop throwing and do a smooth snap-back if we're overshooting
      const outOfBounds =
        node.scrollLeft < 0 || node.scrollLeft > maxScroll;

      if (!outOfBounds) {
        velocityRef.current = 0;
        stopAnimation();
        return;
      }

      const start = node.scrollLeft;
      const end = Math.min(maxScroll, Math.max(0, start)); // clamp to [0, maxScroll]
      const duration = 400; // ms

      const startTime = performance.now();

      const animateBack = (t: number) => {
        const node2 = rowRef.current;
        if (!node2) return;

        const elapsed = t - startTime;
        const progress = Math.min(1, elapsed / duration);

        // easeOutCubic for smooth snap
        const eased = 1 - Math.pow(1 - progress, 3);

        node2.scrollLeft = start + (end - start) * eased;

        if (progress < 1) {
          frameIdRef.current = requestAnimationFrame(animateBack);
        } else {
          velocityRef.current = 0;
          stopAnimation();
        }
      };

      frameIdRef.current = requestAnimationFrame(animateBack);
    }
  };

  frameIdRef.current = requestAnimationFrame(step);
};


  const handleMouseUpOrLeave = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // only start momentum if user actually flung the mouse
    if (Math.abs(velocityRef.current) > 0.5) {
      startMomentum();
    } else {
      velocityRef.current = 0;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = rowRef.current;
    if (!isDraggingRef.current || !node) return;

    e.preventDefault();

    const x = e.pageX - node.offsetLeft;
    const walk = x - startXRef.current;

    node.scrollLeft = scrollLeftRef.current - walk;

    // measure velocity based on mouse movement
    const dx = e.pageX - lastXRef.current;
    lastXRef.current = e.pageX;

    // tweak factor: bigger = stronger throw
    velocityRef.current = dx * 0.9;
  };

  return (
    <div
      ref={rowRef}
      className={className}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseUpOrLeave}
      onMouseUp={handleMouseUpOrLeave}
      onMouseMove={handleMouseMove}
      style={{
        overflowX: 'auto',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </div>
  );
}
