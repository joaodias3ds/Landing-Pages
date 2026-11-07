/**
 * Gerador de Relatório Executivo em PDF para o Dashboard de Analytics
 * Utiliza jsPDF para gerar um documento PDF completo e formatado.
 */

import { jsPDF } from 'jspdf';
import { AnalyticsSummary } from './analyticsData';
import { ABTest } from '../types';

interface GeneratePdfReportParams {
  analytics: AnalyticsSummary;
  periodDays: number;
  pageFilterTitle: string;
  adminName?: string;
  abTests?: ABTest[];
}

export function generateAnalyticsPdfReport({
  analytics,
  periodDays,
  pageFilterTitle,
  adminName = 'Admin Principal',
  abTests = [],
}: GeneratePdfReportParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // -------------------------------------------------------------
  // CABEÇALHO COM IDENTIDADE VISUAL
  // -------------------------------------------------------------
  // Barra superior azul elegante
  doc.setFillColor(36, 71, 198); // #2447C6
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Título e logotipo no cabeçalho
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CENTRAL DE CLIENTES • ANALYTICS & CONVERSÃO', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Relatório Executivo de Desempenho de Tráfego e Conversão', margin, 18);

  // Data e hora de geração no canto direito
  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR');
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.text(`Emitido em: ${formattedDate} às ${formattedTime}`, pageWidth - margin, 11, { align: 'right' });
  doc.text(`Responsável: ${adminName}`, pageWidth - margin, 18, { align: 'right' });

  y = 32;

  // -------------------------------------------------------------
  // PARÂMETROS DO RELATÓRIO
  // -------------------------------------------------------------
  doc.setFillColor(244, 246, 250); // #F4F6FA
  doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 32, 51);
  doc.text(`Período de Análise: `, margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Últimos ${periodDays} dias`, margin + 34, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Escopo Filtrado: `, margin + 75, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${pageFilterTitle}`, margin + 102, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Páginas Monitoradas: `, margin + 4, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${analytics.pagesPerformance.length} Landing Pages`, margin + 42, y + 11);

  y += 20;

  // -------------------------------------------------------------
  // CARDS DE INDICADORES CHAVE (KPIs)
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 32, 51);
  doc.text('1. Principais Indicadores de Desempenho (KPIs)', margin, y);
  y += 5;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 22;

  const kpis = [
    { label: 'Visualizações', value: analytics.totalViews.toLocaleString('pt-BR'), trend: `+${analytics.viewsTrend}%`, color: [37, 99, 235] },
    { label: 'Visitantes Únicos', value: analytics.uniqueVisitors.toLocaleString('pt-BR'), trend: `+${analytics.visitorsTrend}%`, color: [99, 102, 241] },
    { label: 'Conversões no CTA', value: analytics.totalConversions.toLocaleString('pt-BR'), trend: `+${analytics.conversionsTrend}%`, color: [16, 185, 129] },
    { label: 'Taxa de Conversão', value: `${analytics.avgConversionRate}%`, trend: `+${analytics.rateTrend}%`, color: [147, 51, 234] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), x + 3.5, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 3.5, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129);
    doc.text(kpi.trend, x + 3.5, y + 19);
  });

  y += cardHeight + 10;

  // -------------------------------------------------------------
  // TABELA: DESEMPENHO INDIVIDUAL POR LANDING PAGE
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 32, 51);
  doc.text('2. Desempenho Detalhado por Landing Page', margin, y);
  y += 5;

  // Cabeçalho da tabela
  const colX = {
    page: margin,
    template: margin + 65,
    views: margin + 95,
    conversions: margin + 120,
    rate: margin + 145,
    channel: margin + 165,
  };

  doc.setFillColor(36, 71, 198);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PÁGINA / CLIENTE', colX.page + 2, y + 4.5);
  doc.text('MODELO', colX.template, y + 4.5);
  doc.text('PAGEVIEWS', colX.views, y + 4.5);
  doc.text('CONVERSÕES', colX.conversions, y + 4.5);
  doc.text('TAXA (CR)', colX.rate, y + 4.5);
  doc.text('CANAL PRINCIPAL', colX.channel, y + 4.5);

  y += 7;

  // Linhas da tabela
  analytics.pagesPerformance.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(23, 32, 51);
    const shortTitle = p.title.length > 32 ? `${p.title.substring(0, 32)}...` : p.title;
    doc.text(shortTitle, colX.page + 2, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(p.template.toUpperCase(), colX.template, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 32, 51);
    doc.text(p.views.toLocaleString('pt-BR'), colX.views, y + 4.5);

    doc.setTextColor(16, 185, 129);
    doc.text(p.conversions.toLocaleString('pt-BR'), colX.conversions, y + 4.5);

    doc.setTextColor(37, 99, 235);
    doc.text(`${p.conversionRate}%`, colX.rate, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(p.primaryChannel, colX.channel, y + 4.5);

    // Linha divisória fina
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 7.5, pageWidth - margin, y + 7.5);

    y += 7.5;
  });

  y += 8;

  // -------------------------------------------------------------
  // FONTES DE TRÁFEGO E DISPOSITIVOS (GRID EM 2 COLUNAS)
  // -------------------------------------------------------------
  const halfColWidth = (pageWidth - margin * 2 - 8) / 2;

  // Coluna Esquerda: Fontes de Tráfego
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(23, 32, 51);
  doc.text('3. Fontes de Tráfego e Aquisição', margin, y);

  // Coluna Direita: Dispositivos
  doc.text('4. Distribuição por Dispositivo', margin + halfColWidth + 8, y);
  y += 5;

  const subBoxHeight = 36;

  // Caixa Fontes
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, halfColWidth, subBoxHeight, 2, 2, 'FD');

  let sourceY = y + 6;
  analytics.trafficSources.forEach((src) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(src.name, margin + 4, sourceY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${src.share}% (${src.visitors.toLocaleString('pt-BR')} acessos)`, margin + halfColWidth - 4, sourceY, { align: 'right' });

    sourceY += 7;
  });

  // Caixa Dispositivos
  doc.roundedRect(margin + halfColWidth + 8, y, halfColWidth, subBoxHeight, 2, 2, 'FD');
  let deviceY = y + 7;
  analytics.deviceDistribution.forEach((dev) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(dev.name, margin + halfColWidth + 12, deviceY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(37, 99, 235);
    doc.text(`${dev.share}% (${dev.visitors.toLocaleString('pt-BR')} visitas)`, margin + halfColWidth * 2 + 4, deviceY, { align: 'right' });

    deviceY += 8;
  });

  y += subBoxHeight + 8;

  // -------------------------------------------------------------
  // FUNIL DE CONVERSÃO DO VISITANTE
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(23, 32, 51);
  doc.text('5. Funil de Conversão do Visitante', margin, y);
  y += 5;

  const funnelBoxHeight = 32;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, funnelBoxHeight, 2, 2, 'FD');

  let funY = y + 6;
  analytics.funnelData.forEach((stg) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(stg.stage, margin + 5, funY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`${stg.percentage}%`, pageWidth - margin - 50, funY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${stg.count.toLocaleString('pt-BR')} usuários`, pageWidth - margin - 5, funY, { align: 'right' });

    funY += 6.5;
  });

  // -------------------------------------------------------------
  // RODAPÉ DO DOCUMENTO
  // -------------------------------------------------------------
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Central de Clientes v3.0 • Relatório oficial de inteligência e tráfego • Autenticação JWT e armazenamento protegido',
    margin,
    pageHeight - 9
  );
  doc.text(`Página 1 de ${abTests.length > 0 ? '2' : '1'}`, pageWidth - margin, pageHeight - 9, { align: 'right' });

  // -------------------------------------------------------------
  // PÁGINA 2: TESTES A/B & OTIMIZAÇÃO DE CONVERSÃO (SE HOUVER)
  // -------------------------------------------------------------
  if (abTests.length > 0) {
    doc.addPage();
    let y2 = margin;

    // Header Página 2
    doc.setFillColor(36, 71, 198);
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CENTRAL DE CLIENTES • TESTES A/B DE CONVERSÃO', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Resultados de Experimentos Estatísticos e Otimização de Landing Pages', margin, 18);

    doc.setFontSize(8);
    doc.text(`Emitido em: ${formattedDate} às ${formattedTime}`, pageWidth - margin, 11, { align: 'right' });
    doc.text(`Testes Registrados: ${abTests.length}`, pageWidth - margin, 18, { align: 'right' });

    y2 = 34;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(23, 32, 51);
    doc.text('Experimentos A/B Ativos e Concluídos', margin, y2);
    y2 += 6;

    abTests.slice(0, 4).forEach((test) => {
      const cardHeight = 44;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y2, pageWidth - margin * 2, cardHeight, 2, 2, 'FD');

      // Título do Teste e Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(test.title, margin + 4, y2 + 6);

      const statusLabel =
        test.status === 'running'
          ? 'EM ANDAMENTO'
          : test.status === 'concluded'
          ? 'CONCLUÍDO'
          : 'PAUSADO';
      doc.setFontSize(8);
      doc.setTextColor(test.status === 'running' ? 37 : 100, test.status === 'running' ? 99 : 116, 235);
      doc.text(`Status: ${statusLabel} • Split: ${test.trafficSplitPercent}% / ${100 - test.trafficSplitPercent}%`, pageWidth - margin - 4, y2 + 6, { align: 'right' });

      // Página e Cliente
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Página: ${test.pageTitle} • Cliente: ${test.clientName || 'Geral'}`, margin + 4, y2 + 12);
      doc.text(`Hipótese: ${test.hypothesis.substring(0, 95)}...`, margin + 4, y2 + 18);

      // Comparação A vs B
      // Variação A
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin + 4, y2 + 22, (pageWidth - margin * 2) / 2 - 6, 18, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Variação A (Controle)', margin + 7, y2 + 27);
      doc.setFont('helvetica', 'normal');
      doc.text(`Taxa: ${test.variationA.conversionRate}% (${test.variationA.conversions} conv / ${test.variationA.views} views)`, margin + 7, y2 + 33);
      doc.text(`CTA: "${test.variationA.ctaLabel}"`, margin + 7, y2 + 38);

      // Variação B
      const xB = margin + 4 + (pageWidth - margin * 2) / 2;
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(xB, y2 + 22, (pageWidth - margin * 2) / 2 - 8, 18, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(67, 56, 202);
      doc.text(`Variação B (Desafiante) • Lift: +${test.liftPercent}%`, xB + 3, y2 + 27);
      doc.setFont('helvetica', 'normal');
      doc.text(`Taxa: ${test.variationB.conversionRate}% (${test.variationB.conversions} conv / ${test.variationB.views} views)`, xB + 3, y2 + 33);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text(`Confiança Estatística: ${test.statisticalConfidence}% ${test.significanceReached ? '(Significante!)' : ''}`, xB + 3, y2 + 38);

      y2 += cardHeight + 6;
    });

    // Rodapé Página 2
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Central de Clientes v3.0 • Módulo de Experimentos e Otimização A/B', margin, pageHeight - 9);
    doc.text('Página 2 de 2', pageWidth - margin, pageHeight - 9, { align: 'right' });
  }

  // Nome do arquivo gerado
  const cleanFilterSlug = pageFilterTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const filename = `relatorio-analytics-${cleanFilterSlug}-${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
