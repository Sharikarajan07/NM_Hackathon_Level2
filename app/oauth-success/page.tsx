import { Suspense } from 'react'
import OAuthSuccessClient from './OAuthSuccessClient'

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-lg font-semibold">Signing you in...</div>
            <div className="text-sm text-slate-400">Finalizing OAuth session.</div>
          </div>
        </div>
      }
    >
      <OAuthSuccessClient />
    </Suspense>
  )
}
