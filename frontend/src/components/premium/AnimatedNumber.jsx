import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * Animated count for stat cards — subtle premium feel.
 */
export default function AnimatedNumber({ value, className = '' }) {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
  const invalid = Number.isNaN(num);
  const target = invalid ? 0 : num;
  const spring = useSpring(0, { stiffness: 120, damping: 22 });
  const [display, setDisplay] = useState(0);
  const raf = useRef();

  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setDisplay(Math.round(v));
      });
    });
    return () => {
      unsub();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [spring]);

  if (typeof value === 'string' && String(value).match(/[^\d]/)) {
    return <span className={className}>{value}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
}
