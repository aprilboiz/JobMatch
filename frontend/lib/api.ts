export async function login(email: string, password: string) {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Đăng nhập thất bại')
  }

  return res.json()
}
export async function register(data: {
  fullName: string
  email: string
  phone: string
  password: string
  role: string
}) {
  const res = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Đăng ký thất bại')
  }

  return res.json()
}
