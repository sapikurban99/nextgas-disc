'use client'

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ThemeToggle } from '../components/ThemeToggle';

const ATTR_LINKEDIN = "https://www.linkedin.com/in/muhammad-alhadiansyah-santoso/";
const ATTR_PIJAR = "https://pijarteknologi.id/";

// === Archetypes ===
const TYPES = [
    { id: "analyst", name: "Analyst", emoji: "📊", blurb: "Kamu senang pakai data untuk ngarahin keputusan. Rapi, teliti, dan suka ngulik sampai ketemu insight.", roles: ["Data/BI Analyst", "Product Analyst", "Researcher"], skills: ["SQL", "Python/Excel", "A/B test", "Critical thinking"] },
    { id: "creator", name: "Creator", emoji: "🎨", blurb: "Kamu hidup di ide dan eksekusi visual/cerita. Peka sama user experience dan suka bikin hal jadi mudah dipahami.", roles: ["UI/UX", "Content/Brand", "Visual Designer"], skills: ["Figma", "Copywriting", "User research", "Prototyping"] },
    { id: "connector", name: "Connector", emoji: "🤝", blurb: "Kamu kuat di komunikasi & hubungan. Jago gali kebutuhan dan nyambungin solusi ke orang yang tepat.", roles: ["Account Manager", "Sales/BD", "Customer Success"], skills: ["Active listening", "Negosiasi", "CRM", "Presentasi"] },
    { id: "driver", name: "Driver", emoji: "🚀", blurb: "Kamu gercep, senang target, dan nyaman ambil keputusan. Cocok ngarahin prioritas dan nyatuin tim lintas fungsi.", roles: ["Product Manager", "BizOps", "Founder-type"], skills: ["Prioritization", "Strategy", "Stakeholder mgmt", "OKR"] },
    { id: "maker", name: "Maker", emoji: "🛠️", blurb: "Kamu tangan dingin: senang bikin, otak-atik, dan ningkatin kualitas hasil.", roles: ["Engineer", "Ops/QA", "DevOps/Infra"], skills: ["Scripting", "Automation", "Debugging", "Systems thinking"] },
    { id: "organizer", name: "Organizer", emoji: "🧭", blurb: "Kamu bikin kerjaan jadi tertata. Proses rapi, risiko terkendali, dan ritme tim jalan.", roles: ["Project/Program Mgmt", "Finance/People Ops", "PMO"], skills: ["Planning", "Documentation", "Risk mgmt", "Process design"] },
];

// === Questions ===
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

function computeScores(ans: Record<string, number>) {
    const score = { analyst: 0, creator: 0, connector: 0, driver: 0, maker: 0, organizer: 0 };
    for (const q of QUESTIONS) {
        if (ans[q.id]) score[q.typeId as keyof typeof score] += ans[q.id];
    }
    return score;
}

function toPercentages(score: Record<string, number>) {
    const out: Record<string, number> = {};
    Object.keys(score).forEach((k) => { out[k] = Math.round((score[k] / 15) * 100); });
    return out;
}

function usePersistedState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') return initial;
        try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
    });
    useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { } }, [key, state]);
    return [state, setState];
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-secondary)' }}>
            <div className="h-full rounded-full transition-all ease-out duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: 'var(--bg-accent)' }} />
        </div>
    );
}

async function drawResultCardPNG({ typeMeta, pct }: { typeMeta: any, pct: Record<string, number> }) {
    const W = 1200, H = 630;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dark background
    ctx.fillStyle = "#09090b"; ctx.fillRect(0, 0, W, H);

    // Card
    ctx.fillStyle = "#18181b"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.beginPath(); ctx.roundRect(40, 40, W - 80, H - 80, 16); ctx.fill(); ctx.shadowColor = "transparent";

    // Border
    ctx.strokeStyle = "#27272a"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(40, 40, W - 80, H - 80, 16); ctx.stroke();

    ctx.fillStyle = "#ffffff"; ctx.font = "bold 28px Inter, system-ui, sans-serif"; ctx.fillText("CareerAI by PijarTeknologi", 80, 100);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 64px Inter, system-ui, sans-serif"; ctx.fillText(`${typeMeta.emoji} ${typeMeta.name} Profile`, 80, 180);

    ctx.fillStyle = "#a1a1aa"; ctx.font = "32px Inter, system-ui, sans-serif";
    const words = typeMeta.blurb.split(" "); let line = ""; let y = 240;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        if (ctx.measureText(testLine).width > 1000 && n > 0) { ctx.fillText(line, 80, y); line = words[n] + " "; y += 44; } else { line = testLine; }
    }
    ctx.fillText(line, 80, y);

    const sortedEntries = Object.entries(pct).sort((a, b) => b[1] - a[1]);
    let barY = 380;
    for (let i = 0; i < Math.min(4, sortedEntries.length); i++) {
        const [id, v] = sortedEntries[i];
        const label = TYPES.find((t) => t.id === id)?.name || id;
        ctx.fillStyle = "#d4d4d8"; ctx.font = "bold 24px Inter, system-ui, sans-serif"; ctx.fillText(`${label}`, 80, barY);
        ctx.fillStyle = "#3f3f46"; ctx.beginPath(); ctx.roundRect(280, barY - 20, 700, 20, 10); ctx.fill();
        ctx.fillStyle = id === typeMeta.id ? "#ffffff" : "#71717a"; ctx.beginPath(); ctx.roundRect(280, barY - 20, Math.max(20, Math.round(7 * v)), 20, 10); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 22px Inter"; ctx.fillText(`${v}%`, 1000, barY - 2);
        barY += 44;
    }
    return new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png", 0.95));
}

function ResultView({ score, onRetake }: { score: Record<string, number>, onRetake: () => void }) {
    const pct = toPercentages(score);
    const topId = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
    const topMeta = TYPES.find((t) => t.id === topId) || TYPES[0];

    const [email, setEmail] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [postErr, setPostErr] = useState<string | null>(null);
    const [imgURL, setImgURL] = useState<string | null>(null);

    const submitEmailThenGenerate = async () => {
        setPostErr(null);
        if (!email.includes("@")) { setPostErr("Format email tidak valid."); return; }
        setIsPosting(true);
        try {
            if (process.env.NEXT_PUBLIC_GAS_URL) {
                await fetch(`${process.env.NEXT_PUBLIC_GAS_URL}?action=saveLead`, {
                    method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, type: `QUIZ_${topMeta.id.toUpperCase()}`, score_json: score, name: "Quiz Participant", linkedin: "-" }),
                });
            }
            const blob = await drawResultCardPNG({ typeMeta: topMeta, pct });
            if (blob) setImgURL(URL.createObjectURL(blob));
        } catch (err: any) {
            setPostErr("Terjadi kesalahan sistem.");
        } finally { setIsPosting(false); }
    };

    return (
        <div className="mx-auto max-w-2xl w-full">
            <div className="rounded-lg p-8 text-center mb-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="text-5xl mb-6">{topMeta.emoji}</div>
                <h2 className="text-3xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>Kamu adalah: {topMeta.name}</h2>
                <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>{topMeta.blurb}</p>
                <div className="rounded-lg p-6 text-left mb-8 space-y-4 border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)' }}>
                    <h3 className="font-bold border-b pb-3" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-secondary)' }}>Komposisi Kepribadianmu</h3>
                    {TYPES.sort((a, b) => pct[b.id] - pct[a.id]).map((t) => (
                        <div key={t.id} className="relative">
                            <div className="flex justify-between text-sm font-semibold mb-1">
                                <span style={{ color: 'var(--text-secondary)' }}>{t.emoji} {t.name}</span>
                                <span style={{ color: t.id === topMeta.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>{pct[t.id]}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-secondary)' }}>
                                <div className={`h-full`} style={{ width: `${pct[t.id]}%`, backgroundColor: t.id === topMeta.id ? 'var(--bg-accent)' : 'var(--text-muted)' }} />
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={onRetake} className="w-full py-3.5 font-bold rounded border transition-colors theme-btn-secondary">Ulangi Kuis</button>
            </div>

            <div className="rounded-lg p-8" style={{ backgroundColor: 'var(--cta-section-bg)', color: 'var(--cta-section-text)' }}>
                <h3 className="text-xl font-bold mb-3">Dapatkan Kartu Hasil (PNG) 📸</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--cta-section-muted)' }}>Masukkan email untuk mengunduh gambar hasil kuis personalmu.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 rounded px-5 py-3 outline-none focus:ring-2" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-secondary)' }} />
                    <button onClick={submitEmailThenGenerate} disabled={isPosting} className="px-6 py-3 rounded font-bold flex items-center justify-center theme-btn-primary" style={{ backgroundColor: 'var(--cta-section-btn-bg)', color: 'var(--cta-section-btn-text)' }}>
                        {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buat Kartu"}
                    </button>
                </div>
                {postErr && <p className="text-rose-500 text-sm mt-3">{postErr}</p>}
                {imgURL && (
                    <div className="mt-8">
                        <img src={imgURL} alt="Result" className="w-full rounded-lg border" style={{ borderColor: 'var(--border-primary)' }} />
                        <a href={imgURL} download={`quiz-${topMeta.id}.png`} className="block text-center mt-4 py-4 font-bold rounded theme-btn-primary">⬇️ Download Gambar Sekarang</a>
                    </div>
                )}
            </div>
        </div>
    );
}

function QuizView({ answers, setAnswers, onFinish }: { answers: Record<string, number>, setAnswers: any, onFinish: () => void }) {
    const [idx, setIdx] = useState(0);
    const setAnswer = (val: number) => {
        setAnswers((p: any) => ({ ...p, [QUESTIONS[idx].id]: val }));
        setTimeout(() => idx < QUESTIONS.length - 1 ? setIdx(i => i + 1) : onFinish(), 300);
    };

    return (
        <div className="mx-auto max-w-2xl w-full">
            <ProgressBar value={(Object.keys(answers).length / QUESTIONS.length) * 100} />
            <p className="text-sm mt-3 mb-8" style={{ color: 'var(--text-muted)' }}>Pertanyaan {idx + 1} / {QUESTIONS.length}</p>
            <div className="rounded-lg p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <h2 className="text-2xl font-bold mb-10 min-h-[80px]" style={{ color: 'var(--text-primary)' }}>"{QUESTIONS[idx].text}"</h2>
                <div className="grid gap-3">
                    {LIKERT.map((opt) => (
                        <button key={opt.value} onClick={() => setAnswer(opt.value)} className={`p-4 rounded-lg font-bold text-left border transition-colors`} style={answers[QUESTIONS[idx].id] === opt.value ? { backgroundColor: 'var(--bg-accent)', color: 'var(--text-inverse)', borderColor: 'var(--bg-accent)' } : { borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}>
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mt-10">
                    <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="font-bold text-zinc-500 hover:text-white disabled:opacity-0 transition-colors">← Kembali</button>
                    <button onClick={() => idx < QUESTIONS.length - 1 ? setIdx(i => i + 1) : onFinish()} className="font-bold text-zinc-500 hover:text-white transition-colors">Lewati →</button>
                </div>
            </div>
        </div>
    );
}

export default function CareerQuizPage() {
    const [isClient, setIsClient] = useState(false);
    const [answers, setAnswers] = usePersistedState<Record<string, number>>(STORAGE_KEY, {});
    const [showResult, setShowResult] = useState(false);
    useEffect(() => setIsClient(true), []);

    if (!isClient) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-muted)' }} /></div>;

    return (
        <div className="min-h-screen flex flex-col font-sans pb-20" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
            <header className="max-w-4xl mx-auto px-6 pt-10 pb-6 w-full">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 font-semibold text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}><ArrowLeft className="w-4 h-4" /> Batal & Kembali</Link>
                    <ThemeToggle />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>Career Match Quiz <span style={{ color: 'var(--text-muted)' }}>AI</span></h1>
                <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Ungkap peran idealmu di industri teknologi & startup.</p>
            </header>
            <main className="w-full max-w-4xl mx-auto px-6">
                {showResult ? <ResultView score={computeScores(answers)} onRetake={() => { setAnswers({}); setShowResult(false); }} /> : <QuizView answers={answers} setAnswers={setAnswers} onFinish={() => setShowResult(true)} />}
            </main>
        </div>
    );
}