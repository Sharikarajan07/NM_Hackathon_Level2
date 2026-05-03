import { Suspense } from 'react'
import SignupClient from './SignupClient'

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-slate-900">Loading signup...</div>
            <div className="text-sm text-slate-500">Preparing your account form.</div>
          </div>
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  )
}
