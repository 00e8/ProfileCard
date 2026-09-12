import { useState } from 'react';
import Starfield from '@/components/Starfield';
import ProfileCard from '@/components/ProfileCard';
import IntroOverlay from '@/components/IntroOverlay';

const Index = () => {
  const [entered, setEntered] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Starfield />
      <ProfileCard />
      <IntroOverlay show={!entered} onEnter={() => setEntered(true)} />
    </div>
  );
};

export default Index;
