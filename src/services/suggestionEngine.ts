/**
 * Motor de Sugestão de Landing Pages baseado em Regras e Modelos
 * Especificação Técnica - Seção 5
 * Suporta Modelos: Portfólio, Serviços, Profissional, Campanha,
 * Cafeteria Gourmet (BODREN), Restaurante & Sushi (Hush),
 * Advocacia & Jurídico (Creative Law), Cabeleireiro & Nail Bar (Studio Glow).
 */

import { Client, TemplateType, PageConfig, SuggestionResult } from '../types';

export function runSuggestionEngine(client: Client, userGoal?: string): SuggestionResult {
  const profile = client.publicProfile;
  const portfolioPhotos = profile.media.filter(m => m.kind === 'portfolio' && m.authorized);
  const servicesCount = profile.services.length;
  const missingItems: string[] = [];

  // Verificação de pendências essenciais
  if (!profile.publicName || profile.publicName.trim() === '') {
    missingItems.push('Nome público para divulgação não informado');
  }
  if (!profile.activity || profile.activity.trim() === '') {
    missingItems.push('Atividade ou profissão principal não informada');
  }
  if (!profile.summary || profile.summary.trim() === '') {
    missingItems.push('Apresentação breve de divulgação ausente');
  }
  if (!profile.mainCommercialChannel || !profile.mainCommercialChannel.value) {
    missingItems.push('Canal comercial principal (WhatsApp/Telefone) não configurado');
  }

  // Inferência do Modelo com base nas regras de negócio e palavras-chave
  let template: TemplateType = 'professional';
  let recommendedCta = 'Entrar em contato';
  let justification = '';
  let defaultTheme: 'light' | 'dark' | 'neutral' = profile.visualIdentity.themeStyle || 'light';
  let defaultColor: string = profile.visualIdentity.primaryColor || '#2447C6';

  const goalLower = (userGoal || '').toLowerCase();
  const activityLower = (profile.activity || '').toLowerCase();
  const tagsLower = client.tags.map(t => t.toLowerCase()).join(' ');
  const combinedContext = `${goalLower} ${activityLower} ${tagsLower}`;

  // 1. Modelo Cafeteria Gourmet (BODREN Style - Imagem 1)
  if (
    combinedContext.includes('café') ||
    combinedContext.includes('cafe') ||
    combinedContext.includes('cafeteria') ||
    combinedContext.includes('coffee') ||
    combinedContext.includes('barista') ||
    combinedContext.includes('confeitaria') ||
    combinedContext.includes('doces') ||
    combinedContext.includes('padaria artesanal')
  ) {
    template = 'food-coffee';
    recommendedCta = 'Ver Cardápio & Fazer Pedido';
    justification =
      'Modelo Cafeteria Gourmet (Inspirado no padrão BODREN): paleta acolhedora em tons de espresso e café torrado, destaque para grãos especiais selecionados, cardápio de bebidas com ratings de clientes, 4 pilares numerados de qualidade artesanal e canal direto para pedidos e delivery via WhatsApp.';
    defaultTheme = 'dark';
    defaultColor = '#5ea39d'; // Sage mint accent da imagem 1
  }
  // 2. Modelo Restaurante & Sushi Contemporâneo (Hush Modern Style - Imagem 2)
  else if (
    combinedContext.includes('sushi') ||
    combinedContext.includes('japonês') ||
    combinedContext.includes('japones') ||
    combinedContext.includes('restaurante') ||
    combinedContext.includes('gastronomia') ||
    combinedContext.includes('culinária') ||
    combinedContext.includes('culinaria') ||
    combinedContext.includes('pizzaria') ||
    combinedContext.includes('bistrô') ||
    combinedContext.includes('bistro')
  ) {
    template = 'food-restaurant';
    recommendedCta = 'Reservar Mesa & Pedir Online';
    justification =
      'Modelo Restaurante & Gastronomia Oriental (Inspirado no padrão Hush Modern): contraste sofisticado entre ardósia escura e seções brancas limpas, apresentação de pratos autorais em louças de pedra, combos exclusivos de sushis e pratos quentes, destaque para o Chef Sushiman e reserva rápida de mesas.';
    defaultTheme = 'dark';
    defaultColor = '#ff5722'; // Coral salmão da imagem 2
  }
  // 3. Modelo Advocacia & Consultoria Jurídica (Creative Law Style - Imagem 3)
  else if (
    combinedContext.includes('advogad') ||
    combinedContext.includes('advocacia') ||
    combinedContext.includes('jurídic') ||
    combinedContext.includes('juridic') ||
    combinedContext.includes('direito') ||
    combinedContext.includes('oab') ||
    combinedContext.includes('processo') ||
    combinedContext.includes('tributár') ||
    combinedContext.includes('trabalhist') ||
    combinedContext.includes('cível') ||
    combinedContext.includes('civel')
  ) {
    template = 'advocacia';
    recommendedCta = 'Agendar Consulta Confidencial';
    justification =
      'Modelo Advocacia & Consultoria Jurídica (Inspirado no padrão Creative Law): design imponente em preto e dourado de alta credibilidade corporativa, barra de indicadores de confiança (anos de experiência, causas ganhas, clientes atendidos), cartões estruturados de áreas de atuação, perfil dos sócios e garantia expressa de sigilo OAB.';
    defaultTheme = 'dark';
    defaultColor = '#eab308'; // Ouro / Âmbar da imagem 3
  }
  // 4. Modelo Cabeleireiros, Salão de Beleza & Nail Bar (Studio Glow - Imagem 4)
  else if (
    combinedContext.includes('cabelo') ||
    combinedContext.includes('cabeleireir') ||
    combinedContext.includes('unha') ||
    combinedContext.includes('nail') ||
    combinedContext.includes('esmalte') ||
    combinedContext.includes('manicure') ||
    combinedContext.includes('beleza') ||
    combinedContext.includes('estética') ||
    combinedContext.includes('estetica') ||
    combinedContext.includes('salão') ||
    combinedContext.includes('salao') ||
    combinedContext.includes('spa') ||
    combinedContext.includes('maquiagem')
  ) {
    template = 'beleza-unhas';
    recommendedCta = 'Agendar Cabelo & Unhas';
    justification =
      'Modelo Salão de Beleza, Cabeleireiros & Nail Bar (Inspirado no padrão Studio Glow): visual dark fashion com realces vibrantes, tabela categorizada com preços para serviços capilares e nail art/alongamento em fibra, galeria de transformações antes & depois e botão de agendamento online.';
    defaultTheme = 'dark';
    defaultColor = '#c6ff00'; // Lime neon vibrante da imagem 4
  }
  // 5. Modelos Clássicos
  else if (
    goalLower.includes('portfólio') ||
    goalLower.includes('portfolio') ||
    goalLower.includes('foto') ||
    goalLower.includes('visual')
  ) {
    template = 'portfolio';
    recommendedCta = portfolioPhotos.length > 0 ? 'Ver Trabalhos & Orçamento' : 'Solicitar Orçamento';
    justification = `Detectamos objetivo focado em demonstração visual com ${portfolioPhotos.length} fotos autorizadas. O modelo Portfólio prioriza a galeria e impacto visual logo após a introdução.`;
  } else if (
    goalLower.includes('orçamento') ||
    goalLower.includes('orcamento') ||
    goalLower.includes('serviço') ||
    goalLower.includes('servico') ||
    servicesCount >= 3
  ) {
    template = 'services';
    recommendedCta = 'Solicitar Orçamento';
    justification = `Detectamos catálogo com ${servicesCount} serviços cadastrados. O modelo Serviços organiza as opções em cartões claros com chamada direta para orçamento.`;
  } else if (
    goalLower.includes('campanha') ||
    goalLower.includes('promoção') ||
    goalLower.includes('promocao') ||
    goalLower.includes('oferta')
  ) {
    template = 'campaign';
    recommendedCta = 'Garantir Oferta Agora';
    justification =
      'Modelo Campanha recomendado com destaque total para a oferta especial, benefícios imediatos e CTA urgente.';
  } else {
    if (portfolioPhotos.length >= 3) {
      template = 'portfolio';
      recommendedCta = 'Conhecer Portfólio';
      justification = `Identificamos ${portfolioPhotos.length} fotos no portfólio. Recomendamos o modelo Portfólio para destacar suas criações visuais.`;
    } else if (servicesCount > 0) {
      template = 'services';
      recommendedCta = 'Solicitar Orçamento';
      justification = `Identificamos ${servicesCount} serviços estruturados. Recomendamos o modelo Serviços com cartões explicativos.`;
    } else {
      template = 'professional';
      recommendedCta = 'Falar com Especialista';
      justification =
        'Recomendamos o modelo Profissional para apresentar trajetória, credenciais, autoridade e contato direto.';
    }
  }

  // Definição da ordem de seções por modelo
  let sectionsOrder: string[] = [];
  const sectionsEnabled: Record<string, boolean> = {
    hero: true,
    about: true,
    services: true,
    differentials: true,
    gallery: true,
    contact: true,
    campaign: template === 'campaign' || template === 'food-coffee',
  };

  switch (template) {
    case 'food-coffee':
      sectionsOrder = ['hero', 'services', 'differentials', 'gallery', 'campaign', 'about', 'contact'];
      break;
    case 'food-restaurant':
      sectionsOrder = ['hero', 'services', 'gallery', 'about', 'differentials', 'contact'];
      break;
    case 'advocacia':
      sectionsOrder = ['hero', 'services', 'differentials', 'about', 'gallery', 'contact'];
      break;
    case 'beleza-unhas':
      sectionsOrder = ['hero', 'services', 'gallery', 'differentials', 'about', 'contact'];
      break;
    case 'portfolio':
      sectionsOrder = ['hero', 'gallery', 'about', 'services', 'differentials', 'contact'];
      break;
    case 'services':
      sectionsOrder = ['hero', 'services', 'differentials', 'about', 'gallery', 'contact'];
      break;
    case 'campaign':
      sectionsOrder = ['hero', 'campaign', 'differentials', 'about', 'contact'];
      sectionsEnabled.campaign = true;
      break;
    case 'professional':
    default:
      sectionsOrder = ['hero', 'about', 'services', 'differentials', 'gallery', 'contact'];
      break;
  }

  // Serviços padrão adaptados se o perfil estiver vazio
  const defaultServices =
    profile.services.length > 0
      ? profile.services.map(s => ({
          id: s.id,
          title: s.name,
          description: s.description,
          price: s.price,
        }))
      : template === 'food-coffee'
      ? [
          {
            id: 'srv-c1',
            title: 'Cappuccino Italiano Cremoso',
            description: 'Espresso duplo, leite vaporizado com textura aveludada e toque de cacau 70%.',
            price: 'R$ 14,00 (4.9 ★)',
          },
          {
            id: 'srv-c2',
            title: 'Latte Especial com Caramelo Salgado',
            description: '30% espresso selecionado, leite fresco e calda artesanal de caramelo.',
            price: 'R$ 16,00 (5.0 ★)',
          },
          {
            id: 'srv-c3',
            title: 'Mocha Belga Artesanal',
            description: 'Chocolate belga fundido, espresso intenso e finalização em chantilly fresco.',
            price: 'R$ 18,00 (4.8 ★)',
          },
        ]
      : template === 'food-restaurant'
      ? [
          {
            id: 'srv-s1',
            title: 'Combo Omakase do Chef (24 Peças)',
            description: 'Seleção especial com sashimis de salmão maçaricado, niguiris trufados e uramakis especiais.',
            price: 'R$ 119,00',
          },
          {
            id: 'srv-s2',
            title: 'Salmão Trufado com Flor de Sal',
            description: 'Lâminas nobres de salmão fresco, azeite trufado, raspas de limão siciliano e gergelim.',
            price: 'R$ 54,00',
          },
          {
            id: 'srv-s3',
            title: 'Hot Roll Especial de Shimeji & Cream Cheese',
            description: 'Enrolado crocante frito na hora com shimeji salteado na manteiga e molho tarê autoral.',
            price: 'R$ 42,00',
          },
        ]
      : template === 'advocacia'
      ? [
          {
            id: 'srv-a1',
            title: 'Direito Empresarial & Contratos Comerciais',
            description: 'Blindagem jurídica, elaboração contratual, fusões, aquisições e compliance.',
            price: 'Consultoria Estratégica',
          },
          {
            id: 'srv-a2',
            title: 'Direito Civil, Família & Sucessões',
            description: 'Planejamento sucessório, inventários judiciais e extrajudiciais, divórcios e partilha de bens.',
            price: 'Atendimento Dedicado',
          },
          {
            id: 'srv-a3',
            title: 'Defesa Trabalhista & Relações de Trabalho',
            description: 'Assessoria preventiva para empresas e defesa contenciosa com alta taxa de êxito.',
            price: 'Honorários sob Consulta',
          },
        ]
      : template === 'beleza-unhas'
      ? [
          {
            id: 'srv-u1',
            title: 'Alongamento em Fibra de Vidro & Nail Art',
            description: 'Unhas perfeitas com aspecto natural, curvatura C impecável e esmaltação em gel.',
            price: 'R$ 160,00',
          },
          {
            id: 'srv-u2',
            title: 'Mechas Balayage & Morena Iluminada',
            description: 'Técnica personalizada com preservação da saúde dos fios e tonalização exclusiva.',
            price: 'A partir de R$ 380,00',
          },
          {
            id: 'srv-u3',
            title: 'Spa dos Pés & Manicure Russa',
            description: 'Esfoliação profunda, cutilagem a seco de alta precisão e hidratação com parafina.',
            price: 'R$ 95,00',
          },
        ]
      : [
          {
            id: 'srv-default-1',
            title: 'Atendimento Especializado',
            description: 'Serviço sob medida executado com alto padrão técnico e materiais de primeira linha.',
            price: 'Sob Consulta',
          },
        ];

  // Diferenciais padrão adaptados
  const defaultDifferentials =
    profile.differentials.length > 0
      ? profile.differentials
      : template === 'food-coffee'
      ? [
          'Grãos 100% Arábica selecionados de produtores artesanais premiados',
          'Torra fresca semanal para preservar aromas e acidez equilibrada',
          'Ambiente acolhedor com Wi-Fi veloz e tomadas para trabalho',
          'Baristas certificados e apaixonados pela arte do café',
        ]
      : template === 'food-restaurant'
      ? [
          'Peixes frescos entregues diariamente com rigoroso controle de temperatura',
          'Receitas exclusivas com ingredientes importados do Japão',
          'Ambiente intimista e contemporâneo ideal para jantares e celebrações',
          'Embalagens térmicas especiais para delivery que preservam textura e crocância',
        ]
      : template === 'advocacia'
      ? [
          'Atendimento confidencial e sigiloso conforme o Código de Ética da OAB',
          'Mais de 15 anos de atuação com mais de 2.500 casos de sucesso',
          'Comunicação clara e transparente com relatórios periódicos de andamento',
          'Atuação ágil tanto na esfera preventiva quanto no contencioso estratégico',
        ]
      : template === 'beleza-unhas'
      ? [
          'Esterilização hospitalar de materiais em autoclave com embalagens seladas',
          'Produtos importados de alta durabilidade que não agridem unhas e cabelos',
          'Profissionais com formação internacional e certificação técnica',
          'Pontualidade rigorosa e atendimento com café e espumante cortesia',
        ]
      : [
          'Atendimento personalizado e humanizado',
          'Pontualidade e compromisso com resultados',
          'Transparência em todas as etapas',
        ];

  // Galeria de demonstração
  const defaultGallery =
    portfolioPhotos.length > 0
      ? portfolioPhotos.map(p => ({
          id: p.id,
          url: p.url,
          title: p.title || profile.publicName,
          alt: p.alt || profile.activity,
        }))
      : template === 'food-coffee'
      ? [
          {
            id: 'gal-c1',
            url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
            title: 'Grãos Nobres Selecionados',
            alt: 'Grãos de café torrados artesanais',
          },
          {
            id: 'gal-c2',
            url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
            title: 'Latte Art Perfeito',
            alt: 'Xícara de cappuccino com latte art',
          },
          {
            id: 'gal-c3',
            url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
            title: 'Ambiente Confortável',
            alt: 'Espaço interno da cafeteria',
          },
        ]
      : template === 'food-restaurant'
      ? [
          {
            id: 'gal-s1',
            url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
            title: 'Sashimi Nobre em Prato de Pedra',
            alt: 'Sashimis frescos montados artisticamente',
          },
          {
            id: 'gal-s2',
            url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
            title: 'Combinado Especial Omakase',
            alt: 'Mesa com combinados de sushi premium',
          },
          {
            id: 'gal-s3',
            url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
            title: 'Preparo com Precisão Oriental',
            alt: 'Chef manuseando faca japonesa de sushi',
          },
        ]
      : template === 'advocacia'
      ? [
          {
            id: 'gal-a1',
            url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            title: 'Sede Corporativa & Salas de Reunião',
            alt: 'Fachada corporativa moderna do escritório',
          },
          {
            id: 'gal-a2',
            url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
            title: 'Reuniões Estratégicas com Clientes',
            alt: 'Equipe jurídica em conferência de casos',
          },
          {
            id: 'gal-a3',
            url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
            title: 'Acervo Jurídico & Biblioteca',
            alt: 'Biblioteca jurídica tradicional e consultoria',
          },
        ]
      : template === 'beleza-unhas'
      ? [
          {
            id: 'gal-u1',
            url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
            title: 'Nail Art & Esmaltação em Gel',
            alt: 'Unhas com design contemporâneo e acabamento perfeito',
          },
          {
            id: 'gal-u2',
            url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
            title: 'Morena Iluminada & Balayage',
            alt: 'Cabelo longo com mechas iluminadas e brilho',
          },
          {
            id: 'gal-u3',
            url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
            title: 'Espaço & Bancada de Atendimento',
            alt: 'Salão moderno e iluminado com poltronas confortáveis',
          },
        ]
      : [];

  // Construção determinística da PageConfig inicial
  const initialConfig: PageConfig = {
    template,
    themeStyle: defaultTheme,
    primaryColor: defaultColor,
    header: {
      title: profile.publicName || client.identificationName,
      subtitle:
        profile.summary ||
        (template === 'food-coffee'
          ? 'Descubra o sabor autêntico do café especial em cada gole com torrefação artesanal.'
          : template === 'food-restaurant'
          ? 'Gastronomia japonesa contemporânea com peixes frescos e cortes autorais impecáveis.'
          : template === 'advocacia'
          ? 'Soluções jurídicas estratégicas e personalizadas com mais de 15 anos de excelência.'
          : template === 'beleza-unhas'
          ? 'Realce sua beleza com especialistas em morena iluminada, corte, manicure russa e nail art.'
          : `Serviços especializados em ${profile.activity || 'sua área'} em ${profile.serviceLocation || 'sua cidade'}.`),
      ctaLabel: recommendedCta,
      ctaTargetSection: 'services',
    },
    sectionsOrder,
    sectionsEnabled,
    about: {
      title: `Sobre ${profile.publicName || 'Nossa História'}`,
      text:
        profile.aboutText ||
        profile.summary ||
        'Trabalhamos com dedicação diária para oferecer serviços de excelência, matérias-primas de alta qualidade e uma experiência acolhedora para cada cliente.',
    },
    services: defaultServices,
    differentials: defaultDifferentials,
    gallery: defaultGallery,
    campaignOffer:
      template === 'campaign' || template === 'food-coffee'
        ? {
            badge:
              template === 'food-coffee'
                ? 'Quiz de Paladar & Degustação'
                : 'Condição Especial por Tempo Limitado',
            title:
              template === 'food-coffee'
                ? 'Descubra qual café mais combina com o seu paladar'
                : 'Oferta Exclusiva de Lançamento',
            description:
              template === 'food-coffee'
                ? 'Responda 3 perguntas rápidas e ganhe 10% de desconto no seu primeiro pacote de café em grãos.'
                : 'Garanta condições imperdíveis no pacote completo entrando em contato direto hoje mesmo.',
            conditions:
              template === 'food-coffee'
                ? 'Válido para consumo no local ou no delivery pelo WhatsApp.'
                : 'Válido para os 10 primeiros atendimentos deste mês ou até esgotarem as vagas.',
            ctaSecondary: 'Fazer Pedido',
          }
        : undefined,
    contact: {
      kind: profile.mainCommercialChannel.kind,
      value: profile.mainCommercialChannel.value,
      ctaLabel: recommendedCta,
      address: profile.serviceLocation,
      customMessage: profile.mainCommercialChannel.defaultMessage,
    },
    seo: {
      title: `${profile.publicName || client.identificationName} - ${profile.activity}`,
      description:
        profile.summary ||
        `Página oficial de ${profile.publicName} com serviços, informações e contato direto.`,
    },
  };

  return {
    recommendedTemplate: template,
    recommendedCta,
    justification,
    missingItems,
    initialConfig,
  };
}
