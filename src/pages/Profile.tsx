import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';
import { ProfileView } from '@/components/views/ProfileView';
import { CreateTipDialog } from '@/components/tips/CreateTipDialog';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showCreateTip, setShowCreateTip] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onCreateTip={() => setShowCreateTip(true)} />
      
      <div className="hidden md:block">
        <MainNav activeView="profile" onViewChange={(view) => navigate(`/${view}`)} />
      </div>
      
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        <ProfileView />
      </main>
      
      <div className="md:hidden">
        <MainNav activeView="profile" onViewChange={(view) => navigate(`/${view}`)} />
      </div>
      
      {showCreateTip && (
        <CreateTipDialog onClose={() => setShowCreateTip(false)} />
      )}
    </div>
  );
}
