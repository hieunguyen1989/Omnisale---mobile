import { GoogleGenAI } from "@google/genai";
import { Product, Order } from '../types';

export const generateBusinessInsight = async (
  prompt: string,
  products: Product[],
  orders: Order[]
): Promise<string> => {
  // Use GoogleGenAI with apiKey from process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare context data to send to Gemini
  const context = {
    inventorySummary: products.map(p => ({ name: p.name, stock: p.stock, platforms: p.platforms, status: p.status })),
    recentOrders: orders.slice(0, 5).map(o => ({ id: o.id, total: o.total, status: o.status, platform: o.platform })),
    totalRevenue: orders.reduce((acc, curr) => acc + curr.total, 0),
    lowStockItems: products.filter(p => p.stock < 10).map(p => p.name)
  };

  const fullPrompt = `
    You are an AI assistant for an E-commerce dashboard called 'OmniSales'.
    
    Here is the current business context in JSON format:
    ${JSON.stringify(context)}

    Please answer the following user question based on this data. Keep the answer concise, professional, and actionable.
    User Question: ${prompt}
  `;

  try {
    // Update to recommended model 'gemini-3-flash-preview' for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
    });
    
    return response.text || "I couldn't generate an insight at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while communicating with the AI service.";
  }
};

export const generateProductDescription = async (
  productName: string,
  category: string,
  keywords: string
): Promise<string> => {
  // Use GoogleGenAI with apiKey from process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Bạn là một chuyên gia Content Marketing cho thương mại điện tử.
    Hãy viết một mô tả sản phẩm hấp dẫn, chuẩn SEO cho sản phẩm sau:
    - Tên sản phẩm: ${productName}
    - Danh mục: ${category}
    - Từ khóa nổi bật: ${keywords}

    Yêu cầu:
    - Sử dụng ngôn ngữ tiếng Việt tự nhiên, thu hút.
    - Cấu trúc bài viết: Mở đầu hấp dẫn, Các tính năng chính (gạch đầu dòng), Lợi ích khách hàng, và Kêu gọi hành động (CTA).
    - Sử dụng biểu tượng cảm xúc (emoji) phù hợp để làm nổi bật nội dung.
    - Độ dài khoảng 150-250 từ.
  `;

  try {
    // Update to recommended model 'gemini-3-flash-preview' for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Gen Desc Error", error);
    return "";
  }
};