import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Search,
  Zap,
  Building2,
  Stethoscope,
  Code2,
  Activity,
  Flame,
  ArrowUp,
  ArrowDown,
  Globe,
  ShieldCheck,
  ArrowUpRight,
  Coffee,
  UtensilsCrossed,
  Scale,
  FlaskConical,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Client, LandingPage, AuditEvent } from '../../types';

interface AdminDashboardProps {
  clients: Client[];
  pages: LandingPage[];
  auditLogs: AuditEvent[];
  onNavigate: (tab: string, contextId?: string) => void;
  onOpenNewClientModal: () => void;
  onOpenPageWizard: (clientId?: string) => void;
}

interface HeroItem {
  id: string;
  pageId?: string;
  clientId?: string;
  category: string;
  categoryIcon: React.ComponentType<{ className?: string }>;
  title: string;
  clientName: string;
  odds1: string;
  payout1: string;
  label1: string;
  odds2: string;
  payout2: string;
  label2: string;
  volume: string;
  news: string;
  chartData: { time: string; organic: number; conv: number }[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  clients,
  pages,
  auditLogs,
  onNavigate,
  onOpenNewClientModal,
  onOpenPageWizard,
}) => {
  // Estado para filtro por categorias (Pill bar)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [heroIndex, setHeroIndex] = useState<number>(0);

  // Categorias disponíveis na barra de sub-navegação
  const categories = [
    'Todas',
    'Cafeteria & Comida',
    'Restaurante & Sushi',
    'Advocacia & Leis',
    'Cabelo & Nail Bar',
    'Portfólio',
    'Serviços & Negócios',
    'Campanhas',
    'Aprovadas',
    'Em Revisão',
  ];

  // Lista de todas as tarefas da carteira
  const allTasks = useMemo(() => {
    return clients.flatMap(c =>
      c.tasks.map(t => ({
        ...t,
        clientName: c.publicProfile.publicName || c.identificationName,
        clientId: c.id,
      }))
    );
  }, [clients]);

  const openTasks = useMemo(() => allTasks.filter(t => t.status === 'Aberta'), [allTasks]);

  // Itens em destaque no Hero Card (rotacionáveis)
  const heroItems: HeroItem[] = useMemo(() => {
    if (pages.length === 0) {
      return [
        {
          id: 'placeholder',
          category: 'LANDINGPRO CORE',
          categoryIcon: Globe,
          title: 'Sistema de Landing Pages Determinístico v3.0',
          clientName: 'Central Administrativa',
          odds1: '94%',
          payout1: '1.06x',
          label1: 'Conformidade Técnica v3.0',
          odds2: '32%',
          payout2: '3.12x',
          label2: 'Taxa Média de Conversão',
          volume: '24,850 visualizações',
          news: 'Motor de geração determinístico em execução contínua com Web Crypto API nativa, exportação em pacotes ZIP e analytics em tempo real.',
          chartData: [
            { time: 'Jan', organic: 45, conv: 18 },
            { time: 'Fev', organic: 58, conv: 22 },
            { time: 'Mar', organic: 64, conv: 20 },
            { time: 'Abr', organic: 72, conv: 28 },
            { time: 'Mai', organic: 85, conv: 31 },
            { time: 'Jun', organic: 94, conv: 34 },
          ],
        },
      ];
    }

    return pages.map((page, idx) => {
      const client = clients.find(c => c.id === page.clientId);
      const rev = page.revisions.find(r => r.id === page.currentRevisionId);
      const isApproved = rev?.editorialStatus === 'Aprovada';

      const categoryLabel =
        page.template === 'food-coffee'
          ? 'CAFETERIA GOURMET (BODREN)'
          : page.template === 'food-restaurant'
          ? 'RESTAURANTE SUSHI (HUSH)'
          : page.template === 'advocacia'
          ? 'ADVOCACIA & LEIS'
          : page.template === 'beleza-unhas'
          ? 'CABELO & NAIL BAR'
          : page.template === 'portfolio'
          ? 'PORTFÓLIO & FOTOS'
          : page.template === 'services' || page.template === 'professional'
          ? 'SERVIÇOS & NEGÓCIOS'
          : 'CAMPANHA & OFERTA';

      const CategoryIcon =
        page.template === 'food-coffee'
          ? Coffee
          : page.template === 'food-restaurant'
          ? UtensilsCrossed
          : page.template === 'advocacia'
          ? Scale
          : page.template === 'beleza-unhas'
          ? Sparkles
          : page.template === 'portfolio'
          ? Building2
          : page.template === 'services' || page.template === 'professional'
          ? Code2
          : Stethoscope;

      const activeSectionsCount = rev?.config?.sectionsEnabled
        ? Object.values(rev.config.sectionsEnabled).filter(Boolean).length
        : 6;

      return {
        id: page.id,
        pageId: page.id,
        clientId: page.clientId,
        category: categoryLabel,
        categoryIcon: CategoryIcon,
        title: `${page.title} — Rev #${rev?.revisionNumber || 1}`,
        clientName: client?.publicProfile.publicName || client?.identificationName || 'Cliente',
        odds1: isApproved ? '88%' : '42%',
        payout1: isApproved ? '1.14x' : '2.38x',
        label1: isApproved ? 'Aprovação Editorial Confirmada' : 'Aguardando Aprovação do Cliente',
        odds2: idx % 2 === 0 ? '24%' : '19%',
        payout2: idx % 2 === 0 ? '3.96x' : '4.80x',
        label2: 'Taxa de Conversão Estimada',
        volume: `${(12 + idx * 4.3).toFixed(1)}k visualizações`,
        news: `Página com ${activeSectionsCount} seções determinísticas geradas, layout responsivo mobile-first, paleta refinada e pronta para exportação de código puro em ZIP.`,
        chartData: [
          { time: 'Jan', organic: 30 + idx * 8, conv: 12 + idx * 3 },
          { time: 'Fev', organic: 42 + idx * 6, conv: 15 + idx * 2 },
          { time: 'Mar', organic: 55 + idx * 5, conv: 18 + idx * 3 },
          { time: 'Abr', organic: 68 + idx * 7, conv: 21 + idx * 2 },
          { time: 'Mai', organic: 79 + idx * 6, conv: 24 + idx * 3 },
          { time: 'Jun', organic: 88 + idx * 4, conv: 27 + idx * 4 },
        ],
      };
    });
  }, [pages, clients]);

  const currentHero = heroItems[heroIndex % heroItems.length] || heroItems[0];

  // Filtra as landing pages de acordo com a categoria selecionada e busca
  const filteredPages = useMemo(() => {
    return pages.filter(p => {
      const client = clients.find(c => c.id === p.clientId);
      const rev = p.revisions.find(r => r.id === p.currentRevisionId);

      // Busca por texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesClient = (
          client?.publicProfile.publicName ||
          client?.identificationName ||
          ''
        )
          .toLowerCase()
          .includes(term);
        const matchesTemplate = p.template.toLowerCase().includes(term);
        if (!matchesTitle && !matchesClient && !matchesTemplate) return false;
      }

      // Filtro de categoria
      if (selectedCategory === 'Todas') return true;
      if (selectedCategory === 'Cafeteria & Comida') return p.template === 'food-coffee';
      if (selectedCategory === 'Restaurante & Sushi') return p.template === 'food-restaurant';
      if (selectedCategory === 'Advocacia & Leis') return p.template === 'advocacia';
      if (selectedCategory === 'Cabelo & Nail Bar') return p.template === 'beleza-unhas';
      if (selectedCategory === 'Portfólio') return p.template === 'portfolio';
      if (selectedCategory === 'Serviços & Negócios')
        return p.template === 'services' || p.template === 'professional';
      if (selectedCategory === 'Campanhas') return p.template === 'campaign';
      if (selectedCategory === 'Aprovadas') return rev?.editorialStatus === 'Aprovada';
      if (selectedCategory === 'Em Revisão')
        return rev?.editorialStatus === 'Em revisão' || rev?.editorialStatus === 'Rascunho';
      return true;
    });
  }, [pages, clients, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6 text-slate-100 animate-in fade-in duration-200">
      {/* 1. SUB-NAVBAR KALSHI: Categorias e Tags Horizontais */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-[#1E2638] scrollbar-none text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 font-bold text-[#00E599] uppercase tracking-wider text-[11px] pr-2 border-r border-[#1E2638]">
            <Flame className="w-3.5 h-3.5 text-[#00E599]" />
            Trending
          </span>

          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#1E293B] text-white border border-[#38BDF8]/60 shadow-sm shadow-[#38BDF8]/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111622] border border-transparent'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Busca rápida na sub-bar */}
        <div className="hidden lg:flex items-center gap-2 bg-[#0F141F] border border-[#1E2638] rounded-full px-3 py-1 text-xs text-slate-300 w-56 shrink-0 focus-within:border-[#00E599]/60">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filtrar por nome..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-500 text-slate-200"
          />
        </div>
      </div>

      {/* 2. LAYOUT PRINCIPAL: 2 Colunas (Esquerda 2/3 Conteúdo + Direita 1/3 Sidebar Kalshi) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA (8 / 12) */}
        <div className="lg:col-span-8 space-y-8">
          {/* HERO TERMINAL CARD (Estilo Fed Decision do Kalshi) */}
          <div className="bg-[#0E131F] border border-[#1E2638] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group">
            {/* Linha de topo: Tag com ícone + Paginação interativa */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#38BDF8] flex items-center justify-center">
                  <currentHero.categoryIcon className="w-4 h-4 text-[#38BDF8]" />
                </div>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#38BDF8]">
                  {currentHero.category}
                </span>
                <span className="text-[10px] bg-[#162032] text-slate-400 px-2 py-0.5 rounded-full border border-[#1E2638]">
                  {currentHero.clientName}
                </span>
              </div>

              {/* Controles de rotação < 1 de N > */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <button
                  type="button"
                  onClick={() =>
                    setHeroIndex(prev => (prev === 0 ? heroItems.length - 1 : prev - 1))
                  }
                  className="w-6 h-6 rounded border border-[#1E2638] bg-[#131926] hover:bg-[#1E2638] flex items-center justify-center text-slate-300 transition-colors"
                  title="Anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] px-1 text-slate-400">
                  {heroIndex + 1} de {heroItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => setHeroIndex(prev => (prev + 1) % heroItems.length)}
                  className="w-6 h-6 rounded border border-[#1E2638] bg-[#131926] hover:bg-[#1E2638] flex items-center justify-center text-slate-300 transition-colors"
                  title="Próximo"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Título Principal */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug mb-5">
              {currentHero.title}
            </h2>

            {/* Grid Interno: Tabela de Odds na Esquerda + Gráfico Kalshi na Direita */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-6 border-b border-[#1E2638]">
              {/* Esquerda: Linhas de mercado com probabilidades (5 / 12) */}
              <div className="md:col-span-5 space-y-3.5">
                <div className="flex items-center justify-between text-[11px] uppercase font-mono text-slate-400 pb-1 border-b border-[#1B2232]">
                  <span>Métrica / Status</span>
                  <div className="flex items-center gap-4">
                    <span>Payout</span>
                    <span>Prob / Odds</span>
                  </div>
                </div>

                {/* Opção 1: Aprovação / Status Editorial */}
                <div className="flex items-center justify-between py-1.5 hover:bg-[#131A28] rounded-lg px-2 -mx-2 transition-colors">
                  <div className="text-xs font-semibold text-slate-200">
                    {currentHero.label1}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400">{currentHero.payout1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        currentHero.pageId && onNavigate('page-editor', currentHero.pageId)
                      }
                      className="px-3 py-1 rounded-full bg-[#132328] hover:bg-[#183438] text-[#00E599] font-mono font-bold text-xs border border-[#00E599]/40 transition-all hover:scale-105"
                    >
                      {currentHero.odds1}
                    </button>
                  </div>
                </div>

                {/* Opção 2: Conversão */}
                <div className="flex items-center justify-between py-1.5 hover:bg-[#131A28] rounded-lg px-2 -mx-2 transition-colors">
                  <div className="text-xs font-semibold text-slate-200">
                    {currentHero.label2}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400">{currentHero.payout2}</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('analytics')}
                      className="px-3 py-1 rounded-full bg-[#121E2E] hover:bg-[#172B44] text-[#38BDF8] font-mono font-bold text-xs border border-[#38BDF8]/40 transition-all hover:scale-105"
                    >
                      {currentHero.odds2}
                    </button>
                  </div>
                </div>

                {/* Linha de volume e revisões */}
                <div className="text-[11px] font-mono text-slate-400 pt-2 flex items-center justify-between">
                  <span>{currentHero.volume}</span>
                  <button
                    type="button"
                    onClick={() =>
                      currentHero.pageId && onNavigate('page-editor', currentHero.pageId)
                    }
                    className="text-[#38BDF8] hover:underline flex items-center gap-1 font-sans"
                  >
                    Abrir Editor <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Snippet Informativo "News" estilo Kalshi */}
                <div className="p-2.5 rounded-xl bg-[#090D14] border border-[#1A2234] text-[11px] text-slate-300 leading-relaxed font-sans">
                  <span className="font-bold text-[#00E599] uppercase mr-1">Status:</span>
                  {currentHero.news}
                </div>
              </div>

              {/* Direita: Gráfico Stepped/Area estilo Kalshi (7 / 12) */}
              <div className="md:col-span-7 space-y-2 bg-[#090D14] p-3.5 rounded-xl border border-[#1A2234]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1 text-[#00E599]">
                      <span className="w-2 h-2 rounded-full bg-[#00E599]" />
                      Tráfego {currentHero.odds1}
                    </span>
                    <span className="flex items-center gap-1 text-[#38BDF8]">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                      Conversão {currentHero.odds2}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                    Evolução Mensal
                  </span>
                </div>

                {/* Gráfico Recharts com estética neon terminal */}
                <div className="h-40 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={currentHero.chartData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="kalshiGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E599" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#00E599" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="kalshiBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="time"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        unit="%"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F141F',
                          borderColor: '#1E2638',
                          borderRadius: '8px',
                          color: '#F1F5F9',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="organic"
                        stroke="#00E599"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#kalshiGreen)"
                      />
                      <Area
                        type="monotone"
                        dataKey="conv"
                        stroke="#38BDF8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#kalshiBlue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 pt-1 border-t border-[#161F2E]">
                  <span className="text-[#00E599] flex items-center gap-0.5">
                    <ArrowUp className="w-3 h-3" /> +38% no tráfego orgânico
                  </span>
                  <span className="text-[#38BDF8] flex items-center gap-0.5">
                    <ArrowUp className="w-3 h-3" /> +6% no funil de conversão
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Pills Institucionais no Rodapé do Hero */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#090D14]/70 border border-[#1A2234] text-left">
                <div className="w-7 h-7 rounded-lg bg-[#00E599]/10 text-[#00E599] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Integridade Cripto</div>
                  <div className="text-[10px] text-slate-400">AES-GCM &amp; JWT Web Crypto</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#090D14]/70 border border-[#1A2234] text-left">
                <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">HTML5 Determinístico</div>
                  <div className="text-[10px] text-slate-400">Zero dependências externas</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#090D14]/70 border border-[#1A2234] hover:border-purple-500/50 text-left transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Analytics Recharts</div>
                  <div className="text-[10px] text-slate-400">Exportação em PDF &amp; Relatório</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#090D14]/70 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Testes A/B</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-indigo-300">Otimização de Conversão</div>
                </div>
              </button>
            </div>
          </div>

          {/* SEÇÃO 1: LANDING PAGES EM PRODUÇÃO (Grid de 2 Colunas Kalshi) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('pages')}
                className="flex items-center gap-2 text-base font-bold text-white hover:text-[#00E599] transition-colors group"
              >
                <span>Landing Pages da Carteira</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#00E599] group-hover:translate-x-0.5 transition-all" />
              </button>
              <button
                type="button"
                onClick={() => onOpenPageWizard()}
                className="text-xs font-semibold text-[#00E599] hover:underline flex items-center gap-1"
              >
                + Nova Sugestão
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPages.map(page => {
                const client = clients.find(c => c.id === page.clientId);
                const rev = page.revisions.find(r => r.id === page.currentRevisionId);
                const isApproved = rev?.editorialStatus === 'Aprovada';

                const CategoryIcon =
                  page.template === 'food-coffee'
                    ? Coffee
                    : page.template === 'food-restaurant'
                    ? UtensilsCrossed
                    : page.template === 'advocacia'
                    ? Scale
                    : page.template === 'beleza-unhas'
                    ? Sparkles
                    : page.template === 'portfolio'
                    ? Building2
                    : page.template === 'services' || page.template === 'professional'
                    ? Code2
                    : Stethoscope;

                const categoryTag =
                  page.template === 'food-coffee'
                    ? 'CAFÉ GOURMET'
                    : page.template === 'food-restaurant'
                    ? 'SUSHI RESTAURANTE'
                    : page.template === 'advocacia'
                    ? 'ADVOCACIA & LEIS'
                    : page.template === 'beleza-unhas'
                    ? 'CABELO & UNHAS'
                    : page.template === 'portfolio'
                    ? 'PORTFÓLIO'
                    : page.template === 'services' || page.template === 'professional'
                    ? 'SERVIÇOS'
                    : 'CAMPANHA';

                return (
                  <div
                    key={page.id}
                    onClick={() => onNavigate('page-editor', page.id)}
                    className="p-4 rounded-xl bg-[#0E131F] border border-[#1E2638] hover:border-[#2D3A52] hover:bg-[#111724] transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-md"
                  >
                    <div>
                      {/* Categoria com ícone */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          <CategoryIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>{categoryTag}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          Rev #{rev?.revisionNumber || 1}
                        </span>
                      </div>

                      {/* Título do Card */}
                      <h3 className="font-bold text-white text-sm group-hover:text-[#38BDF8] transition-colors leading-tight mb-1">
                        {page.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {client?.publicProfile.publicName || client?.identificationName}
                      </p>
                    </div>

                    {/* Linhas de Resultado / Probabilidade */}
                    <div className="space-y-2 pt-2 border-t border-[#192234]">
                      {/* Linha 1: Status Editorial */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium text-[11px]">
                          {isApproved ? 'Aprovação Editorial' : 'Fila Editorial'}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-500 text-[11px]">1.18x</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isApproved
                                ? 'bg-[#102422] text-[#00E599] border-[#00E599]/30'
                                : 'bg-[#291F18] text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {isApproved ? '88%' : '44%'}
                          </span>
                        </div>
                      </div>

                      {/* Linha 2: Conversão Prevista */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium text-[11px]">
                          Taxa de Conversão Est.
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-500 text-[11px]">3.42x</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#131E2C] text-[#38BDF8] border border-[#38BDF8]/30">
                            24%
                          </span>
                        </div>
                      </div>

                      {/* Barra de progresso visual Kalshi */}
                      <div className="w-full bg-[#162032] h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-[#00E599] h-full rounded-full transition-all duration-500"
                          style={{ width: isApproved ? '88%' : '44%' }}
                        />
                      </div>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-[#161F2E]">
                      <span>{page.publicationStatus === 'Publicada informada' ? '🟢 Publicada' : '🟡 Rascunho'}</span>
                      <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-sans">
                        Editar & Exportar <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 2: CARTEIRA DE CLIENTES (Grid de 2 Colunas Kalshi) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('clients')}
                className="flex items-center gap-2 text-base font-bold text-white hover:text-[#00E599] transition-colors group"
              >
                <span>Carteira de Clientes Ativos</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#00E599] group-hover:translate-x-0.5 transition-all" />
              </button>
              <button
                type="button"
                onClick={onOpenNewClientModal}
                className="text-xs font-semibold text-[#00E599] hover:underline flex items-center gap-1"
              >
                + Cadastrar Cliente
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clients.map(client => {
                const clientPages = pages.filter(p => p.clientId === client.id);
                const isPJ = client.type === 'PJ';
                const docFormatted = isPJ
                  ? client.identificationPJ?.cnpj || 'CNPJ Registrado'
                  : client.identificationPF?.cpf || 'CPF Registrado';

                return (
                  <div
                    key={client.id}
                    onClick={() => onNavigate('client-detail', client.id)}
                    className="p-4 rounded-xl bg-[#0E131F] border border-[#1E2638] hover:border-[#2D3A52] hover:bg-[#111724] transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          {isPJ ? (
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span>{isPJ ? 'PESSOA JURÍDICA (PJ)' : 'PESSOA FÍSICA (PF)'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {client.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm group-hover:text-[#00E599] transition-colors leading-tight mb-1">
                        {client.publicProfile.publicName || client.identificationName}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {client.publicProfile.summary || client.publicProfile.activity || 'Cliente cadastrado na central'}
                      </p>
                    </div>

                    {/* Informações estruturadas */}
                    <div className="space-y-2 pt-2 border-t border-[#192234]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium text-[11px]">
                          Documento Principal
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400 text-[11px]">
                            {docFormatted}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#132328] text-[#00E599] border border-[#00E599]/30">
                            VÁLIDO
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium text-[11px]">
                          Páginas Vinculadas
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400 text-[11px]">
                            {clientPages.length} landing pages
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#131E2C] text-[#38BDF8] border border-[#38BDF8]/30">
                            ATIVAS
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-[#162032] h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-[#38BDF8] h-full rounded-full"
                          style={{ width: clientPages.length > 0 ? '100%' : '30%' }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-[#161F2E]">
                      <span>{client.tasks.length} tarefas associadas</span>
                      <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-sans">
                        Ficha Completa <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 3: TAREFAS & REVISÕES PENDENTES (2 Colunas Kalshi) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white">Fila de Tarefas Operacionais</h3>
              </div>
              <span className="text-xs font-mono text-purple-400">
                {openTasks.length} tarefas pendentes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {openTasks.length === 0 ? (
                <div className="col-span-2 p-6 rounded-xl bg-[#0E131F] border border-[#1E2638] text-center text-xs text-slate-500">
                  Nenhuma tarefa operacional pendente no momento.
                </div>
              ) : (
                openTasks.slice(0, 4).map(task => (
                  <div
                    key={task.id}
                    onClick={() => onNavigate('client-detail', task.clientId)}
                    className="p-4 rounded-xl bg-[#0E131F] border border-[#1E2638] hover:border-[#2D3A52] hover:bg-[#111724] transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {task.clientName}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'alta'
                              ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                              : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-[#192234]">
                      <span>Prazo: {task.dueDate}</span>
                      <span className="text-[#00E599] flex items-center gap-1 font-sans">
                        Conferir <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA / SIDEBAR (4 / 12) - Estilo Kalshi Top Movers & Trending */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Banner "LandingPro Engine" (Estilo Kalshi Pro da Imagem) */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#132228] via-[#0E1724] to-[#0A101A] border border-[#00E599]/30 p-5 overflow-hidden shadow-xl">
            {/* Efeito Glow / Círculo decorativo */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-[#00E599]/10 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-black tracking-wider text-white">
                  LandingPro
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#00E599] text-[#080A0E]">
                  PRO v3.0
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-[#00E599]" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Assistente de sugestão determinística com estruturação automática de cópia, paletas
              editorial, seções de conversão e exportação ZIP.
            </p>

            <button
              type="button"
              onClick={() => onOpenPageWizard()}
              className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-[#00E599] hover:text-[#080A0E] text-[#00E599] font-bold text-xs border border-[#00E599]/60 transition-all text-center flex items-center justify-center gap-2 group shadow-sm hover:shadow-[#00E599]/20"
            >
              <span>Sugerir Landing Page</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* 2. Quick Hubs (Estilo Midterms Hub & Perpetual Hub do Kalshi) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="w-full p-3.5 rounded-xl bg-[#0E131F] border border-[#1E2638] hover:border-[#2E3C56] hover:bg-[#121927] transition-all text-left flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-white text-xs group-hover:text-[#38BDF8] transition-colors">
                  Hub de Analytics & Conversões
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  14,820 visualizações • Relatório PDF
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('security')}
              className="w-full p-3.5 rounded-xl bg-[#0E131F] border border-[#1E2638] hover:border-[#2E3C56] hover:bg-[#121927] transition-all text-left flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-white text-xs group-hover:text-[#00E599] transition-colors">
                  Auditoria Criptográfica & Logs
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {auditLogs.length} eventos • Exportar CSV
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* 3. Seção "Trending" com Variações (Estilo Kalshi Trending Sidebar) */}
          <div className="p-4 rounded-2xl bg-[#0E131F] border border-[#1E2638] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A2234]">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#00E599]" />
                Trending
              </span>
              <button
                type="button"
                onClick={() => onNavigate('pages')}
                className="text-[10px] font-mono text-slate-500 hover:text-white"
              >
                Ver ranking &gt;
              </button>
            </div>

            <div className="space-y-2.5">
              {pages.slice(0, 3).map((page, i) => {
                const odds = i === 0 ? '77%' : i === 1 ? '47%' : '17%';
                const delta = i === 0 ? '+5%' : i === 1 ? '-15%' : '+8%';
                const isPositive = delta.startsWith('+');

                return (
                  <div
                    key={page.id}
                    onClick={() => onNavigate('page-editor', page.id)}
                    className="flex items-center justify-between text-xs py-1 hover:bg-[#131926] px-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="font-semibold text-slate-200 group-hover:text-[#38BDF8] line-clamp-1 text-xs">
                        {page.title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {page.template}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="font-bold text-white text-xs">{odds}</div>
                      <div
                        className={`text-[10px] flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-[#00E599]' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUp className="w-2.5 h-2.5" />
                        ) : (
                          <ArrowDown className="w-2.5 h-2.5" />
                        )}
                        {delta}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Seção "Top Movers" (Estilo Kalshi Top Movers) */}
          <div className="p-4 rounded-2xl bg-[#0E131F] border border-[#1E2638] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A2234]">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8]" />
                Top Movers
              </span>
              <span className="text-[10px] font-mono text-slate-500">24h Delta</span>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigate('analytics')}
                className="flex items-center justify-between text-xs py-1 hover:bg-[#131926] px-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-[#38BDF8] text-xs">
                    Marina Silveira - Portfólio v2
                  </div>
                  <div className="text-[10px] text-slate-500">Arquitetura Minimalista</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-white text-xs">88%</div>
                  <div className="text-[10px] text-[#00E599] flex items-center justify-end gap-0.5">
                    <ArrowUp className="w-2.5 h-2.5" /> +83
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigate('analytics')}
                className="flex items-center justify-between text-xs py-1 hover:bg-[#131926] px-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-[#38BDF8] text-xs">
                    Carlos Tech - Cloud Consulting
                  </div>
                  <div className="text-[10px] text-slate-500">Serviços Profissionais</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-white text-xs">64%</div>
                  <div className="text-[10px] text-red-400 flex items-center justify-end gap-0.5">
                    <ArrowDown className="w-2.5 h-2.5" /> -12
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigate('analytics')}
                className="flex items-center justify-between text-xs py-1 hover:bg-[#131926] px-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-[#38BDF8] text-xs">
                    Dra. Beatriz - Dermatologia
                  </div>
                  <div className="text-[10px] text-slate-500">Campanha Especial</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-white text-xs">79%</div>
                  <div className="text-[10px] text-[#00E599] flex items-center justify-end gap-0.5">
                    <ArrowUp className="w-2.5 h-2.5" /> +24
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Seção "Highest Volume" / Mais Acessadas */}
          <div className="p-4 rounded-2xl bg-[#0E131F] border border-[#1E2638] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A2234]">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                Maior Tráfego & Volume
              </span>
              <span className="text-[10px] font-mono text-slate-500">Visualizações</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#090D14] border border-[#192234] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Marina Silveira Arquitetura</span>
                  <span className="font-mono text-[#00E599] font-bold">14.8k vol</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Taxa de conversão: 24.2% • 86 leads WhatsApp
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090D14] border border-[#192234] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Carlos Mendes Cloud Tech</span>
                  <span className="font-mono text-[#38BDF8] font-bold">8.9k vol</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Taxa de conversão: 18.5% • 42 agendamentos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RODAPÉ INSTITUCIONAL (Estilo Kalshi Footer Multi-Colunas) */}
      <footer className="mt-14 pt-8 border-t border-[#1E2638] text-xs text-slate-400 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-mono uppercase font-bold text-white text-[11px] tracking-wider">
              Landing Pages
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pages')}
                  className="hover:text-white transition-colors"
                >
                  Portfólio Minimalista
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pages')}
                  className="hover:text-white transition-colors"
                >
                  Serviços Profissionais
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pages')}
                  className="hover:text-white transition-colors"
                >
                  Campanhas Promocionais
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPageWizard()}
                  className="text-[#00E599] hover:underline"
                >
                  + Sugerir Novo Layout
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono uppercase font-bold text-white text-[11px] tracking-wider">
              Carteira & Clientes
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('clients')}
                  className="hover:text-white transition-colors"
                >
                  Pessoas Físicas (PF)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('clients')}
                  className="hover:text-white transition-colors"
                >
                  Pessoas Jurídicas (PJ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenNewClientModal}
                  className="text-[#00E599] hover:underline"
                >
                  + Cadastrar Novo Cliente
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('security')}
                  className="hover:text-white transition-colors"
                >
                  Gestão de Convites & Tokens
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono uppercase font-bold text-white text-[11px] tracking-wider">
              Segurança & Criptografia
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <span className="text-slate-300">Web Crypto API Nativa</span>
              </li>
              <li>
                <span className="text-slate-300">AES-GCM 256-bit Storage</span>
              </li>
              <li>
                <span className="text-slate-300">Assinatura JWT HMAC-256</span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('security')}
                  className="text-[#38BDF8] hover:underline"
                >
                  Trilha de Auditoria (CSV)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono uppercase font-bold text-white text-[11px] tracking-wider">
              Exportação & Performance
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <span className="text-slate-300">Pacotes ZIP Determinísticos</span>
              </li>
              <li>
                <span className="text-slate-300">HTML5 Puro & CSS Sem Dep.</span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('analytics')}
                  className="text-[#38BDF8] hover:underline"
                >
                  Relatório Executivo PDF
                </button>
              </li>
              <li>
                <span className="text-[#00E599] font-mono font-bold">100% Client-Side Engine</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Regulatório / Técnico Kalshi Style */}
        <div className="pt-6 border-t border-[#1E2638] space-y-2 font-mono text-[10px] text-slate-500 leading-relaxed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-400">
            <span>
              &copy; 2026 CentralPro Admin &middot; Motor Determinístico de Landing Pages v3.0
            </span>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="hover:text-white cursor-pointer">Termos de Uso</span>
              <span className="hover:text-white cursor-pointer">Privacidade & Criptografia</span>
              <span className="hover:text-white cursor-pointer">Auditoria de Segurança</span>
            </div>
          </div>
          <p>
            AVISO DE SEGURANÇA E CONFORMIDADE: Todos os dados cadastrais, tokens JWT e versões das
            landing pages são armazenados de forma criptografada localmente com AES-GCM 256 bits via
            Web Crypto API. A geração das landing pages é puramente determinística e não depende de
            servidores externos para renderização do código fonte final.
          </p>
        </div>
      </footer>
    </div>
  );
};
