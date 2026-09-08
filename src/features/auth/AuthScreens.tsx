import { useState, FormEvent, type ReactNode } from "react"
import { C } from "@/lib/theme"

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={C.muted}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={C.muted}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  endAdornment,
  autoComplete,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  endAdornment?: ReactNode
  autoComplete?: string
}) {
  return (
    <label className="block w-full">
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: C.muted }}
      >
        {label}
      </span>
      <div className="relative mt-1.5">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full rounded-[14px] px-4 py-3.5 text-[15px] outline-none"
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            color: C.text,
            paddingRight: endAdornment ? 48 : 16,
          }}
        />
        {endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
    </label>
  )
}

export function LoginScreen({
  onLogin,
  onRegister,
  onForgot,
  error,
}: {
  onLogin: (username: string, password: string) => void
  onRegister: () => void
  onForgot: () => void
  error: string
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onLogin(username, password)
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-10 pb-8">
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 mx-auto mb-4 flex items-center justify-center text-3xl rounded-[18px]"
          style={{ background: C.primary }}
        >
          🏠
        </div>
        <h1
          className="text-xl font-bold tracking-wide uppercase"
          style={{ color: C.text }}
        >
          Boarding House Management
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        <Field
          label="Username"
          value={username}
          onChange={setUsername}
          autoComplete="username"
        />
        <Field
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="p-1 active:opacity-60"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          }
        />

        {error && (
          <p className="text-sm font-medium" style={{ color: "#D94F4F" }}>
            {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-[#8B7FC7]"
            />
            <span className="text-sm" style={{ color: C.text }}>
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={onForgot}
            className="text-sm font-medium active:opacity-60"
            style={{ color: C.primary }}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full mt-4 rounded-[14px] py-3.5 font-semibold text-white active:scale-[0.98] transition-transform"
          style={{ background: C.primary }}
        >
          LOGIN
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: C.muted }}>
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onRegister}
          className="font-semibold active:opacity-60"
          style={{ color: C.primary }}
        >
          REGISTER
        </button>
      </p>
    </div>
  )
}

export function RegisterScreen({
  onBack,
  onRegister,
}: {
  onBack: () => void
  onRegister: (username: string, password: string, role: "guardian" | "boarder") => void
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"guardian" | "boarder">("boarder")
  const [formError, setFormError] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      setFormError("Username is required")
      return
    }
    if (!password) {
      setFormError("Password is required")
      return
    }
    if (password !== confirm) {
      setFormError("Passwords do not match")
      return
    }
    setFormError("")
    onRegister(username, password, selectedRole)
  }

  const roleOptions = [
    {
      role: "guardian" as const,
      emoji: "👩‍💼",
      bg: C.primaryLt,
      title: "Guardian",
      sub: "Manage boarders & house operations",
    },
    {
      role: "boarder" as const,
      emoji: "🧑‍🎓",
      bg: "#E4EDE3",
      title: "Boarder",
      sub: "View your room & payment details",
    },
  ]

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-8 overflow-y-auto">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-medium mb-6 active:opacity-60"
        style={{ color: C.primary }}
      >
        ← Back to login
      </button>
      <h1 className="text-xl font-bold mb-6" style={{ color: C.text }}>
        Create account
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Username"
          value={username}
          onChange={setUsername}
          autoComplete="username"
        />
        <Field
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="p-1 active:opacity-60"
              aria-label="Toggle password"
            >
              <EyeIcon open={showPassword} />
            </button>
          }
        />
        <Field
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        <div>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: C.muted }}
          >
            I am a
          </span>
          <div className="flex flex-col gap-2.5 mt-2">
            {roleOptions.map((item) => {
              const active = selectedRole === item.role
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className="w-full rounded-[14px] p-3.5 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                  style={{
                    background: active ? item.bg : C.card,
                    border: `1.5px solid ${active ? C.primary : C.border}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: active ? "rgba(255,255,255,0.6)" : item.bg }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[15px]" style={{ color: C.text }}>
                      {item.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {item.sub}
                    </p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: active ? C.primary : C.border }}
                  >
                    {active && (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: C.primary }}
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {formError && (
          <p className="text-sm font-medium" style={{ color: "#D94F4F" }}>
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-2 rounded-[14px] py-3.5 font-semibold text-white active:scale-[0.98] transition-transform"
          style={{ background: C.primary }}
        >
          REGISTER
        </button>
      </form>
    </div>
  )
}

export function ForgotScreen({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onBack()
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-8">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-medium mb-6 active:opacity-60"
        style={{ color: C.primary }}
      >
        ← Back to login
      </button>
      <h1 className="text-xl font-bold mb-2" style={{ color: C.text }}>
        Forgot password
      </h1>
      <p className="text-sm mb-6" style={{ color: C.muted }}>
        Enter your username and we&apos;ll help you reset access (prototype).
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Username"
          value={username}
          onChange={setUsername}
          autoComplete="username"
        />
        <button
          type="submit"
          className="w-full mt-2 rounded-[14px] py-3.5 font-semibold text-white active:scale-[0.98] transition-transform"
          style={{ background: C.primary }}
        >
          Continue
        </button>
      </form>
    </div>
  )
}

