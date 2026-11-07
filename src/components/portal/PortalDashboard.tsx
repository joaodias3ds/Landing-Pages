import React from 'react';
import {
  Sparkles,
  Layers,
  Eye,
  Globe,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Client, LandingPage } from '../../types';
import { buildWhatsAppLink } from '../../services/security';

interface PortalDashboardProps {
  client: Client;
  pages: LandingPage[];
  onOpenPreview: (pageId: string) => void;
  onNavigateToPages: () => void;
}

export const PortalDashboard: React.FC<PortalDashboardProps> = ({
  client,
  pages,
  onOpenPreview,
  onNavigateToPages,
}) => {
  // Filtra as páginas disponibilizadas para o cliente (visibilidade 'Disponível' ou com revisão liberada)
  const availablePages = pages.filter((p) => {
    const hasReleasedRev = p.revisions.some((r) => r.clientPreviewReleased);
    return p.portalVisibility === 'Disponível' || hasReleasedRev;
  });

  const featuredPage = availablePages[0];
  const featuredRevision = featuredPage?.revisions.find(
    (r) => r.id === featuredPage.currentRevisionId && r.clientPreviewReleased
  ) || featuredPage?.revisions.find((r) => r.clientPreviewReleased);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Boas-Vindas */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal do Cliente Oficial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {client.publicProfile.publicName || client.identificationName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Bem-vindo ao seu ambiente exclusivo. Aqui você acompanha as prévias das suas landing pages, confere versões liberadas e acessa seus sites publicados na internet.
          </p>
        </div>
      </div>

      {/* Cartão de Destaque da Página mais Recente Liberada */}
      {featuredPage && featuredRevision ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Página em Destaque
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {featuredPage.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Modelo: <strong className="capitalize">{featuredPage.template}</strong> • Revisão #{featuredRevision.revisionNumber}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Prévia Liberada
              </span>
              {featuredPage.publicationStatus === 'Publicada informada' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                  <Globe className="w-3.5 h-3.5" />
                  Publicada no Ar
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Miniatura ou Capa da Página */}
            <div className="md:col-span-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video md:aspect-4/3 bg-slate-100 dark:bg-slate-800 relative">
              {featuredRevision.config.gallery?.[0]?.url || client.publicProfile.media?.[0]?.url ? (
                <img
                  src={featuredRevision.config.gallery?.[0]?.url || client.publicProfile.media?.[0]?.url}
                  alt={featuredPage.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Layers className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-semibold text-white">
                  {featuredRevision.config.header.title}
                </span>
              </div>
            </div>

            {/* Informações e Ações da Página */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {featuredRevision.config.header.subtitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Esta revisão foi revisada e liberada pela equipe administrativa para sua validação privada no portal.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenPreview(featuredPage.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                >
                  <Eye className="w-4 h-4" />
                  Abrir Prévia no Navegador
                </button>

                {featuredPage.publishedUrl && (
                  <a
                    href={featuredPage.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-500" />
                    Abrir Site Publicado ({featuredPage.publishedUrl.replace('https://', '')})
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
          <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Suas páginas aparecerão aqui quando estiverem disponíveis
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            A equipe está preparando sua landing page personalizada. Assim que uma revisão for liberada, você receberá a notificação e poderá conferir a prévia interativa aqui.
          </p>
        </div>
      )}

      {/* Cartão de Suporte & Atendimento */}
      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Dúvidas ou solicitações de ajustes na sua página?
          </h3>
          <p className="text-xs text-slate-500">
            Nossa equipe administrativa está à disposição para atualizar dados, trocar imagens e aprovar novas publicações.
          </p>
        </div>

        <a
          href={buildWhatsAppLink(client.publicProfile.mainCommercialChannel.value || '62991234567', 'Olá, sou cliente do portal e gostaria de suporte com minha landing page.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          Falar com o Suporte
        </a>
      </div>
    </div>
  );
};
