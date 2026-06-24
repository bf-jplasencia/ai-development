import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { login as apiLogin, type LoginCredentials, type TokenResponse } from '../api/auth'

const SESSION_KEY = 'auth_session'

interface AuthSession {
  access_token: string
  refresh_token: string
  username: string
  expires_in: number
}

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(loadSession)

  const login = useCallback(async (credentials: LoginCredentials) => {
    const data: TokenResponse = await apiLogin(credentials)
    const newSession: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      username: credentials.username,
      expires_in: data.expires_in,
    }
    saveSession(newSession)
    setSession(newSession)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, isAuthenticated: session !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
