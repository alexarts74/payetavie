'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '4rem', fontWeight: 700, color: '#6366f1', marginBottom: '1rem' }}>
            Erreur
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#18181b', marginBottom: '0.5rem' }}>
            Une erreur critique est survenue
          </h1>
          <p style={{ color: '#71717a', marginBottom: '2rem', maxWidth: '24rem' }}>
            L&apos;application a rencontré un problème inattendu.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Recharger la page
          </button>
        </div>
      </body>
    </html>
  )
}
