import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';
import { ListView } from '@/components/views/ListView';
import { CreateTipDialog } from '@/components/tips/CreateTipDialog';

export default function List() {
  const navigate = useNavigate();
  const [showCreateTip, setShowCreateTip] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onCreateTip={() => setShowCreateTip(true)} />
      
      {/* Spacer for fixed header */}
      <div className="h-16" style={{ paddingTop: 'env(safe-area-inset-top)' }} />
      
      <div className="hidden md:block">
        <MainNav activeView="list" onViewChange={(view) => navigate(`/${view}`)} />
      </div>
      
      <main className="flex-1 flex flex-col overflow-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)' }}>
        <ListView />
      </main>
      
      <div className="md:hidden">
        <MainNav activeView="list" onViewChange={(view) => navigate(`/${view}`)} />
      </div>
      
      {showCreateTip && (
        <CreateTipDialog onClose={() => setShowCreateTip(false)} />
      )}
    </div>
  );
}
