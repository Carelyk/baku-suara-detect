import { useNavigate } from 'react-router-dom';
import { Home, Target, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Capaian = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[hsl(205,60%,94%)] via-[hsl(210,50%,96%)] to-[hsl(220,50%,92%)]"
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

      <div className="relative z-10 flex items-center gap-3 border-b border-[hsl(210,40%,90%)] bg-white/70 p-3 backdrop-blur-sm sm:p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="shrink-0 rounded-xl hover:bg-[hsl(210,40%,90%)]"
        >
          <Home className="h-5 w-5 text-[hsl(210,50%,40%)]" />
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <Target className="h-5 w-5 shrink-0 text-[hsl(280,60%,50%)]" />
          <h1 className="truncate text-sm font-bold text-[hsl(210,40%,30%)] sm:text-lg">
            Capaian & Tujuan Pembelajaran
          </h1>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
        <section className="rounded-2xl border border-[hsl(280,40%,85%)] bg-white/90 p-5 shadow-md backdrop-blur-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(280,70%,85%)] to-[hsl(290,60%,75%)]">
              <Flag className="h-5 w-5 text-[hsl(280,70%,30%)]" />
            </div>
            <h2 className="text-base font-bold text-[hsl(280,40%,30%)] sm:text-lg">
              Capaian Pembelajaran (CP)
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[hsl(210,15%,30%)] sm:text-base">
            Menyajikan pendapat dengan pilihan kata dan sikap tubuh/gestur yang sesuai,
            menggunakan volume dan intonasi yang sesuai dengan konteks; menanggapi diskusi
            sesuai tata cara; dan menceritakan kembali isi dan/atau informasi dari berbagai
            tipe teks yang dibaca, dipirsa, atau didengar.
          </p>
        </section>

        <section className="rounded-2xl border border-[hsl(200,40%,85%)] bg-white/90 p-5 shadow-md backdrop-blur-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(200,70%,85%)] to-[hsl(210,60%,75%)]">
              <Target className="h-5 w-5 text-[hsl(200,80%,30%)]" />
            </div>
            <h2 className="text-base font-bold text-[hsl(200,80%,25%)] sm:text-lg">
              Tujuan Pembelajaran (TP)
            </h2>
          </div>
          <ul className="space-y-3 text-sm leading-relaxed text-[hsl(210,15%,30%)] sm:text-base">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[hsl(200,70%,55%)]" />
              <span>
                Peserta didik mampu menggunakan bahasa Indonesia yang baik dan benar
                dalam pembelajaran dan mampu menyampaikan pendapat secara lisan tanpa
                mencampur bahasa lain.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[hsl(200,70%,55%)]" />
              <span>
                Peserta didik mampu berpidato menggunakan bahasa Indonesia yang baik
                dan benar dengan struktur teks pidato yang tepat (pembukaan, isi, dan
                penutup).
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Capaian;
