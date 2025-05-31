"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, AlertTriangle, Shield, CheckCircle } from "lucide-react"

interface Alert {
  id: string
  type: "threat" | "system" | "info"
  message: string
  timestamp: Date
  severity: "low" | "medium" | "high"
}

export function RealtimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate new alerts
      if (Math.random() < 0.3) {
        // 30% chance every 5 seconds
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: Math.random() < 0.7 ? "threat" : "system",
          message:
            Math.random() < 0.7
              ? "High-risk phishing email detected from suspicious domain"
              : "System performance optimal - all services running",
          timestamp: new Date(),
          severity: Math.random() < 0.3 ? "high" : Math.random() < 0.6 ? "medium" : "low",
        }

        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]) // Keep only 10 most recent
        setUnreadCount((prev) => prev + 1)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: string, severity: string) => {
    if (type === "threat") {
      return severity === "high" ? (
        <AlertTriangle className="h-4 w-4 text-red-500" />
      ) : (
        <Shield className="h-4 w-4 text-yellow-500" />
      )
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    return timestamp.toLocaleTimeString()
  }

  const clearAlerts = () => {
    setAlerts([])
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Real-time Alerts
          {alerts.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAlerts}>
              Clear All
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {alerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No recent alerts</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <DropdownMenuItem key={alert.id} className="flex items-start space-x-3 p-3">
                {getAlertIcon(alert.type, alert.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{alert.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
