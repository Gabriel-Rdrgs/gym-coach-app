"use client"
import { useSession } from 'next-auth/react'

export function DebugSession() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Carregando...</p>
  
  return (
    <pre className="bg-gray-100 p-4 rounded text-xs">
      {JSON.stringify(session, null, 2)}
    </pre>
  )
}
