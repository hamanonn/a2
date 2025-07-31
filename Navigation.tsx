import React from 'react';
import { Home, History, Camera, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: 'dashboard' | 'history' | 'scanner' | 'profile';
  onViewChange: (view: 'dashboard' | 'history' | 'scanner' | 'profile') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { logout, userProfile } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('ログアウトしますか？')) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const navItems = [
    {
      key: 'dashboard' as const,
      icon: Home,
      label: 'ホーム',
      color: 'text-green-600'
    },
    {
      key: 'scanner' as const,
      icon: Camera,
      label: 'スキャン',
      color: 'text-blue-600'
    },
    {
      key: 'history' as const,
      icon: History,
      label: '履歴',
      color: 'text-purple-600'
    },
    {
      key: 'profile' as const,
      icon: User,
      label: 'プロフィール',
      color: 'text-orange-600'
    }
  ];

  return (
    <>
      {/* ボトムナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              
              return (
                <button
                  key={item.key}
                  onClick={() => onViewChange(item.key)}
                  className={`flex flex-col items-center py-2 px-3 transition-all ${
                    isActive 
                      ? `${item.color}`
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                </button>
              );
            })}
            
            {/* ログアウトボタン */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center py-2 px-3 text-red-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-6 h-6 mb-1 transition-transform hover:scale-110" />
              <span className="text-xs font-medium">ログアウト</span>
            </button>
          </div>
        </div>
      </div>

      {/* トップヘッダー（ユーザー情報） */}
      {userProfile && (
        <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-green-600">
                  {userProfile.displayName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{userProfile.displayName}</p>
                <p className="text-xs text-gray-600">{userProfile.rank}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-right">
                <p className="font-bold text-green-600">{userProfile.totalPoints}pt</p>
                <p className="text-xs text-gray-500">{userProfile.totalReduction.toFixed(1)}kg削減</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;