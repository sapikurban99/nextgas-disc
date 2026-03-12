'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, BrainCircuit, RefreshCw, ChevronRight, FileDown, RotateCcw, Users, Loader2, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

// Helper to shuffle arrays
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Fallback questions to ensure app loads even if GAS is unconfigured
const FALLBACK_QUESTIONS = [
  {
    q: "Saat menghadapi krisis atau masalah mendesak di tempat kerja, insting pertama saya adalah...",
    opts: [
      { t: "Langsung mengambil kendali, membuat keputusan cepat, dan bertindak.", k: "D" },
      { t: "Mengumpulkan data, menganalisa akar masalah, dan mengevaluasi risiko secara logis.", k: "C" },
      { t: "Menenangkan suasana, memastikan tim tetap solid, dan mencari solusi bersama.", k: "S" },
      { t: "Mencairkan ketegangan, mengajak tim berdiskusi, dan mencari ide-ide kreatif.", k: "I" }
    ]
  },
  {
    q: "Dalam sebuah project tim, peran yang paling membuat saya bersinar adalah...",
    opts: [
      { t: "Penggagas ide dan motivator yang menjaga energi tim tetap tinggi.", k: "I" },
      { t: "Eksekutor yang handal, menjaga harmoni, dan memastikan tugas selesai tepat waktu.", k: "S" },
      { t: "Quality Control yang memastikan semua detail akurat dan sesuai standar.", k: "C" },
      { t: "Pemimpin yang menetapkan target, mendelegasikan tugas, dan mendorong hasil.", k: "D" }
    ]
  },
  {
    q: "Jika ada perubahan rencana mendadak dari manajemen, reaksi saya biasanya...",
    opts: [
      { t: "Merasa kurang nyaman, saya butuh waktu untuk mencerna dan menyesuaikan ritme.", k: "S" },
      { t: "Melihatnya sebagai tantangan baru yang menarik dan langsung tancap gas.", k: "D" },
      { t: "Meminta penjelasan tertulis atau alasan logis di balik perubahan tersebut.", k: "C" },
      { t: "Mencoba mencari sisi positifnya dan meyakinkan rekan lain agar tidak panik.", k: "I" }
    ]
  },
  {
    q: "Gaya komunikasi saya sehari-hari paling pas dideskripsikan sebagai...",
    opts: [
      { t: "Spesifik, berbasis fakta, berhati-hati, dan tertulis (email/chat panjang).", k: "C" },
      { t: "Singkat, padat, to the point, dan berorientasi pada tujuan.", k: "D" },
      { t: "Hangat, ekspresif, banyak bercerita, dan antusias.", k: "I" },
      { t: "Tenang, menjadi pendengar yang baik, suportif, dan ramah.", k: "S" }
    ]
  }
];

type Question = {
  q: string;
  opts: { k: string; t: string }[];
};

type Answer = {
  q: string;
  answer: string;
  key: string;
};

type Scores = {
  D: number;
  I: number;
  S: number;
  C: number;
  [key: string]: number;
};

type ViewState = 'landing' | 'assessment' | 'analyzing' | 'result';

export default function DiscApp() {
  const [view, setView] = useState<ViewState>('landing');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [scores, setScores] = useState<Scores>({ D: 0, I: 0, S: 0, C: 0 });
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);

  // 1. Fetch Dynamic Questions dari GAS
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!process.env.NEXT_PUBLIC_GAS_URL) {
        setQuestions(FALLBACK_QUESTIONS);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_GAS_URL}?action=getQuestions`);
        const data = await res.json();

        let loadedQs: Question[] = data && data.questions && data.questions.length > 0 ? data.questions : FALLBACK_QUESTIONS;

        // Randomize Questions & Options
        loadedQs = shuffleArray(loadedQs).map((q) => ({
          ...q,
          opts: shuffleArray(q.opts)
        }));

        setQuestions(loadedQs);

      } catch (err) {
        console.error("Failed to load questions from GAS. Using fallbacks.", err);
        const randomizedFallbacks = shuffleArray(FALLBACK_QUESTIONS).map((q) => ({
          ...q,
          opts: shuffleArray(q.opts)
        }));
        setQuestions(randomizedFallbacks);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleStart = () => {
    if (name.trim()) setView('assessment');
  };

  const handleAnswer = (key: string, text: string) => {
    const newAnswers = [...answers, { q: questions[step].q, answer: text, key }];
    setAnswers(newAnswers);

    const newScores = { ...scores, [key]: scores[key] + 1 };
    setScores(newScores);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitAssessment(newAnswers, newScores);
    }
  };

  const submitAssessment = async (finalAnswers: Answer[], finalScores: Scores) => {
    // 1. Send Backup to GAS (Fire & Forget) immediately
    const payload = {
      action: 'analyze',
      name: name,
      scores: finalScores,
      answers: finalAnswers
    };

    if (process.env.NEXT_PUBLIC_GAS_URL) {
      fetch(process.env.NEXT_PUBLIC_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(console.error);
    }

    // Instantly go to result view without waiting for AI
    setView('result');
  };

  const fetchAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiProgress(0);

    // Animate progress bar simulating AI thinking time
    const progressInterval = setInterval(() => {
      setAiProgress(prev => {
        const increment = prev < 60 ? 8 : prev < 85 ? 3 : 0.5;
        const next = prev + increment;
        return next > 95 ? 95 : next;
      });
    }, 400);

    const payload = {
      action: 'analyze',
      name: name,
      scores: scores,
      answers: answers
    };

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        clearInterval(progressInterval);
        setAiProgress(100);
        // If the server didn't configure the webhook, show the preview fallback instead of an error
        if (data.error === "Webhook URL not configured on server") {
          await new Promise(r => setTimeout(r, 1000));
          const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
          setAiAnalysis(`### Anda adalah seorang **${dominant}** yang dominan.\n\n*Ini adalah respons pratinjau karena URL webhook n8n tidak tersedia di backend.*`);
          setIsAiLoading(false);
          return;
        }
        throw new Error(data.error || "Gagal menghubungi server AI");
      }

      // Deteksi jika N8N me-return message default "Workflow was started/Workflow got started"
      if (data.message && typeof data.message === 'string' && data.message.toLowerCase().includes('workflow')) {
        throw new Error("N8N Webhook memberi respons instan sebelum AI selesai berpikir. Di N8N Anda, klik node Webhook, ganti pengaturan 'Respond' menjadi 'Using Respond to Webhook Node'.");
      }

      let analysisText = "";
      if (Array.isArray(data) && data.length > 0 && data[0]?.output) {
        analysisText = data[0].output;
      } else if (data?.ai_analysis) {
        analysisText = data.ai_analysis;
      } else if (data?.output) {
        analysisText = data.output;
      }

      // Fix markdown line breaks so react-markdown renders them properly (double spaces before newline = hard break in Markdown)
      if (analysisText) {
        analysisText = analysisText.replace(/\n/g, '  \n');
      }

      clearInterval(progressInterval);
      setAiProgress(100);

      setAiAnalysis(analysisText || `Respons AI tidak dikenali. Output N8N: ${JSON.stringify(data).substring(0, 50)}...`);
    } catch (e: unknown) {
      clearInterval(progressInterval);
      setAiProgress(100);
      console.error("Network error to n8n proxy:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setAiAnalysis(`**Gagal Menghubungi N8N:**\n${errorMessage}`);
    }

    setTimeout(() => {
      setIsAiLoading(false);
    }, 500); // Give user time to see 100% completion before replacing view
  };

  const getDominantTrait = () => {
    const traits = {
      D: { id: 'D', name: 'Dominance', id_name: 'Dominan', desc: 'Pemimpin yang berorientasi pada target dan hasil nyata.', emoji: '🔥', color: 'text-rose-400', barBg: 'bg-rose-500' },
      I: { id: 'I', name: 'Influence', id_name: 'Intim', desc: 'Komunikator yang ekspresif, antusias, dan membangun jaringan.', emoji: '🌟', color: 'text-amber-400', barBg: 'bg-amber-500' },
      S: { id: 'S', name: 'Steadiness', id_name: 'Stabil', desc: 'Pemain tim yang sabar, dapat diandalkan, dan menjaga harmoni.', emoji: '🌱', color: 'text-emerald-400', barBg: 'bg-emerald-500' },
      C: { id: 'C', name: 'Compliance', id_name: 'Cermat', desc: 'Pemikir analitis yang fokus pada detail, data, dan kualitas.', emoji: '⚙️', color: 'text-sky-400', barBg: 'bg-sky-500' }
    };
    const maxKey = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b) as keyof typeof traits;
    return traits[maxKey];
  };

  const getCommunicationMatrix = (dom: string) => {
    if (dom === 'D') return [
      { to: 'Sesama D (Dominan)', tip: 'Langsung pada intinya. Fokus pada target dan hasil. Berikan mereka ruang untuk memimpin.' },
      { to: 'Rekan I (Influence)', tip: 'Sediakan waktu untuk ngobrol sebentar sebelum masuk materi. Puji kontribusi ide kreatif mereka.' },
      { to: 'Rekan S (Stabil)', tip: 'Jangan terlalu mendesak. Jelaskan instruksi dengan tenang dan pastikan mereka merasa didukung.' },
      { to: 'Rekan C (Cermat)', tip: 'Siapkan data dan alasan logis. Jangan minta keputusan instan tanpa memberikan mereka waktu menganalisa.' }
    ];
    if (dom === 'I') return [
      { to: 'Rekan D (Dominan)', tip: 'Kurangi basa-basi. Bicara dengan poin yang jelas dan sebutkan benefit dari ide Anda.' },
      { to: 'Sesama I (Influence)', tip: 'Gunakan energi positif, tapi pastikan diskusi tetap pada jalurnya agar target pekerjaan tercapai.' },
      { to: 'Rekan S (Stabil)', tip: 'Tanya kabar mereka dengan tulus. Hindari perubahan rencana mendadak yang membuat mereka panik.' },
      { to: 'Rekan C (Cermat)', tip: 'Kirimkan email tertulis atau rangkuman data selain sekadar bicara lisan. Mereka menghargai dokumentasi.' }
    ];
    if (dom === 'S') return [
      { to: 'Rekan D (Dominan)', tip: 'Beranikan diri bicara tegas. Jangan ragu memberikan batasan jika beban kerja tidak wajar.' },
      { to: 'Rekan I (Influence)', tip: 'Dengarkan cerita mereka antusias, lalu perlahan arahkan kembali pada tugas yang harus diselesaikan.' },
      { to: 'Sesama S (Stabil)', tip: 'Saling dukung. Kolaborasi akan terasa menyenangkan karena visi yang sama mengenai keharmonisan.' },
      { to: 'Rekan C (Cermat)', tip: 'Fokus pada standar dan ekspektasi. Hindari menutupi masalah demi keharmonisan; bicarakan faktanya.' }
    ];
    if (dom === 'C') return [
      { to: 'Rekan D (Dominan)', tip: 'Berikan ringkasan eksekutif. Anda tidak perlu mempresentasikan semua raw data kepada mereka.' },
      { to: 'Rekan I (Influence)', tip: 'Coba lebih hangat dan tersenyum. Jangan terlalu kaku atau langsung memberikan kritik tajam ke idenya.' },
      { to: 'Rekan S (Stabil)', tip: 'Jelaskan prosedur secara bertahap. Yakinkan bahwa sistem yang Anda buat aman untuk dijalankan.' },
      { to: 'Sesama C (Cermat)', tip: 'Saling review pekerjaan. Hati-hati jangan sampai terjebak dalam "analysis paralysis" berlebihan.' }
    ];
    return [];
  };

  const calculatePercentage = (val: number) => {
    const total = questions.length;
    return total === 0 ? 0 : Math.round((val / total) * 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetTest = () => {
    setStep(0);
    setAnswers([]);
    setScores({ D: 0, I: 0, S: 0, C: 0 });
    setAiAnalysis('');
    setView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500">
        <RefreshCw className="w-10 h-10 animate-spin mb-4 text-zinc-600" />
        <p className="tracking-widest uppercase text-sm font-semibold">Menyiapkan Asesmen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans p-4 sm:p-8 overflow-x-hidden">
      <main className="max-w-3xl mx-auto min-h-[85vh] flex flex-col justify-center relative">
        <AnimatePresence mode="wait">

          {/* LANDING VIEW */}
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-zinc-950 rounded-lg p-8 sm:p-14 text-center border border-zinc-900 relative"
            >
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
                <Link href="/" className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </Link>
              </div>
              <div className="inline-flex p-4 bg-zinc-900 rounded-lg text-white mb-8 mt-4 sm:mt-0 border border-zinc-800">
                <Users className="w-10 h-10" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Asesmen Kepribadian Tim
              </h1>
              <p className="text-zinc-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                Pahami kecenderungan komunikasimu (DISC) untuk menciptakan kolaborasi dan empati yang lebih baik di tempat kerja.
              </p>

              <div className="space-y-4 max-w-sm mx-auto">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  placeholder="Masukkan nama lengkap Anda..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-4 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700 transition-all text-center text-lg placeholder:text-zinc-600 text-white"
                />
                <button
                  onClick={handleStart}
                  disabled={!name.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mulai Asesmen <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ASSESSMENT VIEW */}
          {view === 'assessment' && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="w-full"
            >
              {/* Progress Bar */}
              <div className="mb-10 lg:mb-12">
                <div className="flex justify-between text-xs text-zinc-500 mb-3 uppercase tracking-widest font-semibold">
                  <span>Pertanyaan {step + 1} dari {questions.length}</span>
                  <span>{Math.round(((step) / questions.length) * 100)}% Selesai</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((step) / questions.length) * 100}%` }}
                    className="h-full bg-white"
                  />
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-950 rounded-lg p-6 sm:p-10 lg:p-12 border border-zinc-900"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold mb-10 leading-snug text-white">
                    {questions[step].q}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {questions[step].opts.map((opt: { k: string, t: string }, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt.k, opt.t)}
                        className="text-left p-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition-colors active:scale-[0.99] group flex items-start gap-4"
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-zinc-700 group-hover:border-zinc-400 shrink-0 mt-0.5 flex items-center justify-center transition-colors">
                          <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-zinc-400 font-medium leading-relaxed group-hover:text-white">{opt.t}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}



          {/* RESULT VIEW */}
          {view === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6 print:space-y-4"
            >
              {/* Header / Badge */}
              <div className="bg-zinc-950 rounded-lg p-8 sm:p-10 text-center relative overflow-hidden border border-zinc-900 print:border-zinc-700">
                <h2 className="text-zinc-500 text-sm tracking-widest uppercase font-bold mb-3">Tipe Dominan</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                  <span className="text-5xl">{getDominantTrait().emoji}</span>
                  <h1 className={`text-4xl sm:text-5xl font-extrabold ${getDominantTrait().color} print:text-zinc-100`}>
                    {getDominantTrait().name} ({getDominantTrait().id_name})
                  </h1>
                </div>
                <p className="text-zinc-500 text-lg mb-4 font-medium max-w-xl mx-auto">{getDominantTrait().desc}</p>
                <p className="text-zinc-600 text-sm">Laporan disiapkan untuk: <span className="font-bold text-white">{name}</span></p>
              </div>

              {/* Chart & AI Insight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:flex print:flex-col">
                {/* Bar Chart */}
                <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-900 print:border-zinc-700">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                    <BrainCircuit className="w-5 h-5 text-zinc-500" /> Distribusi Sifat
                  </h3>
                  <div className="space-y-6">
                    {['D', 'I', 'S', 'C'].map(trait => (
                      <div key={trait}>
                        <div className="flex justify-between text-sm font-bold mb-2 text-zinc-300">
                          <span>{trait === 'D' ? 'Dominan' : trait === 'I' ? 'Influence' : trait === 'S' ? 'Stabil' : 'Cermat'} ({trait})</span>
                          <span>{calculatePercentage(scores[trait])}%</span>
                        </div>
                        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${calculatePercentage(scores[trait])}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${trait === 'D' ? 'bg-rose-500' : trait === 'I' ? 'bg-amber-500' : trait === 'S' ? 'bg-emerald-500' : 'bg-sky-500'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insight Section */}
                <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-900 print:border-zinc-700 flex flex-col justify-center min-h-[300px]">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-zinc-500" /> Analisa Personal AI
                  </h3>

                  {!aiAnalysis && !isAiLoading ? (
                    <div className="flex flex-col items-center justify-center text-center h-full gap-4">
                      <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-2 border border-zinc-800">
                        <Bot className="w-8 h-8 text-zinc-500" />
                      </div>
                      <p className="text-zinc-500 text-sm mb-2">
                        Dapatkan wawasan mendalam tentang profil kepribadian Anda yang dikurasi khusus oleh Neural Engine AI.
                      </p>
                      <button
                        onClick={fetchAiAnalysis}
                        className="bg-white hover:bg-zinc-200 text-black font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                      >
                        Generate Analisa AI <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : isAiLoading ? (
                    <div className="flex flex-col items-center justify-center text-center h-full gap-4 w-full">
                      <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 relative border border-zinc-800">
                        <Bot className="w-8 h-8 text-zinc-500 absolute" />
                        <svg className="animate-spin text-white w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-white">Menyusun Laporan Personal...</h4>
                      <p className="text-sm text-zinc-500 max-w-xs mb-2">Neural Engine AI sedang memproses pola jawaban asesmen Anda.</p>

                      <div className="w-full max-w-xs bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(aiProgress)}%` }}
                          className="bg-white h-2.5 rounded-full"
                          transition={{ duration: 0.1, ease: 'linear' }}
                        ></motion.div>
                      </div>
                      <span className="text-xs font-bold text-zinc-600">{Math.round(aiProgress)}% Selesai</span>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-zinc-400 leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION A - Memahami 4 Tipe DISC */}
              <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-900 print:border-zinc-700 print:break-inside-avoid">
                <h3 className="text-xl font-bold mb-6 text-white border-b border-zinc-800 pb-4">A. Memahami 4 Tipe DISC di Tim Anda</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-rose-950/30 rounded-lg border border-rose-900/50">
                    <h4 className="font-bold text-rose-400 mb-1 flex items-center gap-2">🔥 (D) Dominan</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">Eksekutor yang cepat, orientasi pada hasil, dan penyuka tantangan. Terkadang bisa terlihat mendikte.</p>
                  </div>
                  <div className="p-4 bg-amber-950/30 rounded-lg border border-amber-900/50">
                    <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-2">🌟 (I) Influence</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">Komunikator ulung, optimis, dan persuasif. Sangat sosial namun terkadang kurang rapi secara mendetail.</p>
                  </div>
                  <div className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-900/50">
                    <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-2">🌱 (S) Stabil</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">Konsisten, pendengar yang baik, penjaga harmoni. Sangat loyal namun butuh waktu adaptasi terhadap perubahan.</p>
                  </div>
                  <div className="p-4 bg-sky-950/30 rounded-lg border border-sky-900/50">
                    <h4 className="font-bold text-sky-400 mb-1 flex items-center gap-2">⚙️ (C) Cermat</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">Akurat, analitis, dan berorientasi pada data dan aturan. Sempurna dalam Quality Control namun bisa terlalu kritis.</p>
                  </div>
                </div>
              </div>

              {/* SECTION B - Matrix Komunikasi Tim */}
              <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-900 print:border-zinc-700 print:break-inside-avoid">
                <h3 className="text-xl font-bold mb-2 text-white">B. Panduan Komunikasi Kolaborasi</h3>
                <p className="text-zinc-500 mb-6 text-sm border-b border-zinc-800 pb-4">Sebagai seorang <span className="font-bold text-white">{getDominantTrait().id_name}</span>, begini cara terbaik berkomunikasi dengan rekan setim Anda:</p>

                <div className="space-y-4">
                  {getCommunicationMatrix(getDominantTrait().id).map((mat, i) => (
                    <div key={i} className="p-5 rounded-lg border border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row gap-2 sm:gap-6">
                      <h4 className="font-bold text-white w-full sm:w-1/3 shrink-0 flex items-center">
                        <ChevronRight className="w-4 h-4 text-zinc-600 mr-1" /> Ke {mat.to}
                      </h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">{mat.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions (Hidden in Print) */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-12 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-300 font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <FileDown className="w-5 h-5" /> Download PDF/Print
                </button>
                <button
                  onClick={resetTest}
                  className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> Ulangi Tes
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
