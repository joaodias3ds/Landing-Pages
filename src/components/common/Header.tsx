import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  ShieldCheck,
  Home,
  FileCode,
  UserCheck,
  LogOut,
  Lock,
  ChevronDown,
  Building2,
  Sparkles,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Client } from '../../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenDemoAccounts: () => void;
  clients?: Client[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenDemoAccounts,
  clients = [],
}) => {
  const { currentUser, role, logout, activeClientId, setActiveClientId, isAdmin, isClient } = useAuth();

  // Encontra o cliente ativo caso seja cliente logado
  const activeClient = clients.find(c => c.id === activeClientId);

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors ${
      isAdmin
        ? 'bg-[#080A0E]/95 border-b border-[#1E2638] text-white'
        : 'bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo e Identidade */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate(isAdmin ? 'dashboard' : 'portal-home')}
              className="flex items-center gap-2.5 text-left group"
            >
              {isAdmin ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-[#00E599] text-[#080A0E] flex items-center justify-center font-black text-base shadow-sm shadow-[#00E599]/20 group-hover:scale-105 transition-transform">
                    LP
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base tracking-tight leading-none">
                        LandingPro
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#132328] text-[#00E599] border border-[#00E599]/30">
                        TERMINAL
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 hidden sm:block">
                      Sistema Determinístico v3.0
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
                        Central de Clientes
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        Portal do Cliente
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                      Ambiente do Cliente • {activeClient?.publicProfile?.publicName || 'Visão Segura'}
                    </p>
                  </div>
                </>
              )}
            </button>

            {/* LIVE Badge no Admin (Estilo Kalshi) */}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#132328] text-[#00E599] border border-[#00E599]/30">
                <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
                <span>LIVE ● AES-GCM</span>
              </div>
            )}

            {/* Alternador de Vínculo de Cliente (se o usuário cliente tiver múltiplos acessos) */}
            {isClient && currentUser?.clientIds && currentUser.clientIds.length > 1 && (
              <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={activeClientId || ''}
                  onChange={(e) => setActiveClientId(e.target.value)}
                  className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  {currentUser.clientIds.map(cid => {
                    const cl = clients.find(c => c.id === cid);
                    return (
                      <option key={cid} value={cid}>
                        {cl?.publicProfile.publicName || cl?.identificationName || cid}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Navegação Principal */}
          <nav className="hidden lg:flex items-center gap-1">
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                    currentTab === 'dashboard'
                      ? 'bg-[#141E2F] text-[#00E599] border border-[#00E599]/40'
                      : 'text-slate-400 hover:text-white hover:bg-[#111622]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  MERCADOS / PAINEL
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('clients')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                    currentTab === 'clients' || currentTab === 'client-detail'
                      ? 'bg-[#141E2F] text-[#00E599] border border-[#00E599]/40'
                      : 'text-slate-400 hover:text-white hover:bg-[#111622]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  CLIENTES
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('pages')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                    currentTab === 'pages' || currentTab === 'page-editor' || currentTab === 'page-wizard'
                      ? 'bg-[#141E2F] text-[#00E599] border border-[#00E599]/40'
                      : 'text-slate-400 hover:text-white hover:bg-[#111622]'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  LANDING PAGES
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                    currentTab === 'analytics'
                      ? 'bg-[#141E2F] text-[#00E599] border border-[#00E599]/40'
                      : 'text-slate-400 hover:text-white hover:bg-[#111622]'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  ANALYTICS
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('security')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                    currentTab === 'security'
                      ? 'bg-[#141E2F] text-[#00E599] border border-[#00E599]/40'
                      : 'text-slate-400 hover:text-white hover:bg-[#111622]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  AUDITORIA
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('portal-home')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'portal-home'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Início
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('portal-pages')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'portal-pages' || currentTab === 'portal-page-preview'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Minhas Páginas
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('portal-account')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'portal-account'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Minha Conta
                </button>
              </>
            )}
          </nav>

          {/* Ferramentas e Usuário */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador de Criptografia */}
            <div className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono ${
              isAdmin
                ? 'bg-[#101C2A] text-[#38BDF8] border border-[#38BDF8]/30'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
            }`}>
              <Lock className="w-3 h-3 text-[#38BDF8]" />
              <span>JWT & AES-GCM 256</span>
            </div>

            {/* Alternador de Tema Escuro / Claro / Auto */}
            <ThemeToggle />

            {/* Botão de Contas de Teste Rápido */}
            <button
              type="button"
              onClick={onOpenDemoAccounts}
              title="Alternar entre contas de demonstração (Admin, Cliente)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isAdmin
                  ? 'bg-[#131926] hover:bg-[#1E2638] text-amber-400 border border-amber-500/40'
                  : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Trocar Conta</span>
            </button>

            {/* Usuário Logado & Logout */}
            {currentUser && (
              <div className={`flex items-center gap-2 pl-2 border-l ${
                isAdmin ? 'border-[#1E2638]' : 'border-slate-200 dark:border-slate-800'
              }`}>
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#1E2638]"
                />
                <div className="hidden md:block text-left">
                  <div className={`text-xs font-semibold leading-tight ${isAdmin ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className={`text-[10px] capitalize font-mono ${isAdmin ? 'text-[#00E599]' : 'text-slate-500 dark:text-slate-400'}`}>
                    {currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  title="Encerrar Sessão Segura"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação Mobile Inferior / Sub-menu */}
      <div className="lg:hidden flex items-center justify-around py-2 px-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
        {isAdmin ? (
          <>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`flex flex-col items-center gap-1 ${currentTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => onNavigate('clients')}
              className={`flex flex-col items-center gap-1 ${currentTab === 'clients' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}
            >
              <Users className="w-4 h-4" />
              Clientes
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pages')}
              className={`flex flex-col items-center gap-1 ${currentTab === 'pages' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}
            >
              <FileCode className="w-4 h-4" />
              LPs
            </button>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className={`flex flex-col items-center gap-1 ${currentTab === 'analytics' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            <button
              type="button"
              onClick={() => onNavigate('security')}
              className={`flex flex-col items-center gap-1 ${currentTab === 'security' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Auditoria
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onNavigate('portal-home')}
              className={`flex flex-col items-center gap-1 ${currentTab === 'portal-home' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}
            >
              <Home className="w-4 h-4" />
              Início
            </button>
            <button
              type="button"
              onClick={() => onNavigate('portal-pages')}
              className={`flex flex-col items-center gap-1 ${currentTab === 'portal-pages' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}
            >
              <Layers className="w-4 h-4" />
              Minhas Páginas
            </button>
            <button
              type="button"
              onClick={() => onNavigate('portal-account')}
              className={`flex flex-col items-center gap-1 ${currentTab === 'portal-account' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}
            >
              <UserCheck className="w-4 h-4" />
              Minha Conta
            </button>
          </>
        )}
      </div>
    </header>
  );
};
