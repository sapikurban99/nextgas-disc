import Link from 'next/link';
import { ArrowRight, Users, Target, MessageCircle, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">

      {/* Navbar Sederhana */}
      <nav className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="font-bold text-xl tracking-tight text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-amber-500 shrink-0">
            <path fill="currentColor" fillRule="evenodd" d="m14.856 15.686l-.1.25a8.7 8.7 0 0 1-5.512 0l-.1-.25c-.095-.23-.143-.346-.226-.452c-.082-.107-.226-.215-.514-.43a6 6 0 1 1 7.192 0c-.288.215-.432.323-.514.43s-.13.221-.226.452m-5.006 2.48q.13.792.148 1.598a.39.39 0 0 0 .213.342a4 4 0 0 0 3.578 0a.39.39 0 0 0 .213-.342q.018-.806.148-1.598a10.7 10.7 0 0 1-4.3 0" clipRule="evenodd" />
          </svg>
          Neural<span className="text-slate-400">DISC</span>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full uppercase tracking-wider">
          PijarTeknologi
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 leading-tight">
            Pahami Gayamu, <br className="hidden md:block" />
            <span className="text-slate-500">Perkuat Kolaborasi Tim.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Tes DISC ini dirancang khusus untuk memetakan gaya komunikasi, cara pengambilan keputusan, dan respons kamu terhadap tantangan. Mari ciptakan lingkungan kerja yang lebih produktif dan minim miskomunikasi.
          </p>

          <div className="pt-8 flex justify-center">
            <Link
              href="/disc-ai"
              className="group flex items-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-all active:scale-95 shadow-md focus:ring-4 focus:ring-amber-200"
            >
              Mulai Tes Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="text-sm text-slate-400 mt-4">Hanya butuh waktu ±3 menit • Didukung oleh AI</p>
        </div>

        {/* 4 Tipe DISC Section */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-3">Mengenal 4 Pilar Kepribadian</h2>
            <p className="text-slate-500">Kita semua memiliki kombinasi unik dari keempat tipe ini.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* D */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">Dominance <span className="text-slate-400 text-sm font-normal">(Dominan)</span></h3>
              <p className="text-slate-600 leading-relaxed">Fokus pada hasil, tegas, dan cepat mengambil keputusan. Mereka adalah eksekutor yang berorientasi pada tujuan besar.</p>
            </div>

            {/* I */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">Influence <span className="text-slate-400 text-sm font-normal">(Intim)</span></h3>
              <p className="text-slate-600 leading-relaxed">Antusias, persuasif, dan komunikator ulung. Mereka membangun jejaring dan memotivasi tim dengan energi positif.</p>
            </div>

            {/* S */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">Steadiness <span className="text-slate-400 text-sm font-normal">(Stabil)</span></h3>
              <p className="text-slate-600 leading-relaxed">Penyabar, pendengar yang baik, dan penjaga harmoni. Mereka adalah tulang punggung tim yang dapat diandalkan.</p>
            </div>

            {/* C */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">Compliance <span className="text-slate-400 text-sm font-normal">(Cermat)</span></h3>
              <p className="text-slate-600 leading-relaxed">Analitis, detail, dan sistematis. Mereka memastikan kualitas tertinggi dan meminimalisir risiko melalui data.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-slate-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center justify-center text-center text-slate-500 text-sm gap-4">
          <div>
            <p>
              &copy; 2026{' '}
              <a href="https://pijarteknologi.id/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors font-medium">
                PijarTeknologi. Platform AI Automation Training & Managed Service.
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <a href="mailto:contact@pijarteknologi.id" className="hover:text-amber-600 transition-colors">contact@pijarteknologi.id</a>
            <span className="text-slate-300">•</span>
            <a href="https://www.linkedin.com/company/pijar-teknologi-indonesia/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">LinkedIn</a>
            <span className="text-slate-300">•</span>
            <a href="https://www.instagram.com/pijarteknologi.id/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">Instagram</a>
            <span className="text-slate-300">•</span>
            <a href="https://www.tiktok.com/@pijarteknologi.id" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">TikTok</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
