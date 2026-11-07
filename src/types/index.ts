/**
 * Tipos e entidades da Central de Clientes, Portal do Cliente e Gerador de Landing Pages
 * Especificação Versão 3.0
 */

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mfaEnabled?: boolean;
  avatar?: string;
  createdAt: string;
  clientIds?: string[]; // IDs das fichas às quais este cliente tem acesso
}

export type ClientType = 'PF' | 'PJ';
export type ClientStatus = 'Em cadastro' | 'Ativo' | 'Inativo' | 'Arquivado';

export interface ClientIdentificationPF {
  civilName: string;
  cpf?: string;
  rgCin?: string;
  documentType?: 'RG' | 'CIN' | 'Outro';
  notes?: string;
}

export interface ClientIdentificationPJ {
  companyName: string; // Razão Social
  tradeName: string;   // Nome Fantasia
  cnpj?: string;
  representativeName?: string;
  notes?: string;
}

export interface ClientContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  isPrimary: boolean;
}

export interface PrivateDocument {
  id: string;
  clientId: string;
  filename: string;
  category: 'identidade' | 'contrato' | 'comprovante' | 'anexo';
  fileSize: number; // bytes
  mimeType: string;
  uploadDate: string;
  status: 'quarantine' | 'verified' | 'rejected';
  purpose: string;
  fileData?: string; // Base64 para visualização segura no protótipo
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price?: string;
}

export interface PublicMediaItem {
  id: string;
  url: string;
  alt: string;
  kind: 'portrait' | 'logo' | 'cover' | 'portfolio';
  authorized: boolean;
  title?: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface CommercialChannel {
  kind: 'whatsapp' | 'phone' | 'email' | 'url';
  value: string;
  defaultMessage?: string;
}

export interface PublicProfile {
  id: string;
  clientId: string;
  publicName: string;
  activity: string;
  summary: string;
  mainCommercialChannel: CommercialChannel;
  serviceLocation: string;
  services: ServiceItem[];
  aboutText: string;
  differentials: string[];
  media: PublicMediaItem[];
  socialLinks: SocialLink[];
  visualIdentity: {
    primaryColor: string;
    themeStyle: 'light' | 'dark' | 'neutral';
    logoUrl?: string;
  };
}

export interface ClientTask {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  responsible: string;
  dueDate: string;
  status: 'Aberta' | 'Concluída' | 'Cancelada';
  priority: 'baixa' | 'media' | 'alta';
}

export interface ClientActivity {
  id: string;
  clientId: string;
  date: string;
  author: string;
  channel: 'WhatsApp' | 'Telefone' | 'E-mail' | 'Reunião' | 'Sistema';
  summary: string;
}

export interface Client {
  id: string;
  type: ClientType;
  identificationName: string;
  internalResponsible: string;
  status: ClientStatus;
  tags: string[];
  city?: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
  // Sub-entidades
  identificationPF?: ClientIdentificationPF;
  identificationPJ?: ClientIdentificationPJ;
  contacts: ClientContact[];
  documents: PrivateDocument[];
  publicProfile: PublicProfile;
  tasks: ClientTask[];
  activities: ClientActivity[];
}

export type TemplateType =
  | 'portfolio'
  | 'services'
  | 'professional'
  | 'campaign'
  | 'food-coffee'
  | 'food-restaurant'
  | 'advocacia'
  | 'beleza-unhas';
export type EditorialStatus = 'Rascunho' | 'Em revisão' | 'Aprovada';
export type PublicationStatus = 'Sem registro' | 'Publicada informada' | 'Retirada informada';

export interface PageSectionConfig {
  id: string;
  name: string;
  enabled: boolean;
}

export interface PageConfig {
  template: TemplateType;
  themeStyle: 'light' | 'dark' | 'neutral';
  primaryColor: string;
  header: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaTargetSection: string;
  };
  sectionsOrder: string[]; // ['hero', 'gallery', 'services', 'differentials', 'about', 'campaign', 'contact']
  sectionsEnabled: Record<string, boolean>;
  about: {
    title: string;
    text: string;
  };
  services: {
    id: string;
    title: string;
    description: string;
    price?: string;
  }[];
  differentials: string[];
  gallery: {
    id: string;
    url: string;
    title: string;
    alt: string;
  }[];
  campaignOffer?: {
    badge: string;
    title: string;
    description: string;
    conditions: string;
    ctaSecondary?: string;
  };
  contact: {
    kind: 'whatsapp' | 'phone' | 'email' | 'url';
    value: string;
    ctaLabel: string;
    address?: string;
    customMessage?: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
}

export interface PageRevision {
  id: string;
  pageId: string;
  revisionNumber: number;
  editorialStatus: EditorialStatus;
  approvedAt?: string;
  approvedBy?: string;
  clientPreviewReleased: boolean;
  createdAt: string;
  config: PageConfig;
}

export interface LandingPage {
  id: string;
  clientId: string;
  title: string;
  slug: string;
  template: TemplateType;
  goal: string;
  portalVisibility: 'Oculta' | 'Disponível';
  currentRevisionId: string;
  revisions: PageRevision[];
  publishedUrl?: string;
  publicationStatus: PublicationStatus;
  publishedRevisionNumber?: number;
  publishedAt?: string;
  publishedOperator?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  clientId: string;
  email: string;
  token: string;
  status: 'Pendente' | 'Ativo' | 'Suspenso' | 'Revogado';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole | 'Sistema';
  action: string;
  resource: string;
  details?: string;
  status: 'success' | 'denied';
}

export interface SuggestionResult {
  recommendedTemplate: TemplateType;
  recommendedCta: string;
  justification: string;
  initialConfig: PageConfig;
  missingItems: string[];
}

export interface ABTestVariation {
  id: 'A' | 'B';
  name: string;
  description?: string;
  headline: string;
  subtitle: string;
  ctaLabel: string;
  primaryColor: string;
  template?: TemplateType;
  campaignBadge?: string;
  views: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number; // Porcentagem calculada (ex: 14.5)
  bounceRate?: number;
  avgTimeOnPage?: string;
}

export interface ABTestDailyMetric {
  date: string;
  displayDate: string;
  viewsA: number;
  convA: number;
  rateA: number;
  viewsB: number;
  convB: number;
  rateB: number;
}

export interface ABTest {
  id: string;
  pageId: string;
  pageTitle: string;
  clientId: string;
  clientName?: string;
  title: string;
  hypothesis: string;
  status: 'running' | 'paused' | 'concluded' | 'draft';
  trafficSplitPercent: number; // Ex: 50 representa 50% A / 50% B
  metricTarget: 'whatsapp_leads' | 'cta_clicks' | 'time_spent';
  variationA: ABTestVariation;
  variationB: ABTestVariation;
  winnerVariation?: 'A' | 'B' | 'none';
  statisticalConfidence: number; // Ex: 98.4 (%)
  significanceReached: boolean;
  liftPercent: number; // Diferença percentual positiva ou negativa da variação B sobre A (ex: +34.2)
  dailyMetrics: ABTestDailyMetric[];
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}
