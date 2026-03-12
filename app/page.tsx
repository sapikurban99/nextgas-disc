'use client';

import Link from 'next/link';
import {
  ArrowRight, FileText, Linkedin, BrainCircuit, Compass,
  ArrowUpRight, Mail, Sparkles
} from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen theme-page font-sans" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)' }}>

      {/* Minimal Navbar */}
      <nav className="border-b theme-nav sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-nav)', borderColor: 'var(--border-primary)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-sm" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--text-inverse)' }} />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>CareerAI.</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="https://pijarteknologi.id/"
              target="_blank"
              className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="text-2xl">💡</span> PijarTeknologi
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* Clean Hero Section */}
        <section className="pt-12 pb-10 md:pt-16 md:pb-14 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-8 theme-badge" style={{ backgroundColor: 'var(--badge-bg)', borderColor: 'var(--badge-border)', color: 'var(--badge-text)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--badge-dot)' }}></span>
            Didukung oleh AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6" style={{ color: 'var(--text-primary)' }}>
            Level-Up Karirmu.<br />
            <span style={{ color: 'var(--text-muted)' }}>Tanpa Nebak-nebak.</span>
          </h1>

          <p className="text-lg mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Satu platform analitik minimalis. Bedah CV, optimasi LinkedIn, dan temukan potensi aslimu melalui tes kepribadian berbasis data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/career-quiz"
              className="w-full sm:w-auto px-8 py-3.5 font-semibold rounded transition-colors flex items-center justify-center gap-2 theme-btn-primary"
              style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-inverse)' }}
            >
              Coba Tes Karir <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 border font-semibold rounded transition-colors theme-btn-secondary"
              style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
            >
              Lihat Alat Kami
            </Link>
          </div>
        </section>


        {/* Grid Features - Flat & Clean */}
        <section id="features" className="py-16 md:py-24 max-w-6xl mx-auto px-6">
          <div className="mb-16 md:flex justify-between items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>Ekosistem Karir</h2>
              <p style={{ color: 'var(--text-muted)' }} className="text-lg">Empat alat spesifik yang dirancang secara esensial untuk memenangkan persaingan kerja modern.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

            {/* Feature 1 */}
            <div className="group border p-8 transition-colors flex flex-col h-full rounded-lg theme-card theme-card-hover" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <FileText className="w-8 h-8 mb-6" style={{ color: 'var(--text-primary)' }} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Bedah CV (ATS)</h3>
              <p className="mb-8 flex-grow leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Evaluasi struktur dan kata kunci resume Anda. Pastikan CV Anda ramah sistem ATS dan memikat rekruter secara instan.
              </p>
              <Link href="/cv-analyzer" className="inline-flex items-center text-sm font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                Gunakan Alat <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group border p-8 transition-colors flex flex-col h-full rounded-lg theme-card theme-card-hover" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <Linkedin className="w-8 h-8 mb-6" style={{ color: 'var(--text-primary)' }} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Skor LinkedIn</h3>
              <p className="mb-8 flex-grow leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Ukur kekuatan profil profesionalmu. Temukan celah perbaikan agar algoritma penelusuran menempatkanmu di barisan depan.
              </p>
              <Link href="/linkedin-analyzer" className="inline-flex items-center text-sm font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                Gunakan Alat <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group border p-8 transition-colors flex flex-col h-full rounded-lg theme-card theme-card-hover" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <BrainCircuit className="w-8 h-8 mb-6" style={{ color: 'var(--text-primary)' }} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Tes Kepribadian DISC</h3>
              <p className="mb-8 flex-grow leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Pahami gaya komunikasi dan cara kerja bawaanmu. Pastikan kamu berada di lingkungan tim yang mendukung potensimu.
              </p>
              <Link href="/disc-ai" className="inline-flex items-center text-sm font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                Gunakan Alat <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="group border p-8 transition-colors flex flex-col h-full rounded-lg relative theme-card theme-card-hover" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <Compass className="w-8 h-8 mb-6" style={{ color: 'var(--text-primary)' }} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Career Match Quiz</h3>
              <p className="mb-8 flex-grow leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Ketahui archetype profesionalmu melalui 18 pertanyaan esensial. Temukan peran spesifik yang paling selaras dengan DNA-mu.
              </p>
              <Link href="/career-quiz" className="inline-flex items-center text-sm font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                Gunakan Alat <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

          </div>
        </section>

        {/* Inverse CTA */}
        <section className="py-20 text-center px-6" style={{ backgroundColor: 'var(--cta-section-bg)', color: 'var(--cta-section-text)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Mulai Transformasi Karirmu.</h2>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--cta-section-muted)' }}>
              Tidak perlu registrasi rumit. Seluruh data diproses secara anonim dan cepat langsung di *browser* Anda.
            </p>
            <Link
              href="/cv-analyzer"
              className="inline-flex font-semibold px-8 py-4 rounded transition-colors"
              style={{ backgroundColor: 'var(--cta-section-btn-bg)', color: 'var(--cta-section-btn-text)' }}
            >
              Bedah CV Sekarang
            </Link>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="pt-16 pb-8 border-t px-6" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <span className="text-2xl font-bold tracking-tight block mb-4" style={{ color: 'var(--text-primary)' }}>CareerAI.</span>
              <p className="text-sm max-w-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                Ekosistem analitik karir dari PijarTeknologi. Merancang masa depan profesional Indonesia dengan kecerdasan buatan.
              </p>
              <a href="mailto:contact@pijarteknologi.id" className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                <Mail className="w-4 h-4" /> contact@pijarteknologi.id
              </a>
            </div>

            <div>
              <h4 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Alat</h4>
              <ul className="space-y-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><Link href="/cv-analyzer" className="hover:opacity-80 transition-opacity">CV Analyzer</Link></li>
                <li><Link href="/linkedin-analyzer" className="hover:opacity-80 transition-opacity">LinkedIn Score</Link></li>
                <li><Link href="/disc-ai" className="hover:opacity-80 transition-opacity">DISC Personality</Link></li>
                <li><Link href="/career-quiz" className="hover:opacity-80 transition-opacity">Career Quiz</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>PijarTeknologi</h4>
              <ul className="space-y-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><a href="https://pijarteknologi.id/" target="_blank" className="hover:opacity-80 transition-opacity">Website</a></li>
                <li><a href="https://www.linkedin.com/company/pijar-teknologi-indonesia/" target="_blank" className="hover:opacity-80 transition-opacity">LinkedIn</a></li>
                <li><a href="https://www.instagram.com/pijarteknologi.id/" target="_blank" className="hover:opacity-80 transition-opacity">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-sm flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
            <p>© {new Date().getFullYear()} PijarTeknologi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}