"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, FileText, Download, Loader2, AlertCircle, Star, Wrench, Lightbulb, Bot, ArrowLeft, Tag, RefreshCw } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from '../components/ThemeToggle'

// ── Types matching n8n output ──────────────────────────────────────────────
interface ScoreBreakdownItem {
    score: number
    rationale: string
}

interface GapExample {
    from: string | null
    to: string
}

interface Gap {
    issue: string
    impact: string
    evidence: string | null
    priority: "high" | "medium" | "low"
    fix: string
    example: GapExample
}

interface AtsRecommendation {
    action: string
    why: string
    how: string
}

interface BulletRewrite {
    from: string
    to: string
}

interface SuggestedKeywords {
    coreSkills?: string[]
    tools?: string[]
    methodologies?: string[]
    domain?: string[]
}

interface AnalysisResult {
    score: number
    scoreBreakdown: {
        relevance?: ScoreBreakdownItem
        achievements?: ScoreBreakdownItem
        structure?: ScoreBreakdownItem
        atsReadiness?: ScoreBreakdownItem
        language?: ScoreBreakdownItem
    }
    highlights: string[]
    gaps: Gap[]
    suggestions: string[]
    atsRecommendations: AtsRecommendation[]
    suggestedKeywords: SuggestedKeywords
    bulletRewrites: BulletRewrite[]
    parsedTextSnippet: string
}

// ── Helpers ────────────────────────────────────────────────────────────────
const SCORE_MAX: Record<string, number> = {
    relevance: 20,
    achievements: 20,
    structure: 20,
    atsReadiness: 20,
    language: 20,
}

const SCORE_LABEL: Record<string, string> = {
    relevance: "Relevansi",
    achievements: "Pencapaian",
    structure: "Struktur",
    atsReadiness: "ATS-Friendly",
    language: "Bahasa",
}

function priorityClass(p: string) {
    switch (p?.toLowerCase()) {
        case "high": return "bg-rose-900/40 text-rose-400 border-rose-800"
        case "medium": return "bg-amber-900/40 text-amber-400 border-amber-800"
        default: return "bg-zinc-800 text-zinc-400 border-zinc-700"
    }
}

function priorityLabel(p: string) {
    switch (p?.toLowerCase()) {
        case "high": return "Tinggi"
        case "medium": return "Sedang"
        default: return "Rendah"
    }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function CVAnalyzer() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [userEmail, setUserEmail] = useState("")
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (file: File) => {
        if (
            file &&
            (file.type === "application/pdf" ||
                file.type === "application/msword" ||
                file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        ) {
            setSelectedFile(file)
            setError(null)
        } else {
            setError("Tolong pilih file PDF, DOC, atau DOCX yang valid.")
        }
    }

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation()
        const files = e.dataTransfer.files
        if (files.length > 0) handleFileSelect(files[0])
    }

    const analyzeCV = async () => {
        if (!selectedFile) return
        setIsAnalyzing(true)
        setError(null)
        setAnalysisResult(null)

        try {
            const formData = new FormData()
            formData.append("file", selectedFile)

            const response = await fetch("/api/analyze-cv", { method: "POST", body: formData })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || "Gagal menghubungi server untuk analisis CV.")
            }

            const data = await response.json()

            let raw = data
            if (Array.isArray(raw) && raw.length > 0) raw = raw[0]

            if (raw?.output && typeof raw.output === "string") {
                const clean = raw.output.replace(/```json\n?|\n?```/g, "").trim()
                raw = JSON.parse(clean)
            } else if (raw?.analysis) {
                raw = raw.analysis
            }

            if (!raw || typeof raw !== "object" || typeof raw.score !== "number") {
                throw new Error("Format respons dari AI tidak valid atau tidak lengkap.")
            }

            setAnalysisResult(raw as AnalysisResult)
        } catch (err: unknown) {
            console.error("CV Analysis error:", err)
            setError(err instanceof Error ? err.message : "Gagal menganalisis CV. Coba lagi nanti.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const formatFileSize = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + " MB"
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const generatePDF = async () => {
        if (!validateEmail(userEmail) || !analysisResult) return
        setIsGeneratingPDF(true)
        try {
            if (process.env.NEXT_PUBLIC_GAS_URL) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_GAS_URL}?action=saveLead`, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: "CV_ANALYZER",
                            email: userEmail,
                            score: analysisResult.score,
                        }),
                    })
                } catch (gasErr) {
                    console.error("Gagal menyimpan lead ke GAS:", gasErr)
                }
            }

            const { jsPDF } = await import("jspdf")
            const doc = new jsPDF()

            doc.setFontSize(22)
            doc.setTextColor(59, 130, 246)
            doc.text("Laporan Analisis CV AI", 20, 20)
            doc.setDrawColor(200, 200, 200)
            doc.line(20, 25, 190, 25)

            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text(`Email: ${userEmail}`, 20, 35)
            doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 20, 42)

            doc.setFontSize(40)
            doc.setTextColor(30, 58, 138)
            doc.text(`${analysisResult.score}`, 160, 40)
            doc.setFontSize(12)
            doc.text("/ 100", 175, 40)
            doc.text("Skor Akhir", 160, 46)

            let y = 60
            doc.setFontSize(16)
            doc.setTextColor(21, 128, 61)
            doc.text("Highlights:", 20, y)
            y += 8
            doc.setFontSize(11)
            doc.setTextColor(60, 60, 60)
            analysisResult.highlights.slice(0, 5).forEach(h => {
                const lines = doc.splitTextToSize(`• ${h}`, 170)
                doc.text(lines, 20, y)
                y += lines.length * 6
            })

            y += 5
            if (y > 250) { doc.addPage(); y = 20 }
            doc.setFontSize(16)
            doc.setTextColor(185, 28, 28)
            doc.text("Prioritas Perbaikan:", 20, y)
            y += 8
            doc.setFontSize(11)
            doc.setTextColor(60, 60, 60)
            analysisResult.gaps.slice(0, 4).forEach(g => {
                if (y > 270) { doc.addPage(); y = 20 }
                const issueLines = doc.splitTextToSize(`[${priorityLabel(g.priority)}] ${g.issue}`, 170)
                doc.setFont("helvetica", "bold")
                doc.text(issueLines, 20, y)
                y += issueLines.length * 6
                doc.setFont("helvetica", "normal")
                const fixLines = doc.splitTextToSize(`Solusi: ${g.fix}`, 165)
                doc.text(fixLines, 25, y)
                y += fixLines.length * 6 + 3
            })

            doc.setFontSize(9)
            doc.setTextColor(150, 150, 150)
            const pageCount = doc.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.text(`CareerAI oleh PijarTeknologi - Halaman ${i} dari ${pageCount}`, 20, 285)
            }

            doc.save(`Analisis-CV-${new Date().getTime()}.pdf`)
            setShowEmailModal(false)
            setUserEmail("")
        } catch (err) {
            console.error("PDF generation error:", err)
            alert("Gagal membuat file PDF.")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
            <div className="container mx-auto p-4 md:p-8 max-w-6xl">

                {/* Back + Theme Toggle */}
                <div className="mb-10 flex justify-between items-center">
                    <Link href="/" className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
                    </Link>
                    <ThemeToggle />
                </div>

                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        CV & Resume Analyzer
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Unggah CV Anda (.pdf, .doc, .docx) dan biarkan AI kami menganalisisnya. Dapatkan skor ATS, temukan celah, dan tingkatkan peluang dipanggil interview.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

                    {/* ── Upload Panel ─────────────────────────────────── */}
                    <div className="rounded-lg border p-8 flex flex-col h-fit" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>1. Unggah Berkas</h2>
                        <div className="space-y-6 flex-grow">
                            <div
                                className="border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer group" style={{ borderColor: 'var(--border-secondary)', backgroundColor: 'var(--bg-input)' }}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-14 w-14 mx-auto mb-4 group-hover:scale-110 transform duration-300" style={{ color: 'var(--text-muted)' }} />
                                <p className="font-semibold text-lg" style={{ color: 'var(--text-secondary)' }}>Pilih file dari komputermu</p>
                                <p className="mt-2" style={{ color: 'var(--text-muted)' }}>atau seret dan lepas ke area ini</p>
                                <p className="text-sm mt-4 font-medium px-3 py-1 border rounded-full inline-block" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-secondary)' }}>Mendukung PDF, DOC, DOCX</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>

                            {selectedFile && (
                                <div className="flex items-center p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)' }}>
                                    <FileText className="h-10 w-10 mr-4 shrink-0" style={{ color: 'var(--text-primary)' }} />
                                    <div className="overflow-hidden">
                                        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</p>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setAnalysisResult(null) }}
                                        className="ml-auto text-zinc-500 hover:text-rose-400 p-2"
                                    >
                                        &times; Batal
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-rose-950/50 border border-rose-900 rounded-lg text-rose-400">
                                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <p className="font-medium text-sm leading-relaxed">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={analyzeCV}
                                disabled={!selectedFile || isAnalyzing}
                                className="w-full h-14 flex items-center justify-center gap-3 text-lg font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all theme-btn-primary"
                            >
                                {isAnalyzing ? (
                                    <><Loader2 className="h-6 w-6 animate-spin" /> Menganalisis...</>
                                ) : (
                                    <><Bot className="h-6 w-6" /> Minta AI Analisis</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Results Panel ─────────────────────────────────── */}
                    <div className="rounded-lg border p-8 min-h-[500px] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>2. Laporan Hasil Analisis</h2>

                        <div className="flex-grow">
                            {/* Loading */}
                            {isAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 relative">
                                        <Bot className="w-10 h-10 text-white absolute" />
                                        <svg className="animate-spin text-zinc-500 w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">AI sedang membaca CV Anda</h3>
                                    <p className="text-zinc-500 max-w-sm">Mengekstrak teks, menilai struktur, mengecek kata kunci industri, dan memvalidasi skor ATS...</p>
                                </div>
                            )}

                            {/* Empty */}
                            {!analysisResult && !isAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-600">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                                        <FileText className="h-10 w-10 text-zinc-700" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-400 mb-1">Panggung Utama Analisis</h3>
                                    <p className="text-sm">Silakan unggah dan klik tombol analisis di sebelah kiri.</p>
                                </div>
                            )}

                            {/* Results */}
                            {analysisResult && (
                                <div className="space-y-8">

                                    {/* ── Score Banner ── */}
                                    <div className="bg-white rounded-lg p-8 text-center relative overflow-hidden">
                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Skor Kekuatan CV</p>
                                        <div className="flex items-end justify-center gap-2 mb-2">
                                            <span className="text-7xl font-black text-black leading-none">
                                                {analysisResult.score}
                                            </span>
                                            <span className="text-2xl font-bold text-zinc-400 pb-1">/ 100</span>
                                        </div>
                                        <p className="text-zinc-600 text-sm mt-4 font-medium bg-zinc-100 inline-block px-4 py-2 rounded-full">
                                            {analysisResult.score >= 80 ? '🥳 Luar Biasa! CV Anda siap tempur.' : analysisResult.score >= 60 ? '✨ Cukup baik, tapi masih bisa dioptimalkan.' : '🛠️ Perlu rombakan besar agar dilirik rekruter.'}
                                        </p>
                                        {analysisResult.parsedTextSnippet && (
                                            <p className="mt-4 text-xs text-zinc-400 italic truncate px-4">
                                                📄 {analysisResult.parsedTextSnippet}
                                            </p>
                                        )}
                                    </div>

                                    {/* ── Score Breakdown ── */}
                                    {analysisResult.scoreBreakdown && Object.keys(analysisResult.scoreBreakdown).length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-white rounded-full"></div>
                                                Breakdown Metrik Penilaian
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Object.entries(analysisResult.scoreBreakdown).map(([key, val]) => {
                                                    if (!val) return null
                                                    const maxScore = SCORE_MAX[key] ?? 20
                                                    const pct = Math.min(100, Math.round((val.score / maxScore) * 100))
                                                    return (
                                                        <div key={key} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="font-semibold text-zinc-300 text-sm">{SCORE_LABEL[key] ?? key}</span>
                                                                <span className={`font-bold text-sm ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                                    {val.score}/{maxScore}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2">
                                                                <div
                                                                    className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-zinc-500 leading-relaxed">{val.rationale}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Highlights ── */}
                                    {analysisResult.highlights?.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                <Star className="h-5 w-5 text-emerald-400" />
                                                Apa yang Sudah Bagus
                                            </h3>
                                            <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-5">
                                                <ul className="space-y-3">
                                                    {analysisResult.highlights.map((h, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                                <span className="text-xs font-bold">✓</span>
                                                            </div>
                                                            <span className="text-zinc-300 text-sm leading-relaxed">{h}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Gaps ── */}
                                    {analysisResult.gaps?.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                <Wrench className="h-5 w-5 text-rose-400" />
                                                Area yang Perlu Diperbaiki
                                            </h3>
                                            <div className="space-y-4">
                                                {analysisResult.gaps.map((g, i) => (
                                                    <div key={i} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-lg p-5">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-zinc-800 pb-4">
                                                            <h4 className="font-bold text-white">{g.issue}</h4>
                                                            <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full border self-start ${priorityClass(g.priority)}`}>
                                                                {priorityLabel(g.priority)}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-3 text-sm">
                                                            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 items-start">
                                                                <span className="font-semibold text-zinc-500">Dampak:</span>
                                                                <span className="text-zinc-300">{g.impact}</span>
                                                            </div>
                                                            {g.evidence && (
                                                                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 items-start">
                                                                    <span className="font-semibold text-zinc-500">Bukti:</span>
                                                                    <span className="text-zinc-500 italic px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">"{g.evidence}"</span>
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 items-start mt-2">
                                                                <span className="font-semibold text-white">Solusi:</span>
                                                                <span className="text-zinc-300">{g.fix}</span>
                                                            </div>
                                                            {(g.example?.from || g.example?.to) && (
                                                                <div className="mt-3 rounded-lg overflow-hidden border border-zinc-800">
                                                                    {g.example.from && (
                                                                        <div className="bg-rose-950/40 px-4 py-2.5 text-xs text-rose-400">
                                                                            <span className="font-bold">Sebelum:</span> {g.example.from}
                                                                        </div>
                                                                    )}
                                                                    <div className="bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-400">
                                                                        <span className="font-bold">Sesudah:</span> {g.example.to}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── General Suggestions ── */}
                                    {analysisResult.suggestions?.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                <Lightbulb className="h-5 w-5 text-amber-400" />
                                                Saran Umum
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysisResult.suggestions.map((s, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300 bg-amber-950/20 border border-amber-900/30 rounded-lg px-4 py-3">
                                                        <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* ── ATS Recommendations ── */}
                                    {analysisResult.atsRecommendations?.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                <Bot className="h-5 w-5 text-zinc-400" />
                                                Rekomendasi ATS
                                            </h3>
                                            <div className="space-y-3">
                                                {analysisResult.atsRecommendations.map((r, i) => (
                                                    <div key={i} className="border border-zinc-800 bg-zinc-900/50 rounded-lg p-4 text-sm space-y-1">
                                                        <p className="font-bold text-white">{r.action}</p>
                                                        <p className="text-zinc-400"><span className="font-semibold text-zinc-500">Kenapa:</span> {r.why}</p>
                                                        <p className="text-zinc-400"><span className="font-semibold text-zinc-500">Caranya:</span> {r.how}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Bullet Rewrites ── */}
                                    {analysisResult.bulletRewrites?.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                <RefreshCw className="h-5 w-5 text-zinc-400" />
                                                Contoh Penulisan Ulang Bullet
                                            </h3>
                                            <div className="space-y-3">
                                                {analysisResult.bulletRewrites.map((b, i) => (
                                                    <div key={i} className="rounded-lg overflow-hidden border border-zinc-800 text-sm">
                                                        <div className="bg-rose-950/40 px-4 py-2.5 text-rose-400">
                                                            <span className="font-bold">✗ Sebelum:</span> {b.from}
                                                        </div>
                                                        <div className="bg-emerald-950/40 px-4 py-2.5 text-emerald-400">
                                                            <span className="font-bold">✓ Sesudah:</span> {b.to}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Suggested Keywords ── */}
                                    {analysisResult.suggestedKeywords && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                <Tag className="h-5 w-5 text-zinc-400" />
                                                Kata Kunci yang Disarankan
                                            </h3>
                                            <div className="space-y-3">
                                                {Object.entries(analysisResult.suggestedKeywords).map(([cat, kws]) => {
                                                    if (!kws || (kws as string[]).length === 0) return null
                                                    const catLabel: Record<string, string> = {
                                                        coreSkills: "Core Skills",
                                                        tools: "Tools",
                                                        methodologies: "Metodologi",
                                                        domain: "Domain",
                                                    }
                                                    return (
                                                        <div key={cat}>
                                                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{catLabel[cat] ?? cat}</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(kws as string[]).map((kw, i) => (
                                                                    <span key={i} className="px-3 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-full text-xs font-medium">
                                                                        {kw}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Download ── */}
                                    <div className="pt-6 border-t border-zinc-800">
                                        <button
                                            onClick={() => setShowEmailModal(true)}
                                            className="w-full h-14 flex items-center justify-center gap-3 text-lg font-bold rounded transition-all theme-btn-primary"
                                        >
                                            <Download className="h-5 w-5" />
                                            Simpan Laporan Lengkap (PDF)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* ── Email Modal ── */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="border rounded-lg w-full max-w-md p-8 shadow-2xl relative" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-secondary)' }}>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Simpan Hasil Menarik Ini?</h2>
                        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Bantu kami berkembang! Masukkan email Anda untuk mengunduh laporan PDF ini.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="alamat.email@contoh.com"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-3.5 outline-none focus:ring-2 transition-all font-medium theme-input" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                                />
                                {userEmail && !validateEmail(userEmail) && (
                                    <p className="text-rose-400 text-xs mt-2 font-medium ml-1">Format email belum benar.</p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={generatePDF}
                                    disabled={!validateEmail(userEmail) || isGeneratingPDF}
                                    className="flex-1 flex justify-center items-center py-3.5 font-bold rounded disabled:opacity-50 transition-all theme-btn-primary"
                                >
                                    {isGeneratingPDF ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</> : "Kirim & Unduh PDF"}
                                </button>
                                <button
                                    onClick={() => { setShowEmailModal(false); setUserEmail("") }}
                                    className="px-6 py-3.5 font-bold text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}