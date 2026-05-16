import { CheckCircle2, XCircle, ArrowRight, AlertCircle, BookOpenCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PidatoStructure } from '@/lib/history';

interface ResultPopupProps {
  isOpen: boolean;
  isCorrect: boolean;
  errors: Array<{ wrong: string; correct: string }>;
  transcript: string;
  structure?: PidatoStructure;
  onClose: () => void;
}

const PrimaryColor = 'hsl(var(--correction))';

export const ResultPopup = ({
  isOpen,
  isCorrect,
  errors,
  transcript,
  structure,
  onClose,
}: ResultPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-h-[85vh] overflow-y-auto border-2 sm:max-w-md ${
          isCorrect
            ? 'border-[hsl(200,80%,55%)] bg-[hsl(200,80%,55%)]/5'
            : 'border-[hsl(var(--correction))] bg-[hsl(var(--correction))]/5'
        }`}
      >
        <DialogHeader>
          <div className="flex flex-col items-center space-y-3 py-2 text-center">
            {isCorrect ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(200,80%,55%)]/15">
                <CheckCircle2 className="h-9 w-9 text-[hsl(200,80%,45%)]" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--correction))]/15">
                <AlertCircle className="h-9 w-9 text-[hsl(var(--correction))]" />
              </div>
            )}

            <DialogTitle
              className="text-xl font-bold"
              style={{ color: isCorrect ? 'hsl(200,80%,40%)' : PrimaryColor }}
            >
              {isCorrect ? 'BAHASAMU SUDAH BAKU!' : 'PERLU DIPERBAIKI'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Kalimat yang diucapkan:
            </p>
            <p className="break-words text-sm font-medium text-foreground">"{transcript}"</p>
          </div>

          {!isCorrect && errors.length > 0 && (
            <div
              className="space-y-3 rounded-lg border-2 p-3"
              style={{
                borderColor: PrimaryColor,
                backgroundColor: 'hsl(var(--correction) / 0.08)',
              }}
            >
              <p className="flex items-center gap-1.5 text-sm font-bold" style={{ color: PrimaryColor }}>
                <ArrowRight className="h-4 w-4" />
                Pembenaran Kata Baku
              </p>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-[hsl(var(--correction))]/30 bg-white p-2.5 shadow-sm"
                  >
                    <span className="break-all font-medium text-destructive line-through">
                      "{error.wrong}"
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0" style={{ color: PrimaryColor }} />
                    <span
                      className="break-all rounded px-1.5 py-0.5 font-bold"
                      style={{
                        color: 'hsl(var(--correction-foreground))',
                        backgroundColor: PrimaryColor,
                      }}
                    >
                      {error.correct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCorrect && errors.length === 0 && (
            <div className="rounded-lg border border-[hsl(200,80%,55%)]/30 bg-[hsl(200,80%,55%)]/10 p-3">
              <p className="text-center text-sm text-[hsl(200,80%,35%)]">
                Kalimatmu sudah menggunakan Bahasa Indonesia Baku yang benar! 🎉
              </p>
            </div>
          )}

          {structure && (
            <div className="space-y-2 rounded-lg border-2 border-[hsl(280,50%,60%)]/40 bg-[hsl(280,50%,95%)] p-3">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[hsl(280,55%,35%)]">
                <BookOpenCheck className="h-4 w-4" />
                Analisis Struktur Pidato
              </p>
              <div className="space-y-2 text-xs">
                <StructureItem label="Pembukaan" ok={structure.hasPembukaan} items={structure.pembukaan} />
                <StructureItem label="Isi" ok={structure.hasIsi} items={structure.isi} />
                <StructureItem label="Penutup" ok={structure.hasPenutup} items={structure.penutup} />
              </div>
              {(!structure.hasPembukaan || !structure.hasPenutup) && (
                <p className="text-[11px] italic text-[hsl(280,40%,40%)]">
                  Lengkapi bagian yang masih kurang agar struktur pidato lengkap.
                </p>
              )}
            </div>
          )}

          <Button
            onClick={onClose}
            className="w-full rounded-xl"
            style={{
              backgroundColor: isCorrect ? 'hsl(200,80%,50%)' : PrimaryColor,
              color: 'white',
            }}
          >
            Coba Lagi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StructureItem = ({
  label,
  ok,
  items,
}: {
  label: string;
  ok: boolean;
  items: string[];
}) => (
  <div className="rounded-md bg-white p-2">
    <div className="mb-1 flex items-center gap-1.5">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(200,80%,45%)]" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-destructive" />
      )}
      <span className="font-bold text-[hsl(280,50%,30%)]">{label}</span>
      <span className="text-[10px] text-[hsl(280,30%,45%)]">{ok ? 'terdeteksi' : 'belum ada'}</span>
    </div>
    {items.length > 0 ? (
      <p className="break-words text-[hsl(210,20%,30%)]">{items.join(' ')}</p>
    ) : (
      <p className="italic text-[hsl(210,20%,55%)]">Belum terdeteksi.</p>
    )}
  </div>
);
