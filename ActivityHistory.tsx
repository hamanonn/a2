import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  ShoppingBag, 
  Leaf, 
  TrendingUp,
  Filter,
  Search,
  Award
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  where,
  Timestamp,
  startAfter,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface Activity {
  id: string;
  date: Date;
  storeName: string;
  items: string[];
  points: number;
  reductionAmount: number;
  receiptTotal: number;
}

const ActivityHistory: React.FC = () => {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, week, month, year
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalPoints: 0,
    totalReduction: 0,
    averagePoints: 0
  });

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userProfile) return;

      try {
        let fetchedActivities: Activity[] = [];
        
        // 開発環境ではローカルストレージから取得
        if (import.meta.env.DEV) {
          const stored = localStorage.getItem('activities');
          if (stored) {
            const activities = JSON.parse(stored);
            fetchedActivities = activities
              .filter((activity: any) => activity.userId === userProfile.uid)
              .map((activity: any) => ({
                ...activity,
                date: new Date(activity.createdAt)
              }));
          }
        } else {
          const q = query(
            collection(db, 'activities'),
            where('userId', '==', userProfile.uid),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedActivities.push({
              id: doc.id,
              date: data.createdAt.toDate(),
              storeName: data.storeName || '不明な店舗',
              items: data.items || [],
              points: data.points || 0,
              reductionAmount: data.reductionAmount || 0,
              receiptTotal: data.receiptTotal || 0
            });
          });
        }
        
        setActivities(fetchedActivities);
        
        // 統計計算
        const totalPoints = fetchedActivities.reduce((sum, activity) => sum + activity.points, 0);
        const totalReduction = fetchedActivities.reduce((sum, activity) => sum + activity.reductionAmount, 0);
        
        setStats({
          totalActivities: fetchedActivities.length,
          totalPoints,
          totalReduction,
          averagePoints: fetchedActivities.length > 0 ? Math.round(totalPoints / fetchedActivities.length) : 0
        });
        
      } catch (error) {
        console.error('Error fetching activities:', error);
        // デモ用のダミーデータ
        const demoActivities = [
          {
            id: '1',
            date: new Date(),
            storeName: 'エコマート 渋谷店',
            items: ['牛乳', 'パン', 'ヨーグルト'],
            points: 180,
            reductionAmount: 0.9,
            receiptTotal: 584
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000),
            storeName: 'グリーンスーパー',
            items: ['お弁当', 'サラダ'],
            points: 250,
            reductionAmount: 1.3,
            receiptTotal: 746
          },
          {
            id: '3',
            date: new Date(Date.now() - 172800000),
            storeName: 'エコマート 新宿店',
            items: ['サンドイッチ', 'おにぎり', '総菜'],
            points: 320,
            reductionAmount: 1.8,
            receiptTotal: 892
          }
        ];
        setActivities(demoActivities);
        setStats({
          totalActivities: 3,
          totalPoints: 750,
          totalReduction: 4.0,
          averagePoints: 250
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userProfile]);

  useEffect(() => {
    let filtered = activities;

    // 期間フィルター
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const periodStart = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(activity => activity.date >= periodStart);
    }

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredActivities(filtered);
  }, [activities, selectedPeriod, searchTerm]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">活動履歴</h1>
        <p className="text-gray-600">あなたのエコ活動の記録です</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalActivities}</p>
          <p className="text-sm text-gray-600">回数</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalPoints}</p>
          <p className="text-sm text-gray-600">総ポイント</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalReduction.toFixed(1)}</p>
          <p className="text-sm text-gray-600">kg削減</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.averagePoints}</p>
          <p className="text-sm text-gray-600">平均pt</p>
        </div>
      </div>

      {/* フィルターとサーチ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 検索 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="店舗名や商品名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* 期間フィルター */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">全期間</option>
              <option value="week">過去1週間</option>
              <option value="month">過去1ヶ月</option>
              <option value="year">過去1年間</option>
            </select>
          </div>
        </div>
      </div>

      {/* 活動一覧 */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <ShoppingBag className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{activity.storeName}</h3>
                    <p className="text-sm text-gray-600">{formatDate(activity.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">+{activity.points}pt</p>
                  <p className="text-sm text-gray-600">{activity.reductionAmount.toFixed(1)}kg削減</p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">てまえどりした商品:</p>
                    <p className="text-gray-800">{activity.items.join('、')}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    レシート合計: ¥{activity.receiptTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {searchTerm || selectedPeriod !== 'all' ? 
                '該当する活動が見つかりません' : 
                'まだ活動履歴がありません'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedPeriod !== 'all' ? 
                '検索条件を変更してお試しください' : 
                'レシートをスキャンしてエコ活動を始めましょう！'
              }
            </p>
            {(searchTerm || selectedPeriod !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPeriod('all');
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                フィルターをクリア
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;