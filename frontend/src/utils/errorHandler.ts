import axios from 'axios';
import { ApiErrorResponse } from '../features/auth/types/auth.types';

export const getErrorMessage = (error: unknown): string => {
  // Nếu là lỗi trả về từ Axios
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse | undefined;

    // 1. Nếu backend có trả về message cụ thể
    if (apiError?.message) {
      // Nếu có chi tiết lỗi của từng trường (FluentValidation)
      if (apiError.errors) {
        const firstErrorKey = Object.keys(apiError.errors)[0];
        if (firstErrorKey && apiError.errors[firstErrorKey].length > 0) {
          return apiError.errors[firstErrorKey][0];
        }
      }
      return apiError.message;
    }

    // 2. Lỗi do không kết nối được tới Backend (Server chưa bật hoặc lỗi CORS)
    if (error.code === 'ERR_NETWORK') {
      return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại Backend!';
    }
  }

  // 3. Các lỗi Javascript thông thường khác
  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại!';
};
