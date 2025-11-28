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

    const friction = 0.99;   // 0.9 stops faster, 0.98 glides longer
    const minVelocity = 0.05; // stop when slower than this

   const step = () => {
  const node = rowRef.current;
  if (!node) return;

  // apply velocity
  node.scrollLeft -= velocityRef.current;

  const maxScroll = node.scrollWidth - node.clientWidth;
  const overshoot = 60; // how far (px) you can 'stretch' past the edge

  // LEFT EDGE
  if (node.scrollLeft < -overshoot) {
    // hard clamp + big bounce
    node.scrollLeft = 0;
    velocityRef.current = -velocityRef.current * 0.9; // very strong bounce
  } else if (node.scrollLeft < 0) {
    // soft rubber-band zone
    velocityRef.current *= 0.7;
  }

  // RIGHT EDGE
  if (node.scrollLeft > maxScroll + overshoot) {
    node.scrollLeft = maxScroll;
    velocityRef.current = -velocityRef.current * 0.9;
  } else if (node.scrollLeft > maxScroll) {
    velocityRef.current *= 0.7;
  }

  // friction: slow down over time
  velocityRef.current *= friction;

  if (Math.abs(velocityRef.current) > minVelocity) {
    frameIdRef.current = requestAnimationFrame(step);
  } else {
    velocityRef.current = 0;
    stopAnimation();
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
