import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.displayName) {
          setError('お名前を入力してください');
          return;
        }
        await register(formData.email, formData.password, formData.displayName);
      }
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('メールアドレスまたはパスワードが間違っています');
          break;
        case 'auth/email-already-in-use':
          setError('このメールアドレスは既に使用されています');
          break;
        case 'auth/weak-password':
          setError('パスワードは6文字以上で入力してください');
          break;
        case 'auth/invalid-email':
          setError('有効なメールアドレスを入力してください');
          break;
        default:
          setError('エラーが発生しました。もう一度お試しください');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ロゴとタイトル */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Eco-Point</h1>
            <p className="text-gray-600 text-sm">食品ロス削減でポイントゲット</p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 名前入力（新規登録時のみ） */}
            {!isLogin && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  お名前
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="田中太郎"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="6文字以上"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              {loading ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成')}
            </button>
          </form>

          {/* 切り替えリンク */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              {isLogin ? 'まだアカウントをお持ちでない方' : '既にアカウントをお持ちの方'}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-600 hover:text-green-700 font-medium text-sm mt-1"
            >
              {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs">
            てまえどりで環境に貢献しよう
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;