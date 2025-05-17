/**
 * Utility functions for handling images
 */

// ถ้ารูปภาพอยู่ใน Firebase Storage ที่ URL นี้
const FIREBASE_STORAGE_URL = "https://firebasestorage.googleapis.com/v0/b/jubetechproject-45364.firebasestorage.app/o/jubetech";

// ถ้ารูปภาพอยู่บนเซิร์ฟเวอร์ของเรา
const API_BASE_URL = "http://localhost:8000";

/**
 * Convert a path to a complete URL for displaying images
 * @param path - The path or URL of the image
 * @returns Complete URL for displaying the image
 */
export const getImageUrl = (path: string): string => {
  if (!path) return "";
  
  // ถ้าเป็น URL ที่สมบูรณ์อยู่แล้ว (เริ่มต้นด้วย http หรือ https) ให้ส่งคืนค่าเดิม
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // ถ้าเป็น path ที่เริ่มต้นด้วย /uploads หรือ /images ให้ประกอบกับ API_BASE_URL
  if (path.startsWith("/uploads") || path.startsWith("/images")) {
    return `${API_BASE_URL}${path}`;
  }
  
  // ถ้าเป็น path ที่อยู่ใน Firebase Storage
  // ลบ / นำหน้าออก (ถ้ามี)
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  
  // Encode path สำหรับใช้ใน URL
  const encodedPath = encodeURIComponent(cleanPath);
  
  // ส่งคืน URL ที่สมบูรณ์
  return `${FIREBASE_STORAGE_URL}${encodedPath}?alt=media`;
};
