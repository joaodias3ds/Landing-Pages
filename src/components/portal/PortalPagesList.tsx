import React from 'react';
import {
  Layers,
  Eye,
  Globe,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LandingPage, Client } from '../../types';

interface PortalPagesListProps {
  client: Client;
  pages: LandingPage[];
  onOpenPreview: (pageId: string) => void;
}

export const PortalPagesList: React.FC<PortalPagesListProps> = ({
  client,
  pages,
  onOpenPreview,
}) => {
  // Páginas disponibilizadas
  const availablePages = pages.filter((p) => {
    const hasReleasedRev = p.revisions.some((r) => r.clientPreviewReleased);
    return p.portalVisibility === 'Disponível' || hasReleasedRev;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Minhas Landing Pages
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe as versões liberadas pela equipe e acesse seus endereços oficiais publicados.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {availablePages.length} página(s) disponível(is)
        </span>
      </div>

      {availablePages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Suas páginas aparecerão aqui quando estiverem disponíveis
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Assim que uma prévia for liberada pelo administrador, os cartões de acesso aparecerão nesta tela.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availablePages.map((page) => {
            const releasedRev =
              page.revisions.find(
                (r) => r.id === page.currentRevisionId && r.clientPreviewReleased
              ) || page.revisions.find((r) => r.clientPreviewReleased);

            const thumbUrl =
              releasedRev?.config.gallery?.[0]?.url ||
              client.publicProfile.media?.[0]?.url;

            return (
              <div
                key={page.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Capa */}
                  <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={page.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Layers className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white">
                        {page.template}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                        Revisão #{releasedRev?.revisionNumber || 1} Liberada
                      </span>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="p-5 space-y-2">
                    <h2 className="font-bold text-slate-900 dark:text-white text-base">
                      {page.title}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {releasedRev?.config.header.subtitle}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Liberada em: {new Date(page.updatedAt).toLocaleDateString('pt-BR')}</span>
                      <span>Slug: /{page.slug}</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="p-5 pt-0 flex gap-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <button
                    type="button"
                    onClick={() => onOpenPreview(page.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Prévia Privada
                  </button>

                  {page.publishedUrl && (
                    <a
                      href={page.publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      title="Abrir site publicado na web"
                    >
                      <Globe className="w-4 h-4 text-emerald-500" />
                      <span className="hidden sm:inline">Site Publicado</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
