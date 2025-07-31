import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Leaf, 
  Award, 
  TrendingUp, 
  Calendar,
  Gift,
  Heart,
  Store
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Activity {
  id: string;
  date: Date;
  points: number;
  items: string[];
  reductionAmount: number;
}

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!userProfile) return;

      try {
        let activities: Activity[] = [];
        
        // 開発環境ではローカルストレージから取得
        if (import.meta.env.DEV) {
          const stored = localStorage.getItem('activities');
          if (stored) {
            const allActivities = JSON.parse(stored);
            activities = allActivities
              .filter((activity: any) => activity.userId === userProfile.uid)
              .slice(0, 5)
              .map((activity: any) => ({
                ...activity,
                date: new Date(activity.createdAt)
              }));
          }
        } else {
          const q = query(
            collection(db, 'activities'),
            where('userId', '==', userProfile.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            activities.push({
              id: doc.id,
              date: data.createdAt.toDate(),
              points: data.points,
              items: data.items || [],
              reductionAmount: data.reductionAmount || 0
            });
          });
        }
        
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        // デモ用のダミーデータ
        setRecentActivities([
          {
            id: '1',
            date: new Date(),
            points: 150,
            items: ['牛乳', 'パン', 'ヨーグルト'],
            reductionAmount: 0.8
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000),
            points: 200,
            items: ['お弁当', 'サラダ'],
            reductionAmount: 1.2
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, [userProfile]);

  if (!userProfile) return null;

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'エコヒーロー': return 'text-purple-600 bg-purple-100';
      case 'エコマスター': return 'text-blue-600 bg-blue-100';
      case 'エコチャレンジャー': return 'text-green-600 bg-green-100';
      case 'エコサポーター': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNextRankInfo = (currentRank: string, currentPoints: number) => {
    const ranks = [
      { name: 'エコビギナー', threshold: 0 },
      { name: 'エコサポーター', threshold: 500 },
      { name: 'エコチャレンジャー', threshold: 2000 },
      { name: 'エコマスター', threshold: 5000 },
      { name: 'エコヒーロー', threshold: 10000 }
    ];

    const currentIndex = ranks.findIndex(r => r.name === currentRank);
    if (currentIndex >= ranks.length - 1) return null;

    const nextRank = ranks[currentIndex + 1];
    const progress = ((currentPoints - ranks[currentIndex].threshold) / 
                     (nextRank.threshold - ranks[currentIndex].threshold)) * 100;

    return {
      nextRankName: nextRank.name,
      pointsNeeded: nextRank.threshold - currentPoints,
      progress: Math.min(progress, 100)
    };
  };

  const nextRankInfo = getNextRankInfo(userProfile.rank, userProfile.totalPoints);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          こんにちは、{userProfile.displayName}さん！
        </h1>
        <p className="text-gray-600">今日もエコ活動を続けましょう</p>
      </div>

      {/* メインステータスカード */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ポイントカード */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">合計ポイント</p>
              <p className="text-3xl font-bold">{userProfile.totalPoints.toLocaleString()}</p>
            </div>
          </div>
          
          {/* ランク表示 */}
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRankColor(userProfile.rank)}`}>
              <Award className="w-3 h-3 inline mr-1" />
              {userProfile.rank}
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">CO2削減量</p>
              <p className="text-lg font-semibold">{userProfile.totalReduction.toFixed(1)}kg</p>
            </div>
          </div>

          {/* 次のランクまでの進捗 */}
          {nextRankInfo && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between text-xs mb-2">
                <span>次のランク: {nextRankInfo.nextRankName}</span>
                <span>あと{nextRankInfo.pointsNeeded}pt</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${nextRankInfo.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            ポイント活用
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <div className="flex items-center">
                <Store className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">店舗で割引利用</p>
                  <p className="text-sm text-gray-600">提携店舗で使用可能</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-3 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">環境団体に寄付</p>
                  <p className="text-sm text-gray-600">食品ロス削減団体を支援</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-3 bg-amber-50 hover:bg-amber-100 rounded-lg text-left transition-colors">
              <div className="flex items-center">
                <Gift className="w-5 h-5 text-amber-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">限定グッズ交換</p>
                  <p className="text-sm text-gray-600">エコグッズと交換</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 最近の活動 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-600" />
          最近の活動
        </h3>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-gray-800">
                      +{activity.points}ポイント獲得
                    </p>
                    <span className="text-xs text-gray-500">
                      {activity.date.toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {activity.items.join('、')} ({activity.reductionAmount}kg削減)
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>まだ活動履歴がありません</p>
            <p className="text-sm mt-1">レシートをスキャンして始めましょう！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;