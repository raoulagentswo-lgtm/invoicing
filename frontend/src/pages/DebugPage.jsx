import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [token, setToken] = useState(null)
  const [decoded, setDecoded] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    setToken(t)

    // Decode JWT manually (without verification)
    if (t) {
      try {
        const parts = t.split('.')
        if (parts.length === 3) {
          const decoded = JSON.parse(atob(parts[1]))
          setDecoded(decoded)
        }
      } catch (err) {
        console.error('Error decoding token:', err)
      }
    }
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🔍 Token Debug Page</h1>

      <h2>Token Storage</h2>
      <p><strong>Present in localStorage:</strong> {token ? '✅ YES' : '❌ NO'}</p>

      {token && (
        <>
          <h2>Token Value</h2>
          <div style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '10px', 
            borderRadius: '4px', 
            wordBreak: 'break-all',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <code>{token}</code>
          </div>

          <h2>First 50 Characters</h2>
          <p><code>{token.substring(0, 50)}...</code></p>

          <h2>Decoded JWT Payload</h2>
          {decoded ? (
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(decoded).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{key}</td>
                      <td style={{ padding: '8px' }}>
                        {key === 'exp' ? (
                          <>
                            {new Date(value * 1000).toISOString()} 
                            {' '}
                            {value * 1000 > Date.now() ? '✅ VALID' : '❌ EXPIRED'}
                          </>
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Failed to decode token</p>
          )}

          <h2>Status</h2>
          {decoded && decoded.exp ? (
            <p>
              <strong>Expiration:</strong> {new Date(decoded.exp * 1000).toISOString()}<br />
              <strong>Expired:</strong> {decoded.exp * 1000 < Date.now() ? '❌ YES' : '✅ NO'}<br />
              <strong>Time until expiration:</strong> {Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60)} minutes
            </p>
          ) : null}
        </>
      )}

      <h2>How to Use</h2>
      <ol>
        <li>Check if token is present</li>
        <li>If present, verify expiration date is in the future</li>
        <li>Check userId/email in payload</li>
        <li>If token looks valid, the issue is with API calls</li>
      </ol>
    </div>
  )
}
