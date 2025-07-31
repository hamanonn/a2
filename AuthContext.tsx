import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 開発環境用のモックユーザー型
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
  totalPoints: number;
  totalReduction: number; // kg単位
  rank: string;
  joinedAt: string;
  createdAt: Date;
}

interface AuthContextType {
  currentUser: MockUser | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateProfile: (data: { displayName?: string; bio?: string; profileImage?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getRankByPoints = (points: number): string => {
  if (points >= 10000) return 'エコヒーロー';
  if (points >= 5000) return 'エコマスター';
  if (points >= 2000) return 'エコチャレンジャー';
  if (points >= 500) return 'エコサポーター';
  return 'エコビギナー';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 開発環境用のモック認証システム
  const login = async (email: string, password: string) => {
    // バリデーション
    if (!email || !password) {
      throw new Error('メールアドレスとパスワードを入力してください');
    }
    
    // ローカルストレージから既存ユーザーを確認
    const users = JSON.parse(localStorage.getItem('eco_point_users') || '{}');
    const user = users[email];
    
    if (!user || user.password !== password) {
      const error = new Error('メールアドレスまたはパスワードが間違っています');
      (error as any).code = 'auth/user-not-found';
      throw error;
    }
    
    const mockUser: MockUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
    
    setCurrentUser(mockUser);
    localStorage.setItem('eco_point_current_user', JSON.stringify(mockUser));
  };

  const register = async (email: string, password: string, displayName: string) => {
    // バリデーション
    if (!email || !password || !displayName) {
      const error = new Error('すべての項目を入力してください');
      (error as any).code = 'auth/invalid-email';
      throw error;
    }
    
    if (password.length < 6) {
      const error = new Error('パスワードは6文字以上で入力してください');
      (error as any).code = 'auth/weak-password';
      throw error;
    }
    
    // 既存ユーザーチェック
    const users = JSON.parse(localStorage.getItem('eco_point_users') || '{}');
    if (users[email]) {
      const error = new Error('このメールアドレスは既に使用されています');
      (error as any).code = 'auth/email-already-in-use';
      throw error;
    }
    
    // 新規ユーザー作成
    const uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newUser = { uid, email, displayName, password };
    
    users[email] = newUser;
    localStorage.setItem('eco_point_users', JSON.stringify(users));
    
    // ログイン状態にする
    await login(email, password);
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('eco_point_current_user');
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    
    const updatedProfile = { ...userProfile, ...data };
    if (data.totalPoints !== undefined) {
      updatedProfile.rank = getRankByPoints(data.totalPoints);
    }
    
    localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
  };

  const fetchUserProfile = async (user: MockUser) => {
    try {
      const stored = localStorage.getItem(`user_${user.uid}`);
      if (stored) {
        const data = JSON.parse(stored) as UserProfile;
        setUserProfile(data);
      } else {
        // 初回ログイン時のデフォルトプロフィール
        const defaultProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          username: user.email.split('@')[0], // メールアドレスからユーザー名を生成
          displayName: user.displayName,
          totalPoints: 0,
          totalReduction: 0,
          rank: 'エコビギナー',
          joinedAt: new Date().toISOString(),
          createdAt: new Date()
        };
        localStorage.setItem(`user_${user.uid}`, JSON.stringify(defaultProfile));
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // currentUserが変更されたときにプロフィールを取得
    if (currentUser && !userProfile) {
      fetchUserProfile(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    // 初期化時にローカルストレージから現在のユーザーを復元
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem('eco_point_current_user');
        if (stored) {
          const user = JSON.parse(stored) as MockUser;
          setCurrentUser(user);
          await fetchUserProfile(user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const updateProfile = async (data: { displayName?: string; bio?: string; profileImage?: string }) => {
    if (!currentUser || !userProfile) return;
    
    const updatedProfile = { ...userProfile };
    if (data.displayName !== undefined) updatedProfile.displayName = data.displayName;
    if (data.bio !== undefined) updatedProfile.bio = data.bio;
    if (data.profileImage !== undefined) updatedProfile.profileImage = data.profileImage;
    
    localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    loading,
    updateUserProfile,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};