import React, { useState, useRef } from 'react';
import { User, Settings, Camera, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [profileImage, setProfileImage] = useState(userProfile?.profileImage || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 画像ファイルのみ許可
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // ファイルサイズ制限（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます（5MB以下にしてください）');
      return;
    }

    setUploading(true);
    try {
      // Base64に変換してプロフィール画像として設定
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setProfileImage(base64);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました');
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        profileImage: profileImage || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました');
    }
  };

  const handleCancel = () => {
    setDisplayName(userProfile?.displayName || '');
    setBio(userProfile?.bio || '');
    setProfileImage(userProfile?.profileImage || '');
    setIsEditing(false);
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">プロフィールを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>編集</span>
          </button>
        )}
      </div>

      {/* プロフィールカード */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* プロフィール画像セクション */}
        <div className="relative bg-gradient-to-r from-green-400 to-blue-500 h-32">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="プロフィール画像"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* プロフィール情報 */}
        <div className="pt-16 p-6">
          {isEditing ? (
            <div className="space-y-6">
              {/* 表示名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="表示名を入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* 自己紹介 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="自己紹介を入力してください"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>保存</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>キャンセル</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 表示名 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {displayName || userProfile.username}
                </h2>
                <p className="text-gray-500">@{userProfile.username}</p>
              </div>

              {/* 自己紹介 */}
              {bio && (
                <div>
                  <p className="text-gray-700 leading-relaxed">{bio}</p>
                </div>
              )}

              {/* 統計情報 */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile.totalPoints || 0}
                  </div>
                  <div className="text-sm text-gray-500">総ポイント</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userProfile.joinedAt ? 
                      Math.floor((Date.now() - new Date(userProfile.joinedAt).getTime()) / (1000 * 60 * 60 * 24)) 
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-500">利用日数</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 隠れたファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default Profile;