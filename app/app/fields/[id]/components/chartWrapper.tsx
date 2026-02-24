import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ChartWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !resolvedTheme) return null

  return <>{children}</>
}