import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ScrollText, Trash2, CheckCircle2, XCircle, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  clearHistory,
  deleteHistoryEntry,
  loadHistory,
  type HistoryEntry,
} from '@/lib/history';

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Riwayat = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setEntries(loadHistory());
  };

  const handleClear = () => {
    if (!confirm('Hapus semua riwayat?')) return;
    clearHistory();
    setEntries([]);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[hsl(205,60%,94%)] via-[hsl(210,50%,96%)] to-[hsl(220,50%,92%)]"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="relative z-10 flex items-center gap-3 border-b border-[hsl(210,40%,90%)] bg-white/70 p-3 backdrop-blur-sm sm:p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="shrink-0 rounded-xl hover:bg-[hsl(210,40%,90%)]"
        >
          <Home className="h-5 w-5 text-[hsl(210,50%,40%)]" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ScrollText className="h-5 w-5 shrink-0 text-[hsl(25,85%,50%)]" />
          <h1 className="truncate text-sm font-bold text-[hsl(210,40%,30%)] sm:text-lg">
            Riwayat Hasil Rekaman
          </h1>
        </div>
        {entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="shrink-0 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            <span className="text-xs">Hapus Semua</span>
          </Button>
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-2xl space-y-3 p-4 sm:p-6">
        {entries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[hsl(210,40%,80%)] bg-white/60 p-8 text-center">
            <Mic className="mx-auto mb-3 h-10 w-10 text-[hsl(210,30%,60%)]" />
            <p className="text-sm font-medium text-[hsl(210,30%,40%)]">
              Belum ada riwayat rekaman.
            </p>
            <p className="mt-1 text-xs text-[hsl(210,20%,55%)]">
              Hasil rekaman suara kamu akan tersimpan di sini.
            </p>
            <Button
              onClick={() => navigate('/perekam-suara')}
              className="mt-4 rounded-xl bg-[hsl(200,70%,50%)] text-white hover:bg-[hsl(200,70%,45%)]"
            >
              Mulai Rekam
            </Button>
          </div>
        )}

        {entries.map((entry) => {
          const isOpen = expanded === entry.id;
          return (
            <div
              key={entry.id}
              className={`overflow-hidden rounded-2xl border bg-white/90 shadow-sm backdrop-blur-sm ${
                entry.isCorrect
                  ? 'border-[hsl(200,70%,80%)]'
                  : 'border-[hsl(25,85%,75%)]'
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[hsl(210,40%,97%)]"
              >
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    entry.isCorrect
                      ? 'bg-[hsl(200,80%,90%)] text-[hsl(200,80%,35%)]'
                      : 'bg-[hsl(25,90%,92%)] text-[hsl(25,85%,40%)]'
                  }`}
                >
                  {entry.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        entry.isCorrect
                          ? 'bg-[hsl(200,80%,92%)] text-[hsl(200,80%,30%)]'
                          : 'bg-[hsl(25,90%,93%)] text-[hsl(25,85%,35%)]'
                      }`}
                    >
                      {entry.isCorrect ? 'Baku' : 'Perlu Perbaikan'}
                    </span>
                    <span className="rounded-full bg-[hsl(280,40%,93%)] px-2 py-0.5 text-[10px] font-medium text-[hsl(280,50%,35%)]">
                      {entry.mode === 'pidato' ? 'Mode Pidato' : 'Mode Kalimat'}
                    </span>
                    <span className="text-[10px] text-[hsl(210,20%,50%)]">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  <p className="break-words text-sm text-[hsl(210,20%,25%)]">
                    "{entry.transcript}"
                  </p>
                </div>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-[hsl(210,40%,90%)] bg-[hsl(210,40%,98%)] p-4">
                  {entry.errors.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-[hsl(25,85%,35%)]">
                        Perbaikan kata:
                      </p>
                      <div className="space-y-1.5">
                        {entry.errors.map((err, i) => (
                          <div
                            key={i}
                            className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2 text-sm"
                          >
                            <span className="font-medium text-destructive line-through">
                              "{err.wrong}"
                            </span>
                            <span className="text-[hsl(210,20%,50%)]">→</span>
                            <span className="font-semibold text-[hsl(25,90%,45%)]">
                              "{err.correct}"
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.structure && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-[hsl(280,50%,35%)]">
                        Struktur Pidato:
                      </p>
                      <div className="space-y-2 text-xs">
                        <StructureRow
                          label="Pembukaan"
                          ok={entry.structure.hasPembukaan}
                          items={entry.structure.pembukaan}
                        />
                        <StructureRow
                          label="Isi"
                          ok={entry.structure.hasIsi}
                          items={entry.structure.isi}
                        />
                        <StructureRow
                          label="Penutup"
                          ok={entry.structure.hasPenutup}
                          items={entry.structure.penutup}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      <span className="text-xs">Hapus</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StructureRow = ({
  label,
  ok,
  items,
}: {
  label: string;
  ok: boolean;
  items: string[];
}) => (
  <div className="rounded-lg bg-white p-2">
    <div className="mb-1 flex items-center gap-1.5">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(200,80%,40%)]" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-destructive" />
      )}
      <span className="font-semibold text-[hsl(210,30%,25%)]">{label}</span>
    </div>
    {items.length > 0 ? (
      <p className="break-words text-[hsl(210,20%,40%)]">{items.join(' ')}</p>
    ) : (
      <p className="italic text-[hsl(210,20%,55%)]">Belum terdeteksi.</p>
    )}
  </div>
);

export default Riwayat;
