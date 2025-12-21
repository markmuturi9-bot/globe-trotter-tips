import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';
import { MapView } from '@/components/views/MapView';
import { CreateTipDialog } from '@/components/tips/CreateTipDialog';

export default function Map() {
  const navigate = useNavigate();
  const [showCreateTip, setShowCreateTip] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onCreateTip={() => setShowCreateTip(true)} />
      
      <div className="hidden md:block">
        <MainNav activeView="map" onViewChange={(view) => navigate(`/${view}`)} />
      </div>
      
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        <MapView />
      </main>
      
      <div className="md:hidden">
        <MainNav activeView="map" onViewChange={(view) => navigate(`/${view}`)} />
      </div>
      
      {showCreateTip && (
        <CreateTipDialog onClose={() => setShowCreateTip(false)} />
      )}
    </div>
  );
}
