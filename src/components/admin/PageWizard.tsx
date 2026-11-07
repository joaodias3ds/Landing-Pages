import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Palette,
  Check,
  Building2,
  User,
} from 'lucide-react';
import { Client, TemplateType, LandingPage, PageRevision, SuggestionResult } from '../../types';
import { runSuggestionEngine } from '../../services/suggestionEngine';

interface PageWizardProps {
  clients: Client[];
  initialClientId?: string;
  onBack: () => void;
  onCreatePage: (page: LandingPage) => Promise<void>;
  onNavigateToEditor: (pageId: string) => void;
}

const PRESET_GOALS = [
  'Divulgar cardápio de cafeteria gourmet, cafés especiais e receber pedidos no balcão/delivery (Estilo BODREN)',
  'Apresentar restaurante contemporâneo / sushi, combos autorais e reservas de mesa (Estilo Hush Modern)',
  'Apresentar escritório de advocacia, áreas de atuação e agendar consultas confidenciais (Estilo Creative Law)',
  'Divulgar salão de beleza, serviços de cabelo, nail bar (unhas) e agendar online (Estilo Studio Glow)',
  'Divulgar portfólio de fotos e atrair pedidos de orçamento',
  'Receber solicitações de orçamento para serviços residenciais ou comerciais',
  'Apresentar perfil profissional, credenciais e agendar atendimentos',
  'Divulgar campanha de oferta exclusiva com urgência e CTA promocional',
];

export const PageWizard: React.FC<PageWizardProps> = ({
  clients,
  initialClientId,
  onBack,
  onCreatePage,
  onNavigateToEditor,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || clients[0]?.id || ''
  );
  const [goal, setGoal] = useState<string>(PRESET_GOALS[0]);
  const [chosenTemplate, setChosenTemplate] = useState<TemplateType>('portfolio');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageSlug, setPageSlug] = useState<string>('');
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Executa o motor de sugestão sempre que o cliente ou objetivo mudar
  useEffect(() => {
    if (selectedClient) {
      const res = runSuggestionEngine(selectedClient, goal);
      setSuggestion(res);
      setChosenTemplate(res.recommendedTemplate);
      const baseName = selectedClient.publicProfile.publicName || selectedClient.identificationName;
      setPageTitle(`Landing Page - ${baseName}`);
      setPageSlug(
        baseName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `pagina-${Date.now()}`
      );
    }
  }, [selectedClientId, goal]);

  const handleCreate = async () => {
    if (!selectedClient || !suggestion) return;

    setCreating(true);
    try {
      const newPageId = `page-${Date.now()}`;
      const revId = `rev-${newPageId}-1`;

      // Atualiza o template escolhido caso o usuário tenha trocado manualmente
      const initialConfig = {
        ...suggestion.initialConfig,
        template: chosenTemplate,
      };

      const newRevision: PageRevision = {
        id: revId,
        pageId: newPageId,
        revisionNumber: 1,
        editorialStatus: 'Rascunho',
        clientPreviewReleased: false,
        createdAt: new Date().toISOString(),
        config: initialConfig,
      };

      const newLandingPage: LandingPage = {
        id: newPageId,
        clientId: selectedClient.id,
        title: pageTitle || `Landing Page - ${selectedClient.publicProfile.publicName}`,
        slug: pageSlug || `lp-${Date.now()}`,
        template: chosenTemplate,
        goal,
        portalVisibility: 'Oculta',
        currentRevisionId: revId,
        revisions: [newRevision],
        publicationStatus: 'Sem registro',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onCreatePage(newLandingPage);
      onNavigateToEditor(newPageId);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Topo do Assistente */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Assistente de Criação & Motor de Sugestão
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Recomendação inteligente de modelo, ordem das seções e CTA com base no perfil de divulgação.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Parâmetros */}
        <div className="lg:col-span-2 space-y-5">
          {/* 1. Selecionar Cliente */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Selecione o Cliente Vinculado
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.publicProfile.publicName || c.identificationName} ({c.type} • {c.publicProfile.activity})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Definir Objetivo */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              2. Qual o Objetivo Principal da Landing Page?
            </label>

            <div className="grid grid-cols-1 gap-2">
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGoal(preset)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    goal === preset
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Ou digite um objetivo personalizado:
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 3. Escolher / Trocar Modelo */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Modelo de Estrutura
              </label>
              {suggestion && chosenTemplate === suggestion.recommendedTemplate && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Recomendado pelo Motor
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { id: 'food-coffee', name: '☕ Cafeteria Gourmet', desc: 'BODREN: Grãos & Quiz' },
                { id: 'food-restaurant', name: '🍣 Restaurante Sushi', desc: 'Hush: Combos & Mesas' },
                { id: 'advocacia', name: '⚖️ Advocacia & Leis', desc: 'Creative Law: Ouro & OAB' },
                { id: 'beleza-unhas', name: '💅 Cabelo & Nail Bar', desc: 'Studio Glow: Procedimentos' },
                { id: 'portfolio', name: '🏛️ Portfólio', desc: 'Galeria visual e fotos' },
                { id: 'services', name: '💼 Serviços', desc: 'Cartões explicativos' },
                { id: 'professional', name: '👔 Profissional', desc: 'Apresentação & autoridade' },
                { id: 'campaign', name: '🚀 Campanha', desc: 'Oferta direta e urgência' },
              ].map((m) => {
                const isSelected = chosenTemplate === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setChosenTemplate(m.id as TemplateType)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-xs font-bold">{m.name}</div>
                    <div className={`text-[10px] mt-1 ${isSelected ? 'text-blue-100 font-medium' : 'text-slate-400'}`}>
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Painel Direito: Resumo da Recomendação Explicada */}
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs sticky top-24">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Proposta da Recomendação
              </h3>
            </div>

            {suggestion && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Modelo Proposto:</span>
                  <div className="font-bold text-slate-900 dark:text-white capitalize text-sm">
                    {chosenTemplate}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {suggestion.justification}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">CTA Inicial:</span>
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    "{suggestion.recommendedCta}"
                  </div>
                </div>

                {suggestion.missingItems.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Pendências no Perfil Público:</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                      {suggestion.missingItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-amber-600 mt-1">
                      O rascunho será gerado normalmente, mas a aprovação final requer o preenchimento desses itens.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={creating}
                    onClick={handleCreate}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                  >
                    {creating ? 'Criando Rascunho...' : 'Aplicar Sugestão & Abrir Editor'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
