import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Smartphone,
  Globe,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Layers,
  ExternalLink,
  CheckCircle2,
  FlaskConical,
  Play,
  Pause,
  Trophy,
  Zap,
  Plus,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Trash2,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { LandingPage, Client, ABTest } from '../../types';
import { generateAnalyticsData } from '../../services/analyticsData';
import { generateAnalyticsPdfReport } from '../../services/pdfReportGenerator';
import { AppRepository } from '../../services/storage';
import { ABTestModal } from './ABTestModal';
import { useTheme } from '../../context/ThemeContext';

interface AnalyticsDashboardProps {
  pages: LandingPage[];
  clients: Client[];
  onOpenPageEditor: (pageId: string) => void;
  onPageUpdated?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  pages,
  clients,
  onOpenPageEditor,
  onPageUpdated,
}) => {
  const { isDark } = useTheme();

  // Aba ativa do Hub de Analytics: 'overview' (Visão Geral de Tráfego) ou 'ab_testing' (Testes A/B)
  const [activeTab, setActiveTab] = useState<'overview' | 'ab_testing'>('overview');

  // Filtros Gerais
  const [periodDays, setPeriodDays] = useState<7 | 30 | 90>(30);
  const [selectedPageId, setSelectedPageId] = useState<string>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Estados dos Testes A/B
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [abStatusFilter, setAbStatusFilter] = useState<'all' | 'running' | 'concluded' | 'paused'>('all');
  const [isABModalOpen, setIsABModalOpen] = useState(false);
  const [simulatingTestId, setSimulatingTestId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Carrega testes A/B do armazenamento criptografado
  const loadABTests = useCallback(async () => {
    try {
      const tests = await AppRepository.getABTests();
      setAbTests(tests);
    } catch (e) {
      console.error('Erro ao carregar testes A/B:', e);
    }
  }, []);

  useEffect(() => {
    loadABTests();
  }, [loadABTests]);

  // Toast temporário
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Dados calculados de Analytics Geral
  const analytics = useMemo(() => {
    return generateAnalyticsData(pages, periodDays, selectedPageId);
  }, [pages, periodDays, selectedPageId]);

  // Testes filtrados
  const filteredABTests = useMemo(() => {
    return abTests.filter((t) => {
      if (selectedPageId !== 'all' && t.pageId !== selectedPageId) return false;
      if (abStatusFilter !== 'all' && t.status !== abStatusFilter) return false;
      return true;
    });
  }, [abTests, selectedPageId, abStatusFilter]);

  // Métricas agregadas dos Testes A/B
  const abMetrics = useMemo(() => {
    const running = abTests.filter((t) => t.status === 'running');
    const concluded = abTests.filter((t) => t.status === 'concluded');
    const withConfidence = abTests.filter((t) => t.significanceReached);
    const avgLift =
      abTests.length > 0
        ? Number((abTests.reduce((acc, t) => acc + t.liftPercent, 0) / abTests.length).toFixed(1))
        : 0;
    const totalViewsTested = abTests.reduce(
      (acc, t) => acc + t.variationA.views + t.variationB.views,
      0
    );
    const totalConvsTested = abTests.reduce(
      (acc, t) => acc + t.variationA.conversions + t.variationB.conversions,
      0
    );

    return {
      total: abTests.length,
      runningCount: running.length,
      concludedCount: concluded.length,
      significantCount: withConfidence.length,
      avgLift,
      totalViewsTested,
      totalConvsTested,
    };
  }, [abTests]);

  // Handlers para Testes A/B
  const handleSaveABTest = async (newTest: ABTest) => {
    await AppRepository.saveABTest(newTest);
    await loadABTests();
    showToast(`Teste A/B "${newTest.title}" criado e iniciado com sucesso!`);
  };

  const handleSimulateTraffic = async (testId: string) => {
    setSimulatingTestId(testId);
    try {
      const updated = await AppRepository.simulateABTestTraffic(testId);
      await loadABTests();
      showToast(
        `Tráfego simulado no teste! Variação B atingiu ${updated.variationB.conversionRate}% (+${updated.liftPercent}% de lift).`,
        'info'
      );
    } catch (e) {
      console.error('Erro ao simular tráfego:', e);
    } finally {
      setSimulatingTestId(null);
    }
  };

  const handleToggleStatus = async (test: ABTest) => {
    const newStatus: ABTest['status'] = test.status === 'running' ? 'paused' : 'running';
    const updated: ABTest = { ...test, status: newStatus, updatedAt: new Date().toISOString() };
    await AppRepository.saveABTest(updated);
    await loadABTests();
    showToast(`Teste A/B ${newStatus === 'running' ? 'retomado' : 'pausado'}.`);
  };

  const handleConcludeAndApply = async (testId: string, winner: 'A' | 'B') => {
    try {
      const { test, updatedPage } = await AppRepository.concludeABTest(testId, winner, true);
      await loadABTests();
      if (onPageUpdated) onPageUpdated();
      showToast(
        `🏆 Vencedora Variação ${winner} declarada e aplicada à Landing Page "${test.pageTitle}" com sucesso!`,
        'success'
      );
    } catch (e) {
      console.error('Erro ao concluir teste A/B:', e);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (confirm('Deseja realmente excluir este teste A/B?')) {
      await AppRepository.deleteABTest(testId);
      await loadABTests();
      showToast('Teste A/B removido.');
    }
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      const pageTitle =
        selectedPageId === 'all'
          ? 'Todas as Landing Pages'
          : pages.find((p) => p.id === selectedPageId)?.title || 'Landing Page Individual';

      generateAnalyticsPdfReport({
        analytics,
        periodDays,
        pageFilterTitle: pageTitle,
        adminName: 'Admin Principal',
        abTests: filteredABTests,
      });

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (e) {
      console.error('Erro ao gerar relatório PDF:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const tooltipContentStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    fontSize: '12px',
    padding: '10px 14px',
  };

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast de Notificação */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom duration-300 border ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-indigo-600 text-white border-indigo-500'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Topo do Hub de Analytics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Hub de Analytics &amp; Conversão
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Desempenho de acessos, testes A/B de headlines e conversões em WhatsApp das Landing Pages.
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Ações */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Seletor de Página */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Landing Pages ({pages.length})</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Período (apenas na aba de visão geral) */}
          {activeTab === 'overview' && (
            <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-semibold">
              {[
                { days: 7, label: '7 dias' },
                { days: 30, label: '30 dias' },
                { days: 90, label: '90 dias' },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setPeriodDays(item.days as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    periodDays === item.days
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Botão para Criar Teste A/B Rápido */}
          <button
            type="button"
            onClick={() => setIsABModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Teste A/B</span>
          </button>

          {/* Botão de Exportação em PDF */}
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleExportPdf}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 ${
              pdfSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
            }`}
            title="Exportar Relatório Executivo em PDF incluindo Tráfego e Testes A/B"
          >
            {pdfSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>PDF Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExportingPdf ? 'Gerando...' : 'Relatório PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Seletor de Seções do Hub: Visão Geral vs Testes A/B */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Visão Geral de Tráfego &amp; Funil
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ab_testing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ab_testing'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-indigo-500" />
            Testes A/B &amp; Otimização
            {abMetrics.runningCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {abMetrics.runningCount} Ativos
              </span>
            )}
          </button>
        </div>

        {activeTab === 'ab_testing' && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500 text-[11px] mr-1">Filtrar Status:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'running', label: 'Em Andamento' },
              { id: 'concluded', label: 'Concluídos' },
              { id: 'paused', label: 'Pausados' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAbStatusFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  abStatusFilter === f.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: VISÃO GERAL DE TRÁFEGO E CONVERSÃO */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Banner de Teste A/B Ativo com Maior Impacto */}
          {abTests.find((t) => t.status === 'running') && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Otimização A/B em Andamento</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      +{abTests.find((t) => t.status === 'running')?.liftPercent}% de Ganho na Variação B 🚀
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    O teste &quot;{abTests.find((t) => t.status === 'running')?.title}&quot; já atingiu{' '}
                    {abTests.find((t) => t.status === 'running')?.statisticalConfidence}% de confiança estatística.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ab_testing')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-95 whitespace-nowrap self-start sm:self-auto"
              >
                Ver Experimentos A/B
              </button>
            </div>
          )}

          {/* Grid de KPIs Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Visualizações Totais */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Visualizações de Página
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.totalViews.toLocaleString('pt-BR')}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{analytics.viewsTrend}% vs período anterior</span>
              </div>
            </div>

            {/* KPI 2: Visitantes Únicos */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Visitantes Únicos
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.uniqueVisitors.toLocaleString('pt-BR')}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{analytics.visitorsTrend}% novos acessos</span>
              </div>
            </div>

            {/* KPI 3: Conversões / Cliques WhatsApp */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Conversões (Cliques no CTA)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.totalConversions.toLocaleString('pt-BR')}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{analytics.conversionsTrend}% contatos iniciados</span>
              </div>
            </div>

            {/* KPI 4: Taxa Média de Conversão */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Taxa de Conversão
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.avgConversionRate}%
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{analytics.rateTrend}%
                </span>
                <span>Tempo médio: {analytics.avgTimeOnPage}</span>
              </div>
            </div>
          </div>

          {/* Gráfico Principal 1: Evolução Temporal com AreaChart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Evolução Diária de Tráfego e Conversões
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comparação entre visualizações totais, visitantes únicos e cliques no botão de WhatsApp / CTA.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Visualizações
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 ml-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Conversões
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="displayDate" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipContentStyle} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Visualizações"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    name="Conversões"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorConversions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráficos 2 e 3: Fontes de Tráfego e Dispositivos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fontes de Tráfego */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-pink-500" />
                    Fontes de Aquisição de Tráfego
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Origem de onde os visitantes estão acessando as Landing Pages.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.trafficSources}
                        dataKey="share"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {analytics.trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipContentStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5">
                  {analytics.trafficSources.map((src) => (
                    <div key={src.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[130px]">
                          {src.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{src.share}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Funil de Conversão */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Funil de Conversão das Páginas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Jornada do visitante desde a primeira visualização até o clique de contato.
                  </p>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={analytics.funnelData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis type="number" stroke={textColor} fontSize={11} domain={[0, 100]} />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      stroke={textColor}
                      fontSize={10}
                      width={120}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipContentStyle} />
                    <Bar dataKey="percentage" name="% de Retenção" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabela de Desempenho por Landing Page */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Desempenho Individual por Landing Page
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Métricas de tráfego, taxa de conversão e canal comercial preferido de cada cliente.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Página</th>
                    <th className="py-3 px-4">Template</th>
                    <th className="py-3 px-4">Visualizações</th>
                    <th className="py-3 px-4">Conversões</th>
                    <th className="py-3 px-4">Taxa de Conversão</th>
                    <th className="py-3 px-4">Tempo Médio</th>
                    <th className="py-3 px-4">Canal Principal</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {analytics.pagesPerformance.map((pagePerf) => (
                    <tr key={pagePerf.pageId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{pagePerf.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 font-normal">/{pagePerf.slug}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {pagePerf.template}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {pagePerf.views.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {pagePerf.conversions.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                          {pagePerf.conversionRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{pagePerf.avgTimeOnPage}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {pagePerf.primaryChannel}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenPageEditor(pagePerf.pageId)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300"
                        >
                          Abrir Editor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: TESTES A/B & OTIMIZAÇÃO DE CONVERSÃO */}
      {/* ========================================================================= */}
      {activeTab === 'ab_testing' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Cards de Métricas de Testes A/B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Testes Ativos
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {abMetrics.runningCount}{' '}
                <span className="text-xs font-normal text-slate-400">/ {abMetrics.total} totais</span>
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                Divisão de tráfego dinâmica ativa
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ganho Médio (Lift)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                +{abMetrics.avgLift}% 🚀
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Variações B superando controle
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Certeza Estatística
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {abMetrics.significantCount}{' '}
                <span className="text-xs font-normal text-slate-400">de {abMetrics.total} testes</span>
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                Nível de confiança &gt; 95%
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Acessos em Experimentos
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {abMetrics.totalViewsTested.toLocaleString('pt-BR')}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {abMetrics.totalConvsTested.toLocaleString('pt-BR')} contatos comparados
              </div>
            </div>
          </div>

          {/* Lista de Experimentos A/B com Visualização Lado a Lado e Gráficos */}
          <div className="space-y-6">
            {filteredABTests.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <FlaskConical className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Nenhum teste A/B encontrado para os filtros selecionados
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  Crie um novo teste para comparar duas variações de headline, cupom de desconto ou cor de botão na mesma Landing Page.
                </p>
                <button
                  type="button"
                  onClick={() => setIsABModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Criar Primeiro Teste A/B
                </button>
              </div>
            ) : (
              filteredABTests.map((test) => {
                const isRunning = test.status === 'running';
                const isConcluded = test.status === 'concluded';
                const winner = test.winnerVariation;
                const isBWinning = test.liftPercent > 0;

                return (
                  <div
                    key={test.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 transition-all hover:shadow-md"
                  >
                    {/* Cabeçalho do Card de Teste */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                              isRunning
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : isConcluded
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-current'
                              }`}
                            />
                            {isRunning ? 'Em Andamento' : isConcluded ? 'Concluído' : 'Pausado'}
                          </span>

                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Split {test.trafficSplitPercent}% / {100 - test.trafficSplitPercent}%
                          </span>

                          <span className="text-slate-300 dark:text-slate-700">•</span>

                          <button
                            type="button"
                            onClick={() => onOpenPageEditor(test.pageId)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>{test.pageTitle}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>

                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                          {test.title}
                        </h2>

                        <div className="mt-1 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Hipótese:</strong> {test.hypothesis}
                          </span>
                        </div>
                      </div>

                      {/* Botões de Ação do Teste */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Botão de Simulação de Tráfego em Tempo Real */}
                        {isRunning && (
                          <button
                            type="button"
                            disabled={simulatingTestId === test.id}
                            onClick={() => handleSimulateTraffic(test.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/80 transition-all flex items-center gap-1.5"
                            title="Simula 20 acessos imediatos divididos entre as variações para ver a estatística recalcular em tempo real"
                          >
                            <Zap className="w-3.5 h-3.5 text-indigo-500" />
                            {simulatingTestId === test.id ? 'Simulando...' : 'Simular Tráfego (+20)'}
                          </button>
                        )}

                        {/* Botão para Concluir e Aplicar Vencedora */}
                        {isRunning && (
                          <button
                            type="button"
                            onClick={() => handleConcludeAndApply(test.id, isBWinning ? 'B' : 'A')}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                            title="Aplica a headline e o CTA da variação vencedora diretamente na Landing Page oficial"
                          >
                            <Trophy className="w-3.5 h-3.5 text-amber-300" />
                            Aplicar Vencedora (Var {isBWinning ? 'B' : 'A'})
                          </button>
                        )}

                        {/* Botão Pausar / Retomar */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(test)}
                          className="p-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={isRunning ? 'Pausar Teste' : 'Retomar Teste'}
                        >
                          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500" />}
                        </button>

                        {/* Excluir Teste */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTest(test.id)}
                          className="p-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Excluir Teste A/B"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Comparação Visual Lado a Lado: Variação A vs Variação B */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* CARTÃO VARIAÇÃO A (CONTROLE) */}
                      <div
                        className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 ${
                          winner === 'A'
                            ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center">
                                A
                              </span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                {test.variationA.name}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Controle ({test.trafficSplitPercent}%)
                            </span>
                          </div>

                          <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-2">
                            &ldquo;{test.variationA.headline}&rdquo;
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {test.variationA.subtitle}
                          </p>

                          <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: test.variationA.primaryColor }}
                            />
                            <span>CTA: &ldquo;{test.variationA.ctaLabel}&rdquo;</span>
                          </div>
                        </div>

                        {/* Métricas da Variação A */}
                        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">Taxa de Conversão</div>
                              <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {test.variationA.conversionRate}%
                              </div>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              <strong>{test.variationA.conversions}</strong> contatos / {test.variationA.views} views
                            </div>
                          </div>

                          {/* Barra de Progresso da Taxa */}
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, test.variationA.conversionRate * 4)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* CARTÃO VARIAÇÃO B (DESAFIANTE) */}
                      <div
                        className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 shadow-sm ${
                          winner === 'B'
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                            : isBWinning
                            ? 'border-indigo-500/80 dark:border-indigo-500/60 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-indigo-500/5'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                                B
                              </span>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                {test.variationB.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {test.variationB.campaignBadge && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  {test.variationB.campaignBadge}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                                Desafiante ({100 - test.trafficSplitPercent}%)
                              </span>
                            </div>
                          </div>

                          <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-2">
                            &ldquo;{test.variationB.headline}&rdquo;
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {test.variationB.subtitle}
                          </p>

                          <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: test.variationB.primaryColor }}
                            />
                            <span>CTA: &ldquo;{test.variationB.ctaLabel}&rdquo;</span>
                          </div>
                        </div>

                        {/* Métricas da Variação B com Ganho (Lift) e Confiança */}
                        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                                <span>Taxa de Conversão</span>
                                {test.liftPercent > 0 ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded">
                                    +{test.liftPercent}% Lift 🚀
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[11px]">
                                    {test.liftPercent}% Lift
                                  </span>
                                )}
                              </div>
                              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {test.variationB.conversionRate}%
                              </div>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              <strong>{test.variationB.conversions}</strong> contatos / {test.variationB.views} views
                            </div>
                          </div>

                          {/* Barra de Progresso da Taxa */}
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, test.variationB.conversionRate * 4)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Confiança Estatística e Gráfico Diário de Evolução da Taxa */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Confiança Estatística:{' '}
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {test.statisticalConfidence}%
                            </span>
                          </span>
                          {test.significanceReached && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              Estatisticamente Significante (p &lt; 0.05)
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Evolução diária da taxa de conversão (%):
                        </div>
                      </div>

                      {/* Gráfico Comparativo de Linhas de A vs B */}
                      {test.dailyMetrics && test.dailyMetrics.length > 0 && (
                        <div className="h-32 w-full pt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={test.dailyMetrics}
                              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                              <XAxis dataKey="displayDate" stroke={textColor} fontSize={10} tickLine={false} />
                              <YAxis stroke={textColor} fontSize={10} tickLine={false} />
                              <Tooltip contentStyle={tooltipContentStyle} />
                              <Line
                                type="monotone"
                                dataKey="rateA"
                                name="Taxa Var A (%)"
                                stroke="#64748b"
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="rateB"
                                name="Taxa Var B (%)"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: '#6366f1' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal para Criação de Teste A/B */}
      <ABTestModal
        isOpen={isABModalOpen}
        onClose={() => setIsABModalOpen(false)}
        pages={pages}
        clients={clients}
        initialPageId={selectedPageId !== 'all' ? selectedPageId : undefined}
        onSaveTest={handleSaveABTest}
      />
    </div>
  );
};
