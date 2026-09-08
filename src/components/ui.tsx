import { useEffect, ReactNode } from "react"
import { C } from "@/lib/theme"
import type {
  PayStatus,
  ReceiptStatus,
  IncidentType,
  CurfewStatus,
} from "@/lib/types"

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({
  initials,
  color,
  size = 40,
}: {
  initials: string
  color: string
  size?: number
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          color: C.text,
          fontSize: size > 44 ? 18 : 13,
          fontWeight: 600,
        }}
      >
        {initials}
      </span>
    </div>
  )
}

// ─── Status chips ─────────────────────────────────────────────────────────────
export function PayChip({ status }: { status: PayStatus }) {
  const m = {
    paid: { bg: C.sageLt, color: "#3D7055", label: "✓ Paid" },
    pending: { bg: C.warnLt, color: C.warn, label: "⏳ Pending" },
    overdue: { bg: C.dangerLt, color: C.danger, label: "⚠ Overdue" },
  }[status]
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  )
}

export function ReceiptChip({ status }: { status: ReceiptStatus }) {
  const m = {
    pending_review: { bg: C.warnLt, color: C.warn, label: "🕐 Under Review" },
    verified: { bg: C.sageLt, color: "#3D7055", label: "✓ Verified" },
    rejected: { bg: C.dangerLt, color: C.danger, label: "✕ Rejected" },
  }[status]
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  )
}

export function IncidentBadge({ type }: { type: IncidentType }) {
  const m: Record<IncidentType, { bg: string; color: string; label: string }> = {
    missed_curfew: { bg: C.dangerLt, color: C.danger, label: "🌙 Curfew" },
    sos: { bg: "#FFE4E4", color: "#9B0000", label: "🆘 SOS" },
    missed_worship: { bg: C.warnLt, color: C.warn, label: "📅 Worship" },
    maintenance: { bg: "#EAF0F5", color: "#3A6080", label: "🔧 Maintenance" },
    other: { bg: "#F0EAF5", color: "#6B5FA8", label: "•• Other" },
  }
  const s = m[type]
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

export function CurfewChip({ status }: { status: CurfewStatus }) {
  const m = {
    compliant: { bg: C.sageLt, color: "#3D7055", label: "✓ In" },
    late: { bg: C.dangerLt, color: C.danger, label: "⚠ Late" },
    absent: { bg: "#F5E4E4", color: "#9B0000", label: "✕ Absent" },
    pending: { bg: "#F0EEF8", color: "#6B5FA8", label: "⏳ Pending" },
  }[status]
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
export function Header({
  title,
  onBack,
  right,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
      style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 active:opacity-60"
          style={{ background: C.bg }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke={C.muted}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <h1 className="flex-1 font-bold text-[17px]" style={{ color: C.text }}>
        {title}
      </h1>
      {right}
    </div>
  )
}

// ─── Bottom nav shared ────────────────────────────────────────────────────────
export function NavBar({
  items,
  active,
  onSelect,
}: {
  items: { id: string; label: string; icon: string }[]
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <nav
      className="flex flex-shrink-0 pt-2 pb-5 px-1"
      style={{ background: C.card, borderTop: `1px solid ${C.border}` }}
    >
      {items.map((i) => (
        <button
          key={i.id}
          onClick={() => onSelect(i.id)}
          className="flex-1 flex flex-col items-center gap-0.5 py-1"
        >
          <span className="text-[22px] leading-none">{i.icon}</span>
          <span
            className="text-[10px] font-medium"
            style={{ color: active === i.id ? C.primary : "#B0AAA4" }}
          >
            {i.label}
          </span>
          {active === i.id && (
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: C.primary }}
            />
          )}
        </button>
      ))}
    </nav>
  )
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null
  return (
    <div
      className="absolute inset-0 z-50 flex items-end"
      style={{ background: "rgba(44,40,37,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full p-5 space-y-4 max-h-[85%] overflow-y-auto scrollbar-hide"
        style={{ background: C.card, borderRadius: "24px 24px 0 0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto"
          style={{ background: C.border }}
        />
        {title && (
          <h2 className="font-bold text-lg" style={{ color: C.text }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}

// ─── Overlay Modal ────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(44,40,37,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full p-5 space-y-4 rounded-[20px]"
        style={{ background: C.card }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="font-bold text-lg" style={{ color: C.text }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}

// ─── Form primitives ──────────────────────────────────────────────────────────
export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold mb-1.5" style={{ color: C.muted }}>
      {children}
    </p>
  )
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-3 rounded-[10px] text-sm outline-none"
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          color: C.text,
        }}
      />
    </div>
  )
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3.5 py-3 rounded-[10px] text-sm outline-none resize-none"
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          color: C.text,
        }}
      />
    </div>
  )
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-3 rounded-[10px] text-sm outline-none"
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          color: C.text,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string
  sub?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 mr-4">
        <p className="text-sm font-semibold" style={{ color: C.text }}>
          {label}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>
            {sub}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="w-12 h-6 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0"
        style={{
          background: checked ? C.sage : C.border,
          justifyContent: checked ? "flex-end" : "flex-start",
        }}
      >
        <div
          className="w-5 h-5 rounded-full shadow-sm"
          style={{ background: "#fff" }}
        />
      </button>
    </div>
  )
}

// ─── Row item ─────────────────────────────────────────────────────────────────
export function RowItem({
  icon,
  label,
  sub,
  onClick,
  right,
  danger = false,
}: {
  icon: string
  label: string
  sub?: string
  onClick?: () => void
  right?: ReactNode
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[14px] text-left active:opacity-70 transition-opacity"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: danger ? C.dangerLt : C.bg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: danger ? C.danger : C.text }}
        >
          {label}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>
            {sub}
          </p>
        )}
      </div>
      {right ?? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 12l4-4-4-4"
            stroke={C.border}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <h2 className="font-semibold text-sm" style={{ color: C.text }}>
        {title}
      </h2>
      {action}
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: string
  title: string
  sub?: string
}) {
  return (
    <div className="text-center py-12">
      <p className="text-5xl mb-3">{icon}</p>
      <p className="font-semibold" style={{ color: C.text }}>
        {title}
      </p>
      {sub && (
        <p className="text-sm mt-1" style={{ color: C.muted }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Action buttons pair ──────────────────────────────────────────────────────
export function ActionPair({
  onCancel,
  onConfirm,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmDanger = false,
}: {
  onCancel: () => void
  onConfirm: () => void
  cancelLabel?: string
  confirmLabel: string
  confirmDanger?: boolean
}) {
  return (
    <div className="flex gap-3 pt-1">
      <button
        onClick={onCancel}
        className="flex-1 py-3.5 rounded-[12px] font-semibold text-sm"
        style={{ border: `1px solid ${C.border}`, color: C.muted }}
      >
        {cancelLabel}
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-3.5 rounded-[12px] font-semibold text-sm text-white"
        style={{ background: confirmDanger ? C.danger : C.primary }}
      >
        {confirmLabel}
      </button>
    </div>
  )
}

// ─── Toast notification ───────────────────────────────────────────────────────
export function Toast({
  message,
  onDone,
}: {
  message: string
  onDone: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="absolute bottom-24 left-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-[14px] shadow-lg"
      style={{ background: C.text }}
    >
      <span className="text-xl">✓</span>
      <p className="text-sm font-semibold text-white flex-1">{message}</p>
    </div>
  )
}

// ─── Chip filter bar ──────────────────────────────────────────────────────────
export function ChipBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          style={
            value === o.value
              ? { background: C.primary, color: "#fff" }
              : {
                  background: C.card,
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  bg,
  textColor,
}: {
  label: string
  value: string | number
  sub?: string
  bg?: string
  textColor?: string
}) {
  return (
    <div
      className="rounded-[14px] p-4"
      style={{
        background: bg ?? C.card,
        border: bg ? "none" : `1px solid ${C.border}`,
      }}
    >
      <p
        className="text-xs font-medium mb-1"
        style={{ color: textColor ? textColor + "cc" : C.muted }}
      >
        {label}
      </p>
      <p
        className="text-[32px] font-bold leading-none"
        style={{ color: textColor ?? C.text }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs mt-1.5"
          style={{ color: textColor ? textColor + "aa" : C.muted }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
