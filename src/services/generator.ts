/**
 * Gerador Determinístico de Landing Pages e Empacotador ZIP
 * Produz HTML5 semântico, CSS responsivo puro sem dependência de runtime,
 * e gera o pacote estático para publicação direta na web.
 * Suporta os modelos de referência:
 * - Cafeteria Gourmet (BODREN Style - Imagem 1)
 * - Restaurante Sushi & Gastronomia (Hush Modern Style - Imagem 2)
 * - Advocacia & Consultoria Jurídica (Creative Law Style - Imagem 3)
 * - Cabeleireiro, Salão de Beleza & Nail Bar (Studio Glow - Imagem 4)
 * - Portfólio, Serviços, Profissional e Campanha
 */

import JSZip from 'jszip';
import { PageConfig } from '../types';
import { escapeHtml, buildWhatsAppLink, sanitizeUrl } from './security';

/**
 * Gera o CSS otimizado para a Landing Page com base no tema e cor principal
 */
export function generatePageCss(config: PageConfig): string {
  const isCoffee = config.template === 'food-coffee';
  const isRestaurant = config.template === 'food-restaurant';
  const isLaw = config.template === 'advocacia';
  const isBeauty = config.template === 'beleza-unhas';

  let primaryColor = config.primaryColor || '#2447C6';
  if (isCoffee && !config.primaryColor) primaryColor = '#5ea39d';
  if (isRestaurant && !config.primaryColor) primaryColor = '#ff5722';
  if (isLaw && !config.primaryColor) primaryColor = '#eab308';
  if (isBeauty && !config.primaryColor) primaryColor = '#c6ff00';

  const isDark =
    config.themeStyle === 'dark' || isCoffee || isRestaurant || isLaw || isBeauty;
  const isNeutral = config.themeStyle === 'neutral' && !isDark;

  let bgColor = isDark ? '#0f172a' : isNeutral ? '#f8fafc' : '#ffffff';
  let surfaceColor = isDark ? '#1e293b' : isNeutral ? '#ffffff' : '#f8fafc';
  let textColor = isDark ? '#f1f5f9' : '#0f172a';
  let textMuted = isDark ? '#94a3b8' : '#64748b';
  let borderColor = isDark ? '#334155' : '#e2e8f0';

  // Ajustes de paleta específicos por nicho de referência
  if (isCoffee) {
    bgColor = '#1e140d';
    surfaceColor = '#2b1c13';
    textColor = '#f7efe9';
    textMuted = '#c9b4a4';
    borderColor = '#422c1e';
  } else if (isRestaurant) {
    bgColor = '#0a0d12';
    surfaceColor = '#141a24';
    textColor = '#ffffff';
    textMuted = '#9ca3af';
    borderColor = '#1f2937';
  } else if (isLaw) {
    bgColor = '#0c0d10';
    surfaceColor = '#15171d';
    textColor = '#f8fafc';
    textMuted = '#94a3b8';
    borderColor = '#2a2d38';
  } else if (isBeauty) {
    bgColor = '#0a0c10';
    surfaceColor = '#141822';
    textColor = '#f8fafc';
    textMuted = '#94a3b8';
    borderColor = '#202736';
  }

  const btnTextColor = isBeauty ? '#0a0c10' : '#ffffff';

  return `
/* Estilos Base da Landing Page - Central de Clientes v3.0 */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: ${primaryColor};
  --primary-hover: ${primaryColor}dd;
  --bg-color: ${bgColor};
  --surface-color: ${surfaceColor};
  --text-color: ${textColor};
  --text-muted: ${textMuted};
  --border-color: ${borderColor};
  --container-max: 1140px;
}

html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  scroll-behavior: smooth;
  background-color: var(--bg-color);
  color: var(--text-color);
  -webkit-font-smoothing: antialiased;
}

body {
  overflow-x: hidden;
  min-height: 100vh;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

.container {
  width: 100%;
  max-width: var(--container-max);
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
}

/* Tipografia */
h1, h2, h3, h4 {
  color: var(--text-color);
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.02em;
}

h1 {
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  margin-bottom: 1.25rem;
  font-weight: 800;
}

h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.4rem);
  margin-bottom: 1rem;
  text-align: center;
}

p {
  color: var(--text-muted);
  font-size: 1.05rem;
}

.section {
  padding: 5rem 0;
}

.section-alt {
  background-color: var(--surface-color);
}

.section-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 3.5rem auto;
}

/* Botões e CTAs */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem 2rem;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s ease;
  min-height: 48px;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary);
  color: ${btnTextColor};
  border: 1px solid transparent;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  opacity: 0.92;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--surface-color);
}

/* Navegação Superior */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
}

.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.nav-logo {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-color);
  letter-spacing: -0.02em;
}

.nav-links {
  display: none;
  gap: 1.75rem;
  list-style: none;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-link {
  font-weight: 600;
  color: var(--text-muted);
  transition: color 0.15s ease;
  font-size: 0.95rem;
}

.nav-link:hover {
  color: var(--primary);
}

/* Hero Section */
.hero {
  padding: 5.5rem 0 4.5rem 0;
  position: relative;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 992px) {
  .hero-grid {
    grid-template-columns: 1.15fr 0.85fr;
  }
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Hero Media Card / Visual Showcase */
.hero-visual {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  border: 1px solid var(--border-color);
}

.hero-visual img {
  width: 100%;
  height: 380px;
  object-fit: cover;
}

/* 1. ESTILOS EXCLUSIVOS: CAFETERIA GOURMET (BODREN - Imagem 1) */
.coffee-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.coffee-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.coffee-card:hover {
  transform: translateY(-6px);
  border-color: var(--primary);
  box-shadow: 0 12px 30px rgba(0,0,0,0.3);
}

.coffee-rating-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #3c271b;
  color: #ffd166;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 209, 102, 0.3);
}

.coffee-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.coffee-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-color);
}

.coffee-add-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.coffee-add-btn:hover {
  transform: scale(1.1);
}

.coffee-pillars-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .coffee-pillars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.coffee-pillar-item {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.coffee-pillar-num {
  font-size: 2.75rem;
  font-weight: 900;
  color: var(--primary);
  opacity: 0.85;
  line-height: 1;
}

.coffee-quiz-box {
  background: linear-gradient(135deg, #2b1c13 0%, #1a110a 100%);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  margin-top: 3rem;
}

/* 2. ESTILOS EXCLUSIVOS: RESTAURANTE SUSHI (Hush Modern - Imagem 2) */
.sushi-brush-divider {
  width: 100%;
  height: 12px;
  background: linear-gradient(90deg, transparent, #ffffff15, transparent);
  margin: 2rem 0;
}

.sushi-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.75rem;
}

.sushi-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sushi-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
}

.sushi-card-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.sushi-card-body {
  padding: 1.5rem;
}

.sushi-chef-banner {
  background: #111622;
  border: 1px solid #1f293d;
  border-radius: 20px;
  padding: 2.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: center;
  margin-top: 3rem;
}

@media (min-width: 768px) {
  .sushi-chef-banner {
    grid-template-columns: 1fr 2fr;
  }
}

.sushi-chef-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 16px;
}

/* 3. ESTILOS EXCLUSIVOS: ADVOCACIA (Creative Law - Imagem 3) */
.law-trust-stats-bar {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 2rem;
  background: #12141a;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  margin: 2.5rem 0;
  text-align: center;
}

@media (min-width: 768px) {
  .law-trust-stats-bar {
    grid-template-columns: repeat(4, 1fr);
  }
}

.law-stat-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.1;
}

.law-stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.law-practice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 1.5rem;
}

.law-practice-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  border-left: 4px solid var(--primary);
  transition: all 0.3s ease;
}

.law-practice-card:hover {
  transform: translateY(-4px);
  background: #171a24;
}

.law-oab-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  background: rgba(234, 179, 8, 0.12);
  border: 1px solid rgba(234, 179, 8, 0.3);
  color: #eab308;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

/* 4. ESTILOS EXCLUSIVOS: CABELEIREIRO & UNHAS (Studio Glow - Imagem 4) */
.beauty-tag-pill {
  display: inline-block;
  background: var(--primary);
  color: #0a0c10;
  font-weight: 800;
  font-size: 0.8rem;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.beauty-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.beauty-menu-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
}

.beauty-menu-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(198, 255, 0, 0.08);
}

.beauty-price-badge {
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 800;
  margin-top: 1rem;
}

/* Galeria de Fotos Geral */
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  border: 1px solid var(--border-color);
  background-color: var(--surface-color);
  aspect-ratio: 4 / 3;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.gallery-item:hover .gallery-img {
  transform: scale(1.05);
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.25rem 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
}

/* Serviços Geral */
.services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.service-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
}

.service-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.service-desc {
  flex-grow: 1;
  margin-bottom: 1.25rem;
}

.service-price {
  font-weight: 800;
  color: var(--primary);
  font-size: 1.1rem;
}

/* Diferenciais */
.diff-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .diff-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.diff-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
}

.diff-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  border-radius: 50%;
}

/* Sobre */
.about-box {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2.75rem;
  max-width: 860px;
  margin: 0 auto;
  line-height: 1.8;
  font-size: 1.1rem;
}

/* Campanha / Oferta */
.campaign-card {
  background: linear-gradient(135deg, var(--surface-color) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 2px solid var(--primary);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 780px;
  margin: 0 auto;
}

.campaign-badge {
  display: inline-block;
  background-color: var(--primary);
  color: ${btnTextColor};
  padding: 0.4rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.25rem;
}

/* Contato e Rodapé */
.contact-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 3.5rem 2rem;
  text-align: center;
  max-width: 680px;
  margin: 0 auto;
}

.contact-address {
  margin-top: 1.5rem;
  font-size: 1rem;
  color: var(--text-muted);
}

.site-footer {
  border-top: 1px solid var(--border-color);
  padding: 2.5rem 0;
  text-align: center;
  font-size: 0.95rem;
  color: var(--text-muted);
}
`;
}

/**
 * Gera o documento HTML5 completo da Landing Page
 */
export function generatePageHtml(config: PageConfig, isExport = false): string {
  const css = generatePageCss(config);
  const title = escapeHtml(config.seo.title || config.header.title);
  const description = escapeHtml(config.seo.description || config.header.subtitle);
  const ogImage = config.seo.ogImage || '';
  const canonicalUrl = config.seo.canonicalUrl || '';

  const isCoffee = config.template === 'food-coffee';
  const isRestaurant = config.template === 'food-restaurant';
  const isLaw = config.template === 'advocacia';
  const isBeauty = config.template === 'beleza-unhas';

  // Determinar links de contato
  let contactUrl = '#';
  if (config.contact.kind === 'whatsapp') {
    contactUrl = buildWhatsAppLink(config.contact.value, config.contact.customMessage);
  } else if (config.contact.kind === 'phone') {
    contactUrl = `tel:${config.contact.value.replace(/\D/g, '')}`;
  } else if (config.contact.kind === 'email') {
    contactUrl = `mailto:${config.contact.value}`;
  } else if (config.contact.kind === 'url') {
    contactUrl = sanitizeUrl(config.contact.value);
  }

  // Gera seções ordenadas conforme config.sectionsOrder
  const sectionsHtml: string[] = [];

  for (const sectionId of config.sectionsOrder) {
    if (!config.sectionsEnabled[sectionId]) continue;

    switch (sectionId) {
      case 'hero':
        // Hero customizado por modelo
        if (isCoffee) {
          sectionsHtml.push(`
          <!-- Seção Hero: Cafeteria Gourmet (Estilo BODREN) -->
          <section id="hero" class="hero">
            <div class="container hero-grid">
              <div>
                <span class="coffee-rating-badge" style="position: static; display: inline-block; margin-bottom: 1rem;">☕ Café Especial 100% Arábica</span>
                <h1>${escapeHtml(config.header.title)}</h1>
                <p class="hero-subtitle">${escapeHtml(config.header.subtitle)}</p>
                <div class="hero-actions">
                  <a href="#services" class="btn btn-primary">
                    ${escapeHtml(config.header.ctaLabel || 'Cardápio & Pedidos')}
                  </a>
                  <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                    WhatsApp Delivery
                  </a>
                </div>
              </div>
              <div class="hero-visual">
                <img src="${config.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'}" alt="Café Especial" />
              </div>
            </div>
          </section>`);
        } else if (isRestaurant) {
          sectionsHtml.push(`
          <!-- Seção Hero: Restaurante Sushi (Estilo Hush Modern) -->
          <section id="hero" class="hero">
            <div class="container hero-grid">
              <div>
                <span style="display: inline-block; color: var(--primary); font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem;">
                  🍱 Alta Gastronomia Japonesa
                </span>
                <h1>${escapeHtml(config.header.title)}</h1>
                <p class="hero-subtitle">${escapeHtml(config.header.subtitle)}</p>
                <div class="hero-actions">
                  <a href="#services" class="btn btn-primary">
                    ${escapeHtml(config.header.ctaLabel || 'Reservar Mesa')}
                  </a>
                  <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                    Cardápio & Pedidos
                  </a>
                </div>
              </div>
              <div class="hero-visual">
                <img src="${config.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80'}" alt="Sushi Omakase" />
              </div>
            </div>
          </section>`);
        } else if (isLaw) {
          sectionsHtml.push(`
          <!-- Seção Hero: Advocacia Estratégica (Estilo Creative Law) -->
          <section id="hero" class="hero">
            <div class="container hero-grid">
              <div>
                <div class="law-oab-badge">
                  ⚖️ Advocacia de Alta Complexidade &amp; Sigilo
                </div>
                <h1>${escapeHtml(config.header.title)}</h1>
                <p class="hero-subtitle">${escapeHtml(config.header.subtitle)}</p>
                <div class="hero-actions">
                  <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    ${escapeHtml(config.header.ctaLabel || 'Consulta Jurídica Confidencial')}
                  </a>
                  <a href="#services" class="btn btn-secondary">
                    Áreas de Atuação
                  </a>
                </div>
              </div>
              <div class="hero-visual">
                <img src="${config.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}" alt="Escritório de Advocacia" />
              </div>
            </div>

            <!-- Barra de Métricas de Confiança (Estilo Imagem 3) -->
            <div class="container">
              <div class="law-trust-stats-bar">
                <div>
                  <div class="law-stat-number">15+</div>
                  <div class="law-stat-label">Anos de Experiência</div>
                </div>
                <div>
                  <div class="law-stat-number">2.500+</div>
                  <div class="law-stat-label">Causas Concluídas</div>
                </div>
                <div>
                  <div class="law-stat-number">98%</div>
                  <div class="law-stat-label">Taxa de Êxito</div>
                </div>
                <div>
                  <div class="law-stat-number">R$ 80M+</div>
                  <div class="law-stat-label">Valores Recuperados</div>
                </div>
              </div>
            </div>
          </section>`);
        } else if (isBeauty) {
          sectionsHtml.push(`
          <!-- Seção Hero: Cabeleireiro & Nail Bar (Estilo Studio Glow) -->
          <section id="hero" class="hero">
            <div class="container hero-grid">
              <div>
                <span class="beauty-tag-pill">✨ Especialistas em Cabelo &amp; Nail Art</span>
                <h1>${escapeHtml(config.header.title)}</h1>
                <p class="hero-subtitle">${escapeHtml(config.header.subtitle)}</p>
                <div class="hero-actions">
                  <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    ${escapeHtml(config.header.ctaLabel || 'Agendar Horário Online')}
                  </a>
                  <a href="#services" class="btn btn-secondary">
                    Tabela de Procedimentos
                  </a>
                </div>
              </div>
              <div class="hero-visual">
                <img src="${config.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}" alt="Salão de Beleza" />
              </div>
            </div>
          </section>`);
        } else {
          sectionsHtml.push(`
          <!-- Seção Hero Padrão -->
          <section id="hero" class="hero">
            <div class="container hero-content" style="text-align: center; max-width: 820px; margin: 0 auto;">
              <h1>${escapeHtml(config.header.title)}</h1>
              <p class="hero-subtitle">${escapeHtml(config.header.subtitle)}</p>
              <div class="hero-actions" style="justify-content: center;">
                <a href="#${config.header.ctaTargetSection || 'contact'}" class="btn btn-primary">
                  ${escapeHtml(config.header.ctaLabel || 'Entrar em Contato')}
                </a>
                <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                  ${escapeHtml(config.contact.ctaLabel || 'WhatsApp Direto')}
                </a>
              </div>
            </div>
          </section>`);
        }
        break;

      case 'services':
        if (config.services && config.services.length > 0) {
          if (isCoffee) {
            const coffeeCards = config.services.map((s, idx) => `
              <div class="coffee-card">
                <span class="coffee-rating-badge">★ 4.${9 - (idx % 3)}</span>
                <h3 style="font-size: 1.35rem; margin-top: 1rem; margin-bottom: 0.5rem;">${escapeHtml(s.title)}</h3>
                <p style="font-size: 0.95rem; min-height: 50px;">${escapeHtml(s.description)}</p>
                <div class="coffee-price-row">
                  <span class="coffee-price">${escapeHtml(s.price || 'R$ 15,00')}</span>
                  <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="coffee-add-btn" title="Pedir este café">+</a>
                </div>
              </div>
            `).join('');

            sectionsHtml.push(`
            <!-- Cardápio de Cafés e Bebidas (BODREN) -->
            <section id="services" class="section">
              <div class="container">
                <div class="section-header">
                  <h2>Cardápio de Cafés Especiais</h2>
                  <p>Grãos moídos na hora, leites texturizados e receitas autorais dos nossos baristas.</p>
                </div>
                <div class="coffee-card-grid">
                  ${coffeeCards}
                </div>
              </div>
            </section>`);
          } else if (isRestaurant) {
            const sushiCards = config.services.map((s, idx) => `
              <div class="sushi-card">
                <img src="${config.gallery?.[idx % (config.gallery?.length || 1)]?.url || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80'}" alt="${escapeHtml(s.title)}" class="sushi-card-img" />
                <div class="sushi-card-body">
                  <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${escapeHtml(s.title)}</h3>
                  <p style="font-size: 0.95rem; margin-bottom: 1rem;">${escapeHtml(s.description)}</p>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${escapeHtml(s.price || 'R$ 49,00')}</span>
                    <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.9rem; min-height: 38px;">Pedir</a>
                  </div>
                </div>
              </div>
            `).join('');

            sectionsHtml.push(`
            <!-- Cardápio de Sushi e Gastronomia (Hush Modern) -->
            <section id="services" class="section">
              <div class="container">
                <div class="section-header">
                  <h2>Combos &amp; Pratos Autorais</h2>
                  <p>Cortes nobres de salmão, atum fresco e criações exclusivas preparadas pelo nosso sushiman.</p>
                </div>
                <div class="sushi-card-grid">
                  ${sushiCards}
                </div>
              </div>
            </section>`);
          } else if (isLaw) {
            const lawCards = config.services.map(s => `
              <div class="law-practice-card">
                <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem; color: var(--text-color);">${escapeHtml(s.title)}</h3>
                <p style="font-size: 0.95rem; margin-bottom: 1rem; line-height: 1.6;">${escapeHtml(s.description)}</p>
                <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary);">${escapeHtml(s.price || 'Consultoria Dedicada')}</div>
              </div>
            `).join('');

            sectionsHtml.push(`
            <!-- Áreas de Atuação Jurídica (Creative Law) -->
            <section id="services" class="section">
              <div class="container">
                <div class="section-header">
                  <h2>Áreas de Atuação Especializada</h2>
                  <p>Soluções jurídicas estratégicas com atuação preventiva e contenciosa de alta eficiência.</p>
                </div>
                <div class="law-practice-grid">
                  ${lawCards}
                </div>
              </div>
            </section>`);
          } else if (isBeauty) {
            const beautyCards = config.services.map(s => `
              <div class="beauty-menu-card">
                <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${escapeHtml(s.title)}</h3>
                <p style="font-size: 0.95rem; margin-bottom: 0.75rem;">${escapeHtml(s.description)}</p>
                <div class="beauty-price-badge">${escapeHtml(s.price || 'Sob Consulta')}</div>
                <div style="margin-top: 1.25rem;">
                  <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; font-size: 0.9rem; padding: 0.5rem 1rem; min-height: 38px;">Agendar</a>
                </div>
              </div>
            `).join('');

            sectionsHtml.push(`
            <!-- Tabela de Serviços Cabelo & Unhas (Studio Glow) -->
            <section id="services" class="section">
              <div class="container">
                <div class="section-header">
                  <h2>Menu de Cabelo, Coloração &amp; Nail Bar</h2>
                  <p>Procedimentos de alta precisão com produtos importados e biossegurança garantida.</p>
                </div>
                <div class="beauty-menu-grid">
                  ${beautyCards}
                </div>
              </div>
            </section>`);
          } else {
            const servicesCards = config.services.map(s => `
              <div class="service-card">
                <h3 class="service-title">${escapeHtml(s.title)}</h3>
                <p class="service-desc">${escapeHtml(s.description)}</p>
                ${s.price ? `<div class="service-price">${escapeHtml(s.price)}</div>` : ''}
              </div>
            `).join('');

            sectionsHtml.push(`
            <!-- Seção Serviços Padrão -->
            <section id="services" class="section">
              <div class="container">
                <div class="section-header">
                  <h2>Serviços &amp; Atendimento</h2>
                  <p>Soluções estruturadas para atender exatamente ao que você precisa com qualidade garantida.</p>
                </div>
                <div class="services-grid">
                  ${servicesCards}
                </div>
              </div>
            </section>`);
          }
        }
        break;

      case 'differentials':
        if (config.differentials && config.differentials.length > 0) {
          if (isCoffee) {
            const pillarCards = config.differentials.map((diff, idx) => `
              <div class="coffee-pillar-item">
                <div class="coffee-pillar-num">0${idx + 1}</div>
                <div>
                  <p style="color: var(--text-color); font-weight: 600; font-size: 1.05rem;">${escapeHtml(diff)}</p>
                </div>
              </div>
            `).join('');

            sectionsHtml.push(`
            <!-- 4 Pilares da Cafeteria (BODREN) -->
            <section id="differentials" class="section section-alt">
              <div class="container">
                <div class="section-header">
                  <h2>Nosso Padrão de Qualidade</h2>
                  <p>O que torna cada xícara e visita uma experiência sensorial inesquecível.</p>
                </div>
                <div class="coffee-pillars-grid">
                  ${pillarCards}
                </div>
              </div>
            </section>`);
          } else {
            const diffCards = config.differentials.map((diff, idx) => `
              <div class="diff-card">
                <div class="diff-icon">${idx + 1}</div>
                <div>
                  <p style="color: var(--text-color); font-weight: 600;">${escapeHtml(diff)}</p>
                </div>
              </div>
            `).join('');

            sectionsHtml.push(`
            <!-- Diferenciais -->
            <section id="differentials" class="section section-alt">
              <div class="container">
                <div class="section-header">
                  <h2>Por que nos escolher?</h2>
                  <p>Nosso compromisso é entregar excelência em cada detalhe da sua experiência.</p>
                </div>
                <div class="diff-grid">
                  ${diffCards}
                </div>
              </div>
            </section>`);
          }
        }
        break;

      case 'gallery':
        if (config.gallery && config.gallery.length > 0) {
          const itemsHtml = config.gallery.map(item => `
            <div class="gallery-item">
              <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt)}" class="gallery-img" loading="lazy" />
              ${item.title ? `<div class="gallery-caption">${escapeHtml(item.title)}</div>` : ''}
            </div>
          `).join('');

          sectionsHtml.push(`
          <!-- Galeria de Fotos / Visual -->
          <section id="gallery" class="section">
            <div class="container">
              <div class="section-header">
                <h2>${isCoffee ? 'Momentos & Torrefação' : isRestaurant ? 'Experiência Visual & Pratos' : isLaw ? 'Estrutura & Acervo' : isBeauty ? 'Transformações & Nail Art' : 'Galeria de Trabalhos'}</h2>
                <p>Confira registros reais do nosso espaço, criações e resultados para clientes.</p>
              </div>
              <div class="gallery-grid">
                ${itemsHtml}
              </div>
            </div>
          </section>`);
        }
        break;

      case 'about':
        if (config.about && config.about.text) {
          sectionsHtml.push(`
          <!-- Seção Sobre -->
          <section id="about" class="section section-alt">
            <div class="container">
              <div class="section-header">
                <h2>${escapeHtml(config.about.title || 'Sobre Nós')}</h2>
              </div>
              <div class="about-box">
                <p style="white-space: pre-line;">${escapeHtml(config.about.text)}</p>
              </div>
            </div>
          </section>`);
        }
        break;

      case 'campaign':
        if (config.campaignOffer) {
          if (isCoffee) {
            sectionsHtml.push(`
            <!-- Quiz Interativo de Café (BODREN) -->
            <section id="campaign" class="section">
              <div class="container">
                <div class="coffee-quiz-box">
                  <span class="campaign-badge">☕ ${escapeHtml(config.campaignOffer.badge || 'Quiz Especial')}</span>
                  <h2>${escapeHtml(config.campaignOffer.title)}</h2>
                  <p style="font-size: 1.15rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                    ${escapeHtml(config.campaignOffer.description)}
                  </p>
                  <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    Fazer Teste no WhatsApp
                  </a>
                  ${config.campaignOffer.conditions ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 1.5rem;">${escapeHtml(config.campaignOffer.conditions)}</p>` : ''}
                </div>
              </div>
            </section>`);
          } else {
            sectionsHtml.push(`
            <!-- Oferta / Campanha -->
            <section id="campaign" class="section">
              <div class="container">
                <div class="campaign-card">
                  ${config.campaignOffer.badge ? `<span class="campaign-badge">${escapeHtml(config.campaignOffer.badge)}</span>` : ''}
                  <h2>${escapeHtml(config.campaignOffer.title)}</h2>
                  <p style="font-size: 1.15rem; margin-bottom: 2rem;">${escapeHtml(config.campaignOffer.description)}</p>
                  <div>
                    <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                      ${escapeHtml(config.header.ctaLabel || 'Garantir Oferta')}
                    </a>
                  </div>
                  ${config.campaignOffer.conditions ? `<div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 1.5rem;">${escapeHtml(config.campaignOffer.conditions)}</div>` : ''}
                </div>
              </div>
            </section>`);
          }
        }
        break;

      case 'contact':
        sectionsHtml.push(`
        <!-- Seção Contato / Agendamento -->
        <section id="contact" class="section ${isCoffee || isRestaurant || isLaw || isBeauty ? 'section-alt' : ''}">
          <div class="container">
            <div class="contact-card">
              <h2>${isLaw ? 'Agende uma Consulta Confidencial' : isCoffee ? 'Venha tomar um café ou peça no delivery' : isRestaurant ? 'Reservas de Mesa & Pedidos' : isBeauty ? 'Reserve seu Horário' : 'Vamos conversar?'}</h2>
              <p style="margin-bottom: 2rem;">
                ${isLaw ? 'Atendimento presencial no escritório ou consultoria online com absoluto sigilo.' : isCoffee ? 'Atendemos presencialmente no balcão e entregamos pedidos frescos com agilidade.' : isRestaurant ? 'Garanta sua mesa ou receba seu combinado favorito no conforto da sua casa.' : isBeauty ? 'Escolha o melhor dia e horário para seu procedimento com nossas especialistas.' : 'Entre em contato direto pelo canal oficial para atendimento imediato.'}
              </p>
              <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 1.15rem; padding: 1rem 2.5rem;">
                ${escapeHtml(config.contact.ctaLabel || 'Falar no WhatsApp')}
              </a>
              ${config.contact.address ? `<div class="contact-address">📍 ${escapeHtml(config.contact.address)}</div>` : ''}
            </div>
          </div>
        </section>`);
        break;
    }
  }

  const styleTagOrLink = isExport
    ? '<link rel="stylesheet" href="assets/style.css">'
    : `<style>${css}</style>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  ${canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}"><meta property="og:url" content="${escapeHtml(canonicalUrl)}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
  ${styleTagOrLink}
</head>
<body>
  <!-- Cabeçalho de Navegação -->
  <header class="site-header">
    <div class="container nav-wrapper">
      <a href="#hero" class="nav-logo">${escapeHtml(config.header.title)}</a>
      <ul class="nav-links">
        ${config.sectionsEnabled.services ? '<li><a href="#services" class="nav-link">' + (isCoffee || isRestaurant ? 'Cardápio' : isLaw ? 'Áreas de Atuação' : isBeauty ? 'Procedimentos' : 'Serviços') + '</a></li>' : ''}
        ${config.sectionsEnabled.differentials ? '<li><a href="#differentials" class="nav-link">' + (isCoffee ? 'Qualidade' : isLaw ? 'Diferenciais' : 'Por que nós') + '</a></li>' : ''}
        ${config.sectionsEnabled.gallery ? '<li><a href="#gallery" class="nav-link">' + (isBeauty ? 'Nail Art & Cabelo' : isCoffee ? 'Ambiente' : 'Galeria') + '</a></li>' : ''}
        ${config.sectionsEnabled.about ? '<li><a href="#about" class="nav-link">Sobre</a></li>' : ''}
        <li><a href="#contact" class="nav-link">Contato</a></li>
      </ul>
      <a href="${contactUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 0.55rem 1.4rem; font-size: 0.95rem; min-height: 40px;">
        ${escapeHtml(config.contact.ctaLabel || 'Contato')}
      </a>
    </div>
  </header>

  <main>
    ${sectionsHtml.join('\n')}
  </main>

  <!-- Rodapé -->
  <footer class="site-footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(config.header.title)}. Todos os direitos reservados.</p>
    </div>
  </footer>
</body>
</html>`;
}

/**
 * Cria o pacote ZIP real da Landing Page com index.html, assets/style.css e instruções
 */
export async function createLandingPageZip(config: PageConfig, slug = 'landing-page'): Promise<Blob> {
  const zip = new JSZip();

  const htmlContent = generatePageHtml(config, true);
  const cssContent = generatePageCss(config);

  zip.file('index.html', htmlContent);

  const assetsFolder = zip.folder('assets');
  if (assetsFolder) {
    assetsFolder.file('style.css', cssContent);
    assetsFolder.file(
      'README.txt',
      `Central de Clientes - Pacote de Publicação Estática v3.0
======================================================
Landing Page: ${config.header.title}
Modelo: ${config.template}
Data de Exportação: ${new Date().toLocaleString('pt-BR')}

INSTRUÇÕES DE HOSPEDAGEM:
1. Extraia o conteúdo deste arquivo ZIP.
2. Faça o upload do arquivo "index.html" e da pasta "assets/" diretamente para a raiz da sua hospedagem estática
   (Netlify, Vercel, Cloudflare Pages, GitHub Pages ou servidor Apache/Nginx).
3. O site é 100% responsivo, puro em HTML5 e CSS, sem qualquer dependência de backend.
4. Após publicar na sua hospedagem com domínio HTTPS, registre a URL no Painel Administrativo.
`
    );
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

/**
 * Dispara o download no navegador
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
