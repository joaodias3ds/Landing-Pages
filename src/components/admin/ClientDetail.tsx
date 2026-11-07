import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  User,
  Shield,
  FileText,
  Share2,
  CheckSquare,
  History,
  FileCode,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Upload,
} from 'lucide-react';
import {
  Client,
  LandingPage,
  ClientContact,
  PrivateDocument,
  PublicMediaItem,
  ServiceItem,
  ClientTask,
  ClientActivity,
} from '../../types';
import { formatCPF, formatCNPJ, buildWhatsAppLink } from '../../services/security';

interface ClientDetailProps {
  client: Client;
  pages: LandingPage[];
  onBack: () => void;
  onUpdateClient: (updatedClient: Client) => Promise<void>;
  onOpenPageWizard: (clientId: string) => void;
  onOpenPageEditor: (pageId: string) => void;
  onRecordAudit: (action: string, resource: string, details: string) => Promise<void>;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({
  client,
  pages,
  onBack,
  onUpdateClient,
  onOpenPageWizard,
  onOpenPageEditor,
  onRecordAudit,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'registration' | 'contacts' | 'documents' | 'profile' | 'tasks' | 'history' | 'pages'
  >('overview');

  // Estado local editável
  const [currentClient, setCurrentClient] = useState<Client>(client);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Revelação de dados sensíveis (CPF/CNPJ e Documentos) com auditoria
  const [revealedDocs, setRevealedDocs] = useState<Record<string, boolean>>({});

  // Modais locais de cadastro rápido
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState<Partial<ClientContact>>({ isPrimary: false, role: 'Contato' });

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<ClientTask>>({ priority: 'media', status: 'Aberta' });

  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<ClientActivity>>({ channel: 'WhatsApp' });

  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState<Partial<ServiceItem>>({});

  const [showAddMedia, setShowAddMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaKind, setNewMediaKind] = useState<'portrait' | 'cover' | 'portfolio'>('portfolio');

  // Salva alterações do cliente
  const handleSave = async (updated: Client) => {
    setSaving(true);
    try {
      await onUpdateClient(updated);
      setCurrentClient(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleRevealDocument = async (docId: string, filename: string) => {
    await onRecordAudit('REVEAL_DOCUMENT', `documents/${docId}`, `Visualização autorizada do documento restrito: ${filename}`);
    setRevealedDocs((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handleToggleTaskStatus = async (taskId: string) => {
    const updatedTasks = currentClient.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: (t.status === 'Aberta' ? 'Concluída' : 'Aberta') as ClientTask['status'],
        };
      }
      return t;
    });

    const updated = { ...currentClient, tasks: updatedTasks };
    await handleSave(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Barra de Topo da Ficha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {currentClient.publicProfile.publicName || currentClient.identificationName}
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {currentClient.type}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentClient.status === 'Ativo'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                }`}
              >
                {currentClient.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ficha do Cliente • Resp: {currentClient.internalResponsible} • {currentClient.city || 'Sem cidade'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Alterações salvas!
            </span>
          )}
          <button
            type="button"
            onClick={() => onOpenPageWizard(currentClient.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Sugerir Landing Page
          </button>
        </div>
      </div>

      {/* Navegação das 8 Abas Funcionais */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 pb-px text-xs font-semibold">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Shield },
          { id: 'registration', label: 'Cadastro', icon: User },
          { id: 'contacts', label: 'Contatos', icon: Phone },
          { id: 'documents', label: 'Documentos', icon: FileText, count: currentClient.documents.length },
          { id: 'profile', label: 'Perfil de Divulgação', icon: Share2 },
          { id: 'tasks', label: 'Tarefas', icon: CheckSquare, count: currentClient.tasks.filter((t) => t.status === 'Aberta').length },
          { id: 'history', label: 'Histórico', icon: History },
          { id: 'pages', label: 'Landing Pages', icon: FileCode, count: pages.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo das Abas */}

      {/* 1. Visão Geral */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Identificação</span>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {currentClient.identificationName}
              </div>
              <p className="text-xs text-slate-500">
                {currentClient.type === 'PF'
                  ? `Pessoa Física • CPF: ${currentClient.identificationPF?.cpf ? formatCPF(currentClient.identificationPF.cpf) : 'Não informado'}`
                  : `Pessoa Jurídica • CNPJ: ${currentClient.identificationPJ?.cnpj ? formatCNPJ(currentClient.identificationPJ.cnpj) : 'Não informado'}`}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Canal Comercial</span>
              <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>{currentClient.publicProfile.mainCommercialChannel.value || 'Não cadastrado'}</span>
              </div>
              <p className="text-xs text-slate-500">
                {currentClient.publicProfile.serviceLocation || 'Localização não definida'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Landing Pages</span>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {pages.length} página(s) vinculada(s)
              </div>
              <p className="text-xs text-slate-500">
                {pages.filter((p) => p.publicationStatus === 'Publicada informada').length} publicada(s) na web
              </p>
            </div>
          </div>

          {/* Resumo do Perfil Público e Prontidão */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Status de Prontidão para Landing Page
            </h3>
            <p className="text-xs text-slate-500">
              {currentClient.publicProfile.publicName &&
              currentClient.publicProfile.activity &&
              currentClient.publicProfile.summary &&
              currentClient.publicProfile.mainCommercialChannel.value
                ? '✅ Todos os dados essenciais para o perfil de divulgação estão preenchidos. Você pode gerar a landing page a qualquer momento.'
                : '⚠️ Faltam dados essenciais no perfil de divulgação para liberar a exportação. Acesse a aba "Perfil de Divulgação" para completar.'}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Revisar Perfil de Divulgação
              </button>
              <button
                type="button"
                onClick={() => onOpenPageWizard(currentClient.id)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Abrir Assistente de Sugestão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cadastro (PF / PJ) */}
      {activeTab === 'registration' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">
            Dados de Identificação e Cadastro Administrativo ({currentClient.type})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {currentClient.type === 'PF' ? (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Civil Completo
                  </label>
                  <input
                    type="text"
                    value={currentClient.identificationPF?.civilName || currentClient.identificationName}
                    onChange={(e) => {
                      const updated = {
                        ...currentClient,
                        identificationPF: { ...currentClient.identificationPF, civilName: e.target.value },
                      };
                      setCurrentClient(updated);
                    }}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CPF (Área Restrita)
                  </label>
                  <input
                    type="text"
                    value={currentClient.identificationPF?.cpf ? formatCPF(currentClient.identificationPF.cpf) : ''}
                    onChange={(e) => {
                      const updated = {
                        ...currentClient,
                        identificationPF: {
                          ...currentClient.identificationPF,
                          civilName: currentClient.identificationPF?.civilName || currentClient.identificationName,
                          cpf: e.target.value.replace(/\D/g, ''),
                        },
                      };
                      setCurrentClient(updated);
                    }}
                    placeholder="000.000.000-00"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Documento de Identidade (RG / CIN)
                  </label>
                  <input
                    type="text"
                    value={currentClient.identificationPF?.rgCin || ''}
                    onChange={(e) => {
                      const updated = {
                        ...currentClient,
                        identificationPF: {
                          ...currentClient.identificationPF,
                          civilName: currentClient.identificationPF?.civilName || currentClient.identificationName,
                          rgCin: e.target.value,
                        },
                      };
                      setCurrentClient(updated);
                    }}
                    placeholder="Ex: 5928371-SSP/GO"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    value={currentClient.identificationPJ?.companyName || currentClient.identificationName}
                    onChange={(e) => {
                      const updated = {
                        ...currentClient,
                        identificationPJ: {
                          ...currentClient.identificationPJ,
                          companyName: e.target.value,
                          tradeName: currentClient.identificationPJ?.tradeName || currentClient.identificationName,
                        },
                      };
                      setCurrentClient(updated);
                    }}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CNPJ (Área Restrita)
                  </label>
                  <input
                    type="text"
                    value={currentClient.identificationPJ?.cnpj ? formatCNPJ(currentClient.identificationPJ.cnpj) : ''}
                    onChange={(e) => {
                      const updated = {
                        ...currentClient,
                        identificationPJ: {
                          ...currentClient.identificationPJ,
                          companyName: currentClient.identificationPJ?.companyName || currentClient.identificationName,
                          tradeName: currentClient.identificationPJ?.tradeName || currentClient.identificationName,
                          cnpj: e.target.value.replace(/\D/g, ''),
                        },
                      };
                      setCurrentClient(updated);
                    }}
                    placeholder="00.000.000/0000-00"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Representante Legal
                  </label>
                  <input
                    type="text"
                    value={currentClient.identificationPJ?.representativeName || ''}
                    onChange={(e) => {
                      const updated = {
                        ...currentClient,
                        identificationPJ: {
                          ...currentClient.identificationPJ,
                          companyName: currentClient.identificationPJ?.companyName || currentClient.identificationName,
                          tradeName: currentClient.identificationPJ?.tradeName || currentClient.identificationName,
                          representativeName: e.target.value,
                        },
                      };
                      setCurrentClient(updated);
                    }}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Responsável Interno
              </label>
              <input
                type="text"
                value={currentClient.internalResponsible}
                onChange={(e) => setCurrentClient({ ...currentClient, internalResponsible: e.target.value })}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(currentClient)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              {saving ? 'Gravando...' : 'Salvar Dados Cadastrais'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Contatos Administrativos */}
      {activeTab === 'contacts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Contatos Administrativos
            </h2>
            <button
              type="button"
              onClick={() => setShowAddContact(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
            >
              <Plus className="w-4 h-4" />
              Adicionar Contato
            </button>
          </div>

          <div className="space-y-3">
            {currentClient.contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{contact.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {contact.role}
                    </span>
                    {contact.isPrimary && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 mt-1">
                    <span>Telefone: {contact.phone}</span>
                    <span>E-mail: {contact.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const filtered = currentClient.contacts.filter((c) => c.id !== contact.id);
                    handleSave({ ...currentClient, contacts: filtered });
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Form inline para adicionar contato */}
          {showAddContact && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white">Novo Contato Administrativo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nome do contato *"
                  value={newContact.name || ''}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Telefone *"
                  value={newContact.phone || ''}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <input
                  type="email"
                  placeholder="E-mail *"
                  value={newContact.email || ''}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newContact.name || !newContact.phone) return;
                    const contactToAdd: ClientContact = {
                      id: `c-${Date.now()}`,
                      name: newContact.name,
                      phone: newContact.phone,
                      email: newContact.email || '',
                      role: newContact.role || 'Contato',
                      isPrimary: currentClient.contacts.length === 0,
                    };
                    handleSave({ ...currentClient, contacts: [...currentClient.contacts, contactToAdd] });
                    setShowAddContact(false);
                    setNewContact({ isPrimary: false, role: 'Contato' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Documentos Privados (Quarentena & Revelação Auditada) */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Documentos Privados & Identificação Restrita
              </h2>
              <p className="text-xs text-slate-500">
                Arquivos restritos isolados com barreira de exportação: estes documentos NUNCA são publicados ou exportados nas landing pages.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {currentClient.documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                Nenhum documento restrito anexado.
              </div>
            ) : (
              currentClient.documents.map((doc) => {
                const isRevealed = revealedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{doc.filename}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                          {doc.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700">
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Finalidade: {doc.purpose}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRevealDocument(doc.id, doc.filename)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold text-xs"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isRevealed ? 'Ocultar' : 'Revelar (Auditado)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. Perfil de Divulgação (Elegível para Landing Page) */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Perfil Público de Divulgação
              </h2>
              <p className="text-xs text-slate-500">
                Fonte de dados exclusiva para composição das landing pages aprovadas.
              </p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(currentClient)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              {saving ? 'Gravando...' : 'Salvar Perfil'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Público (Até 80 caracteres) *
              </label>
              <input
                type="text"
                maxLength={80}
                value={currentClient.publicProfile.publicName}
                onChange={(e) => {
                  const updated = {
                    ...currentClient,
                    publicProfile: { ...currentClient.publicProfile, publicName: e.target.value },
                  };
                  setCurrentClient(updated);
                }}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Atividade ou Profissão (Até 80 caracteres) *
              </label>
              <input
                type="text"
                maxLength={80}
                value={currentClient.publicProfile.activity}
                onChange={(e) => {
                  const updated = {
                    ...currentClient,
                    publicProfile: { ...currentClient.publicProfile, activity: e.target.value },
                  };
                  setCurrentClient(updated);
                }}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Apresentação Breve (Até 300 caracteres) *
              </label>
              <textarea
                rows={2}
                maxLength={300}
                value={currentClient.publicProfile.summary}
                onChange={(e) => {
                  const updated = {
                    ...currentClient,
                    publicProfile: { ...currentClient.publicProfile, summary: e.target.value },
                  };
                  setCurrentClient(updated);
                }}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Comercial Principal *
              </label>
              <input
                type="text"
                value={currentClient.publicProfile.mainCommercialChannel.value}
                onChange={(e) => {
                  const updated = {
                    ...currentClient,
                    publicProfile: {
                      ...currentClient.publicProfile,
                      mainCommercialChannel: {
                        ...currentClient.publicProfile.mainCommercialChannel,
                        value: e.target.value,
                      },
                    },
                  };
                  setCurrentClient(updated);
                }}
                placeholder="62991234567"
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Link gerado: {buildWhatsAppLink(currentClient.publicProfile.mainCommercialChannel.value)}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Região / Cidade de Atendimento
              </label>
              <input
                type="text"
                value={currentClient.publicProfile.serviceLocation}
                onChange={(e) => {
                  const updated = {
                    ...currentClient,
                    publicProfile: { ...currentClient.publicProfile, serviceLocation: e.target.value },
                  };
                  setCurrentClient(updated);
                }}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Texto Completo Sobre a Empresa / Trajetória (Até 1.500 caracteres)
              </label>
              <textarea
                rows={4}
                maxLength={1500}
                value={currentClient.publicProfile.aboutText}
                onChange={(e) => {
                  const updated = {
                    ...currentClient,
                    publicProfile: { ...currentClient.publicProfile, aboutText: e.target.value },
                  };
                  setCurrentClient(updated);
                }}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Serviços (Até 6) */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Catálogo de Serviços ({currentClient.publicProfile.services.length} de 6)
              </h3>
              {currentClient.publicProfile.services.length < 6 && (
                <button
                  type="button"
                  onClick={() => setShowAddService(true)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  + Adicionar Serviço
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {currentClient.publicProfile.services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 relative"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const updatedServices = currentClient.publicProfile.services.filter((s) => s.id !== srv.id);
                      handleSave({
                        ...currentClient,
                        publicProfile: { ...currentClient.publicProfile, services: updatedServices },
                      });
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="font-bold text-slate-900 dark:text-white">{srv.name}</div>
                  <p className="text-slate-500 text-[11px]">{srv.description}</p>
                  {srv.price && <div className="text-blue-600 font-semibold text-[11px]">{srv.price}</div>}
                </div>
              ))}
            </div>

            {showAddService && (
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Nome do serviço *"
                  value={newService.name || ''}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <textarea
                  rows={2}
                  placeholder="Descrição do serviço (até 280 caracteres) *"
                  value={newService.description || ''}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="Preço (Opcional, ex: A partir de R$ 350)"
                    value={newService.price || ''}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddService(false)}
                      className="px-3 py-1 rounded-lg border text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newService.name || !newService.description) return;
                        const srvToAdd: ServiceItem = {
                          id: `srv-${Date.now()}`,
                          name: newService.name,
                          description: newService.description,
                          price: newService.price,
                        };
                        handleSave({
                          ...currentClient,
                          publicProfile: {
                            ...currentClient.publicProfile,
                            services: [...currentClient.publicProfile.services, srvToAdd],
                          },
                        });
                        setShowAddService(false);
                        setNewService({});
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold"
                    >
                      Salvar Serviço
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mídias Autorizadas para Divulgação */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Mídias Autorizadas para Landing Page ({currentClient.publicProfile.media.length} itens)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Fotos autorizadas explicitamente pelo cliente para compor a galeria pública ou destaque.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMedia(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                + Adicionar Foto
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentClient.publicProfile.media.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group text-xs bg-slate-50 dark:bg-slate-800"
                >
                  <img src={item.url} alt={item.alt} className="w-full h-28 object-cover" />
                  <div className="p-2 space-y-1">
                    <div className="font-semibold truncate">{item.title || item.alt}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{item.kind}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedMedia = currentClient.publicProfile.media.filter((m) => m.id !== item.id);
                          handleSave({
                            ...currentClient,
                            publicProfile: { ...currentClient.publicProfile, media: updatedMedia },
                          });
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showAddMedia && (
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2 text-xs">
                <input
                  type="url"
                  placeholder="URL da Imagem (HTTPS, ex: Unsplash) *"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Título ou descrição curta *"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <div className="flex justify-between items-center">
                  <select
                    value={newMediaKind}
                    onChange={(e) => setNewMediaKind(e.target.value as any)}
                    className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs"
                  >
                    <option value="portfolio">Portfólio / Galeria</option>
                    <option value="portrait">Retrato Profissional</option>
                    <option value="cover">Capa / Destaque</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMedia(false)}
                      className="px-3 py-1 rounded-lg border text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newMediaUrl) return;
                        const mediaToAdd: PublicMediaItem = {
                          id: `m-${Date.now()}`,
                          url: newMediaUrl,
                          title: newMediaTitle || 'Foto Autorizada',
                          alt: newMediaTitle || 'Foto do portfólio',
                          kind: newMediaKind,
                          authorized: true,
                        };
                        handleSave({
                          ...currentClient,
                          publicProfile: {
                            ...currentClient.publicProfile,
                            media: [...currentClient.publicProfile.media, mediaToAdd],
                          },
                        });
                        setShowAddMedia(false);
                        setNewMediaUrl('');
                        setNewMediaTitle('');
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold"
                    >
                      Adicionar Mídia
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Tarefas */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Tarefas Operacionais do Atendimento
            </h2>
            <button
              type="button"
              onClick={() => setShowAddTask(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
            >
              + Nova Tarefa
            </button>
          </div>

          <div className="space-y-2">
            {currentClient.tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                Nenhuma tarefa registrada para este cliente.
              </div>
            ) : (
              currentClient.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    task.status === 'Concluída'
                      ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'Concluída'}
                      onChange={() => handleToggleTaskStatus(task.id)}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                    <div>
                      <div className={`font-semibold ${task.status === 'Concluída' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Prazo: {task.dueDate} • Resp: {task.responsible}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'alta'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>

          {showAddTask && (
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2 text-xs">
              <input
                type="text"
                placeholder="Título da tarefa *"
                value={newTask.title || ''}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={newTask.dueDate || ''}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <select
                  value={newTask.priority || 'media'}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value="baixa">Prioridade Baixa</option>
                  <option value="media">Prioridade Média</option>
                  <option value="alta">Prioridade Alta</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newTask.title) return;
                    const taskToAdd: ClientTask = {
                      id: `t-${Date.now()}`,
                      clientId: currentClient.id,
                      title: newTask.title,
                      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
                      responsible: currentClient.internalResponsible,
                      status: 'Aberta',
                      priority: newTask.priority || 'media',
                    };
                    handleSave({ ...currentClient, tasks: [...currentClient.tasks, taskToAdd] });
                    setShowAddTask(false);
                    setNewTask({ priority: 'media', status: 'Aberta' });
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  Salvar Tarefa
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Histórico / Trilha Operacional */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Histórico de Atendimento e Atividades
            </h2>
            <button
              type="button"
              onClick={() => setShowAddActivity(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
            >
              + Registrar Atividade
            </button>
          </div>

          <div className="space-y-3">
            {currentClient.activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                Nenhum evento registrado ainda.
              </div>
            ) : (
              currentClient.activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{act.author}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {act.channel}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(act.date).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(act.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{act.summary}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {showAddActivity && (
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2 text-xs">
              <div className="flex gap-2">
                <select
                  value={newActivity.channel || 'WhatsApp'}
                  onChange={(e) => setNewActivity({ ...newActivity, channel: e.target.value as any })}
                  className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telefone">Telefone</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Sistema">Sistema</option>
                </select>
              </div>
              <textarea
                rows={2}
                placeholder="Resumo do contato ou atendimento realizado *"
                value={newActivity.summary || ''}
                onChange={(e) => setNewActivity({ ...newActivity, summary: e.target.value })}
                className="w-full py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddActivity(false)}
                  className="px-3 py-1 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newActivity.summary) return;
                    const actToAdd: ClientActivity = {
                      id: `act-${Date.now()}`,
                      clientId: currentClient.id,
                      date: new Date().toISOString(),
                      author: currentClient.internalResponsible,
                      channel: newActivity.channel || 'WhatsApp',
                      summary: newActivity.summary,
                    };
                    handleSave({ ...currentClient, activities: [actToAdd, ...currentClient.activities] });
                    setShowAddActivity(false);
                    setNewActivity({ channel: 'WhatsApp' });
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  Gravar Histórico
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. Landing Pages Vinculadas */}
      {activeTab === 'pages' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Landing Pages de {currentClient.publicProfile.publicName || currentClient.identificationName}
              </h2>
              <p className="text-xs text-slate-500">
                Páginas com conteúdo, prévias e histórico independentes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenPageWizard(currentClient.id)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              + Nova Landing Page
            </button>
          </div>

          <div className="space-y-3">
            {pages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl space-y-2">
                <FileCode className="w-8 h-8 mx-auto text-slate-300" />
                <p>Nenhuma landing page criada ainda para este cliente.</p>
                <button
                  type="button"
                  onClick={() => onOpenPageWizard(currentClient.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs"
                >
                  Sugerir Primeira Landing Page
                </button>
              </div>
            ) : (
              pages.map((page) => {
                const currentRev = page.revisions.find((r) => r.id === page.currentRevisionId);
                return (
                  <div
                    key={page.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{page.title}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                          {page.template}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700">
                          Rev #{currentRev?.revisionNumber || 1}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {page.publishedUrl ? (
                          <span className="text-emerald-600 font-medium">Publicado em: {page.publishedUrl}</span>
                        ) : (
                          <span>Sem URL externa registrada</span>
                        )}
                        <span> • Visibilidade no Portal: <strong>{page.portalVisibility}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenPageEditor(page.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Abrir Editor & Prévia
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
