import { motion } from 'framer-motion';

interface NavigationProps {
  activeTab: 'home' | 'projects' | 'contact';
  onTabChange: (tab: 'home' | 'projects' | 'contact') => void;
  onHelpClick: () => void;
}

const Navigation = ({ activeTab, onTabChange, onHelpClick }: NavigationProps) => {
  const tabs: Array<'home' | 'projects' | 'contact'> = ['home', 'projects', 'contact'];

  return (
    <div className="flex justify-between p-2 border-b" style={{ borderColor: 'hsl(240 4% 20% / 0.3)' }}>
      <div className="flex gap-1 relative">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`nav-tab relative ${activeTab === tab ? 'nav-tab-active' : 'nav-tab-inactive'}`}
          >
            {activeTab === tab && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-md bg-white/10"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative">{tab}</span>
          </button>
        ))}
      </div>
      <motion.button
        onClick={onHelpClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        [?]
      </motion.button>
    </div>
  );
};

export default Navigation;
