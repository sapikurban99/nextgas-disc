"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

// ============================================================
// Startup Role Quiz – Diubah jadi Next.js TSX Page
// Tanpa Supabase, dialihkan ke Google Apps Script Backend
// ============================================================

const ATTR_LINKEDIN = "https://www.linkedin.com/in/muhammad-alhadiansyah-santoso/";
const ATTR_PIJAR = "https://pijarteknologi.id/";

// === Archetypes ===============================================
const TYPES = [
    {
        id: "analyst",
        name: "Analyst",
        emoji: "📊",
        blurb: "Kamu senang pakai data untuk ngarahin keputusan. Rapi, teliti, dan suka ngulik sampai ketemu insight.",
        roles: ["Data/BI Analyst", "Product Analyst", "Researcher"],
        skills: ["SQL", "Python/Excel", "A/B test", "Critical thinking"],
    },
    {
        id: "creator",
        name: "Creator",
        emoji: "🎨",
        blurb: "Kamu hidup di ide dan eksekusi visual/cerita. Peka sama user experience dan suka bikin hal jadi mudah dipahami.",
        roles: ["UI/UX", "Content/Brand", "Visual Designer"],
        skills: ["Figma", "Copywriting", "User research", "Prototyping"],
    },
    {
        id: "connector",
        name: "Connector",
        emoji: "🤝",
        blurb: "Kamu kuat di komunikasi & hubungan. Jago gali kebutuhan dan nyambungin solusi ke orang yang tepat.",
        roles: ["Account Manager", "Sales/BD", "Customer Success"],
        skills: ["Active listening", "Negosiasi", "CRM", "Presentasi"],
    },
    {
        id: "driver",
        name: "Driver",
        emoji: "🚀",
        blurb: "Kamu gercep, senang target, dan nyaman ambil keputusan. Cocok ngarahin prioritas dan nyatuin tim lintas fungsi.",
        roles: ["Product Manager", "BizOps", "Founder-type"],
        skills: ["Prioritization", "Strategy", "Stakeholder mgmt", "OKR"],
    },
    {
        id: "maker",
        name: "Maker",
        emoji: "🛠️",
        blurb: "Kamu tangan dingin: senang bikin, otak-atik, dan ningkatin kualitas hasil.",
        roles: ["Engineer", "Ops/QA", "DevOps/Infra"],
        skills: ["Scripting", "Automation", "Debugging", "Systems thinking"],
    },
    {
        id: "organizer",
        name: "Organizer",
        emoji: "🧭",
        blurb: "Kamu bikin kerjaan jadi tertata. Proses rapi, risiko terkendali, dan ritme tim jalan.",
        roles: ["Project/Program Mgmt", "Finance/People Ops", "PMO"],
        skills: ["Planning", "Documentation", "Risk mgmt", "Process design"],
    },
];

// === Questions (18) ===========================================
const QUESTIONS = [
    { id: "q1", text: "Aku suka membuktikan pendapat dengan data/angka.", typeId: "analyst" },
    { id: "q7", text: "Baca tren dan bikin dashboard itu seru buatku.", typeId: "analyst" },
    { id: "q13", text: "Detail & ketelitian itu nyaman buatku.", typeId: "analyst" },

    { id: "q2", text: "Aku menikmati merancang tampilan/cerita agar gampang dipahami.", typeId: "creator" },
    { id: "q8", text: "Brainstorm ide baru bikin aku semangat.", typeId: "creator" },
    { id: "q14", text: "Aku sering mikir UX duluan sebelum fitur.", typeId: "creator" },

    { id: "q3", text: "Ketemu orang & gali kebutuhan mereka itu energizing.", typeId: "connector" },
    { id: "q9", text: "Bangun relasi & negosiasi termasuk kekuatanku.", typeId: "connector" },
    { id: "q15", text: "Aku bisa jelasin hal rumit jadi simpel.", typeId: "connector" },

    { id: "q4", text: "Suka set target, bikin prioritas, dan ngegerakin tim.", typeId: "driver" },
    { id: "q10", text: "Nyaman ambil keputusan meski info belum lengkap.", typeId: "driver" },
    { id: "q16", text: "Sering mulai inisiatif baru tanpa disuruh.", typeId: "driver" },

    { id: "q5", text: "Suka bikin sesuatu dari nol & memperbaikinya.", typeId: "maker" },
    { id: "q11", text: "Eksperimen teknis/hands-on bikin lupa waktu.", typeId: "maker" },
    { id: "q17", text: "Fokus ke performa dan kualitas hasil.", typeId: "maker" },

    { id: "q6", text: "Bikin to‑do, timeline, dan dokumentasi itu satisfying.", typeId: "organizer" },
    { id: "q12", text: "Kelola risiko, dependensi, dan proses itu klik buatku.", typeId: "organizer" },
    { id: "q18", text: "Suka bikin sistem kerja biar tim makin efisien.", typeId: "organizer" },
];

const STORAGE_KEY = "startup-role-quiz-state-v1";
const LIKERT = [
    { value: 1, label: "Sangat Tidak Setuju" },
    { value: 2, label: "Tidak Setuju" },
    { value: 3, label: "Netral" },
    { value: 4, label: "Setuju" },
    { value: 5, label: "Sangat Setuju" },
];

function emptyScore() {
    return { analyst: 0, creator: 0, connector: 0, driver: 0, maker: 0, organizer: 0 };
}

function computeScores(ans: Record<string, number>) {
    const score = emptyScore();
    for (const q of QUESTIONS) {
        const val = ans[q.id];
        if (!val) continue;
        score[q.typeId as keyof typeof score] += val;
    }
    return score;
}

function toPercentages(score: Record<string, number>) {
    const perTypeMax = 5 * 3;
    const out: Record<string, number> = {};
    Object.keys(score).forEach((k) => {
        out[k] = Math.round((score[k] / perTypeMax) * 100);
    });
    return out;
}

function topTypes(score: Record<string, number>, n = 2) {
    return Object.entries(score).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function usePersistedState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') return initial;
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : initial;
        } catch {
            return initial;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch { }
    }, [key, state]);

    return [state, setState];
}

function ProgressBar({ value }: { value: number }) {
    const pct = Math.max(0, Math.min(100, value));
    return (
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all ease-out duration-300" style={{ width: `${pct}%` }} />
        </div>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            {children}
        </span>
    );
}

// === PNG Card (Canvas) ========================================
async function drawResultCardPNG({ typeMeta, pct }: { typeMeta: any, pct: Record<string, number> }) {
    const W = 1200, H = 630;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#f8fafc"); // slate-50
    grad.addColorStop(1, "#e2e8f0"); // slate-200
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    // Header Card
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.05)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.roundRect(40, 40, W - 80, H - 80, 24);
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Branding / Title
    ctx.fillStyle = "#4f46e5"; // indigo-600
    ctx.font = "bold 28px Inter, system-ui, sans-serif";
    ctx.fillText("CareerAI by PijarTeknologi", 80, 100);

    // Type title
    ctx.fillStyle = "#0f172a"; // slate-900
    ctx.font = "bold 64px Inter, system-ui, sans-serif";
    ctx.fillText(`${typeMeta.emoji} ${typeMeta.name} Profile`, 80, 180);

    // Blurb
    ctx.fillStyle = "#475569"; // slate-600
    ctx.font = "32px Inter, system-ui, sans-serif";
    wrapText(ctx, typeMeta.blurb, 80, 240, 1000, 44);

    // Bars
    const entries = Object.entries(pct);
    let y = 380;
    ctx.font = "bold 24px Inter, system-ui, sans-serif";

    // Sort bars by percentage descending for image
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

    for (let i = 0; i < sortedEntries.length; i++) {
        const [id, v] = sortedEntries[i];
        if (i >= 4) break; // Only show top 4 on card to save space

        const label = TYPES.find((t) => t.id === id)?.name || id;
        ctx.fillStyle = "#334155";
        ctx.fillText(`${label}`, 80, y);

        // Track bg
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.roundRect(280, y - 20, 700, 20, 10);
        ctx.fill();

        // Track fill
        ctx.fillStyle = id === typeMeta.id ? "#4f46e5" : "#94a3b8";
        ctx.beginPath();
        ctx.roundRect(280, y - 20, Math.max(20, Math.round(7 * v)), 20, 10);
        ctx.fill();

        // PCT
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 22px Inter";
        ctx.fillText(`${v}%`, 1000, y - 2);

        ctx.font = "bold 24px Inter";

        y += 44;
    }

    return new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png", 0.95));
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const { width } = ctx.measureText(testLine);
        if (width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

// === Result View ===============================================
function ResultView({ score, onRetake }: { score: Record<string, number>, onRetake: () => void }) {
    const pct = toPercentages(score);
    const tops = topTypes(score, 2);
    const [topId] = tops[0];
    const topMeta = TYPES.find((t) => t.id === topId) || TYPES[0];

    const [email, setEmail] = useState("");
    const [emailOk, setEmailOk] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [postErr, setPostErr] = useState<string | null>(null);
    const [imgURL, setImgURL] = useState<string | null>(null);
    const imgBlobRef = useRef<Blob | null>(null);

    const summary = useMemo(() => {
        return [
            `${topMeta.emoji} Karier idealmu: ${topMeta.name}`,
            topMeta.blurb,
            `Peran yang cocok: ${topMeta.roles.join(", ")}`,
            `Fokus skill: ${topMeta.skills.join(", ")}`,
        ].join("\n");
    }, [topMeta]);

    const validateEmail = (e: string) => {
        const at = e.indexOf("@");
        const dot = e.lastIndexOf(".");
        return at > 0 && dot > at + 1 && dot < e.length - 1;
    };

    async function submitEmailThenGenerate() {
        setPostErr(null);
        if (!validateEmail(email)) { setPostErr("Format email tidak valid."); return; }
        setIsPosting(true);
        try {
            // Save to GAS (Replacement for Supabase)
            if (process.env.NEXT_PUBLIC_GAS_URL) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_GAS_URL}?action=saveLead`, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email,
                            type: `QUIZ_${topMeta.id.toUpperCase()}`,
                            score_json: score,
                            name: "Quiz Participant",
                            linkedin: "-"
                        }),
                    });
                } catch (gasErr) {
                    console.error("Gagal menyimpan ke GAS:", gasErr);
                }
            }

            // Generate Image
            setEmailOk(true);
            const blob = await drawResultCardPNG({ typeMeta: topMeta, pct });
            imgBlobRef.current = blob;
            if (blob) {
                const url = URL.createObjectURL(blob);
                setImgURL(url);
            }
        } catch (err: any) {
            setPostErr(err?.message || "Terjadi kesalahan saat memproses gambar.");
        } finally {
            setIsPosting(false);
        }
    }

    const downloadPNG = () => {
        if (!imgBlobRef.current) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(imgBlobRef.current);
        a.download = `career-quiz-${topMeta.id}.png`;
        a.click();
    };

    return (
        <div className="mx-auto max-w-2xl animate-in slide-in-from-bottom-8 fade-in duration-500">
            {/* Main Result Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center relative overflow-hidden mb-8">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
                    {topMeta.emoji}
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Kamu adalah: {topMeta.name}</h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-lg mx-auto">{topMeta.blurb}</p>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Peran Cocok</span>
                        <span className="text-slate-700 font-medium">{topMeta.roles.join(" • ")}</span>
                    </div>
                </div>

                {/* Bars */}
                <div className="text-left bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 space-y-4">
                    <h3 className="font-bold text-slate-700 border-b border-slate-200 pb-3 mb-5">Komposisi Kepribadianmu</h3>
                    {TYPES.sort((a, b) => pct[b.id] - pct[a.id]).map((t) => (
                        <div key={t.id} className="relative">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                    <span>{t.emoji}</span> {t.name}
                                </span>
                                <span className={`text-sm font-bold ${t.id === topMeta.id ? 'text-indigo-600' : 'text-slate-500'}`}>{pct[t.id]}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-2 rounded-full ${t.id === topMeta.id ? 'bg-indigo-600' : 'bg-slate-400'}`} style={{ width: `${pct[t.id]}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => {
                        navigator.clipboard.writeText(summary);
                        alert("Ringkasan berhasil disalin!");
                    }} className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                        Copy Ringkasan
                    </button>
                    <button onClick={onRetake} className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                        Ulangi Kuis
                    </button>
                </div>
            </div>

            {/* Email gate + generate image */}
            <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-3">Dapatkan Kartu Hasil (PNG) 📸</h3>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                    Masukkan email untuk mengunduh gambar hasil kuis personalmu. Bisa langsung dibagikan ke sosmed biar makin keren!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-indigo-700/50 border border-indigo-400 text-white placeholder:text-indigo-300 rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-400/50"
                    />
                    <button
                        onClick={submitEmailThenGenerate}
                        disabled={isPosting}
                        className="px-6 py-3.5 rounded-xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 disabled:opacity-70 transition-colors shrink-0 flex items-center justify-center min-w-[140px]"
                    >
                        {isPosting ? <><Loader2 className="w-5 h-5 animate-spin" /> Bikin Gambar...</> : "Buat Kartu PNG"}
                    </button>
                </div>

                {postErr && (
                    <p className="text-rose-200 text-sm mt-3 font-medium bg-rose-900/30 p-3 rounded-lg border border-rose-500/30 line-clamp-2">{postErr}</p>
                )}

                {imgURL && emailOk && (
                    <div className="mt-8 bg-white/10 p-2 rounded-2xl border border-white/20 animate-in fade-in zoom-in-95">
                        <img src={imgURL} alt="Kartu hasil" className="w-full rounded-xl border border-indigo-300" />
                        <button
                            onClick={downloadPNG}
                            className="w-full mt-4 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-inner border border-indigo-400"
                        >
                            ⬇️ Download Gambar Sekarang
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// === Quiz View ================================================
function QuizView({ answers, setAnswers, onFinish }: { answers: Record<string, number>, setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>, onFinish: () => void }) {
    const [idx, setIdx] = useState(0);
    const q = QUESTIONS[idx];
    const total = QUESTIONS.length;
    const currentVal = answers[q.id] ?? 0;
    const answeredCount = Object.keys(answers).length;
    const progress = Math.round((answeredCount / total) * 100);

    const setAnswer = (val: number) => {
        setAnswers((prev) => ({ ...prev, [q.id]: val }));

        // Auto advance on answer Selection to make UX faster
        setTimeout(() => {
            if (idx < total - 1) setIdx((i) => i + 1);
            else onFinish();
        }, 300);
    };

    const prev = () => setIdx((i) => Math.max(0, i - 1));

    return (
        <div className="mx-auto max-w-2xl w-full">
            <div className="mb-8">
                <ProgressBar value={progress} />
                <div className="flex items-center justify-between mt-3 text-sm text-slate-500 font-medium px-1">
                    <span>Pertanyaan {idx + 1} / {total}</span>
                    <span>{progress}% Selesai</span>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-slate-50 rounded-full z-0 pointer-events-none"></div>

                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug mb-10 relative z-10 min-h-[80px]">
                    "{q.text}"
                </h2>

                <div className="grid grid-cols-1 gap-3 relative z-10">
                    {LIKERT.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setAnswer(opt.value)}
                            className={`p-4 rounded-2xl font-bold text-left transition-all border-2 flex items-center justify-between ${currentVal === opt.value
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                                }`}
                        >
                            <span>{opt.label}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${currentVal === opt.value ? 'border-indigo-500' : 'border-slate-300'}`}>
                                {currentVal === opt.value && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-10 relative z-10">
                    <button onClick={prev} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-0 transition-all" disabled={idx === 0}>
                        ← Kembali
                    </button>
                    <button onClick={() => { if (idx < total - 1) setIdx(i => i + 1); else onFinish() }} className={`px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all ${!currentVal ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        {idx === total - 1 ? "Lihat Hasil Jawaban" : "Lewati & Lanjut"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// === Root Page ==================================================
export default function CareerQuizPage() {
    const [isClient, setIsClient] = useState(false);
    const [answers, setAnswers] = usePersistedState<Record<string, number>>(STORAGE_KEY, {});
    const [showResult, setShowResult] = useState(false);
    const score = useMemo(() => computeScores(answers), [answers]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const reset = () => {
        setAnswers({});
        setShowResult(false);
    };

    if (!isClient) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <header className="max-w-4xl w-full mx-auto px-6 pt-10 pb-6 flex-shrink-0">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-semibold text-sm">
                        <ArrowLeft className="w-4 h-4" /> Batal & Kembali
                    </Link>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                    Career Match Quiz <span className="text-indigo-600">AI</span>
                </h1>
                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
                    Ungkap peran idealmu di industri teknologi & startup. Tes 18 pertanyaan ringan ini memetakan gaya kerja, kelebihan, dan fokus skill tersembunyimu.
                </p>
            </header>

            <main className="flex-grow w-full max-w-4xl mx-auto px-6 pb-20 flex flex-col items-center justify-start mt-4">
                {showResult ? (
                    <ResultView score={score} onRetake={reset} />
                ) : (
                    <QuizView answers={answers} setAnswers={setAnswers} onFinish={() => setShowResult(true)} />
                )}
            </main>

            <footer className="w-full bg-white border-t border-slate-200 mt-auto flex-shrink-0">
                <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>
                        © {new Date().getFullYear()} CareerAI • Built by <a className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors" href={ATTR_LINKEDIN} target="_blank" rel="noreferrer">Muhammad Alhadiansyah S</a>
                    </p>
                    <p>
                        Supported by <a className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors" href={ATTR_PIJAR} target="_blank" rel="noreferrer">PijarTeknologi</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
