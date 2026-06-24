import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import styles from './WelcomePage.module.css'

export function WelcomePage() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>
      {/* Top navigation bar */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <svg
            className={styles.navLogo}
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
          <span className={styles.navBrandName}>WorkShop AI</span>
        </div>

        <div className={styles.navRight}>
          <span className={styles.navUser}>
            {session?.username}
          </span>
          <button className={styles.btnLogout} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>Acceso autorizado</div>
          <h1 className={styles.heroTitle}>
            Bienvenido,<br />
            <span className={styles.heroName}>{session?.username}</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Sesión activa. Tu token de acceso es válido durante{' '}
            <strong>{session?.expires_in ? Math.floor(session.expires_in / 60) : '?'} minutos</strong>.
          </p>
        </section>

        {/* Token info cards */}
        <section className={styles.cards}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Access Token</p>
            <code className={styles.cardToken}>
              {session?.access_token.slice(0, 40)}…
            </code>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Almacenamiento</p>
            <p className={styles.cardValue}>Session Storage</p>
            <p className={styles.cardDesc}>
              El token persiste durante la sesión del navegador y se elimina al cerrar la pestaña.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Estado</p>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              Autenticado
            </div>
            <p className={styles.cardDesc}>
              Autenticación JWT con tokens de acceso y refresco.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} WorkShop AI — JWT Authentication Demo</p>
      </footer>
    </div>
  )
}
