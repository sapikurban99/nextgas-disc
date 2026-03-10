"use client"

import { useState } from "react"
import { Loader2, Sparkles, User, BarChart3, Download, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
// Remove Supabase and AbortController imports

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
            console.log("Mengirim URL ke server Next.js proxy:", url)

            const payload = {
                linkedin_url: url,
                timestamp: new Date().toISOString(),
                source: "linkedin-analyzer-app",
            }

            const response = await fetch("/api/analyze-linkedin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            })

            console.log("Status response dari API route:", response.status)

            if (response.ok) {
                const result = await response.json()

                let analysisData = null

                try {
                    const cleanJsonString = (str: string): string => {
                        let cleaned = str.replace(/```json\s*/g, "").replace(/```\s*/g, "")
                        cleaned = cleaned.trim()
                        return cleaned
                    }

                    // Sama dengan logic lama, support berbagai macam format respons AI
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

            // Tampilkan fallback / error state di UI
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
        if (!email) {
            alert("Masukkan email dulu ya untuk mengunduh hasil analisis")
            return
        }

        if (!analysis) {
            alert("Belum ada hasil analisis yang bisa diunduh")
            return
        }

        setIsSaving(true)

        try {
            // Simpan ke GAS sebagai pengganti Supabase
            if (process.env.NEXT_PUBLIC_GAS_URL) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_GAS_URL}?action=saveLead`, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: "LINKEDIN_ANALYZER",
                            email: email,
                            linkedin: url,
                            score: analysis.profileStrength,
                            name: analysis.scrapedProfile?.name || "Unknown",
                        }),
                    })
                } catch (gasError) {
                    console.error("Gagal simpan lead laporan ke GAS", gasError)
                }
            }

            // Generate PDF
            await generatePDF()
        } catch (error) {
            console.error("Error:", error)
            alert("Ada kendala saat menyimpan. Coba lagi ya.")
        } finally {
            setIsSaving(false)
        }
    }

    const generatePDF = async () => {
        const { jsPDF } = await import("jspdf")
        const doc = new jsPDF()

        // Sama persis logic JS PDF dengan kode asli
        doc.setFont("helvetica")
        doc.setFontSize(24)
        doc.setTextColor(30, 64, 175)
        doc.text("Analisis Profil LinkedIn AI", 20, 25)

        doc.setDrawColor(30, 64, 175)
        doc.setLineWidth(1)
        doc.line(20, 30, 190, 30)

        // Profile Info
        doc.setFontSize(18)
        doc.setTextColor(0, 0, 0)
        doc.text(analysis.scrapedProfile.name, 20, 45)

        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        const hlLines = doc.splitTextToSize(analysis.scrapedProfile.headline, 170)
        doc.text(hlLines, 20, 55)

        const yAfterHl = 55 + (hlLines.length * 6)
        doc.text(`${analysis.scrapedProfile.location} • ${analysis.scrapedProfile.connections} koneksi`, 20, yAfterHl)

        // Score
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

        // Summary
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

        // Breakdown scores
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

        // Strengths
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

        // Improvements
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

        // Footer
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
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                {/* Header Navbar-style */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
                    </Link>
                </div>

                {/* Header Logo & Title */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
                            <BarChart3 className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">LinkedIn Profile Analyzer</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Cek kekuatan profil LinkedIn profesionalmu dengan bantuan AI. Tempel URL profil di bawah dan dapatkan skor serta saran perbaikan seketika.
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Analisis Sekarang</h2>
                            <p className="text-sm text-slate-500">Profil LinkedIn tujuan harus berstatus publik agar AI dapat membaca datanya.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="url"
                            placeholder="https://www.linkedin.com/in/nama-anda/"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-slate-700"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !url}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md focus:ring-4 focus:ring-indigo-200 shrink-0"
                        >
                            {isAnalyzing ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Menghubungkan API...</>
                            ) : (
                                <><Sparkles className="h-5 w-5" /> Analisis AI</>
                            )}
                        </button>
                    </div>
                </div>

                {/* How it works (empty state) */}
                {!analysis && (
                    <div className="grid md:grid-cols-3 gap-6 mb-16 opacity-70">
                        <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">1</div>
                            <h3 className="font-bold text-slate-800 mb-2">Tempel URL</h3>
                            <p className="text-sm text-slate-500">AI kami akan membaca struktur dan data publik LinkedIn Anda secara real-time.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-purple-100">2</div>
                            <h3 className="font-bold text-slate-800 mb-2">Penilaian Pintar</h3>
                            <p className="text-sm text-slate-500">Data dipecah per kategori: foto, headline, about, pengalaman, hingga skill.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">3</div>
                            <h3 className="font-bold text-slate-800 mb-2">Actionable Insight</h3>
                            <p className="text-sm text-slate-500">Anda mendapat laporan apa yang sudah bagus dan cara konkrit untuk meningkatkannya.</p>
                        </div>
                    </div>
                )}

                {/* Results UI */}
                {analysis && (
                    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-8">
                        {/* Status Card */}
                        <div className="bg-white border-l-4 border-l-indigo-500 rounded-2xl p-6 border-y border-r border-slate-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-slate-800">{analysis.scrapedProfile.name}</h2>
                                        {analysis.aiStatus === "success" && (
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> Diproses AI
                                            </span>
                                        )}
                                        {analysis.aiStatus === "error" && (
                                            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                                Gagal
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-600 font-medium mb-4">{analysis.scrapedProfile.headline}</p>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div>
                                            <span className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-widest">Lokasi</span>
                                            <span className="text-slate-700">{analysis.scrapedProfile.location}</span>
                                        </div>
                                        <div>
                                            <span className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-widest">Jaringan</span>
                                            <span className="text-slate-700">{analysis.scrapedProfile.connections} koneksi</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-widest">Tautan Original</span>
                                            <a href={analysis.scrapedProfile.profileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline break-all">
                                                {analysis.scrapedProfile.profileUrl}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {analysis.aiStatus === "success" && (
                                    <div className="sm:w-3/12 shrink-0 bg-slate-50 flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Profile Score</p>
                                        <p className="text-6xl font-black text-indigo-600 leading-none">{analysis.profileStrength}</p>
                                        <p className="text-slate-500 font-medium mt-1">/ 100</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary Block */}
                        {analysis.summary && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8">
                                <h3 className="text-indigo-900 font-bold text-lg mb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-500" /> Executive Summary
                                </h3>
                                <p className="text-indigo-800 leading-relaxed font-medium">{analysis.summary}</p>
                            </div>
                        )}

                        {/* Breakdown Metrics */}
                        {analysis.radarData && analysis.aiStatus === "success" && (
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-slate-400" /> Breakdown Kategori
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                    {analysis.radarData.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <div className="flex justify-between items-end">
                                                <span className="font-semibold text-slate-700">{item.subject}</span>
                                                <span className="font-bold text-indigo-600">{item.score} / {item.fullMark}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
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
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                        ✓
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Kekuatan Utama</h3>
                                </div>
                                <ul className="space-y-4">
                                    {analysis.strengths.map((item: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
                                            <span className="text-emerald-500 mt-0.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                                        !
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Catatan Perbaikan</h3>
                                </div>
                                <ul className="space-y-4">
                                    {analysis.improvements.map((item: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
                                            <span className="text-amber-500 mt-0.5">→</span >
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Save PDF Card */}
                        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-2">Simpan Laporan Lengkap PDF</h3>
                                <p className="text-slate-400">Masukkan email. Laporan dapat Anda jadikan acuan untuk melatih profil LinkedIn Anda.</p>
                            </div>
                            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="alamat@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-800 text-white border border-slate-700 px-5 py-4 outline-none focus:border-indigo-400 rounded-xl w-full sm:w-64 placeholder:text-slate-500"
                                />
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={!email || isSaving}
                                    className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center transition-all whitespace-nowrap"
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
                                className="text-slate-500 hover:text-slate-800 font-semibold underline decoration-slate-300 underline-offset-4 transition-colors"
                            >
                                Analisis Akun LinkedIn Lainnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Loading Analisis URL */}
            {isAnalyzing && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Neural Scan Dimulai</h3>
                        <p className="text-slate-500 text-sm mb-6">Membaca URL dan mengirim request ke server N8N. Mohon tunggu selama 15-45 detik.</p>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse w-[85%]"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}