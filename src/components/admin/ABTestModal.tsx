import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FlaskConical,
  ArrowRight,
  Sliders,
  Check,
  Eye,
  Layers,
  MessageSquare,
  TrendingUp,
  Tag,
  Palette,
  Play,
  FileText,
} from 'lucide-react';
import { LandingPage, Client, ABTest, ABTestVariation, TemplateType } from '../../types';

interface ABTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: LandingPage[];
  clients: Client[];
  initialPageId?: string;
  onSaveTest: (test: ABTest) => Promise<void>;
}

export const ABTestModal: React.FC<ABTestModalProps> = ({
  isOpen,
  onClose,
  pages,
  clients,
  initialPageId,
  onSaveTest,
}) => {
  if (!isOpen) return null;

  const defaultPage = pages.find((p) => p.id === initialPageId) || pages[0];
  const [selectedPageId, setSelectedPageId] = useState<string>(defaultPage?.id || '');

  const currentPage = pages.find((p) => p.id === selectedPageId) || defaultPage;
  const currentClient = clients.find((c) => c.id === currentPage?.clientId);
  const currentRev = currentPage?.revisions.find((r) => r.id === currentPage.currentRevisionId);

  // Campos do Teste A/B
  const [title, setTitle] = useState(
    `Teste de Conversão: ${currentPage?.title.replace('Landing Page - ', '') || 'Nova Página'}`
  );
  const [hypothesis, setHypothesis] = useState(
    'Variação B com proposta de valor mais direta e chamada urgente para o WhatsApp aumentará a taxa de conversão.'
  );
  const [trafficSplit, setTrafficSplit] = useState<number>(50);
  const [metricTarget, setMetricTarget] = useState<'whatsapp_leads' | 'cta_clicks' | 'time_spent'>('whatsapp_leads');

  // Variação A (Controle - baseada na página)
  const [varAName, setVarAName] = useState('Variação A (Controle)');
  const [varAHeadline, setVarAHeadline] = useState(currentRev?.config.header.title || 'Título Principal');
  const [varASubtitle, setVarASubtitle] = useState(currentRev?.config.header.subtitle || 'Subtítulo da Página');
  const [varACta, setVarACta] = useState(currentRev?.config.header.ctaLabel || 'Falar no WhatsApp');
  const [varAColor, setVarAColor] = useState(currentRev?.config.primaryColor || '#2447C6');
  const [varATemplate, setVarATemplate] = useState<TemplateType>(currentPage?.template || 'services');

  // Variação B (Desafiante)
  const [varBName, setVarBName] = useState('Variação B (Desafiante)');
  const [varBHeadline, setVarBHeadline] = useState(
    `Oferta Especial: ${currentRev?.config.header.title || 'Atendimento Imediato'}`
  );
  const [varBSubtitle, setVarBSubtitle] = useState(
    'Fale com nossos especialistas agora pelo WhatsApp e receba condições exclusivas no primeiro contato.'
  );
  const [varBCta, setVarBCta] = useState('Solicitar Condição Especial');
  const [varBColor, setVarBColor] = useState(
    currentPage?.template === 'food-coffee'
      ? '#e07a5f'
      : currentPage?.template === 'food-restaurant'
      ? '#ff7849'
      : currentPage?.template === 'advocacia'
      ? '#f59e0b'
      : currentPage?.template === 'beleza-unhas'
      ? '#c6ff00'
      : '#10b981'
  );
  const [varBTemplate, setVarBTemplate] = useState<TemplateType>(currentPage?.template || 'services');
  const [varBBadge, setVarBBadge] = useState('🔥 15% OFF no WhatsApp');

  const [activeTab, setActiveTab] = useState<'config' | 'variationA' | 'variationB' | 'preview'>('config');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Ao mudar a página, sincroniza defaults
  const handlePageChange = (newPageId: string) => {
    setSelectedPageId(newPageId);
    const p = pages.find((page) => page.id === newPageId);
    if (p) {
      const r = p.revisions.find((rev) => rev.id === p.currentRevisionId);
      setTitle(`Teste de Conversão: ${p.title.replace('Landing Page - ', '')}`);
      setVarAHeadline(r?.config.header.title || '');
      setVarASubtitle(r?.config.header.subtitle || '');
      setVarACta(r?.config.header.ctaLabel || 'Falar no WhatsApp');
      setVarAColor(r?.config.primaryColor || '#2447C6');
      setVarATemplate(p.template);

      setVarBHeadline(`Condição Exclusiva: ${r?.config.header.title || ''}`);
      setVarBSubtitle('Atendimento prioritário via WhatsApp com garantia e resposta ágil.');
      setVarBCta('Garantir Atendimento Imediato');
      setVarBTemplate(p.template);
    }
  };

  const handleSubmit = async (launchImmediately: boolean = true) => {
    if (!title.trim()) {
      setErrorMsg('Informe um título para o teste A/B.');
      return;
    }
    if (!varAHeadline.trim() || !varBHeadline.trim()) {
      setErrorMsg('Preencha a headline para ambas as variações.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const now = new Date();
      const newTest: ABTest = {
        id: `ab-test-${Date.now()}`,
        pageId: currentPage.id,
        pageTitle: currentPage.title,
        clientId: currentPage.clientId,
        clientName: currentClient?.publicProfile.publicName || currentClient?.identificationName || 'Cliente',
        title,
        hypothesis,
        status: launchImmediately ? 'running' : 'draft',
        trafficSplitPercent: trafficSplit,
        metricTarget,
        statisticalConfidence: 50.0,
        significanceReached: false,
        liftPercent: 0,
        startDate: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        variationA: {
          id: 'A',
          name: varAName,
          headline: varAHeadline,
          subtitle: varASubtitle,
          ctaLabel: varACta,
          primaryColor: varAColor,
          template: varATemplate,
          views: 0,
          uniqueVisitors: 0,
          conversions: 0,
          conversionRate: 0,
          bounceRate: 35,
          avgTimeOnPage: '2m 10s',
        },
        variationB: {
          id: 'B',
          name: varBName,
          headline: varBHeadline,
          subtitle: varBSubtitle,
          ctaLabel: varBCta,
          primaryColor: varBColor,
          template: varBTemplate,
          campaignBadge: varBBadge,
          views: 0,
          uniqueVisitors: 0,
          conversions: 0,
          conversionRate: 0,
          bounceRate: 30,
          avgTimeOnPage: '2m 25s',
        },
        dailyMetrics: [
          {
            date: now.toISOString().split('T')[0],
            displayDate: 'Hoje',
            viewsA: 0,
            convA: 0,
            rateA: 0,
            viewsB: 0,
            convB: 0,
            rateB: 0,
          },
        ],
      };

      await onSaveTest(newTest);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Erro ao criar teste A/B');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Criar Novo Teste A/B de Conversão
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  Split 50/50
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teste duas variantes da mesma página para descobrir qual headline e CTA geram mais cliques em WhatsApp.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação do Assistente de Teste */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            1. Definição do Experimento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variationA')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'variationA'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] flex items-center justify-center font-bold">
              A
            </span>
            2. Variação A (Controle)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variationB')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'variationB'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              B
            </span>
            3. Variação B (Desafiante)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            4. Comparação Lado a Lado
          </button>
        </div>

        {/* Conteúdo do Formulário */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* ABA 1: CONFIGURAÇÃO GERAL */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Landing Page do Experimento
                </label>
                <select
                  value={selectedPageId}
                  onChange={(e) => handlePageChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.template})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Cliente associado: <strong className="text-slate-800 dark:text-slate-200">{currentClient?.identificationName}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Título do Teste A/B
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Título Sensorial vs Desconto de 15%"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Hipótese de Conversão
                </label>
                <textarea
                  rows={2}
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="O que você espera aprender com esse teste? (Ex: Destacar o preço reduzido logo no Hero aumentará os leads em 20%)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Métrica Principal de Sucesso
                  </label>
                  <select
                    value={metricTarget}
                    onChange={(e: any) => setMetricTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="whatsapp_leads">Conversões em WhatsApp (Recomendado)</option>
                    <option value="cta_clicks">Cliques em Botões de Ação (CTA)</option>
                    <option value="time_spent">Tempo de Permanência &gt; 2 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Divisão de Tráfego: {trafficSplit}% (A) / {100 - trafficSplit}% (B)
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={10}
                      value={trafficSplit}
                      onChange={(e) => setTrafficSplit(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                      {trafficSplit}/{100 - trafficSplit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: VARIAÇÃO A (CONTROLE) */}
          {activeTab === 'variationA' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Versão Controle (Baseline)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Esta variação reflete o conteúdo atual da Landing Page aprovada.
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  Original
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome da Variação
                </label>
                <input
                  type="text"
                  value={varAName}
                  onChange={(e) => setVarAName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Headline Principal (H1)
                </label>
                <input
                  type="text"
                  value={varAHeadline}
                  onChange={(e) => setVarAHeadline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Subtítulo / Descrição de Valor
                </label>
                <textarea
                  rows={2}
                  value={varASubtitle}
                  onChange={(e) => setVarASubtitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Texto do Botão CTA
                  </label>
                  <input
                    type="text"
                    value={varACta}
                    onChange={(e) => setVarACta(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Cor Primária de Destaque
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={varAColor}
                      onChange={(e) => setVarAColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={varAColor}
                      onChange={(e) => setVarAColor(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: VARIAÇÃO B (DESAFIANTE) */}
          {activeTab === 'variationB' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Versão Desafiante (Nova Hipótese)
                  </div>
                  <div className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                    Altere a headline, crie uma oferta com badge de desconto ou modifique a cor do CTA para testar o ganho de conversão.
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                  Desafiante B
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome da Variação
                </label>
                <input
                  type="text"
                  value={varBName}
                  onChange={(e) => setVarBName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nova Headline Principal (H1 com Gancho)
                </label>
                <input
                  type="text"
                  value={varBHeadline}
                  onChange={(e) => setVarBHeadline(e.target.value)}
                  placeholder="Ex: Ganhe 15% OFF no seu Primeiro Café Especial"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Subtítulo / Proposta de Valor
                </label>
                <textarea
                  rows={2}
                  value={varBSubtitle}
                  onChange={(e) => setVarBSubtitle(e.target.value)}
                  placeholder="Ex: Torra sob demanda entregue na sua casa em 30 minutos. Peça pelo WhatsApp com cupom exclusivo."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Novo Texto do Botão CTA
                  </label>
                  <input
                    type="text"
                    value={varBCta}
                    onChange={(e) => setVarBCta(e.target.value)}
                    placeholder="Ex: Garantir Meu Desconto no WhatsApp"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Badge de Campanha / Urgência
                  </label>
                  <input
                    type="text"
                    value={varBBadge}
                    onChange={(e) => setVarBBadge(e.target.value)}
                    placeholder="Ex: ⚡ Oferta de Boas-Vindas"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Cor Primária da Variação B
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={varBColor}
                      onChange={(e) => setVarBColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={varBColor}
                      onChange={(e) => setVarBColor(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Template da Variação B
                  </label>
                  <select
                    value={varBTemplate}
                    onChange={(e: any) => setVarBTemplate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="food-coffee">Cafeteria Gourmet (BODREN)</option>
                    <option value="food-restaurant">Restaurante Sushi (Hush)</option>
                    <option value="advocacia">Advocacia & Leis</option>
                    <option value="beleza-unhas">Cabelo & Nail Bar</option>
                    <option value="services">Serviços & Negócios</option>
                    <option value="campaign">Campanha Promocional</option>
                    <option value="portfolio">Portfólio Criativo</option>
                    <option value="professional">Profissional Liberal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: PREVIEW LADO A LADO */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 text-center font-medium">
                Comparação visual de como cada visitante verá as duas variações no topo da Landing Page:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Variação A */}
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {trafficSplit}% Tráfego
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center">
                        A
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {varAName}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
                      {varAHeadline}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">
                      {varASubtitle}
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      style={{ backgroundColor: varAColor }}
                      className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-transform active:scale-95 text-center truncate"
                    >
                      {varACta}
                    </button>
                    <div className="mt-2 text-center text-[10px] text-slate-400 font-mono">
                      Cor Primária: {varAColor}
                    </div>
                  </div>
                </div>

                {/* Card Variação B */}
                <div className="rounded-2xl border-2 border-indigo-500/80 dark:border-indigo-500/60 p-5 bg-indigo-50/20 dark:bg-indigo-950/20 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-indigo-500/5">
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                    {100 - trafficSplit}% Tráfego
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        B
                      </span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {varBName}
                      </span>
                    </div>

                    {varBBadge && (
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2">
                        {varBBadge}
                      </div>
                    )}

                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
                      {varBHeadline}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">
                      {varBSubtitle}
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      style={{ backgroundColor: varBColor }}
                      className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-transform active:scale-95 text-center truncate"
                    >
                      {varBCta}
                    </button>
                    <div className="mt-2 text-center text-[10px] text-slate-400 font-mono">
                      Cor Primária: {varBColor}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {activeTab !== 'preview' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'config') setActiveTab('variationA');
                  else if (activeTab === 'variationA') setActiveTab('variationB');
                  else if (activeTab === 'variationB') setActiveTab('preview');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                Próxima Etapa <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Pronto para publicação
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Salvar como Rascunho
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isSaving ? 'Iniciando...' : 'Iniciar Teste A/B Agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
