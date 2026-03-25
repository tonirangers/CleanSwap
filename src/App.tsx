import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Toaster } from 'sonner'
import { PageShell } from '@/components/layout/page-shell'
import { LandingPage } from '@/pages/landing'
import { SweepPage } from '@/pages/sweep'

export function App() {
  const { isConnected } = useAccount()

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f4f4f5',
          },
        }}
      />
      <PageShell>
        <Routes>
          <Route path="/" element={isConnected ? <SweepPage /> : <LandingPage />} />
        </Routes>
      </PageShell>
    </BrowserRouter>
  )
}
