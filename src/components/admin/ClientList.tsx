import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Building2,
  User,
  ChevronRight,
  Sparkles,
  Archive,
  RotateCcw,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Client, ClientType, ClientStatus } from '../../types';
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ } from '../../services/security';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (clientId: string) => void;
  onOpenPageWizard: (clientId: string) => void;
  onSaveNewClient: (client: Client) => Promise<void>;
  onToggleArchive: (clientId: string) => Promise<void>;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onSelectClient,
  onOpenPageWizard,
  onSaveNewClient,
  onToggleArchive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [typeFilter, setTypeFilter] = useState<string>('Todos');

  // Modal Novo Cliente
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ClientType>('PF');
  const [name, setName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('GO');
  const [activity, setActivity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [responsible, setResponsible] = useState('Admin Principal');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filtragem
  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.identificationName.toLowerCase().includes(q) ||
      c.publicProfile.publicName.toLowerCase().includes(q) ||
      c.publicProfile.activity.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      c.tags.some((t) => t.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    const matchesType = typeFilter === 'Todos' || c.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Informe o nome de identificação ou razão social.');
      return;
    }

    // Validação opcional de documento se preenchido
    if (modalType === 'PF' && docNumber.trim()) {
      if (!validateCPF(docNumber)) {
        setFormError('CPF com dígitos verificadores inválidos.');
        return;
      }
    } else if (modalType === 'PJ' && docNumber.trim()) {
      if (!validateCNPJ(docNumber)) {
        setFormError('CNPJ com dígitos verificadores inválidos.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const newId = `client-${Date.now()}`;
      const tags = tagsInput
        ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
        : [activity || 'Cliente'];

      const newClient: Client = {
        id: newId,
        type: modalType,
        identificationName: modalType === 'PJ' ? (tradeName || name) : name,
        internalResponsible: responsible,
        status: 'Ativo',
        tags,
        city: city || 'Goiânia',
        state: state || 'GO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        identificationPF:
          modalType === 'PF'
            ? {
                civilName: name,
                cpf: docNumber ? docNumber.replace(/\D/g, '') : undefined,
                documentType: 'CIN',
              }
            : undefined,
        identificationPJ:
          modalType === 'PJ'
            ? {
                companyName: name,
                tradeName: tradeName || name,
                cnpj: docNumber ? docNumber.replace(/\D/g, '') : undefined,
              }
            : undefined,
        contacts: [
          {
            id: `c-${Date.now()}`,
            name: modalType === 'PF' ? name : tradeName || name,
            phone: phone || '62990000000',
            email: email || `${newId}@cliente.com`,
            role: modalType === 'PF' ? 'Titular' : 'Responsável',
            isPrimary: true,
          },
        ],
        documents: [],
        publicProfile: {
          id: `prof-${Date.now()}`,
          clientId: newId,
          publicName: modalType === 'PJ' ? (tradeName || name) : name,
          activity: activity || 'Prestação de Serviços Especializados',
          summary: `Atendimento qualificado em ${activity || 'nossa especialidade'} na região de ${city || 'Goiânia'}.`,
          mainCommercialChannel: {
            kind: 'whatsapp',
            value: phone || '62990000000',
            defaultMessage: `Olá, gostaria de um orçamento com ${modalType === 'PJ' ? tradeName || name : name}!`,
          },
          serviceLocation: `${city || 'Goiânia'} - ${state || 'GO'}`,
          services: [
            {
              id: `srv-${Date.now()}-1`,
              name: 'Atendimento e Consultoria Inicial',
              description: 'Avaliação técnica e planejamento personalizado de acordo com sua demanda.',
              price: 'Sob consulta',
            },
          ],
          aboutText: `Profissionais dedicados a entregar excelência com foco em transparência e resultados sólidos para nossos clientes em ${city || 'Goiânia'}.`,
          differentials: [
            'Atendimento transparente e personalizado',
            'Compromisso com prazos e qualidade',
            'Suporte dedicado ao cliente',
          ],
          media: [],
          socialLinks: [],
          visualIdentity: {
            primaryColor: '#2447C6',
            themeStyle: 'light',
          },
        },
        tasks: [],
        activities: [
          {
            id: `act-${Date.now()}`,
            clientId: newId,
            date: new Date().toISOString(),
            author: responsible,
            channel: 'Sistema',
            summary: 'Cliente cadastrado com sucesso na Central.',
          },
        ],
      };

      await onSaveNewClient(newClient);
      setShowModal(false);
      // Reset form
      setName('');
      setDocNumber('');
      setTradeName('');
      setActivity('');
      setPhone('');
      setEmail('');
      setTagsInput('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Topo: Título e Botão Novo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Carteira de Clientes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cadastros administrativos de pessoas físicas e jurídicas, contatos e perfis de divulgação.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Cliente
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Campo de Busca */}
        <div className="relative md:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, cidade ou tag..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtro de Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Em cadastro">Em cadastro</option>
            <option value="Inativo">Inativo</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>

        {/* Filtro de Tipo */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Tipo:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Todos">PF e PJ</option>
            <option value="PF">Pessoa Física (PF)</option>
            <option value="PJ">Pessoa Jurídica (PJ)</option>
          </select>
        </div>
      </div>

      {/* Lista de Clientes: Tabela no Desktop, Cards no Mobile */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Nenhum cliente localizado</p>
            <p>Tente ajustar os filtros ou cadastre um novo cliente.</p>
          </div>
        ) : (
          <>
            {/* Tabela para Telas Médias e Grandes */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Cliente / Nome Público</th>
                    <th className="py-3.5 px-4">Tipo & Documento</th>
                    <th className="py-3.5 px-4">Localização</th>
                    <th className="py-3.5 px-4">Responsável</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredClients.map((client) => {
                    const isArchived = client.status === 'Arquivado';

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                              {client.type === 'PF' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => onSelectClient(client.id)}
                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                              >
                                {client.publicProfile.publicName || client.identificationName}
                              </button>
                              <div className="text-[11px] text-slate-400">
                                {client.publicProfile.activity}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 mr-2">
                            {client.type}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {client.type === 'PF'
                              ? client.identificationPF?.cpf ? formatCPF(client.identificationPF.cpf) : 'Sem CPF'
                              : client.identificationPJ?.cnpj ? formatCNPJ(client.identificationPJ.cnpj) : 'Sem CNPJ'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {client.city ? `${client.city} - ${client.state || 'BR'}` : 'Não informada'}
                        </td>

                        <td className="py-3.5 px-4">
                          {client.internalResponsible}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              client.status === 'Ativo'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : client.status === 'Arquivado'
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {client.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenPageWizard(client.id)}
                              title="Criar ou Sugerir Landing Page para este cliente"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectClient(client.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold"
                            >
                              Abrir Ficha
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleArchive(client.id)}
                              title={isArchived ? 'Reativar cliente' : 'Arquivar cliente'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards para Telas Mobile */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map((client) => (
                <div key={client.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mr-1.5">
                        {client.type}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {client.publicProfile.publicName || client.identificationName}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">{client.publicProfile.activity}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        client.status === 'Ativo'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>{client.city || 'Cidade não inf.'}</span>
                    <span>Resp: {client.internalResponsible}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectClient(client.id)}
                      className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-xs"
                    >
                      Abrir Ficha
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPageWizard(client.id)}
                      className="w-1/2 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Sugerir LP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Cadastro de Novo Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Cadastrar Novo Cliente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternador de Tipo PF / PJ */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalType('PF')}
                className={`py-2 rounded-lg transition-all ${
                  modalType === 'PF'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Pessoa Física (PF)
              </button>
              <button
                type="button"
                onClick={() => setModalType('PJ')}
                className={`py-2 rounded-lg transition-all ${
                  modalType === 'PJ'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Pessoa Jurídica (PJ)
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {modalType === 'PF' ? 'Nome Civil Completo *' : 'Razão Social *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={modalType === 'PF' ? 'Ex: Marina Silveira da Rocha' : 'Ex: Silveira Fotografia LTDA'}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {modalType === 'PJ' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Fantasia (Público)
                  </label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Ex: Marina Fotografia Criativa"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {modalType === 'PF' ? 'CPF (Opcional)' : 'CNPJ (Opcional)'}
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder={modalType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Responsável Interno
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Atividade / Profissão Principal *
                </label>
                <input
                  type="text"
                  required
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="Ex: Fotografia de Família, Eletricista, Psicólogo..."
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Comercial
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="62991234567"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cidade / Região
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Goiânia"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags de Identificação (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ex: Fotografia, Eventos, Urgente"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {submitting ? 'Salvando...' : 'Salvar e Abrir Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
