import { apiEndpoints } from "./endpoints";
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

export const uploadApi = {
  cloudinary: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload<CloudinaryUploadResult>(
      apiEndpoints.upload.cloudinary,
      formData
    );
  },
};
