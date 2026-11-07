/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { DemoAccountsModal } from './components/common/DemoAccountsModal';
import { LoginModal } from './components/auth/LoginModal';
import { ActivateInvite } from './components/auth/ActivateInvite';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientList } from './components/admin/ClientList';
import { ClientDetail } from './components/admin/ClientDetail';
import { PageWizard } from './components/admin/PageWizard';
import { PageEditor } from './components/admin/PageEditor';
import { AdminSecurity } from './components/admin/AdminSecurity';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard';
import { PortalDashboard } from './components/portal/PortalDashboard';
import { PortalPagesList } from './components/portal/PortalPagesList';
import { PortalPagePreview } from './components/portal/PortalPagePreview';
import { PortalAccount } from './components/portal/PortalAccount';
import { AppRepository } from './services/storage';
import { Client, LandingPage, Invitation, AuditEvent } from './types';

function MainApp() {
  const { isAuthenticated, isAdmin, isClient, role, activeClientId, logout } = useAuth();

  // Dados da aplicação
  const [clients, setClients] = useState<Client[]>([]);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Navegação e Roteamento interno
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Modais e Telas Auxiliares
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isActivatingInvite, setIsActivatingInvite] = useState(false);
  const [inviteToken, setInviteToken] = useState<string>('');

  // Carrega repositório
  const loadData = useCallback(async () => {
    try {
      await AppRepository.init();
      const [cls, pgs, invs, logs] = await Promise.all([
        AppRepository.getClients(),
        AppRepository.getPages(),
        AppRepository.getInvitations(),
        AppRepository.getAuditLogs(),
      ]);
      setClients(cls);
      setPages(pgs);
      setInvitations(invs);
      setAuditLogs(logs);
      setDataLoaded(true);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Se o papel mudar, ajusta a tab padrão
  useEffect(() => {
    if (isAdmin) {
      setCurrentTab('dashboard');
    } else if (isClient) {
      setCurrentTab('portal-home');
    }
  }, [isAdmin, isClient]);

  // Encontra cliente ativo do portal se estiver no modo cliente
  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];

  // Ações de persistência
  const handleSaveClient = async (updated: Client) => {
    await AppRepository.saveClient(updated);
    await AppRepository.recordAuditEvent({
      actorEmail: 'admin@central.com.br',
      actorRole: 'admin',
      action: 'UPDATE_CLIENT',
      resource: `clients/${updated.id}`,
      details: `Ficha cadastral de ${updated.identificationName} atualizada.`,
      status: 'success',
    });
    await loadData();
  };

  const handleToggleArchive = async (clientId: string) => {
    const cl = clients.find((c) => c.id === clientId);
    if (!cl) return;
    const newStatus: Client['status'] = cl.status === 'Arquivado' ? 'Ativo' : 'Arquivado';
    await AppRepository.updateClientStatus(clientId, newStatus);
    await AppRepository.recordAuditEvent({
      actorEmail: 'admin@central.com.br',
      actorRole: 'admin',
      action: newStatus === 'Arquivado' ? 'ARCHIVE_CLIENT' : 'UNARCHIVE_CLIENT',
      resource: `clients/${clientId}`,
      details: `Cliente ${cl.identificationName} ${newStatus === 'Arquivado' ? 'arquivado' : 'reativado'}.`,
      status: 'success',
    });
    await loadData();
  };

  const handleSavePage = async (page: LandingPage) => {
    await AppRepository.savePage(page);
    await loadData();
  };

  const handleRecordAudit = async (action: string, resource: string, details: string) => {
    await AppRepository.recordAuditEvent({
      actorEmail: isAdmin ? 'admin@central.com.br' : 'cliente@portal.com.br',
      actorRole: role || 'Sistema',
      action,
      resource,
      details,
      status: 'success',
    });
    await loadData();
  };

  // Navegação guiada
  const handleNavigate = (tab: string, contextId?: string) => {
    setCurrentTab(tab);
    if (contextId) {
      if (tab === 'client-detail' || tab === 'page-wizard') {
        setSelectedClientId(contextId);
      } else if (tab === 'page-editor' || tab === 'portal-page-preview') {
        setSelectedPageId(contextId);
      }
    }
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA] dark:bg-slate-950 text-slate-700 dark:text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Inicializando repositório criptografado...</span>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, exibe Tela de Login ou Ativação de Convite
  if (!isAuthenticated) {
    if (isActivatingInvite) {
      return (
        <div className="min-h-screen bg-[#F4F6FA] dark:bg-slate-950 text-[#172033] dark:text-slate-100">
          <ActivateInvite
            initialToken={inviteToken}
            onBackToLogin={() => setIsActivatingInvite(false)}
            onSuccess={() => {
              setIsActivatingInvite(false);
              loadData();
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F4F6FA] dark:bg-slate-950 text-[#172033] dark:text-slate-100">
        <LoginModal
          onOpenInviteActivation={(token) => {
            if (token) setInviteToken(token);
            setIsActivatingInvite(true);
          }}
          onOpenDemoAccounts={() => setIsDemoModalOpen(true)}
        />
        <DemoAccountsModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          onSelectInviteToken={(tok) => {
            setInviteToken(tok);
            setIsActivatingInvite(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isAdmin
        ? 'bg-[#080A0E] text-slate-100'
        : 'bg-[#F4F6FA] dark:bg-slate-950 text-[#172033] dark:text-slate-100'
    }`}>
      {/* Cabeçalho Unificado com Navegação Segura */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenDemoAccounts={() => setIsDemoModalOpen(true)}
        clients={clients}
      />

      {/* Conteúdo Principal de cada Ambiente */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isAdmin && (
          <>
            {currentTab === 'dashboard' && (
              <AdminDashboard
                clients={clients}
                pages={pages}
                auditLogs={auditLogs}
                onNavigate={handleNavigate}
                onOpenNewClientModal={() => handleNavigate('clients')}
                onOpenPageWizard={(cid) => handleNavigate('page-wizard', cid)}
              />
            )}

            {currentTab === 'clients' && (
              <ClientList
                clients={clients}
                onSelectClient={(cid) => handleNavigate('client-detail', cid)}
                onOpenPageWizard={(cid) => handleNavigate('page-wizard', cid)}
                onSaveNewClient={handleSaveClient}
                onToggleArchive={handleToggleArchive}
              />
            )}

            {currentTab === 'client-detail' && (
              <ClientDetail
                client={clients.find((c) => c.id === selectedClientId) || clients[0]}
                pages={pages.filter((p) => p.clientId === (selectedClientId || clients[0].id))}
                onBack={() => handleNavigate('clients')}
                onUpdateClient={handleSaveClient}
                onOpenPageWizard={(cid) => handleNavigate('page-wizard', cid)}
                onOpenPageEditor={(pid) => handleNavigate('page-editor', pid)}
                onRecordAudit={handleRecordAudit}
              />
            )}

            {currentTab === 'pages' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Biblioteca de Landing Pages
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Todas as páginas da carteira com controle editorial, prévias e situação da publicação.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('page-wizard')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                  >
                    + Criar com Assistente
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pages.map((page) => {
                    const client = clients.find((c) => c.id === page.clientId);
                    const rev = page.revisions.find((r) => r.id === page.currentRevisionId);
                    return (
                      <div
                        key={page.id}
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {page.template}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                rev?.editorialStatus === 'Aprovada'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {rev?.editorialStatus || 'Rascunho'}
                            </span>
                          </div>
                          <h2 className="font-bold text-slate-900 dark:text-white text-base">
                            {page.title}
                          </h2>
                          <p className="text-xs text-slate-500">
                            Cliente: <strong>{client?.publicProfile.publicName || client?.identificationName}</strong>
                          </p>
                          <div className="text-[11px] text-slate-400">
                            Portal: <strong>{page.portalVisibility}</strong> • Rev #{rev?.revisionNumber || 1}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleNavigate('page-editor', page.id)}
                            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                          >
                            Abrir Editor & Prévia
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentTab === 'page-wizard' && (
              <PageWizard
                clients={clients}
                initialClientId={selectedClientId || undefined}
                onBack={() => handleNavigate('pages')}
                onCreatePage={handleSavePage}
                onNavigateToEditor={(pid) => handleNavigate('page-editor', pid)}
              />
            )}

            {currentTab === 'page-editor' && (
              <PageEditor
                page={pages.find((p) => p.id === selectedPageId) || pages[0]}
                client={
                  clients.find(
                    (c) => c.id === (pages.find((p) => p.id === selectedPageId) || pages[0])?.clientId
                  ) || clients[0]
                }
                onBack={() => handleNavigate('pages')}
                onSavePage={handleSavePage}
                onRecordAudit={handleRecordAudit}
              />
            )}

            {currentTab === 'security' && (
              <AdminSecurity
                clients={clients}
                invitations={invitations}
                auditLogs={auditLogs}
                onReload={loadData}
                onSelectInviteToken={(tok) => {
                  setInviteToken(tok);
                  setIsActivatingInvite(true);
                  logout();
                }}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsDashboard
                pages={pages}
                clients={clients}
                onOpenPageEditor={(pid) => handleNavigate('page-editor', pid)}
                onPageUpdated={loadData}
              />
            )}
          </>
        )}

        {isClient && (
          <>
            {currentTab === 'portal-home' && (
              <PortalDashboard
                client={activeClient}
                pages={pages.filter((p) => p.clientId === activeClient.id)}
                onOpenPreview={(pid) => handleNavigate('portal-page-preview', pid)}
                onNavigateToPages={() => handleNavigate('portal-pages')}
              />
            )}

            {currentTab === 'portal-pages' && (
              <PortalPagesList
                client={activeClient}
                pages={pages.filter((p) => p.clientId === activeClient.id)}
                onOpenPreview={(pid) => handleNavigate('portal-page-preview', pid)}
              />
            )}

            {currentTab === 'portal-page-preview' && (
              <PortalPagePreview
                page={pages.find((p) => p.id === selectedPageId) || pages[0]}
                client={activeClient}
                onBack={() => handleNavigate('portal-pages')}
              />
            )}

            {currentTab === 'portal-account' && (
              <PortalAccount client={activeClient} onLogout={logout} />
            )}
          </>
        )}
      </main>

      {/* Modal de Acesso Rápido para Avaliação */}
      <DemoAccountsModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectInviteToken={(tok) => {
          setInviteToken(tok);
          setIsActivatingInvite(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
