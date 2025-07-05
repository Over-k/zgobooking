'use client'

import { useEffect, useState } from 'react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function DevModeBanner() {
  const [devOverride, setDevOverride] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('devAdminOverride')
    setDevOverride(saved === 'true')
  }, [])

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
      <div className="flex justify-between items-center">
        <p className="font-bold text-yellow-800">DEVELOPMENT MODE</p>
        <div className="flex items-center gap-2">
          <Label htmlFor="admin-toggle" className="text-yellow-800">Admin Override</Label>
          <Switch 
            id="admin-toggle"
            checked={devOverride}
            onCheckedChange={(val) => {
              localStorage.setItem('devAdminOverride', String(val))
              setDevOverride(val)
            }}
          />
        </div>
      </div>
    </div>
  )
} 