"use client";

import { useRef, useState, useEffect } from "react";

export function useContainerSize(aspectRatio = 1.5, minHeight = 200) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: minHeight });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      setSize({
        width,
        height: Math.max(minHeight, Math.round(width / aspectRatio)),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [aspectRatio, minHeight]);

  return { ref, width: size.width, height: size.height };
}
