// Base URL — Vite proxies /auth → http://localhost:8000
const BASE_URL = '/auth'

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export async function login(credentials: LoginCredentials): Promise<TokenResponse> {
  const response = await fetch(`${BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error de autenticación' }))
    throw new Error(error.detail ?? 'Credenciales inválidas')
  }

  return response.json() as Promise<TokenResponse>
}
