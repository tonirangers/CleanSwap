import { useAccount } from 'wagmi'
import { Toaster } from 'sonner'
import { PageShell } from '@/components/layout/page-shell'
import { SweepWidget } from '@/components/sweep/sweep-widget'

export function App() {
  const { isConnected } = useAccount()

  return (
    <>
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
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-6">
          <SweepWidget connected={isConnected} />
        </div>
      </PageShell>
    </>
  )
}
