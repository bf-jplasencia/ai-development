import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Already authenticated → redirect
  if (isAuthenticated) {
    navigate('/welcome', { replace: true })
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ username, password })
      navigate('/welcome', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <svg
            className={styles.logo}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="36" height="36" rx="9" fill="#2997ff" />
            <path
              d="M18 8C13.03 8 9 12.03 9 17c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9Zm0 4a5 5 0 1 1 0 10A5 5 0 0 1 18 12Z"
              fill="#fff"
            />
          </svg>
          <span className={styles.brandName}>WorkShop AI</span>
        </div>

        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>
          Ingresa tus credenciales para continuar
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              autoComplete="username"
              autoFocus
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
            />
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {/* Error banner */}
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <button
            className={styles.btnPrimary}
            type="submit"
            disabled={loading || !username || !password}
          >
            {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {loading ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>

        <p className={styles.hint}>
          Usuario de demo: <code>admin</code> / <code>admin123</code>
        </p>
      </div>
    </main>
  )
}
