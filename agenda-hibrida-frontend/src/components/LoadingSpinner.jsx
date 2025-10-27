import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ message = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Componente menor para carregamentos inline
export function LoadingSpinnerSmall({ message = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

