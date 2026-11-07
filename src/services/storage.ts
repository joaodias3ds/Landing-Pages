/**
 * Repositório e Camada de Armazenamento Centralizado com Criptografia e Auditoria
 */

import {
  User,
  Client,
  LandingPage,
  PageRevision,
  Invitation,
  AuditEvent,
  PrivateDocument,
  PublicProfile,
  ABTest,
  ABTestVariation,
  ABTestDailyMetric,
} from '../types';
import { SecureStorage } from './security';

// Chaves de armazenamento
const STORAGE_KEYS = {
  USERS: 'app_users',
  CLIENTS: 'app_clients',
  PAGES: 'app_landing_pages',
  INVITATIONS: 'app_invitations',
  AUDIT: 'app_audit_logs',
  AB_TESTS: 'app_ab_tests',
  INITIALIZED: 'app_initialized_v6',
};

// Seed de Usuários
const SEED_USERS: User[] = [
  {
    id: 'user-admin-1',
    email: 'admin@central.com.br',
    name: 'Admin Principal',
    role: 'admin',
    mfaEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user-client-1',
    email: 'marina@fotografia.com',
    name: 'Marina Silveira',
    role: 'client',
    clientIds: ['client-1'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-01T14:30:00Z',
  },
  {
    id: 'user-client-2',
    email: 'carlos@eletro.com',
    name: 'Carlos Mendes',
    role: 'client',
    clientIds: ['client-2'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-10T09:15:00Z',
  },
  {
    id: 'user-client-adv',
    email: 'marcelo@bastosadv.com.br',
    name: 'Dr. Marcelo Bastos (Advogado)',
    role: 'client',
    clientIds: ['client-advocacia'],
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-12T10:00:00Z',
  },
  {
    id: 'user-client-beauty',
    email: 'contato@studiolumina.com.br',
    name: 'Camila Rocha (Studio Lumina)',
    role: 'client',
    clientIds: ['client-beleza'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 'user-client-coffee',
    email: 'contato@graonobre.com.br',
    name: 'Henrique Grão (BODREN Cafe)',
    role: 'client',
    clientIds: ['client-coffee'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-14T14:00:00Z',
  },
  {
    id: 'user-client-sushi',
    email: 'contato@hushsushi.com.br',
    name: 'Kenji Sato (Hush Sushi)',
    role: 'client',
    clientIds: ['client-sushi'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-15T15:00:00Z',
  },
];

// Seed de Clientes
const SEED_CLIENTS: Client[] = [
  {
    id: 'client-1',
    type: 'PF',
    identificationName: 'Marina Silveira Fotografia',
    internalResponsible: 'Admin Principal',
    status: 'Ativo',
    tags: ['Fotografia', 'Eventos', 'Goiânia', 'Portfólio'],
    city: 'Goiânia',
    state: 'GO',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-02-15T16:20:00Z',
    identificationPF: {
      civilName: 'Marina Silveira da Rocha',
      cpf: '38294158022',
      rgCin: '5928371-SSP/GO',
      documentType: 'CIN',
      notes: 'Cadastro confirmado com comprovante de residência e documento oficial.',
    },
    contacts: [
      {
        id: 'c-1',
        name: 'Marina Silveira',
        phone: '62991234567',
        email: 'marina@fotografia.com',
        role: 'Proprietária / Fotógrafa',
        isPrimary: true,
      },
    ],
    documents: [
      {
        id: 'doc-1',
        clientId: 'client-1',
        filename: 'identidade_marina_cin.pdf',
        category: 'identidade',
        fileSize: 1420500,
        mimeType: 'application/pdf',
        uploadDate: '2026-01-20T11:05:00Z',
        status: 'verified',
        purpose: 'Conferência de titularidade para contrato de serviços.',
      },
      {
        id: 'doc-2',
        clientId: 'client-1',
        filename: 'contrato_prestacao_servicos_assinado.pdf',
        category: 'contrato',
        fileSize: 840200,
        mimeType: 'application/pdf',
        uploadDate: '2026-01-20T11:15:00Z',
        status: 'verified',
        purpose: 'Contrato de desenvolvimento e divulgação digital.',
      },
    ],
    publicProfile: {
      id: 'prof-1',
      clientId: 'client-1',
      publicName: 'Marina Silveira Fotografia',
      activity: 'Fotografia de Família e Gestantes',
      summary: 'Ensaios afetivos ao ar livre e no aconchego do seu lar, eternizando os momentos mais puros em Goiânia e região.',
      mainCommercialChannel: {
        kind: 'whatsapp',
        value: '62991234567',
        defaultMessage: 'Olá Marina, vi seu portfólio no site e gostaria de um orçamento para ensaio de família!',
      },
      serviceLocation: 'Goiânia e Região Metropolitana (GO)',
      services: [
        {
          id: 'srv-1',
          name: 'Ensaio Família & Crianças',
          description: 'Sessão externa de até 2h com 40 fotos digitais em alta resolução, galeria privada e orientação de figurino.',
          price: 'A partir de R$ 680',
        },
        {
          id: 'srv-2',
          name: 'Ensaio Gestante Especial',
          description: 'Registro do amor e da espera com luz natural no pôr do sol ou em estúdio intimista.',
          price: 'A partir de R$ 750',
        },
        {
          id: 'srv-3',
          name: 'Newborn Afetivo Lifestyle',
          description: 'Fotografia acolhedora no quarto do bebê, respeitando o ritmo da amamentação e do soninho.',
          price: 'A partir de R$ 890',
        },
      ],
      aboutText: 'Sou fotógrafa há mais de 8 anos, apaixonada por capturar a espontaneidade e os olhares sinceros que as poses engessadas não mostram. Cada família tem sua própria melodia, e meu papel é transformar esses instantes passageiros em memórias palpáveis que atravessam gerações.',
      differentials: [
        'Entrega ágil de prévias em 48h para matar a curiosidade',
        'Abordagem paciente e lúdica que deixa as crianças à vontade',
        'Curadoria cuidadosa e tratamento fino de cor imagem por imagem',
        'Opção de álbuns impressos fine art de alta durabilidade',
      ],
      media: [
        {
          id: 'm-1',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
          alt: 'Retrato de Marina Silveira com câmera fotográfica',
          kind: 'portrait',
          authorized: true,
          title: 'Retrato Profissional',
        },
        {
          id: 'm-2',
          url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80',
          alt: 'Família feliz correndo no parque ao ar livre',
          kind: 'portfolio',
          authorized: true,
          title: 'Ensaio Família no Parque',
        },
        {
          id: 'm-3',
          url: 'https://images.unsplash.com/photo-1537655780520-1e392ead81f2?auto=format&fit=crop&w=900&q=80',
          alt: 'Criança sorrindo com olhar radiante em luz dourada',
          kind: 'portfolio',
          authorized: true,
          title: 'Retrato Infantil Afetivo',
        },
        {
          id: 'm-4',
          url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
          alt: 'Mãe abraçando a filha com carinho no bosque',
          kind: 'portfolio',
          authorized: true,
          title: 'Vínculo Materno Especial',
        },
        {
          id: 'm-5',
          url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80',
          alt: 'Ensaio Gestante com vestido fluído ao pôr do sol',
          kind: 'portfolio',
          authorized: true,
          title: 'Gestação e Poesia',
        },
      ],
      socialLinks: [
        { id: 's-1', label: 'Instagram', url: 'https://instagram.com/marinasilveirafoto' },
        { id: 's-2', label: 'Behance', url: 'https://behance.net/marinasilveira' },
      ],
      visualIdentity: {
        primaryColor: '#7c3aed',
        themeStyle: 'light',
      },
    },
    tasks: [
      {
        id: 't-1',
        clientId: 'client-1',
        title: 'Verificar domínio próprio registrado',
        description: 'Conferir se o cliente comprou o domínio marinafotografia.com.br e enviou DNS.',
        responsible: 'Admin Principal',
        dueDate: '2026-11-20',
        status: 'Aberta',
        priority: 'media',
      },
      {
        id: 't-2',
        clientId: 'client-1',
        title: 'Aprovar revisão 2 da Landing Page',
        description: 'Revisão com novas fotos de gestante aprovada com sucesso.',
        responsible: 'Admin Principal',
        dueDate: '2026-11-05',
        status: 'Concluída',
        priority: 'alta',
      },
    ],
    activities: [
      {
        id: 'act-1',
        clientId: 'client-1',
        date: '2026-11-06T14:00:00Z',
        author: 'Admin Principal',
        channel: 'WhatsApp',
        summary: 'Revisão 2 liberada no Portal do Cliente para visualização privada de Marina.',
      },
      {
        id: 'act-2',
        clientId: 'client-1',
        date: '2026-11-04T10:30:00Z',
        author: 'Admin Principal',
        channel: 'E-mail',
        summary: 'Convite enviado para ativação de acesso do portal.',
      },
    ],
  },
  {
    id: 'client-2',
    type: 'PJ',
    identificationName: 'Carlos Tech & Eletricidade',
    internalResponsible: 'Admin Principal',
    status: 'Ativo',
    tags: ['Eletricista', 'Automação', 'Curitiba', 'Serviços'],
    city: 'Curitiba',
    state: 'PR',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-18T11:45:00Z',
    identificationPJ: {
      companyName: 'Carlos Mendes Soluções Elétricas LTDA',
      tradeName: 'Carlos Tech Eletricidade',
      cnpj: '38192847000192',
      representativeName: 'Carlos Mendes de Souza',
      notes: 'Empresa cadastrada com alvará e registro profissional no CFT/CREA.',
    },
    contacts: [
      {
        id: 'c-2',
        name: 'Carlos Mendes',
        phone: '41988776655',
        email: 'carlos@eletro.com',
        role: 'Diretor Técnico',
        isPrimary: true,
      },
    ],
    documents: [
      {
        id: 'doc-3',
        clientId: 'client-2',
        filename: 'cartao_cnpj_carlos_tech.pdf',
        category: 'contrato',
        fileSize: 520000,
        mimeType: 'application/pdf',
        uploadDate: '2026-02-01T10:10:00Z',
        status: 'verified',
        purpose: 'Comprovação cadastral de PJ.',
      },
    ],
    publicProfile: {
      id: 'prof-2',
      clientId: 'client-2',
      publicName: 'Carlos Tech & Eletricidade',
      activity: 'Eletricista Predial e Automação Residencial',
      summary: 'Instalações elétricas seguras, laudos técnicos e automação inteligente para residências e condomínios em Curitiba.',
      mainCommercialChannel: {
        kind: 'whatsapp',
        value: '41988776655',
        defaultMessage: 'Olá Carlos, gostaria de um orçamento para serviço elétrico/automação!',
      },
      serviceLocation: 'Curitiba, São José dos Pinhais e Região Metropolitana',
      services: [
        {
          id: 'srv-c1',
          name: 'Instalação e Reforma Elétrica',
          description: 'Troca de fiação antiga, dimensionamento de cargas, instalação de disjuntores e DPS para proteção.',
          price: 'Sob vistoria técnica',
        },
        {
          id: 'srv-c2',
          name: 'Automação Residencial Smart',
          description: 'Integração de iluminação inteligente com Alexa e Google Home, fechaduras digitais e controle por celular.',
          price: 'Projetos sob medida',
        },
        {
          id: 'srv-c3',
          name: 'Montagem de Quadro de Distribuição',
          description: 'Organização técnica de QDC de acordo com a norma NBR 5410 com identificação visual dos circuitos.',
          price: 'Consulte valores',
        },
      ],
      aboutText: 'Com mais de 12 anos de experiência em engenharia elétrica e automação residencial, nosso compromisso inegociável é a segurança da sua família e do seu patrimônio contra sobrecargas, curtos-circuitos e incêndios.',
      differentials: [
        'Atendimento de urgência e chamados emergenciais',
        'Emissão de Laudo Técnico e ART quando solicitado',
        'Trabalho estritamente em conformidade com a NBR 5410',
        'Orçamento transparente sem custos ocultos',
      ],
      media: [
        {
          id: 'm-c1',
          url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80',
          alt: 'Eletricista trabalhando em quadro de distribuição elétrica',
          kind: 'cover',
          authorized: true,
          title: 'Serviço Elétrico Especializado',
        },
      ],
      socialLinks: [
        { id: 's-c1', label: 'Instagram', url: 'https://instagram.com/carlostecheletrica' },
      ],
      visualIdentity: {
        primaryColor: '#2563eb',
        themeStyle: 'neutral',
      },
    },
    tasks: [],
    activities: [],
  },
  {
    id: 'client-3',
    type: 'PF',
    identificationName: 'Dra. Beatriz Santos Psicologia',
    internalResponsible: 'Admin Principal',
    status: 'Ativo',
    tags: ['Psicologia', 'Saúde', 'São Paulo', 'Profissional'],
    city: 'São Paulo',
    state: 'SP',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
    identificationPF: {
      civilName: 'Beatriz Vasconcelos Santos',
      cpf: '49182736400',
      documentType: 'RG',
      notes: 'CRP 06/123456 ativo e verificado.',
    },
    contacts: [
      {
        id: 'c-3',
        name: 'Dra. Beatriz Santos',
        phone: '11977665544',
        email: 'contato@beatrizpsico.com.br',
        role: 'Psicóloga Clínica',
        isPrimary: true,
      },
    ],
    documents: [],
    publicProfile: {
      id: 'prof-3',
      clientId: 'client-3',
      publicName: 'Dra. Beatriz Santos',
      activity: 'Psicóloga Clínica e Terapeuta Cognitivo-Comportamental',
      summary: 'Acolhimento humanizado para ansiedade, estresse e autoconhecimento. Atendimento presencial na Av. Paulista e online para todo o Brasil.',
      mainCommercialChannel: {
        kind: 'whatsapp',
        value: '11977665544',
        defaultMessage: 'Olá Dra. Beatriz, gostaria de informações sobre agendamento de sessões de terapia.',
      },
      serviceLocation: 'São Paulo - SP (Av. Paulista) & Atendimento Online Nacional',
      services: [
        {
          id: 'srv-b1',
          name: 'Psicoterapia Individual Adulto',
          description: 'Sessões semanais focadas em manejo de ansiedade, depressão, burnout e relacionamentos interpessoais.',
          price: '50 min / sessão',
        },
        {
          id: 'srv-b2',
          name: 'Orientação Profissional e Transição de Carreira',
          description: 'Processo estruturado para alinhamento vocacional e desenvolvimento de metas sólidas.',
          price: 'Programa em 8 sessões',
        },
      ],
      aboutText: 'Mestre em Psicologia pela USP com mais de uma década dedicada à clínica. Acredito na terapia como um espaço seguro e livre de julgamentos, onde construímos juntos ferramentas práticas para lidar com as dores da vida moderna.',
      differentials: [
        'Prática clínica baseada em evidências científicas (TCC)',
        'Plataforma de telemedicina segura e sigilosa',
        'Atendimento acolhedor com foco em autonomia do paciente',
        'Consultório acessível a 200m do metrô Consolação',
      ],
      media: [
        {
          id: 'm-b1',
          url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
          alt: 'Dra. Beatriz Santos em seu consultório',
          kind: 'portrait',
          authorized: true,
          title: 'Retrato Profissional',
        },
      ],
      socialLinks: [
        { id: 's-b1', label: 'Instagram', url: 'https://instagram.com/drabeatrizpsico' },
      ],
      visualIdentity: {
        primaryColor: '#0d9488',
        themeStyle: 'light',
      },
    },
    tasks: [],
    activities: [],
  },
  {
    id: 'client-coffee',
    type: 'PJ',
    identificationName: 'Grão Nobre Cafeteria & Torrefação',
    internalResponsible: 'Admin Principal',
    status: 'Ativo',
    tags: ['Alimentação', 'Café', 'Comida', 'Gourmet', 'Delivery'],
    city: 'Belo Horizonte',
    state: 'MG',
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
    identificationPJ: {
      companyName: 'Grão Nobre Cafeteria e Torrefação Ltda',
      tradeName: 'BODREN Coffee & Barista',
      cnpj: '18492048000195',
      representativeName: 'Henrique Grão',
      notes: 'Café especial certificado, torra artesanal semanal e confeitaria própria.',
    },
    contacts: [
      {
        id: 'c-coffee-1',
        name: 'Henrique Grão',
        phone: '31988887766',
        email: 'contato@graonobre.com.br',
        role: 'Mestre Barista e Sócio Fundador',
        isPrimary: true,
      },
    ],
    documents: [],
    publicProfile: {
      id: 'prof-coffee',
      clientId: 'client-coffee',
      publicName: 'BODREN Café Especial & Torrefação',
      activity: 'Cafeteria Gourmet, Torrefação Artesanal e Confeitaria Fina',
      summary: 'Descubra o sabor autêntico do café especial em cada gole. Grãos 100% arábica de origem controlada, torra fresca e ambiente acolhedor.',
      mainCommercialChannel: {
        kind: 'whatsapp',
        value: '31988887766',
        defaultMessage: 'Olá! Gostaria de consultar o cardápio e fazer um pedido.',
      },
      serviceLocation: 'Belo Horizonte - MG (Savassi) & Delivery Expresso',
      services: [
        {
          id: 'srv-c1',
          name: 'Cappuccino Italiano Cremoso',
          description: 'Espresso duplo, leite vaporizado com textura aveludada e toque de cacau 70%.',
          price: 'R$ 14,00 (4.9 ★)',
        },
        {
          id: 'srv-c2',
          name: 'Latte Especial com Caramelo Salgado',
          description: '30% espresso selecionado, leite fresco e calda artesanal de caramelo.',
          price: 'R$ 16,00 (5.0 ★)',
        },
        {
          id: 'srv-c3',
          name: 'Mocha Belga Artesanal',
          description: 'Chocolate belga fundido, espresso intenso e finalização em chantilly fresco.',
          price: 'R$ 18,00 (4.8 ★)',
        },
      ],
      aboutText: 'Nossa paixão por café começa na escolha das fazendas parceiras no Cerrado Mineiro e Sul de Minas. Selecionamos pequenos lotes e torramos artesanalmente toda semana.',
      differentials: [
        'Grãos 100% Arábica selecionados de produtores artesanais premiados',
        'Torra fresca semanal para preservar aromas e acidez equilibrada',
        'Ambiente acolhedor com Wi-Fi veloz e tomadas para trabalho',
        'Baristas certificados e apaixonados pela arte do café',
      ],
      media: [
        {
          id: 'm-c1',
          url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
          alt: 'Xícara de cappuccino arte latte',
          kind: 'portfolio',
          authorized: true,
          title: 'Cappuccino com Arte Latte',
        },
        {
          id: 'm-c2',
          url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
          alt: 'Grãos de café torrados artesanais',
          kind: 'portfolio',
          authorized: true,
          title: 'Grãos Nobres Selecionados',
        },
      ],
      socialLinks: [{ id: 'sc-1', label: 'Instagram', url: 'https://instagram.com/bodrencafe' }],
      visualIdentity: {
        primaryColor: '#5ea39d',
        themeStyle: 'dark',
      },
    },
    tasks: [],
    activities: [],
  },
  {
    id: 'client-sushi',
    type: 'PJ',
    identificationName: 'Hush Modern Sushi & Gastronomia',
    internalResponsible: 'Admin Principal',
    status: 'Ativo',
    tags: ['Alimentação', 'Restaurante', 'Sushi', 'Comida', 'Omakase'],
    city: 'Curitiba',
    state: 'PR',
    createdAt: '2026-02-14T11:00:00Z',
    updatedAt: '2026-02-14T11:00:00Z',
    identificationPJ: {
      companyName: 'Hush Gastronomia Oriental Contemporânea Ltda',
      tradeName: 'Hush Modern Restaurant',
      cnpj: '29384029000188',
      representativeName: 'Kenji Sato',
      notes: 'Cozinha japonesa contemporânea com peixes frescos do litoral e cortes nobres.',
    },
    contacts: [
      {
        id: 'c-sushi-1',
        name: 'Kenji Sato',
        phone: '41977778899',
        email: 'contato@hushsushi.com.br',
        role: 'Chef Executivo & Proprietário',
        isPrimary: true,
      },
    ],
    documents: [],
    publicProfile: {
      id: 'prof-sushi',
      clientId: 'client-sushi',
      publicName: 'Hush Modern Sushi & Gastronomia',
      activity: 'Restaurante Japonês Contemporâneo & Omakase',
      summary: 'Gastronomia japonesa contemporânea com peixes frescos, cortes autorais de precisão e combos exclusivos em um ambiente intimista.',
      mainCommercialChannel: {
        kind: 'whatsapp',
        value: '41977778899',
        defaultMessage: 'Olá! Gostaria de reservar uma mesa ou fazer um pedido de sushi.',
      },
      serviceLocation: 'Curitiba - PR (Batel) & Delivery Selecionado',
      services: [
        {
          id: 'srv-s1',
          name: 'Combo Omakase do Chef (24 Peças)',
          description: 'Seleção especial com sashimis de salmão maçaricado, niguiris trufados e uramakis especiais.',
          price: 'R$ 119,00',
        },
        {
          id: 'srv-s2',
          name: 'Salmão Trufado com Flor de Sal',
          description: 'Lâminas nobres de salmão fresco, azeite trufado, raspas de limão siciliano e gergelim.',
          price: 'R$ 54,00',
        },
        {
          id: 'srv-s3',
          name: 'Hot Roll Especial de Shimeji & Cream Cheese',
          description: 'Enrolado crocante frito na hora com shimeji salteado na manteiga e molho tarê autoral.',
          price: 'R$ 42,00',
        },
      ],
      aboutText: 'Criado pelo Chef Kenji Sato, o Hush une a tradição milenar japonesa a técnicas contemporâneas de finalização e defumação leve.',
      differentials: [
        'Peixes frescos entregues diariamente com rigoroso controle de temperatura',
        'Receitas exclusivas com ingredientes importados do Japão',
        'Ambiente intimista e contemporâneo ideal para jantares e celebrações',
        'Embalagens térmicas especiais para delivery que preservam textura e crocância',
      ],
      media: [
        {
          id: 'm-s1',
          url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
          alt: 'Sashimi de salmão em prato de ardósia',
          kind: 'portfolio',
          authorized: true,
          title: 'Sashimi em Prato de Pedra',
        },
        {
          id: 'm-s2',
          url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
          alt: 'Combinado especial de sushi',
          kind: 'portfolio',
          authorized: true,
          title: 'Combinado Omakase 24 Peças',
        },
      ],
      socialLinks: [{ id: 'ss-1', label: 'Instagram', url: 'https://instagram.com/hushsushi' }],
      visualIdentity: {
        primaryColor: '#ff5722',
        themeStyle: 'dark',
      },
    },
    tasks: [],
    activities: [],
  },
  {
    id: 'client-advocacia',
    type: 'PF',
    identificationName: 'Dr. Marcelo Bastos Advocacia & Consultoria',
    internalResponsible: 'Admin Principal',
    status: 'Ativo',
    tags: ['Advocacia', 'Jurídico', 'Direito', 'Empresarial', 'Contratos'],
    city: 'São Paulo',
    state: 'SP',
    createdAt: '2026-02-14T12:00:00Z',
    updatedAt: '2026-02-14T12:00:00Z',
    identificationPF: {
      civilName: 'Marcelo Bastos de Albuquerque',
      cpf: '58291048201',
      documentType: 'CIN',
      notes: 'Inscrição OAB/SP 284.192 ativa. Especialista em Direito Societário e Cível.',
    },
    contacts: [
      {
        id: 'c-adv-1',
        name: 'Dr. Marcelo Bastos',
        phone: '11988881122',
        email: 'marcelo@bastosadv.com.br',
        role: 'Advogado Titular e Consultor Jurídico',
        isPrimary: true,
      },
    ],
    documents: [],
    publicProfile: {
      id: 'prof-adv',
      clientId: 'client-advocacia',
      publicName: 'Bastos & Associados Advocacia Estratégica',
      activity: 'Advocacia Empresarial, Cível & Consultoria Jurídica',
      summary: 'Soluções jurídicas estratégicas e personalizadas com mais de 15 anos de excelência na defesa dos interesses de empresas e famílias.',
      mainCommercialChannel: {
        kind: 'whatsapp',
        value: '11988881122',
        defaultMessage: 'Olá Dr. Marcelo, gostaria de agendar uma consulta jurídica confidencial.',
      },
      serviceLocation: 'São Paulo - SP (Faria Lima) & Atendimento Nacional',
      services: [
        {
          id: 'srv-a1',
          name: 'Direito Empresarial & Contratos Comerciais',
          description: 'Blindagem jurídica, elaboração contratual, fusões, aquisições e compliance.',
          price: 'Consultoria Estratégica',
        },
        {
          id: 'srv-a2',
          name: 'Direito Civil, Família & Sucessões',
          description: 'Planejamento sucessório, inventários judiciais e extrajudiciais, divórcios e partilha de bens.',
          price: 'Atendimento Dedicado',
        },
        {
          id: 'srv-a3',
          name: 'Defesa Trabalhista & Relações de Trabalho',
          description: 'Assessoria preventiva para empresas e defesa contenciosa com alta taxa de êxito.',
          price: 'Honorários sob Consulta',
        },
      ],
      aboutText: 'Formado pela USP com pós-graduação em Direito Corporativo e Tributário pela FGV. Há mais de 15 anos conduz causas com rigor ético, combatividade e atendimento individualizado.',
      differentials: [
        'Atendimento confidencial e sigiloso conforme o Código de Ética da OAB',
        'Mais de 15 anos de atuação com mais de 2.500 casos de sucesso',
        'Comunicação clara e transparente com relatórios periódicos de andamento',
        'Atuação ágil tanto na esfera preventiva quanto no contencioso estratégico',
      ],
      media: [
        {
          id: 'm-a1',
          url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
          alt: 'Sede corporativa do escritório na Faria Lima',
          kind: 'portfolio',
          authorized: true,
          title: 'Sede Corporativa Faria Lima',
        },
        {
          id: 'm-a2',
          url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
          alt: 'Sala de reuniões com advogados associados',
          kind: 'portfolio',
          authorized: true,
          title: 'Sala de Conferências',
        },
      ],
      socialLinks: [{ id: 'sa-1', label: 'LinkedIn', url: 'https://linkedin.com/in/marcelobastosadv' }],
      visualIdentity: {
        primaryColor: '#eab308',
        themeStyle: 'dark',
      },
    },
    tasks: [],
    activities: [],
  },
  {
    id: 'client-beleza',
    type: 'PJ',
    identificationName: 'Studio Lumina Cabelo, Estética & Nail Bar',
    internalResponsible: 'Admin Principal',
    status: 'Ativo',
    tags: ['Beleza', 'Cabelo', 'Unhas', 'Nail Bar', 'Estética'],
    city: 'Rio de Janeiro',
    state: 'RJ',
    createdAt: '2026-02-14T13:00:00Z',
    updatedAt: '2026-02-14T13:00:00Z',
    identificationPJ: {
      companyName: 'Lumina Studio de Beleza e Estética Ltda',
      tradeName: 'Studio Lumina Nail & Hair',
      cnpj: '39482019000177',
      representativeName: 'Camila Rocha',
      notes: 'Espaço boutique com serviços completos de cabeleireiro visagista e nail bar em gel.',
    },
    contacts: [
      {
        id: 'c-bel-1',
        name: 'Camila Rocha',
        phone: '21999998877',
        email: 'contato@studiolumina.com.br',
        role: 'Diretora Criativa & Master Colorista',
        isPrimary: true,
      },
    ],
    documents: [],
    publicProfile: {
      id: 'prof-beleza',
      clientId: 'client-beleza',
      publicName: 'Studio Lumina Cabelo & Nail Bar',
      activity: 'Salão de Beleza Boutique, Cabeleireiros Visagistas & Nail Bar',
      summary: 'Realce sua beleza com especialistas em morena iluminada, visagismo, manicure russa e nail art em gel. Biossegurança e atendimento exclusivo.',
      mainCommercialChannel: {
        kind: 'whatsapp',
        value: '21999998877',
        defaultMessage: 'Olá! Gostaria de agendar um horário para cabelo/unhas no Studio Lumina.',
      },
      serviceLocation: 'Rio de Janeiro - RJ (Ipanema)',
      services: [
        {
          id: 'srv-u1',
          name: 'Alongamento em Fibra de Vidro & Nail Art',
          description: 'Unhas perfeitas com aspecto natural, curvatura C impecável e esmaltação em gel.',
          price: 'R$ 160,00',
        },
        {
          id: 'srv-u2',
          name: 'Mechas Balayage & Morena Iluminada',
          description: 'Técnica personalizada com preservação da saúde dos fios e tonalização exclusiva.',
          price: 'A partir de R$ 380,00',
        },
        {
          id: 'srv-u3',
          name: 'Spa dos Pés & Manicure Russa',
          description: 'Esfoliação profunda, cutilagem a seco de alta precisão e hidratação com parafina.',
          price: 'R$ 95,00',
        },
      ],
      aboutText: 'O Studio Lumina foi planejado para ser o seu refúgio de beleza no coração de Ipanema. Nossa equipe é constantemente treinada nas tendências internacionais de coloração e nail design.',
      differentials: [
        'Esterilização hospitalar de materiais em autoclave com embalagens seladas',
        'Produtos importados de alta durabilidade que não agridem unhas e cabelos',
        'Profissionais com formação internacional e certificação técnica',
        'Pontualidade rigorosa e atendimento com café e espumante cortesia',
      ],
      media: [
        {
          id: 'm-u1',
          url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
          alt: 'Nail art e unhas em gel com acabamento fino',
          kind: 'portfolio',
          authorized: true,
          title: 'Alongamento em Fibra & Nail Art',
        },
        {
          id: 'm-u2',
          url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
          alt: 'Cabelo longo morena iluminada',
          kind: 'portfolio',
          authorized: true,
          title: 'Morena Iluminada em Ipanema',
        },
      ],
      socialLinks: [{ id: 'su-1', label: 'Instagram', url: 'https://instagram.com/studioluminario' }],
      visualIdentity: {
        primaryColor: '#c6ff00',
        themeStyle: 'dark',
      },
    },
    tasks: [],
    activities: [],
  },
];

// Seed de Landing Pages
const SEED_PAGES: LandingPage[] = [
  {
    id: 'page-1',
    clientId: 'client-1',
    title: 'Landing Page Oficial - Marina Fotografia',
    slug: 'marina-fotografia',
    template: 'portfolio',
    goal: 'Divulgar portfólio e receber pedidos de orçamento via WhatsApp',
    portalVisibility: 'Disponível',
    currentRevisionId: 'rev-1-2',
    publishedUrl: 'https://marinafotografia.com.br',
    publicationStatus: 'Publicada informada',
    publishedRevisionNumber: 2,
    publishedAt: '2026-11-06T15:00:00Z',
    publishedOperator: 'Admin Principal',
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-11-06T14:30:00Z',
    revisions: [
      {
        id: 'rev-1-1',
        pageId: 'page-1',
        revisionNumber: 1,
        editorialStatus: 'Aprovada',
        approvedAt: '2026-01-25T11:00:00Z',
        approvedBy: 'Admin Principal',
        clientPreviewReleased: false,
        createdAt: '2026-01-22T10:00:00Z',
        config: {
          template: 'portfolio',
          themeStyle: 'light',
          primaryColor: '#7c3aed',
          header: {
            title: 'Marina Silveira Fotografia',
            subtitle: 'Ensaios afetivos ao ar livre e no aconchego do seu lar em Goiânia.',
            ctaLabel: 'Solicitar Orçamento',
            ctaTargetSection: 'contact',
          },
          sectionsOrder: ['hero', 'gallery', 'about', 'services', 'differentials', 'contact'],
          sectionsEnabled: {
            hero: true,
            gallery: true,
            about: true,
            services: true,
            differentials: true,
            contact: true,
            campaign: false,
          },
          about: {
            title: 'Sobre Marina Silveira',
            text: 'Fotógrafa apaixonada por capturar a espontaneidade e os olhares sinceros que as poses engessadas não mostram.',
          },
          services: [
            { id: 'srv-1', title: 'Ensaio Família & Crianças', description: 'Sessão externa com 40 fotos digitais tratadas.', price: 'A partir de R$ 680' },
            { id: 'srv-2', title: 'Ensaio Gestante Especial', description: 'Registro inesquecível da espera ao pôr do sol.', price: 'A partir de R$ 750' },
          ],
          differentials: [
            'Entrega ágil de prévias em 48h',
            'Abordagem paciente e lúdica com os pequenos',
            'Tratamento fino de cor',
          ],
          gallery: [
            { id: 'g-1', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80', title: 'Família no Parque', alt: 'Família feliz correndo no parque' },
            { id: 'g-2', url: 'https://images.unsplash.com/photo-1537655780520-1e392ead81f2?auto=format&fit=crop&w=900&q=80', title: 'Criança Radiante', alt: 'Criança sorrindo em luz dourada' },
          ],
          contact: {
            kind: 'whatsapp',
            value: '62991234567',
            ctaLabel: 'Falar no WhatsApp',
            address: 'Goiânia e Região Metropolitana (GO)',
            customMessage: 'Olá Marina, vi seu site e gostaria de agendar um ensaio!',
          },
          seo: {
            title: 'Marina Silveira Fotografia | Fotógrafa de Família em Goiânia',
            description: 'Ensaios afetivos de família, gestante e crianças em Goiânia. Agende sua sessão.',
            ogImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
            canonicalUrl: 'https://marinafotografia.com.br',
          },
        },
      },
      {
        id: 'rev-1-2',
        pageId: 'page-1',
        revisionNumber: 2,
        editorialStatus: 'Aprovada',
        approvedAt: '2026-11-05T16:00:00Z',
        approvedBy: 'Admin Principal',
        clientPreviewReleased: true, // Liberada para o Portal do Cliente!
        createdAt: '2026-11-04T14:00:00Z',
        config: {
          template: 'portfolio',
          themeStyle: 'light',
          primaryColor: '#7c3aed',
          header: {
            title: 'Marina Silveira Fotografia',
            subtitle: 'Ensaios de família e gestante com alma, luz natural e afeto genuíno em Goiânia.',
            ctaLabel: 'Ver Trabalhos & Orçamento',
            ctaTargetSection: 'gallery',
          },
          sectionsOrder: ['hero', 'gallery', 'about', 'services', 'differentials', 'contact'],
          sectionsEnabled: {
            hero: true,
            gallery: true,
            about: true,
            services: true,
            differentials: true,
            contact: true,
            campaign: false,
          },
          about: {
            title: 'Conheça Minha História',
            text: 'Sou fotógrafa há mais de 8 anos em Goiânia, apaixonada por capturar a espontaneidade e os olhares sinceros que as poses engessadas não revelam. Transformo momentos simples em relíquias de família.',
          },
          services: [
            { id: 'srv-1', title: 'Ensaio Família & Crianças', description: 'Sessão externa de 2h com 40 fotos digitais em alta resolução e galeria privativa online.', price: 'A partir de R$ 680' },
            { id: 'srv-2', title: 'Ensaio Gestante Especial', description: 'Registro inesquecível da espera ao pôr do sol ou estúdio acolhedor.', price: 'A partir de R$ 750' },
            { id: 'srv-3', title: 'Newborn Lifestyle', description: 'Fotografia afetiva no aconchego do lar, respeitando o ritmo do recém-nascido.', price: 'A partir de R$ 890' },
          ],
          differentials: [
            'Entrega ágil de prévias em 48h para matar a curiosidade',
            'Abordagem paciente e lúdica que deixa as crianças soltas',
            'Curadoria cuidadosa e tratamento fino de cor foto a foto',
            'Álbuns impressos fine art de altíssima durabilidade',
          ],
          gallery: [
            { id: 'g-1', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80', title: 'Família no Bosque', alt: 'Família correndo feliz no parque' },
            { id: 'g-2', url: 'https://images.unsplash.com/photo-1537655780520-1e392ead81f2?auto=format&fit=crop&w=900&q=80', title: 'Sorriso de Criança', alt: 'Criança rindo em luz natural' },
            { id: 'g-3', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80', title: 'Abraço Materno', alt: 'Mãe e filha abraçadas com ternura' },
            { id: 'g-4', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80', title: 'Gestação Dourada', alt: 'Gestante ao entardecer' },
          ],
          contact: {
            kind: 'whatsapp',
            value: '62991234567',
            ctaLabel: 'Solicitar Orçamento no WhatsApp',
            address: 'Atendimento em Goiânia e Região Metropolitana (GO)',
            customMessage: 'Olá Marina, vi sua página oficial e gostaria de agendar uma data para ensaio!',
          },
          seo: {
            title: 'Marina Silveira Fotografia | Ensaios de Família e Gestante em Goiânia',
            description: 'Eternize os momentos mais puros da sua família em Goiânia com ensaios ao ar livre e lifestyle.',
            ogImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
            canonicalUrl: 'https://marinafotografia.com.br',
          },
        },
      },
    ],
  },
  {
    id: 'page-2',
    clientId: 'client-2',
    title: 'Landing Page de Serviços - Carlos Tech',
    slug: 'carlos-tech-eletrica',
    template: 'services',
    goal: 'Receber solicitações de orçamentos para instalações e automação',
    portalVisibility: 'Disponível',
    currentRevisionId: 'rev-2-1',
    publicationStatus: 'Sem registro',
    createdAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
    revisions: [
      {
        id: 'rev-2-1',
        pageId: 'page-2',
        revisionNumber: 1,
        editorialStatus: 'Aprovada',
        approvedAt: '2026-02-18T10:00:00Z',
        approvedBy: 'Admin Principal',
        clientPreviewReleased: true,
        createdAt: '2026-02-05T11:00:00Z',
        config: {
          template: 'services',
          themeStyle: 'neutral',
          primaryColor: '#2563eb',
          header: {
            title: 'Carlos Tech & Eletricidade',
            subtitle: 'Instalações elétricas de alta precisão e automação residencial inteligente em Curitiba.',
            ctaLabel: 'Pedir Orçamento Rápido',
            ctaTargetSection: 'contact',
          },
          sectionsOrder: ['hero', 'services', 'differentials', 'about', 'contact'],
          sectionsEnabled: {
            hero: true,
            services: true,
            differentials: true,
            about: true,
            contact: true,
            gallery: false,
            campaign: false,
          },
          about: {
            title: 'Compromisso Técnico e Segurança',
            text: 'Mais de 12 anos executando instalações residenciais e prediais conforme rigorosas normas de segurança.',
          },
          services: [
            { id: 'sc-1', title: 'Instalação e Reforma Elétrica', description: 'Revisão de fiação, quadros de disjuntores, DPS e balanceamento de cargas.', price: 'Orçamento transparente' },
            { id: 'sc-2', title: 'Automação Residencial Smart', description: 'Comandos de voz, interruptores Wi-Fi e cenários inteligentes integrados.', price: 'Projetos customizados' },
            { id: 'sc-3', title: 'Montagem de Quadro (QDC)', description: 'Organização técnica seguindo a norma NBR 5410 com identificação visual.', price: 'Consulte valores' },
          ],
          differentials: [
            'Atendimento de urgência e chamados rápidos',
            'Emissão de Laudo Técnico e ART',
            'Trabalho rigorosamente em conformidade com a NBR 5410',
            'Garantia por escrito de todos os serviços prestados',
          ],
          gallery: [],
          contact: {
            kind: 'whatsapp',
            value: '41988776655',
            ctaLabel: 'Chamar no WhatsApp',
            address: 'Curitiba e Região Metropolitana - PR',
            customMessage: 'Olá Carlos, preciso de um orçamento para serviço elétrico.',
          },
          seo: {
            title: 'Carlos Tech Eletricidade & Automação | Curitiba',
            description: 'Serviços elétricos profissionais e automação residencial em Curitiba.',
          },
        },
      },
    ],
  },
  {
    id: 'page-coffee',
    clientId: 'client-coffee',
    title: 'BODREN Café Especial & Torrefação Artesanal',
    slug: 'bodren-cafe',
    template: 'food-coffee',
    goal: 'Divulgar cardápio de cafés especiais, notas de prova e receber pedidos no balcão e delivery',
    portalVisibility: 'Disponível',
    currentRevisionId: 'rev-coffee-1',
    publishedUrl: 'https://bodrencafe.com.br',
    publicationStatus: 'Publicada informada',
    publishedRevisionNumber: 1,
    publishedAt: '2026-11-06T18:00:00Z',
    publishedOperator: 'Admin Principal',
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-11-06T18:00:00Z',
    revisions: [
      {
        id: 'rev-coffee-1',
        pageId: 'page-coffee',
        revisionNumber: 1,
        editorialStatus: 'Aprovada',
        approvedAt: '2026-11-06T18:00:00Z',
        approvedBy: 'Admin Principal',
        clientPreviewReleased: true,
        createdAt: '2026-02-14T10:00:00Z',
        config: {
          template: 'food-coffee',
          themeStyle: 'dark',
          primaryColor: '#5ea39d',
          header: {
            title: 'BODREN Café Especial & Torrefação',
            subtitle: 'Descubra o sabor autêntico do café especial em cada gole com grãos 100% arábica de pequenos produtores premiados.',
            ctaLabel: 'Ver Cardápio & Fazer Pedido',
            ctaTargetSection: 'services',
          },
          sectionsOrder: ['hero', 'services', 'differentials', 'gallery', 'campaign', 'about', 'contact'],
          sectionsEnabled: {
            hero: true,
            services: true,
            differentials: true,
            gallery: true,
            campaign: true,
            about: true,
            contact: true,
          },
          about: {
            title: 'Nossa Arte com o Café',
            text: 'Mais do que uma bebida, o café para nós é uma jornada sensorial. Selecionamos os melhores grãos de altitude de Minas Gerais e torramos em pequenos lotes semanais.',
          },
          services: [
            {
              id: 'sc-1',
              title: 'Cappuccino Italiano Cremoso',
              description: 'Espresso duplo, leite vaporizado com textura aveludada e toque de cacau 70%.',
              price: 'R$ 14,00 (4.9 ★)',
            },
            {
              id: 'sc-2',
              title: 'Latte Especial com Caramelo Salgado',
              description: '30% espresso selecionado, leite fresco e calda artesanal de caramelo.',
              price: 'R$ 16,00 (5.0 ★)',
            },
            {
              id: 'sc-3',
              title: 'Mocha Belga Artesanal',
              description: 'Chocolate belga fundido, espresso intenso e finalização em chantilly fresco.',
              price: 'R$ 18,00 (4.8 ★)',
            },
          ],
          differentials: [
            'Grãos 100% Arábica selecionados de produtores artesanais premiados',
            'Torra fresca semanal para preservar aromas e acidez equilibrada',
            'Ambiente acolhedor com Wi-Fi veloz e tomadas para trabalho',
            'Baristas certificados e apaixonados pela arte do café',
          ],
          gallery: [
            {
              id: 'gc-1',
              url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
              title: 'Arte Latte Feita na Hora',
              alt: 'Cappuccino com arte latte',
            },
            {
              id: 'gc-2',
              url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
              title: 'Torrefação Própria em Grãos',
              alt: 'Grãos torrados artesanais',
            },
          ],
          campaignOffer: {
            badge: 'Quiz Sensorial de Café',
            title: 'Descubra qual perfil de café combina mais com você',
            description: 'Responda 3 perguntas no WhatsApp e receba uma recomendação exclusiva com 10% OFF no primeiro pedido.',
            conditions: 'Promoção válida para consumo na casa ou entrega rápida em Belo Horizonte.',
            ctaSecondary: 'Fazer Pedido',
          },
          contact: {
            kind: 'whatsapp',
            value: '31988887766',
            ctaLabel: 'Pedir no WhatsApp Delivery',
            address: 'Rua Antônio de Albuquerque, 420 - Savassi, Belo Horizonte - MG',
            customMessage: 'Olá! Gostaria de consultar o cardápio e fazer um pedido.',
          },
          seo: {
            title: 'BODREN Café Especial | Cafeteria Gourmet & Torrefação',
            description: 'Café especial com grãos de origem controlada, torra fresca e confeitaria artesanal.',
          },
        },
      },
    ],
  },
  {
    id: 'page-sushi',
    clientId: 'client-sushi',
    title: 'Hush Modern Restaurant - Gastronomia Japonesa',
    slug: 'hush-sushi',
    template: 'food-restaurant',
    goal: 'Apresentar restaurante japonês moderno, cardápio de combos e receber reservas de mesa',
    portalVisibility: 'Disponível',
    currentRevisionId: 'rev-sushi-1',
    publishedUrl: 'https://hushsushi.com.br',
    publicationStatus: 'Publicada informada',
    publishedRevisionNumber: 1,
    publishedAt: '2026-11-06T19:00:00Z',
    publishedOperator: 'Admin Principal',
    createdAt: '2026-02-14T11:00:00Z',
    updatedAt: '2026-11-06T19:00:00Z',
    revisions: [
      {
        id: 'rev-sushi-1',
        pageId: 'page-sushi',
        revisionNumber: 1,
        editorialStatus: 'Aprovada',
        approvedAt: '2026-11-06T19:00:00Z',
        approvedBy: 'Admin Principal',
        clientPreviewReleased: true,
        createdAt: '2026-02-14T11:00:00Z',
        config: {
          template: 'food-restaurant',
          themeStyle: 'dark',
          primaryColor: '#ff5722',
          header: {
            title: 'Hush Modern Sushi & Gastronomia',
            subtitle: 'Gastronomia japonesa contemporânea com peixes frescos do litoral, cortes autorais e combos exclusivos em um ambiente intimista.',
            ctaLabel: 'Reservar Mesa & Pedir Online',
            ctaTargetSection: 'services',
          },
          sectionsOrder: ['hero', 'services', 'gallery', 'about', 'differentials', 'contact'],
          sectionsEnabled: {
            hero: true,
            services: true,
            gallery: true,
            about: true,
            differentials: true,
            contact: true,
            campaign: false,
          },
          about: {
            title: 'O Conceito Hush Modern',
            text: 'Inspirado nos mais aclamados bares de sushi de Tóquio e Nova York, o Hush combina cortes tradicionais com toques de azeite trufado, flor de sal e defumação natural.',
          },
          services: [
            {
              id: 'ss-1',
              title: 'Combo Omakase do Chef (24 Peças)',
              description: 'Seleção especial com sashimis de salmão maçaricado, niguiris trufados e uramakis especiais.',
              price: 'R$ 119,00',
            },
            {
              id: 'ss-2',
              title: 'Salmão Trufado com Flor de Sal',
              description: 'Lâminas nobres de salmão fresco, azeite trufado, raspas de limão siciliano e gergelim.',
              price: 'R$ 54,00',
            },
            {
              id: 'ss-3',
              title: 'Hot Roll Especial de Shimeji & Cream Cheese',
              description: 'Enrolado crocante frito na hora com shimeji salteado na manteiga e molho tarê autoral.',
              price: 'R$ 42,00',
            },
          ],
          differentials: [
            'Peixes frescos entregues diariamente com rigoroso controle de temperatura',
            'Receitas exclusivas com ingredientes importados do Japão',
            'Ambiente intimista e contemporâneo ideal para jantares e celebrações',
            'Embalagens térmicas especiais para delivery que preservam textura e crocância',
          ],
          gallery: [
            {
              id: 'gs-1',
              url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
              title: 'Sashimi Nobre em Prato de Pedra',
              alt: 'Sashimi de salmão fresco em louça de ardósia',
            },
            {
              id: 'gs-2',
              url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
              title: 'Combinado Omakase 24 Peças',
              alt: 'Mesa montada com combinado de sushi contemporâneo',
            },
          ],
          contact: {
            kind: 'whatsapp',
            value: '41977778899',
            ctaLabel: 'Reservar Mesa via WhatsApp',
            address: 'Av. Coronel Dulcídio, 800 - Batel, Curitiba - PR',
            customMessage: 'Olá! Gostaria de reservar uma mesa ou pedir um combinado no Hush Sushi.',
          },
          seo: {
            title: 'Hush Modern Restaurant | Sushi Contemporâneo em Curitiba',
            description: 'Experiência gastronômica oriental contemporânea com peixes frescos e combos Omakase.',
          },
        },
      },
    ],
  },
  {
    id: 'page-advocacia',
    clientId: 'client-advocacia',
    title: 'Bastos & Associados Advocacia Estratégica',
    slug: 'bastos-advocacia',
    template: 'advocacia',
    goal: 'Apresentar escritório de advocacia, corpo jurídico, áreas de atuação e agendar consultas jurídicas',
    portalVisibility: 'Disponível',
    currentRevisionId: 'rev-adv-1',
    publishedUrl: 'https://bastosadvocacia.com.br',
    publicationStatus: 'Publicada informada',
    publishedRevisionNumber: 1,
    publishedAt: '2026-11-06T20:00:00Z',
    publishedOperator: 'Admin Principal',
    createdAt: '2026-02-14T12:00:00Z',
    updatedAt: '2026-11-06T20:00:00Z',
    revisions: [
      {
        id: 'rev-adv-1',
        pageId: 'page-advocacia',
        revisionNumber: 1,
        editorialStatus: 'Aprovada',
        approvedAt: '2026-11-06T20:00:00Z',
        approvedBy: 'Admin Principal',
        clientPreviewReleased: true,
        createdAt: '2026-02-14T12:00:00Z',
        config: {
          template: 'advocacia',
          themeStyle: 'dark',
          primaryColor: '#eab308',
          header: {
            title: 'Bastos & Associados Advocacia Estratégica',
            subtitle: 'Soluções jurídicas estratégicas e personalizadas com mais de 15 anos de excelência na defesa de empresas, patrimônios e famílias.',
            ctaLabel: 'Consulta Jurídica Confidencial',
            ctaTargetSection: 'services',
          },
          sectionsOrder: ['hero', 'services', 'differentials', 'about', 'gallery', 'contact'],
          sectionsEnabled: {
            hero: true,
            services: true,
            differentials: true,
            about: true,
            gallery: true,
            contact: true,
            campaign: false,
          },
          about: {
            title: 'Tradição, Combatividade e Ética',
            text: 'Fundado pelo Dr. Marcelo Bastos (OAB/SP 284.192), nosso escritório combina sólida formação acadêmica com postura combativa e visão preventiva de negócios.',
          },
          services: [
            {
              id: 'sa-1',
              title: 'Direito Empresarial & Contratos Comerciais',
              description: 'Blindagem jurídica, elaboração contratual, fusões, aquisições e compliance.',
              price: 'Consultoria Estratégica',
            },
            {
              id: 'sa-2',
              title: 'Direito Civil, Família & Sucessões',
              description: 'Planejamento sucessório, inventários judiciais e extrajudiciais, divórcios e partilha de bens.',
              price: 'Atendimento Dedicado',
            },
            {
              id: 'sa-3',
              title: 'Defesa Trabalhista & Relações de Trabalho',
              description: 'Assessoria preventiva para empresas e defesa contenciosa com alta taxa de êxito.',
              price: 'Honorários sob Consulta',
            },
          ],
          differentials: [
            'Atendimento confidencial e sigiloso conforme o Código de Ética da OAB',
            'Mais de 15 anos de atuação com mais de 2.500 casos de sucesso',
            'Comunicação clara e transparente com relatórios periódicos de andamento',
            'Atuação ágil tanto na esfera preventiva quanto no contencioso estratégico',
          ],
          gallery: [
            {
              id: 'ga-1',
              url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
              title: 'Sede Corporativa Faria Lima',
              alt: 'Edifício corporativo sede do escritório em São Paulo',
            },
            {
              id: 'ga-2',
              url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
              title: 'Sala de Conferências & Reuniões',
              alt: 'Sala de conferências do corpo jurídico',
            },
          ],
          contact: {
            kind: 'whatsapp',
            value: '11988881122',
            ctaLabel: 'Agendar Consulta Confidencial',
            address: 'Av. Brigadeiro Faria Lima, 3477 - 14º andar - Itaim Bibi, São Paulo - SP',
            customMessage: 'Olá Dr. Marcelo, gostaria de agendar uma consulta jurídica confidencial.',
          },
          seo: {
            title: 'Bastos & Associados | Advocacia Estratégica em São Paulo',
            description: 'Escritório de advocacia empresarial, cível e planejamento sucessório na Faria Lima.',
          },
        },
      },
    ],
  },
  {
    id: 'page-beleza',
    clientId: 'client-beleza',
    title: 'Studio Lumina Cabelo & Nail Bar',
    slug: 'studio-lumina',
    template: 'beleza-unhas',
    goal: 'Apresentar procedimentos capilares, alongamento em gel e agendar atendimentos de beleza',
    portalVisibility: 'Disponível',
    currentRevisionId: 'rev-beleza-1',
    publishedUrl: 'https://studiolumina.com.br',
    publicationStatus: 'Publicada informada',
    publishedRevisionNumber: 1,
    publishedAt: '2026-11-06T21:00:00Z',
    publishedOperator: 'Admin Principal',
    createdAt: '2026-02-14T13:00:00Z',
    updatedAt: '2026-11-06T21:00:00Z',
    revisions: [
      {
        id: 'rev-beleza-1',
        pageId: 'page-beleza',
        revisionNumber: 1,
        editorialStatus: 'Aprovada',
        approvedAt: '2026-11-06T21:00:00Z',
        approvedBy: 'Admin Principal',
        clientPreviewReleased: true,
        createdAt: '2026-02-14T13:00:00Z',
        config: {
          template: 'beleza-unhas',
          themeStyle: 'dark',
          primaryColor: '#c6ff00',
          header: {
            title: 'Studio Lumina Cabelo & Nail Bar',
            subtitle: 'Realce sua beleza com especialistas em morena iluminada, visagismo, manicure russa e nail art em gel com atendimento exclusivo.',
            ctaLabel: 'Agendar Horário Online',
            ctaTargetSection: 'services',
          },
          sectionsOrder: ['hero', 'services', 'gallery', 'differentials', 'about', 'contact'],
          sectionsEnabled: {
            hero: true,
            services: true,
            gallery: true,
            differentials: true,
            about: true,
            contact: true,
            campaign: false,
          },
          about: {
            title: 'Seu Refúgio de Beleza em Ipanema',
            text: 'O Studio Lumina nasceu do desejo de unir técnica internacional de coloração e nail design a um atendimento acolhedor, onde cada cliente se sente única.',
          },
          services: [
            {
              id: 'su-1',
              title: 'Alongamento em Fibra de Vidro & Nail Art',
              description: 'Unhas perfeitas com aspecto natural, curvatura C impecável e esmaltação em gel.',
              price: 'R$ 160,00',
            },
            {
              id: 'su-2',
              title: 'Mechas Balayage & Morena Iluminada',
              description: 'Técnica personalizada com preservação da saúde dos fios e tonalização exclusiva.',
              price: 'A partir de R$ 380,00',
            },
            {
              id: 'su-3',
              title: 'Spa dos Pés & Manicure Russa',
              description: 'Esfoliação profunda, cutilagem a seco de alta precisão e hidratação com parafina.',
              price: 'R$ 95,00',
            },
          ],
          differentials: [
            'Esterilização hospitalar de materiais em autoclave com embalagens seladas',
            'Produtos importados de alta durabilidade que não agridem unhas e cabelos',
            'Profissionais com formação internacional e certificação técnica',
            'Pontualidade rigorosa e atendimento com café e espumante cortesia',
          ],
          gallery: [
            {
              id: 'gu-1',
              url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
              title: 'Alongamento em Fibra & Nail Art',
              alt: 'Nail art fina e elegante com esmaltação em gel',
            },
            {
              id: 'gu-2',
              url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
              title: 'Morena Iluminada em Ipanema',
              alt: 'Cabelo longo morena iluminada com brilho',
            },
          ],
          contact: {
            kind: 'whatsapp',
            value: '21999998877',
            ctaLabel: 'Agendar pelo WhatsApp',
            address: 'Rua Visconde de Pirajá, 550 - Loja 12 - Ipanema, Rio de Janeiro - RJ',
            customMessage: 'Olá! Gostaria de agendar um horário para cabelo/unhas no Studio Lumina.',
          },
          seo: {
            title: 'Studio Lumina | Cabelo, Morena Iluminada & Nail Bar em Ipanema',
            description: 'Salão de beleza boutique em Ipanema com especialistas em coloração e nail design.',
          },
        },
      },
    ],
  },
];

// Seed de Convites para o Portal
const SEED_INVITATIONS: Invitation[] = [
  {
    id: 'inv-1',
    clientId: 'client-1',
    email: 'marina@fotografia.com',
    token: 'inv_tok_marina_884920',
    status: 'Ativo',
    createdAt: '2026-02-01T14:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    acceptedAt: '2026-02-01T14:30:00Z',
  },
  {
    id: 'inv-2',
    clientId: 'client-2',
    email: 'carlos@eletro.com',
    token: 'inv_tok_carlos_339102',
    status: 'Ativo',
    createdAt: '2026-02-10T09:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    acceptedAt: '2026-02-10T09:15:00Z',
  },
];

// Seed de Auditoria
const SEED_AUDIT: AuditEvent[] = [
  {
    id: 'aud-1',
    timestamp: '2026-11-07T08:00:00Z',
    actorEmail: 'admin@central.com.br',
    actorRole: 'admin',
    action: 'LOGIN_SUCCESS_MFA',
    resource: 'auth/login',
    details: 'Login administrativo com validação de segundo fator (MFA) concluído.',
    status: 'success',
  },
  {
    id: 'aud-2',
    timestamp: '2026-11-06T15:00:00Z',
    actorEmail: 'admin@central.com.br',
    actorRole: 'admin',
    action: 'REGISTER_PUBLICATION',
    resource: 'landing_pages/page-1',
    details: 'Registro da URL publicada https://marinafotografia.com.br associada à Revisão 2.',
    status: 'success',
  },
  {
    id: 'aud-3',
    timestamp: '2026-11-05T16:05:00Z',
    actorEmail: 'admin@central.com.br',
    actorRole: 'admin',
    action: 'RELEASE_PREVIEW_PORTAL',
    resource: 'landing_pages/page-1/rev-1-2',
    details: 'Revisão 2 liberada para visualização privada no Portal do Cliente.',
    status: 'success',
  },
  {
    id: 'aud-4',
    timestamp: '2026-11-05T16:00:00Z',
    actorEmail: 'admin@central.com.br',
    actorRole: 'admin',
    action: 'APPROVE_REVISION',
    resource: 'landing_pages/page-1/rev-1-2',
    details: 'Revisão 2 aprovada administrativamente para exportação.',
    status: 'success',
  },
];

// Seed de Testes A/B
const SEED_AB_TESTS: ABTest[] = [
  {
    id: 'ab-coffee-1',
    pageId: 'page-coffee',
    pageTitle: 'Landing Page - BODREN Cafeteria Gourmet',
    clientId: 'client-coffee',
    clientName: 'BODREN Coffee & Co.',
    title: 'Headline Sensorial vs Cupom 15% OFF de Boas-Vindas',
    hypothesis: 'Oferecer um cupom de 15% logo no Hero gera urgência e aumenta contatos de WhatsApp em relação à headline puramente sensorial.',
    status: 'running',
    trafficSplitPercent: 50,
    metricTarget: 'whatsapp_leads',
    winnerVariation: 'B',
    statisticalConfidence: 98.4,
    significanceReached: true,
    liftPercent: 39.1,
    startDate: '2026-10-25T10:00:00Z',
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-11-07T09:30:00Z',
    variationA: {
      id: 'A',
      name: 'Variação A (Sensorial Original)',
      description: 'Foco na qualidade artesanal do grão e torra sob demanda',
      headline: 'Descubra o Verdadeiro Sabor do Café Artesanal',
      subtitle: 'Grãos selecionados das melhores regiões produtoras, torrados com precisão para uma xícara perfeita em cada momento.',
      ctaLabel: 'Pedir Café no WhatsApp',
      primaryColor: '#73a59f',
      template: 'food-coffee',
      views: 1420,
      uniqueVisitors: 1110,
      conversions: 182,
      conversionRate: 12.8,
      bounceRate: 34,
      avgTimeOnPage: '2m 14s',
    },
    variationB: {
      id: 'B',
      name: 'Variação B (Cupom de Desconto 15% OFF)',
      description: 'Chamada direta de desconto para novo pedido imediato',
      headline: 'Ganhe 15% OFF no seu Primeiro Café Especial',
      subtitle: 'Grãos premiados moídos na hora. Faça seu pedido agora pelo WhatsApp com 15% de desconto exclusivo de boas-vindas.',
      ctaLabel: 'Garantir Cupom 15% OFF',
      primaryColor: '#e07a5f',
      template: 'food-coffee',
      campaignBadge: '☕ CUPOM 15% OFF HOJE',
      views: 1390,
      uniqueVisitors: 1095,
      conversions: 248,
      conversionRate: 17.8,
      bounceRate: 25,
      avgTimeOnPage: '2m 51s',
    },
    dailyMetrics: [
      { date: '2026-11-01', displayDate: '01/11', viewsA: 195, convA: 24, rateA: 12.3, viewsB: 190, convB: 33, rateB: 17.4 },
      { date: '2026-11-02', displayDate: '02/11', viewsA: 210, convA: 28, rateA: 13.3, viewsB: 205, convB: 38, rateB: 18.5 },
      { date: '2026-11-03', displayDate: '03/11', viewsA: 185, convA: 22, rateA: 11.9, viewsB: 188, convB: 32, rateB: 17.0 },
      { date: '2026-11-04', displayDate: '04/11', viewsA: 225, convA: 30, rateA: 13.3, viewsB: 218, convB: 40, rateB: 18.3 },
      { date: '2026-11-05', displayDate: '05/11', viewsA: 200, convA: 25, rateA: 12.5, viewsB: 195, convB: 35, rateB: 17.9 },
      { date: '2026-11-06', displayDate: '06/11', viewsA: 190, convA: 24, rateA: 12.6, viewsB: 185, convB: 34, rateB: 18.4 },
      { date: '2026-11-07', displayDate: 'Hoje', viewsA: 215, convA: 29, rateA: 13.5, viewsB: 209, convB: 36, rateB: 17.2 },
    ],
  },
  {
    id: 'ab-sushi-1',
    pageId: 'page-sushi',
    pageTitle: 'Landing Page Oficial - Hush Sushi & Co.',
    clientId: 'client-sushi',
    clientName: 'Hush Sushi & Co.',
    title: 'CTA Hero: "Reservar Mesa VIP" vs "Pedir Combinado no Delivery"',
    hypothesis: 'Como a maioria dos acessos é via mobile à noite, a chamada para Delivery imediato converte melhor que reserva presencial.',
    status: 'running',
    trafficSplitPercent: 50,
    metricTarget: 'whatsapp_leads',
    winnerVariation: 'B',
    statisticalConfidence: 96.8,
    significanceReached: true,
    liftPercent: 44.5,
    startDate: '2026-10-28T14:00:00Z',
    createdAt: '2026-10-28T14:00:00Z',
    updatedAt: '2026-11-07T08:15:00Z',
    variationA: {
      id: 'A',
      name: 'Variação A (Reserva Presencial)',
      description: 'Foco na experiência de salão e alta gastronomia',
      headline: 'Gastronomia Japonesa Contemporânea de Alto Padrão',
      subtitle: 'Ingredientes nobres, cortes de precisão e uma atmosfera exclusiva para jantares inesquecíveis.',
      ctaLabel: 'Reservar Mesa VIP',
      primaryColor: '#ff5722',
      template: 'food-restaurant',
      views: 940,
      uniqueVisitors: 780,
      conversions: 103,
      conversionRate: 11.0,
      bounceRate: 36,
      avgTimeOnPage: '1m 58s',
    },
    variationB: {
      id: 'B',
      name: 'Variação B (Delivery Rápido WhatsApp)',
      description: 'Foco na entrega em 35 minutos com embalagem térmica',
      headline: 'O Melhor Sushi Contemporâneo na sua Mesa em 35min',
      subtitle: 'Combinados autorais preparados na hora pelo nosso chef. Peça com agilidade e receba com frescor máximo.',
      ctaLabel: 'Pedir Delivery no WhatsApp',
      primaryColor: '#ff7849',
      template: 'food-restaurant',
      campaignBadge: '⚡ Entrega Expresso',
      views: 935,
      uniqueVisitors: 775,
      conversions: 149,
      conversionRate: 15.9,
      bounceRate: 28,
      avgTimeOnPage: '2m 24s',
    },
    dailyMetrics: [
      { date: '2026-11-01', displayDate: '01/11', viewsA: 130, convA: 14, rateA: 10.7, viewsB: 128, convB: 20, rateB: 15.6 },
      { date: '2026-11-02', displayDate: '02/11', viewsA: 145, convA: 16, rateA: 11.0, viewsB: 140, convB: 23, rateB: 16.4 },
      { date: '2026-11-03', displayDate: '03/11', viewsA: 120, convA: 13, rateA: 10.8, viewsB: 122, convB: 19, rateB: 15.5 },
      { date: '2026-11-04', displayDate: '04/11', viewsA: 150, convA: 17, rateA: 11.3, viewsB: 148, convB: 24, rateB: 16.2 },
      { date: '2026-11-05', displayDate: '05/11', viewsA: 135, convA: 14, rateA: 10.4, viewsB: 138, convB: 21, rateB: 15.2 },
      { date: '2026-11-06', displayDate: '06/11', viewsA: 132, convA: 15, rateA: 11.3, viewsB: 130, convB: 21, rateB: 16.1 },
      { date: '2026-11-07', displayDate: 'Hoje', viewsA: 128, convA: 14, rateA: 10.9, viewsB: 129, convB: 21, rateB: 16.3 },
    ],
  },
  {
    id: 'ab-adv-1',
    pageId: 'page-advocacia',
    pageTitle: 'Landing Page - Dr. Marcelo Bastos Advocacia',
    clientId: 'client-advocacia',
    clientName: 'Bastos & Associados Advocacia',
    title: 'Institucional Tradicional vs Diagnóstico Jurídico Preventivo Grátis',
    hypothesis: 'Oferecer um diagnóstico inicial preventivo online gera mais confiança inicial e reduz fricção do primeiro contato.',
    status: 'concluded',
    trafficSplitPercent: 50,
    metricTarget: 'whatsapp_leads',
    winnerVariation: 'B',
    statisticalConfidence: 99.4,
    significanceReached: true,
    liftPercent: 61.3,
    startDate: '2026-10-10T09:00:00Z',
    endDate: '2026-11-02T18:00:00Z',
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-11-02T18:00:00Z',
    variationA: {
      id: 'A',
      name: 'Variação A (Institucional Sério)',
      description: 'Foco na tradição do escritório e 15 anos de história',
      headline: 'Defesa Jurídica Estratégica e Soluções Corporativas',
      subtitle: 'Atuação de excelência com 15 anos de histórico em Direito Empresarial, Tributário e Cível.',
      ctaLabel: 'Consultar Nossos Advogados',
      primaryColor: '#eab308',
      template: 'advocacia',
      views: 1120,
      uniqueVisitors: 940,
      conversions: 104,
      conversionRate: 9.3,
      bounceRate: 41,
      avgTimeOnPage: '1m 45s',
    },
    variationB: {
      id: 'B',
      name: 'Variação B (Diagnóstico Preventivo sem Custo)',
      description: 'Proposta de valor clara com análise de risco prévia',
      headline: 'Proteja sua Empresa com Diagnóstico Jurídico Ágil',
      subtitle: 'Identifique riscos contratuais e passivos tributários antes que virem problemas. Fale com um sócio sênior.',
      ctaLabel: 'Solicitar Diagnóstico no WhatsApp',
      primaryColor: '#f59e0b',
      template: 'advocacia',
      campaignBadge: '🛡️ Diagnóstico Preventivo Grátis',
      views: 1150,
      uniqueVisitors: 960,
      conversions: 173,
      conversionRate: 15.0,
      bounceRate: 29,
      avgTimeOnPage: '2m 38s',
    },
    dailyMetrics: [
      { date: '2026-10-26', displayDate: '26/10', viewsA: 155, convA: 14, rateA: 9.0, viewsB: 160, convB: 24, rateB: 15.0 },
      { date: '2026-10-27', displayDate: '27/10', viewsA: 162, convA: 15, rateA: 9.2, viewsB: 165, convB: 25, rateB: 15.1 },
      { date: '2026-10-28', displayDate: '28/10', viewsA: 158, convA: 15, rateA: 9.5, viewsB: 162, convB: 24, rateB: 14.8 },
      { date: '2026-10-29', displayDate: '29/10', viewsA: 160, convA: 15, rateA: 9.4, viewsB: 164, convB: 25, rateB: 15.2 },
      { date: '2026-10-30', displayDate: '30/10', viewsA: 154, convA: 14, rateA: 9.1, viewsB: 158, convB: 24, rateB: 15.2 },
      { date: '2026-10-31', displayDate: '31/10', viewsA: 166, convA: 16, rateA: 9.6, viewsB: 170, convB: 26, rateB: 15.3 },
      { date: '2026-11-01', displayDate: '01/11', viewsA: 165, convA: 15, rateA: 9.1, viewsB: 171, convB: 25, rateB: 14.6 },
    ],
  },
];

export class AppRepository {
  /**
   * Inicializa o banco criptografado se ainda não tiver sido instanciado
   */
  static async init(): Promise<void> {
    const isInit = await SecureStorage.getItem<boolean>(STORAGE_KEYS.INITIALIZED, false);
    if (!isInit) {
      await SecureStorage.setItem(STORAGE_KEYS.USERS, SEED_USERS);
      await SecureStorage.setItem(STORAGE_KEYS.CLIENTS, SEED_CLIENTS);
      await SecureStorage.setItem(STORAGE_KEYS.PAGES, SEED_PAGES);
      await SecureStorage.setItem(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      await SecureStorage.setItem(STORAGE_KEYS.AUDIT, SEED_AUDIT);
      await SecureStorage.setItem(STORAGE_KEYS.AB_TESTS, SEED_AB_TESTS);
      await SecureStorage.setItem(STORAGE_KEYS.INITIALIZED, true);
    }
  }

  // Clientes
  static async getClients(): Promise<Client[]> {
    await this.init();
    return SecureStorage.getItem<Client[]>(STORAGE_KEYS.CLIENTS, []);
  }

  static async getClientById(id: string): Promise<Client | undefined> {
    const clients = await this.getClients();
    return clients.find(c => c.id === id);
  }

  static async saveClient(client: Client): Promise<void> {
    const clients = await this.getClients();
    const idx = clients.findIndex(c => c.id === client.id);
    if (idx >= 0) {
      clients[idx] = { ...client, updatedAt: new Date().toISOString() };
    } else {
      clients.unshift({
        ...client,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await SecureStorage.setItem(STORAGE_KEYS.CLIENTS, clients);
  }

  static async updateClientStatus(id: string, status: Client['status']): Promise<void> {
    const clients = await this.getClients();
    const client = clients.find(c => c.id === id);
    if (client) {
      client.status = status;
      client.updatedAt = new Date().toISOString();
      await SecureStorage.setItem(STORAGE_KEYS.CLIENTS, clients);
    }
  }

  // Landing Pages
  static async getPages(): Promise<LandingPage[]> {
    await this.init();
    return SecureStorage.getItem<LandingPage[]>(STORAGE_KEYS.PAGES, []);
  }

  static async getPageById(id: string): Promise<LandingPage | undefined> {
    const pages = await this.getPages();
    return pages.find(p => p.id === id);
  }

  static async getPagesByClientId(clientId: string): Promise<LandingPage[]> {
    const pages = await this.getPages();
    return pages.filter(p => p.clientId === clientId);
  }

  static async savePage(page: LandingPage): Promise<void> {
    const pages = await this.getPages();
    const idx = pages.findIndex(p => p.id === page.id);
    if (idx >= 0) {
      pages[idx] = { ...page, updatedAt: new Date().toISOString() };
    } else {
      pages.unshift({
        ...page,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await SecureStorage.setItem(STORAGE_KEYS.PAGES, pages);
  }

  // Usuários & Autenticação
  static async getUsers(): Promise<User[]> {
    await this.init();
    return SecureStorage.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    await SecureStorage.setItem(STORAGE_KEYS.USERS, users);
  }

  // Convites para o Portal
  static async getInvitations(): Promise<Invitation[]> {
    await this.init();
    return SecureStorage.getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, []);
  }

  static async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const invitations = await this.getInvitations();
    return invitations.find(inv => inv.token === token);
  }

  static async saveInvitation(invitation: Invitation): Promise<void> {
    const invitations = await this.getInvitations();
    const idx = invitations.findIndex(i => i.id === invitation.id);
    if (idx >= 0) {
      invitations[idx] = invitation;
    } else {
      invitations.unshift(invitation);
    }
    await SecureStorage.setItem(STORAGE_KEYS.INVITATIONS, invitations);
  }

  // Auditoria de Segurança
  static async getAuditLogs(): Promise<AuditEvent[]> {
    await this.init();
    return SecureStorage.getItem<AuditEvent[]>(STORAGE_KEYS.AUDIT, []);
  }

  static async recordAuditEvent(
    event: Omit<AuditEvent, 'id' | 'timestamp'>
  ): Promise<void> {
    const logs = await this.getAuditLogs();
    const newLog: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Limite dos últimos 200 logs
    await SecureStorage.setItem(STORAGE_KEYS.AUDIT, logs.slice(0, 200));
  }

  // ==========================================
  // Testes A/B das Landing Pages
  // ==========================================
  static async getABTests(): Promise<ABTest[]> {
    await this.init();
    return SecureStorage.getItem<ABTest[]>(STORAGE_KEYS.AB_TESTS, []);
  }

  static async getABTestById(id: string): Promise<ABTest | undefined> {
    const tests = await this.getABTests();
    return tests.find(t => t.id === id);
  }

  static async getABTestsByPageId(pageId: string): Promise<ABTest[]> {
    const tests = await this.getABTests();
    return tests.filter(t => t.pageId === pageId);
  }

  static async saveABTest(test: ABTest): Promise<void> {
    const tests = await this.getABTests();
    const idx = tests.findIndex(t => t.id === test.id);
    if (idx >= 0) {
      tests[idx] = { ...test, updatedAt: new Date().toISOString() };
    } else {
      tests.unshift({
        ...test,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await SecureStorage.setItem(STORAGE_KEYS.AB_TESTS, tests);
  }

  static async deleteABTest(id: string): Promise<void> {
    const tests = await this.getABTests();
    const filtered = tests.filter(t => t.id !== id);
    await SecureStorage.setItem(STORAGE_KEYS.AB_TESTS, filtered);
  }

  static async concludeABTest(
    id: string,
    winner: 'A' | 'B',
    applyToPage: boolean = true
  ): Promise<{ test: ABTest; updatedPage?: LandingPage }> {
    const tests = await this.getABTests();
    const test = tests.find(t => t.id === id);
    if (!test) throw new Error('Teste A/B não encontrado');

    test.status = 'concluded';
    test.winnerVariation = winner;
    test.endDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();
    await SecureStorage.setItem(STORAGE_KEYS.AB_TESTS, tests);

    let updatedPage: LandingPage | undefined;

    if (applyToPage) {
      const page = await this.getPageById(test.pageId);
      if (page) {
        const rev = page.revisions.find(r => r.id === page.currentRevisionId);
        if (rev) {
          const winnerVar = winner === 'A' ? test.variationA : test.variationB;
          rev.config.header.title = winnerVar.headline;
          rev.config.header.subtitle = winnerVar.subtitle;
          rev.config.header.ctaLabel = winnerVar.ctaLabel;
          if (winnerVar.primaryColor) {
            rev.config.primaryColor = winnerVar.primaryColor;
          }
          if (winnerVar.template) {
            rev.config.template = winnerVar.template;
            page.template = winnerVar.template;
          }
          if (winnerVar.campaignBadge && rev.config.campaignOffer) {
            rev.config.campaignOffer.badge = winnerVar.campaignBadge;
          }
          await this.savePage(page);
          updatedPage = page;
        }
      }
    }

    await this.recordAuditEvent({
      actorEmail: 'admin@central.com.br',
      actorRole: 'admin',
      action: 'CONCLUDE_AB_TEST',
      resource: `ab_tests/${id}`,
      details: `Teste A/B "${test.title}" concluído. Vencedora declarada: Variação ${winner}.${applyToPage ? ' Aplicada à página oficial com sucesso.' : ''}`,
      status: 'success',
    });

    return { test, updatedPage };
  }

  static async simulateABTestTraffic(id: string): Promise<ABTest> {
    const tests = await this.getABTests();
    const test = tests.find(t => t.id === id);
    if (!test) throw new Error('Teste A/B não encontrado');

    const split = test.trafficSplitPercent / 100;
    const viewsA = Math.round(20 * split);
    const viewsB = 20 - viewsA;

    const isBBetter = test.liftPercent >= 0;
    const convA = Math.random() < 0.35 ? 1 : (Math.random() < 0.15 ? 2 : 0);
    const convB = isBBetter ? (Math.random() < 0.55 ? 2 : (Math.random() < 0.25 ? 3 : 1)) : (Math.random() < 0.3 ? 1 : 0);

    test.variationA.views += viewsA;
    test.variationA.uniqueVisitors += Math.round(viewsA * 0.82);
    test.variationA.conversions += convA;
    test.variationA.conversionRate = Number(
      ((test.variationA.conversions / Math.max(1, test.variationA.views)) * 100).toFixed(1)
    );

    test.variationB.views += viewsB;
    test.variationB.uniqueVisitors += Math.round(viewsB * 0.82);
    test.variationB.conversions += convB;
    test.variationB.conversionRate = Number(
      ((test.variationB.conversions / Math.max(1, test.variationB.views)) * 100).toFixed(1)
    );

    const baseRate = test.variationA.conversionRate;
    const testRate = test.variationB.conversionRate;
    test.liftPercent = baseRate > 0 ? Number((((testRate - baseRate) / baseRate) * 100).toFixed(1)) : 0;

    const p1 = test.variationA.conversions / Math.max(1, test.variationA.views);
    const p2 = test.variationB.conversions / Math.max(1, test.variationB.views);
    const n1 = test.variationA.views;
    const n2 = test.variationB.views;
    const pPool = (test.variationA.conversions + test.variationB.conversions) / (n1 + n2);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
    const z = se > 0 ? Math.abs((p2 - p1) / se) : 0;
    const confidence = Math.min(99.9, Number((Math.max(50, 100 * (1 - Math.exp(-0.717 * z - 0.416 * z * z)))).toFixed(1)));
    test.statisticalConfidence = confidence;
    test.significanceReached = confidence >= 95;
    test.winnerVariation = test.liftPercent > 5 ? 'B' : test.liftPercent < -5 ? 'A' : 'none';
    test.updatedAt = new Date().toISOString();

    if (test.dailyMetrics && test.dailyMetrics.length > 0) {
      const today = test.dailyMetrics[test.dailyMetrics.length - 1];
      today.viewsA += viewsA;
      today.convA += convA;
      today.rateA = Number(((today.convA / Math.max(1, today.viewsA)) * 100).toFixed(1));
      today.viewsB += viewsB;
      today.convB += convB;
      today.rateB = Number(((today.convB / Math.max(1, today.viewsB)) * 100).toFixed(1));
    }

    await SecureStorage.setItem(STORAGE_KEYS.AB_TESTS, tests);
    return test;
  }

  // Reset para demonstração
  static async resetToDefaultSeed(): Promise<void> {
    await SecureStorage.setItem(STORAGE_KEYS.USERS, SEED_USERS);
    await SecureStorage.setItem(STORAGE_KEYS.CLIENTS, SEED_CLIENTS);
    await SecureStorage.setItem(STORAGE_KEYS.PAGES, SEED_PAGES);
    await SecureStorage.setItem(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
    await SecureStorage.setItem(STORAGE_KEYS.AUDIT, SEED_AUDIT);
    await SecureStorage.setItem(STORAGE_KEYS.AB_TESTS, SEED_AB_TESTS);
    await SecureStorage.setItem(STORAGE_KEYS.INITIALIZED, true);
  }
}
