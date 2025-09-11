"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from "@/lib/utils";

interface CompareProps {
  firstImage: string;
  secondImage: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassName?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
}

export function Compare({
  firstImage,
  secondImage,
  className,
  firstImageClassName,
  secondImageClassName,
  initialSliderPercentage = 50,
  slideMode = "drag",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000
}: CompareProps) {
  const [sliderPercentage, setSliderPercentage] = useState(initialSliderPercentage);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(() => {
        setSliderPercentage(prev => (prev === 100 ? 0 : 100));
      }, autoplayDuration);

      return () => clearInterval(interval);
    }
  }, [autoplay, autoplayDuration]);

  const setPositioning = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const percentage = ((clientX - containerRect.left) / containerRect.width) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    setSliderPercentage(clampedPercentage);
  }, []);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing) return;
    
    const clientX = 'clientX' in e ? e.clientX : 
      e.touches && e.touches[0] ? e.touches[0].clientX : 0;
    setPositioning(clientX);
  }, [isResizing, setPositioning]);

  const handleMoveEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleMoveEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleMoveEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleMoveEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleMoveEnd);
    };
  }, [isResizing, handleMove, handleMoveEnd]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (slideMode === "hover") {
      setPositioning(e.clientX);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (slideMode === "drag") {
      setIsResizing(true);
      setPositioning(e.clientX);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (slideMode === "drag" && e.touches[0]) {
      setIsResizing(true);
      setPositioning(e.touches[0].clientX);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      setSliderPercentage(prev => Math.max(prev - 5, 0));
    } else if (e.key === 'ArrowRight') {
      setSliderPercentage(prev => Math.min(prev + 5, 100));
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden select-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label="Image comparison slider"
    >
      {/* Second Image (Background) */}
      <div className="absolute inset-0">
        <img
          src={secondImage}
          alt="After"
          className={cn(
            "w-full h-full object-cover",
            secondImageClassName
          )}
          draggable={false}
        />
      </div>

      {/* First Image (Foreground with clip) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(0 ${100 - sliderPercentage}% 0 0)`
        }}
      >
        <img
          src={firstImage}
          alt="Before"
          className={cn(
            "w-full h-full object-cover",
            firstImageClassName
          )}
          draggable={false}
        />
      </div>

      {/* Slider Handle */}
      {showHandlebar && (
        <div
          ref={handleRef}
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize select-none"
          style={{
            left: `${sliderPercentage}%`,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Handle Bar */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-gray-300 shadow-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Optional Labels */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        After
      </div>
    </div>
  );
}

export default Compare;