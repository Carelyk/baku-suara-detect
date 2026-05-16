import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, BookOpen, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slideIcons = ['📖', '✍️', '🎯', '📚', '🔤', '📝', '📐', '🌟', '🏆'];

const slides = [
  {
    title: 'Pengertian Bahasa Formal/Baku',
    content:
      'Bahasa formal/baku adalah bahasa Indonesia yang digunakan secara resmi, sopan, dan sesuai kaidah kebahasaan. Bahasa formal/baku biasanya digunakan dalam situasi resmi dan akademik, seperti di sekolah, saat berbicara dengan guru, presentasi, dan menulis tugas.',
  },
  {
    title: 'Ciri-Ciri Bahasa Formal/Baku',
    content:
      '1. Menggunakan kata baku dan tidak menggunakan bahasa gaul atau bahasa daerah\n2. Kalimat tersusun jelas dan lengkap\n3. Menggunakan bahasa yang sopan\n4. Sesuai dengan konteks dan situasi',
  },
  {
    title: 'Contoh Bahasa Tidak Formal dan Formal',
    content:
      'Contoh Bahasa Tidak Formal / Tidak Baku\n1. Aku gak ngerti loh pelajaran ini\n2. Bu, aku capek banget deh\n3. Aku mah belum siap\n4. Jelasin lagi dong, Bu\n\nContoh Bahasa Formal / Baku\n1. Saya belum memahami pelajaran ini\n2. Ibu, saya merasa lelah hari ini\n3. Saya belum siap\n4. Tolong jelaskan kembali, Bu',
  },
  {
    title: 'Pentingnya Menggunakan Bahasa Formal/Baku',
    content:
      '1. Menunjukkan sikap sopan dan hormat\n2. Membantu menyampaikan gagasan dengan jelas\n3. Membiasakan berbahasa Indonesia yang baik dan benar\n4. Mendukung keberhasilan belajar di sekolah',
  },
  {
    title: 'Pengertian Teks Pidato',
    content:
      'Teks pidato adalah naskah atau tulisan yang berisi gagasan, pendapat, atau pesan yang akan disampaikan di depan banyak orang. Pidato dilakukan secara lisan dengan tujuan tertentu, misalnya untuk memberikan informasi atau ajakan.',
  },
  {
    title: 'Tujuan Teks Pidato',
    content:
      '1. Memberikan informasi\n2. Memberikan apresiasi\n3. Menyampaikan pendapat\n4. Memberikan ajakan',
  },
  {
    title: 'Struktur Teks Pidato',
    content:
      '1. Pembukaan\nBerisi: salam pembuka, sapaan, ucapan syukur\n\n2. Isi\nBerisi: penjelasan tentang topik, informasi atau ajakan\n\n3. Penutup\nBerisi: kesimpulan, harapan, salam penutup',
  },
  {
    title: 'Syarat Pidato',
    content:
      '1. Menggunakan Bahasa Indonesia yang baik dan benar\n2. Suara jelas dan lantang\n3. Tidak terlalu cepat\n4. Menggunakan sikap tubuh yang sopan\n5. Tidak menggunakan campur kode',
  },
  {
    title: 'Contoh Teks Pidato',
    content:
      'Tema: Menjaga Kebersihan Sekolah\n\nAssalamu’alaikum warahmatullahi wabarakatuh.\nYang saya hormati Bapak/Ibu guru dan teman-teman yang saya banggakan.\n\nTeman-teman, kebersihan sekolah sangat penting. Sekolah yang bersih membuat kita sehat dan nyaman belajar. Oleh karena itu, mari kita membuang sampah pada tempatnya dan menjaga kebersihan kelas.\n\nDemikian pidato yang dapat saya sampaikan. Terima kasih.\nWassalamu’alaikum warahmatullahi wabarakatuh.',
  },
];

const Materi = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const isLastSlide = currentSlide === slides.length - 1;

  const goNext = () => {
    if (isLastSlide) {
      navigate('/');
    } else {
      setDirection('next');
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setDirection('prev');
      setCurrentSlide(currentSlide - 1);
    }
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[hsl(30,40%,88%)] via-[hsl(35,35%,92%)] to-[hsl(40,40%,86%)]"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, hsl(30,40%,75%) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(40,40%,75%) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 flex items-center gap-3 border-b border-[hsl(30,30%,75%)] bg-[hsl(40,40%,94%)]/80 p-3 backdrop-blur-sm sm:p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="shrink-0 rounded-xl hover:bg-[hsl(30,30%,85%)]"
        >
          <Home className="h-5 w-5 text-[hsl(25,40%,30%)]" />
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen className="h-5 w-5 shrink-0 text-[hsl(25,70%,40%)]" />
          <h1 className="truncate text-sm font-bold text-[hsl(25,40%,25%)] sm:text-lg">
            Buku Materi Pembelajaran
          </h1>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-3">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium text-[hsl(25,30%,40%)] sm:text-xs">
              Halaman
            </span>
            <span className="text-[10px] font-bold text-[hsl(25,70%,40%)] sm:text-xs">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[hsl(30,25%,80%)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(25,75%,55%)] to-[hsl(35,70%,55%)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-3 py-4 sm:px-6">
        <div className="w-full max-w-3xl">
          {/* Book container */}
          <div className="book-shadow relative overflow-hidden rounded-r-2xl rounded-l-lg">
            <div className="flex">
              {/* Left binding (decorative) */}
              <div className="book-spine hidden w-6 shrink-0 bg-[hsl(30,40%,78%)] sm:block" />

              {/* Page */}
              <div
                key={currentSlide}
                className={`book-page flex-1 px-5 py-6 sm:px-10 sm:py-8 ${
                  direction === 'next' ? 'page-enter-next' : 'page-enter-prev'
                }`}
              >
                <div className="mb-4 flex items-start gap-3 border-b-2 border-dashed border-[hsl(30,35%,70%)] pb-3">
                  <span className="mt-0.5 text-3xl sm:text-4xl">{slideIcons[currentSlide]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 font-serif text-[10px] uppercase tracking-[0.2em] text-[hsl(25,40%,45%)]">
                      Bab {currentSlide + 1}
                    </p>
                    <h2 className="font-serif text-lg font-bold leading-snug text-[hsl(25,50%,22%)] sm:text-2xl">
                      {slides[currentSlide].title}
                    </h2>
                  </div>
                </div>

                <div className="max-h-[50vh] min-h-[200px] overflow-y-auto pr-1 sm:min-h-[260px]">
                  <p className="break-words whitespace-pre-line font-serif text-sm leading-7 text-[hsl(25,20%,20%)] sm:text-base sm:leading-8">
                    {slides[currentSlide].content}
                  </p>
                </div>

                {currentSlide === slides.length - 1 && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-[hsl(40,60%,60%)] bg-gradient-to-r from-[hsl(40,80%,85%)] to-[hsl(35,75%,82%)] px-4 py-2 text-center shadow-sm">
                      <Star className="h-4 w-4 shrink-0 fill-[hsl(40,80%,45%)] text-[hsl(40,80%,45%)]" />
                      <span className="font-serif text-xs font-bold leading-relaxed text-[hsl(25,55%,25%)]">
                        Selamat! Kamu sudah selesai membaca semua materi 🎉
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex justify-end font-serif text-xs italic text-[hsl(25,30%,50%)]">
                  — halaman {currentSlide + 1} —
                </div>
              </div>

              {/* Right page edge (decorative) */}
              <div className="hidden w-2 shrink-0 bg-gradient-to-l from-[hsl(30,40%,75%)] to-transparent sm:block" />
            </div>
          </div>

          {/* Bottom book base (page stack illusion) */}
          <div className="mx-2 h-2 rounded-b-2xl bg-[hsl(30,30%,72%)]/70 shadow-md" />
          <div className="mx-4 h-1.5 rounded-b-2xl bg-[hsl(30,25%,68%)]/60" />

          {/* Navigation */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="order-1 min-w-[120px] flex-1 rounded-xl border-[hsl(30,40%,70%)] bg-[hsl(40,45%,95%)] text-[hsl(25,50%,25%)] shadow-sm hover:bg-[hsl(40,50%,90%)] disabled:opacity-30 sm:min-w-0 sm:flex-none"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Halaman Sebelumnya</span>
            </Button>

            <Button
              variant="outline"
              onClick={goNext}
              className={`order-2 min-w-[120px] flex-1 rounded-xl shadow-sm sm:order-3 sm:min-w-0 sm:flex-none ${
                isLastSlide
                  ? 'border-[hsl(25,75%,45%)] bg-[hsl(25,75%,50%)] text-white hover:bg-[hsl(25,75%,45%)]'
                  : 'border-[hsl(30,40%,70%)] bg-[hsl(40,45%,95%)] text-[hsl(25,50%,25%)] hover:bg-[hsl(40,50%,90%)]'
              }`}
            >
              {isLastSlide ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Selesai</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Halaman Berikutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="order-3 flex w-full justify-center overflow-x-auto py-1 sm:order-2 sm:w-auto">
              <div className="flex gap-1 px-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Buka halaman ${i + 1}`}
                    onClick={() => {
                      setDirection(i > currentSlide ? 'next' : 'prev');
                      setCurrentSlide(i);
                    }}
                    className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 sm:h-2.5 sm:w-2.5 ${
                      i === currentSlide
                        ? 'scale-125 bg-[hsl(25,75%,45%)]'
                        : i < currentSlide
                          ? 'bg-[hsl(25,55%,65%)]'
                          : 'bg-[hsl(30,20%,75%)] hover:bg-[hsl(30,30%,60%)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Materi;
