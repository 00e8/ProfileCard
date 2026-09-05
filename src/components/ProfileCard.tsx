import { useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Navigation from './Navigation';
import DiscordStatus from './DiscordStatus';
import MusicPlayer from './MusicPlayer';
import ProjectsTab from './ProjectsTab';
import ContactTab from './ContactTab';
import TerminalDialog from './TerminalDialog';
import albumCover from '@/assets/album-cover.jpg';

const tracks = [
  {
    title: 'Shake it to the max',
    artist: 'MOLIY',
    albumArt: albumCover,
    duration: '3:00',
    audioSrc: '/audio/shake-it-to-the-max.mp3',
  },
];

// Discord User ID for Lanyard API
const DISCORD_USER_ID = '1319086535831719959';

const homeStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const homeItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const ProfileCard = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'contact'>('home');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        onMouseMove={handlePointerMove}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
        className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl glass-card glass-card-spotlight rounded-xl overflow-visible relative z-10"
      >
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onHelpClick={() => setTerminalOpen(true)}
        />

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
                  <p className="text-muted-foreground text-xs sm:text-sm leading-none mt-1 sm:mt-2">
                    full stack developer specializing in modern web technologies
                  </p>
                </motion.div>

                {/* Discord Status */}
                <motion.div variants={homeItem}>
                  <DiscordStatus userId={DISCORD_USER_ID} />
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
