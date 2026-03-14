"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Activity,
    Server,
    Cpu,
    HardDrive,
    MemoryStick,
    Network,
    Clock,
    RefreshCw,
    AlertTriangle,
    MonitorPlay,
    ArrowDown,
    ArrowUp,
    Database,
    Gauge,
    Thermometer,
    Fan,
    ChevronDown,
    Check,
    Sun,
    Moon,
    Wifi,
    Terminal,
    Layers,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SERVERS } from "@/lib/servers";

// ─── Types ───────────────────────────────────────────────────────────────────
type GlancesData = {
    system?: { os_name: string; hostname: string; hr_name: string };
    uptime?: string;
    cpu?: { total: number; user: number; system: number; idle: number; iowait: number; steal: number };
    load?: { min1: number; min5: number; min15: number; cpucore: number };
    mem?: { total: number; used: number; free: number; percent: number; active: number; cached: number; buffers: number };
    memswap?: { total: number; used: number; free: number; percent: number };
    network?: Array<{
        interface_name: string;
        bytes_recv: number; bytes_sent: number;
        bytes_recv_rate_per_sec: number; bytes_sent_rate_per_sec: number;
        bytes_recv_gauge: number; bytes_sent_gauge: number; speed: number;
    }>;
    diskio?: Array<{
        disk_name: string;
        read_bytes: number; write_bytes: number;
        read_bytes_rate_per_sec: number; write_bytes_rate_per_sec: number;
        read_bytes_gauge: number; write_bytes_gauge: number;
    }>;
    fs?: Array<{
        device_name: string; fs_type: string; mnt_point: string;
        size: number; used: number; free: number; percent: number;
    }>;
    gpu?: Array<{
        key: string; gpu_id: string; name: string;
        mem: number | null; proc: number; temperature: number | null; fan_speed: number | null;
    }>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number, decimals = 1): string {
    if (!bytes || bytes === 0 || isNaN(bytes)) return "0 B";
    if (bytes < 0) bytes = Math.abs(bytes);
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i < 0 || i >= sizes.length) return "0 B";
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

function formatRate(bps: number): string {
    return !bps || isNaN(bps) ? "0 B/s" : formatBytes(bps, 1) + "/s";
}

function pct(n = 0): string { return n.toFixed(1) + "%"; }

function statusRing(p: number) {
    if (p >= 90) return { bar: "bg-red-500", text: "text-red-400", ring: "ring-red-500/30", label: "Critical", dot: "bg-red-500" };
    if (p >= 75) return { bar: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/30", label: "Warning", dot: "bg-amber-500" };
    return { bar: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30", label: "Healthy", dot: "bg-emerald-500" };
}

// ─── Radial Gauge ────────────────────────────────────────────────────────────
function RadialGauge({ value, size = 80, stroke = 7 }: { value: number; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (Math.min(value, 100) / 100) * circ;
    const c = statusRing(value);
    const color = value >= 90 ? "#ef4444" : value >= 75 ? "#f59e0b" : "#10b981";
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted/40" />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
                stroke={color} strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
                className={`rotate-90 fill-current ${c.text}`}
                style={{ transform: `rotate(90deg) translate(0, -${size / 2}px) translate(${size / 2}px, 0)`, fontSize: size * 0.18, fontWeight: 700, fontFamily: "inherit" }}>
            </text>
        </svg>
    );
}

// ─── Stat Gauge Card ─────────────────────────────────────────────────────────
function GaugeCard({ label, value, sub, icon: Icon, color }: {
    label: string; value: number; sub: string;
    icon: React.ElementType; color: string;
}) {
    const s = statusRing(value);
    const r = 34, stroke = 7, size = 88;
    const circ = 2 * Math.PI * r;
    const dash = (Math.min(value, 100) / 100) * circ;
    const strokeColor = value >= 90 ? "#ef4444" : value >= 75 ? "#f59e0b" : "#10b981";

    return (
        <div className={`relative rounded-xl border border-white/5 bg-card/60 p-4 ring-1 ${s.ring} shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                    <p className={`text-2xl font-bold tabular-nums mt-0.5 ${s.text}`}>{pct(value)}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
            {/* Radial */}
            <div className="flex items-center gap-3">
                <svg width={size} height={size} className="rotate-[-90deg] shrink-0">
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted/30" />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
                        stroke={strokeColor} strokeLinecap="round"
                        strokeDasharray={`${dash} ${circ}`}
                        style={{ transition: "stroke-dasharray 0.6s ease" }}
                    />
                </svg>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground leading-relaxed truncate">{sub}</p>
                    <span className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${value >= 90 ? "bg-red-500/10 text-red-400" :
                            value >= 75 ? "bg-amber-500/10 text-amber-400" :
                                "bg-emerald-500/10 text-emerald-400"
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            </div>
            {badge && <span className="rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{badge}</span>}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [data, setData] = useState<GlancesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [selectedServer, setSelectedServer] = useState(SERVERS[0].id);
    const [serverMenuOpen, setServerMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const currentServer = SERVERS.find((s) => s.id === selectedServer) ?? SERVERS[0];

    useEffect(() => {
        const saved = localStorage.getItem("divloo-dark-mode");
        if (saved !== null) setDarkMode(saved === "true");
    }, []);

    useEffect(() => {
        localStorage.setItem("divloo-dark-mode", String(darkMode));
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const fetchMetrics = useCallback(async () => {
        try {
            const res = await fetch(`/api/glances?server=${selectedServer}`);
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                setError(body?.error || `Server returned ${res.status}`);
                setLoading(false);
                return;
            }
            const json = await res.json();
            setData(json);
            setError(null);
            setLastUpdated(new Date());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load metrics");
        } finally {
            setLoading(false);
        }
    }, [selectedServer]);

    useEffect(() => {
        setLoading(true);
        setData(null);
        fetchMetrics();
        const id = setInterval(fetchMetrics, 5000);
        return () => clearInterval(id);
    }, [fetchMetrics]);

    // aggregates
    const nets = (data?.network ?? []).filter(n => n.interface_name !== "lo");
    const rxRate = nets.reduce((a, n) => a + (n.bytes_recv_rate_per_sec || 0), 0);
    const txRate = nets.reduce((a, n) => a + (n.bytes_sent_rate_per_sec || 0), 0);
    const disks = (data?.diskio ?? []).filter(d =>
        !["loop", "ram", "zram", "nbd"].some(p => d.disk_name.startsWith(p))
    );
    const fsList = (data?.fs ?? []).filter(f =>
        !["/dev", "/sys", "/run/credentials"].some(p => f.mnt_point.startsWith(p))
    );
    const cpu = data?.cpu?.total ?? 0;
    const mem = data?.mem?.percent ?? 0;
    const gpu = data?.gpu?.[0];

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading && !data) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-14 w-14">
                    <div className="absolute inset-0 rounded-full border-4 border-muted" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                </div>
                <p className="animate-pulse text-sm text-muted-foreground">Connecting to {currentServer.name}…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* ── Sidebar + Content layout ─────────────────────────────────── */}
            <div className="flex min-h-screen">

                {/* ── Sidebar ─────────────────────────────────────────────── */}
                <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col border-r border-white/5 bg-card/40 backdrop-blur-sm">
                    {/* Logo */}
                    <div className="flex h-14 items-center gap-2.5 border-b border-white/5 px-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/40">
                            <Server className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">Divloo Monitor</span>
                    </div>

                    {/* Server list */}
                    <div className="px-3 pt-4 pb-2">
                        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Servers</p>
                        <nav className="space-y-0.5">
                            {SERVERS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedServer(s.id)}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all ${selectedServer === s.id
                                            ? "bg-emerald-500/10 text-emerald-400 font-medium"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        }`}
                                >
                                    <span className={`h-2 w-2 rounded-full transition-colors ${selectedServer === s.id ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-muted-foreground/30"
                                        }`} />
                                    <span className="truncate">{s.name}</span>
                                    {selectedServer === s.id && <Check className="ml-auto h-3 w-3 text-emerald-500 shrink-0" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Sidebar bottom */}
                    <div className="mt-auto border-t border-white/5 p-3 space-y-0.5">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
                        >
                            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                            {darkMode ? "Light Mode" : "Dark Mode"}
                        </button>
                    </div>
                </aside>

                {/* ── Main Panel ──────────────────────────────────────────── */}
                <div className="flex flex-1 flex-col min-w-0">

                    {/* ── Top Bar ─────────────────────────────────────────── */}
                    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-lg px-4 md:px-6">
                        {/* Mobile: logo + server selector */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600">
                                <Server className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-bold text-sm tracking-tight sm:hidden">Monitor</span>
                            <span className="hidden font-bold text-sm tracking-tight sm:inline">Divloo Monitor</span>
                        </div>

                        {/* Mobile server selector */}
                        <div className="relative lg:hidden">
                            <button
                                onClick={() => setServerMenuOpen(!serverMenuOpen)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-card/60 px-3 text-sm font-medium transition-all hover:bg-white/5"
                            >
                                <span className={`h-2 w-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                                <span className="max-w-[100px] truncate">{currentServer.name}</span>
                                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${serverMenuOpen ? "rotate-180" : ""}`} />
                            </button>
                            {serverMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setServerMenuOpen(false)} />
                                    <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-white/10 bg-popover/95 p-1.5 shadow-xl backdrop-blur-xl">
                                        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Servers</div>
                                        {SERVERS.map(s => (
                                            <button key={s.id} onClick={() => { setSelectedServer(s.id); setServerMenuOpen(false); }}
                                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all ${selectedServer === s.id ? "bg-emerald-500/10 text-emerald-400 font-medium" : "hover:bg-white/5 text-foreground"}`}>
                                                <span className={`h-2 w-2 rounded-full ${selectedServer === s.id ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                                                <span className="flex-1 text-left">{s.name}</span>
                                                {selectedServer === s.id && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Desktop: server name breadcrumb */}
                        <div className="hidden lg:flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Servers</span>
                            <span className="text-muted-foreground/40">/</span>
                            <span className="font-semibold flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                                {currentServer.name}
                            </span>
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-2">
                            <span className="hidden text-xs text-muted-foreground md:flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {lastUpdated.toLocaleTimeString()}
                            </span>
                            <button onClick={fetchMetrics}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground active:scale-95">
                                <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDarkMode(!darkMode)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground active:scale-95">
                                {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </header>

                    {/* ── Page Content ─────────────────────────────────────── */}
                    <main className="flex-1 overflow-x-hidden">
                        {/* ─ Server hero banner ─────────────────────────── */}
                        <div className="border-b border-white/5 bg-gradient-to-r from-emerald-950/30 via-background to-background px-4 py-5 md:px-6">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-emerald-500/30">
                                        <Terminal className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold tracking-tight leading-tight">
                                            {data?.system?.hostname || currentServer.name}
                                        </h1>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {data?.system?.hr_name || "—"} &nbsp;·&nbsp; {data?.system?.os_name || "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {error ? "Offline" : "Online"}
                                    </span>
                                    <span className="rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-white/5">
                                        ↑ {data?.uptime || "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-5 md:px-6 space-y-6">
                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 ring-1 ring-red-500/10">
                                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                                    <p className="text-sm"><span className="font-semibold text-red-400">Error: </span><span className="text-muted-foreground">{error}</span></p>
                                </div>
                            )}

                            {/* ─ Primary Gauges ──────────────────────────── */}
                            <section>
                                <SectionHeader icon={Activity} title="Resource Usage" />
                                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    <GaugeCard
                                        label="CPU" value={cpu}
                                        sub={`User ${pct(data?.cpu?.user)} · Sys ${pct(data?.cpu?.system)}`}
                                        icon={Cpu} color="bg-gradient-to-br from-sky-500 to-blue-600"
                                    />
                                    <GaugeCard
                                        label="Memory" value={mem}
                                        sub={`${formatBytes(data?.mem?.used || 0)} / ${formatBytes(data?.mem?.total || 0)}`}
                                        icon={MemoryStick} color="bg-gradient-to-br from-violet-500 to-purple-600"
                                    />
                                    <div className="relative rounded-xl border border-white/5 bg-card/60 p-4 ring-1 ring-white/5 shadow-sm">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Load Avg</p>
                                        <p className="text-2xl font-bold tabular-nums text-orange-400 mt-0.5">{(data?.load?.min1 ?? 0).toFixed(2)}</p>
                                        <div className="mt-3 grid grid-cols-3 gap-1">
                                            {[
                                                { l: "5m", v: data?.load?.min5 },
                                                { l: "15m", v: data?.load?.min15 },
                                                { l: "vCPU", v: data?.load?.cpucore },
                                            ].map(item => (
                                                <div key={item.l} className="rounded-md bg-muted/40 py-1.5 text-center">
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.l}</p>
                                                    <p className="text-xs font-bold tabular-nums mt-0.5">
                                                        {item.l === "vCPU" ? (item.v ?? 0) : (item.v ?? 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
                                            <Activity className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    {/* Swap or Network card */}
                                    {data?.memswap && data.memswap.total > 0 ? (
                                        <GaugeCard
                                            label="Swap" value={data.memswap.percent}
                                            sub={`${formatBytes(data.memswap.used)} / ${formatBytes(data.memswap.total)}`}
                                            icon={Database} color="bg-gradient-to-br from-cyan-500 to-teal-600"
                                        />
                                    ) : (
                                        <div className="relative rounded-xl border border-white/5 bg-card/60 p-4 ring-1 ring-white/5 shadow-sm">
                                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Network I/O</p>
                                            <div className="mt-3 space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ArrowDown className="h-3.5 w-3.5 text-emerald-400" />Down</span>
                                                    <span className="font-mono text-xs font-semibold text-emerald-400">{formatRate(rxRate)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ArrowUp className="h-3.5 w-3.5 text-blue-400" />Up</span>
                                                    <span className="font-mono text-xs font-semibold text-blue-400">{formatRate(txRate)}</span>
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                                                <Network className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* ─ GPU ─────────────────────────────────────── */}
                            {gpu && (
                                <section>
                                    <SectionHeader icon={MonitorPlay} title="GPU" badge={gpu.name} />
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[
                                            { l: "Utilization", v: `${gpu.proc}%`, accent: "text-purple-400" },
                                            { l: "VRAM", v: gpu.mem !== null ? `${gpu.mem}%` : "N/A", accent: "text-violet-400" },
                                            { l: "Temperature", v: gpu.temperature !== null ? `${gpu.temperature}°C` : "N/A", accent: "text-rose-400" },
                                            { l: "Fan Speed", v: gpu.fan_speed !== null ? `${gpu.fan_speed}%` : "N/A", accent: "text-indigo-400" },
                                        ].map(item => (
                                            <div key={item.l} className="rounded-xl border border-white/5 bg-card/60 p-4 ring-1 ring-white/5">
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{item.l}</p>
                                                <p className={`text-xl font-bold tabular-nums mt-1 ${item.accent}`}>{item.v}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ─ Network + Disk side by side ─────────────── */}
                            <section className="grid gap-4 grid-cols-1 xl:grid-cols-2">
                                {/* Network interfaces */}
                                <div>
                                    <SectionHeader icon={Wifi} title="Network Interfaces" badge={`${nets.length} active`} />
                                    <div className="rounded-xl border border-white/5 bg-card/60 overflow-hidden ring-1 ring-white/5 shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/5 bg-muted/20">
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Interface</th>
                                                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">↓ Down</th>
                                                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">↑ Up</th>
                                                        <th className="hidden px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:table-cell">Rx Total</th>
                                                        <th className="hidden px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:table-cell">Tx Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {nets.length === 0 ? (
                                                        <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No interfaces detected</td></tr>
                                                    ) : nets.map((n, i) => (
                                                        <tr key={n.interface_name} className={`border-b border-white/5 transition-colors hover:bg-white/2 ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                                                            <td className="px-4 py-2.5 font-medium text-xs">{n.interface_name}</td>
                                                            <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-400">{formatRate(n.bytes_recv_rate_per_sec)}</td>
                                                            <td className="px-4 py-2.5 text-right font-mono text-xs text-blue-400">{formatRate(n.bytes_sent_rate_per_sec)}</td>
                                                            <td className="hidden px-4 py-2.5 text-right font-mono text-xs text-muted-foreground sm:table-cell">{formatBytes(n.bytes_recv_gauge)}</td>
                                                            <td className="hidden px-4 py-2.5 text-right font-mono text-xs text-muted-foreground sm:table-cell">{formatBytes(n.bytes_sent_gauge)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Disk I/O */}
                                <div>
                                    <SectionHeader icon={HardDrive} title="Disk I/O" badge={`${disks.length} device${disks.length !== 1 ? "s" : ""}`} />
                                    <div className="rounded-xl border border-white/5 bg-card/60 overflow-hidden ring-1 ring-white/5 shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/5 bg-muted/20">
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Device</th>
                                                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Read/s</th>
                                                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Write/s</th>
                                                        <th className="hidden px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:table-cell">Read Total</th>
                                                        <th className="hidden px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:table-cell">Write Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {disks.length === 0 ? (
                                                        <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No disk devices detected</td></tr>
                                                    ) : disks.slice(0, 8).map((d, i) => (
                                                        <tr key={d.disk_name} className={`border-b border-white/5 transition-colors hover:bg-white/2 ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                                                            <td className="px-4 py-2.5 font-medium text-xs">{d.disk_name}</td>
                                                            <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-400">{formatRate(d.read_bytes_rate_per_sec)}</td>
                                                            <td className="px-4 py-2.5 text-right font-mono text-xs text-amber-400">{formatRate(d.write_bytes_rate_per_sec)}</td>
                                                            <td className="hidden px-4 py-2.5 text-right font-mono text-xs text-muted-foreground sm:table-cell">{formatBytes(d.read_bytes_gauge)}</td>
                                                            <td className="hidden px-4 py-2.5 text-right font-mono text-xs text-muted-foreground sm:table-cell">{formatBytes(d.write_bytes_gauge)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ─ Filesystem ──────────────────────────────── */}
                            {fsList.length > 0 && (
                                <section>
                                    <SectionHeader icon={Layers} title="Filesystems" badge={`${fsList.length} mount${fsList.length !== 1 ? "s" : ""}`} />
                                    <div className="rounded-xl border border-white/5 bg-card/60 ring-1 ring-white/5 shadow-sm divide-y divide-white/5">
                                        {fsList.map(fs => {
                                            const s = statusRing(fs.percent);
                                            return (
                                                <div key={fs.mnt_point} className="px-4 py-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="font-medium text-sm truncate">{fs.mnt_point}</span>
                                                            <span className="shrink-0 rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground ring-1 ring-white/5">{fs.fs_type}</span>
                                                        </div>
                                                        <span className={`font-mono text-sm font-bold tabular-nums ${s.text}`}>{pct(fs.percent)}</span>
                                                    </div>
                                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                                                            style={{ width: `${Math.min(fs.percent, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                                                        <span>{formatBytes(fs.used)} used</span>
                                                        <span>{formatBytes(fs.free)} free / {formatBytes(fs.size)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            <p className="text-center text-[10px] text-muted-foreground/40 pb-2">
                                Divloo Monitor · Powered by Glances · Auto-refresh every 5s
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
