/**
 * MODULE MANIFEST — Charlie Marketplace Builder v1.5
 * ═══════════════════════════════════════════════════
 * FUENTE ÚNICA DE VERDAD sobre qué vistas existen y qué IDs del checklist cubren.
 *
 * ┌─ REGLA ──────────────────────────────────────────────────────────────────────┐
 * │  Cuando construís una vista nueva, SOLO tenés que agregar/editar UNA entrada │
 * │  aquí. moduleRegistry.ts y el ChecklistRoadmap se actualizan solos.          │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 * isReal = true  → Vista funcional con UI completa (puede ser mock o real Supabase)
 * isReal = false → Hub de navegación o placeholder; no cuenta como completado
 */

import React from 'react';
import type { MainSection } from '../AdminDashboard';

export interface ManifestEntry {
  /** IDs exactos en MODULES_DATA que esta vista cubre (vacío = hub, no mapea nada) */
  checklistIds: string[];
  /** Sección en AdminDashboard / sidebar */
  section: MainSection;
  /** Nombre del archivo de vista (solo informativo) */
  viewFile: string;
  /** Componente React correspondiente a esta vista */
  component: React.ComponentType<{ onNavigate: (s: MainSection) => void }> | React.ComponentType<{}> | null;
  /** true = vista funcional real | false = hub de navegación o placeholder */
  isReal: boolean;
  /** ¿Conecta con Supabase/backend? */
  hasSupabase?: boolean;
  /** ¿El componente acepta la prop onNavigate? (default: true) */
  acceptsOnNavigate?: boolean;
  /** Nota descriptiva */
  notes?: string;
}

export const MODULE_MANIFEST: ManifestEntry[] = [

  // ══════════════════════════════════════════════════════
  // ADMIN / SISTEMA
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['admin-settings', 'admin-users'],
    section: 'dashboard',
    viewFile: 'DashboardView.tsx',
    component: React.lazy(() => import('../components/admin/views/DashboardView').then(m => ({ default: m.DashboardView }))),
    isReal: true,
    notes: 'Dashboard con métricas, charts y navegación rápida',
  },
  {
    checklistIds: ['admin-settings', 'admin-users'],
    section: 'sistema',
    viewFile: 'SistemaView.tsx',
    component: React.lazy(() => import('../components/admin/views/SistemaView').then(m => ({ default: m.SistemaView }))),
    isReal: true,
    notes: 'Configuración del sistema — hub con cards de config',
  },
  {
    checklistIds: ['admin-users'],
    section: 'departamentos',
    viewFile: 'DepartamentosView.tsx',
    component: React.lazy(() => import('../components/admin/views/DepartamentosView').then(m => ({ default: m.DepartamentosView }))),
    isReal: true,
    notes: 'Gestión de departamentos, roles y permisos',
  },
  {
    checklistIds: ['admin-settings'],
    section: 'checklist',
    viewFile: 'ChecklistView.tsx',
    component: React.lazy(() => import('../components/admin/views/ChecklistView').then(m => ({ default: m.ChecklistView }))),
    isReal: true,
    notes: 'Vista del checklist / roadmap con audit integrado',
  },
  {
    checklistIds: [],
    section: 'diseno',
    viewFile: 'DisenoView.tsx',
    component: React.lazy(() => import('../components/admin/views/DisenoView').then(m => ({ default: m.DisenoView }))),
    isReal: false,
    notes: 'Hub de diseño y branding (tabs de navegación)',
  },

  // ══════════════════════════════════════════════════════
  // BASE DE PERSONAS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['base-personas'],
    section: 'personas',
    viewFile: 'PersonasView.tsx',
    component: React.lazy(() => import('../components/admin/views/PersonasView').then(m => ({ default: m.PersonasView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'CRUD completo de personas físicas y jurídicas',
  },
  {
    checklistIds: ['base-personas'],
    section: 'organizaciones',
    viewFile: 'OrganizacionesView.tsx',
    component: React.lazy(() => import('../components/admin/views/OrganizacionesView').then(m => ({ default: m.OrganizacionesView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'CRUD completo de empresas y organizaciones',
  },
  {
    checklistIds: ['base-personas'],
    section: 'clientes',
    viewFile: 'ClientesView.tsx',
    component: React.lazy(() => import('../components/admin/views/ClientesView').then(m => ({ default: m.ClientesView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Vista filtrada de personas/organizaciones con rol cliente',
  },

  // ══════════════════════════════════════════════════════
  // eCOMMERCE
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'ecommerce',
    viewFile: 'EcommerceView.tsx',
    component: React.lazy(() => import('../components/admin/views/EcommerceView').then(m => ({ default: m.EcommerceView }))),
    isReal: false,
    notes: 'Hub de navegación eCommerce (cards a sub-módulos)',
  },
  {
    checklistIds: ['ecommerce-pedidos'],
    section: 'pedidos',
    viewFile: 'PedidosView.tsx',
    component: React.lazy(() => import('../../modules/pedidos/ui/views/PedidosView').then(m => ({ default: m.PedidosView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'CRUD de pedidos con estados, filtros y árbol madre/hijos',
  },
  {
    checklistIds: ['ecommerce-pedidos'],
    section: 'pagos',
    viewFile: 'PagosView.tsx',
    component: React.lazy(() => import('../components/admin/views/PagosView').then(m => ({ default: m.PagosView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Transacciones y estados de pago operativos',
  },
  {
    checklistIds: ['ecommerce-metodos-pago'],
    section: 'metodos-pago',
    viewFile: 'MetodosPagoView.tsx',
    component: React.lazy(() => import('../components/admin/views/MetodosPagoView').then(m => ({ default: m.MetodosPagoView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Configuración de pasarelas y métodos de pago',
  },
  {
    checklistIds: ['ecommerce-metodos-envio'],
    section: 'metodos-envio',
    viewFile: 'MetodosEnvioView.tsx',
    component: React.lazy(() => import('../components/admin/views/MetodosEnvioView').then(m => ({ default: m.MetodosEnvioView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Configuración de métodos de envío y tarifas',
  },

  // ══════════════════════════════════════════════════════
  // LOGÍSTICA
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-hub'],
    section: 'logistica',
    viewFile: 'LogisticaView.tsx',
    component: React.lazy(() => import('../components/admin/views/LogisticaView').then(m => ({ default: m.LogisticaView }))),
    isReal: false,
    notes: 'Hub con diagrama de flujo logístico 7 pasos y cards a todos los sub-módulos',
  },
  {
    checklistIds: ['logistics-shipping'],
    section: 'envios',
    viewFile: 'EnviosView.tsx',
    component: React.lazy(() => import('../components/admin/views/EnviosView').then(m => ({ default: m.EnviosView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Vista árbol PedidoMadre→EnvíosHijos · estados · multi-tramo · panel detalle + timeline',
  },
  {
    checklistIds: ['logistics-carriers'],
    section: 'transportistas',
    viewFile: 'TransportistasView.tsx',
    component: React.lazy(() => import('../components/admin/views/TransportistasView').then(m => ({ default: m.TransportistasView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Catálogo carriers · tramos y zonas · simulador de tarifas',
  },
  {
    checklistIds: ['logistics-routes'],
    section: 'rutas',
    viewFile: 'RutasView.tsx',
    component: React.lazy(() => import('../components/admin/views/RutasView').then(m => ({ default: m.RutasView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Rutas standard y por proyecto · vista detalle con paradas · progreso de entrega',
  },
  {
    checklistIds: ['logistics-vehiculos'],
    section: 'vehiculos',
    viewFile: 'VehiculosView.tsx',
    component: React.lazy(() =>
      import('../components/admin/views/VehiculosView').then(m => ({ default: m.VehiculosView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Flota de vehículos · asignación a rutas · estado y mantenimiento',
  },
  {
    checklistIds: ['logistics-depositos'],
    section: 'depositos',
    viewFile: 'DepositosView.tsx',
    component: React.lazy(() =>
      import('../components/admin/views/DepositosView').then(m => ({ default: m.DepositosView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Almacenes propios, terceros y cross-docking',
  },
  {
    checklistIds: ['logistics-inventario'],
    section: 'inventario',
    viewFile: 'InventarioView.tsx',
    component: React.lazy(() =>
      import('../components/admin/views/InventarioView').then(m => ({ default: m.InventarioView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Stock por depósito · alertas de mínimo · movimientos entrada/salida',
  },
  {
    checklistIds: ['logistics-entregas'],
    section: 'entregas',
    viewFile: 'EntregasView.tsx',
    component: React.lazy(() =>
      import('../components/admin/views/EntregasView').then(m => ({ default: m.EntregasView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Confirmaciones de entrega · firma · fotos · motivos de no entrega',
  },
  {
    checklistIds: ['logistics-fulfillment'],
    section: 'fulfillment',
    viewFile: 'FulfillmentView.tsx',
    component: React.lazy(() => import('../components/admin/views/FulfillmentView').then(m => ({ default: m.FulfillmentView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Wave picking · lotes · cola de órdenes · empaque · materiales de packaging',
  },
  {
    checklistIds: ['logistics-production'],
    section: 'produccion',
    viewFile: 'ProduccionView.tsx',
    component: React.lazy(() => import('../components/admin/views/ProduccionView').then(m => ({ default: m.ProduccionView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'BOM · órdenes de armado · catálogo de kits / canastas / combos / packs',
  },
  {
    checklistIds: ['logistics-supply'],
    section: 'abastecimiento',
    viewFile: 'AbastecimientoView.tsx',
    component: React.lazy(() => import('../components/admin/views/AbastecimientoView').then(m => ({ default: m.AbastecimientoView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Alertas de stock · OC sugeridas · MRP con cálculo de componentes necesarios',
  },
  {
    checklistIds: ['logistics-map'],
    section: 'mapa-envios',
    viewFile: 'MapaEnviosView.tsx',
    component: React.lazy(() => import('../components/admin/views/MapaEnviosView').then(m => ({ default: m.MapaEnviosView }))),
    isReal: true,
    hasSupabase: false,
    notes: 'Mapa SVG de Uruguay con puntos de envíos activos · filtro por estado · tooltip detalle',
  },
  {
    checklistIds: ['logistics-tracking'],
    section: 'tracking-publico',
    viewFile: 'TrackingPublicoView.tsx',
    component: React.lazy(() => import('../components/admin/views/TrackingPublicoView').then(m => ({ default: m.TrackingPublicoView }))),
    isReal: true,
    hasSupabase: false,
    notes: 'Búsqueda por número de envío · timeline de estados · link público para destinatarios',
  },

  // ══════════════════════════════════════════════════════
  // MARKETING
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'marketing',
    viewFile: 'MarketingView.tsx',
    component: React.lazy(() => import('../components/admin/views/MarketingView').then(m => ({ default: m.MarketingView }))),
    isReal: false,
    notes: 'Hub de navegación Marketing (cards a sub-módulos)',
  },
  {
    checklistIds: ['marketing-campaigns'],
    section: 'google-ads',
    viewFile: 'GoogleAdsView.tsx',
    component: React.lazy(() => import('../components/admin/views/GoogleAdsView').then(m => ({ default: m.GoogleAdsView }))),
    isReal: true,
    notes: 'Dashboard Google Ads con charts recharts, KPIs y tabla de campañas',
  },
  {
    checklistIds: ['marketing-email', 'marketing-email-bulk'],
    section: 'mailing',
    viewFile: 'MailingView.tsx',
    component: React.lazy(() => import('../components/admin/views/MailingView').then(m => ({ default: m.MailingView }))),
    isReal: true,
    hasSupabase: false,
    notes: 'UI completa (5 tabs: Campañas, Suscriptores, Segmentación, A/B Testing, Analíticas) — MOCK DATA. Resend API no conectada aún.',
  },
  {
    checklistIds: ['marketing-seo'],
    section: 'seo',
    viewFile: 'SEOView.tsx',
    component: React.lazy(() => import('../components/admin/views/SEOView').then(m => ({ default: m.SEOView }))),
    isReal: true,
    hasSupabase: false,
    notes: 'Dashboard SEO · Keywords + rankings · análisis on-page de páginas · backlinks · salud SEO · sugerencias IA',
  },
  {
    checklistIds: ['marketing-loyalty'],
    section: 'fidelizacion',
    viewFile: 'FidelizacionView.tsx',
    component: React.lazy(() => import('../components/admin/views/FidelizacionView').then(m => ({ default: m.FidelizacionView }))),
    isReal: true,
    notes: 'Programa de fidelización con niveles y charts',
  },
  {
    checklistIds: ['marketing-loyalty'],
    section: 'rueda-sorteos',
    viewFile: 'RuedaSorteosView.tsx',
    component: React.lazy(() => import('../components/admin/views/RuedaSorteosView').then(m => ({ default: m.RuedaSorteosView }))),
    isReal: true,
    notes: 'Rueda de sorteos interactiva con premios configurables',
  },
  {
    checklistIds: ['rrss-centro-operativo'],
    section: 'redes-sociales',
    viewFile: 'RedesSocialesView.tsx',
    component: React.lazy(() => import('../components/admin/views/RedesSocialesView').then(m => ({ default: m.RedesSocialesView }))),
    isReal: true,
    notes: 'Centro Operativo RRSS — métricas, programación de posts y análisis de audiencia',
  },
  {
    checklistIds: ['rrss-migracion'],
    section: 'migracion-rrss',
    viewFile: 'MigracionRRSSView.tsx',
    component: React.lazy(() => import('../components/admin/views/MigracionRRSSView').then(m => ({ default: m.MigracionRRSSView }))),
    isReal: true,
    notes: 'Herramienta de migración/rebranding Instagram + Facebook',
  },
  {
    checklistIds: ['marketing-etiqueta-emotiva'],
    section: 'etiqueta-emotiva',
    viewFile: 'EtiquetaEmotivaView.tsx',
    component: React.lazy(() => import('../components/admin/views/EtiquetaEmotivaView').then(m => ({ default: m.EtiquetaEmotivaView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Mensajes personalizados con QR para envíos · Supabase + QR real',
  },

  // ══════════════════════════════════════════════════════
  // RRSS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'rrss',
    viewFile: 'RRSSHubView.tsx',
    component: React.lazy(() => import('../components/admin/views/RRSSHubView').then(m => ({ default: m.RRSSHubView }))),
    isReal: false,
    notes: 'Hub de navegación RRSS — Centro Operativo + Migración RRSS',
  },

  // ══════════════════════════════════════════════════════
  // HERRAMIENTAS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'herramientas',
    viewFile: 'HerramientasView.tsx',
    component: React.lazy(() => import('../components/admin/views/HerramientasView').then(m => ({ default: m.HerramientasView }))),
    isReal: false,
    notes: 'Hub de navegación — 6 workspace tools + 3 herramientas rápidas',
  },
  {
    checklistIds: ['tools-library'],
    section: 'biblioteca',
    viewFile: 'BibliotecaWorkspace.tsx',
    component: React.lazy(() => import('../components/admin/views/BibliotecaWorkspace').then(m => ({ default: m.BibliotecaWorkspace }))),
    isReal: true,
    hasSupabase: false,
    notes: 'Biblioteca de assets — upload drag&drop, colecciones, tags, grid/lista, export',
  },
  {
    checklistIds: ['tools-image-editor'],
    section: 'editor-imagenes',
    viewFile: 'EditorImagenesWorkspace.tsx',
    component: React.lazy(() => import('../components/admin/views/EditorImagenesWorkspace').then(m => ({ default: m.EditorImagenesWorkspace }))),
    isReal: true,
    hasSupabase: false,
    notes: 'Editor de imágenes — filtros CSS, rotación, flip, 8 presets, export PNG/JPG',
  },
  {
    checklistIds: ['tools-documents'],
    section: 'gen-documentos',
    viewFile: 'GenDocumentosWorkspace.tsx',
    component: React.lazy(() => import('../components/admin/views/GenDocumentosWorkspace').then(m => ({ default: m.GenDocumentosWorkspace }))),
    isReal: true,
    hasSupabase: false,
    notes: 'Generador de documentos WYSIWYG — 8 tipos de bloque, A4, export PDF',
  },
  {
    checklistIds: ['tools-quotes'],
    section: 'gen-presupuestos',
    viewFile: 'GenPresupuestosWorkspace.tsx',
    component: React.lazy(() => import('../components/admin/views/GenPresupuestosWorkspace').then(m => ({ default: m.GenPresupuestosWorkspace }))),
    isReal: true,
    hasSupabase: false,
    notes: 'Generador de presupuestos — ítems, IVA, descuentos, multi-moneda, export PDF',
  },
  {
    checklistIds: ['tools-ocr'],
    section: 'ocr',
    viewFile: 'OCRWorkspace.tsx',
    component: React.lazy(() => import('../components/admin/views/OCRWorkspace').then(m => ({ default: m.OCRWorkspace }))),
    isReal: true,
    hasSupabase: false,
    notes: 'OCR con Tesseract.js — 100% browser, sin API key, Español/Inglés/PT, export TXT',
  },
  {
    checklistIds: ['tools-print'],
    section: 'impresion',
    viewFile: 'ImpresionWorkspace.tsx',
    component: React.lazy(() => import('../components/admin/views/ImpresionWorkspace').then(m => ({ default: m.ImpresionWorkspace }))),
    isReal: true,
    hasSupabase: false,
    notes: 'Módulo de impresión — cola de trabajos, A4 preview, papel/orientación/color/calidad',
  },
  {
    checklistIds: ['tools-qr'],
    section: 'qr-generator',
    viewFile: 'QrGeneratorView.tsx',
    component: React.lazy(() => import('../components/admin/views/QrGeneratorView').then(m => ({ default: m.QrGeneratorView }))),
    isReal: true,
    notes: 'Generador QR — sin APIs externas, genera PNG y SVG vectorial',
  },
  {
    checklistIds: ['tools-ideas-board'],
    section: 'ideas-board',
    viewFile: 'IdeasBoardView.tsx',
    component: React.lazy(() => import('../components/admin/views/IdeasBoardView').then(m => ({ default: m.IdeasBoardView }))),
    isReal: true,
    hasSupabase: true,
    notes: 'Canvas visual de módulos e ideas — stickers, conectores, canvases jerárquicos, lamparita en Mi Vista',
  },

  // ══════════════════════════════════════════════════════
  // ERP
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'gestion',
    viewFile: 'GestionView.tsx',
    component: React.lazy(() => import('../components/admin/views/GestionView').then(m => ({ default: m.GestionView }))),
    isReal: false,
    notes: 'Hub de navegación ERP (cards a Inventario, Facturación, Compras, CRM, etc.)',
  },
  {
    checklistIds: ['erp-inventory'],
    section: 'erp-inventario',
    viewFile: 'ERPInventarioView.tsx',
    component: React.lazy(() => import('../components/admin/views/ERPInventarioView').then(m => ({ default: m.ERPInventarioView }))),
    isReal: true,
    notes: 'Inventario con tabs: Artículos, Stock, Movimientos, Alertas',
  },
  {
    checklistIds: ['erp-invoicing'],
    section: 'erp-facturacion',
    viewFile: 'ERPFacturacionView.tsx',
    component: React.lazy(() => import('../components/admin/views/ERPFacturacionView').then(m => ({ default: m.ERPFacturacionView }))),
    isReal: true,
    notes: 'Facturación con tabs: Facturas, Tickets, Nueva factura',
  },
  {
    checklistIds: ['erp-purchasing'],
    section: 'erp-compras',
    viewFile: 'ERPComprasView.tsx',
    component: React.lazy(() => import('../components/admin/views/ERPComprasView').then(m => ({ default: m.ERPComprasView }))),
    isReal: true,
    notes: 'Compras con tabs: Órdenes, Proveedores, Nueva orden',
  },
  {
    checklistIds: ['crm-contacts', 'crm-opportunities', 'crm-activities'],
    section: 'erp-crm',
    viewFile: 'ERPCRMView.tsx',
    component: React.lazy(() => import('../components/admin/views/ERPCRMView').then(m => ({ default: m.ERPCRMView }))),
    isReal: true,
    notes: 'CRM completo: Contactos, Pipeline de oportunidades, Actividades y seguimiento',
  },
  {
    checklistIds: ['erp-accounting'],
    section: 'erp-contabilidad',
    viewFile: 'ERPContabilidadView.tsx',
    component: React.lazy(() => import('../components/admin/views/ERPContabilidadView').then(m => ({ default: m.ERPContabilidadView }))),
    isReal: true,
    notes: 'Contabilidad: Plan de cuentas, Asientos, Cobrar/Pagar, Bancos',
  },
  {
    checklistIds: ['erp-hr'],
    section: 'erp-rrhh',
    viewFile: 'ERPRRHHView.tsx',
    component: React.lazy(() => import('../components/admin/views/ERPRRHHView').then(m => ({ default: m.ERPRRHHView }))),
    isReal: true,
    notes: 'RRHH: Empleados, Asistencia y Nómina',
  },

  // ══════════════════════════════════════════════════════
  // PROYECTOS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['projects-management', 'projects-tasks', 'projects-time'],
    section: 'proyectos',
    viewFile: 'ProyectosView.tsx',
    component: React.lazy(() => import('../components/admin/views/ProyectosView').then(m => ({ default: m.ProyectosView }))),
    isReal: true,
    notes: 'Proyectos con Gantt simplificado y tablero Kanban',
  },

  // ══════════════════════════════════════════════════════
  // MARKETPLACE
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['marketplace-secondhand', 'marketplace-secondhand-mediacion'],
    section: 'secondhand',
    viewFile: 'SecondHandView.tsx',
    component: React.lazy(() => import('../components/admin/views/SecondHandView').then(m => ({ default: m.SecondHandView }))),
    isReal: true,
    notes: 'Marketplace Segunda Mano: Estadísticas, Moderación, Publicaciones y ⚖️ Mediación de disputas',
  },
  {
    checklistIds: ['marketplace-storefront'],
    section: 'storefront',
    viewFile: 'StorefrontAdminView.tsx',
    component: null, // StorefrontAdminView no está importado en AdminDashboard, se omite por ahora
    isReal: true,
    notes: 'Panel de acceso rápido al storefront público con stats y links',
  },

  // ══════════════════════════════════════════════════════
  // INTEGRACIONES
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [
      'integrations-mercadolibre',
      'integrations-mercadopago',
      'integrations-plexo',
      'integrations-paypal',
      'integrations-stripe',
      'integrations-meta',
      'integrations-twilio',
    ],
    section: 'integraciones',
    viewFile: 'IntegracionesView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesView').then(m => ({ default: m.IntegracionesView }))),
    isReal: true,
    notes: 'Hub de 5 módulos de integración — Uruguay first, Latam progresivo',
  },
  {
    checklistIds: ['integrations-plexo', 'integrations-mercadopago', 'integrations-paypal', 'integrations-stripe'],
    section: 'integraciones-pagos',
    viewFile: 'IntegracionesPagosView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesPagosView').then(m => ({ default: m.IntegracionesPagosView }))),
    isReal: true,
    notes: '💳 Pasarela de pagos — Plexo, OCA, Abitab, RedPagos, MP, PayPal, Stripe',
  },
  {
    checklistIds: ['integrations-logistics'],
    section: 'integraciones-logistica',
    viewFile: 'IntegracionesLogisticaView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesLogisticaView').then(m => ({ default: m.IntegracionesLogisticaView }))),
    isReal: true,
    notes: '🚚 Logística — Carriers con y sin API. URL de tracking configurable para carriers sin API',
  },
  {
    checklistIds: ['integrations-mercadolibre'],
    section: 'integraciones-tiendas',
    viewFile: 'IntegracionesTiendasView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesTiendasView').then(m => ({ default: m.IntegracionesTiendasView }))),
    isReal: true,
    notes: '🏪 Tiendas — ML, TiendaNube, WooCommerce, Shopify, VTEX, Magento',
  },
  {
    checklistIds: ['integrations-meta'],
    section: 'integraciones-rrss',
    viewFile: 'IntegracionesRRSSView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesRRSSView').then(m => ({ default: m.IntegracionesRRSSView }))),
    isReal: true,
    notes: '📱 Redes Sociales — Meta, Instagram Shopping, WhatsApp, Facebook Shops, TikTok, Pinterest',
  },
  {
    checklistIds: ['integrations-twilio'],
    section: 'integraciones-servicios',
    viewFile: 'IntegracionesServiciosView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesServiciosView').then(m => ({ default: m.IntegracionesServiciosView }))),
    isReal: true,
    notes: '⚙️ Servicios — Twilio, Resend, SendGrid, GA4, GTM, Zapier, n8n',
  },
  {
    checklistIds: [],
    section: 'integraciones-marketplace',
    viewFile: 'IntegracionesMarketplaceView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesMarketplaceView').then(m => ({ default: m.IntegracionesMarketplaceView }))),
    isReal: true,
    notes: 'Marketplace integrations',
  },
  {
    checklistIds: [],
    section: 'integraciones-comunicacion',
    viewFile: 'IntegracionesComunicacionView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesComunicacionView').then(m => ({ default: m.IntegracionesComunicacionView }))),
    isReal: true,
    notes: 'Comunicación integrations',
  },
  {
    checklistIds: [],
    section: 'integraciones-identidad',
    viewFile: 'IntegracionesIdentidadView.tsx',
    component: React.lazy(() => import('../components/admin/views/IntegracionesIdentidadView').then(m => ({ default: m.IntegracionesIdentidadView }))),
    isReal: true,
    notes: 'Identidad integrations',
  },
  {
    checklistIds: [],
    section: 'integraciones-api-keys',
    viewFile: 'APIKeysView.tsx',
    component: React.lazy(() => import('../components/admin/views/APIKeysView').then(m => ({ default: m.APIKeysView }))),
    isReal: true,
    notes: 'API Keys management',
  },
  {
    checklistIds: [],
    section: 'integraciones-webhooks',
    viewFile: 'WebhooksView.tsx',
    component: React.lazy(() => import('../components/admin/views/WebhooksView').then(m => ({ default: m.WebhooksView }))),
    isReal: true,
    notes: 'Webhooks management',
  },
  // ══════════════════════════════════════════════════════
  // AUDITORÍA & DIAGNÓSTICO
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['audit-hub'],
    section: 'auditoria',
    viewFile: 'AuditoriaHubView.tsx',
    component: React.lazy(() => import('../components/admin/views/AuditoriaHubView').then(m => ({ default: m.AuditoriaHubView }))),
    isReal: true,
    hasSupabase: false,
    notes: '🔍 Hub Auditoría — métricas de estado, diagnóstico rápido y acceso a todas las herramientas',
  },
  {
    checklistIds: ['audit-health'],
    section: 'auditoria-health',
    viewFile: 'HealthMonitorView.tsx',
    component: React.lazy(() => import('../components/admin/views/HealthMonitorView').then(m => ({ default: m.HealthMonitorView }))),
    isReal: true,
    hasSupabase: true,
    notes: '💚 Health Monitor — verifica en tiempo real Supabase DB/Auth/Edge/KV/Storage + APIs externas',
  },
  {
    checklistIds: ['audit-logs'],
    section: 'auditoria-logs',
    viewFile: 'SystemLogsView.tsx',
    component: React.lazy(() => import('../components/admin/views/SystemLogsView').then(m => ({ default: m.SystemLogsView }))),
    isReal: true,
    hasSupabase: false,
    notes: '📜 Logs del Sistema — registro de actividad, errores y eventos con filtros y export TXT',
  },
  {
    checklistIds: ['audit-apis-repo'],
    section: 'integraciones-apis',
    viewFile: 'RepositorioAPIsView.tsx',
    component: React.lazy(() => import('../components/admin/views/RepositorioAPIsView').then(m => ({ default: m.RepositorioAPIsView }))),
    isReal: true,
    hasSupabase: false,
    notes: '📡 Repositorio centralizado — 23 APIs con estado, credenciales, docs y test de conexión',
  },

  // ══════════════════════════════════════════════════════
  // MÓDULOS ADICIONALES
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'pos',
    viewFile: 'POSView.tsx',
    component: React.lazy(() => import('../components/admin/views/POSView').then(m => ({ default: m.POSView }))),
    isReal: true,
    notes: 'Punto de Venta',
  },
  {
    checklistIds: ['admin-settings'],
    section: 'roadmap',
    viewFile: 'ChecklistView.tsx',
    component: React.lazy(() => import('../components/admin/views/ChecklistView').then(m => ({ default: m.ChecklistView }))),
    isReal: true,
    notes: 'Roadmap (alias de checklist)',
  },
  {
    checklistIds: [],
    section: 'constructor',
    viewFile: 'ConstructorView.tsx',
    component: React.lazy(() => import('../components/admin/views/ConstructorView').then(m => ({ default: m.ConstructorView }))),
    isReal: true,
    notes: 'Constructor de módulos',
  },
  {
    checklistIds: [],
    section: 'auth-registro',
    viewFile: 'AuthRegistroView.tsx',
    component: React.lazy(() => import('../components/admin/views/AuthRegistroView').then(m => ({ default: m.AuthRegistroView }))),
    isReal: true,
    notes: 'Autenticación y registro',
  },
  {
    checklistIds: [],
    section: 'carga-masiva',
    viewFile: 'CargaMasivaView.tsx',
    component: React.lazy(() => import('../components/admin/views/CargaMasivaView').then(m => ({ default: m.CargaMasivaView }))),
    isReal: true,
    notes: 'Carga masiva de datos',
  },
  {
    checklistIds: [],
    section: 'meta-business',
    viewFile: 'MetaBusinessView.tsx',
    component: React.lazy(() => import('../components/admin/views/MetaBusinessView').then(m => ({ default: m.MetaBusinessView }))),
    isReal: true,
    notes: 'Meta Business integration',
  },
  {
    checklistIds: [],
    section: 'unified-workspace',
    viewFile: 'UnifiedWorkspaceView.tsx',
    component: React.lazy(() => import('../components/admin/views/UnifiedWorkspaceView').then(m => ({ default: m.UnifiedWorkspaceView }))),
    isReal: true,
    notes: 'Workspace unificado',
  },
  {
    checklistIds: [],
    section: 'dashboard-admin',
    viewFile: 'AdminDashboardView.tsx',
    component: React.lazy(() => import('../components/admin/views/AdminDashboardView').then(m => ({ default: m.AdminDashboardView }))),
    isReal: true,
    notes: 'Dashboard de administración',
  },
  {
    checklistIds: [],
    section: 'dashboard-usuario',
    viewFile: 'UserDashboardView.tsx',
    component: React.lazy(() => import('../components/admin/views/UserDashboardView').then(m => ({ default: m.UserDashboardView }))),
    isReal: true,
    notes: 'Dashboard de usuario',
  },
  {
    checklistIds: [],
    section: 'config-vistas',
    viewFile: 'ConfigVistasPorRolView.tsx',
    component: React.lazy(() => import('../components/admin/views/ConfigVistasPorRolView').then(m => ({ default: m.ConfigVistasPorRolView }))),
    isReal: true,
    notes: 'Configuración de vistas por rol',
  },
  {
    checklistIds: [],
    section: 'documentacion',
    viewFile: 'DocumentacionView.tsx',
    component: React.lazy(() => import('../components/admin/views/DocumentacionView').then(m => ({ default: m.DocumentacionView }))),
    isReal: true,
    notes: 'Documentación del sistema',
  },
  {
    checklistIds: [],
    section: 'metamap-config',
    viewFile: 'MetaMapView.tsx',
    component: React.lazy(() => import('../components/admin/views/MetaMapView').then(m => ({ default: m.MetaMapView }))),
    isReal: true,
    notes: 'Configuración Meta Map',
  },
  {
    checklistIds: [],
    section: 'google-maps-test',
    viewFile: 'GoogleMapsTestView.tsx',
    component: React.lazy(() => import('../components/admin/views/GoogleMapsTestView').then(m => ({ default: m.GoogleMapsTestView }))),
    isReal: true,
    acceptsOnNavigate: false,
    notes: 'Test de Google Maps',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS (consumidos por moduleRegistry y AuditPanel)
// ─────────────────────────────────────────────────────────────────────────────

/** Set de todos los checklistIds cubiertos por vistas reales */
export const REAL_CHECKLIST_IDS = new Set<string>(
  MODULE_MANIFEST.filter(e => e.isReal).flatMap(e => e.checklistIds)
);

/** Map sección → entry del manifest */
export const MANIFEST_BY_SECTION = new Map<MainSection, ManifestEntry>(
  MODULE_MANIFEST.map(e => [e.section, e])
);