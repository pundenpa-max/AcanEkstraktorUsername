import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from "../utils/fileUtils";

// Kita pindahkan inisialisasi ke dalam fungsi agar aplikasi tidak crash 
// saat pertama kali load jika environment variable API_KEY tidak ada.
// Ini memungkinkan fitur utama (filename extractor) jalan tanpa AI.

export const extractUsernameFromMedia = async (file: File): Promise<string> => {
  try {
    // Cek apakah API Key tersedia
    if (!process.env.API_KEY) {
      throw new Error("API Key tidak ditemukan. Fitur AI tidak aktif.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const prompt = `
      Analyze this image and identify any text that looks like a username, handle, or user ID.
      - Look for text starting with '@'.
      - Look for text in headers, profiles, or overlays.
      - If multiple are found, return the most prominent one.
      - Return ONLY the username string. Do not add any explanation, labels, or extra text.
      - If no username is found, return "Tidak ada username terdeteksi".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    const text = response.text;
    return text ? text.trim() : "Tidak ada hasil";
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    // Lempar error message yang spesifik agar bisa ditangkap UI
    throw new Error(error.message || "Gagal mengekstrak teks menggunakan AI.");
  }
};