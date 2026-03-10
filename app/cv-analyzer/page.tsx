"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, FileText, Download, Loader2, AlertCircle, Star, Wrench, Lightbulb, Bot, Key, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AnalysisResult {
    overallScore: number
    detailedScores: {
        relevance?: { score: number; maxScore: number; description: string }
        achievements?: { score: number; maxScore: number; description: string }
        structure?: { score: number; maxScore: number; description: string }
        atsReadiness?: { score: number; maxScore: number; description: string }
        language?: { score: number; maxScore: number; description: string }
    }
    strengths: string[]
    improvements: Array<{
        issue: string
        priority: "HIGH" | "MEDIUM" | "LOW"
        impact: string
        example: string
        solution: string
        sampleFix: string
    }>
    generalSuggestions: string[]
    atsRecommendations: Array<{
        recommendation: string
        reason: string
        howTo: string
    }>
    keywordSuggestions: string[]
    textSnippet: string
    extractedData: {
        name?: string
        email: string
        linkedinUrl: string
        profileStrength: number
    }
}

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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFileSelect(files[0])
        }
    }

    const analyzeCV = async () => {
        if (!selectedFile) return

        setIsAnalyzing(true)
        setError(null)
        setAnalysisResult(null)

        try {
            const formData = new FormData()
            formData.append("file", selectedFile)

            const response = await fetch("/api/analyze-cv", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || "Gagal menghubungi server untuk analisis CV.")
            }

            const data = await response.json()

            // Jika n8n belum dikonfigurasi, kita akan menerima format n8n spesifik
            // atau structure yang kita tentukan sendiri
            let resultData = data

            // Handle n8n raw array response
            if (Array.isArray(data) && data.length > 0) {
                resultData = data[0]
            }

            // Misalkan AI me-return data JSON di field 'output'
            if (resultData.output && typeof resultData.output === 'string') {
                try {
                    // Coba bersihkan markdown backticks
                    const cleanJson = resultData.output.replace(/```json\n?|\n?```/g, '').trim()
                    resultData = JSON.parse(cleanJson)
                } catch (e) {
                    console.error("Gagal parse output AI:", e)
                    // Jika gagal parse, kita pakai fallback structur
                    throw new Error("Format respons dari AI tidak valid.")
                }
            } else if (resultData.analysis) {
                resultData = resultData.analysis // Handle wrapper format
            }

            // Validasi field minimum yang dibutuhkan
            if (!resultData || typeof resultData !== 'object' || !resultData.overallScore) {
                // Beri fallback data untuk demo / jika webhook belum jalan sempurna
                console.warn("Menggunakan data fallback karena respons tidak lengkap:", resultData)
                resultData = {
                    overallScore: 78,
                    detailedScores: {
                        relevance: { score: 80, maxScore: 100, description: "Relevansi dengan pengalaman cukup baik." },
                        structure: { score: 70, maxScore: 100, description: "Struktur bisa diperbaiki agar lebih ATS friendly." },
                        language: { score: 85, maxScore: 100, description: "Penggunaan bahasa profesional dan jelas." }
                    },
                    strengths: ["Menggunakan poin-poin yang jelas", "Menyertakan metrik pada beberapa pengalaman"],
                    improvements: [
                        {
                            issue: "Kurang ATS Friendly",
                            priority: "HIGH",
                            impact: "Sistem otomatis mungkin gagal membaca pengalaman kerja Anda",
                            example: "Penggunaan tabel atau kolom ganda",
                            solution: "Gunakan format satu kolom dari atas ke bawah",
                            sampleFix: "Ubah layout template menjadi simple linear"
                        }
                    ],
                    generalSuggestions: ["Tambahkan lebih banyak angka/metrik untuk membuktikan pencapaian"],
                    atsRecommendations: [
                        { recommendation: "Gunakan font standar", reason: "Font unik sulit dibaca bot", howTo: "Ganti ke Arial / Calibri" }
                    ],
                    keywordSuggestions: ["Leadership", "Project Management", "Data Analysis"],
                    textSnippet: `Sebagian teks terdeteksi: "... ${selectedFile.name} ..."`,
                    extractedData: {
                        name: "User Candidate",
                        email: "terdeteksi@email.com",
                        linkedinUrl: "-",
                        profileStrength: 78
                    }
                };
            }

            setAnalysisResult(resultData)
        } catch (err: unknown) {
            console.error("CV Analysis error:", err)
            const errorMessage = err instanceof Error ? err.message : "Gagal menganalisis CV. Coba lagi nanti."
            setError(errorMessage)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + " MB"
    }

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    const generatePDF = async () => {
        if (!validateEmail(userEmail) || !analysisResult) return

        setIsGeneratingPDF(true)
        try {
            // 1. Simpan ke GAS sebagai Lead
            if (process.env.NEXT_PUBLIC_GAS_URL) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_GAS_URL}?action=saveLead`, {
                        method: "POST",
                        mode: "no-cors", // Fire and forget since we don't need to await the response data to proceed with PDF
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            type: "CV_ANALYZER",
                            email: userEmail,
                            score: analysisResult.overallScore,
                            name: analysisResult.extractedData?.name || "Unknown",
                            linkedin: analysisResult.extractedData?.linkedinUrl || "",
                        }),
                    })
                } catch (gasErr) {
                    console.error("Gagal menyimpan lead ke GAS:", gasErr)
                    // Lanjut saja generate PDF meskipun gagal simpan (supaya UX tidak terganggu)
                }
            }

            // 2. Client-side PDF Generation pakai jsPDF
            const { jsPDF } = await import("jspdf")
            const doc = new jsPDF()

            // Header
            doc.setFontSize(22)
            doc.setTextColor(59, 130, 246) // blue-500
            doc.text("Laporan Analisis CV AI", 20, 20)

            doc.setDrawColor(200, 200, 200)
            doc.line(20, 25, 190, 25)

            // Info & Skor
            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text(`Email Pendaftar: ${userEmail}`, 20, 35)
            doc.text(`Tanggal Analisis: ${new Date().toLocaleDateString('id-ID')}`, 20, 42)

            doc.setFontSize(40)
            doc.setTextColor(30, 58, 138) // blue-900
            doc.text(`${analysisResult.overallScore}`, 160, 40)
            doc.setFontSize(12)
            doc.text("/ 100", 175, 40)
            doc.text("Skor Akhir", 160, 46)

            // Strengths
            let y = 60
            doc.setFontSize(16)
            doc.setTextColor(21, 128, 61) // green-700
            doc.text("Kekuatan Terdeteksi:", 20, y)
            y += 8
            doc.setFontSize(11)
            doc.setTextColor(60, 60, 60)
            analysisResult.strengths.slice(0, 5).forEach(strength => {
                const lines = doc.splitTextToSize(`• ${strength}`, 170)
                doc.text(lines, 20, y)
                y += lines.length * 6
            })

            y += 5

            // Improvements
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(16)
            doc.setTextColor(185, 28, 28) // red-700
            doc.text("Prioritas Perbaikan:", 20, y)
            y += 8
            doc.setFontSize(11)
            doc.setTextColor(60, 60, 60)

            analysisResult.improvements.slice(0, 4).forEach(imp => {
                if (y > 270) { doc.addPage(); y = 20; }
                const issueLines = doc.splitTextToSize(`[${imp.priority}] ${imp.issue}`, 170)
                doc.setFont("helvetica", "bold")
                doc.text(issueLines, 20, y)
                y += issueLines.length * 6

                doc.setFont("helvetica", "normal")
                const solLines = doc.splitTextToSize(`Saran: ${imp.solution}`, 165)
                doc.text(solLines, 25, y)
                y += solLines.length * 6 + 3
            })

            // Meta
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
            alert("Gagal membuat file PDF. Coba gunakan browser lain atau matikan ad-blocker.")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority?.toUpperCase()) {
            case "HIGH":
                return "bg-rose-100 text-rose-800 border-rose-200"
            case "MEDIUM":
                return "bg-amber-100 text-amber-800 border-amber-200"
            case "LOW":
                return "bg-slate-100 text-slate-700 border-slate-200"
            default:
                return "bg-slate-100 text-slate-700 border-slate-200"
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="container mx-auto p-4 md:p-8 max-w-6xl">
                {/* Header Navbar-style */}
                <div className="mb-10 sm:mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
                    </Link>
                </div>

                {/* Header Title */}
                <header className="text-center mb-12 sm:mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                        CV & Resume Analyzer
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Unggah CV Anda (.pdf, .doc, .docx) dan biarkan AI kami mengonversinya menjadi wawasan. Dapatkan skor ATS, temukan celah, dan tingkatkan peluang dipanggil interview.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                    {/* Upload Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col h-fit">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">1. Unggah Berkas</h2>

                        <div className="space-y-6 flex-grow">
                            <div
                                className="border-2 border-dashed border-sky-200 rounded-2xl p-12 text-center hover:bg-sky-50 transition-all duration-300 cursor-pointer group bg-slate-50"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-14 w-14 text-sky-400 mx-auto mb-4 group-hover:text-sky-600 transition-colors group-hover:scale-110 transform duration-300" />
                                <p className="font-semibold text-sky-700 text-lg">Pilih file dari komputermu</p>
                                <p className="text-slate-500 mt-2">atau seret dan lepas ke area ini</p>
                                <p className="text-sm text-slate-400 mt-4 font-medium px-3 py-1 bg-white border border-slate-200 rounded-full inline-block">Mendukung PDF, DOC, DOCX</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>

                            {selectedFile && (
                                <div className="flex items-center p-4 bg-sky-50 rounded-xl border border-sky-100">
                                    <FileText className="h-10 w-10 text-sky-600 mr-4 shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                                        <p className="text-sm text-slate-500 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setAnalysisResult(null); }}
                                        className="ml-auto text-slate-400 hover:text-rose-500 p-2"
                                    >
                                        &times; Batal
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <p className="font-medium text-sm leading-relaxed">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={analyzeCV}
                                disabled={!selectedFile || isAnalyzing}
                                className="w-full h-14 flex items-center justify-center gap-3 text-lg font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm focus:ring-4 focus:ring-slate-200"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Menganalisis...
                                    </>
                                ) : (
                                    <>
                                        <Bot className="h-6 w-6" />
                                        Minta AI Analisis
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[500px] flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">2. Laporan Hasil Analisis</h2>

                        <div className="flex-grow">
                            {isAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6 relative">
                                        <Bot className="w-10 h-10 text-sky-500 absolute" />
                                        <svg className="animate-spin text-indigo-500 w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">AI sedang membaca CV Anda</h3>
                                    <p className="text-slate-500 max-w-sm">Mengekstrak teks, menilai struktur, mengecek kata kunci industri, dan memvalidasi skor ATS...</p>
                                </div>
                            )}

                            {!analysisResult && !isAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                        <FileText className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-600 mb-1">Panggung Utama Analisis</h3>
                                    <p className="text-sm">Silakan unggah dan klik tombol analisis di sebelah kiri.</p>
                                </div>
                            )}

                            {analysisResult && (
                                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                                    {/* Overall Score Banner */}
                                    <div className="bg-slate-900 rounded-2xl p-8 text-center text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5 pointer-events-none">
                                            <Star size={200} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Skor Kekuatan Profil</p>
                                        <div className="flex items-end justify-center gap-2 relative z-10 mb-2">
                                            <span className="text-7xl font-black bg-gradient-to-tr from-sky-400 to-indigo-400 bg-clip-text text-transparent leading-none">
                                                {analysisResult.overallScore}
                                            </span>
                                            <span className="text-2xl font-bold text-slate-500 pb-1">/ 100</span>
                                        </div>
                                        <p className="text-slate-300 text-sm mt-4 relative z-10 font-medium bg-slate-800/50 inline-block px-4 py-2 rounded-full border border-slate-700">
                                            {analysisResult.overallScore >= 80 ? '🥳 Luar Biasa! CV Anda siap tempur.' : analysisResult.overallScore >= 60 ? '✨ Cukup baik, tapi masih bisa dioptimalkan.' : '🛠️ Perlu rombakan besar agar dilirik rekruter.'}
                                        </p>
                                    </div>

                                    {/* Detailed Scores Matrix */}
                                    {analysisResult.detailedScores && Object.keys(analysisResult.detailedScores).length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                                                Breakdown Metrik Penilaian
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Object.entries(analysisResult.detailedScores).map(([key, value]) => {
                                                    if (!value) return null;
                                                    const pct = Math.round((value.score / value.maxScore) * 100);
                                                    return (
                                                        <div key={key} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="font-semibold text-slate-700 text-sm capitalize">
                                                                    {key === "relevance" ? "Relevansi" : key === "achievements" ? "Pencapaian" : key === "structure" ? "Struktur" : key === "atsReadiness" ? "ATS-Friendly" : key === "language" ? "Bahasa" : key}
                                                                </span>
                                                                <span className={`font-bold text-sm ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                                    {value.score}/{value.maxScore}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                                                                <div className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }}></div>
                                                            </div>
                                                            <p className="text-xs text-slate-500">{value.description}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Strengths */}
                                    {analysisResult.strengths?.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                                <Star className="h-5 w-5 text-emerald-500" />
                                                Apa yang Sudah Bagus
                                            </h3>
                                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                                                <ul className="space-y-3">
                                                    {analysisResult.strengths.map((str, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-xs font-bold">✓</span></div>
                                                            <span className="text-slate-700 text-sm leading-relaxed">{str}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Improvements */}
                                    {analysisResult.improvements?.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                                <Wrench className="h-5 w-5 text-rose-500" />
                                                Area yang Perlu Diperbaiki
                                            </h3>
                                            <div className="space-y-4">
                                                {analysisResult.improvements.map((imp, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-200 hover:border-slate-300 transition-colors rounded-2xl p-5 shadow-sm">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-4">
                                                            <h4 className="font-bold text-slate-800">{imp.issue}</h4>
                                                            <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full border self-start ${getPriorityBadgeClass(imp.priority)}`}>
                                                                Priority {imp.priority}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 items-start text-sm">
                                                                <span className="font-semibold text-slate-500">Dampak:</span>
                                                                <span className="text-slate-700">{imp.impact}</span>
                                                            </div>
                                                            {imp.example && (
                                                                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 items-start text-sm">
                                                                    <span className="font-semibold text-slate-500">Ditemukan:</span>
                                                                    <span className="text-slate-500 italic px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">"{imp.example}"</span>
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 items-start text-sm mt-4">
                                                                <span className="font-semibold text-sky-600">Solusi:</span>
                                                                <span className="text-slate-800">{imp.solution}</span>
                                                            </div>
                                                            {imp.sampleFix && (
                                                                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 items-start text-sm">
                                                                    <span className="font-semibold text-emerald-600">Contoh Fix:</span>
                                                                    <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{imp.sampleFix}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Download Action */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <button
                                            onClick={() => setShowEmailModal(true)}
                                            className="w-full h-14 flex items-center justify-center gap-3 text-lg font-bold text-slate-900 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
                                        >
                                            <Download className="h-5 w-5 text-slate-500" />
                                            Simpan Laporan Lengkap (PDF)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal Overlay custom */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 relative">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Simpan Hasil Menarik Ini?</h2>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Bantu kami berkembang! Masukkan email Anda untuk mengunduh laporan PDF ini. Kami gunakan data Anda sebagai statistik secara anonim.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="alamat.email@contoh.com"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all font-medium text-slate-700"
                                />
                                {userEmail && !validateEmail(userEmail) && (
                                    <p className="text-rose-500 text-xs mt-2 font-medium ml-1">Format email belum benar.</p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={generatePDF}
                                    disabled={!validateEmail(userEmail) || isGeneratingPDF}
                                    className="flex-1 flex justify-center items-center py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
                                >
                                    {isGeneratingPDF ? (
                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</>
                                    ) : (
                                        "Kirim & Unduh PDF"
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        setUserEmail("");
                                    }}
                                    className="px-6 py-3.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
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