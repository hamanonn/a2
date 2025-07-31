import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import ReceiptScanner from './components/ReceiptScanner';
import ActivityHistory from './components/ActivityHistory';
import Profile from './components/Profile';
import Navigation from './components/Navigation';

const AppContent: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'scanner' | 'profile'>('dashboard');

  if (!currentUser || !userProfile) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'scanner':
        return <ReceiptScanner />;
      case 'history':
        return <ActivityHistory />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* コンテンツエリア（上下のナビゲーション分のマージンを確保） */}
      <div className="pt-16 pb-20">
        {renderContent()}
      </div>
      
      {/* ナビゲーション */}
      <Navigation 
        currentView={currentView}
        onViewChange={setCurrentView}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;