import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  Download,
  CheckCircle,
  Eye,
  Globe,
  Palette,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Share2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileArchive,
  Sparkles,
  X,
  FlaskConical,
} from 'lucide-react';
import { LandingPage, PageRevision, PageConfig, TemplateType, EditorialStatus, Client, ABTest } from '../../types';
import { generatePageHtml, createLandingPageZip, triggerBlobDownload } from '../../services/generator';
import { buildWhatsAppLink, escapeHtml } from '../../services/security';
import { AppRepository } from '../../services/storage';
import { ABTestModal } from './ABTestModal';

interface PageEditorProps {
  page: LandingPage;
  client: Client;
  onBack: () => void;
  onSavePage: (page: LandingPage) => Promise<void>;
  onRecordAudit: (action: string, resource: string, details: string) => Promise<void>;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  client,
  onBack,
  onSavePage,
  onRecordAudit,
}) => {
  // Encontra a revisão ativa
  const currentRev = page.revisions.find((r) => r.id === page.currentRevisionId) || page.revisions[0];

  const [activeRevision, setActiveRevision] = useState<PageRevision>(currentRev);
  const [config, setConfig] = useState<PageConfig>(currentRev.config);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Modal Registrar Publicação
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedUrlInput, setPublishedUrlInput] = useState(page.publishedUrl || '');
  const [isABModalOpen, setIsABModalOpen] = useState(false);
  const [abToast, setAbToast] = useState(false);

  // Gera o HTML para o iframe da prévia em tempo real
  const previewHtml = useMemo(() => {
    return generatePageHtml(config, false);
  }, [config]);

  // Atualiza campo na configuração
  const handleUpdateConfig = (newConfig: PageConfig) => {
    setConfig(newConfig);
    // Se a revisão já estava aprovada, qualquer alteração a reverte para rascunho (Seção 10 da especificação)
    if (activeRevision.editorialStatus === 'Aprovada') {
      setActiveRevision({ ...activeRevision, editorialStatus: 'Rascunho' });
    }
  };

  // Salva no repositório
  const handleSave = async (
    statusOverride?: EditorialStatus,
    releaseToPortal?: boolean
  ) => {
    setSaving(true);
    try {
      const updatedRev: PageRevision = {
        ...activeRevision,
        editorialStatus: statusOverride || activeRevision.editorialStatus,
        clientPreviewReleased:
          typeof releaseToPortal === 'boolean'
            ? releaseToPortal
            : activeRevision.clientPreviewReleased,
        approvedAt: statusOverride === 'Aprovada' ? new Date().toISOString() : activeRevision.approvedAt,
        approvedBy: statusOverride === 'Aprovada' ? 'Admin Principal' : activeRevision.approvedBy,
        config,
      };

      const updatedRevisions = page.revisions.map((r) =>
        r.id === updatedRev.id ? updatedRev : r
      );

      const updatedPage: LandingPage = {
        ...page,
        template: config.template,
        currentRevisionId: updatedRev.id,
        revisions: updatedRevisions,
        portalVisibility: updatedRev.clientPreviewReleased ? 'Disponível' : page.portalVisibility,
        updatedAt: new Date().toISOString(),
      };

      await onSavePage(updatedPage);
      setActiveRevision(updatedRev);

      if (statusOverride === 'Aprovada') {
        await onRecordAudit(
          'APPROVE_REVISION',
          `pages/${page.id}/revisions/${updatedRev.id}`,
          `Revisão #${updatedRev.revisionNumber} aprovada administrativamente.`
        );
      }
      if (releaseToPortal) {
        await onRecordAudit(
          'RELEASE_PREVIEW_PORTAL',
          `pages/${page.id}/revisions/${updatedRev.id}`,
          `Revisão #${updatedRev.revisionNumber} liberada como prévia no Portal do Cliente.`
        );
      }

      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // Exporta o arquivo ZIP
  const handleExportZip = async () => {
    setExportingZip(true);
    try {
      const zipBlob = await createLandingPageZip(config, page.slug);
      triggerBlobDownload(zipBlob, `${page.slug || 'landing-page'}-rev${activeRevision.revisionNumber}.zip`);
      await onRecordAudit(
        'EXPORT_ZIP',
        `pages/${page.id}/exports`,
        `Pacote ZIP exportado com sucesso para a Revisão #${activeRevision.revisionNumber}.`
      );
    } finally {
      setExportingZip(false);
    }
  };

  // Registra URL de publicação externa
  const handleRegisterPublication = async () => {
    if (!publishedUrlInput.trim()) return;
    const url = publishedUrlInput.trim().startsWith('http')
      ? publishedUrlInput.trim()
      : `https://${publishedUrlInput.trim()}`;

    const updatedPage: LandingPage = {
      ...page,
      publishedUrl: url,
      publicationStatus: 'Publicada informada',
      publishedRevisionNumber: activeRevision.revisionNumber,
      publishedAt: new Date().toISOString(),
      publishedOperator: 'Admin Principal',
      portalVisibility: 'Disponível',
    };

    await onSavePage(updatedPage);
    await onRecordAudit(
      'REGISTER_PUBLICATION',
      `pages/${page.id}`,
      `URL publicada informada ${url} associada à Revisão #${activeRevision.revisionNumber}.`
    );
    setShowPublishModal(false);
  };

  // Reordenação de seções
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const order = [...config.sectionsOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const temp = order[index];
    order[index] = order[targetIdx];
    order[targetIdx] = temp;
    handleUpdateConfig({ ...config, sectionsOrder: order });
  };

  const toggleSection = (sectionId: string) => {
    handleUpdateConfig({
      ...config,
      sectionsEnabled: {
        ...config.sectionsEnabled,
        [sectionId]: !config.sectionsEnabled[sectionId],
      },
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Barra de Ferramentas Superior do Editor */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                /{page.slug}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeRevision.editorialStatus === 'Aprovada'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                }`}
              >
                {activeRevision.editorialStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cliente: {client.publicProfile.publicName || client.identificationName} • Revisão #{activeRevision.revisionNumber}
            </p>
          </div>
        </div>

        {/* Controles de Ação Editorial e Exportação */}
        <div className="flex items-center gap-2 flex-wrap">
          {saveToast && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
              <CheckCircle className="w-4 h-4" /> Salvo!
            </span>
          )}

          {/* Salvar Rascunho */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {saving ? 'Salvando...' : 'Salvar Rascunho'}
          </button>

          {/* Aprovar Revisão */}
          {activeRevision.editorialStatus !== 'Aprovada' ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('Aprovada')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs"
            >
              Aprovar Revisão
            </button>
          ) : (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Revisão Aprovada
            </span>
          )}

          {/* Liberar no Portal */}
          <button
            type="button"
            onClick={() => handleSave(undefined, !activeRevision.clientPreviewReleased)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeRevision.clientPreviewReleased
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{activeRevision.clientPreviewReleased ? 'Liberada no Portal' : 'Liberar no Portal'}</span>
          </button>

          {/* Exportar Pacote ZIP */}
          <button
            type="button"
            disabled={exportingZip}
            onClick={handleExportZip}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingZip ? 'Gerando ZIP...' : 'Exportar ZIP'}</span>
          </button>

          {/* Registrar URL Publicada */}
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{page.publishedUrl ? 'URL Registrada' : 'Registrar Publicação'}</span>
          </button>

          {/* Teste A/B de Conversão */}
          <button
            type="button"
            onClick={() => setIsABModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
            title="Criar Experimento A/B para esta Landing Page"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Teste A/B</span>
          </button>
        </div>
      </div>

      {/* Alternador Mobile (Editar vs Prévia) */}
      <div className="lg:hidden grid grid-cols-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`py-2 rounded-lg transition-all ${
            mobileTab === 'editor'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Editar Seções
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`py-2 rounded-lg transition-all ${
            mobileTab === 'preview'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Prévia em Tempo Real
        </button>
      </div>

      {/* Grid Principal do Editor: Controles à Esquerda e Prévia à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna de Controles (7 colunas no desktop) */}
        <div
          className={`lg:col-span-5 space-y-4 max-h-[80vh] overflow-y-auto pr-1 ${
            mobileTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* 1. Tema & Identidade Visual */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" /> Tema & Identidade Visual
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => handleUpdateConfig({ ...config, primaryColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-[11px] font-mono text-slate-500">{config.primaryColor}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['light', 'dark', 'neutral'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleUpdateConfig({ ...config, themeStyle: style })}
                  className={`py-1.5 rounded-lg border font-semibold capitalize ${
                    config.themeStyle === style
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  {style === 'light' ? 'Claro' : style === 'dark' ? 'Escuro' : 'Neutro'}
                </button>
              ))}
            </div>

            {/* Alternador de Modelo / Template */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Modelo de Design & Nicho:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { id: 'food-coffee', name: '☕ Cafeteria (BODREN)' },
                  { id: 'food-restaurant', name: '🍣 Sushi (Hush)' },
                  { id: 'advocacia', name: '⚖️ Advocacia & Leis' },
                  { id: 'beleza-unhas', name: '💅 Cabelo & Nail Bar' },
                  { id: 'portfolio', name: '🏛️ Portfólio' },
                  { id: 'services', name: '💼 Serviços' },
                  { id: 'professional', name: '👔 Profissional' },
                  { id: 'campaign', name: '🚀 Campanha' },
                ].map((tpl) => {
                  const isCur = config.template === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleUpdateConfig({ ...config, template: tpl.id as TemplateType })}
                      className={`py-1.5 px-2 rounded-lg border text-left font-medium transition-all ${
                        isCur
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {tpl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Destaque / Hero */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Seção Hero / Cabeçalho Principal
            </span>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 font-semibold">Título Principal (H1)</label>
                <input
                  type="text"
                  value={config.header.title}
                  onChange={(e) =>
                    handleUpdateConfig({
                      ...config,
                      header: { ...config.header, title: e.target.value },
                    })
                  }
                  className="w-full py-1.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold">Subtítulo / Proposta de Valor</label>
                <textarea
                  rows={2}
                  value={config.header.subtitle}
                  onChange={(e) =>
                    handleUpdateConfig({
                      ...config,
                      header: { ...config.header, subtitle: e.target.value },
                    })
                  }
                  className="w-full py-1.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold">Rótulo do CTA Principal</label>
                  <input
                    type="text"
                    value={config.header.ctaLabel}
                    onChange={(e) =>
                      handleUpdateConfig({
                        ...config,
                        header: { ...config.header, ctaLabel: e.target.value },
                      })
                    }
                    className="w-full py-1.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold">Destino do CTA</label>
                  <select
                    value={config.header.ctaTargetSection}
                    onChange={(e) =>
                      handleUpdateConfig({
                        ...config,
                        header: { ...config.header, ctaTargetSection: e.target.value },
                      })
                    }
                    className="w-full py-1.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option value="contact">Seção de Contato</option>
                    <option value="gallery">Galeria de Fotos</option>
                    <option value="services">Serviços</option>
                    <option value="campaign">Oferta Especial</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Gerenciamento e Ordem das Seções */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Estrutura & Ordem das Seções
            </span>
            <div className="space-y-1.5">
              {config.sectionsOrder.map((sectionId, idx) => {
                const isEnabled = !!config.sectionsEnabled[sectionId];
                const sectionLabels: Record<string, string> = {
                  hero: 'Destaque (Hero)',
                  gallery: 'Galeria de Fotos / Portfólio',
                  services: 'Catálogo de Serviços',
                  differentials: 'Diferenciais Competitivos',
                  about: 'Sobre / Trajetória',
                  campaign: 'Oferta Especial / Campanha',
                  contact: 'Contato Direto & Endereço',
                };

                return (
                  <div
                    key={sectionId}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleSection(sectionId)}
                        className="rounded text-blue-600"
                      />
                      <span className={`font-semibold ${isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                        {sectionLabels[sectionId] || sectionId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === config.sectionsOrder.length - 1}
                        onClick={() => moveSection(idx, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Contato Comercial */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Canais de Contato & Conversão
            </span>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 font-semibold">WhatsApp para Atendimento</label>
                <input
                  type="text"
                  value={config.contact.value}
                  onChange={(e) =>
                    handleUpdateConfig({
                      ...config,
                      contact: { ...config.contact, value: e.target.value },
                    })
                  }
                  className="w-full py-1.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold">Mensagem Padrão do WhatsApp</label>
                <input
                  type="text"
                  value={config.contact.customMessage || ''}
                  onChange={(e) =>
                    handleUpdateConfig({
                      ...config,
                      contact: { ...config.contact, customMessage: e.target.value },
                    })
                  }
                  className="w-full py-1.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold">Endereço ou Região Exibida</label>
                <input
                  type="text"
                  value={config.contact.address || ''}
                  onChange={(e) =>
                    handleUpdateConfig({
                      ...config,
                      contact: { ...config.contact, address: e.target.value },
                    })
                  }
                  className="w-full py-1.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna da Prévia Interativa (7 colunas no desktop) */}
        <div
          className={`lg:col-span-7 space-y-3 ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Seletor de Resolução / Dispositivo */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500">
              Simulação de Dispositivo:
            </span>

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
                <span>375px</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  deviceMode === 'tablet'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>768px</span>
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
                <span>Desktop (100%)</span>
              </button>
            </div>
          </div>

          {/* Iframe Isolado de Prévia */}
          <div className="flex justify-center bg-slate-200/60 dark:bg-slate-950 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 min-h-[680px]">
            <div
              className="transition-all duration-300 ease-in-out bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-300 dark:border-slate-700"
              style={{
                width:
                  deviceMode === 'mobile'
                    ? '375px'
                    : deviceMode === 'tablet'
                    ? '768px'
                    : '100%',
                height: '680px',
              }}
            >
              {/* Barra de Simulação de Navegador */}
              <div className="h-7 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                </div>
                <span className="font-mono text-[10px] truncate max-w-[220px]">
                  https://preview.local/{page.slug}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {deviceMode}
                </span>
              </div>

              {/* Iframe com Sandbox Seguro (sem execução de scripts arbitrários) */}
              <iframe
                title="Prévia da Landing Page"
                srcDoc={previewHtml}
                sandbox="allow-same-origin"
                className="w-full flex-grow border-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Registrar Publicação */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Registrar URL Publicada
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Após publicar os arquivos do ZIP na hospedagem externa escolhida, informe o endereço HTTPS para que o cliente possa abrir o site diretamente pelo Portal do Cliente.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Endereço Web (URL HTTPS Oficial)
              </label>
              <input
                type="url"
                required
                value={publishedUrlInput}
                onChange={(e) => setPublishedUrlInput(e.target.value)}
                placeholder="https://marinafotografia.com.br"
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="w-1/3 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegisterPublication}
                className="w-2/3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
              >
                Salvar Publicação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de Teste A/B Criado */}
      {abToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center gap-2.5 text-xs font-bold border border-indigo-500 animate-in slide-in-from-bottom duration-300">
          <FlaskConical className="w-4 h-4 shrink-0" />
          <span>Experimento A/B iniciado! Acompanhe o tráfego no Dashboard de Analytics.</span>
        </div>
      )}

      {/* Modal de Criação de Teste A/B */}
      <ABTestModal
        isOpen={isABModalOpen}
        onClose={() => setIsABModalOpen(false)}
        pages={[page]}
        clients={[client]}
        initialPageId={page.id}
        onSaveTest={async (test) => {
          await AppRepository.saveABTest(test);
          await onRecordAudit(
            'CREATE_AB_TEST',
            `pages/${page.id}/ab_tests/${test.id}`,
            `Teste A/B "${test.title}" criado e iniciado para a Landing Page.`
          );
          setAbToast(true);
          setTimeout(() => setAbToast(false), 3500);
        }}
      />
    </div>
  );
};
