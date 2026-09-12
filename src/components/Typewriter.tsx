import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  typingSpeed?: number; // ms per character while typing
  deletingSpeed?: number; // ms per character while deleting
  pauseAfterTyping?: number; // ms to hold the full text before deleting
  pauseAfterDeleting?: number; // ms to hold empty before retyping
  className?: string;
}

/**
 * Types out `text` one character at a time, pauses, deletes it back down
 * to nothing, pauses, then repeats — looping forever.
 */
const Typewriter = ({
  text,
  typingSpeed = 45,
  deletingSpeed = 25,
  pauseAfterTyping = 1800,
  pauseAfterDeleting = 500,
  className,
}: TypewriterProps) => {
  const [display, setDisplay] = useState('');
  const [phase, setPhase] = useState<'typing' | 'deleting'>('typing');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (display.length < text.length) {
        timeout = setTimeout(() => setDisplay(text.slice(0, display.length + 1)), typingSpeed);
      } else {
        timeout = setTimeout(() => setPhase('deleting'), pauseAfterTyping);
      }
    } else {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(text.slice(0, display.length - 1)), deletingSpeed);
      } else {
        timeout = setTimeout(() => setPhase('typing'), pauseAfterDeleting);
      }
    }

    return () => clearTimeout(timeout);
  }, [display, phase, text, typingSpeed, deletingSpeed, pauseAfterTyping, pauseAfterDeleting]);

  return (
    <span className={className}>
      {display}
      <span
        aria-hidden="true"
        className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle animate-pulse"
      />
    </span>
  );
};

export default Typewriter;
