import { Injectable, signal, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  isConfigured = signal(false);
  configurationError = signal<string | null>(null);

  constructor(@Inject(DOCUMENT) private document: Document) {
    try {
      // قراءة المفتاح من <meta name="gemini-api-key" content="..."> أو من window global
      let apiKey: string | null = null;
      const meta = this.document.querySelector('meta[name="gemini-api-key"]') as HTMLMetaElement | null;
      if (meta && meta.content && meta.content.trim().length > 0) {
        apiKey = meta.content.trim();
      } else if ((window as any).__PLATINUM__ && (window as any).__PLATINUM__.GEMINI_API_KEY) {
        apiKey = (window as any).__PLATINUM__.GEMINI_API_KEY;
      }

      if (!apiKey) {
        const errorMessage = 'Gemini API key is not configured. Image generation will be disabled.';
        this.configurationError.set(errorMessage);
        console.warn(errorMessage);
        return;
      }

      this.ai = new GoogleGenAI({ apiKey });
      this.isConfigured.set(true);
    } catch (error) {
      const errorMessage = 'Failed to initialize Gemini Service.';
      this.configurationError.set(errorMessage);
      console.error(errorMessage, error);
    }
  }

  // Helper to create data URL from image bytes (if returned as base64)
  private makeDataUrlFromBytes(imageBytes: string | undefined): string | undefined {
    if (!imageBytes) return undefined;
    // If already data URL, return; else assume base64 bytes
    if (imageBytes.startsWith('data:')) return imageBytes;
    return `data:image/jpeg;base64,${imageBytes}`;
  }

  async generateImage(prompt: string): Promise<string> {
    if (!this.isConfigured() || !this.ai) {
      throw new Error(this.configurationError() || 'Gemini service is not configured.');
    }

    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });

      const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;
      const dataUrl = this.makeDataUrlFromBytes(imageBytes);
      if (dataUrl) return dataUrl;

      throw new Error('Image generation failed, no images returned.');
    } catch (error: any) {
      console.error('Error generating image with Gemini API:', error);
      let errorMessage = 'An unknown error occurred during image generation.';
      if (error instanceof Error) errorMessage = error.message;
      else if (error && typeof error === 'object' && 'message' in error) errorMessage = String(error.message);
      throw new Error(errorMessage);
    }
  }

  async generateProductDetailsFromImage(base64Image: string, price: number, existingCategories: string[], instructions?: string): Promise<{ name: string; description: string; category: string; }> {
    if (!this.isConfigured() || !this.ai) {
      throw new Error(this.configurationError() || 'Gemini service is not configured.');
    }

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const categoriesString = existingCategories.length > 0 ? `[${existingCategories.join(', ')}]` : 'any suitable category';
    let prompt = `أنت خبير تسويق وتصميم في متجر إلكتروني. استنادًا إلى صورة المنتج المرفقة وسعره البالغ ${price} د.ج، قم بإنشاء كائن JSON باللغة العربية بالبنية التالية:
{ "name": "اسم جذاب للمنتج", "description": "وصف تسويقي احترافي ومقنع", "category": "أحد التصنيفات الموجودة" }.
- يجب أن يكون الاسم جذابًا ويصف المنتج.
- يجب أن يكون الوصف مفصلاً ومقنعًا، ويسلط الضوء على الميزات الرئيسية والفوائد للعميل.
- يجب أن يكون التصنيف واحدًا من القائمة التالية إن أمكن، أو اختر تصنيفًا عامًا مناسبًا إذا لم يتطابق المنتج مع أي منها: ${categoriesString}.`;

    if (instructions) {
      prompt += `\n- هام جداً: اتبع هذه الإرشادات الإضافية من المستخدم عند الإنشاء: "${instructions}"`;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: 'application/json',
        },
      });

      // قد يُرجع نصاً يغلف JSON بتنسيقات متعددة؛ نحاول استخراج JSON بأمان
      const raw = response.text || '{}';
      // حذف أي علامات ```json``` إن وُجدت ثم تحليل
      const cleaned = raw.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { name: String(parsed.name || parsed.title || 'منتج جديد'), description: String(parsed.description || 'وصف المنتج...'), category: String(parsed.category || existingCategories[0] || 'عام') };
    } catch (error: any) {
      console.error('Error generating product details with Gemini API:', error);
      let message = 'An unknown error occurred during AI processing.';
      if (error instanceof Error) message = error.message;
      else if (error && typeof error === 'object' && 'message' in error) message = String(error.message);
      throw new Error(message);
    }
  }
}