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

  const isLastSlide = currentSlide === slides.length - 1;

  const goNext = () => {
    if (isLastSlide) {
      navigate('/');
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[hsl(205,60%,94%)] via-[hsl(210,50%,96%)] to-[hsl(220,50%,92%)]"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(210,50%,60%) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 flex items-center gap-3 border-b border-[hsl(210,40%,90%)] bg-[hsl(0,0%,100%)]/70 p-3 backdrop-blur-sm sm:p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="shrink-0 rounded-xl hover:bg-[hsl(210,40%,90%)]"
        >
          <Home className="h-5 w-5 text-[hsl(210,50%,40%)]" />
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen className="h-5 w-5 shrink-0 text-[hsl(35,70%,45%)]" />
          <h1 className="truncate text-sm font-bold text-[hsl(210,40%,30%)] sm:text-lg">Materi Pembelajaran</h1>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-3">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium text-[hsl(210,30%,50%)] sm:text-xs">
              Progres Belajar
            </span>
            <span className="text-[10px] font-bold text-[hsl(200,70%,45%)] sm:text-xs">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[hsl(210,30%,88%)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(200,70%,55%)] to-[hsl(220,65%,55%)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-lg">
          <div
            key={currentSlide}
            className="animate-in slide-in-from-right-2 fade-in duration-300 overflow-hidden rounded-2xl border border-[hsl(210,40%,88%)] bg-[hsl(0,0%,100%)]/90 shadow-lg backdrop-blur-sm"
          >
            <div className="border-b border-[hsl(210,40%,88%)] bg-gradient-to-r from-[hsl(200,55%,92%)] to-[hsl(210,50%,94%)] px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-3xl sm:text-4xl">{slideIcons[currentSlide]}</span>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-[hsl(210,30%,55%)]">
                    Materi {currentSlide + 1}
                  </p>
                  <h2 className="text-base font-bold leading-snug text-[hsl(210,50%,30%)] sm:text-lg">
                    {slides[currentSlide].title}
                  </h2>
                </div>
              </div>
            </div>

            <div className="max-h-[52vh] min-h-[220px] overflow-y-auto p-5 sm:min-h-[260px] sm:p-6">
              <p className="break-words whitespace-pre-line text-sm leading-relaxed text-[hsl(210,15%,35%)] sm:text-base">
                {slides[currentSlide].content}
              </p>
            </div>

            {currentSlide === slides.length - 1 && (
              <div className="flex justify-center px-5 pb-4">
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-[hsl(40,60%,80%)] bg-gradient-to-r from-[hsl(40,80%,92%)] to-[hsl(35,70%,90%)] px-4 py-2 text-center">
                  <Star className="h-4 w-4 shrink-0 fill-[hsl(40,80%,50%)] text-[hsl(40,80%,50%)]" />
                  <span className="text-xs font-bold leading-relaxed text-[hsl(35,50%,35%)]">
                    Selamat! Kamu sudah selesai membaca semua materi 🎉
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="order-1 min-w-[120px] flex-1 rounded-xl border-[hsl(210,40%,85%)] bg-[hsl(0,0%,100%)]/80 shadow-sm hover:bg-[hsl(210,40%,93%)] disabled:opacity-30 sm:min-w-0 sm:flex-none"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Button>

            <Button
              variant="outline"
              onClick={goNext}
              className={`order-2 min-w-[120px] flex-1 rounded-xl shadow-sm sm:order-3 sm:min-w-0 sm:flex-none ${
                isLastSlide
                  ? 'border-[hsl(200,60%,50%)] bg-[hsl(200,60%,50%)] text-white hover:bg-[hsl(200,60%,45%)]'
                  : 'border-[hsl(210,40%,85%)] bg-[hsl(0,0%,100%)]/80 hover:bg-[hsl(210,40%,93%)]'
              }`}
            >
              {isLastSlide ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Finish</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="order-3 flex w-full justify-center overflow-x-auto py-1 sm:order-2 sm:w-auto">
              <div className="flex gap-1 px-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Buka slide ${i + 1}`}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 sm:h-2.5 sm:w-2.5 ${
                      i === currentSlide
                        ? 'scale-125 bg-[hsl(200,70%,50%)]'
                        : i < currentSlide
                          ? 'bg-[hsl(200,50%,70%)]'
                          : 'bg-[hsl(210,20%,82%)] hover:bg-[hsl(210,30%,70%)]'
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
