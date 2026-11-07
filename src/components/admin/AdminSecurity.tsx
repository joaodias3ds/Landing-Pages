import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  History,
  Mail,
  Copy,
  Check,
  Plus,
  RotateCcw,
  Ban,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  X,
  AlertTriangle,
  Lock,
  User,
  FileText,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Invitation, AuditEvent, Client } from '../../types';
import { AppRepository } from '../../services/storage';

interface AdminSecurityProps {
  clients: Client[];
  invitations: Invitation[];
  auditLogs: AuditEvent[];
  onReload: () => Promise<void>;
  onSelectInviteToken: (token: string) => void;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({
  clients,
  invitations,
  auditLogs,
  onReload,
  onSelectInviteToken,
}) => {
  const [subTab, setSubTab] = useState<'invites' | 'audit'>('audit');

  // Novo Convite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Filtros Avançados de Auditoria
  const [filterActor, setFilterActor] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | '7d' | '30d' | 'custom'>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [auditSearch, setAuditSearch] = useState('');

  // Modal de Detalhes do Evento
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);
  const [exportFeedback, setExportFeedback] = useState(false);

  // Lista única de atores para o filtro
  const uniqueActors = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.actorEmail) set.add(l.actorEmail);
    });
    return Array.from(set).sort();
  }, [auditLogs]);

  // Lista única de ações para o filtro
  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [auditLogs]);

  // Filtragem dos logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return auditLogs.filter((log) => {
      // 1. Filtro por Usuário / Ator
      if (filterActor !== 'all' && log.actorEmail !== filterActor) {
        return false;
      }

      // 2. Filtro por Tipo de Ação
      if (filterAction !== 'all' && log.action !== filterAction) {
        return false;
      }

      // 3. Filtro por Status
      if (filterStatus !== 'all' && log.status !== filterStatus) {
        return false;
      }

      // 4. Filtro por Data
      const logDate = new Date(log.timestamp);
      const logDateStr = log.timestamp.split('T')[0];

      if (filterPeriod === 'today') {
        if (logDateStr !== todayStr) return false;
      } else if (filterPeriod === '7d') {
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (filterPeriod === '30d') {
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      } else if (filterPeriod === 'custom') {
        if (filterStartDate && logDateStr < filterStartDate) return false;
        if (filterEndDate && logDateStr > filterEndDate) return false;
      }

      // 5. Busca Textual Livre
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const matches =
          log.action.toLowerCase().includes(q) ||
          log.actorEmail.toLowerCase().includes(q) ||
          log.actorRole.toLowerCase().includes(q) ||
          log.resource.toLowerCase().includes(q) ||
          (log.details && log.details.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [auditLogs, filterActor, filterAction, filterStatus, filterPeriod, filterStartDate, filterEndDate, auditSearch]);

  // Estatísticas rápidas de auditoria
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const mfaLogins = auditLogs.filter((l) => l.action.includes('MFA')).length;
    const docReveals = auditLogs.filter((l) => l.action === 'REVEAL_DOCUMENT').length;
    const denied = auditLogs.filter((l) => l.status === 'denied').length;
    return { total, mfaLogins, docReveals, denied };
  }, [auditLogs]);

  // Limpar filtros
  const handleResetFilters = () => {
    setFilterActor('all');
    setFilterAction('all');
    setFilterStatus('all');
    setFilterPeriod('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setAuditSearch('');
  };

  const hasActiveFilters =
    filterActor !== 'all' ||
    filterAction !== 'all' ||
    filterStatus !== 'all' ||
    filterPeriod !== 'all' ||
    auditSearch.trim() !== '' ||
    filterStartDate !== '' ||
    filterEndDate !== '';

  // Exportar logs filtrados em CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Data_Hora', 'Ator_Email', 'Papel', 'Acao', 'Recurso', 'Status', 'Detalhes'];
    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${new Date(log.timestamp).toLocaleString('pt-BR')}"`,
      `"${log.actorEmail}"`,
      `"${log.actorRole}"`,
      `"${log.action}"`,
      `"${log.resource}"`,
      `"${log.status === 'success' ? 'Autorizado' : 'Negado'}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-seguranca-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportFeedback(true);
    setTimeout(() => setExportFeedback(false), 2500);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedClientId) return;

    setSubmittingInvite(true);
    try {
      const token = `inv_tok_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const newInv: Invitation = {
        id: `inv-${Date.now()}`,
        clientId: selectedClientId,
        email: inviteEmail.trim(),
        token,
        status: 'Pendente',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      };

      await AppRepository.saveInvitation(newInv);
      await AppRepository.recordAuditEvent({
        actorEmail: 'admin@central.com.br',
        actorRole: 'admin',
        action: 'CREATE_INVITATION',
        resource: `invitations/${newInv.id}`,
        details: `Convite enviado para ${newInv.email} (Cliente: ${selectedClientId}).`,
        status: 'success',
      });

      await onReload();
      setShowInviteModal(false);
      setInviteEmail('');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleRevokeInvite = async (inv: Invitation) => {
    const updated: Invitation = { ...inv, status: 'Revogado' };
    await AppRepository.saveInvitation(updated);
    await AppRepository.recordAuditEvent({
      actorEmail: 'admin@central.com.br',
      actorRole: 'admin',
      action: 'REVOKE_INVITATION',
      resource: `invitations/${inv.id}`,
      details: `Convite para ${inv.email} revogado administrativamente.`,
      status: 'success',
    });
    await onReload();
  };

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/portal/ativar?token=${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Topo Geral */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Segurança, Auditoria & Acessos
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizador avançado de trilha de auditoria criptográfica e gestão de vínculos do Portal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Convidar para o Portal
          </button>
        </div>
      </div>

      {/* Abas Secundárias */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSubTab('audit')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
            subTab === 'audit'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Visualizador Detalhado de Auditoria ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('invites')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
            subTab === 'invites'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Convites do Portal ({invitations.length})</span>
        </button>
      </div>

      {/* ABA: VISUALIZADOR DETALHADO DE AUDITORIA */}
      {subTab === 'audit' && (
        <div className="space-y-6">
          {/* Métricas Rápidas de Segurança */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total de Eventos</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</div>
              <p className="text-[11px] text-slate-500">Registros em banco protegido</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acessos com MFA</span>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{stats.mfaLogins}</div>
              <p className="text-[11px] text-slate-500">Sessões administrativas validadas</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Documentos Revelados</span>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{stats.docReveals}</div>
              <p className="text-[11px] text-slate-500">Ações de acesso auditadas</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acessos Bloqueados</span>
              <div className="text-2xl font-extrabold text-red-500">{stats.denied}</div>
              <p className="text-[11px] text-slate-500">Tentativas negadas pelo sistema</p>
            </div>
          </div>

          {/* Painel de Filtros Avançados (Usuário, Ação, Data e Busca) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filtros da Trilha de Auditoria</span>
                {hasActiveFilters && (
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                    Filtros Ativos
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar Filtros
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {exportFeedback ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>CSV Exportado!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Exportar CSV</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Linha 1 de Filtros: Usuário, Tipo de Ação e Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Filtro por Usuário / Ator */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Filtrar por Usuário (Ator)
                </label>
                <select
                  value={filterActor}
                  onChange={(e) => setFilterActor(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="all">Todos os Usuários ({uniqueActors.length})</option>
                  {uniqueActors.map((actor) => (
                    <option key={actor} value={actor}>
                      {actor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Tipo de Ação */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Filtrar por Tipo de Ação
                </label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="all">Todas as Ações ({uniqueActions.length})</option>
                  {uniqueActions.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Status do Evento */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status do Evento
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="all">Todos os Resultados</option>
                  <option value="success">Autorizado (Sucesso)</option>
                  <option value="denied">Negado (Bloqueado)</option>
                </select>
              </div>
            </div>

            {/* Linha 2 de Filtros: Período por Data & Busca Textual */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end pt-1">
              {/* Presets de Data */}
              <div className="sm:col-span-5 space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Período de Data
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'today', label: 'Hoje' },
                    { id: '7d', label: '7 dias' },
                    { id: '30d', label: '30 dias' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFilterPeriod(p.id as any)}
                      className={`py-1.5 rounded-lg text-center transition-all ${
                        filterPeriod === p.id
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intervalo Customizado de Data */}
              <div className="sm:col-span-3 space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Data Específica
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => {
                      setFilterStartDate(e.target.value);
                      setFilterPeriod('custom');
                    }}
                    className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-[11px]"
                  />
                </div>
              </div>

              {/* Campo de Busca Livre */}
              <div className="sm:col-span-4 space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Busca por Palavra-Chave
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Buscar em recurso, detalhes..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Eventos Detalhada */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">
                Exibindo <strong>{filteredLogs.length}</strong> de {auditLogs.length} eventos registrados
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Ordenação: Mais recentes primeiro
              </span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Nenhum evento corresponde aos filtros informados</p>
                <p>Tente alterar o usuário, ação ou o período de data selecionado.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 font-semibold mt-2"
                >
                  Restaurar Todos os Logs
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Momento</th>
                      <th className="py-3.5 px-4">Usuário / Ator</th>
                      <th className="py-3.5 px-4">Tipo de Ação</th>
                      <th className="py-3.5 px-4">Recurso / Detalhes</th>
                      <th className="py-3.5 px-4">Resultado</th>
                      <th className="py-3.5 px-4 text-right">Inspeção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredLogs.map((log) => {
                      const isSuccess = log.status === 'success';
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedLog(log)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            <div>{new Date(log.timestamp).toLocaleDateString('pt-BR')}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {log.actorEmail}
                            </div>
                            <span
                              className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full ${
                                log.actorRole === 'admin'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : log.actorRole === 'client'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                              }`}
                            >
                              {log.actorRole}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 inline-block">
                              {log.action}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                            <div className="text-slate-800 dark:text-slate-200 font-medium truncate">
                              {log.details || log.resource}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {log.resource}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isSuccess
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {isSuccess ? 'Autorizado' : 'Negado'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                              }}
                              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 font-semibold transition-all inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detalhes</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: CONVITES DO PORTAL */}
      {subTab === 'invites' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">E-mail Convidado</th>
                  <th className="py-3.5 px-4">Cliente Vinculado</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Enviado em</th>
                  <th className="py-3.5 px-4">Validade</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {invitations.map((inv) => {
                  const client = clients.find((c) => c.id === inv.clientId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {inv.email}
                      </td>
                      <td className="py-3.5 px-4">
                        {client?.publicProfile.publicName || client?.identificationName || inv.clientId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'Ativo'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                              : inv.status === 'Revogado'
                              ? 'bg-red-100 dark:bg-red-950 text-red-700'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(inv.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectInviteToken(inv.token)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold"
                            title="Testar ativação deste convite"
                          >
                            Ativar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv.token)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900"
                            title="Copiar Link de Ativação"
                          >
                            {copiedToken === inv.token ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {inv.status !== 'Revogado' && (
                            <button
                              type="button"
                              onClick={() => handleRevokeInvite(inv)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50"
                              title="Revogar Acesso"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: INSPEÇÃO DETALHADA DO EVENTO DE AUDITORIA */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selectedLog.status === 'success'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400'
                  }`}
                >
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Inspeção do Registro de Auditoria
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">ID: {selectedLog.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações Estruturadas do Evento */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Momento Preciso</span>
                  <div className="font-semibold text-slate-900 dark:text-white font-mono">
                    {new Date(selectedLog.timestamp).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedLog.timestamp}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Resultado da Operação</span>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        selectedLog.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedLog.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {selectedLog.status === 'success' ? 'Autorizado com Sucesso' : 'Negado / Bloqueado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ator e Papel */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Ator Responsável (Sessão)</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedLog.actorEmail}</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Papel: {selectedLog.actorRole}
                  </span>
                </div>
              </div>

              {/* Ação e Recurso */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ação Executada</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 inline-block">
                    {selectedLog.action}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Recurso do Sistema</span>
                  <div className="font-mono text-slate-600 dark:text-slate-300 text-[11px] bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    {selectedLog.resource}
                  </div>
                </div>
              </div>

              {/* Detalhes Operacionais */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Descrição e Metadados</span>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedLog.details || 'Nenhum detalhe adicional registrado para esta ação.'}
                </p>
              </div>

              {/* Garantias Criptográficas */}
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Integridade Garantida por Hash & AES-GCM</span>
                </div>
                <span className="font-mono text-[10px] font-semibold">OWASP Compliance</span>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs shadow-xs"
              >
                Fechar Inspeção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Convidar Cliente */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Convidar Cliente para o Portal
            </h3>
            <p className="text-xs text-slate-500">
              O cliente receberá um link protegido com token de uso único (validade de 48h) para ativar sua conta e visualizar suas landing pages liberadas.
            </p>

            <form onSubmit={handleCreateInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cliente Cadastrado
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.publicProfile.publicName || c.identificationName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail de Acesso do Cliente *
                </label>
                <input
                  type="email"
                  required
                  placeholder="cliente@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-xl border text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  {submittingInvite ? 'Gerando...' : 'Gerar Convite Seguro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
