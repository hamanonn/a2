// Google Cloud Vision APIを使用したOCR処理
interface OCRResult {
  storeName: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  date: string;
}

// レシートテキストから商品情報を抽出する関数
export const parseReceiptText = (text: string): OCRResult => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // 店舗名を抽出（通常は最初の数行にある）
  let storeName = '不明な店舗';
  const storePatterns = [
    /セブン[‐-]?イレブン/i,
    /ファミリーマート|ファミマ/i,
    /ローソン/i,
    /イオン/i,
    /イトーヨーカドー/i,
    /マルエツ/i,
    /ライフ/i,
    /サミット/i
  ];
  
  for (const line of lines.slice(0, 5)) {
    for (const pattern of storePatterns) {
      if (pattern.test(line)) {
        storeName = line;
        break;
      }
    }
    if (storeName !== '不明な店舗') break;
  }
  
  // 商品と価格を抽出
  const items: Array<{ name: string; price: number; quantity: number }> = [];
  const pricePattern = /(\d{1,3}(?:,\d{3})*|\d+)\s*円?$/;
  const quantityPattern = /×(\d+)/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 価格が含まれる行を探す
    const priceMatch = line.match(pricePattern);
    if (priceMatch) {
      const price = parseInt(priceMatch[1].replace(/,/g, ''));
      
      // 商品名を抽出（価格の前の部分）
      let productName = line.replace(priceMatch[0], '').trim();
      
      // 数量を抽出
      const quantityMatch = productName.match(quantityPattern);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
      
      // 数量表記を商品名から除去
      if (quantityMatch) {
        productName = productName.replace(quantityMatch[0], '').trim();
      }
      
      // 商品名が空でない場合のみ追加
      if (productName && price > 0 && price < 10000) { // 現実的な価格範囲
        items.push({
          name: productName,
          price: price,
          quantity: quantity
        });
      }
    }
  }
  
  // 合計金額を抽出
  let totalAmount = 0;
  const totalPatterns = [
    /合計[：:\s]*(\d{1,3}(?:,\d{3})*|\d+)/i,
    /小計[：:\s]*(\d{1,3}(?:,\d{3})*|\d+)/i,
    /総額[：:\s]*(\d{1,3}(?:,\d{3})*|\d+)/i
  ];
  
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        totalAmount = parseInt(match[1].replace(/,/g, ''));
        break;
      }
    }
    if (totalAmount > 0) break;
  }
  
  // 合計が見つからない場合は商品価格の合計を使用
  if (totalAmount === 0) {
    totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  // 日付を抽出
  let date = new Date().toLocaleDateString('ja-JP');
  const datePattern = /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/;
  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const day = parseInt(dateMatch[3]);
      date = new Date(year, month - 1, day).toLocaleDateString('ja-JP');
      break;
    }
  }
  
  return {
    storeName,
    items,
    totalAmount,
    date
  };
};

// Google Cloud Vision APIを呼び出す関数
export const processReceiptWithVision = async (imageFile: File): Promise<OCRResult> => {
  // ReplitでサーバーサイドのOCR処理を行う
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch('/api/vision-ocr', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.text) {
        console.log('OCR処理成功、テキストを解析中...');
        return parseReceiptText(result.text);
      }
    }
    
    const errorData = await response.json().catch(() => ({}));
    
    if (errorData.needsApiEnabled) {
      throw new Error('Google Vision APIが有効になっていません。管理者にAPI有効化を依頼してください。\n\n手順:\n1. Google Cloud Console にアクセス\n2. プロジェクトを選択\n3. APIs & Services > Library に移動\n4. Cloud Vision API を検索して有効化');
    }
    
    throw new Error(errorData.error || 'OCR処理に失敗しました');
    
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
};