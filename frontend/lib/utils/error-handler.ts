export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      case 403:
        return "Bạn không có quyền thực hiện hành động này."
      case 404:
        return "Không tìm thấy dữ liệu yêu cầu."
      case 422:
        return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
      case 500:
        return "Lỗi hệ thống. Vui lòng thử lại sau."
      default:
        return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Đã xảy ra lỗi không xác định."
}
