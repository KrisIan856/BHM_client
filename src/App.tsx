import { useState } from "react"
import { C } from "@/lib/theme"
import type { Role } from "@/lib/types"
import {
  LoginScreen,
  RegisterScreen,
  ForgotScreen,
} from "@/features/auth/AuthScreens"
import { GuardianApp } from "@/features/guardian/GuardianApp"
import { BoarderApp } from "@/features/boarder/BoarderApp"

type AuthScreen = "login" | "register" | "forgot"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export default function App() {
  const [screen, setScreen] = useState<AuthScreen>("login")
  const [role, setRole] = useState<Role>(null)
  const [loginError, setLoginError] = useState("")

  async function handleLogin(username: string, password: string) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || "Login failed")
        return
      }

      setLoginError("")
      setRole(data.user.role)
      localStorage.setItem("boarding_house_token", data.token)
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Unable to connect to the server")
    }
  }

  async function handleRegister(
    username: string,
    password: string,
    selectedRole: "guardian" | "boarder",
  ) {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: selectedRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || "Registration failed")
        return
      }

      setLoginError("")
      localStorage.setItem("boarding_house_token", data.token)
      setRole(selectedRole)
    } catch (error) {
      console.error("Registration error:", error)
      setLoginError("Unable to connect to the server")
    }
  }

  function handleLogout() {
    setRole(null)
    setScreen("login")
    setLoginError("")
    localStorage.removeItem("boarding_house_token")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#CCC7C0" }}
    >
      <div
        className="flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: 390,
          height: 844,
          background: C.bg,
          borderRadius: 40,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {role === null && screen === "login" && (
          <LoginScreen
            onLogin={handleLogin}
            onRegister={() => { setScreen("register"); setLoginError("") }}
            onForgot={() => { setScreen("forgot"); setLoginError("") }}
            error={loginError}
          />
        )}
        {role === null && screen === "register" && (
          <RegisterScreen
            onBack={() => setScreen("login")}
            onRegister={handleRegister}
          />
        )}
        {role === null && screen === "forgot" && (
          <ForgotScreen onBack={() => setScreen("login")} />
        )}
        {role === "guardian" && <GuardianApp onLogout={handleLogout} />}
        {role === "boarder" && <BoarderApp onLogout={handleLogout} />}
      </div>
    </div>
  )
}
