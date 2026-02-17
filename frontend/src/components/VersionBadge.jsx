import { useEffect, useState } from 'react'
import { getFormattedVersion } from '../config/version'

export default function VersionBadge() {
  const [commitHash, setCommitHash] = useState('')

  useEffect(() => {
    // Récupérer le hash du dernier commit
    const hash = process.env.REACT_APP_COMMIT_HASH || 'dev'
    setCommitHash(hash.slice(0, 7))
  }, [])

  return (
    <div
      title={`Commit: ${commitHash}`}
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        padding: '8px 12px',
        backgroundColor: 'var(--color-bg-secondary)',
        color: 'var(--color-text-secondary)',
        fontSize: '11px',
        fontFamily: 'var(--font-family-mono)',
        borderRadius: 'var(--border-radius-sm)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        opacity: 0.6,
        transition: 'opacity 0.2s',
        zIndex: 999,
      }}
      onMouseEnter={(e) => e.target.style.opacity = '1'}
      onMouseLeave={(e) => e.target.style.opacity = '0.6'}
    >
      {getFormattedVersion()}
    </div>
  )
}
