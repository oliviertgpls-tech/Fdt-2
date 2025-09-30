'use client'

import { useSession, signOut } from "next-auth/react"

export default function TestSessionPage() {
  const { data: session, status } = useSession()

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Test Session</h1>
      <p>Status: <strong>{status}</strong></p>
      
      {status === 'authenticated' && session && (
        <div style={{ background: '#e8f5e9', padding: '20px', margin: '20px 0' }}>
          <h2>✅ SESSION OK</h2>
          <pre>{JSON.stringify(session, null, 2)}</pre>
          <button 
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Déconnexion
          </button>
        </div>
      )}

      {status === 'unauthenticated' && (
        <div style={{ background: '#ffebee', padding: '20px' }}>
          <h2>❌ PAS DE SESSION</h2>
          <a href="/auth/signin">Se connecter</a>
        </div>
      )}
    </div>
  )
}