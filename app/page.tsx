import Link from 'next/link';
import { ArrowRight, FileText, Linkedin, BrainCircuit, Sparkles, Target } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">

      {/* Navbar Sederhana */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="font-bold text-xl tracking-tight text-slate-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          Career<span className="text-slate-400">AI</span>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
          PijarTeknologi
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 leading-tight">
            Pahami Potensimu, <br className="hidden md:block" />
            <span className="text-slate-500">Akselerasi Karirmu.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Satu platform cerdas bertenaga AI untuk menganalisis kekuatan CV Anda, mengoptimalkan profil LinkedIn, dan memetakan kepribadian profesional Anda.
          </p>
        </div>

        {/* 3 Main Features Section */}
        <div className="mt-20">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

            {/* Fitur 1: CV Analyzer */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">CV & Resume Analyzer</h3>
              <p className="text-slate-600 leading-relaxed mb-8 flex-grow">
                Evaluasi struktur, kata kunci, dan dampak resume Anda. Pastikan CV Anda ramah ATS (Applicant Tracking System) dan memikat para rekruter.
              </p>
              <Link
                href="/cv-analyzer"
                className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700 transition-colors group/link"
              >
                Coba CV Analyzer
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Fitur 2: LinkedIn Analyzer */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Linkedin size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">LinkedIn Performance</h3>
              <p className="text-slate-600 leading-relaxed mb-8 flex-grow">
                Ukur kekuatan profil LinkedIn Anda berdasarkan standar industri. Dapatkan insight untuk meningkatkan visibilitas dan jejaring profesional.
              </p>
              <Link
                href="/linkedin-analyzer"
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors group/link"
              >
                Analisis LinkedIn
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Fitur 3: DISC AI */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col h-full group relative overflow-hidden">
              {/* Badge Populer */}
              <div className="absolute top-6 right-6 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                Populer
              </div>
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">DISC Personality AI</h3>
              <p className="text-slate-600 leading-relaxed mb-8 flex-grow">
                Kenali gaya komunikasi dominanmu. Pahami caramu mengambil keputusan, merespons tantangan, dan berkolaborasi dalam tim.
              </p>
              <Link
                href="/disc-ai"
                className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors group/link"
              >
                Mulai Tes Kepribadian
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

        {/* Call to Action Bawah */}
        <div className="mt-24 bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5">
            <Target size={200} />
          </div>
          <h2 className="text-3xl font-bold mb-4 relative z-10">Siap menemukan versi terbaik dirimu?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto relative z-10">
            Seluruh data diproses secara aman menggunakan AI canggih dan disimpan rapi di sistem Google Apps Script. Tidak perlu login, 100% gratis.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link href="/cv-analyzer" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
              Mulai dari CV
            </Link>
            <Link href="/disc-ai" className="bg-slate-800 text-white border border-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
              Coba Tes DISC
            </Link>
          </div>
        </div>

      </main>

      <footer className="w-full border-t border-slate-200 mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm gap-4">
          <div>
            <p>
              &copy; 2026{' '}
              <a href="https://pijarteknologi.id/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors font-medium text-slate-700">
                PijarTeknologi
              </a>
              . AI Automation Training & Managed Service.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="mailto:contact@pijarteknologi.id" className="hover:text-blue-600 transition-colors">contact@pijarteknologi.id</a>
            <a href="https://www.linkedin.com/company/pijar-teknologi-indonesia/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">LinkedIn</a>
            <a href="https://www.instagram.com/pijarteknologi.id/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Instagram</a>
          </div>
        </div>
      </footer>

    </div>
  );
}