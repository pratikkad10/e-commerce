import { Moon, Sun } from "lucide-react"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"

const DarkToggle = () => {
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  )

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(document.documentElement.classList.contains('dark'))
  }

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  return (
    <Button onClick={toggleTheme} variant="ghost" size="icon">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

export default DarkToggle