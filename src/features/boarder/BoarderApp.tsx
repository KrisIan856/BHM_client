import { useState, useEffect, useRef } from "react"
import { C } from "@/lib/theme"
import type {
  PaymentRecord,
  AttendanceRecord,
  MaintenanceReport,
  Announcement,
} from "@/lib/types"
import {
  LOGGED_IN_BOARDER,
  PAYMENT_RECORDS as INIT_PAYMENTS,
  ATTENDANCE_RECORDS as INIT_ATTN,
  SESSIONS,
  ANNOUNCEMENTS as INIT_ANN,
  MAINTENANCE_REPORTS as INIT_MAINT,
  CURFEW_RECORDS as INIT_CURFEW,
} from "@/lib/data"
import {
  Avatar,
  PayChip,
  ReceiptChip,
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

type BoardTab = "home" | "payments" | "attendance" | "security" | "more"

// ─── Boarder App shell ────────────────────────────────────────────────────────

export function BoarderApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<BoardTab>("home")
  const boarder = LOGGED_IN_BOARDER

  const [payments, setPayments] = useState<PaymentRecord[]>(INIT_PAYMENTS)
  const [attnRecords, setAttnRecords] = useState<AttendanceRecord[]>(INIT_ATTN)
  const [announcements, setAnnouncements] = useState(INIT_ANN)
  const [maintenance, setMaintenance] =
    useState<MaintenanceReport[]>(INIT_MAINT)
  const [curfew, setCurfew] = useState(INIT_CURFEW)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "payments", label: "Payments", icon: "💳" },
    { id: "attendance", label: "Attendance", icon: "📅" },
    { id: "security", label: "Security", icon: "🛡️" },
    { id: "more", label: "More", icon: "••" },
  ]

  // unread announcement count for badge
  const unread = announcements.filter((a) => {
    const target = a.recipients === "all" || a.recipients.includes(boarder.id)
    return target && !a.readBy.includes(boarder.id)
  }).length

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{ background: C.bg }}
    >
      {tab === "home" && (
        <BHome
          boarder={boarder}
          payments={payments}
          announcements={announcements}
          attnRecords={attnRecords}
          onTabChange={setTab}
          showToast={showToast}
        />
      )}
      {tab === "payments" && (
        <BPayments
          boarder={boarder}
          payments={payments}
          setPayments={setPayments}
          showToast={showToast}
        />
      )}
      {tab === "attendance" && (
        <BAttendance
          boarder={boarder}
          attnRecords={attnRecords}
          setAttnRecords={setAttnRecords}
          showToast={showToast}
        />
      )}
      {tab === "security" && (
        <BSecurity
          boarder={boarder}
          announcements={announcements}
          setAnnouncements={setAnnouncements}
          maintenance={maintenance}
          setMaintenance={setMaintenance}
          curfew={curfew}
          setCurfew={setCurfew}
          showToast={showToast}
        />
      )}
      {tab === "more" && (
        <BMore boarder={boarder} onLogout={onLogout} showToast={showToast} />
      )}

      <NavBar
        items={navItems.map((i) => ({
          ...i,
          icon: i.id === "security" && unread > 0 ? `${i.icon}` : i.icon,
        }))}
        active={tab}
        onSelect={(id) => setTab(id as BoardTab)}
      />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════════════════════

function BHome({
  boarder,
  payments,
  announcements,
  attnRecords,
  onTabChange,
  showToast,
}: {
  boarder: typeof LOGGED_IN_BOARDER
  payments: PaymentRecord[]
  announcements: Announcement[]
  attnRecords: AttendanceRecord[]
  onTabChange: (t: BoardTab) => void
  showToast: (m: string) => void
}) {
  const myPay = payments.find(
    (p) => p.boarderId === boarder.id && p.period === "Sep 2026",
  )
  const myAttn = attnRecords.filter((r) => r.boarderId === boarder.id)
  const presentCount = myAttn.filter((r) => r.status === "present").length
  const todaySession = attnRecords.find(
    (r) => r.boarderId === boarder.id && r.sessionId === "s1",
  )
  const myAnn = announcements.filter(
    (a) =>
      a.recipients === "all" ||
      (Array.isArray(a.recipients) && a.recipients.includes(boarder.id)),
  )
  const unread = myAnn.filter((a) => !a.readBy.includes(boarder.id))

  const payBg =
    boarder.paymentStatus === "paid"
      ? C.sage
      : boarder.paymentStatus === "pending"
        ? C.primary
        : C.danger

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-5 space-y-4">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1
            className="text-[22px] font-bold leading-tight"
            style={{ color: C.text }}
          >
            Hi, {boarder.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm" style={{ color: C.muted }}>
            Room {boarder.room} · Casa Marigold
          </p>
        </div>
        <div className="relative">
          <Avatar
            initials={boarder.initials}
            color={boarder.avatarColor}
            size={46}
          />
          {unread.length > 0 && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
              style={{ background: C.danger }}
            >
              {unread.length}
            </div>
          )}
        </div>
      </div>

      {/* Payment status hero */}
      <div className="rounded-[14px] p-5" style={{ background: payBg }}>
        <p className="text-white/70 text-xs font-medium">September 2026</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="text-white/80 text-sm">Monthly Rent</p>
            <p className="text-[32px] font-bold text-white leading-tight">
              ₱{boarder.monthlyRate.toLocaleString()}
            </p>
          </div>
          {boarder.paymentStatus === "paid" ? (
            <div className="bg-white/20 rounded-full px-3 py-1.5 mb-1 text-white text-sm font-semibold">
              ✓ Paid
            </div>
          ) : (
            <div className="text-center mb-1">
              <div className="bg-white rounded-[10px] px-3 py-2">
                <p className="text-[10px]" style={{ color: C.muted }}>
                  Due
                </p>
                <p className="font-bold text-sm" style={{ color: C.text }}>
                  Sep 10
                </p>
              </div>
            </div>
          )}
        </div>
        {boarder.paymentStatus !== "paid" && (
          <button
            onClick={() => onTabChange("payments")}
            className="mt-3 w-full py-2.5 rounded-[10px] font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            Upload Receipt →
          </button>
        )}
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-[14px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <span className="text-2xl">📅</span>
          <p className="text-xs font-medium mt-2" style={{ color: C.muted }}>
            Today's Worship
          </p>
          <p className="font-semibold text-sm mt-0.5" style={{ color: C.text }}>
            {todaySession?.status === "present"
              ? "✅ Checked in"
              : "⏳ Not yet"}
          </p>
        </div>
        <div
          className="rounded-[14px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <span className="text-2xl">🔥</span>
          <p className="text-xs font-medium mt-2" style={{ color: C.muted }}>
            Attendance Streak
          </p>
          <p className="font-semibold text-sm mt-0.5" style={{ color: C.text }}>
            {presentCount} sessions
          </p>
        </div>
      </div>

      {/* SOS quick button */}
      <button
        onClick={() => {
          showToast("🆘 SOS alert sent to guardian!")
        }}
        className="w-full rounded-[14px] p-4 flex items-center gap-3"
        style={{ background: C.dangerLt, border: `1px solid #F5C4C4` }}
      >
        <span className="text-3xl">🆘</span>
        <div className="text-left">
          <p className="font-bold" style={{ color: C.danger }}>
            Emergency SOS
          </p>
          <p className="text-xs" style={{ color: C.danger }}>
            Tap to alert guardian immediately
          </p>
        </div>
      </button>

      {/* Announcements */}
      {unread.length > 0 && (
        <div>
          <SectionHeader
            title={`Announcements (${unread.length} unread)`}
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
          <div className="space-y-2.5">
            {unread.slice(0, 2).map((a) => (
              <div
                key={a.id}
                className="rounded-[14px] p-4 flex gap-3"
                style={{
                  background: C.card,
                  border: `1px solid ${
                    a.priority === "critical" ? "#F5C4C4" : C.border
                  }`,
                }}
              >
                <span className="text-lg flex-shrink-0">
                  {a.priority === "critical" ? "🔴" : "📢"}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.text }}
                  >
                    {a.title}
                  </p>
                  <p
                    className="text-xs mt-0.5 line-clamp-2"
                    style={{ color: C.muted }}
                  >
                    {a.body}
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.muted }}>
                    {a.sentAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════════

function BPayments({
  boarder,
  payments,
  setPayments,
  showToast,
}: {
  boarder: typeof LOGGED_IN_BOARDER
  payments: PaymentRecord[]
  setPayments: (p: PaymentRecord[]) => void
  showToast: (m: string) => void
}) {
  const [screen, setScreen] = useState("ledger")
  const [uploadDone, setUploadDone] = useState(false)

  const myPay = payments.filter((p) => p.boarderId === boarder.id)
  const current = myPay.find((p) => p.period === "Sep 2026")
  const history = myPay.filter((p) => p.period !== "Sep 2026")

  const uploadReceipt = () => {
    if (current) {
      setPayments(
        payments.map((p) =>
          p.id === current.id
            ? {
                ...p,
                receiptStatus: "pending_review",
                receiptFileName: "gcash_sep7.jpg",
              }
            : p,
        ),
      )
    } else {
      setPayments([
        ...payments,
        {
          id: "p" + Date.now(),
          boarderId: boarder.id,
          period: "Sep 2026",
          amount: boarder.monthlyRate,
          method: "gcash",
          status: "pending",
          receiptStatus: "pending_review",
          receiptFileName: "gcash_sep7.jpg",
          recordedBy: "boarder",
        },
      ])
    }
    setUploadDone(true)
    showToast("Receipt uploaded — awaiting guardian review")
  }

  const updatedCurrent = payments.find(
    (p) => p.boarderId === boarder.id && p.period === "Sep 2026",
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Payments" />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {/* Current bill card */}
        <div className="rounded-[14px] p-5" style={{ background: C.primary }}>
          <p className="text-white/70 text-xs font-medium">
            Current Bill — September 2026
          </p>
          <p className="text-[36px] font-bold text-white mt-1">
            ₱{boarder.monthlyRate.toLocaleString()}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-white/70 text-xs">Due Date</p>
              <p className="text-white font-semibold text-sm">
                September 10, 2026
              </p>
            </div>
            <PayChip status={boarder.paymentStatus} />
          </div>
        </div>

        {/* Bill breakdown */}
        <div
          className="rounded-[14px] p-4 space-y-3"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            Bill Breakdown
          </p>
          {[
            { l: "Room Rent", a: boarder.monthlyRate - 500 },
            { l: "Water", a: 300 },
            { l: "Electricity", a: 200 },
          ].map((row) => (
            <div key={row.l} className="flex justify-between">
              <span className="text-sm" style={{ color: C.muted }}>
                {row.l}
              </span>
              <span className="text-sm font-medium" style={{ color: C.text }}>
                ₱{row.a.toLocaleString()}
              </span>
            </div>
          ))}
          <div
            className="flex justify-between pt-2"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <span className="font-semibold text-sm" style={{ color: C.text }}>
              Total
            </span>
            <span className="font-bold" style={{ color: C.text }}>
              ₱{boarder.monthlyRate.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Receipt upload / status */}
        <div
          className="rounded-[14px] p-4 space-y-3"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.text }}>
            Payment Proof
          </p>
          {updatedCurrent?.receiptStatus ? (
            <div className="space-y-3">
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-[10px]"
                style={{ background: C.bg }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧾</span>
                  <p className="text-sm" style={{ color: C.text }}>
                    {updatedCurrent.receiptFileName}
                  </p>
                </div>
                <ReceiptChip status={updatedCurrent.receiptStatus} />
              </div>
              {updatedCurrent.receiptStatus === "rejected" &&
                updatedCurrent.rejectionReason && (
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
                      {updatedCurrent.rejectionReason}
                    </p>
                    <button
                      onClick={() => {
                        setUploadDone(false)
                        setPayments(
                          payments.map((p) =>
                            p.id === updatedCurrent.id
                              ? {
                                  ...p,
                                  receiptStatus: undefined,
                                  receiptFileName: undefined,
                                }
                              : p,
                          ),
                        )
                      }}
                      className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: C.danger, color: "#fff" }}
                    >
                      Re-upload
                    </button>
                  </div>
                )}
              {updatedCurrent.receiptStatus === "verified" &&
                updatedCurrent.verifiedAt && (
                  <p className="text-xs" style={{ color: C.muted }}>
                    Verified {updatedCurrent.verifiedAt} by{" "}
                    {updatedCurrent.verifiedBy}
                  </p>
                )}
            </div>
          ) : boarder.paymentStatus !== "paid" ? (
            <div>
              <p className="text-sm mb-3" style={{ color: C.muted }}>
                Upload your GCash, bank, or payment receipt for this month.
              </p>
              <button
                onClick={uploadReceipt}
                className="w-full py-3 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2"
                style={{
                  background: C.primaryLt,
                  color: C.primary,
                  border: `1px dashed ${C.primary}`,
                }}
              >
                📎 Upload Receipt
              </button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: C.muted }}>
              Payment verified by guardian. No action needed.
            </p>
          )}
        </div>

        {/* Billing reminders info */}
        <div
          className="rounded-[14px] p-4"
          style={{ background: C.warnLt, border: `1px solid #F0DCA8` }}
        >
          <p className="font-semibold text-sm" style={{ color: C.warn }}>
            🔔 Reminder
          </p>
          <p className="text-xs mt-1" style={{ color: C.warn }}>
            Your rent of ₱{boarder.monthlyRate.toLocaleString()} is due on
            September 10, 2026. Please settle before the grace period ends on
            September 13.
          </p>
        </div>

        {/* History */}
        <div>
          <SectionHeader title="Payment History" />
          <div className="space-y-2.5">
            {history.map((p) => (
              <div
                key={p.id}
                className="rounded-[14px] p-4 flex items-center gap-3"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: C.sageLt }}
                >
                  ✅
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.text }}
                  >
                    {p.period}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                    Paid {p.paidDate} · {p.method.replace("_", " ")}
                  </p>
                  {p.receiptStatus && <ReceiptChip status={p.receiptStatus} />}
                </div>
                <span className="font-bold" style={{ color: C.text }}>
                  ₱{p.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {history.length === 0 && (
              <EmptyState icon="📋" title="No payment history yet" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════════════

function BAttendance({
  boarder,
  attnRecords,
  setAttnRecords,
  showToast,
}: {
  boarder: typeof LOGGED_IN_BOARDER
  attnRecords: AttendanceRecord[]
  setAttnRecords: (r: AttendanceRecord[]) => void
  showToast: (m: string) => void
}) {
  const [screen, setScreen] = useState<"main" | "qr">("main")
  const [scanning, setScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const myRecords = attnRecords.filter((r) => r.boarderId === boarder.id)
  const present = myRecords.filter((r) => r.status === "present")
  const absent = myRecords.filter((r) => r.status === "absent")
  const todayMorning = myRecords.find((r) => r.sessionId === "s1")
  const todayEvening = myRecords.find((r) => r.sessionId === "s2")

  // session window currently open: morning is 6-8am, evening 8-10pm
  // simulate: morning window is "open" for demo
  const isMorningOpen = true
  const isEveningOpen = false

  const startScan = () => {
    setScanning(true)
    timerRef.current = setTimeout(() => {
      setScanning(false)
      setScanDone(true)
      // record check-in
      const existing = attnRecords.find(
        (r) => r.boarderId === boarder.id && r.sessionId === "s1",
      )
      if (!existing) {
        setAttnRecords([
          ...attnRecords,
          {
            id: "qr" + Date.now(),
            boarderId: boarder.id,
            sessionId: "s1",
            status: "present",
            checkInTime: "Just now",
            method: "qr",
          },
        ])
      }
      showToast("✅ Checked in for Morning Worship!")
      setTimeout(() => {
        setScanDone(false)
        setScreen("main")
      }, 1500)
    }, 2500)
  }

  const presentDays = [1, 2, 3, 4, 5, 7]
  const absentDays = [6]
  const firstDayOffset = 2

  if (screen === "qr")
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="QR Check-in"
          onBack={() => {
            setScreen("main")
            clearTimeout(timerRef.current!)
            setScanning(false)
            setScanDone(false)
          }}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div>
            <p
              className="font-bold text-lg text-center"
              style={{ color: C.text }}
            >
              ☀️ Morning Worship
            </p>
            <p className="text-sm text-center" style={{ color: C.muted }}>
              Active window: 6:00 AM – 8:00 AM
            </p>
          </div>

          {/* Camera frame */}
          <div
            className="w-64 h-64 rounded-[24px] overflow-hidden relative flex items-center justify-center"
            style={{
              background: "#1a1a2e",
              border: `3px solid ${scanning ? C.primary : C.border}`,
            }}
          >
            {!scanning && !scanDone && (
              <div className="text-center text-white px-4">
                <p className="text-5xl mb-3">📷</p>
                <p className="text-sm font-medium opacity-70">Camera ready</p>
                <p className="text-xs opacity-50 mt-1">
                  Position QR code in frame
                </p>
              </div>
            )}
            {scanning && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-48 h-48 border-2 rounded-[16px]"
                    style={{ borderColor: C.primary }}
                  >
                    <div
                      className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-[10px]"
                      style={{ borderColor: C.primary }}
                    />
                    <div
                      className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-[10px]"
                      style={{ borderColor: C.primary }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-[10px]"
                      style={{ borderColor: C.primary }}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-[10px]"
                      style={{ borderColor: C.primary }}
                    />
                  </div>
                </div>
                <div
                  className="absolute w-full h-0.5 animate-bounce"
                  style={{ background: C.primary, opacity: 0.8 }}
                />
                <p
                  className="absolute bottom-4 text-xs font-medium"
                  style={{ color: C.primary }}
                >
                  Scanning…
                </p>
              </>
            )}
            {scanDone && (
              <div className="text-center text-white">
                <p className="text-6xl mb-2">✅</p>
                <p className="font-bold text-lg">Checked In!</p>
              </div>
            )}
          </div>

          {!scanning && !scanDone && isMorningOpen && (
            <button
              onClick={startScan}
              className="w-full py-4 rounded-[14px] text-white font-bold text-lg"
              style={{ background: C.primary }}
            >
              Tap to Scan QR Code
            </button>
          )}
          {!isMorningOpen && !scanning && !scanDone && (
            <div
              className="text-center rounded-[14px] p-4"
              style={{ background: C.dangerLt }}
            >
              <p className="font-semibold" style={{ color: C.danger }}>
                Window closed
              </p>
              <p className="text-xs mt-1" style={{ color: C.danger }}>
                Check-in window has ended for this session
              </p>
            </div>
          )}
        </div>
      </div>
    )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Attendance" />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {/* Today's sessions */}
        <div>
          <SectionHeader title="Today — Sep 7, 2026" />
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-[14px] p-4"
              style={{
                background:
                  todayMorning?.status === "present" ? C.sageLt : C.card,
                border: `1px solid ${C.border}`,
              }}
            >
              <p className="text-xs font-semibold" style={{ color: C.muted }}>
                ☀️ Morning
              </p>
              <p className="font-bold text-sm mt-1" style={{ color: C.text }}>
                6:00–8:00 AM
              </p>
              {todayMorning?.status === "present" ? (
                <p className="text-xs mt-1" style={{ color: "#3D7055" }}>
                  ✅ {todayMorning.checkInTime}
                </p>
              ) : isMorningOpen ? (
                <button
                  onClick={() => setScreen("qr")}
                  className="text-xs font-semibold mt-2 px-2.5 py-1 rounded-full"
                  style={{ background: C.primary, color: "#fff" }}
                >
                  Scan QR
                </button>
              ) : (
                <p className="text-xs mt-1" style={{ color: C.muted }}>
                  Window closed
                </p>
              )}
            </div>
            <div
              className="rounded-[14px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs font-semibold" style={{ color: C.muted }}>
                🌙 Evening
              </p>
              <p className="font-bold text-sm mt-1" style={{ color: C.text }}>
                8:00–10:00 PM
              </p>
              {isEveningOpen ? (
                <button
                  onClick={() => setScreen("qr")}
                  className="text-xs font-semibold mt-2 px-2.5 py-1 rounded-full"
                  style={{ background: C.primary, color: "#fff" }}
                >
                  Scan QR
                </button>
              ) : (
                <p className="text-xs mt-1" style={{ color: C.muted }}>
                  Opens at 8:00 PM
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Present"
            value={present.length}
            bg={C.sageLt}
            textColor="#3D7055"
          />
          <StatCard
            label="Absent"
            value={absent.length}
            bg={C.dangerLt}
            textColor={C.danger}
          />
          <StatCard
            label="Streak 🔥"
            value={present.length}
            bg={C.primaryLt}
            textColor={C.primary}
          />
        </div>

        {/* Calendar */}
        <div
          className="rounded-[14px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p
            className="font-semibold text-sm text-center mb-4"
            style={{ color: C.text }}
          >
            September 2026
          </p>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-medium py-1"
                style={{ color: C.muted }}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1
              const isPresent = presentDays.includes(day)
              const isAbsent = absentDays.includes(day)
              const isToday = day === 7
              const isFuture = day > 7
              return (
                <div
                  key={day}
                  className="aspect-square rounded-full flex items-center justify-center text-xs font-medium"
                  style={{
                    background: isToday
                      ? C.primary
                      : isPresent
                        ? C.sageLt
                        : isAbsent
                          ? C.dangerLt
                          : "transparent",
                    color: isToday
                      ? "#fff"
                      : isPresent
                        ? "#3D7055"
                        : isAbsent
                          ? C.danger
                          : isFuture
                            ? "#C4BFB9"
                            : C.muted,
                    outline: isToday ? `2px solid ${C.primary}` : "none",
                    outlineOffset: isToday ? 2 : 0,
                  }}
                >
                  {day}
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            {[
              { bg: C.sageLt, tc: "#3D7055", l: "Present" },
              { bg: C.dangerLt, tc: C.danger, l: "Absent" },
              { bg: C.primary, tc: "#fff", l: "Today" },
            ].map((l) => (
              <div key={l.l} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: l.bg }}
                />
                <span className="text-xs" style={{ color: C.muted }}>
                  {l.l}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Absence warnings */}
        {absent.length >= 3 && (
          <div
            className="rounded-[14px] p-4"
            style={{ background: C.warnLt, border: `1px solid #F0DCA8` }}
          >
            <p className="font-semibold text-sm" style={{ color: C.warn }}>
              ⚠ Absence Threshold Reached
            </p>
            <p className="text-xs mt-1" style={{ color: C.warn }}>
              You have {absent.length} missed worship sessions. The guardian has
              been notified.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY
// ═══════════════════════════════════════════════════════════════════════════════

function BSecurity({
  boarder,
  announcements,
  setAnnouncements,
  maintenance,
  setMaintenance,
  curfew,
  setCurfew,
  showToast,
}: {
  boarder: typeof LOGGED_IN_BOARDER
  announcements: Announcement[]
  setAnnouncements: (a: Announcement[]) => void
  maintenance: MaintenanceReport[]
  setMaintenance: (m: MaintenanceReport[]) => void
  curfew: typeof INIT_CURFEW
  setCurfew: (c: typeof INIT_CURFEW) => void
  showToast: (m: string) => void
}) {
  const [screen, setScreen] = useState("overview")
  const [screenData, setScreenData] = useState<any>(null)
  const nav = (s: string, d?: any) => {
    setScreen(s)
    setScreenData(d ?? null)
  }

  if (screen === "ann-detail")
    return (
      <BAnn_Detail
        announcement={screenData}
        boarder={boarder}
        setAnnouncements={setAnnouncements}
        announcements={announcements}
        onBack={() => nav("overview")}
      />
    )
  if (screen === "maintenance")
    return (
      <B_Maintenance
        boarder={boarder}
        maintenance={maintenance}
        setMaintenance={setMaintenance}
        showToast={showToast}
        onBack={() => nav("overview")}
      />
    )
  if (screen === "curfew")
    return (
      <B_Curfew
        boarder={boarder}
        curfew={curfew}
        setCurfew={setCurfew}
        showToast={showToast}
        onBack={() => nav("overview")}
      />
    )
  if (screen === "emergency-contact")
    return (
      <B_EmergencyContact
        boarder={boarder}
        showToast={showToast}
        onBack={() => nav("overview")}
      />
    )

  const [sosModal, setSosModal] = useState(false)
  const myAnn = announcements.filter(
    (a) =>
      a.recipients === "all" ||
      (Array.isArray(a.recipients) && a.recipients.includes(boarder.id)),
  )
  const unread = myAnn.filter((a) => !a.readBy.includes(boarder.id)).length
  const myCurfew = curfew.find((c) => c.boarderId === boarder.id)
  const myMaint = maintenance.filter((m) => m.boarderId === boarder.id)
  const openMaint = myMaint.filter((m) => m.status !== "resolved")

  const triggerSOS = () => {
    setSosModal(false)
    showToast("🆘 SOS alert sent! Guardian has been notified.")
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ position: "relative" }}
    >
      <Header title="Security & Emergency" />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {/* SOS button */}
        <button
          onClick={() => setSosModal(true)}
          className="w-full rounded-[14px] p-5 flex items-center gap-4 active:scale-[0.98] transition-transform"
          style={{ background: C.dangerLt, border: `2px solid #F5C4C4` }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: C.danger }}
          >
            🆘
          </div>
          <div className="text-left">
            <p className="font-bold text-lg" style={{ color: C.danger }}>
              Emergency SOS
            </p>
            <p className="text-sm" style={{ color: C.danger }}>
              Tap to send instant alert to guardian
            </p>
          </div>
        </button>

        {/* Curfew status */}
        <div
          className="rounded-[14px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm" style={{ color: C.text }}>
                🌙 Curfew — 10:00 PM
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                Sep 7, 2026
              </p>
            </div>
            {myCurfew && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background:
                    myCurfew.status === "compliant"
                      ? C.sageLt
                      : myCurfew.status === "pending"
                        ? C.primaryLt
                        : C.dangerLt,
                  color:
                    myCurfew.status === "compliant"
                      ? "#3D7055"
                      : myCurfew.status === "pending"
                        ? C.primary
                        : C.danger,
                }}
              >
                {myCurfew.status === "compliant"
                  ? "✓ In"
                  : myCurfew.status === "pending"
                    ? "⏳ Pending"
                    : "⚠ Late"}
              </span>
            )}
          </div>
          {myCurfew?.checkedInAt && (
            <p className="text-xs mt-2" style={{ color: C.muted }}>
              Checked in at {myCurfew.checkedInAt}
            </p>
          )}
          {myCurfew?.status === "pending" && (
            <button
              onClick={() => nav("curfew")}
              className="mt-3 w-full py-2.5 rounded-[10px] font-semibold text-sm"
              style={{ background: C.primary, color: "#fff" }}
            >
              Check In Now
            </button>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-2.5">
          <RowItem
            icon="📞"
            label="Emergency Contact"
            sub={`${boarder.emergencyContact.name} · ${boarder.emergencyContact.relationship}`}
            onClick={() => nav("emergency-contact")}
          />
          <RowItem
            icon="📢"
            label="Announcements"
            sub={unread > 0 ? `${unread} unread` : "All read"}
            onClick={() => nav("ann-list")}
            right={
              unread > 0 ? (
                <span
                  className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ background: C.danger }}
                >
                  {unread}
                </span>
              ) : undefined
            }
          />
          <RowItem
            icon="🔧"
            label="Maintenance Reports"
            sub={
              openMaint.length > 0 ? `${openMaint.length} open` : "All resolved"
            }
            onClick={() => nav("maintenance")}
          />
        </div>

        {/* Announcements list */}
        {screen === "overview" && (
          <div>
            <SectionHeader title="Announcements" />
            <div className="space-y-2.5">
              {myAnn.map((a) => {
                const read = a.readBy.includes(boarder.id)
                const acked = a.acknowledgedBy.includes(boarder.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => nav("ann-detail", a)}
                    className="w-full rounded-[14px] p-4 text-left active:opacity-70"
                    style={{
                      background: C.card,
                      border: `1px solid ${
                        !read && a.priority === "critical"
                          ? "#F5C4C4"
                          : C.border
                      }`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {a.priority === "critical" ? "🔴" : "📢"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {!read && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: C.primary }}
                            />
                          )}
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.text }}
                          >
                            {a.title}
                          </p>
                        </div>
                        <p
                          className="text-xs line-clamp-2"
                          style={{ color: C.muted }}
                        >
                          {a.body}
                        </p>
                        <p
                          className="text-xs mt-1.5"
                          style={{ color: C.muted }}
                        >
                          {a.sentAt}
                        </p>
                      </div>
                      {a.priority === "critical" && !acked && read && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: C.warnLt, color: C.warn }}
                        >
                          Ack req.
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* SOS confirmation modal */}
      <Modal
        open={sosModal}
        onClose={() => setSosModal(false)}
        title="Send Emergency SOS?"
      >
        <div className="text-center py-2">
          <span className="text-6xl">🆘</span>
          <p className="mt-3 text-sm" style={{ color: C.muted }}>
            This will immediately alert{" "}
            <strong style={{ color: C.text }}>Ate Sandra</strong> of an
            emergency. Only use in genuine emergencies.
          </p>
        </div>
        <ActionPair
          onCancel={() => setSosModal(false)}
          onConfirm={triggerSOS}
          confirmLabel="Send SOS Alert"
          confirmDanger
        />
      </Modal>
    </div>
  )
}

function BAnn_Detail({
  announcement,
  boarder,
  announcements,
  setAnnouncements,
  onBack,
}: {
  announcement: Announcement
  boarder: typeof LOGGED_IN_BOARDER
  announcements: Announcement[]
  setAnnouncements: (a: Announcement[]) => void
  onBack: () => void
}) {
  const markRead = () => {
    if (!announcement.readBy.includes(boarder.id)) {
      setAnnouncements(
        announcements.map((a) =>
          a.id === announcement.id
            ? { ...a, readBy: [...a.readBy, boarder.id] }
            : a,
        ),
      )
    }
  }
  const acknowledge = () => {
    setAnnouncements(
      announcements.map((a) =>
        a.id === announcement.id
          ? {
              ...a,
              acknowledgedBy: [...a.acknowledgedBy, boarder.id],
              readBy: a.readBy.includes(boarder.id)
                ? a.readBy
                : [...a.readBy, boarder.id],
            }
          : a,
      ),
    )
  }

  // auto-mark as read
  useEffect(() => {
    markRead()
  }, [])

  const a = announcements.find((x) => x.id === announcement.id) ?? announcement
  const isRead = a.readBy.includes(boarder.id)
  const isAcked = a.acknowledgedBy.includes(boarder.id)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Announcement" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <div
          className="rounded-[14px] p-5 space-y-3"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {a.priority === "critical" ? "🔴" : "📢"}
            </span>
            {a.priority === "critical" && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: C.dangerLt, color: C.danger }}
              >
                Critical
              </span>
            )}
          </div>
          <p className="font-bold text-lg" style={{ color: C.text }}>
            {a.title}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: C.text }}>
            {a.body}
          </p>
          <p className="text-xs" style={{ color: C.muted }}>
            Posted by {a.sentBy} · {a.sentAt}
          </p>
          {isRead && (
            <span className="text-xs" style={{ color: "#3D7055" }}>
              ✓ Marked as read
            </span>
          )}
        </div>
        {a.priority === "critical" && !isAcked && (
          <button
            onClick={acknowledge}
            className="w-full py-4 rounded-[14px] text-white font-semibold"
            style={{ background: C.primary }}
          >
            ✓ Acknowledge
          </button>
        )}
        {a.priority === "critical" && isAcked && (
          <div
            className="rounded-[14px] p-4 text-center"
            style={{ background: C.sageLt }}
          >
            <p className="font-semibold text-sm" style={{ color: "#3D7055" }}>
              ✓ You have acknowledged this announcement
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function B_EmergencyContact({
  boarder,
  showToast,
  onBack,
}: {
  boarder: typeof LOGGED_IN_BOARDER
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: boarder.emergencyContact.name,
    relationship: boarder.emergencyContact.relationship,
    phone: boarder.emergencyContact.phone,
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Emergency Contact"
        onBack={onBack}
        right={
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs font-semibold"
            style={{ color: C.primary }}
          >
            {editing ? "Cancel" : "✏ Edit"}
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <div
          className="rounded-[14px] p-4"
          style={{ background: C.dangerLt, border: `1px solid #F5C4C4` }}
        >
          <p className="text-xs font-semibold" style={{ color: C.danger }}>
            ⚠ Emergency Contact Info
          </p>
          <p className="text-xs mt-1" style={{ color: C.danger }}>
            This person will be contacted in case of emergency. Keep it updated.
          </p>
        </div>
        {editing ? (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Input
              label="Relationship"
              value={form.relationship}
              onChange={(v) => setForm({ ...form, relationship: v })}
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <button
              onClick={() => {
                setEditing(false)
                showToast("Emergency contact updated")
              }}
              className="w-full py-4 rounded-[14px] text-white font-semibold"
              style={{ background: C.primary }}
            >
              Save Contact
            </button>
          </div>
        ) : (
          <div
            className="rounded-[14px] p-5 space-y-3"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto"
              style={{ background: C.dangerLt }}
            >
              👤
            </div>
            <p
              className="font-bold text-xl text-center"
              style={{ color: C.text }}
            >
              {form.name}
            </p>
            <p className="text-sm text-center" style={{ color: C.muted }}>
              {form.relationship}
            </p>
            <a
              href={`tel:${form.phone}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[12px] font-semibold text-sm text-white"
              style={{ background: C.sage }}
            >
              📞 {form.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function B_Maintenance({
  boarder,
  maintenance,
  setMaintenance,
  showToast,
  onBack,
}: {
  boarder: typeof LOGGED_IN_BOARDER
  maintenance: MaintenanceReport[]
  setMaintenance: (m: MaintenanceReport[]) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const [screen, setScreen] = useState<"list" | "new">("list")
  const [category, setCategory] =
    useState<MaintenanceReport["category"]>("plumbing")
  const [description, setDescription] = useState("")

  const myReports = maintenance.filter((m) => m.boarderId === boarder.id)

  const submit = () => {
    setMaintenance([
      ...maintenance,
      {
        id: "m" + Date.now(),
        boarderId: boarder.id,
        room: boarder.room,
        category,
        description,
        status: "open",
        submittedAt: "Sep 7, now",
      },
    ])
    showToast("Maintenance request submitted")
    setDescription("")
    setScreen("list")
  }

  const catEmoji: Record<string, string> = {
    plumbing: "🚿",
    electrical: "💡",
    furniture: "🛋️",
    appliance: "❄️",
    other: "🔧",
  }

  if (screen === "new")
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="New Request" onBack={() => setScreen("list")} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
          <Select
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as MaintenanceReport["category"])}
            options={Object.entries(catEmoji).map(([v, e]) => ({
              value: v,
              label: `${e} ${v.charAt(0).toUpperCase() + v.slice(1)}`,
            }))}
          />
          <Textarea
            label="Describe the issue"
            value={description}
            onChange={setDescription}
            placeholder="Describe what's broken or needs fixing..."
            rows={5}
          />
          <div
            className="rounded-[14px] p-4"
            style={{ background: C.warnLt, border: `1px solid #F0DCA8` }}
          >
            <p className="text-xs" style={{ color: C.warn }}>
              Room {boarder.room} · Photo attachment coming soon
            </p>
          </div>
          <button
            onClick={submit}
            disabled={!description.trim()}
            className="w-full py-4 rounded-[14px] text-white font-semibold disabled:opacity-40"
            style={{ background: C.primary }}
          >
            Submit Request
          </button>
        </div>
      </div>
    )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Maintenance"
        onBack={onBack}
        right={
          <button
            onClick={() => setScreen("new")}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: C.primaryLt, color: C.primary }}
          >
            + New
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        {myReports.map((m) => (
          <div
            key={m.id}
            className="rounded-[14px] p-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{catEmoji[m.category]}</span>
                <p className="font-semibold text-sm" style={{ color: C.text }}>
                  {m.category.charAt(0).toUpperCase() + m.category.slice(1)}
                </p>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background:
                    m.status === "open"
                      ? C.dangerLt
                      : m.status === "in_progress"
                        ? C.warnLt
                        : C.sageLt,
                  color:
                    m.status === "open"
                      ? C.danger
                      : m.status === "in_progress"
                        ? C.warn
                        : "#3D7055",
                }}
              >
                {m.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: C.muted }}>
              {m.description}
            </p>
            <p className="text-xs mt-1.5" style={{ color: C.muted }}>
              Submitted {m.submittedAt}
            </p>
            {m.resolvedAt && (
              <p className="text-xs" style={{ color: "#3D7055" }}>
                Resolved {m.resolvedAt}
              </p>
            )}
          </div>
        ))}
        {myReports.length === 0 && (
          <EmptyState
            icon="🔧"
            title="No reports yet"
            sub="Tap + New to report an issue"
          />
        )}
      </div>
    </div>
  )
}

function B_Curfew({
  boarder,
  curfew,
  setCurfew,
  showToast,
  onBack,
}: {
  boarder: typeof LOGGED_IN_BOARDER
  curfew: typeof INIT_CURFEW
  setCurfew: (c: typeof INIT_CURFEW) => void
  showToast: (m: string) => void
  onBack: () => void
}) {
  const my = curfew.find((c) => c.boarderId === boarder.id)
  const isIn = my?.status === "compliant"

  const checkIn = () => {
    setCurfew(
      curfew.map((c) =>
        c.boarderId === boarder.id
          ? { ...c, status: "compliant" as const, checkedInAt: "Just now" }
          : c,
      ),
    )
    showToast("✅ Curfew check-in recorded")
  }
  const checkOut = () => {
    setCurfew(
      curfew.map((c) =>
        c.boarderId === boarder.id
          ? { ...c, status: "pending" as const, checkedInAt: undefined }
          : c,
      ),
    )
    showToast("Checked out. Please be back by 10:00 PM.")
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Curfew Check-in" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <p className="text-6xl mb-3">{isIn ? "🏠" : "🌙"}</p>
          <p className="font-bold text-xl" style={{ color: C.text }}>
            {isIn ? "You are checked in" : "Curfew: 10:00 PM"}
          </p>
          <p className="text-sm mt-1" style={{ color: C.muted }}>
            Sep 7, 2026
            {my?.checkedInAt ? ` · Checked in: ${my.checkedInAt}` : ""}
          </p>
        </div>
        <div
          className="w-full rounded-[14px] p-4 text-center"
          style={{ background: isIn ? C.sageLt : C.warnLt }}
        >
          <p
            className="font-semibold"
            style={{ color: isIn ? "#3D7055" : C.warn }}
          >
            {isIn
              ? "You are inside and accounted for"
              : "Please check in before 10:00 PM"}
          </p>
        </div>
        {!isIn ? (
          <button
            onClick={checkIn}
            className="w-full py-5 rounded-[14px] text-white font-bold text-lg"
            style={{ background: C.sage }}
          >
            ✅ Check In Now
          </button>
        ) : (
          <button
            onClick={checkOut}
            className="w-full py-5 rounded-[14px] font-bold text-lg"
            style={{ background: C.dangerLt, color: C.danger }}
          >
            Going Out
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MORE
// ═══════════════════════════════════════════════════════════════════════════════

function BMore({
  boarder,
  onLogout,
  showToast,
}: {
  boarder: typeof LOGGED_IN_BOARDER
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
          <Avatar
            initials={boarder.initials}
            color={boarder.avatarColor}
            size={60}
          />
          <div>
            <p className="font-bold text-lg" style={{ color: C.text }}>
              {boarder.name}
            </p>
            <p className="text-sm" style={{ color: C.muted }}>
              Room {boarder.room} · {boarder.job}
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>
              {boarder.phone}
            </p>
          </div>
        </div>
        <div className="space-y-2.5">
          <RowItem
            icon="📋"
            label="House Rules"
            sub="View boarding house policies"
            onClick={() => showToast("Opening house rules…")}
          />
          <RowItem
            icon="📅"
            label="Leave Notice"
            sub="Notify guardian of absence"
            onClick={() => showToast("Opening leave notice…")}
          />
          <RowItem
            icon="🔔"
            label="Notifications"
            sub="Manage reminder preferences"
            onClick={() => showToast("Opening notifications…")}
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
