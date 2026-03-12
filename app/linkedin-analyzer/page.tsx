"use client"

import { useState } from "react"
import { Loader2, Sparkles, User, BarChart3, Download, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from '../components/ThemeToggle'

export default function LinkedInAnalyzer() {
    const [url, setUrl] = useState("")
    const [email, setEmail] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleAnalyze = async () => {
        if (!url.includes("linkedin.com")) {
            alert("Mohon masukkan URL profil LinkedIn yang valid")
            return
        }

        setIsAnalyzing(true)

        try {
            const payload = {
                linkedin_url: url,
                timestamp: new Date().toISOString(),
                source: "linkedin-analyzer-app",
            }

            const response = await fetch("/api/analyze-linkedin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                const result = await response.json()
                let analysisData = null

                try {
                    const cleanJsonString = (str: string): string => {
                        let cleaned = str.replace(/```json\s*/g, "").replace(/```\s*/g, "")
                        cleaned = cleaned.trim()
                        return cleaned
                    }

                    if (result.output && typeof result.output === "string") {
                        analysisData = JSON.parse(cleanJsonString(result.output))
                    } else if (Array.isArray(result) && result.length > 0 && result[0].output) {
                        analysisData = JSON.parse(cleanJsonString(result[0].output))
                    } else if (Array.isArray(result) && result.length > 0 && result[0].profileStrength) {
                        analysisData = result[0]
                    } else if (typeof result === "object" && result.profileStrength) {
                        analysisData = result
                    } else if (typeof result === "string") {
                        analysisData = JSON.parse(cleanJsonString(result))
                    } else if (result.data && typeof result.data === "object") {
                        analysisData = result.data
                    } else if (result.result && typeof result.result === "object") {
                        analysisData = result.result
                    } else {
                        const findAnalysisData = (obj: any): any => {
                            if (typeof obj === "object" && obj !== null) {
                                if (obj.profileStrength) return obj
                                for (const key in obj) {
                                    const found = findAnalysisData(obj[key])
                                    if (found) return found
                                }
                            }
                            return null
                        }
                        analysisData = findAnalysisData(result)
                    }
                } catch (parseError: any) {
                    console.error("Error parsing AI response:", parseError)
                    throw new Error(`Gagal memproses respons AI: ${parseError.message}`)
                }

                if (
                    analysisData &&
                    typeof analysisData === "object" &&
                    (analysisData.profileStrength !== undefined || analysisData.summary || analysisData.strengths || analysisData.profile_data)
                ) {
                    setAnalysis({
                        profileStrength: analysisData.profileStrength || 75,
                        summary: analysisData.summary || "Analisis profil LinkedIn berhasil diproses oleh sistem AI.",
                        strengths: analysisData.strengths || [],
                        improvements: analysisData.improvements || [],
                        keyInsights: analysisData.keyInsights || [],
                        radarData: analysisData.radarData?.filter((item: any) => item.subject !== "Aktivitas Konten") || [
                            { subject: "Profil Lengkap", score: 75, fullMark: 100 },
                            { subject: "Pengalaman", score: 70, fullMark: 100 },
                            { subject: "Skills & Keahlian", score: 65, fullMark: 100 },
                            { subject: "Jaringan", score: 80, fullMark: 100 },
                            { subject: "Visibilitas", score: 70, fullMark: 100 },
                        ],
                        scrapedProfile: analysisData.profile_data || {
                            name: "Professional Pribadi",
                            headline: "LinkedIn Member",
                            location: "Indonesia",
                            connections: "500+",
                            about: "Profil LinkedIn sedang dianalisis...",
                            profileUrl: url,
                        },
                        aiStatus: "success",
                        rawAiData: result,
                    })
                } else {
                    throw new Error("Format data dari AI tidak valid atau kurang lengkap.")
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
                throw new Error(errorData.error || `Server merespons dengan error: ${response.status}`)
            }
        } catch (error: any) {
            console.error("Error dalam proses analisis:", error)
            setAnalysis({
                profileStrength: 0,
                summary: `Terjadi kesalahan: ${error.message}. Silakan coba beberapa saat lagi atau pastikan link publik.`,
                strengths: ["Sistem menerima format URL dengan baik."],
                improvements: ["Pastikan profil LinkedIn disetting Publik", "Pastikan N8n Webhook menyala"],
                keyInsights: [`Link: ${url}`, "URL tersebut mungkin dilindungi login LinkedIn."],
                radarData: [
                    { subject: "Profil Lengkap", score: 0, fullMark: 100 },
                    { subject: "Pengalaman", score: 0, fullMark: 100 },
                    { subject: "Skills", score: 0, fullMark: 100 }
                ],
                scrapedProfile: {
                    name: "Unknown User",
                    headline: "-",
                    location: "-",
                    connections: "0",
                    about: "Gagal memproses profil.",
                    profileUrl: url,
                },
                aiStatus: "error",
                errorMessage: error.message,
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!email) { alert("Masukkan email dulu ya untuk mengunduh hasil analisis"); return }
        if (!analysis) { alert("Belum ada hasil analisis yang bisa diunduh"); return }
        setIsSaving(true)
        try {
            if (process.env.NEXT_PUBLIC_GAS_URL) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_GAS_URL}?action=saveLead`, {
                        method: "POST", mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "LINKEDIN_ANALYZER", email, linkedin: url, score: analysis.profileStrength, name: analysis.scrapedProfile?.name || "Unknown" }),
                    })
                } catch (gasError) { console.error("Gagal simpan lead ke GAS", gasError) }
            }
            await generatePDF()
        } catch (error) { console.error("Error:", error); alert("Ada kendala saat menyimpan. Coba lagi ya.") }
        finally { setIsSaving(false) }
    }

    const generatePDF = async () => {
        const { jsPDF } = await import("jspdf")
        const doc = new jsPDF()

        doc.setFont("helvetica")
        doc.setFontSize(24)
        doc.setTextColor(30, 64, 175)
        doc.text("Analisis Profil LinkedIn AI", 20, 25)
        doc.setDrawColor(30, 64, 175)
        doc.setLineWidth(1)
        doc.line(20, 30, 190, 30)

        doc.setFontSize(18)
        doc.setTextColor(0, 0, 0)
        doc.text(analysis.scrapedProfile.name, 20, 45)

        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        const hlLines = doc.splitTextToSize(analysis.scrapedProfile.headline, 170)
        doc.text(hlLines, 20, 55)

        const yAfterHl = 55 + (hlLines.length * 6)
        doc.text(`${analysis.scrapedProfile.location} • ${analysis.scrapedProfile.connections} koneksi`, 20, yAfterHl)

        const yScore = yAfterHl + 15
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text("Skor Kekuatan Profil", 20, yScore)

        doc.setFillColor(59, 130, 246, 0.1)
        doc.roundedRect(20, yScore + 5, 60, 25, 5, 5, "F")
        doc.setDrawColor(59, 130, 246)
        doc.roundedRect(20, yScore + 5, 60, 25, 5, 5, "S")

        doc.setFontSize(32)
        doc.setTextColor(59, 130, 246)
        doc.text(`${analysis.profileStrength}`, 35, yScore + 23)

        doc.setFontSize(14)
        doc.setTextColor(100, 100, 100)
        doc.text("/100", 55, yScore + 23)

        const ySummary = yScore + 40
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text("Ringkasan Analisis", 20, ySummary)

        doc.setFillColor(245, 247, 250)
        const summaryLines = doc.splitTextToSize(analysis.summary, 160)
        const summaryHeight = summaryLines.length * 5 + 10
        doc.roundedRect(20, ySummary + 5, 170, summaryHeight, 3, 3, "F")

        doc.setFontSize(11)
        doc.setTextColor(60, 60, 60)
        doc.text(summaryLines, 25, ySummary + 15)

        let yPosition = ySummary + 15 + summaryHeight

        if (yPosition > 240) { doc.addPage(); yPosition = 20; }

        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text("Detail Skor Profil", 20, yPosition)
        yPosition += 15

        doc.setFillColor(59, 130, 246)
        doc.rect(20, yPosition - 5, 170, 10, "F")
        doc.setFontSize(11)
        doc.setTextColor(255, 255, 255)
        doc.text("Aspek Profil", 25, yPosition)
        doc.text("Skor", 165, yPosition)
        yPosition += 15

        analysis.radarData.forEach((item: any, index: number) => {
            if (yPosition > 270) { doc.addPage(); yPosition = 20; }
            if (index % 2 === 0) {
                doc.setFillColor(248, 250, 252)
                doc.rect(20, yPosition - 8, 170, 12, "F")
            }
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            doc.text(item.subject, 25, yPosition)

            doc.setFillColor(230, 230, 230)
            doc.roundedRect(120, yPosition - 3, 40, 6, 2, 2, "F")
            doc.setFillColor(59, 130, 246)
            doc.roundedRect(120, yPosition - 3, Math.max(1, (40 * item.score) / 100), 6, 2, 2, "F")

            doc.setFontSize(10)
            doc.setTextColor(59, 130, 246)
            doc.setFont("helvetica", "bold")
            doc.text(`${item.score}`, 165, yPosition)
            doc.setFont("helvetica", "normal")
            yPosition += 15
        })

        yPosition += 10
        if (yPosition > 220) { doc.addPage(); yPosition = 20; }

        doc.setFontSize(16)
        doc.setTextColor(34, 197, 94)
        doc.text("✓ Kekuatan Profil", 20, yPosition)
        yPosition += 15

        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        analysis.strengths.forEach((strength: string) => {
            if (yPosition > 270) { doc.addPage(); yPosition = 20; }
            doc.setTextColor(34, 197, 94)
            doc.text("•", 20, yPosition)
            doc.setTextColor(0, 0, 0)
            const strengthLines = doc.splitTextToSize(strength, 160)
            doc.text(strengthLines, 25, yPosition)
            yPosition += Math.max(strengthLines.length * 5, 10)
        })

        yPosition += 10
        if (yPosition > 200) { doc.addPage(); yPosition = 20; }

        doc.setFontSize(16)
        doc.setTextColor(245, 158, 11)
        doc.text("→ Saran Perbaikan", 20, yPosition)
        yPosition += 15

        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        analysis.improvements.forEach((improvement: string) => {
            if (yPosition > 270) { doc.addPage(); yPosition = 20; }
            doc.setTextColor(245, 158, 11)
            doc.text("•", 20, yPosition)
            doc.setTextColor(0, 0, 0)
            const improvementLines = doc.splitTextToSize(improvement, 160)
            doc.text(improvementLines, 25, yPosition)
            yPosition += Math.max(improvementLines.length * 5, 10)
        })

        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.setLineWidth(0.5)
            doc.line(20, 280, 190, 280)
            doc.text(`Analisis LinkedIn oleh CareerAI - Halaman ${i} dari ${pageCount}`, 20, 285)
        }

        const cleanName = analysis.scrapedProfile.name.replace(/[^a-zA-Z0-9]/g, "-")
        doc.save(`LinkedIn-Analysis-${cleanName}-${new Date().getTime()}.pdf`)
    }

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                {/* Back + Theme Toggle */}
                <div className="mb-8 flex justify-between items-center">
                    <Link href="/" className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
                    </Link>
                    <ThemeToggle />
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)' }}>
                            <BarChart3 className="w-8 h-8" style={{ color: 'var(--text-primary)' }} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>LinkedIn Profile Analyzer</h1>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Cek kekuatan profil LinkedIn profesionalmu dengan bantuan AI. Tempel URL profil di bawah dan dapatkan skor serta saran perbaikan seketika.
                    </p>
                </div>

                {/* Input Card */}
                <div className="rounded-lg p-8 border mb-12" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)' }}>
                            <User className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Analisis Sekarang</h2>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Profil LinkedIn tujuan harus berstatus publik agar AI dapat membaca datanya.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="url"
                            placeholder="https://www.linkedin.com/in/nama-anda/"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 rounded-lg px-5 py-4 outline-none focus:ring-2 transition-all font-medium theme-input" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-secondary)' }}
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !url}
                            className="font-bold px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed theme-btn-primary"
                        >
                            {isAnalyzing ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Menghubungkan...</>
                            ) : (
                                <><Sparkles className="h-5 w-5" /> Analisis AI</>
                            )}
                        </button>
                    </div>
                </div>

                {/* How it works (empty state) */}
                {!analysis && (
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <div className="bg-zinc-950 rounded-lg p-6 text-center border border-zinc-900">
                            <div className="w-12 h-12 bg-zinc-900 text-white rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">1</div>
                            <h3 className="font-bold text-white mb-2">Tempel URL</h3>
                            <p className="text-sm text-zinc-500">AI kami akan membaca struktur dan data publik LinkedIn Anda secara real-time.</p>
                        </div>
                        <div className="bg-zinc-950 rounded-lg p-6 text-center border border-zinc-900">
                            <div className="w-12 h-12 bg-zinc-900 text-white rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">2</div>
                            <h3 className="font-bold text-white mb-2">Penilaian Pintar</h3>
                            <p className="text-sm text-zinc-500">Data dipecah per kategori: foto, headline, about, pengalaman, hingga skill.</p>
                        </div>
                        <div className="bg-zinc-950 rounded-lg p-6 text-center border border-zinc-900">
                            <div className="w-12 h-12 bg-zinc-900 text-white rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">3</div>
                            <h3 className="font-bold text-white mb-2">Actionable Insight</h3>
                            <p className="text-sm text-zinc-500">Anda mendapat laporan apa yang sudah bagus dan cara konkrit untuk meningkatkannya.</p>
                        </div>
                    </div>
                )}

                {/* Results UI */}
                {analysis && (
                    <div className="space-y-8">
                        {/* Status Card */}
                        <div className="bg-zinc-950 border-l-4 border-l-white rounded-lg p-6 border-y border-r border-zinc-900">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-white">{analysis.scrapedProfile.name}</h2>
                                        {analysis.aiStatus === "success" && (
                                            <span className="px-3 py-1 bg-emerald-950/50 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 border border-emerald-900">
                                                <Sparkles className="w-3 h-3" /> Diproses AI
                                            </span>
                                        )}
                                        {analysis.aiStatus === "error" && (
                                            <span className="px-3 py-1 bg-rose-950/50 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-full border border-rose-900">
                                                Gagal
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-zinc-400 font-medium mb-4">{analysis.scrapedProfile.headline}</p>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div>
                                            <span className="block text-zinc-600 font-semibold mb-1 uppercase text-[10px] tracking-widest">Lokasi</span>
                                            <span className="text-zinc-300">{analysis.scrapedProfile.location}</span>
                                        </div>
                                        <div>
                                            <span className="block text-zinc-600 font-semibold mb-1 uppercase text-[10px] tracking-widest">Jaringan</span>
                                            <span className="text-zinc-300">{analysis.scrapedProfile.connections} koneksi</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block text-zinc-600 font-semibold mb-1 uppercase text-[10px] tracking-widest">Tautan Original</span>
                                            <a href={analysis.scrapedProfile.profileUrl} target="_blank" rel="noreferrer" className="text-white hover:underline break-all">
                                                {analysis.scrapedProfile.profileUrl}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {analysis.aiStatus === "success" && (
                                    <div className="sm:w-3/12 shrink-0 bg-zinc-900 flex flex-col items-center justify-center p-6 rounded-lg border border-zinc-800">
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Profile Score</p>
                                        <p className="text-6xl font-black text-white leading-none">{analysis.profileStrength}</p>
                                        <p className="text-zinc-500 font-medium mt-1">/ 100</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary Block */}
                        {analysis.summary && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
                                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-zinc-500" /> Executive Summary
                                </h3>
                                <p className="text-zinc-300 leading-relaxed font-medium">{analysis.summary}</p>
                            </div>
                        )}

                        {/* Breakdown Metrics */}
                        {analysis.radarData && analysis.aiStatus === "success" && (
                            <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-900">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-zinc-500" /> Breakdown Kategori
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                    {analysis.radarData.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <div className="flex justify-between items-end">
                                                <span className="font-semibold text-zinc-300">{item.subject}</span>
                                                <span className="font-bold text-white">{item.score} / {item.fullMark}</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                                <div
                                                    className="bg-white h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, (item.score / item.fullMark) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Strengths */}
                            <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-900 text-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-emerald-950/50 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-900">
                                        ✓
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Kekuatan Utama</h3>
                                </div>
                                <ul className="space-y-4">
                                    {analysis.strengths.map((item: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-zinc-400 leading-relaxed">
                                            <span className="text-emerald-400 mt-0.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-900 text-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-amber-950/50 text-amber-400 rounded-lg flex items-center justify-center border border-amber-900 font-bold">
                                        !
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Catatan Perbaikan</h3>
                                </div>
                                <ul className="space-y-4">
                                    {analysis.improvements.map((item: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-zinc-400 leading-relaxed">
                                            <span className="text-amber-400 mt-0.5">→</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Save PDF Card */}
                        <div className="bg-white rounded-lg p-8 sm:p-10 text-black flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-2">Simpan Laporan Lengkap PDF</h3>
                                <p className="text-zinc-600">Masukkan email. Laporan dapat Anda jadikan acuan untuk melatih profil LinkedIn Anda.</p>
                            </div>
                            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="alamat@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-100 text-black border border-zinc-200 px-5 py-4 outline-none focus:border-zinc-400 rounded-lg w-full sm:w-64 placeholder:text-zinc-500"
                                />
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={!email || isSaving}
                                    className="bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-bold px-6 py-4 rounded-lg flex items-center justify-center transition-all whitespace-nowrap"
                                >
                                    {isSaving ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Tunggu...</>
                                    ) : (
                                        <><Download className="w-5 h-5 mr-2" /> Download PDF</>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="text-center pt-8">
                            <button
                                onClick={() => { setAnalysis(null); setUrl(""); }}
                                className="text-zinc-500 hover:text-white font-semibold underline decoration-zinc-700 underline-offset-4 transition-colors"
                            >
                                Analisis Akun LinkedIn Lainnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Loading */}
            {isAnalyzing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-sm p-8 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Neural Scan Dimulai</h3>
                        <p className="text-zinc-500 text-sm mb-6">Membaca URL dan mengirim request ke server N8N. Mohon tunggu selama 15-45 detik.</p>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-white h-1.5 rounded-full animate-pulse w-[85%]"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}