"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Icon } from "@/components/ui/icon"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [color, setColor] = useState("bg-muted")

  // Password requirements
  const requirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "At least one uppercase letter" },
    { regex: /[a-z]/, text: "At least one lowercase letter" },
    { regex: /[0-9]/, text: "At least one number" },
    { regex: /[^A-Za-z0-9]/, text: "At least one special character" },
  ]

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setFeedback("")
      setColor("bg-muted")
      return
    }

    // Calculate strength based on requirements met
    const meetsRequirements = requirements.filter((requirement) => requirement.regex.test(password))
    const strengthValue = (meetsRequirements.length / requirements.length) * 100

    // Set strength and feedback based on the value
    setStrength(strengthValue)

    if (strengthValue === 0) {
      setFeedback("Very Weak")
      setColor("bg-destructive")
    } else if (strengthValue <= 25) {
      setFeedback("Weak")
      setColor("bg-destructive")
    } else if (strengthValue <= 50) {
      setFeedback("Fair")
      setColor("bg-amber-500")
    } else if (strengthValue <= 75) {
      setFeedback("Good")
      setColor("bg-amber-500")
    } else if (strengthValue < 100) {
      setFeedback("Strong")
      setColor("bg-green-500")
    } else {
      setFeedback("Very Strong")
      setColor("bg-green-500")
    }
  }, [password])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Progress value={strength} className="h-2" indicatorClassName={color} />
        <span className="ml-2 text-xs font-medium">{feedback}</span>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Password requirements:</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {requirements.map((requirement, index) => (
            <div key={index} className="flex items-center gap-1.5">
              {requirement.regex.test(password) ? (
                <Icon name="CheckCircle2" className="h-3.5 w-3.5 shrink-0 text-green-600" />
              ) : (
                <Icon name="Circle" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={`text-xs ${requirement.regex.test(password) ? "text-green-600" : "text-muted-foreground"}`}
              >
                {requirement.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
