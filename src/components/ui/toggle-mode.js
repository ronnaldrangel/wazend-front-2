"use client"

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from './button'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

const ToggleMode = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 bg-muted rounded-md animate-pulse"></div>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  )
}

export default ToggleMode