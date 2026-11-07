import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  ExternalLink,
  ShieldCheck,
  Globe,
  Lock,
} from 'lucide-react';
import { LandingPage, Client } from '../../types';
import { generatePageHtml } from '../../services/generator';

interface PortalPagePreviewProps {
  page: LandingPage;
  client: Client;
  onBack: () => void;
}

export const PortalPagePreview: React.FC<PortalPagePreviewProps> = ({
  page,
  client,
  onBack,
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('desktop');

  // Encontra a revisão liberada para o portal (Seção 10: a prévia reflete estritamente a revisão liberada)
  const releasedRev =
    page.revisions.find(
      (r) => r.id === page.currentRevisionId && r.clientPreviewReleased
    ) ||
    page.revisions.find((r) => r.clientPreviewReleased) ||
    page.revisions[0];

  const previewHtml = useMemo(() => {
    return generatePageHtml(releasedRev.config, false);
  }, [releasedRev]);

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Barra Superior de Navegação da Prévia */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-base">
                {page.title}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Prévia da Revisão #{releasedRev.revisionNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualização autorizada para {client.publicProfile.publicName || client.identificationName}
            </p>
          </div>
        </div>

        {/* Seletor Celular / Desktop & Link do Site Publicado */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Celular</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Computador</span>
            </button>
          </div>

          {page.publishedUrl && (
            <a
              href={page.publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Abrir Site Publicado</span>
            </a>
          )}
        </div>
      </div>

      {/* Aviso Explicativo da Prévia Privada */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Prévia Privada e Segura:</strong> Você está visualizando a revisão aprovada em um ambiente isolado. Caso solicite alterações à equipe, uma nova revisão será gerada e só será exibida aqui após liberação expressa da equipe. O site publicado na internet roda de forma independente.
        </p>
      </div>

      {/* Iframe da Prévia */}
      <div className="flex justify-center bg-slate-200/60 dark:bg-slate-950 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 min-h-[720px]">
        <div
          className="transition-all duration-300 ease-in-out bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-300 dark:border-slate-700"
          style={{
            width: deviceMode === 'mobile' ? '375px' : '100%',
            height: '720px',
          }}
        >
          {/* Barra do Navegador */}
          <div className="h-8 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>previa-privada.portal/{page.slug}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {deviceMode}
            </span>
          </div>

          <iframe
            title={`Prévia ${page.title}`}
            srcDoc={previewHtml}
            sandbox="allow-same-origin"
            className="w-full flex-grow border-0"
          />
        </div>
      </div>
    </div>
  );
};
