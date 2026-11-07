/**
 * Serviço de Métricas e Dados Analíticos de Tráfego e Conversão das Landing Pages
 */

import { LandingPage } from '../types';

export interface DailyTrafficMetric {
  date: string;
  displayDate: string;
  views: number;
  uniqueVisitors: number;
  conversions: number;
  rate: number;
}

export interface PagePerformanceMetric {
  pageId: string;
  title: string;
  slug: string;
  template: string;
  clientName: string;
  views: number;
  conversions: number;
  conversionRate: number;
  avgTimeOnPage: string;
  bounceRate: number;
  primaryChannel: string;
}

export interface TrafficSourceMetric {
  name: string;
  visitors: number;
  share: number;
  conversions: number;
  color: string;
}

export interface DeviceDistributionMetric {
  name: string;
  share: number;
  visitors: number;
  color: string;
}

export interface FunnelStageMetric {
  stage: string;
  count: number;
  percentage: number;
  dropoff?: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  viewsTrend: number;
  uniqueVisitors: number;
  visitorsTrend: number;
  totalConversions: number;
  conversionsTrend: number;
  avgConversionRate: number;
  rateTrend: number;
  avgTimeOnPage: string;
  dailyData: DailyTrafficMetric[];
  pagesPerformance: PagePerformanceMetric[];
  trafficSources: TrafficSourceMetric[];
  deviceDistribution: DeviceDistributionMetric[];
  funnelData: FunnelStageMetric[];
}

export function generateAnalyticsData(
  pages: LandingPage[],
  periodDays: 7 | 30 | 90 = 30,
  filterPageId: string = 'all'
): AnalyticsSummary {
  const isAll = filterPageId === 'all';
  const multiplier = isAll ? 1 : 0.45;
  const daysCount = periodDays;

  // Gera série temporal diária
  const dailyData: DailyTrafficMetric[] = [];
  const now = new Date();

  let totalViews = 0;
  let uniqueVisitors = 0;
  let totalConversions = 0;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    // Padrão semanal com pico no meio da semana e fins de semana variáveis
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseViews = (isWeekend ? 85 : 140) * multiplier;
    const noise = Math.sin(i * 0.8) * 25 + (Math.random() * 20 - 10);
    const views = Math.max(15, Math.round(baseViews + noise));
    const visitors = Math.round(views * 0.78);
    
    // Taxa de conversão média em torno de 12% a 18% para páginas focadas em WhatsApp
    const convRate = 0.12 + (Math.cos(i * 0.5) * 0.04);
    const conversions = Math.max(1, Math.round(visitors * convRate));

    totalViews += views;
    uniqueVisitors += visitors;
    totalConversions += conversions;

    dailyData.push({
      date: dateStr,
      displayDate,
      views,
      uniqueVisitors: visitors,
      conversions,
      rate: Number(((conversions / views) * 100).toFixed(1)),
    });
  }

  // Desempenho individual por página
  const pagesPerformance: PagePerformanceMetric[] = pages.map((page, idx) => {
    const pageMultiplier = idx === 0 ? 1.4 : idx === 1 ? 1.0 : 0.7;
    const pViews = Math.round((totalViews / Math.max(1, pages.length)) * pageMultiplier);
    const pConvs = Math.round(pViews * (0.13 + idx * 0.02));
    const pRate = Number(((pConvs / pViews) * 100).toFixed(1));

    return {
      pageId: page.id,
      title: page.title,
      slug: page.slug,
      template: page.template,
      clientName: page.title.replace('Landing Page - ', '').replace('Landing Page Oficial - ', ''),
      views: pViews,
      conversions: pConvs,
      conversionRate: pRate,
      avgTimeOnPage: idx === 0 ? '2m 45s' : idx === 1 ? '1m 58s' : '2m 12s',
      bounceRate: 32 + idx * 4,
      primaryChannel: idx === 0 ? 'WhatsApp Orçamento' : idx === 1 ? 'WhatsApp Técnico' : 'Agendamento Direto',
    };
  });

  // Fontes de tráfego
  const trafficSources: TrafficSourceMetric[] = [
    { name: 'Instagram & Bio Link', visitors: Math.round(uniqueVisitors * 0.44), share: 44, conversions: Math.round(totalConversions * 0.48), color: '#E1306C' },
    { name: 'Busca Google (Orgânico/Local)', visitors: Math.round(uniqueVisitors * 0.28), share: 28, conversions: Math.round(totalConversions * 0.26), color: '#2447C6' },
    { name: 'Compartilhamento WhatsApp', visitors: Math.round(uniqueVisitors * 0.16), share: 16, conversions: Math.round(totalConversions * 0.18), color: '#22C55E' },
    { name: 'Acesso Direto / QR Code', visitors: Math.round(uniqueVisitors * 0.12), share: 12, conversions: Math.round(totalConversions * 0.08), color: '#8B5CF6' },
  ];

  // Dispositivos
  const deviceDistribution: DeviceDistributionMetric[] = [
    { name: 'Celulares (Mobile)', share: 72, visitors: Math.round(uniqueVisitors * 0.72), color: '#3B82F6' },
    { name: 'Computadores (Desktop)', share: 23, visitors: Math.round(uniqueVisitors * 0.23), color: '#6366F1' },
    { name: 'Tablets & Outros', share: 5, visitors: Math.round(uniqueVisitors * 0.05), color: '#94A3B8' },
  ];

  // Funil de Conversão
  const funnelData: FunnelStageMetric[] = [
    { stage: '1. Acesso à Página', count: totalViews, percentage: 100 },
    { stage: '2. Rolagem até Seção Principal', count: Math.round(totalViews * 0.71), percentage: 71, dropoff: 29 },
    { stage: '3. Visualização do Portfólio/Serviços', count: Math.round(totalViews * 0.48), percentage: 48, dropoff: 23 },
    { stage: '4. Clique no Botão de WhatsApp / CTA', count: totalConversions, percentage: Math.round((totalConversions / totalViews) * 100), dropoff: 34 },
  ];

  const avgConversionRate = Number(((totalConversions / totalViews) * 100).toFixed(1));

  return {
    totalViews,
    viewsTrend: 14.8, // +14.8% vs período anterior
    uniqueVisitors,
    visitorsTrend: 12.3,
    totalConversions,
    conversionsTrend: 18.5,
    avgConversionRate,
    rateTrend: 2.1,
    avgTimeOnPage: '2m 24s',
    dailyData,
    pagesPerformance,
    trafficSources,
    deviceDistribution,
    funnelData,
  };
}
