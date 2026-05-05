"use client"

import React, { ElementType, HTMLAttributes, useEffect, useMemo } from "react"
import type { DOMKeyframesDefinition, AnimationOptions } from "motion"
import { useAnimate } from "motion/react"

import { cn } from "../lib/utils"

interface ImageTrailProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  key?: React.Key
  children?: React.ReactNode
  as?: ElementType
  threshold?: number
  intensity?: number
  keyframes?: DOMKeyframesDefinition
  keyframesOptions?: AnimationOptions
  trailElementAnimationKeyframes?: {
    x?: AnimationOptions
    y?: AnimationOptions
  }
  repeatChildren?: number
  baseZIndex?: number
  zIndexDirection?: "new-on-top" | "old-on-top"
  disabled?: boolean
}

interface ImageTrailItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  key?: React.Key
  as?: ElementType
  children?: React.ReactNode
}

const MathUtils = {
  lerp: (a: number, b: number, n: number) => (1 - n) * a + n * b,
  distance: (x1: number, y1: number, x2: number, y2: number) =>
    Math.hypot(x2 - x1, y2 - y1),
}

const ImageTrail = ({
  className,
  as = "div",
  children,
  threshold = 100,
  intensity = 0.3,
  keyframes,
  keyframesOptions,
  repeatChildren = 3,
  trailElementAnimationKeyframes = {
    x: { duration: 1, type: "tween", ease: "easeOut" },
    y: { duration: 1, type: "tween", ease: "easeOut" },
  },
  baseZIndex = 0,
  zIndexDirection = "new-on-top",
  disabled = false,
  ...props
}: ImageTrailProps) => {
  const allImages = React.useRef<NodeListOf<HTMLElement> | undefined>(undefined)
  const currentId = React.useRef(0)
  const lastMousePos = React.useRef({ x: 0, y: 0 })
  const cachedMousePos = React.useRef({ x: 0, y: 0 })
  const [containerRef, animate] = useAnimate<any>()
  const zIndices = React.useRef<number[]>([])

  const clampedIntensity = useMemo(
    () => Math.max(0.0001, Math.min(1, intensity)),
    [intensity]
  )

  useEffect(() => {
    if (!containerRef.current) return;
    allImages.current = containerRef.current.querySelectorAll(
      ".image-trail-item"
    ) as NodeListOf<HTMLElement>

    zIndices.current = Array.from(
      { length: allImages.current.length },
      (_, index) => index
    )
  }, [containerRef])

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (disabled) return;
      handleMove(e.clientX, e.clientY);
    }

    window.addEventListener('mousemove', handleGlobalMove);
    return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, [disabled])

  const handleMove = (clientX: number, clientY: number) => {
    if (disabled) return;
    const containerRect = containerRef?.current?.getBoundingClientRect()
    if (!containerRect) return;

    // Only process if mouse is within container bounds
    if (
      clientX < containerRect.left ||
      clientX > containerRect.right ||
      clientY < containerRect.top ||
      clientY > containerRect.bottom
    ) {
      return;
    }

    const mousePos = {
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    }

    cachedMousePos.current.x = MathUtils.lerp(
      cachedMousePos.current.x || mousePos.x,
      mousePos.x,
      clampedIntensity
    )

    cachedMousePos.current.y = MathUtils.lerp(
      cachedMousePos.current.y || mousePos.y,
      mousePos.y,
      clampedIntensity
    )

    const distance = MathUtils.distance(
      mousePos.x,
      mousePos.y,
      lastMousePos.current.x,
      lastMousePos.current.y
    )

    if (distance > threshold && allImages?.current) {
      const N = allImages.current.length
      const current = currentId.current

      if (zIndexDirection === "new-on-top") {
        for (let i = 0; i < N; i++) {
          if (i !== current) {
            zIndices.current[i] -= 1
          }
        }
        zIndices.current[current] = N - 1
      } else {
        for (let i = 0; i < N; i++) {
          if (i !== current) {
            zIndices.current[i] += 1
          }
        }
        zIndices.current[current] = 0
      }

      allImages.current[current].style.display = "block"
      allImages.current.forEach((img, index) => {
        img.style.zIndex = String(zIndices.current[index] + baseZIndex)
      })

      animate(
        allImages.current[currentId.current],
        {
          x: [
            cachedMousePos.current.x -
            allImages.current[currentId.current].offsetWidth / 2,
            mousePos.x - allImages.current[currentId.current].offsetWidth / 2,
          ],
          y: [
            cachedMousePos.current.y -
            allImages.current[currentId.current].offsetHeight / 2,
            mousePos.y -
            allImages.current?.[currentId.current].offsetHeight / 2,
          ],
          ...keyframes,
        },
        {
          ...trailElementAnimationKeyframes.x,
          ...trailElementAnimationKeyframes.y,
          ...keyframesOptions,
        }
      )
      currentId.current = (current + 1) % N
      lastMousePos.current = { x: mousePos.x, y: mousePos.y }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const ElementTag = as ?? "div"

  return (
    <ElementTag
      className={cn("h-full w-full relative", className)}
      onTouchMove={handleTouchMove}
      ref={containerRef}
      {...props}
    >
      {Array.from({ length: repeatChildren }).map((_, i) => (
        <React.Fragment key={i}>{children}</React.Fragment>
      ))}
    </ElementTag>
  )
}

export const ImageTrailItem = ({
  className,
  children,
  as = "div",
  ...props
}: ImageTrailItemProps) => {
  const ElementTag = as ?? "div"
  return (
    <ElementTag
      {...props}
      className={cn(
        "absolute top-0 left-0 will-change-transform hidden",
        className,
        "image-trail-item"
      )}
    >
      {children}
    </ElementTag>
  )
}

export default ImageTrail
