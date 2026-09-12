import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface IntroOverlayProps {
  show: boolean;
  onEnter: () => void;
}

const IntroOverlay = ({ show, onEnter }: IntroOverlayProps) => {
  // A handful of softly twinkling dots scattered around the screen,
  // regenerated only once per mount.
  const dots = useMemo(
    () =>
      Array.from({ length: 10 }).map(() => ({
        top: `${Math.random() * 90 + 5}%`,
        left: `${Math.random() * 90 + 5}%`,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 2.5,
        duration: 2 + Math.random() * 1.5,
      })),
    []
  );

  useEffect(() => {
    if (!show) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = () => onEnter();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onEnter]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onClick={onEnter}
          role="button"
          tabIndex={0}
          aria-label="Click anywhere to enter"
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer select-none"
        >
          {dots.map((dot, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white"
              style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
              animate={{ opacity: [0.15, 0.85, 0.15] }}
              transition={{
                duration: dot.duration,
                repeat: Infinity,
                delay: dot.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          <motion.p
            className="font-retro text-white text-base sm:text-xl md:text-2xl tracking-wide relative z-10"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            Click Anywhere
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroOverlay;
