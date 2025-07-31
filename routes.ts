import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateUserProfileSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Google Vision OCR処理用エンドポイント
  app.post('/api/vision-ocr', upload.single('image'), async (req, res) => {
    try {
      const API_KEY = process.env.GOOGLE_VISION_API_KEY;
      
      if (!API_KEY) {
        return res.status(400).json({ 
          error: 'Google Vision API キーが設定されていません',
          success: false 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          error: '画像ファイルがアップロードされていません', 
          success: false 
        });
      }

      // 画像をBase64に変換
      const base64Image = req.file.buffer.toString('base64');

      // Google Vision API呼び出し
      const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
          }]
        })
      });

      if (!visionResponse.ok) {
        const errorText = await visionResponse.text();
        console.error('Vision API error:', errorText);
        
        // APIが有効でない場合の特別処理
        if (errorText.includes('SERVICE_DISABLED') || errorText.includes('has not been used')) {
          return res.status(503).json({ 
            error: 'Google Cloud Vision APIが有効になっていません。Google Cloud Consoleでプロジェクト内のVision APIを有効にしてください。', 
            success: false,
            needsApiEnabled: true,
            activationUrl: 'https://console.developers.google.com/apis/api/vision.googleapis.com/overview'
          });
        }
        
        return res.status(500).json({ 
          error: 'Vision API エラー: APIの設定を確認してください', 
          success: false,
          details: errorText
        });
      }

      const visionResult = await visionResponse.json();
      const detectedText = visionResult.responses?.[0]?.textAnnotations?.[0]?.description || '';

      if (!detectedText) {
        return res.status(400).json({ 
          error: 'レシートからテキストを検出できませんでした', 
          success: false 
        });
      }

      console.log('OCR処理成功:', detectedText.substring(0, 100) + '...');
      
      res.json({ 
        success: true, 
        text: detectedText 
      });
      
    } catch (error) {
      console.error('OCR endpoint error:', error);
      res.status(500).json({ 
        error: 'サーバーエラー: ' + error.message, 
        success: false 
      });
    }
  });

  // プロフィール更新用エンドポイント
  app.put('/api/profile/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ 
          error: '無効なユーザーIDです', 
          success: false 
        });
      }

      // リクエストボディの検証
      const profileData = updateUserProfileSchema.parse(req.body);
      
      // プロフィール更新
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      
      if (!updatedUser) {
        return res.status(404).json({ 
          error: 'ユーザーが見つかりません', 
          success: false 
        });
      }

      // パスワードを除外してレスポンス
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({ 
        success: true, 
        user: userWithoutPassword 
      });
      
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ 
        error: 'プロフィールの更新に失敗しました: ' + error.message, 
        success: false 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
