'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

/**
 * HealthGhuru Custom Cursor System
 * -----------------------------------------------------------------------------
 * Uses ONLY existing design tokens — no new colors introduced:
 *   --color-primary       #2E7D32
 *   --color-primary-light #4CAF50
 *   --color-secondary     #66BB6A
 *   --color-accent        #F9A825
 *
 * Behavior:
 *  - Default: small solid dot, follows cursor with spring physics
 *  - Hovering a button/link: dot grows into a ring, label fades in if data-cursor-text is set
 *  - Hovering a tab/nav item: dot becomes a soft pill matching tab width (magnetic snap)
 *  - On click: ripple burst in primary green, dot scales down briefly (press feedback)
 *  - Hidden entirely on touch devices — never shows on mobile/tablet
 */

type CursorVariant = 'default' | 'button' | 'tab' | 'text' | 'disabled';

interface CursorTarget {
  variant: CursorVariant;
  rect: DOMRect | null;
  label: string | null;
}

const SPRING_CONFIG = { damping: 28, stiffness: 320, mass: 0.4 };
const SPRING_CONFIG_SLOW = { damping: 22, stiffness: 180, mass: 0.6 }; // for the trailing ring

export default function CustomCursor() {
  const [isTouch, setIsTouch] = useState(true); // default true = hidden until proven otherwise
  const [target, setTarget] = useState<CursorTarget>({ variant: 'default', rect: null, label: null });
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  // Raw mouse position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Dot: fast, tight spring (feels glued to the cursor)
  const dotX = useSpring(mouseX, SPRING_CONFIG);
  const dotY = useSpring(mouseY, SPRING_CONFIG);

  // Ring/pill: slower spring (trails slightly, gives it weight)
  const ringX = useSpring(mouseX, SPRING_CONFIG_SLOW);
  const ringY = useSpring(mouseY, SPRING_CONFIG_SLOW);

  useEffect(() => {
    const isMobileDevice =
      window.innerWidth < 1024 ||
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(hover: none)').matches;
    setIsTouch(isMobileDevice);
    if (isMobileDevice) return;

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>('[data-cursor]');
      if (el) {
        const variant = (el.dataset.cursor as CursorVariant) || 'button';
        const label = el.dataset.cursorText || null;
        setTarget({ variant, rect: el.getBoundingClientRect(), label });
      } else {
        setTarget({ variant: 'default', rect: null, label: null });
      }
    };

    const handleDown = (e: MouseEvent) => {
      setIsPressed(true);
      const id = rippleId.current++;
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      // Auto-clean ripple after its animation finishes
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    };

    const handleUp = () => setIsPressed(false);
    const handleLeaveWindow = () => {
      mouseX.set(-100);
      mouseY.set(-100);
      setTarget({ variant: 'default', rect: null, label: null });
    };
    const handleBlur = handleLeaveWindow;

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('mouseleave', handleLeaveWindow);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('mouseleave', handleLeaveWindow);
      window.removeEventListener('blur', handleBlur);
    };
  }, [mouseX, mouseY]);

  // Respect prefers-reduced-motion: render nothing, fall back to native cursor
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  if (isTouch || reducedMotion) return null;

  const isTab = target.variant === 'tab' && target.rect;
  const isButton = target.variant === 'button';
  const isText = target.variant === 'text';

  return (
    <>
      {/* RING / PILL — trailing, larger, adapts shape to target */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9998,
          pointerEvents: 'none',
          x: isTab && target.rect ? target.rect.left + target.rect.width / 2 : ringX,
          y: isTab && target.rect ? target.rect.top + target.rect.height / 2 : ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isTab && target.rect ? target.rect.width + 16 : isButton ? 56 : 32,
          height: isTab && target.rect ? target.rect.height + 10 : isButton ? 56 : 32,
          borderRadius: isTab ? 999 : isButton ? '50%' : '50%',
          backgroundColor: isTab
            ? 'rgba(102,187,106,0.14)'
            : isButton
            ? 'rgba(46,125,50,0.08)'
            : 'rgba(46,125,50,0)',
          borderWidth: isTab || isButton ? 1.5 : 1,
          borderColor: isTab
            ? '#66BB6A'
            : isButton
            ? '#2E7D32'
            : 'rgba(46,125,50,0.25)',
          scale: isPressed ? 0.88 : 1,
        }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className="border"
      >
        {target.label && (
          <AnimatePresence>
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: '#1A2E1A',
                whiteSpace: 'nowrap',
              }}
            >
              {target.label}
            </motion.span>
          </AnimatePresence>
        )}
      </motion.div>

      {/* DOT — tight, fast-following core cursor */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isText ? 4 : isPressed ? 6 : 8,
          height: isText ? 4 : isPressed ? 6 : 8,
          opacity: target.label ? 0 : 1,
          backgroundColor: '#2E7D32',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="rounded-full"
      />

      {/* CLICK RIPPLES */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            aria-hidden
            initial={{ opacity: 0.35, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: r.y,
              left: r.x,
              zIndex: 9997,
              width: 48,
              height: 48,
              marginLeft: -24,
              marginTop: -24,
              borderRadius: '50%',
              border: '1.5px solid #4CAF50',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
