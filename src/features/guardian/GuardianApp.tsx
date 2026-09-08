import { useState } from "react"
import { C } from "@/lib/theme"
import type {
  Boarder,
  PaymentRecord,
  AttendanceRecord,
  AttendanceSession,
  Announcement,
  VisitorEntry,
  Incident,
  MaintenanceReport,
  CurfewRecord,
  WorkshipSchedule,
  BillingSettings,
} from "@/lib/types"
import {
  BOARDERS as INIT_BOARDERS,
  PAYMENT_RECORDS as INIT_PAYMENTS,
  ATTENDANCE_RECORDS as INIT_ATTN,
  SESSIONS,
  ANNOUNCEMENTS as INIT_ANN,
  VISITOR_ENTRIES as INIT_VISITORS,
  INCIDENTS as INIT_INCIDENTS,
  MAINTENANCE_REPORTS as INIT_MAINT,
  CURFEW_RECORDS as INIT_CURFEW,
  DEFAULT_BILLING,
  WORSHIP_SCHEDULE,
} from "@/lib/data"
import {
  Avatar,
  PayChip,
  ReceiptChip,
  IncidentBadge,
  CurfewChip,
  Header,
  NavBar,
  BottomSheet,
  Modal,
  Input,
  Textarea,
  Select,
  Toggle,
  RowItem,
  SectionHeader,
  EmptyState,
  ActionPair,
  Toast,
  ChipBar,
  StatCard,
} from "@/components/ui"

type GuardTab = "dashboard" | "payments" | "attendance" | "security" | "more"

// ─── Guardian App shell ───────────────────────────────────────────────────────

export function GuardianApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<GuardTab>("dashboard")

  // shared state
  const [boarders, setBoarders] = useState<Boarder[]>(INIT_BOARDERS)
  const [payments, setPayments] = useState<PaymentRecord[]>(INIT_PAYMENTS)
  const [attnRecords, setAttnRecords] = useState<AttendanceRecord[]>(INIT_ATTN)
  const [announcements, setAnnouncements] = useState<Announcement[]>(INIT_ANN)
  const [visitors, setVisitors] = useState<VisitorEntry[]>(INIT_VISITORS)
  const [incidents, setIncidents] = useState<Incident[]>(INIT_INCIDENTS)
  const [maintenance, setMaintenance] =
    useState<MaintenanceReport[]>(INIT_MAINT)
  const [curfewRecords, setCurfewRecords] =
    useState<CurfewRecord[]>(INIT_CURFEW)
  const [billing, setBilling] = useState<BillingSettings>(DEFAULT_BILLING)
  const [schedule, setSchedule] = useState<WorkshipSchedule>(WORSHIP_SCHEDULE)
  const [toast, setToast] = useState<string | null>(null)
  const [securityDeepLink, setSecurityDeepLink] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const navItems = [
    { id: "dashboard", label: "Home", icon: "🏠" },
    { id: "payments", label: "Payments", icon: "💳" },
    { id: "attendance", label: "Attendance", icon: "📅" },
    { id: "security", label: "Security", icon: "🛡️" },
    { id: "more", label: "More", icon: "••" },
  ]

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{ background: C.bg }}
    >
      {tab === "dashboard" && (
        <GDashboard
          boarders={boarders}
          payments={payments}
          attnRecords={attnRecords}
          announcements={announcements}
          incidents={incidents}
          onTabChange={setTab}
          onEmergencyContacts={() => {
            setSecurityDeepLink("contacts")
            setTab("security")
          }}
        />
      )}
      {tab === "payments" && (
        <GPayments
          boarders={boarders}
          payments={payments}
          billing={billing}
          setBoarders={setBoarders}
          setPayments={setPayments}
          setBilling={setBilling}
          showToast={showToast}
        />
      )}
      {tab === "attendance" && (
        <GAttendance
          boarders={boarders}
          sessions={SESSIONS}
          records={attnRecords}
          setRecords={setAttnRecords}
          schedule={schedule}
          setSchedule={setSchedule}
          showToast={showToast}
        />
      )}
      {tab === "security" && (
        <GSecurity
          boarders={boarders}
          setBoarders={setBoarders}
          announcements={announcements}
          setAnnouncements={setAnnouncements}
          visitors={visitors}
          setVisitors={setVisitors}
          incidents={incidents}
          setIncidents={setIncidents}
          maintenance={maintenance}
          setMaintenance={setMaintenance}
          curfew={curfewRecords}
          setCurfew={setCurfewRecords}
          deepLink={securityDeepLink}
          onDeepLinkConsumed={() => setSecurityDeepLink(null)}
          showToast={showToast}
        />
      )}
      {tab === "more" && <GMore onLogout={onLogout} showToast={showToast} />}

      <NavBar
        items={navItems}
        active={tab}
        onSelect={(id) => setTab(id as GuardTab)}
      />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function GDashboard({
  boarders,
  payments,
  attnRecords,
  announcements,
  incidents,
  onTabChange,
  onEmergencyContacts,
}: {
  boarders: Boarder[]
  payments: PaymentRecord[]
  attnRecords: AttendanceRecord[]
  announcements: Announcement[]
  incidents: Incident[]
  onTabChange: (t: GuardTab) => void
  onEmergencyContacts: () => void
}) {
  const sepPay = payments.filter((p) => p.period === "Sep 2026")
  const paid = sepPay.filter((p) => p.status === "paid").length
  const pending = sepPay.filter((p) => p.status === "pending").length
  const overdue = sepPay.filter((p) => p.status === "overdue").length
  const todayMorning = attnRecords.filter((r) => r.sessionId === "s1")
  const present = todayMorning.filter((r) => r.status === "present").length
  const collected = sepPay
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0)
  const unresolvedSOS = incidents.filter((i) => i.type === "sos" && !i.resolved)
  const pendingReceipts = payments.filter(
    (p) => p.receiptStatus === "pending_review",
  )
  const unreadAnn = announcements.filter(
    (a) => a.readBy.length < boarders.length,
  )

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-5 space-y-5">
      {/* Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: C.text }}>
            Good morning, 👋
          </h1>
          <p className="text-sm" style={{ color: C.muted }}>
            Ate Sandra · Casa Marigold
          </p>
        </div>
        <div className="relative">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: C.primary }}
          >
            S
          </div>
          {(unresolvedSOS.length > 0 || pendingReceipts.length > 0) && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: C.danger }}
            >
              {unresolvedSOS.length + pendingReceipts.length}
            </div>
          )}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Boarders"
          value={boarders.length}
          sub="10 rooms occupied"
        />
        <StatCard
          label="Paid This Month"
          value={paid}
          sub={`of ${boarders.length} boarders`}
          bg={C.primary}
          textColor="#fff"
        />
        <StatCard
          label="Present Today"
          value={present}
          sub={`${boarders.length - present} absent`}
        />
        <StatCard
          label="Action Needed"
          value={pending + overdue}
          sub={`${overdue} overdue · ${pending} pending`}
          bg={C.warnLt}
          textColor={C.warn}
        />
      </div>

      {/* Collection progress */}
      <div
        className="rounded-[14px] p-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            September Collection
          </p>
          <span className="text-xs" style={{ color: C.muted }}>
            Sep 2026
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold" style={{ color: C.text }}>
            ₱{collected.toLocaleString()}
          </span>
          <span className="text-sm" style={{ color: C.muted }}>
            collected
          </span>
        </div>
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ background: C.bg }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${(paid / boarders.length) * 100}%`,
              background: C.sage,
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: C.muted }}>
          {paid}/{boarders.length} boarders paid
        </p>
      </div>

      {/* Alerts */}
      {(unresolvedSOS.length > 0 || pendingReceipts.length > 0) && (
        <div className="space-y-2">
          {unresolvedSOS.map((i) => (
            <div
              key={i.id}
              className="rounded-[14px] p-4 flex items-center gap-3"
              style={{ background: C.dangerLt, border: `1px solid #F5C4C4` }}
            >
              <span className="text-2xl">🆘</span>
              <div className="flex-1">
                <p
                  className="font-semibold text-sm"
                  style={{ color: C.danger }}
                >
                  Active SOS Alert
                </p>
                <p className="text-xs" style={{ color: C.danger }}>
                  {i.title}
                </p>
              </div>
              <button
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: C.danger, color: "#fff" }}
                onClick={() => onTabChange("security")}
              >
                View
              </button>
            </div>
          ))}
          {pendingReceipts.length > 0 && (
            <button
              onClick={() => onTabChange("payments")}
              className="w-full rounded-[14px] p-4 flex items-center gap-3 text-left"
              style={{ background: C.warnLt, border: `1px solid #F0DCA8` }}
            >
              <span className="text-2xl">🧾</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: C.warn }}>
                  {pendingReceipts.length} Receipt
                  {pendingReceipts.length > 1 ? "s" : ""} Pending Review
                </p>
                <p className="text-xs" style={{ color: C.warn }}>
                  Tap to review and verify
                </p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "💰", label: "Record Cash", tab: "payments" as GuardTab },
            { icon: "📢", label: "Announce", tab: "security" as GuardTab },
            { icon: "📅", label: "Attendance", tab: "attendance" as GuardTab },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => onTabChange(a.tab)}
              className="flex items-center gap-2.5 p-3.5 rounded-[14px] text-left active:opacity-70"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <span className="text-xl">{a.icon}</span>
              <span className="text-sm font-semibold" style={{ color: C.text }}>
                {a.label}
              </span>
            </button>
          ))}
          <button
            onClick={onEmergencyContacts}
            className="flex items-center gap-2.5 p-3.5 rounded-[14px] text-left active:opacity-70"
            style={{ background: C.dangerLt, border: `1px solid #F5C4C4` }}
          >
            <span className="text-xl">📞</span>
            <span className="text-sm font-semibold" style={{ color: C.danger }}>
              Emergency Contacts
            </span>
          </button>
        </div>
      </div>

      {/* Unread announcements */}
      {unreadAnn.length > 0 && (
        <div>
          <SectionHeader
            title="Unread by Boarders"
            action={
              <button
                onClick={() => onTabChange("security")}
                className="text-xs font-semibold"
                style={{ color: C.primary }}
              >
                See all
              </button>
            }
          />
          {unreadAnn.slice(0, 2).map((a) => (
            <div
              key={a.id}
              className="rounded-[14px] p-3.5 mb-2 flex items-start gap-3"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <span className="text-lg">
                {a.priority === "critical" ? "🔴" : "📢"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: C.text }}>
                  {a.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {a.readBy.length}/{boarders.length} read · {a.sentAt}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function GPayments({
  boarders,
  payments,
  billing,
  setBoarders,
  setPayments,
  setBilling,
  showToast,
}: {
  boarders: Boarder[]
  payments: PaymentRecord[]
  billing: BillingSettings
  setBoarders: (b: Boarder[]) => void
  setPayments: (p: PaymentRecord[]) => void
  setBilling: (b: BillingSettings) => void
  showToast: (m: string) => void
}) {
  const [screen, setScreen] = useState<string>("list")
  const [screenData, setScreenData] = useState<any>(null)

  const nav = (s: string, d?: any) => {
    setScreen(s)
    setScreenData(d ?? null)
  }
  const back = () => nav("list")

  if (screen === "detail")
    return (
      <GPay_Detail
        boarder={screenData}
        payments={payments}
        setPayments={setPayments}
        showToast={showToast}
        onBack={back}
        onCash={() => nav("cash")}
      />
    )
  if (screen === "cash")
    return (
      <GPay_Cash
        boarders={boarders}
        payments={payments}
        setPayments={setPayments}
        showToast={showToast}
        onBack={back}
      />
    )
  if (screen === "settings")
    return (
      <GPay_Settings
        boarders={boarders}
        setBoarders={setBoarders}
        billing={billing}
        setBilling={setBilling}
        showToast={showToast}
        onBack={back}
      />
    )
  if (screen === "reminders")
    return (
      <GPay_Reminders
        billing={billing}
        setBilling={setBilling}
        showToast={showToast}
        onBack={back}
      />
    )
  if (screen === "export")
    return <GPay_Export showToast={showToast} onBack={back} />

  // ── List ─────────────────────────────────────────────────────────────────
  type F = "all" | "paid" | "pending" | "overdue"
  const [filter, setFilter] = useState<F>("all")
  const [month, setMonth] = useState("Sep 2026")
  const filtered = boarders.filter(
    (b) => filter === "all" || b.paymentStatus === filter,
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Payments"
        right={
          <div className="flex gap-1.5">
            {[
              { icon: "💰", s: "cash" },
              { icon: "📊", s: "export" },
              { icon: "🔔", s: "reminders" },
              { icon: "⚙️", s: "settings" },
            ].map((a) => (
              <button
                key={a.s}
                onClick={() => nav(a.s)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ background: C.bg }}
              >
                {a.icon}
              </button>
            ))}
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {/* Month selector */}
        <div className="flex items-center justify-between">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            ‹
          </button>
          <span className="font-semibold" style={{ color: C.text }}>
            {month}
          </span>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            ›
          </button>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            {
              label: "Paid",
              count: boarders.filter((b) => b.paymentStatus === "paid").length,
              bg: C.sageLt,
              tc: "#3D7055",
            },
            {
              label: "Pending",
              count: boarders.filter((b) => b.paymentStatus === "pending")
                .length,
              bg: C.warnLt,
              tc: C.warn,
            },
            {
              label: "Overdue",
              count: boarders.filter((b) => b.paymentStatus === "overdue")
                .length,
              bg: C.dangerLt,
              tc: C.danger,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[12px] py-3"
              style={{ background: s.bg }}
            >
              <p className="text-xl font-bold" style={{ color: s.tc }}>
                {s.count}
              </p>
              <p className="text-[11px] font-medium" style={{ color: s.tc }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <ChipBar<F>
          options={[
            { label: "All", value: "all" },
            { label: "✓ Paid", value: "paid" },
            { label: "⏳ Pending", value: "pending" },
            { label: "⚠ Overdue", value: "overdue" },
          ]}
          value={filter}
          onChange={setFilter}
        />

        <div className="space-y-2.5">
          {filtered.map((b) => {
            const rec = payments.find(
              (p) => p.boarderId === b.id && p.period === month,
            )
            const hasPending = rec?.receiptStatus === "pending_review"
            return (
              <button
                key={b.id}
                onClick={() => nav("detail", b)}
                className="w-full rounded-[14px] p-4 flex items-center gap-3 text-left active:opacity-70"
                style={{
                  background: C.card,
                  border: `1px solid ${hasPending ? "#F0DCA8" : C.border}`,
                }}
              >
                <Avatar initials={b.initials} color={b.avatarColor} />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.text }}
                  >
                    {b.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                    Room {b.room} · ₱{b.monthlyRate.toLocaleString()}/mo
                  </p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <PayChip status={b.paymentStatus} />
                  {hasPending && (
                    <div
                      className="text-[10px] font-semibold"
                      style={{ color: C.warn }}
                    >
                      🧾 Receipt pending
                    </div>
                  )}
                  {rec?.paidDate && (
                    <div className="text-[10px]" style={{ color: C.muted }}>
                      {rec.paidDate}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <EmptyState
              icon="🔍"
              title="No boarders found"
              sub="Try a different filter"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function GPay_Detail({
  boarder,
  payments,
  setPayments,
  showToast,
  onBack,
  onCash,
}: {
  boarder: Boarder
  payments: PaymentRecord[]
  setPayments: (p: PaymentRecord[]) => void
  showToast: (m: string) => void
  onBack: () => void
  onCash: () => void
}) {
  const bPay = payments.filter((p) => p.boarderId === boarder.id)
  const sepRec = bPay.find((p) => p.period === "Sep 2026")
  const [editRate, setEditRate] = useState(false)
  const [newRate, setNewRate] = useState(String(boarder.monthlyRate))
  const [rejReason, setRejReason] = useState("")
  const [rejModal, setRejModal] = useState(false)

  const verify = (
    id: string,
    status: "verified" | "rejected",
    reason?: string,
  ) => {
    setPayments(
      payments.map((p) =>
        p.id === id
          ? {
              ...p,
              receiptStatus: status,
              rejectionReason: reason,
              verifiedAt: "Sep 7 · now",
              verifiedBy: "Ate Sandra",
            }
          : p,
      ),
    )
    showToast(status === "verified" ? "✓ Receipt verified" : "Receipt rejected")
    setRejModal(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title={boarder.name}
        onBack={onBack}
        right={
          <button
            onClick={onCash}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: C.primaryLt, color: C.primary }}
          >
            + Cash
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {/* Boarder info */}
        <div
          className="rounded-[14px] p-4 flex items-center gap-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <Avatar
            initials={boarder.initials}
            color={boarder.avatarColor}
            size={52}
          />
          <div className="flex-1">
            <p className="font-bold text-lg" style={{ color: C.text }}>
              {boarder.name}
            </p>
            <p className="text-sm" style={{ color: C.muted }}>
              Room {boarder.room} · {boarder.job}
            </p>
            <p className="text-xs" style={{ color: C.muted }}>
              {boarder.phone}
            </p>
          </div>
          <PayChip status={boarder.paymentStatus} />
        </div>

        {/* Current billing */}
        <div
          className="rounded-[14px] p-4 space-y-3"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm" style={{ color: C.text }}>
              Billing — Sep 2026
            </p>
            <button
              onClick={() => setEditRate(!editRate)}
              className="text-xs font-semibold"
              style={{ color: C.primary }}
            >
              {editRate ? "Cancel" : "✏ Edit"}
            </button>
          </div>
          {editRate ? (
            <div className="space-y-3">
              <Input
                label="Monthly Rate (₱)"
                value={newRate}
                onChange={setNewRate}
                type="number"
              />
              <button
                onClick={() => {
                  setEditRate(false)
                  showToast("Billing updated")
                }}
                className="w-full py-3 rounded-[10px] text-white font-semibold text-sm"
                style={{ background: C.primary }}
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {[
                {
                  l: "Monthly Rate",
                  v: `₱${boarder.monthlyRate.toLocaleString()}`,
                },
                { l: "Due Date", v: `Every ${boarder.dueDay}th of month` },
                { l: "Grace Period", v: `${boarder.gracePeriodDays} days` },
                {
                  l: "Late Penalty",
                  v:
                    boarder.latePenaltyType === "flat"
                      ? `₱${boarder.latePenaltyAmount} flat fee`
                      : `${boarder.latePenaltyAmount}% of rent`,
                },
              ].map((row) => (
                <div key={row.l} className="flex justify-between">
                  <span className="text-sm" style={{ color: C.muted }}>
                    {row.l}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: C.text }}
                  >
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receipt review */}
        {sepRec?.receiptFileName && (
          <div
            className="rounded-[14px] p-4 space-y-3"
            style={{
              background: C.card,
              border: `1px solid ${
                sepRec.receiptStatus === "pending_review" ? "#F0DCA8" : C.border
              }`,
            }}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm" style={{ color: C.text }}>
                Receipt — Sep 2026
              </p>
              {sepRec.receiptStatus && (
                <ReceiptChip status={sepRec.receiptStatus} />
              )}
            </div>
            <div
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
              style={{ background: C.bg }}
            >
              <span className="text-xl">🧾</span>
              <p className="text-sm flex-1" style={{ color: C.text }}>
                {sepRec.receiptFileName}
              </p>
              <span className="text-xs" style={{ color: C.muted }}>
                View
              </span>
            </div>
            {sepRec.receiptStatus === "pending_review" && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setRejModal(true)
                  }}
                  className="flex-1 py-2.5 rounded-[10px] font-semibold text-sm"
                  style={{ background: C.dangerLt, color: C.danger }}
                >
                  ✕ Reject
                </button>
                <button
                  onClick={() => verify(sepRec.id, "verified")}
                  className="flex-1 py-2.5 rounded-[10px] text-white font-semibold text-sm"
                  style={{ background: C.sage }}
                >
                  ✓ Verify
                </button>
              </div>
            )}
            {sepRec.receiptStatus === "rejected" && sepRec.rejectionReason && (
              <div
                className="rounded-[10px] px-3 py-2.5"
                style={{ background: C.dangerLt }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: C.danger }}
                >
                  Rejection reason:
                </p>
                <p className="text-xs mt-0.5" style={{ color: C.danger }}>
                  {sepRec.rejectionReason}
                </p>
              </div>
            )}
            {sepRec.verifiedAt && sepRec.receiptStatus === "verified" && (
              <p className="text-xs" style={{ color: C.muted }}>
                Verified {sepRec.verifiedAt} by {sepRec.verifiedBy}
              </p>
            )}
          </div>
        )}

        {/* Payment history & audit trail */}
        <div>
          <SectionHeader title="Payment History & Audit Trail" />
          <div className="space-y-2.5">
            {bPay.map((p) => (
              <div
                key={p.id}
                className="rounded-[14px] p-4"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.text }}
                  >
                    {p.period}
                  </p>
                  <PayChip status={p.status} />
                </div>
                <div className="space-y-1">
                  {p.paidDate && (
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: C.muted }}>
                        Paid on
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: C.text }}
                      >
                        {p.paidDate}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: C.muted }}>
                      Method
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: C.text }}
                    >
                      {p.method.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: C.muted }}>
                      Recorded by
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: C.text }}
                    >
                      {p.recordedBy === "guardian" ? "Guardian" : "Boarder"}
                    </span>
                  </div>
                  {p.verifiedAt && (
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: C.muted }}>
                        Verified
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: C.text }}
                      >
                        {p.verifiedAt}
                      </span>
                    </div>
                  )}
                  {p.notes && (
                    <p
                      className="text-xs mt-1 italic"
                      style={{ color: C.muted }}
                    >
                      {p.notes}
                    </p>
                  )}
                </div>
                <div
                  className="flex justify-between items-center mt-2 pt-2"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <span className="text-xs" style={{ color: C.muted }}>
                    Amount
                  </span>
                  <span className="font-bold" style={{ color: C.text }}>
                    ₱{p.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {bPay.length === 0 && (
              <EmptyState icon="📋" title="No payment records" />
            )}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      <Modal
        open={rejModal}
        onClose={() => setRejModal(false)}
        title="Reject Receipt"
      >
        <Textarea
          label="Reason for rejection"
          value={rejReason}
          onChange={setRejReason}
          placeholder="e.g. Amount mismatch, blurry image..."
          rows={3}
        />
        <ActionPair
          onCancel={() => setRejModal(false)}
          onConfirm={() => {
            if (sepRec) verify(sepRec.id, "rejected", rejReason)
          }}
          confirmLabel="Reject Receipt"
          confirmDanger
        />
      </Modal>
    </div>
  )
}

function GPay_Cash({
  boarders,
  payments,
  setPayments,
  showToast,
  onBack,
}: {
  boarders: Boarder[]
  payments: PaymentRecord[]
  setPayments: (p: PaymentRecord[]) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [boarderId, setBoarderId] = useState(boarders[0].id)
  const [period, setPeriod] = useState("Sep 2026")
  const [amount, setAmount] = useState("")
  const [method, setMethod] =
    useState<"cash" | "gcash" | "bank_transfer" | "online">("cash")
  const [notes, setNotes] = useState("")

  const submit = () => {
    const b = boarders.find((b) => b.id === boarderId)!
    const newRec: PaymentRecord = {
      id: "p" + Date.now(),
      boarderId,
      period,
      amount: Number(amount) || b.monthlyRate,
      paidDate: "Sep 7",
      method,
      status: "paid",
      recordedBy: "guardian",
      verifiedBy: "Ate Sandra",
      verifiedAt: "Sep 7 · now",
      notes: notes || undefined,
    }
    setPayments([...payments, newRec])
    showToast("Cash payment recorded")
    onBack()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Record Cash Payment" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <Select
          label="Boarder"
          value={boarderId}
          onChange={setBoarderId}
          options={boarders.map((b) => ({
            value: b.id,
            label: `${b.name} — Room ${b.room}`,
          }))}
        />
        <Select
          label="Period"
          value={period}
          onChange={setPeriod}
          options={["Sep 2026", "Aug 2026", "Jul 2026"].map((v) => ({
            value: v,
            label: v,
          }))}
        />
        <Input
          label="Amount (₱)"
          value={amount}
          onChange={setAmount}
          type="number"
          placeholder={String(
            boarders.find((b) => b.id === boarderId)?.monthlyRate ?? "",
          )}
        />
        <Select
          label="Method"
          value={method}
          onChange={(v) => setMethod(v as typeof method)}
          options={[
            { value: "cash", label: "Cash" },
            { value: "gcash", label: "GCash" },
            { value: "bank_transfer", label: "Bank Transfer" },
            { value: "online", label: "Online Payment" },
          ]}
        />
        <Input
          label="Notes (optional)"
          value={notes}
          onChange={setNotes}
          placeholder="e.g. Received in person"
        />
        <button
          onClick={submit}
          className="w-full py-4 rounded-[14px] text-white font-semibold"
          style={{ background: C.primary }}
        >
          Record Payment
        </button>
      </div>
    </div>
  )
}

function GPay_Settings({
  boarders,
  setBoarders,
  billing,
  setBilling,
  showToast,
  onBack,
}: {
  boarders: Boarder[]
  setBoarders: (b: Boarder[]) => void
  billing: BillingSettings
  setBilling: (b: BillingSettings) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [s, setS] = useState(billing)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Billing Settings" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-5">
        <div
          className="rounded-[14px] p-4 space-y-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            Default Terms
          </p>
          <Select
            label="Due Day (each month)"
            value={String(s.dueDay)}
            onChange={(v) => setS({ ...s, dueDay: Number(v) })}
            options={Array.from({ length: 28 }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1}${["st", "nd", "rd"][i] || "th"} of month`,
            }))}
          />
          <Select
            label="Grace Period"
            value={String(s.gracePeriodDays)}
            onChange={(v) => setS({ ...s, gracePeriodDays: Number(v) })}
            options={[0, 1, 2, 3, 5, 7].map((d) => ({
              value: String(d),
              label: `${d} day${d === 1 ? "" : "s"}`,
            }))}
          />
        </div>

        <div
          className="rounded-[14px] p-4 space-y-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            Late Payment Penalty
          </p>
          <Select
            label="Penalty Type"
            value={s.penaltyType}
            onChange={(v) =>
              setS({ ...s, penaltyType: v as "flat" | "percentage" })
            }
            options={[
              { value: "flat", label: "Flat Fee (₱)" },
              { value: "percentage", label: "Percentage of Rent (%)" },
            ]}
          />
          <Input
            label={
              s.penaltyType === "flat"
                ? "Penalty Amount (₱)"
                : "Penalty Percentage (%)"
            }
            value={String(s.penaltyAmount)}
            onChange={(v) => setS({ ...s, penaltyAmount: Number(v) })}
            type="number"
          />
        </div>

        <button
          onClick={() => {
            setBilling(s)
            showToast("Settings saved")
            onBack()
          }}
          className="w-full py-4 rounded-[14px] text-white font-semibold"
          style={{ background: C.primary }}
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}

function GPay_Reminders({
  billing,
  setBilling,
  showToast,
  onBack,
}: {
  billing: BillingSettings
  setBilling: (b: BillingSettings) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [s, setS] = useState(billing)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Payment Reminders" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-5">
        <div
          className="rounded-[14px] p-4 space-y-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            Channels
          </p>
          <Toggle
            label="In-App Notification"
            sub="Push notification inside the app"
            checked={s.channels.inApp}
            onChange={(v) =>
              setS({ ...s, channels: { ...s.channels, inApp: v } })
            }
          />
          <Toggle
            label="SMS"
            sub="Text message to boarder's phone"
            checked={s.channels.sms}
            onChange={(v) =>
              setS({ ...s, channels: { ...s.channels, sms: v } })
            }
          />
          <Toggle
            label="Email"
            sub="Email to boarder's address"
            checked={s.channels.email}
            onChange={(v) =>
              setS({ ...s, channels: { ...s.channels, email: v } })
            }
          />
        </div>

        <div
          className="rounded-[14px] p-4 space-y-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            Schedule
          </p>
          <Toggle
            label="3 Days Before Due"
            checked={s.reminders.before3}
            onChange={(v) =>
              setS({ ...s, reminders: { ...s.reminders, before3: v } })
            }
          />
          <Toggle
            label="1 Day Before Due"
            checked={s.reminders.before1}
            onChange={(v) =>
              setS({ ...s, reminders: { ...s.reminders, before1: v } })
            }
          />
          <Toggle
            label="On Due Date"
            checked={s.reminders.onDay}
            onChange={(v) =>
              setS({ ...s, reminders: { ...s.reminders, onDay: v } })
            }
          />
          <Toggle
            label="1 Day After Due"
            sub="For unpaid boarders"
            checked={s.reminders.after1}
            onChange={(v) =>
              setS({ ...s, reminders: { ...s.reminders, after1: v } })
            }
          />
          <Toggle
            label="3 Days After Due"
            sub="For unpaid boarders"
            checked={s.reminders.after3}
            onChange={(v) =>
              setS({ ...s, reminders: { ...s.reminders, after3: v } })
            }
          />
        </div>

        <button
          onClick={() => {
            setBilling(s)
            showToast("Reminder settings saved")
            onBack()
          }}
          className="w-full py-4 rounded-[14px] text-white font-semibold"
          style={{ background: C.primary }}
        >
          Save
        </button>
      </div>
    </div>
  )
}

function GPay_Export({
  showToast,
  onBack,
}: {
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [from, setFrom] = useState("2026-07-01")
  const [to, setTo] = useState("2026-09-07")
  const [fmt, setFmt] = useState<"csv" | "pdf">("csv")
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all")
  const [receipts, setReceipts] = useState(false)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Export Reports" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <Input label="From" value={from} onChange={setFrom} type="date" />
        <Input label="To" value={to} onChange={setTo} type="date" />
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: C.muted }}>
            Format
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["csv", "pdf"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFmt(f)}
                className="py-3 rounded-[12px] font-semibold text-sm uppercase"
                style={{
                  background: fmt === f ? C.primary : C.card,
                  color: fmt === f ? "#fff" : C.muted,
                  border: fmt === f ? "none" : `1px solid ${C.border}`,
                }}
              >
                .{f}
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Include Payments"
          value={filter}
          onChange={(v) => setFilter(v as typeof filter)}
          options={[
            { value: "all", label: "All Payments" },
            { value: "paid", label: "Paid Only" },
            { value: "unpaid", label: "Unpaid Only" },
          ]}
        />
        <div
          className="rounded-[14px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <Toggle
            label="Include Receipt Images"
            sub="Attach uploaded receipt files"
            checked={receipts}
            onChange={setReceipts}
          />
        </div>
        <button
          onClick={() => {
            showToast(`Report exported as ${fmt.toUpperCase()}`)
            onBack()
          }}
          className="w-full py-4 rounded-[14px] text-white font-semibold"
          style={{ background: C.primary }}
        >
          Generate Export
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function GAttendance({
  boarders,
  sessions,
  records,
  setRecords,
  schedule,
  setSchedule,
  showToast,
}: {
  boarders: Boarder[]
  sessions: AttendanceSession[]
  records: AttendanceRecord[]
  setRecords: (r: AttendanceRecord[]) => void
  schedule: WorkshipSchedule
  setSchedule: (s: WorkshipSchedule) => void
  showToast: (m: string) => void
}) {
  const [screen, setScreen] = useState("main")
  const [screenData, setScreenData] = useState<any>(null)

  if (screen === "schedule")
    return (
      <GAttn_Schedule
        schedule={schedule}
        setSchedule={setSchedule}
        showToast={showToast}
        onBack={() => setScreen("main")}
      />
    )
  if (screen === "override")
    return (
      <GAttn_Override
        boarders={boarders}
        sessions={sessions}
        records={records}
        setRecords={setRecords}
        showToast={showToast}
        onBack={() => setScreen("main")}
      />
    )
  if (screen === "export")
    return (
      <GAttn_Export showToast={showToast} onBack={() => setScreen("main")} />
    )

  type SessionType = "morning" | "evening"
  const [session, setSession] = useState<SessionType>("morning")
  const todaySessions = sessions.filter((s) => s.date === "Sep 7, 2026")
  const currentSession = todaySessions.find((s) => s.type === session)
  const sessionRecords = currentSession
    ? records.filter((r) => r.sessionId === currentSession.id)
    : []
  const present = sessionRecords.filter((r) => r.status === "present")
  const absent = sessionRecords.filter((r) => r.status === "absent")
  const absenceWarnings = boarders.filter((b) => {
    const missed = records.filter(
      (r) => r.boarderId === b.id && r.status === "absent",
    ).length
    return missed >= schedule.absenceThreshold
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Attendance"
        right={
          <div className="flex gap-1.5">
            {[
              { icon: "⚙️", s: "schedule" },
              { icon: "✏️", s: "override" },
              { icon: "📊", s: "export" },
            ].map((a) => (
              <button
                key={a.s}
                onClick={() => setScreen(a.s)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ background: C.bg }}
              >
                {a.icon}
              </button>
            ))}
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {/* Session tabs */}
        <div
          className="flex rounded-[12px] p-1 gap-1"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          {(["morning", "evening"] as const).map((t) => {
            const s = todaySessions.find((s) => s.type === t)
            return (
              <button
                key={t}
                onClick={() => setSession(t)}
                className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-colors"
                style={{
                  background: session === t ? C.primary : "transparent",
                  color: session === t ? "#fff" : C.muted,
                }}
              >
                {t === "morning" ? "☀️" : "🌙"}{" "}
                {t === "morning" ? "Morning" : "Evening"}
                {s && (
                  <span className="block text-[10px] font-normal opacity-80">
                    {s.windowStart}–{s.windowEnd}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Date chip */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: C.text }}>
            Sep 7, 2026
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: "#E4EDE3", color: "#3D7055" }}
          >
            {session === "morning" ? "6:00–8:00 AM" : "8:00–10:00 PM"}
          </span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Present"
            value={present.length}
            sub={`of ${boarders.length}`}
            bg={C.sageLt}
            textColor="#3D7055"
          />
          <StatCard
            label="Absent"
            value={absent.length}
            sub="recorded"
            bg={C.dangerLt}
            textColor={C.danger}
          />
        </div>

        {/* Absence alerts */}
        {absenceWarnings.length > 0 && (
          <div
            className="rounded-[14px] p-4"
            style={{ background: C.warnLt, border: `1px solid #F0DCA8` }}
          >
            <p className="font-semibold text-sm mb-2" style={{ color: C.warn }}>
              ⚠ Absence Threshold Reached
            </p>
            {absenceWarnings.map((b) => (
              <div key={b.id} className="flex items-center gap-2 py-1">
                <Avatar initials={b.initials} color={b.avatarColor} size={28} />
                <p className="text-sm" style={{ color: C.warn }}>
                  {b.name} —{" "}
                  {
                    records.filter(
                      (r) => r.boarderId === b.id && r.status === "absent",
                    ).length
                  }{" "}
                  missed
                </p>
              </div>
            ))}
            <button
              onClick={() => showToast("Absence alerts sent")}
              className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: C.warn, color: "#fff" }}
            >
              Send Alerts
            </button>
          </div>
        )}

        {/* Present list */}
        <div>
          <SectionHeader title={`Present (${present.length})`} />
          <div className="space-y-2">
            {present.map((r) => {
              const b = boarders.find((b) => b.id === r.boarderId)!
              return (
                <div
                  key={r.id}
                  className="rounded-[14px] p-3.5 flex items-center gap-3"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Avatar initials={b.initials} color={b.avatarColor} />
                  <div className="flex-1">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: C.text }}
                    >
                      {b.name}
                    </p>
                    <p className="text-xs" style={{ color: C.muted }}>
                      {r.checkInTime} ·{" "}
                      {r.method === "qr" ? "📱 QR Scan" : "✏️ Manual"}
                    </p>
                    {r.overrideReason && (
                      <p className="text-xs italic" style={{ color: C.muted }}>
                        {r.overrideReason}
                      </p>
                    )}
                  </div>
                  <span className="text-lg">✅</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Absent list */}
        {absent.length > 0 && (
          <div>
            <SectionHeader title={`Absent (${absent.length})`} />
            <div className="space-y-2">
              {absent.map((r) => {
                const b = boarders.find((b) => b.id === r.boarderId)!
                return (
                  <div
                    key={r.id}
                    className="rounded-[14px] p-3.5 flex items-center gap-3"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <Avatar initials={b.initials} color={b.avatarColor} />
                    <div className="flex-1">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: C.text }}
                      >
                        {b.name}
                      </p>
                      {r.overrideReason && (
                        <p className="text-xs" style={{ color: C.muted }}>
                          {r.overrideReason}
                        </p>
                      )}
                    </div>
                    <span className="text-lg">❌</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Not yet recorded */}
        {(() => {
          const recordedIds = sessionRecords.map((r) => r.boarderId)
          const unrecorded = boarders.filter((b) => !recordedIds.includes(b.id))
          if (unrecorded.length === 0) return null
          return (
            <div>
              <SectionHeader
                title={`Not Yet Recorded (${unrecorded.length})`}
              />
              <div className="space-y-2">
                {unrecorded.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-[14px] p-3.5 flex items-center gap-3"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <Avatar initials={b.initials} color={b.avatarColor} />
                    <p
                      className="flex-1 text-sm font-semibold"
                      style={{ color: C.muted }}
                    >
                      {b.name}
                    </p>
                    <span className="text-xs" style={{ color: C.muted }}>
                      —
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function GAttn_Schedule({
  schedule,
  setSchedule,
  showToast,
  onBack,
}: {
  schedule: WorkshipSchedule
  setSchedule: (s: WorkshipSchedule) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [s, setS] = useState(schedule)
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Worship Schedule" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <div
          className="rounded-[14px] p-4 space-y-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            ☀️ Morning Session
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              value={s.morningStart}
              onChange={(v) => setS({ ...s, morningStart: v })}
              type="time"
            />
            <Input
              label="End Time"
              value={s.morningEnd}
              onChange={(v) => setS({ ...s, morningEnd: v })}
              type="time"
            />
          </div>
          <Input
            label="QR Code Validity (minutes)"
            value={String(s.morningQRMins)}
            onChange={(v) => setS({ ...s, morningQRMins: Number(v) })}
            type="number"
          />
        </div>
        <div
          className="rounded-[14px] p-4 space-y-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            🌙 Evening Session
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              value={s.eveningStart}
              onChange={(v) => setS({ ...s, eveningStart: v })}
              type="time"
            />
            <Input
              label="End Time"
              value={s.eveningEnd}
              onChange={(v) => setS({ ...s, eveningEnd: v })}
              type="time"
            />
          </div>
          <Input
            label="QR Code Validity (minutes)"
            value={String(s.eveningQRMins)}
            onChange={(v) => setS({ ...s, eveningQRMins: Number(v) })}
            type="number"
          />
        </div>
        <div
          className="rounded-[14px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <Select
            label="Auto-Alert After N Missed Worships"
            value={String(s.absenceThreshold)}
            onChange={(v) => setS({ ...s, absenceThreshold: Number(v) })}
            options={[1, 2, 3, 5, 7].map((n) => ({
              value: String(n),
              label: `${n} missed worship${n > 1 ? "s" : ""}`,
            }))}
          />
        </div>
        <button
          onClick={() => {
            setSchedule(s)
            showToast("Schedule saved")
            onBack()
          }}
          className="w-full py-4 rounded-[14px] text-white font-semibold"
          style={{ background: C.primary }}
        >
          Save Schedule
        </button>
      </div>
    </div>
  )
}

function GAttn_Override({
  boarders,
  sessions,
  records,
  setRecords,
  showToast,
  onBack,
}: {
  boarders: Boarder[]
  sessions: AttendanceSession[]
  records: AttendanceRecord[]
  setRecords: (r: AttendanceRecord[]) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [boarderId, setBoarderId] = useState(boarders[0].id)
  const [sessionId, setSessionId] = useState(sessions[0].id)
  const [status, setStatus] = useState<"present" | "absent">("present")
  const [reason, setReason] = useState("")

  const submit = () => {
    const existing = records.find(
      (r) => r.boarderId === boarderId && r.sessionId === sessionId,
    )
    if (existing) {
      setRecords(
        records.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                status,
                overrideReason: reason,
                overriddenBy: "Ate Sandra",
                method: "manual",
              }
            : r,
        ),
      )
    } else {
      setRecords([
        ...records,
        {
          id: "o" + Date.now(),
          boarderId,
          sessionId,
          status,
          method: "manual",
          overrideReason: reason,
          overriddenBy: "Ate Sandra",
        },
      ])
    }
    showToast("Attendance record updated")
    onBack()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Manual Override" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <Select
          label="Boarder"
          value={boarderId}
          onChange={setBoarderId}
          options={boarders.map((b) => ({
            value: b.id,
            label: `${b.name} — Room ${b.room}`,
          }))}
        />
        <Select
          label="Session"
          value={sessionId}
          onChange={setSessionId}
          options={sessions.map((s) => ({
            value: s.id,
            label: `${
              s.type === "morning" ? "☀️ Morning" : "🌙 Evening"
            } — ${s.date}`,
          }))}
        />
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: C.muted }}>
            Mark As
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["present", "absent"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className="py-3 rounded-[12px] font-semibold text-sm capitalize"
                style={{
                  background:
                    status === st
                      ? st === "present"
                        ? C.sage
                        : C.danger
                      : C.card,
                  color: status === st ? "#fff" : C.muted,
                  border: status === st ? "none" : `1px solid ${C.border}`,
                }}
              >
                {st === "present" ? "✅ Present" : "❌ Absent"}
              </button>
            ))}
          </div>
        </div>
        <Textarea
          label="Reason (required for audit)"
          value={reason}
          onChange={setReason}
          placeholder="Reason for manual override..."
          rows={3}
        />
        <button
          onClick={submit}
          disabled={!reason.trim()}
          className="w-full py-4 rounded-[14px] text-white font-semibold disabled:opacity-40"
          style={{ background: C.primary }}
        >
          Save Override
        </button>
      </div>
    </div>
  )
}

function GAttn_Export({
  showToast,
  onBack,
}: {
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [from, setFrom] = useState("2026-09-01")
  const [to, setTo] = useState("2026-09-07")
  const [fmt, setFmt] = useState<"csv" | "pdf">("csv")
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Export Attendance" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <Input label="From" value={from} onChange={setFrom} type="date" />
        <Input label="To" value={to} onChange={setTo} type="date" />
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: C.muted }}>
            Format
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["csv", "pdf"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFmt(f)}
                className="py-3 rounded-[12px] font-semibold text-sm uppercase"
                style={{
                  background: fmt === f ? C.primary : C.card,
                  color: fmt === f ? "#fff" : C.muted,
                  border: fmt === f ? "none" : `1px solid ${C.border}`,
                }}
              >
                .{f}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => {
            showToast(`Attendance exported as ${fmt.toUpperCase()}`)
            onBack()
          }}
          className="w-full py-4 rounded-[14px] text-white font-semibold"
          style={{ background: C.primary }}
        >
          Export
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function GSecurity({
  boarders,
  setBoarders,
  announcements,
  setAnnouncements,
  visitors,
  setVisitors,
  incidents,
  setIncidents,
  maintenance,
  setMaintenance,
  curfew,
  setCurfew,
  deepLink,
  onDeepLinkConsumed,
  showToast,
}: {
  boarders: Boarder[]
  setBoarders: (b: Boarder[]) => void
  announcements: Announcement[]
  setAnnouncements: (a: Announcement[]) => void
  visitors: VisitorEntry[]
  setVisitors: (v: VisitorEntry[]) => void
  incidents: Incident[]
  setIncidents: (i: Incident[]) => void
  maintenance: MaintenanceReport[]
  setMaintenance: (m: MaintenanceReport[]) => void
  curfew: CurfewRecord[]
  setCurfew: (c: CurfewRecord[]) => void
  deepLink: string | null
  onDeepLinkConsumed: () => void
  showToast: (m: string) => void
}) {
  const [screen, setScreen] = useState(deepLink ?? "overview")
  const [screenData, setScreenData] = useState<any>(null)
  const nav = (s: string, d?: any) => {
    setScreen(s)
    setScreenData(d ?? null)
  }

  // consume the deep link once on mount
  if (deepLink) onDeepLinkConsumed()

  if (screen === "contacts")
    return (
      <GSec_Contacts
        boarders={boarders}
        setBoarders={setBoarders}
        showToast={showToast}
        onBack={() => nav("overview")}
      />
    )
  if (screen === "announcements")
    return (
      <GSec_Announcements
        boarders={boarders}
        announcements={announcements}
        setAnnouncements={setAnnouncements}
        showToast={showToast}
        onBack={() => nav("overview")}
      />
    )
  if (screen === "visitors")
    return (
      <GSec_Visitors
        boarders={boarders}
        visitors={visitors}
        setVisitors={setVisitors}
        showToast={showToast}
        onBack={() => nav("overview")}
      />
    )
  if (screen === "curfew")
    return (
      <GSec_Curfew
        boarders={boarders}
        curfew={curfew}
        setCurfew={setCurfew}
        showToast={showToast}
        onBack={() => nav("overview")}
      />
    )
  if (screen === "incidents")
    return (
      <GSec_Incidents
        boarders={boarders}
        incidents={incidents}
        setIncidents={setIncidents}
        maintenance={maintenance}
        showToast={showToast}
        onBack={() => nav("overview")}
      />
    )

  const activeSOS = incidents.filter((i) => i.type === "sos" && !i.resolved)
  const todayVisitors = visitors.filter((v) => v.date === "Sep 7, 2026")
  const curfewPending = curfew.filter((c) => c.status === "pending").length
  const curfewLate = curfew.filter((c) => c.status === "late").length

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Security & Emergency" />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {/* SOS alerts */}
        {activeSOS.length > 0 && (
          <div
            className="rounded-[14px] p-4 space-y-2"
            style={{ background: "#FFE4E4", border: `2px solid ${C.danger}` }}
          >
            <p className="font-bold text-sm" style={{ color: C.danger }}>
              🆘 Active SOS Alert
            </p>
            {activeSOS.map((i) => {
              const b = boarders.find((b) => b.id === i.boarderId)
              return (
                <div key={i.id} className="flex items-center justify-between">
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: C.danger }}
                    >
                      {b?.name}
                    </p>
                    <p className="text-xs" style={{ color: C.danger }}>
                      {i.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIncidents(
                        incidents.map((inc) =>
                          inc.id === i.id ? { ...inc, resolved: true } : inc,
                        ),
                      )
                      showToast("SOS resolved")
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full text-white flex-shrink-0 ml-2"
                    style={{ background: C.danger }}
                  >
                    Resolve
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              icon: "📞",
              label: "Emergency Contacts",
              sub: `${boarders.length} boarders`,
              s: "contacts",
            },
            {
              icon: "📢",
              label: "Announcements",
              sub: `${announcements.length} sent`,
              s: "announcements",
            },
            {
              icon: "👥",
              label: "Visitor Log",
              sub: `${todayVisitors.length} today`,
              s: "visitors",
            },
            {
              icon: "🌙",
              label: "Curfew Compliance",
              sub: `${curfewLate} late · ${curfewPending} pending`,
              s: "curfew",
              alert: curfewLate > 0,
            },
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => nav(item.s)}
              className="rounded-[14px] p-4 text-left active:opacity-70"
              style={{
                background: C.card,
                border: `1px solid ${item.alert ? "#F0DCA8" : C.border}`,
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <p
                className="font-semibold text-sm mt-2"
                style={{ color: C.text }}
              >
                {item.label}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: item.alert ? C.warn : C.muted }}
              >
                {item.sub}
              </p>
            </button>
          ))}
        </div>

        {/* Incidents */}
        <div>
          <SectionHeader
            title="Incident Log"
            action={
              <button
                onClick={() => nav("incidents")}
                className="text-xs font-semibold"
                style={{ color: C.primary }}
              >
                View all
              </button>
            }
          />
          <div className="space-y-2">
            {incidents.slice(0, 3).map((i) => {
              const b = boarders.find((b) => b.id === i.boarderId)
              return (
                <div
                  key={i.id}
                  className="rounded-[14px] p-3.5 flex items-start gap-3"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <IncidentBadge type={i.type} />
                      {i.resolved && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: C.sageLt, color: "#3D7055" }}
                        >
                          Resolved
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: C.text }}
                    >
                      {i.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {i.timestamp}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Maintenance */}
        <div>
          <SectionHeader title="Maintenance Reports" />
          <div className="space-y-2">
            {maintenance
              .filter((m) => m.status !== "resolved")
              .map((m) => {
                const b = boarders.find((b) => b.id === m.boarderId)!
                return (
                  <div
                    key={m.id}
                    className="rounded-[14px] p-3.5 flex items-center gap-3"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <span className="text-2xl">
                      {m.category === "plumbing"
                        ? "🚿"
                        : m.category === "electrical"
                          ? "💡"
                          : m.category === "appliance"
                            ? "❄️"
                            : "🛋️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: C.text }}
                      >
                        Room {m.room} · {m.category}
                      </p>
                      <p className="text-xs" style={{ color: C.muted }}>
                        {m.description.slice(0, 50)}...
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          m.status === "in_progress" ? C.warnLt : C.dangerLt,
                        color: m.status === "in_progress" ? C.warn : C.danger,
                      }}
                    >
                      {m.status === "in_progress" ? "In Progress" : "Open"}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

function GSec_Contacts({
  boarders,
  setBoarders,
  showToast,
  onBack,
}: {
  boarders: Boarder[]
  setBoarders: (b: Boarder[]) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", relationship: "", phone: "" })

  const startEdit = (b: Boarder) => {
    setEditing(b.id)
    setForm({
      name: b.emergencyContact.name,
      relationship: b.emergencyContact.relationship,
      phone: b.emergencyContact.phone,
    })
  }
  const saveEdit = () => {
    setBoarders(
      boarders.map((b) =>
        b.id === editing ? { ...b, emergencyContact: form } : b,
      ),
    )
    setEditing(null)
    showToast("Contact updated")
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Emergency Contacts" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        {boarders.map((b) => (
          <div
            key={b.id}
            className="rounded-[14px] p-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar initials={b.initials} color={b.avatarColor} />
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: C.text }}>
                  {b.name}
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  Room {b.room}
                </p>
              </div>
              <button
                onClick={() => startEdit(b)}
                className="text-xs font-semibold"
                style={{ color: C.primary }}
              >
                Edit
              </button>
            </div>
            {editing === b.id ? (
              <div
                className="space-y-3 pt-2"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <Input
                  label="Contact Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <Input
                  label="Relationship"
                  value={form.relationship}
                  onChange={(v) => setForm({ ...form, relationship: v })}
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
                <ActionPair
                  onCancel={() => setEditing(null)}
                  onConfirm={saveEdit}
                  confirmLabel="Save"
                />
              </div>
            ) : (
              <div
                className="space-y-1 pt-2"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <p className="text-sm font-semibold" style={{ color: C.text }}>
                  {b.emergencyContact.name}
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  {b.emergencyContact.relationship} · {b.emergencyContact.phone}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function GSec_Announcements({
  boarders,
  announcements,
  setAnnouncements,
  showToast,
  onBack,
}: {
  boarders: Boarder[]
  announcements: Announcement[]
  setAnnouncements: (a: Announcement[]) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [view, setView] = useState<"list" | "compose" | "detail">("list")
  const [selected, setSelected] = useState<Announcement | null>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState<"normal" | "critical">("normal")
  const [recipients, setRecipients] = useState<"all" | string[]>("all")

  const send = () => {
    const ann: Announcement = {
      id: "ann" + Date.now(),
      title,
      body,
      priority,
      recipients,
      sentAt: "Sep 7 · now",
      sentBy: "Ate Sandra",
      readBy: [],
      acknowledgedBy: [],
    }
    setAnnouncements([ann, ...announcements])
    showToast("Announcement sent")
    setView("list")
    setTitle("")
    setBody("")
  }

  if (view === "detail" && selected)
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Announcement" onBack={() => setView("list")} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
          <div
            className="rounded-[14px] p-4 space-y-2"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2">
              <span>{selected.priority === "critical" ? "🔴" : "📢"}</span>
              {selected.priority === "critical" && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: C.dangerLt, color: C.danger }}
                >
                  Critical
                </span>
              )}
            </div>
            <p className="font-bold text-lg" style={{ color: C.text }}>
              {selected.title}
            </p>
            <p className="text-sm" style={{ color: C.text }}>
              {selected.body}
            </p>
            <p className="text-xs" style={{ color: C.muted }}>
              Sent {selected.sentAt} by {selected.sentBy}
            </p>
          </div>
          <div
            className="rounded-[14px] p-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="font-semibold text-sm mb-3" style={{ color: C.text }}>
              Read by {selected.readBy.length}/{boarders.length} boarders
            </p>
            <div
              className="h-2 rounded-full overflow-hidden mb-3"
              style={{ background: C.bg }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(selected.readBy.length / boarders.length) * 100}%`,
                  background: C.sage,
                }}
              />
            </div>
            <div className="space-y-2">
              {boarders.map((b) => {
                const read = selected.readBy.includes(b.id)
                const acked = selected.acknowledgedBy.includes(b.id)
                return (
                  <div key={b.id} className="flex items-center gap-3">
                    <Avatar
                      initials={b.initials}
                      color={b.avatarColor}
                      size={32}
                    />
                    <p
                      className="flex-1 text-sm"
                      style={{ color: read ? C.text : C.muted }}
                    >
                      {b.name}
                    </p>
                    {read ? (
                      <span className="text-xs" style={{ color: C.sage }}>
                        ✓ Read
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: C.muted }}>
                        Unread
                      </span>
                    )}
                    {selected.priority === "critical" && acked && (
                      <span className="text-xs" style={{ color: "#3D7055" }}>
                        ✓ Ack
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )

  if (view === "compose")
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="New Announcement" onBack={() => setView("list")} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={setTitle}
            placeholder="Brief, clear subject..."
          />
          <Textarea
            label="Message"
            value={body}
            onChange={setBody}
            placeholder="Write your message here..."
            rows={5}
          />
          <div>
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: C.muted }}
            >
              Priority
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["normal", "critical"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className="py-3 rounded-[12px] font-semibold text-sm capitalize"
                  style={{
                    background:
                      priority === p
                        ? p === "critical"
                          ? C.danger
                          : C.primary
                        : C.card,
                    color: priority === p ? "#fff" : C.muted,
                    border: priority === p ? "none" : `1px solid ${C.border}`,
                  }}
                >
                  {p === "critical" ? "🔴 Critical" : "📢 Normal"}
                </button>
              ))}
            </div>
          </div>
          <div
            className="rounded-[14px] p-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="font-semibold text-sm mb-2" style={{ color: C.text }}>
              Recipients
            </p>
            <button
              onClick={() => setRecipients("all")}
              className="flex items-center gap-2 w-full"
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: recipients === "all" ? C.primary : C.border,
                }}
              >
                {recipients === "all" && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: C.primary }}
                  />
                )}
              </div>
              <span className="text-sm" style={{ color: C.text }}>
                All boarders
              </span>
            </button>
          </div>
          <button
            onClick={send}
            disabled={!title.trim() || !body.trim()}
            className="w-full py-4 rounded-[14px] text-white font-semibold disabled:opacity-40"
            style={{ background: C.primary }}
          >
            Send Announcement
          </button>
        </div>
      </div>
    )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Announcements"
        onBack={onBack}
        right={
          <button
            onClick={() => setView("compose")}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: C.primaryLt, color: C.primary }}
          >
            + New
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        {announcements.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setSelected(a)
              setView("detail")
            }}
            className="w-full rounded-[14px] p-4 text-left active:opacity-70"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {a.priority === "critical" && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: C.dangerLt, color: C.danger }}
                    >
                      Critical
                    </span>
                  )}
                  <span className="text-xs" style={{ color: C.muted }}>
                    {a.sentAt}
                  </span>
                </div>
                <p className="font-semibold text-sm" style={{ color: C.text }}>
                  {a.title}
                </p>
                <p
                  className="text-xs mt-1 line-clamp-2"
                  style={{ color: C.muted }}
                >
                  {a.body}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: C.bg }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(a.readBy.length / boarders.length) * 100}%`,
                    background: C.sage,
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: C.muted }}>
                {a.readBy.length}/{boarders.length} read
              </span>
            </div>
          </button>
        ))}
        {announcements.length === 0 && (
          <EmptyState
            icon="📢"
            title="No announcements yet"
            sub="Tap + New to create one"
          />
        )}
      </div>
    </div>
  )
}

function GSec_Visitors({
  boarders,
  visitors,
  setVisitors,
  showToast,
  onBack,
}: {
  boarders: Boarder[]
  visitors: VisitorEntry[]
  setVisitors: (v: VisitorEntry[]) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [sheet, setSheet] = useState(false)
  const [name, setName] = useState("")
  const [boarderId, setBoarderId] = useState(boarders[0].id)
  const [purpose, setPurpose] = useState("")
  const today = "Sep 7, 2026"

  const add = () => {
    setVisitors([
      ...visitors,
      {
        id: "v" + Date.now(),
        visitorName: name,
        boarderId,
        purpose,
        timeIn: "Now",
        date: today,
      },
    ])
    showToast("Visitor logged")
    setSheet(false)
    setName("")
    setPurpose("")
  }
  const markOut = (id: string) =>
    setVisitors(
      visitors.map((v) => (v.id === id ? { ...v, timeOut: "Now" } : v)),
    )

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ position: "relative" }}
    >
      <Header
        title="Visitor Log"
        onBack={onBack}
        right={
          <button
            onClick={() => setSheet(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: C.primaryLt, color: C.primary }}
          >
            + Add
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        <p className="text-xs font-semibold" style={{ color: C.muted }}>
          Today — {today}
        </p>
        {visitors
          .filter((v) => v.date === today)
          .map((v) => {
            const b = boarders.find((b) => b.id === v.boarderId)!
            return (
              <div
                key={v.id}
                className="rounded-[14px] p-4"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.text }}
                  >
                    {v.visitorName}
                  </p>
                  {!v.timeOut ? (
                    <button
                      onClick={() => markOut(v.id)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: C.dangerLt, color: C.danger }}
                    >
                      Mark Out
                    </button>
                  ) : (
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: C.sageLt, color: "#3D7055" }}
                    >
                      Out
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: C.muted }}>
                  Visiting: {b.name} · Room {b.room}
                </p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {v.purpose} · In: {v.timeIn}
                  {v.timeOut ? ` · Out: ${v.timeOut}` : ""}
                </p>
              </div>
            )
          })}
        <p className="text-xs font-semibold mt-4" style={{ color: C.muted }}>
          Previous Days
        </p>
        {visitors
          .filter((v) => v.date !== today)
          .map((v) => {
            const b = boarders.find((b) => b.id === v.boarderId)!
            return (
              <div
                key={v.id}
                className="rounded-[14px] p-4"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <p className="font-semibold text-sm" style={{ color: C.text }}>
                  {v.visitorName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {v.date} · {b.name} · {v.purpose}
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  In: {v.timeIn}
                  {v.timeOut ? ` · Out: ${v.timeOut}` : ""}
                </p>
              </div>
            )
          })}
      </div>
      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Log Visitor"
      >
        <Input
          label="Visitor Name"
          value={name}
          onChange={setName}
          placeholder="Full name"
        />
        <Select
          label="Visiting Boarder"
          value={boarderId}
          onChange={setBoarderId}
          options={boarders.map((b) => ({
            value: b.id,
            label: `${b.name} — Room ${b.room}`,
          }))}
        />
        <Input
          label="Purpose"
          value={purpose}
          onChange={setPurpose}
          placeholder="e.g. Family visit, delivery..."
        />
        <ActionPair
          onCancel={() => setSheet(false)}
          onConfirm={add}
          confirmLabel="Log Visitor"
        />
      </BottomSheet>
    </div>
  )
}

function GSec_Curfew({
  boarders,
  curfew,
  setCurfew,
  showToast,
  onBack,
}: {
  boarders: Boarder[]
  curfew: CurfewRecord[]
  setCurfew: (c: CurfewRecord[]) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  type F = "all" | "compliant" | "late" | "absent" | "pending"
  const [filter, setFilter] = useState<F>("all")

  const filtered =
    filter === "all" ? curfew : curfew.filter((c) => c.status === filter)
  const counts = {
    compliant: curfew.filter((c) => c.status === "compliant").length,
    late: curfew.filter((c) => c.status === "late").length,
    absent: curfew.filter((c) => c.status === "absent").length,
    pending: curfew.filter((c) => c.status === "pending").length,
  }

  const flag = (id: string) => {
    setCurfew(
      curfew.map((c) =>
        c.id === id ? { ...c, status: "absent" as const } : c,
      ),
    )
    showToast("Boarder flagged as absent")
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Curfew Compliance" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: C.text }}>
            Sep 7, 2026
          </span>
          <span
            className="text-sm font-semibold px-3 py-1.5 rounded-full"
            style={{ background: C.dangerLt, color: C.danger }}
          >
            Curfew: 10:00 PM
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { l: "In", v: counts.compliant, bg: C.sageLt, tc: "#3D7055" },
            { l: "Late", v: counts.late, bg: C.dangerLt, tc: C.danger },
            { l: "Absent", v: counts.absent, bg: "#F5E4E4", tc: "#9B0000" },
            { l: "Pending", v: counts.pending, bg: C.primaryLt, tc: C.primary },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-[12px] py-3"
              style={{ background: s.bg }}
            >
              <p className="text-xl font-bold" style={{ color: s.tc }}>
                {s.v}
              </p>
              <p className="text-[10px] font-medium" style={{ color: s.tc }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
        <ChipBar<F>
          options={[
            { label: "All", value: "all" },
            { label: "✓ In", value: "compliant" },
            { label: "⚠ Late", value: "late" },
            { label: "✕ Absent", value: "absent" },
            { label: "⏳ Pending", value: "pending" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <div className="space-y-2.5">
          {filtered.map((c) => {
            const b = boarders.find((b) => b.id === c.boarderId)!
            return (
              <div
                key={c.id}
                className="rounded-[14px] p-4 flex items-center gap-3"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <Avatar initials={b.initials} color={b.avatarColor} />
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.text }}
                  >
                    {b.name}
                  </p>
                  <p className="text-xs" style={{ color: C.muted }}>
                    Room {b.room}
                    {c.checkedInAt ? ` · Checked in: ${c.checkedInAt}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CurfewChip status={c.status} />
                  {c.status === "pending" && (
                    <button
                      onClick={() => flag(c.id)}
                      className="text-[10px] font-semibold px-2 py-1 rounded-full"
                      style={{ background: C.dangerLt, color: C.danger }}
                    >
                      Flag
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function GSec_Incidents({
  boarders,
  incidents,
  setIncidents,
  maintenance,
  showToast,
  onBack,
}: {
  boarders: Boarder[]
  incidents: Incident[]
  setIncidents: (i: Incident[]) => void
  maintenance: MaintenanceReport[]
  showToast: (m: string) => void
  onBack: () => void
}) {
  type F = "all" | "missed_curfew" | "sos" | "missed_worship" | "maintenance" | "other"
  const [filter, setFilter] = useState<F>("all")
  const filtered =
    filter === "all" ? incidents : incidents.filter((i) => i.type === filter)
  const resolve = (id: string) => {
    setIncidents(
      incidents.map((i) => (i.id === id ? { ...i, resolved: true } : i)),
    )
    showToast("Incident resolved")
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Incident Log" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <ChipBar<F>
          options={[
            { label: "All", value: "all" },
            { label: "🌙 Curfew", value: "missed_curfew" },
            { label: "🆘 SOS", value: "sos" },
            { label: "📅 Worship", value: "missed_worship" },
            { label: "🔧 Maint.", value: "maintenance" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <div className="space-y-2.5">
          {filtered.map((i) => {
            const b = boarders.find((b) => b.id === i.boarderId)
            return (
              <div
                key={i.id}
                className="rounded-[14px] p-4"
                style={{
                  background: C.card,
                  border: `1px solid ${i.resolved ? C.border : C.dangerLt}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <IncidentBadge type={i.type} />
                      {i.resolved && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: C.sageLt, color: "#3D7055" }}
                        >
                          Resolved
                        </span>
                      )}
                    </div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: C.text }}
                    >
                      {i.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: C.muted }}>
                      {i.description}
                    </p>
                    {b && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Avatar
                          initials={b.initials}
                          color={b.avatarColor}
                          size={20}
                        />
                        <span className="text-xs" style={{ color: C.muted }}>
                          {b.name}
                        </span>
                      </div>
                    )}
                    <p className="text-xs mt-1.5" style={{ color: C.muted }}>
                      {i.timestamp}
                    </p>
                  </div>
                  {!i.resolved && (
                    <button
                      onClick={() => resolve(i.id)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-[8px] flex-shrink-0 text-white"
                      style={{ background: C.sage }}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <EmptyState icon="✅" title="No incidents" sub="All clear!" />
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MORE
// ═══════════════════════════════════════════════════════════════════════════════

function GMore({
  onLogout,
  showToast,
}: {
  onLogout: () => void
  showToast: (m: string) => void
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="More" />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <div
          className="rounded-[14px] p-5 flex items-center gap-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ background: C.primary }}
          >
            S
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: C.text }}>
              Sandra Ramos
            </p>
            <p className="text-sm" style={{ color: C.muted }}>
              Guardian · House Owner
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>
              09171234567
            </p>
          </div>
        </div>
        <div className="space-y-2.5">
          <RowItem
            icon="🏠"
            label="House Profile"
            sub="Casa Marigold — Cebu City"
            onClick={() => showToast("Opening house profile…")}
          />
          <RowItem
            icon="📦"
            label="Inventory"
            sub="Track house supplies & stock"
            onClick={() => showToast("Opening inventory…")}
          />
          <RowItem
            icon="📊"
            label="Reports"
            sub="View all financial & attendance reports"
            onClick={() => showToast("Opening reports…")}
          />
          <RowItem
            icon="📋"
            label="House Rules"
            sub="Manage and publish rules"
            onClick={() => showToast("Opening house rules…")}
          />
          <RowItem
            icon="⚙️"
            label="Settings"
            sub="App preferences"
            onClick={() => showToast("Opening settings…")}
          />
        </div>
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-[14px] font-semibold"
          style={{ background: C.dangerLt, color: C.danger }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
