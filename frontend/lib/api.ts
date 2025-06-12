export async function login(email: string, password: string) {
  const res = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Đăng nhập thất bại");
  }

  return res.json();
}
export async function register(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}) {
  const res = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Đã xảy ra lỗi không xác định" })); // Đảm bảo luôn có errorData
    const error = new Error(errorData.message || "Đăng ký thất bại");
    // @ts-ignore: add custom fields to Error object
    error.status = res.status; // <--- THÊM DÒNG NÀY
    error.errors = errorData.errors || {};
    throw error;
  }

  return res.json();
}
