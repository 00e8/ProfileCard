import { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import Navigation from './Navigation';
import DiscordStatus from './DiscordStatus';
import DiscordServerCard from './DiscordServerCard';
import MusicPlayer from './MusicPlayer';
import ProjectsTab from './ProjectsTab';
import ContactTab from './ContactTab';
import TerminalDialog from './TerminalDialog';
import Typewriter from './Typewriter';
import albumCover from '@/assets/album-cover.jpg';

const tracks = [
  {
    title: 'Shake it to the max',
    artist: 'MOLIY',
    albumArt: albumCover,
    duration: '3:00',
    audioSrc: '/audio/shake-it-to-the-max.mp3',
  },
  {
    title: 'On My Own',
    artist: 'Unknown Artist', // TODO: replace with the real artist name
    albumArt: albumCover, // TODO: replace with real album art if you have one
    duration: '3:00', // TODO: replace with the real track length (mm:ss)
    audioSrc: '/audio/On%20My%20Own.mp3',
  },
];

// Discord User ID for Lanyard API
const DISCORD_USER_ID = '1319086535831719959';

// Discord server invite code (from https://discord.gg/masr)
const DISCORD_INVITE_CODE = 'masr';

const homeStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const homeItem: Variants = {
  hidden: { opacity: 0, y: -36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 20, mass: 0.7 },
  },
};

const navDrop: Variants = {
  hidden: { opacity: 0, y: -36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 20, mass: 0.7 },
  },
};

const ProfileCard = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'contact'>('home');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Normalised -0.5..0.5 cursor position within the card, driving a subtle
  // 3D tilt (perspective + rotateX/rotateY) that follows the mouse.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-7, 7]), springConfig);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);

    if (prefersReducedMotion) return;
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl glass-card glass-card-spotlight rounded-xl overflow-visible relative z-10"
      >
        <motion.div variants={navDrop} initial="hidden" animate="show">
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onHelpClick={() => setTerminalOpen(true)}
          />
        </motion.div>

        <div className="p-4 sm:p-5 md:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                variants={homeStagger}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
              >
                {/* Header */}
                <motion.div variants={homeItem} className="mb-4 sm:mb-5 md:mb-6">
                  <h1 className="text-xl sm:text-2xl md:text-3xl mb-0 font-medium leading-none tracking-tight font-retro">
                    HYZEX
                  </h1>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-none mt-1 sm:mt-2 min-h-[1em]">
                    <Typewriter text="Your life isn't yours if you always care what others think" />
                  </p>
                </motion.div>

                {/* Discord Status */}
                <motion.div variants={homeItem}>
                  <DiscordStatus userId={DISCORD_USER_ID} />
                </motion.div>

                {/* Discord Server */}
                <motion.div variants={homeItem} className="mt-3">
                  <DiscordServerCard inviteCode={DISCORD_INVITE_CODE} />
                </motion.div>

                {/* Music Player */}
                <motion.div variants={homeItem}>
                  <MusicPlayer tracks={tracks} />
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectsTab />
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <ContactTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <TerminalDialog open={terminalOpen} onOpenChange={setTerminalOpen} />
    </>
  );
};

export default ProfileCard;
