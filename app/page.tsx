import Link from 'next/link';
import {
  ArrowRight, FileText, Linkedin, BrainCircuit, Compass,
  ArrowUpRight, Mail, Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black">

      {/* Minimal Navbar */}
      <nav className="border-b border-zinc-900 bg-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white flex items-center justify-center rounded-sm">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">CareerAI.</span>
          </div>
          <a
            href="https://pijarteknologi.id/"
            target="_blank"
            className="flex items-center gap-2 text-lg font-bold text-white hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">💡</span> PijarTeknologi
          </a>
        </div>
      </nav>

      <main>
        {/* Clean Hero Section */}
        <section className="pt-12 pb-10 md:pt-16 md:pb-14 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 text-zinc-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            Didukung oleh AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
            Level-Up Karirmu.<br />
            <span className="text-zinc-600">Tanpa Nebak-nebak.</span>
          </h1>

          <p className="text-lg text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Satu platform analitik minimalis. Bedah CV, optimasi LinkedIn, dan temukan potensi aslimu melalui tes kepribadian berbasis data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/career-quiz"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              Coba Tes Karir <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-zinc-800 text-white font-semibold rounded hover:bg-zinc-900 transition-colors"
            >
              Lihat Alat Kami
            </Link>
          </div>
        </section>


        {/* Grid Features - Flat & Clean */}
        <section id="features" className="py-16 md:py-24 max-w-6xl mx-auto px-6">
          <div className="mb-16 md:flex justify-between items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Ekosistem Karir</h2>
              <p className="text-zinc-500 text-lg">Empat alat spesifik yang dirancang secara esensial untuk memenangkan persaingan kerja modern.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

            {/* Feature 1 */}
            <div className="group bg-zinc-950 border border-zinc-900 p-8 hover:border-zinc-700 transition-colors flex flex-col h-full rounded-lg">
              <FileText className="w-8 h-8 text-white mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3">Bedah CV (ATS)</h3>
              <p className="text-zinc-500 mb-8 flex-grow leading-relaxed">
                Evaluasi struktur dan kata kunci resume Anda. Pastikan CV Anda ramah sistem ATS dan memikat rekruter secara instan.
              </p>
              <Link href="/cv-analyzer" className="inline-flex items-center text-sm font-semibold text-white group-hover:text-zinc-300 transition-colors">
                Gunakan Alat <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group bg-zinc-950 border border-zinc-900 p-8 hover:border-zinc-700 transition-colors flex flex-col h-full rounded-lg">
              <Linkedin className="w-8 h-8 text-white mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3">Skor LinkedIn</h3>
              <p className="text-zinc-500 mb-8 flex-grow leading-relaxed">
                Ukur kekuatan profil profesionalmu. Temukan celah perbaikan agar algoritma penelusuran menempatkanmu di barisan depan.
              </p>
              <Link href="/linkedin-analyzer" className="inline-flex items-center text-sm font-semibold text-white group-hover:text-zinc-300 transition-colors">
                Gunakan Alat <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group bg-zinc-950 border border-zinc-900 p-8 hover:border-zinc-700 transition-colors flex flex-col h-full rounded-lg">
              <BrainCircuit className="w-8 h-8 text-white mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3">Tes Kepribadian DISC</h3>
              <p className="text-zinc-500 mb-8 flex-grow leading-relaxed">
                Pahami gaya komunikasi dan cara kerja bawaanmu. Pastikan kamu berada di lingkungan tim yang mendukung potensimu.
              </p>
              <Link href="/disc-ai" className="inline-flex items-center text-sm font-semibold text-white group-hover:text-zinc-300 transition-colors">
                Gunakan Alat <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="group bg-zinc-950 border border-zinc-900 p-8 hover:border-zinc-700 transition-colors flex flex-col h-full rounded-lg relative">
              <Compass className="w-8 h-8 text-white mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3">Career Match Quiz</h3>
              <p className="text-zinc-500 mb-8 flex-grow leading-relaxed">
                Ketahui archetype profesionalmu melalui 18 pertanyaan esensial. Temukan peran spesifik yang paling selaras dengan DNA-mu.
              </p>
              <Link href="/career-quiz" className="inline-flex items-center text-sm font-semibold text-white group-hover:text-zinc-300 transition-colors">
                Gunakan Alat <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

          </div>
        </section>

        {/* Inverse CTA (White Background) */}
        <section className="bg-white py-20 text-center px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-6">Mulai Transformasi Karirmu.</h2>
            <p className="text-zinc-600 text-lg mb-10 max-w-xl mx-auto">
              Tidak perlu registrasi rumit. Seluruh data diproses secara anonim dan cepat langsung di *browser* Anda.
            </p>
            <Link
              href="/cv-analyzer"
              className="inline-flex bg-black text-white font-semibold px-8 py-4 rounded hover:bg-zinc-800 transition-colors"
            >
              Bedah CV Sekarang
            </Link>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="bg-black pt-16 pb-8 border-t border-zinc-900 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <span className="text-2xl font-bold text-white tracking-tight block mb-4">CareerAI.</span>
              <p className="text-zinc-500 text-sm max-w-sm leading-relaxed mb-6">
                Ekosistem analitik karir dari PijarTeknologi. Merancang masa depan profesional Indonesia dengan kecerdasan buatan.
              </p>
              <a href="mailto:contact@pijarteknologi.id" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> contact@pijarteknologi.id
              </a>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Alat</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><Link href="/cv-analyzer" className="hover:text-white transition-colors">CV Analyzer</Link></li>
                <li><Link href="/linkedin-analyzer" className="hover:text-white transition-colors">LinkedIn Score</Link></li>
                <li><Link href="/disc-ai" className="hover:text-white transition-colors">DISC Personality</Link></li>
                <li><Link href="/career-quiz" className="hover:text-white transition-colors">Career Quiz</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">PijarTeknologi</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><a href="https://pijarteknologi.id/" target="_blank" className="hover:text-white transition-colors">Website</a></li>
                <li><a href="https://www.linkedin.com/company/pijar-teknologi-indonesia/" target="_blank" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="https://www.instagram.com/pijarteknologi.id/" target="_blank" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900 text-zinc-600 text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} PijarTeknologi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}