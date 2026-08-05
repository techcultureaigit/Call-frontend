/**
 * upload.ts
 * Shared upload API — Cloudinary via Next.js BFF.
 *
 * uploadToCloudinary() → POST /api/upload/cloudinary
 */
import { apiUpload } from "./http";

export interface CloudinaryUploadResult {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    fileName: string;
    mock?: boolean;
  };
}

/** uploadToCloudinary() → POST /api/upload/cloudinary */
export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<CloudinaryUploadResult>("/api/upload/cloudinary", formData);
}

/** @deprecated Use uploadToCloudinary */
export const uploadApi = {
  cloudinary: uploadToCloudinary,
};
