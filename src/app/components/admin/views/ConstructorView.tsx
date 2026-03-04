/* =====================================================
   ConstructorView — Generador de proyectos
   ===================================================== */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../../utils/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Cliente de Charlie — donde vive tenant_config
const charlieSupabase = createClient(
  'https://qhnmxvexkizcsmivfuam.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobm14dmV4a2l6Y3NtaXZmdWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjEyODEsImV4cCI6MjA4Njc5NzI4MX0.Ifz4fJYldIGZFzhBK5PPxQeqdYzO2ZKNQ5uo8j2mYmM'
);
import { createPortal } from 'react-dom';
import {
  Blocks, ShoppingCart, Truck, Megaphone, Rss, Wrench,
  Database, Monitor, Plug, Search, Check, ChevronRight,
  ChevronDown, ChevronUp, Info, LogIn, Upload, Store,
  LayoutGrid, CreditCard, Download, Copy, CheckCheck,
  ExternalLink, Rocket, Palette, Globe, FileJson, Home,
  Save, FolderOpen, Clock, Trash2, ArrowRight, Minus,
  Zap, Settings2, Users, BarChart3, Bell, Shield, MapPin, X,
} from 'lucide-react';
import type { MainSection } from '../../../AdminDashboard';

interface Props { onNavigate: (s: MainSection) => void; }

/* ── Design tokens ── */
const C = {
  orange:        '#FF6835',
  orangeHover:   '#F05520',
  orange10:      '#FFF4F0',
  orange20:      '#FFE8DF',
  gray50:        '#F8FAFC',
  gray100:       '#F1F5F9',
  gray200:       '#E2E8F0',
  gray300:       '#CBD5E1',
  gray400:       '#94A3B8',
  gray500:       '#64748B',
  gray600:       '#475569',
  gray700:       '#334155',
  gray900:       '#0F172A',
  white:         '#FFFFFF',
  green:         '#10B981',
  green10:       '#F0FDF4',
  amber:         '#F59E0B',
  amber10:       '#FFFBEB',
  red:           '#EF4444',
  code:          '#0D1117',
};

const STORAGE_KEY = 'charlie_constructor_v15';

/* ── Types ── */
interface SubOption { id: string; label: string; badge?: string; envVars?: string[]; }
interface Module {
  id: string; label: string; description: string; icon: React.ElementType;
  category: string; envVars?: string[]; required?: boolean; subOptions?: SubOption[];
}
interface HomeSection {
  id: string; label: string; icon: React.ElementType; enabled: boolean;
  requiresModule?: string; description: string;
}
interface StorefrontPage {
  id: string; path: string; label: string; icon: React.ElementType;
  enabled: boolean; requiresModule?: string; alwaysOn?: boolean;
}

/* ── Sub-opciones ── */
const SUBS_PAGOS: SubOption[] = [
  { id: 'mercadopago',   label: 'MercadoPago',    badge: 'UY',     envVars: ['VITE_MP_ACCESS_TOKEN', 'VITE_MP_PUBLIC_KEY', 'VITE_MP_CLIENT_ID'] },
  { id: 'plexo',         label: 'Plexo',           badge: 'UY',     envVars: ['VITE_PLEXO_API_KEY', 'VITE_PLEXO_SECRET'] },
  { id: 'paypal',        label: 'PayPal',           badge: 'Global', envVars: ['VITE_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'] },
  { id: 'transferencia', label: 'Transferencia',    badge: 'UY',     envVars: ['VITE_CBU_DESTINO', 'VITE_ALIAS_DESTINO'] },
];
const SUBS_LOGISTICA: SubOption[] = [
  { id: 'oddy',     label: 'ODDY',              badge: 'UY',     envVars: ['VITE_ODDY_API_KEY'] },
  { id: 'dac',      label: 'DAC',               badge: 'UY',     envVars: ['VITE_DAC_API_KEY'] },
  { id: 'agencia',  label: 'Agencia',           badge: 'UY',     envVars: ['VITE_AGENCIA_API_KEY'] },
  { id: 'dhl',      label: 'DHL',               badge: 'Global', envVars: ['VITE_DHL_ACCOUNT', 'VITE_DHL_API_KEY'] },
  { id: 'pickup',   label: 'Retiro en tienda',  badge: 'Local',  envVars: [] },
];
const SUBS_TIENDAS: SubOption[] = [
  { id: 'mercadolibre', label: 'MercadoLibre', badge: 'LATAM',  envVars: ['VITE_ML_APP_ID', 'VITE_ML_CLIENT_SECRET', 'VITE_ML_ACCESS_TOKEN'] },
  { id: 'tiendanube',   label: 'Tiendanube',   badge: 'LATAM',  envVars: ['VITE_TN_TOKEN', 'VITE_TN_STORE_ID', 'VITE_TN_USER_ID'] },
  { id: 'woocommerce',  label: 'WooCommerce',  badge: 'Global', envVars: ['VITE_WOO_URL', 'VITE_WOO_CK', 'VITE_WOO_CS'] },
  { id: 'shopify',      label: 'Shopify',      badge: 'Global', envVars: ['VITE_SHOPIFY_STORE', 'VITE_SHOPIFY_ACCESS_TOKEN', 'VITE_SHOPIFY_API_KEY'] },
  { id: 'amazon',       label: 'Amazon SP',    badge: 'Global', envVars: ['VITE_AMAZON_SELLER_ID', 'VITE_AMAZON_MWS_TOKEN'] },
];
const SUBS_RRSS: SubOption[] = [
  { id: 'facebook',  label: 'Facebook / Meta', badge: 'Meta',      envVars: ['VITE_META_APP_ID', 'VITE_META_APP_SECRET', 'VITE_META_ACCESS_TOKEN'] },
  { id: 'instagram', label: 'Instagram',        badge: 'Meta',      envVars: ['VITE_META_APP_ID', 'VITE_META_PIXEL_ID'] },
  { id: 'tiktok',    label: 'TikTok',           badge: 'ByteDance', envVars: ['VITE_TIKTOK_CLIENT_KEY', 'VITE_TIKTOK_CLIENT_SECRET'] },
  { id: 'twitter',   label: 'Twitter / X',      badge: 'X',         envVars: ['VITE_TWITTER_API_KEY', 'VITE_TWITTER_API_SECRET'] },
  { id: 'linkedin',  label: 'LinkedIn',         badge: 'MSFT',      envVars: ['VITE_LINKEDIN_CLIENT_ID', 'VITE_LINKEDIN_CLIENT_SECRET'] },
  { id: 'youtube',   label: 'YouTube',          badge: 'Google',    envVars: ['VITE_YOUTUBE_API_KEY', 'VITE_YOUTUBE_CHANNEL_ID'] },
];
const SUBS_SERVICIOS: SubOption[] = [
  { id: 'google-analytics', label: 'Google Analytics',  badge: 'Google',     envVars: ['VITE_GA_MEASUREMENT_ID'] },
  { id: 'google-maps',      label: 'Google Maps',        badge: 'Google',     envVars: ['VITE_MAPS_API_KEY'] },
  { id: 'whatsapp',         label: 'WhatsApp Business',  badge: 'Meta',       envVars: ['VITE_WA_TOKEN', 'VITE_WA_PHONE_NUMBER_ID', 'VITE_WA_BUSINESS_ID'] },
  { id: 'slack',            label: 'Slack',              badge: 'Salesforce', envVars: ['VITE_SLACK_WEBHOOK_URL', 'VITE_SLACK_BOT_TOKEN'] },
  { id: 'mailchimp',        label: 'Mailchimp',          badge: 'Intuit',     envVars: ['VITE_MAILCHIMP_API_KEY', 'VITE_MAILCHIMP_LIST_ID'] },
  { id: 'sendgrid',         label: 'SendGrid',           badge: 'Twilio',     envVars: ['SENDGRID_API_KEY', 'VITE_SENDGRID_FROM'] },
  { id: 'brevo',            label: 'Brevo',              badge: 'EU',         envVars: ['BREVO_API_KEY'] },
  { id: 'resend',           label: 'Resend',             badge: 'Vercel',     envVars: ['RESEND_API_KEY', 'VITE_RESEND_FROM'] },
  { id: 'twilio',           label: 'Twilio SMS',         badge: 'Twilio',     envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'VITE_TWILIO_FROM'] },
  { id: 'metamap',          label: 'Metamap',            badge: 'KYC',        envVars: ['VITE_METAMAP_CLIENT_ID', 'VITE_METAMAP_CLIENT_SECRET', 'VITE_METAMAP_FLOW_ID'] },
];
const SUBS_MAILING: SubOption[] = [
  { id: 'sendgrid',  label: 'SendGrid',  badge: 'Twilio', envVars: ['SENDGRID_API_KEY', 'VITE_SENDGRID_FROM'] },
  { id: 'mailchimp', label: 'Mailchimp', badge: 'Intuit', envVars: ['VITE_MAILCHIMP_API_KEY', 'VITE_MAILCHIMP_LIST_ID'] },
  { id: 'brevo',     label: 'Brevo',     badge: 'EU',     envVars: ['BREVO_API_KEY', 'VITE_BREVO_LIST_ID'] },
  { id: 'resend',    label: 'Resend',    badge: 'Vercel', envVars: ['RESEND_API_KEY', 'VITE_RESEND_FROM'] },
];
const SUBS_AUTH: SubOption[] = [
  { id: 'email',    label: 'Email + Password', badge: 'Base',     envVars: [] },
  { id: 'google',   label: 'Google OAuth',     badge: 'Google',   envVars: ['VITE_GOOGLE_CLIENT_ID', 'VITE_GOOGLE_CLIENT_SECRET'] },
  { id: 'facebook', label: 'Facebook OAuth',   badge: 'Meta',     envVars: ['VITE_META_APP_ID', 'VITE_META_APP_SECRET'] },
  { id: 'github',   label: 'GitHub OAuth',     badge: 'GitHub',   envVars: ['VITE_GITHUB_CLIENT_ID', 'VITE_GITHUB_CLIENT_SECRET'] },
  { id: 'magic',    label: 'Magic Link',       badge: 'Supabase', envVars: [] },
];

const MODULES: Module[] = [
  { id: 'ecommerce',         label: 'eCommerce Hub',          description: 'Catálogo, productos, storefront y pedidos',         icon: ShoppingCart, category: 'eCommerce',     envVars: ['VITE_STORE_NAME', 'VITE_CURRENCY'] },
  { id: 'clientes',          label: 'Clientes',               description: 'Gestión de clientes y contactos',                   icon: Database,     category: 'eCommerce' },
  { id: 'pedidos',           label: 'Pedidos',                description: 'Gestión y seguimiento de órdenes',                  icon: ShoppingCart, category: 'eCommerce' },
  { id: 'metodos-pago',      label: 'Métodos de Pago',        description: 'Pasarelas de pago para el checkout',               icon: CreditCard,   category: 'eCommerce',     subOptions: SUBS_PAGOS },
  { id: 'metodos-envio',     label: 'Métodos de Envío',       description: 'Transportistas y tarifas de envío',                icon: Truck,        category: 'eCommerce',     subOptions: SUBS_LOGISTICA },
  { id: 'secondhand',        label: 'Segunda Mano',           description: 'Módulo de productos de segunda mano',               icon: ShoppingCart, category: 'eCommerce' },
  { id: 'logistica',         label: 'Logística Hub',          description: 'Centro de operaciones logísticas',                  icon: Truck,        category: 'Logística' },
  { id: 'fulfillment',       label: 'Fulfillment',            description: 'Gestión de preparación y despacho',                 icon: Truck,        category: 'Logística' },
  { id: 'transportistas',    label: 'Transportistas',         description: 'Gestión de transportistas y flotas',                icon: Truck,        category: 'Logística' },
  { id: 'rutas',             label: 'Rutas',                  description: 'Planificación y optimización de rutas',             icon: Truck,        category: 'Logística' },
  { id: 'mapa-envios',       label: 'Mapa de Envíos',         description: 'Visualización geográfica de envíos',                icon: Truck,        category: 'Logística',     envVars: ['VITE_MAPS_API_KEY'] },
  { id: 'tracking-publico',  label: 'Tracking Público',       description: 'Página pública de seguimiento de pedidos',          icon: Search,       category: 'Logística' },
  { id: 'marketing',         label: 'Marketing Hub',          description: 'Centro de marketing digital',                       icon: Megaphone,    category: 'Marketing' },
  { id: 'mailing',           label: 'Mailing',                description: 'Campañas de email marketing',                      icon: Megaphone,    category: 'Marketing',     subOptions: SUBS_MAILING },
  { id: 'google-ads',        label: 'Google Ads',             description: 'Gestión de campañas de Google Ads',                icon: Megaphone,    category: 'Marketing',     envVars: ['VITE_GOOGLE_ADS_ID'] },
  { id: 'seo',               label: 'SEO',                    description: 'Optimización para buscadores',                      icon: Search,       category: 'Marketing' },
  { id: 'fidelizacion',      label: 'Fidelización',           description: 'Programas de puntos y recompensas',                 icon: Megaphone,    category: 'Marketing' },
  { id: 'rueda-sorteos',     label: 'Rueda de Sorteos',       description: 'Gamificación y sorteos interactivos',               icon: Megaphone,    category: 'Marketing' },
  { id: 'etiqueta-emotiva',  label: 'Etiqueta Emotiva',       description: 'Generador de etiquetas con IA emotiva',             icon: Megaphone,    category: 'Marketing',     envVars: ['VITE_AI_API_KEY'] },
  { id: 'rrss',              label: 'RRSS Hub',               description: 'Gestión de redes sociales',                         icon: Rss,          category: 'RRSS' },
  { id: 'redes-sociales',    label: 'Redes Sociales',         description: 'Publicación y programación de contenido',           icon: Rss,          category: 'RRSS' },
  { id: 'migracion-rrss',    label: 'Migración RRSS',         description: 'Migración de contenido entre plataformas',          icon: Rss,          category: 'RRSS' },
  { id: 'gestion',           label: 'Gestión Hub',            description: 'ERP, CRM y gestión empresarial',                   icon: Database,     category: 'Gestión' },
  { id: 'erp-inventario',    label: 'ERP Inventario',         description: 'Control de stock e inventario',                    icon: Database,     category: 'Gestión' },
  { id: 'erp-facturacion',   label: 'ERP Facturación',        description: 'Facturación electrónica y comprobantes',           icon: Database,     category: 'Gestión' },
  { id: 'erp-compras',       label: 'ERP Compras',            description: 'Gestión de compras y proveedores',                 icon: Database,     category: 'Gestión' },
  { id: 'erp-crm',           label: 'ERP CRM',                description: 'Gestión de relaciones con clientes',               icon: Database,     category: 'Gestión' },
  { id: 'erp-contabilidad',  label: 'ERP Contabilidad',       description: 'Contabilidad y reportes financieros',              icon: Database,     category: 'Gestión' },
  { id: 'erp-rrhh',          label: 'ERP RRHH',               description: 'Recursos humanos y nómina',                        icon: Database,     category: 'Gestión' },
  { id: 'proyectos',         label: 'Proyectos',              description: 'Gestión de proyectos y tareas',                    icon: Database,     category: 'Gestión' },
  { id: 'produccion',        label: 'Producción',             description: 'Control de producción y manufactura',              icon: Database,     category: 'Gestión' },
  { id: 'abastecimiento',    label: 'Abastecimiento',         description: 'Cadena de suministro y abastecimiento',            icon: Database,     category: 'Gestión' },
  { id: 'departamentos',     label: 'Departamentos',          description: 'Estructura organizacional',                        icon: Database,     category: 'Gestión' },
  { id: 'personas',          label: 'Personas',               description: 'Directorio de personas y contactos',              icon: Database,     category: 'Gestión' },
  { id: 'organizaciones',    label: 'Organizaciones',         description: 'Gestión de organizaciones y empresas',             icon: Database,     category: 'Gestión' },
  { id: 'herramientas',      label: 'Herramientas Hub',       description: 'Suite de herramientas internas',                   icon: Wrench,       category: 'Herramientas' },
  { id: 'qr-generator',      label: 'QR Generator',           description: 'Generador de códigos QR',                          icon: Wrench,       category: 'Herramientas' },
  { id: 'pos',               label: 'POS',                    description: 'Punto de venta físico',                            icon: Wrench,       category: 'Herramientas' },
  { id: 'diseno',            label: 'Diseño',                 description: 'Herramientas de diseño y creatividad',             icon: Wrench,       category: 'Herramientas' },
  { id: 'biblioteca',        label: 'Biblioteca',             description: 'Repositorio de archivos y recursos',               icon: Wrench,       category: 'Herramientas', envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] },
  { id: 'editor-imagenes',   label: 'Editor de Imágenes',     description: 'Editor de imágenes integrado',                    icon: Wrench,       category: 'Herramientas' },
  { id: 'gen-documentos',    label: 'Generador Docs',         description: 'Generación automática de documentos',              icon: Wrench,       category: 'Herramientas' },
  { id: 'gen-presupuestos',  label: 'Generador Presupuestos', description: 'Cotizaciones y presupuestos',                     icon: Wrench,       category: 'Herramientas' },
  { id: 'ocr',               label: 'OCR',                    description: 'Reconocimiento óptico de caracteres',              icon: Wrench,       category: 'Herramientas', envVars: ['VITE_OCR_API_KEY'] },
  { id: 'impresion',         label: 'Impresión',              description: 'Gestión de impresión y etiquetas',                 icon: Wrench,       category: 'Herramientas' },
  { id: 'checklist',         label: 'Checklist',              description: 'Listas de verificación y procesos',                icon: Wrench,       category: 'Herramientas' },
  { id: 'ideas-board',       label: 'Ideas Board',            description: 'Tablero de ideas y brainstorming',                 icon: Wrench,       category: 'Herramientas' },
  { id: 'sistema',           label: 'Sistema Hub',            description: 'Configuración del sistema',                        icon: Monitor,      category: 'Sistema',       required: true },
  { id: 'usuarios-roles',    label: 'Usuarios y Roles',       description: 'Gestión de usuarios, permisos y acceso',           icon: Users,        category: 'Sistema' },
  { id: 'configuracion',     label: 'Configuración Global',   description: 'Parámetros globales del sistema',                  icon: Settings2,    category: 'Sistema' },
  { id: 'analytics-bi',      label: 'Analytics & BI',         description: 'Reportes, dashboards y análisis de datos',         icon: BarChart3,    category: 'Sistema' },
  { id: 'notificaciones',    label: 'Notificaciones',         description: 'Centro de notificaciones push, email y in-app',    icon: Bell,         category: 'Sistema' },
  { id: 'multi-pais',        label: 'Multi-País',             description: 'Configuración multi-tenant y multi-territorio',    icon: MapPin,       category: 'Sistema',       envVars: ['VITE_DEFAULT_COUNTRY', 'VITE_DEFAULT_CURRENCY', 'VITE_DEFAULT_LOCALE'] },
  { id: 'permisos',          label: 'Permisos & Seguridad',   description: 'RLS, políticas de acceso y auditoría de seguridad',icon: Shield,       category: 'Sistema' },
  { id: 'auditoria',         label: 'Auditoría',              description: 'Logs y monitoreo del sistema',                     icon: Search,       category: 'Sistema' },
  { id: 'integraciones',             label: 'Integraciones Hub',    description: 'Centro de integraciones externas',          icon: Plug,         category: 'Integraciones' },
  { id: 'integraciones-pagos',       label: 'Integr. Pagos',        description: 'Pasarelas de pago externas',                icon: CreditCard,   category: 'Integraciones', subOptions: SUBS_PAGOS },
  { id: 'integraciones-logistica',   label: 'Integr. Logística',    description: 'Transportistas y couriers',                 icon: Truck,        category: 'Integraciones', subOptions: SUBS_LOGISTICA },
  { id: 'integraciones-tiendas',     label: 'Integr. Tiendas',      description: 'Marketplaces y plataformas externas',       icon: Store,        category: 'Integraciones', subOptions: SUBS_TIENDAS },
  { id: 'integraciones-rrss',        label: 'Integr. RRSS',         description: 'Redes sociales y plataformas de contenido', icon: Rss,          category: 'Integraciones', subOptions: SUBS_RRSS },
  { id: 'integraciones-servicios',   label: 'Integr. Servicios',    description: 'Analytics, mensajería y notificaciones',   icon: Plug,         category: 'Integraciones', subOptions: SUBS_SERVICIOS },
  { id: 'integraciones-apis',        label: 'Repositorio de APIs',  description: 'Catálogo central de APIs',                 icon: Plug,         category: 'Integraciones' },
  { id: 'auth-registro',     label: 'Registro y Login',       description: 'Sign up, sign in, recupero y OAuth social',        icon: LogIn,        category: 'Auth',          subOptions: SUBS_AUTH },
  { id: 'carga-masiva',      label: 'Carga Masiva',           description: 'Upload masivo CSV, imágenes y docs',              icon: Upload,       category: 'Herramientas',  envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] },
  { id: 'meta-business',     label: 'Meta Business / RRSS Shop', description: 'Catálogo FB/IG, Meta Ads, píxel y Shops',     icon: Store,        category: 'RRSS',          envVars: ['VITE_META_APP_ID', 'VITE_META_PIXEL_ID', 'VITE_META_ACCESS_TOKEN', 'VITE_CATALOG_ID'] },
  { id: 'unified-workspace', label: 'Unified Workspace',      description: 'Docs, tareas, chat, calendario y notas',         icon: LayoutGrid,   category: 'Workspace',     envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'VITE_WS_REALTIME_KEY'] },
];

const CATEGORIES = [...new Set(MODULES.map(m => m.category))];
const BASE_ENV = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_APP_NAME', 'VITE_APP_URL'];

const CATEGORY_COLORS: Record<string, string> = {
  'eCommerce':    '#FF6835',
  'Logística':    '#059669',
  'Marketing':    '#EC4899',
  'RRSS':         '#F43F5E',
  'Gestión':      '#2563EB',
  'Herramientas': '#0D9488',
  'Sistema':      '#475569',
  'Integraciones':'#0891B2',
  'Auth':         '#7C3AED',
  'Workspace':    '#4F46E5',
};

/** Módulos Hub — viven en el header de la categoría, pre-seleccionados */
const HUB_MODULE_IDS = new Set(
  MODULES.filter(m => m.label.toLowerCase().includes('hub')).map(m => m.id)
);

const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  { id: 'hero',       label: 'Hero Banner',          icon: Zap,      enabled: true,  description: 'Imagen principal con CTA' },
  { id: 'benefits',   label: 'Barra de beneficios',  icon: Check,    enabled: true,  description: 'Envío gratis, garantía, devoluciones' },
  { id: 'categories', label: 'Grilla de categorías', icon: LayoutGrid, enabled: true, description: 'Accesos directos por categoría' },
  { id: 'featured',   label: 'Productos destacados', icon: Zap,      enabled: true,  description: 'Más vendidos y recomendados' },
  { id: 'new',        label: 'Nuevos ingresos',       icon: ArrowRight, enabled: true, description: 'Productos con isNew = true' },
  { id: 'offers',     label: 'Ofertas y descuentos',  icon: Minus,   enabled: true,  description: 'Productos con precio tachado' },
  { id: 'secondhand', label: 'Segunda mano',          icon: Rss,     enabled: false, description: 'Listados de segunda mano', requiresModule: 'secondhand' },
  { id: 'rrss',       label: 'Feed RRSS',            icon: Rss,     enabled: false, description: 'Feed de Instagram o TikTok',  requiresModule: 'rrss' },
];

const DEFAULT_STOREFRONT_PAGES: StorefrontPage[] = [
  { id: 'home',       path: '/',             label: 'Home',                   icon: Home,     enabled: true,  alwaysOn: true },
  { id: 'shop',       path: '/shop',         label: 'Catálogo',               icon: Store,    enabled: true,  requiresModule: 'ecommerce' },
  { id: 'product',    path: '/product/:id',  label: 'Detalle de producto',    icon: Wrench,   enabled: true,  requiresModule: 'ecommerce' },
  { id: 'cart',       path: '/cart',         label: 'Carrito',                icon: ShoppingCart, enabled: true, requiresModule: 'ecommerce' },
  { id: 'checkout',   path: '/checkout',     label: 'Checkout',               icon: CreditCard, enabled: true, requiresModule: 'metodos-pago' },
  { id: 'account',    path: '/account',      label: 'Mi cuenta',              icon: LogIn,    enabled: false, requiresModule: 'auth-registro' },
  { id: 'secondhand', path: '/second-hand',  label: 'Segunda mano',           icon: Rss,      enabled: false, requiresModule: 'secondhand' },
  { id: 'tracking',   path: '/tracking/:id', label: 'Tracking público',       icon: Search,   enabled: false, requiresModule: 'tracking-publico' },
  { id: 'mensaje',    path: '/mensaje',      label: 'Confirmación de pedido', icon: Check,    enabled: true,  requiresModule: 'pedidos' },
];

const CURRENCIES = [
  { code: 'USD', label: 'USD — Dólar americano' },
  { code: 'ARS', label: 'ARS — Peso argentino' },
  { code: 'UYU', label: 'UYU — Peso uruguayo' },
  { code: 'CLP', label: 'CLP — Peso chileno' },
  { code: 'BRL', label: 'BRL — Real brasileño' },
  { code: 'MXN', label: 'MXN — Peso mexicano' },
  { code: 'EUR', label: 'EUR — Euro' },
];

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  AR:         { bg: '#EFF6FF', color: '#1D4ED8' },
  LATAM:      { bg: '#F0FDF4', color: '#15803D' },
  Global:     { bg: C.gray100, color: C.gray600 },
  Local:      { bg: '#FEF3C7', color: '#92400E' },
  Meta:       { bg: '#EFF6FF', color: '#1877F2' },
  Google:     { bg: '#FEF2F2', color: '#DC2626' },
  Supabase:   { bg: '#F0FDF4', color: '#16A34A' },
  Base:       { bg: C.gray100, color: C.gray500 },
  X:          { bg: C.gray900, color: C.white },
  default:    { bg: C.gray100, color: C.gray500 },
};

/* ── Micro-componentes ── */
function Badge({ text }: { text?: string }) {
  if (!text) return null;
  const s = BADGE_COLORS[text] ?? BADGE_COLORS.default;
  return (
    <span style={{ fontSize: '0.6rem', fontWeight: '600', padding: '1px 5px', borderRadius: '3px', letterSpacing: '0.03em', backgroundColor: s.bg, color: s.color, flexShrink: 0 }}>
      {text}
    </span>
  );
}

function Pill({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '4px',
        border: `1px solid ${active ? C.orange : C.gray200}`,
        backgroundColor: active ? C.orange10 : C.white,
        color: active ? C.orange : C.gray500,
        fontSize: '0.72rem', fontWeight: active ? '600' : '400',
        cursor: 'pointer', transition: 'all 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {active && <Check size={9} color={C.orange} strokeWidth={3} />}
      {label}
      <Badge text={badge} />
    </button>
  );
}

function SlimToggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      style={{
        width: '32px', height: '18px', borderRadius: '9px', border: 'none', padding: 0,
        backgroundColor: on && !disabled ? C.orange : disabled ? C.gray200 : C.gray300,
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.15s', flexShrink: 0,
      }}
    >
      <span style={{
        display: 'block', width: '12px', height: '12px', borderRadius: '50%',
        backgroundColor: C.white, position: 'absolute', top: '3px',
        left: on && !disabled ? '17px' : '3px',
        transition: 'left 0.15s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

/* ── Sub-opciones panel ── */
function SubOptionsPanel({ mod, selectedSubs, onToggleSub }: {
  mod: Module;
  selectedSubs: Record<string, Set<string>>;
  onToggleSub: (mid: string, sid: string) => void;
}) {
  if (!mod.subOptions) return null;
  const mySubs = selectedSubs[mod.id] ?? new Set<string>();
  const allSelected = mod.subOptions.every(s => mySubs.has(s.id));

  return (
    <div onClick={e => e.stopPropagation()} style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${C.gray200}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.67rem', fontWeight: '600', color: C.gray400, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Proveedores — {mySubs.size}/{mod.subOptions.length}
        </span>
        <button
          onClick={e => { e.stopPropagation(); mod.subOptions!.forEach(s => { const has = mySubs.has(s.id); if (allSelected ? has : !has) onToggleSub(mod.id, s.id); }); }}
          style={{ fontSize: '0.68rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}
        >
          {allSelected ? 'Quitar todos' : 'Seleccionar todos'}
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {mod.subOptions.map(sub => (
          <Pill
            key={sub.id}
            label={sub.label}
            badge={sub.badge}
            active={mySubs.has(sub.id)}
            onClick={() => onToggleSub(mod.id, sub.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Step progress indicator ── */
const STEP_DEFS = [
  { id: 'select',     label: 'Módulos' },
  { id: 'config',     label: 'Configuración' },
  { id: 'frontstore', label: 'Frontstore' },
] as const;
const STEP_ORDER = ['select', 'config', 'frontstore', 'done'];

function StepBar({ step, setStep, currentIdx }: { step: string; setStep: (s: any) => void; currentIdx: number }) {
  return (
    <div style={{ height: '52px', backgroundColor: C.white, borderBottom: `1px solid ${C.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexShrink: 0 }}>
      {STEP_DEFS.map((s, i) => {
        const done = currentIdx > i;
        const active = step === s.id;
        const reachable = currentIdx >= i;
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => reachable && setStep(s.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px', background: 'none', border: 'none', cursor: reachable ? 'pointer' : 'default' }}
            >
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: done ? C.orange : active ? C.orange : 'transparent',
                border: `1.5px solid ${done || active ? C.orange : C.gray300}`,
                transition: 'all 0.2s',
              }}>
                {done
                  ? <Check size={11} color={C.white} strokeWidth={3} />
                  : <span style={{ fontSize: '0.65rem', fontWeight: '700', color: active ? C.white : C.gray400 }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: active ? '600' : '400', color: active ? C.gray900 : done ? C.gray500 : C.gray400, whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </button>
            {i < STEP_DEFS.length - 1 && (
              <div style={{ width: '48px', height: '1px', backgroundColor: currentIdx > i ? C.orange : C.gray200, margin: '0 8px', flexShrink: 0, transition: 'background-color 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── ColorPicker inline ── */
function ColorField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${C.gray100}` }}>
      <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${C.gray200}`, flexShrink: 0, backgroundColor: value }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '500', color: C.gray700 }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.68rem', color: C.gray400 }}>{hint}</p>
      </div>
      <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: C.gray500, backgroundColor: C.gray50, padding: '2px 6px', borderRadius: '4px', border: `1px solid ${C.gray200}` }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════ */
export function ConstructorView({ onNavigate }: Props) {
  const [selected, setSelected]           = useState<Set<string>>(new Set(HUB_MODULE_IDS));
  const [selectedSubs, setSelectedSubs]   = useState<Record<string, Set<string>>>({});
  const [expandedMods, setExpanded]       = useState<Set<string>>(new Set());
  const [expandedCats, setExpandedCats]   = useState<Set<string>>(new Set());
  /* Portal dropdown */
  const [openCat, setOpenCat]             = useState<string | null>(null);
  const [portalPos, setPortalPos]         = useState<{ top: number; headerTop: number; left: number; width: number } | null>(null);
  const headerRefs                        = useRef<Map<string, HTMLDivElement>>(new Map());
  const portalRef                         = useRef<HTMLDivElement | null>(null);
  const [projectName, setProjectName]     = useState('');
  const [step, setStep]                   = useState<'select' | 'config' | 'frontstore' | 'done'>('select');
  const [filterCat, setFilterCat]         = useState('Todos');
  const [copied, setCopied]               = useState(false);
  const [copiedJson, setCopiedJson]       = useState(false);

  /* Frontstore */
  const [storeName, setStoreName]         = useState('');
  const [storeTagline, setStoreTagline]   = useState('');
  const [storeCurrency, setStoreCurrency] = useState('USD');
  const [primaryColor, setPrimaryColor]   = useState('#FF6835');
  const [secondaryColor, setSecondaryColor] = useState('#111111');
  const [bgColor, setBgColor]             = useState('#FFFFFF');
  const [homeSections, setHomeSections]   = useState<HomeSection[]>(DEFAULT_HOME_SECTIONS);
  const [sfPages, setSfPages]             = useState<StorefrontPage[]>(DEFAULT_STOREFRONT_PAGES);

  /* Save/Load */
  const [saved, setSaved]                 = useState(false);
  const [loadOpen, setLoadOpen]           = useState(false);
  const [tenantSlug, setTenantSlug]           = useState('');
  const [applyingTenant, setApplyingTenant]   = useState(false);
  const [applyResult, setApplyResult]         = useState<'ok' | 'error' | null>(null);
  const [loadingTenant, setLoadingTenant]     = useState(false);
  const [loadResult, setLoadResult]           = useState<'ok' | 'error' | null>(null);

  const [savedMeta, setSavedMeta]         = useState<{ savedAt: string; projectName: string; step: string; storeName: string } | null>(null);
  const loadPanelRef                      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { try { const d = JSON.parse(raw); setSavedMeta({ savedAt: d.savedAt, projectName: d.projectName ?? '', step: d.step ?? 'select', storeName: d.storeName ?? '' }); } catch {} }
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (loadPanelRef.current && !loadPanelRef.current.contains(e.target as Node)) setLoadOpen(false); };
    if (loadOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [loadOpen]);

  /* Cerrar portal dropdown al hacer scroll o click fuera */
  useEffect(() => {
    const closePortal = () => { setOpenCat(null); setPortalPos(null); setExpandedCats(new Set()); };
    const handleMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      const insidePortal  = portalRef.current?.contains(t);
      const insideHeaders = Array.from(headerRefs.current.values()).some(el => el.contains(t));
      if (!insidePortal && !insideHeaders) closePortal();
    };
    const handleScroll = (e: Event) => {
      /* Si el scroll ocurre DENTRO del portal (lista larga) → no cerrar */
      if (portalRef.current?.contains(e.target as Node)) return;
      closePortal();
    };
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const saveState = () => {
    const data = { savedAt: new Date().toISOString(), projectName, step, filterCat, selected: Array.from(selected), selectedSubs: Object.fromEntries(Object.entries(selectedSubs).map(([k, v]) => [k, Array.from(v)])), storeName, storeTagline, storeCurrency, primaryColor, secondaryColor, bgColor, homeSections, storefrontPages: sfPages };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSavedMeta({ savedAt: data.savedAt, projectName, step, storeName });
    setSaved(true); setTimeout(() => setSaved(false), 2200);
  };

  const loadState = () => {
    const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return;
    try {
      const d = JSON.parse(raw);
      setProjectName(d.projectName ?? ''); setStep(d.step ?? 'select'); setFilterCat(d.filterCat ?? 'Todos');
      setSelected(new Set(d.selected ?? []));
      setSelectedSubs(Object.fromEntries(Object.entries(d.selectedSubs ?? {}).map(([k, v]) => [k, new Set(v as string[])])));
      setStoreName(d.storeName ?? ''); setStoreTagline(d.storeTagline ?? ''); setStoreCurrency(d.storeCurrency ?? 'USD');
      setPrimaryColor(d.primaryColor ?? '#FF6835'); setSecondaryColor(d.secondaryColor ?? '#111111'); setBgColor(d.bgColor ?? '#FFFFFF');
      setHomeSections(d.homeSections ?? DEFAULT_HOME_SECTIONS); setSfPages(d.storefrontPages ?? DEFAULT_STOREFRONT_PAGES);
      setLoadOpen(false);
    } catch {}
  };

  const deleteDraft = (e: React.MouseEvent) => { e.stopPropagation(); localStorage.removeItem(STORAGE_KEY); setSavedMeta(null); setLoadOpen(false); };

  /* Module toggles */
  const toggle = (id: string) => {
    const mod = MODULES.find(m => m.id === id); if (mod?.required) return;
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) { n.delete(id); setExpanded(e => { const e2 = new Set(e); e2.delete(id); return e2; }); } else { n.add(id); if (mod?.subOptions) setExpanded(e => new Set([...e, id])); } return n; });
  };
  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    if (!selected.has(id)) setSelected(prev => new Set([...prev, id]));
  };
  const toggleSub = (mid: string, sid: string) => setSelectedSubs(prev => { const cur = new Set(prev[mid] ?? []); cur.has(sid) ? cur.delete(sid) : cur.add(sid); return { ...prev, [mid]: cur }; });

  /* Abrir/cerrar categoría con portal fijo */
  const toggleCatPortal = useCallback((cat: string) => {
    if (openCat === cat) {
      setOpenCat(null); setPortalPos(null);
    } else {
      const el = headerRefs.current.get(cat);
      if (el) {
        const r = el.getBoundingClientRect();
        setPortalPos({ top: r.bottom + 2, headerTop: r.top, left: r.left - 1, width: r.width + 2 });
      }
      setOpenCat(cat);
    }
  }, [openCat]);

  const syncPagesWithModules = () => {
    setSfPages(prev => prev.map(p => (p.alwaysOn || (p.requiresModule && selected.has(p.requiresModule))) ? { ...p, enabled: true } : p));
    setHomeSections(prev => prev.map(s => s.requiresModule && selected.has(s.requiresModule) ? { ...s, enabled: true } : s));
  };

  const totalSelected = selected.size + MODULES.filter(m => m.required).length;
  const totalSubs = Object.values(selectedSubs).reduce((a, s) => a + s.size, 0);
  const visibleModules = filterCat === 'Todos' ? MODULES : MODULES.filter(m => m.category === filterCat);
  const currentIdx = STEP_ORDER.indexOf(step);

  const allEnvVars = Array.from(new Set([
    ...BASE_ENV, 'VITE_STORE_NAME', 'VITE_STORE_TAGLINE', 'VITE_CURRENCY', 'VITE_PRIMARY_COLOR', 'VITE_SECONDARY_COLOR',
    ...MODULES.filter(m => selected.has(m.id) || m.required).flatMap(m => { const base = m.subOptions ? [] : (m.envVars ?? []); const subs = m.subOptions ? m.subOptions.filter(s => (selectedSubs[m.id] ?? new Set()).has(s.id)).flatMap(s => s.envVars ?? []) : []; return [...base, ...subs]; }),
  ]));

  const buildEnvContent = () => ['# .env.example — Charlie Marketplace Builder v1.5', `# Proyecto: ${projectName}`, `# Generado: ${new Date().toLocaleDateString('es-UY')}`, '', ...allEnvVars.map(v => v === 'VITE_STORE_NAME' ? `${v}="${storeName}"` : v === 'VITE_STORE_TAGLINE' ? `${v}="${storeTagline}"` : v === 'VITE_CURRENCY' ? `${v}="${storeCurrency}"` : v === 'VITE_PRIMARY_COLOR' ? `${v}="${primaryColor}"` : v === 'VITE_SECONDARY_COLOR' ? `${v}="${secondaryColor}"` : `${v}=""`)].join('\n');
  const buildConfigObj = () => ({ project: projectName, version: '1.0.0', generated: new Date().toISOString().split('T')[0], generator: 'Charlie Marketplace Builder v1.5', modules: MODULES.filter(m => selected.has(m.id) || m.required).map(m => m.id), providers: Object.fromEntries(Object.entries(selectedSubs).filter(([, s]) => s.size > 0).map(([k, v]) => [k, Array.from(v)])), frontstore: { branding: { storeName, tagline: storeTagline, currency: storeCurrency, primaryColor, secondaryColor, bgColor }, home: { sections: homeSections.map(s => ({ id: s.id, enabled: s.enabled })) }, pages: sfPages.map(p => ({ id: p.id, path: p.path, enabled: p.enabled })) } });
  const buildConfigJson = () => JSON.stringify(buildConfigObj(), null, 2);

  const download = (content: string, filename: string, type: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = filename; a.click(); };
  const copyText = (text: string, fn: (v: boolean) => void) => { try { navigator.clipboard.writeText(text).then(() => { fn(true); setTimeout(() => fn(false), 2200); }); } catch {} };

  const loadTenant = async () => {
    if (!tenantSlug.trim()) return;
    setLoadingTenant(true);
    setLoadResult(null);
    try {
      const { data, error } = await charlieSupabase
        .from('tenant_config')
        .select('modulos')
        .eq('tenant_id', tenantSlug.trim())
        .single();
      if (error || !data) throw new Error('Tenant no encontrado');
      const modulosActivos: string[] = data.modulos ?? [];
      // Marcar en el selector los módulos que tiene el tenant
      const newSelected = new Set<string>(HUB_MODULE_IDS);
      MODULES.forEach(m => {
        if (modulosActivos.includes(m.id)) newSelected.add(m.id);
      });
      console.log('[loadTenant] modulosActivos:', modulosActivos);
      console.log('[loadTenant] newSelected:', Array.from(newSelected));
      setSelected(new Set(newSelected));
      setLoadResult('ok');
      // Delay para que React procese setSelected antes de cambiar el step
      setTimeout(() => setStep('select'), 50);
    } catch {
      setLoadResult('error');
    } finally {
      setLoadingTenant(false);
    }
  };

  const handleApplyToTenant = async () => {
    if (!tenantSlug.trim()) return;
    setApplyingTenant(true);
    setApplyResult(null);
    try {
      const modulosSeleccionados = MODULES
        .filter(m => selected.has(m.id) || m.required)
        .map(m => m.id);
      const { error } = await charlieSupabase
        .from('tenant_config')
        .update({ modulos: modulosSeleccionados })
        .eq('tenant_id', tenantSlug.trim());
      if (error) throw new Error(error.message);
      setApplyResult('ok');
    } catch (err) {
      console.error('[Constructor] Error aplicando tenant:', err);
      setApplyResult('error');
    } finally {
      setApplyingTenant(false);
    }
  };

  const resetAll = () => { setStep('select'); setProjectName(''); setSelected(new Set()); setSelectedSubs({}); setExpanded(new Set()); setStoreName(''); setStoreTagline(''); setStoreCurrency('USD'); setPrimaryColor('#FF6835'); setSecondaryColor('#111111'); setBgColor('#FFFFFF'); setHomeSections(DEFAULT_HOME_SECTIONS); setSfPages(DEFAULT_STOREFRONT_PAGES); };

  /* ── Shared styles ── */
  const card: React.CSSProperties = { backgroundColor: C.white, border: `1px solid ${C.gray200}`, borderRadius: '8px', padding: '20px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 11px', borderRadius: '6px', border: `1px solid ${C.gray200}`, fontSize: '0.83rem', outline: 'none', boxSizing: 'border-box', color: C.gray900, backgroundColor: C.white, fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.72rem', fontWeight: '500', color: C.gray600, marginBottom: '5px', letterSpacing: '0.01em' };
  const hintStyle: React.CSSProperties = { margin: '4px 0 0', fontSize: '0.68rem', color: C.gray400, fontFamily: 'monospace' };
  const sectionTitle: React.CSSProperties = { margin: '0 0 14px', fontSize: '0.8rem', fontWeight: '600', color: C.gray700, letterSpacing: '0.01em' };
  const btnPrimary = (enabled = true): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: enabled ? C.orange : C.gray200, color: enabled ? C.white : C.gray400, fontSize: '0.82rem', fontWeight: '600', cursor: enabled ? 'pointer' : 'not-allowed', transition: 'background-color 0.15s' });
  const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', border: `1px solid ${C.gray200}`, backgroundColor: C.white, color: C.gray600, fontSize: '0.82rem', fontWeight: '500', cursor: 'pointer' };
  const codeBlock: React.CSSProperties = { backgroundColor: C.code, borderRadius: '6px', padding: '14px 16px', fontFamily: '"SF Mono", "Fira Mono", monospace', fontSize: '0.72rem', lineHeight: '1.7', overflowY: 'auto' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: C.gray50 }}>

      {/* ══ Top Bar ══ */}
      <div style={{ height: '48px', flexShrink: 0, backgroundColor: C.white, borderBottom: `1px solid ${C.gray200}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
        <Blocks size={16} color={C.orange} />
        <span style={{ fontSize: '0.88rem', fontWeight: '600', color: C.gray900 }}>Constructor</span>
        <span style={{ width: '1px', height: '16px', backgroundColor: C.gray200 }} />
        <span style={{ fontSize: '0.75rem', color: C.gray400 }}>{totalSelected} módulos · {allEnvVars.length} variables</span>
        <div style={{ flex: 1 }} />

        {/* Save / Load */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }} ref={loadPanelRef}>
          <button
            onClick={saveState}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '5px', border: `1px solid ${saved ? C.green : C.gray200}`, backgroundColor: saved ? C.green10 : C.white, color: saved ? C.green : C.gray600, fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            {saved ? <><CheckCheck size={12} /> Guardado</> : <><Save size={12} /> Grabar</>}
          </button>

          <button
            onClick={() => setLoadOpen(p => !p)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '5px', border: `1px solid ${loadOpen ? C.orange : C.gray200}`, backgroundColor: loadOpen ? C.orange10 : C.white, color: loadOpen ? C.orange : C.gray600, fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}
          >
            <FolderOpen size={12} /> Abrir
            {savedMeta && <span style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.orange, border: `1.5px solid ${C.white}` }} />}
          </button>

          {/* Load dropdown */}
          {loadOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: '280px', backgroundColor: C.white, borderRadius: '8px', border: `1px solid ${C.gray200}`, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', zIndex: 200, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.gray100}` }}>
                <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: '600', color: C.gray600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Borrador guardado</p>
              </div>
              {savedMeta ? (
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 3px', fontSize: '0.82rem', fontWeight: '600', color: C.gray900 }}>
                        {savedMeta.projectName || '—'}
                        {savedMeta.storeName && <span style={{ color: C.orange, fontWeight: '400' }}> · {savedMeta.storeName}</span>}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '600', padding: '1px 6px', borderRadius: '3px', backgroundColor: C.orange10, color: C.orange }}>
                          {savedMeta.step === 'select' ? 'Step 1' : savedMeta.step === 'config' ? 'Step 2' : savedMeta.step === 'frontstore' ? 'Step 3' : 'Completado'}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: C.gray400 }}>
                          <Clock size={9} />
                          {new Date(savedMeta.savedAt).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <button onClick={deleteDraft} title="Eliminar borrador" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: C.gray300, transition: 'color 0.1s' }} onMouseEnter={e => (e.currentTarget.style.color = C.red)} onMouseLeave={e => (e.currentTarget.style.color = C.gray300)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <button onClick={loadState} style={{ ...btnPrimary(), width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}>
                    Continuar <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <div style={{ padding: '20px 14px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '0.78rem', color: C.gray400, fontWeight: '500' }}>Sin borradores guardados</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: C.gray300 }}>Usá Grabar para guardar tu avance</p>
                </div>
              )}
            </div>
          )}
        </div>

        {step !== 'done' && (
          <>
            <span style={{ width: '1px', height: '16px', backgroundColor: C.gray200 }} />
            <button onClick={resetAll} style={{ fontSize: '0.72rem', color: C.gray400, background: 'none', border: 'none', cursor: 'pointer' }}>Resetear</button>
          </>
        )}
      </div>

      {/* ══ Step bar ══ */}
      {step !== 'done' && <StepBar step={step} setStep={setStep} currentIdx={currentIdx} />}

      {/* ════════════════════════════════════════
          STEP 1 — Módulos
      ════════════════════════════════════════ */}
      {step === 'select' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          {/* ── Toolbar ── */}
          <div style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.gray200}`, height: '42px', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
            <span style={{ fontSize: '0.78rem', color: C.gray400 }}>
              <b style={{ color: C.gray900, fontWeight: '600' }}>{totalSelected}</b> módulos
              {totalSubs > 0 && <> · <b style={{ color: C.orange, fontWeight: '600' }}>{totalSubs}</b> proveedores</>}
              {' · '}<b style={{ color: C.gray700, fontWeight: '600' }}>{allEnvVars.length}</b> variables
            </span>
            <div style={{ flex: 1 }} />
            <span style={{ color: C.gray200 }}>|</span>
            <button onClick={() => setSelected(new Set(MODULES.filter(m => !m.required).map(m => m.id)))} style={{ fontSize: '0.72rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Todos</button>
            <button onClick={() => { setSelected(new Set()); setSelectedSubs({}); setExpanded(new Set()); }} style={{ fontSize: '0.72rem', color: C.gray500, background: 'none', border: 'none', cursor: 'pointer' }}>Limpiar</button>
          </div>

          {/* ── Accordion list (estilo Checklist Roadmap) ── */}
          <div style={{ padding: '12px 16px', backgroundColor: C.gray50, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {CATEGORIES.map(cat => {
              const catColor  = CATEGORY_COLORS[cat] ?? C.gray500;
              const catMods   = MODULES.filter(m => m.category === cat);
              const hubMod    = catMods.find(m => HUB_MODULE_IDS.has(m.id));
              const rowMods   = catMods.filter(m => !HUB_MODULE_IDS.has(m.id));
              const hubSel    = hubMod ? (selected.has(hubMod.id) || !!hubMod.required) : false;
              const catSel    = catMods.filter(m => selected.has(m.id) || m.required).length;
              const isOpen          = openCat === cat;
              const selectedRowMods = rowMods.filter(m => selected.has(m.id) || !!m.required);

              return (
                <div key={cat} style={{ borderRadius: '10px', border: `1px solid ${isOpen ? catColor : C.gray200}`, overflow: 'visible', boxShadow: isOpen ? `0 0 0 1px ${catColor}20` : '0 1px 2px rgba(0,0,0,0.04)', backgroundColor: C.white, transition: 'border-color 0.15s, box-shadow 0.15s' }}>

                  {/* ══ Category header ══ */}
                  <div
                    ref={el => { if (el) headerRefs.current.set(cat, el); else headerRefs.current.delete(cat); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', height: '38px', backgroundColor: hubSel ? `${catColor}08` : C.white, borderLeft: `3px solid ${hubSel ? catColor : C.gray200}`, borderRadius: '8px', transition: 'all 0.12s' }}
                  >

                    {/* Expand toggle */}
                    <button onClick={() => toggleCatPortal(cat)} style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 0 }}>
                      <ChevronRight size={13} color={C.gray400} style={{ flexShrink: 0, transition: 'transform 0.18s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                      {/* Category name — texto plano negro */}
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: C.gray900, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {cat}
                      </span>
                      {/* Count */}
                      <span style={{ fontSize: '0.68rem', color: C.gray400, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {rowMods.length > 0 ? `· ${catSel - (hubSel ? 1 : 0)}/${rowMods.length}` : ''}
                      </span>
                    </button>

                    {/* Hub checkbox (right side of header) */}
                    {hubMod && !hubMod.required && (
                      <div
                        onClick={() => toggle(hubMod.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', flexShrink: 0, padding: '4px 6px', borderRadius: '5px', backgroundColor: hubSel ? `${catColor}15` : 'transparent', border: `1px solid ${hubSel ? catColor : C.gray200}`, transition: 'all 0.12s' }}
                      >
                        <div style={{ width: '13px', height: '13px', borderRadius: '3px', border: `1.5px solid ${hubSel ? catColor : C.gray300}`, backgroundColor: hubSel ? catColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}>
                          {hubSel && <Check size={8} color={C.white} strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.64rem', fontWeight: '600', color: hubSel ? catColor : C.gray400 }}>Hub</span>
                      </div>
                    )}
                    {/* Required hub badge */}
                    {hubMod?.required && (
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: C.gray400, backgroundColor: C.gray100, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>BASE</span>
                    )}

                    {/* ── Chips de módulos seleccionados ── */}
                    {selectedRowMods.length > 0 && (
                      <div style={{ display: 'flex', gap: '3px', overflow: 'hidden', flexShrink: 1, minWidth: 0, alignItems: 'center' }}>
                        {selectedRowMods.map(mod => (
                          <div
                            key={mod.id}
                            onClick={e => { e.stopPropagation(); if (!mod.required) toggle(mod.id); }}
                            title={mod.required ? mod.label : `Quitar: ${mod.label}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '4px', border: `1px solid ${catColor}40`, backgroundColor: `${catColor}12`, color: catColor, fontSize: '0.6rem', fontWeight: '600', cursor: mod.required ? 'default' : 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'opacity 0.1s, background-color 0.1s' }}
                          >
                            <Check size={7} color={catColor} strokeWidth={3.5} />
                            {mod.label}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    {catSel > 0 && (
                      <span style={{ fontSize: '0.64rem', fontWeight: '600', padding: '1px 7px', borderRadius: '9999px', color: catColor, border: `1px solid ${catColor}30`, backgroundColor: `${catColor}10`, flexShrink: 0 }}>
                        {catSel}
                      </span>
                    )}
                  </div>


                </div>
              );
            })}
          </div>

          {/* ── Portal dropdown (position:fixed → por encima de todo) ── */}
          {openCat && portalPos && (() => {
            const pColor   = CATEGORY_COLORS[openCat] ?? C.gray500;
            const pRowMods = MODULES.filter(m => m.category === openCat && !HUB_MODULE_IDS.has(m.id));
            if (pRowMods.length === 0) return null;
            /* Decidir si abrir hacia abajo o hacia arriba según espacio disponible */
            const spaceBelow = window.innerHeight - portalPos.top - 8;
            const spaceAbove = portalPos.headerTop - 8;
            const openUp     = spaceBelow < 260 && spaceAbove > spaceBelow;
            const maxH       = Math.max(220, openUp ? spaceAbove : spaceBelow);
            const posStyle   = openUp
              ? { bottom: window.innerHeight - portalPos.headerTop + 2, top: 'auto' as const }
              : { top: portalPos.top, bottom: 'auto' as const };
            return createPortal(
              <div
                ref={portalRef}
                style={{ position: 'fixed', ...posStyle, left: portalPos.left, width: portalPos.width, zIndex: 9999, backgroundColor: C.white, border: `1px solid ${pColor}`, borderRadius: '10px', boxShadow: '0 16px 40px rgba(0,0,0,0.20)', maxHeight: maxH, overflowX: 'hidden', overflowY: 'auto' }}
              >
                {/* ── Cabecera con título y botón cerrar ── */}
                <div style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px 7px 14px', backgroundColor: `${pColor}10`, borderBottom: `1px solid ${pColor}30` }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: pColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{openCat}</span>
                  <button
                    onClick={() => setOpenCat(null)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '4px', border: `1px solid ${pColor}40`, backgroundColor: 'transparent', cursor: 'pointer', color: pColor, padding: 0, transition: 'background-color 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${pColor}20`)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </div>
                {pRowMods.map((mod, mi) => {
                  const sel        = selected.has(mod.id) || !!mod.required;
                  const exp        = expandedMods.has(mod.id);
                  const hasSubs    = !!mod.subOptions;
                  const activeSubs = hasSubs ? (selectedSubs[mod.id]?.size ?? 0) : 0;
                  const isLast     = mi === pRowMods.length - 1;
                  const Icon       = mod.icon;
                  return (
                    <div key={mod.id}>
                      <div
                        onClick={() => toggle(mod.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px 0 22px', height: '32px', borderLeft: `3px solid ${sel ? pColor : 'transparent'}`, backgroundColor: sel ? `${pColor}07` : 'transparent', cursor: mod.required ? 'default' : 'pointer', borderBottom: isLast && !exp ? 'none' : `1px solid ${C.gray100}`, transition: 'background-color 0.1s' }}
                      >
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: `1.5px solid ${sel ? pColor : C.gray300}`, backgroundColor: sel ? pColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s' }}>
                          {sel && <Check size={8} color={C.white} strokeWidth={3} />}
                        </div>
                        <Icon size={13} color={sel ? pColor : C.gray300} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: sel ? '600' : '400', color: sel ? C.gray800 : C.gray500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {mod.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                          {mod.required && <span style={{ fontSize: '0.58rem', fontWeight: '700', color: C.gray400, backgroundColor: C.gray100, padding: '1px 5px', borderRadius: '3px' }}>BASE</span>}
                          {hasSubs && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: activeSubs > 0 && sel ? pColor : C.gray300, fontWeight: activeSubs > 0 && sel ? '700' : '400' }}>
                              <Plug size={10} color={activeSubs > 0 && sel ? pColor : C.gray300} />
                              {sel ? `${activeSubs}/${mod.subOptions!.length}` : mod.subOptions!.length}
                            </span>
                          )}
                          {hasSubs && sel && (
                            <button
                              onClick={e => { e.stopPropagation(); toggleExpand(e, mod.id); }}
                              style={{ width: '20px', height: '20px', borderRadius: '4px', border: `1px solid ${exp ? pColor : C.gray200}`, backgroundColor: exp ? `${pColor}15` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.12s', flexShrink: 0 }}
                            >
                              <ChevronDown size={10} color={exp ? pColor : C.gray400} style={{ transition: 'transform 0.18s', transform: exp ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                            </button>
                          )}
                        </div>
                      </div>
                      {sel && exp && hasSubs && (() => {
                        const mySubs = selectedSubs[mod.id] ?? new Set<string>();
                        const allSel = mod.subOptions!.every(s => mySubs.has(s.id));
                        return (
                          <div style={{ borderLeft: `3px solid ${pColor}`, borderBottom: isLast ? 'none' : `1px solid ${C.gray100}`, backgroundColor: `${pColor}05`, padding: '8px 12px 10px 36px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: '700', color: C.gray400, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Proveedores {mySubs.size}/{mod.subOptions!.length}</span>
                              <button onClick={() => mod.subOptions!.forEach(s => { const has = mySubs.has(s.id); if (allSel ? has : !has) toggleSub(mod.id, s.id); })} style={{ fontSize: '0.65rem', color: pColor, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', padding: 0 }}>
                                {allSel ? 'Quitar todos' : 'Sel. todos'}
                              </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {mod.subOptions!.map(sub => {
                                const active = mySubs.has(sub.id);
                                return (
                                  <button key={sub.id} onClick={() => toggleSub(mod.id, sub.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', border: `1px solid ${active ? pColor : C.gray200}`, backgroundColor: C.white, color: active ? pColor : C.gray500, fontSize: '0.7rem', fontWeight: active ? '600' : '400', cursor: 'pointer', transition: 'all 0.1s', boxShadow: active ? `0 0 0 1px ${pColor}` : 'none' }}>
                                    {active && <Check size={8} color={pColor} strokeWidth={3} />}
                                    {sub.label}
                                    <Badge text={sub.badge} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>,
              document.body
            );
          })()}

          {/* ── Footer ── */}
          <div style={{ backgroundColor: C.white, borderTop: `1px solid ${C.gray200}`, padding: '10px 20px', display: 'flex', alignItems: 'center', position: 'sticky', bottom: 0, zIndex: 50 }}>
            <span style={{ fontSize: '0.75rem', color: C.gray400 }}>
              <b style={{ color: C.gray900, fontWeight: '600' }}>{totalSelected}</b> módulos seleccionados
              {totalSubs > 0 && <> · <b style={{ color: C.orange, fontWeight: '600' }}>{totalSubs}</b> proveedores</>}
              {' · '}<b style={{ color: C.gray700, fontWeight: '600' }}>{allEnvVars.length}</b> variables de entorno
            </span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setStep('config')} disabled={selected.size === 0} style={btnPrimary(selected.size > 0)}>
              Continuar <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}





      {/* ════════════════════════════════════════
          STEP 2 — Configuración
      ════════════════════════════════════════ */}
      {step === 'config' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Nombre del proyecto */}
            <div style={card}>
              <p style={sectionTitle}>Repositorio</p>
              <label style={labelStyle}>Nombre del proyecto</label>
              <input value={projectName} onChange={e => setProjectName(e.target.value.replace(/\s+/g, '-').toLowerCase())} placeholder="ej: oddy-store" style={{ ...inputStyle, fontFamily: 'monospace' }} />
              <p style={hintStyle}>github.com/CharlieUY711/{projectName || 'nombre-del-proyecto'}</p>
            </div>

            {/* Resumen de módulos */}
            <div style={card}>
              <p style={sectionTitle}>Módulos incluidos <span style={{ color: C.gray400, fontWeight: '400' }}>({totalSelected})</span></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {MODULES.filter(m => selected.has(m.id) || m.required).map(mod => {
                  const subs = mod.subOptions ? [...(selectedSubs[mod.id] ?? [])].map(sid => mod.subOptions!.find(s => s.id === sid)!).filter(Boolean) : [];
                  return (
                    <div key={mod.id} style={{ borderRadius: '5px', border: `1px solid ${C.gray200}`, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', backgroundColor: mod.required ? C.gray50 : C.orange10 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '500', color: C.gray800 as any, flex: 1 }}>{mod.label}</span>
                        {mod.required && <span style={{ fontSize: '0.6rem', color: C.gray400, fontWeight: '500', letterSpacing: '0.04em' }}>BASE</span>}
                        {subs.length > 0 && <span style={{ fontSize: '0.67rem', color: C.orange, fontWeight: '500' }}>{subs.length} proveedor{subs.length > 1 ? 'es' : ''}</span>}
                      </div>
                      {subs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '7px 12px', backgroundColor: C.white }}>
                          {subs.map(s => <Pill key={s.id} label={s.label} badge={s.badge} active onClick={() => {}} />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Variables de entorno */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                <p style={{ ...sectionTitle, margin: 0 }}>Variables de entorno</p>
                <span style={{ fontSize: '0.68rem', color: C.gray400 }}>({allEnvVars.length})</span>
              </div>
              <div style={{ ...codeBlock, maxHeight: '180px' }}>
                <p style={{ margin: '0 0 8px', color: '#4B5563', fontSize: '0.68rem' }}># .env.example</p>
                {allEnvVars.map(v => (
                  <p key={v} style={{ margin: '1px 0', color: '#8B949E' }}>
                    <span style={{ color: '#79C0FF' }}>{v}</span>
                    <span style={{ color: '#4B5563' }}>=</span>
                    <span style={{ color: '#7EE787' }}>""</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Aviso */}
            <div style={{ backgroundColor: C.amber10, border: `1px solid #FDE68A`, borderRadius: '6px', padding: '14px 16px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: '600', color: '#92400E' }}>Requisitos mínimos</p>
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  'Proyecto Supabase creado',
                  'SUPABASE_URL y SUPABASE_ANON_KEY completadas',
                  'Repositorio conectado a Vercel / Netlify',
                  ...(selectedSubs['metodos-pago']?.size > 0 ? ['Cuentas activas en las pasarelas de pago'] : []),
                  ...(allEnvVars.some(v => v.includes('MAPS')) ? ['Google Maps API Key habilitada para el dominio'] : []),
                ].map((t, i) => <li key={i} style={{ fontSize: '0.75rem', color: '#78350F' }}>{t}</li>)}
              </ul>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <button onClick={() => setStep('select')} style={btnGhost}>← Volver</button>
              <button disabled={!projectName} onClick={() => { if (projectName) { syncPagesWithModules(); setStep('frontstore'); } }} style={btnPrimary(!!projectName)}>
                <Settings2 size={14} /> Configurar Frontstore <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          STEP 3 — Frontstore
      ════════════════════════════════════════ */}
      {step === 'frontstore' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Banner info */}
            <div style={{ backgroundColor: C.white, border: `1px solid ${C.gray200}`, borderLeft: `3px solid ${C.orange}`, borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={14} color={C.orange} />
              <p style={{ margin: 0, fontSize: '0.78rem', color: C.gray600 }}>
                ODDY usará el <b style={{ color: C.gray900 }}>Frontstore nativo de Charlie</b>. La configuración se exporta en <code style={{ fontSize: '0.72rem', backgroundColor: C.gray100, padding: '1px 5px', borderRadius: '3px', color: C.gray700 }}>charlie.config.json</code> y en las variables de entorno.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* Columna izquierda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Identidad */}
                <div style={card}>
                  <p style={sectionTitle}>Identidad</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Nombre de la tienda <span style={{ color: C.orange }}>*</span></label>
                      <input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="ej: ODDY" style={{ ...inputStyle, borderColor: storeName ? C.orange : C.gray200 }} />
                      <p style={hintStyle}>→ VITE_STORE_NAME</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Tagline</label>
                      <input value={storeTagline} onChange={e => setStoreTagline(e.target.value)} placeholder="ej: Tu tienda de confianza" style={inputStyle} />
                      <p style={hintStyle}>→ VITE_STORE_TAGLINE</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Moneda</label>
                      <select value={storeCurrency} onChange={e => setStoreCurrency(e.target.value)} style={{ ...inputStyle }}>
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <p style={hintStyle}>→ VITE_CURRENCY</p>
                    </div>
                  </div>
                </div>

                {/* Paleta */}
                <div style={card}>
                  <p style={sectionTitle}>Paleta de colores</p>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <ColorField label="Color primario" hint="→ VITE_PRIMARY_COLOR" value={primaryColor} onChange={setPrimaryColor} />
                    <ColorField label="Color secundario" hint="→ VITE_SECONDARY_COLOR" value={secondaryColor} onChange={setSecondaryColor} />
                    <ColorField label="Fondo" hint="Background del sitio" value={bgColor} onChange={setBgColor} />
                  </div>

                  {/* Preview */}
                  <div style={{ marginTop: '16px', border: `1px solid ${C.gray200}`, borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: secondaryColor, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: primaryColor }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#fff', opacity: 0.9, flex: 1 }}>{storeName || 'Tu Tienda'}</span>
                      <div style={{ backgroundColor: primaryColor, color: '#fff', fontSize: '0.62rem', fontWeight: '600', padding: '3px 8px', borderRadius: '4px' }}>Shop</div>
                    </div>
                    <div style={{ backgroundColor: bgColor, padding: '10px 12px', display: 'flex', gap: '6px' }}>
                      {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: '36px', borderRadius: '5px', backgroundColor: i === 3 ? primaryColor : C.gray100 }} />)}
                    </div>
                    <div style={{ backgroundColor: bgColor, padding: '3px 12px 8px', borderTop: `1px solid ${C.gray100}` }}>
                      <p style={{ margin: 0, fontSize: '0.6rem', color: C.gray400 }}>Vista previa de paleta</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Páginas */}
                <div style={card}>
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ ...sectionTitle, margin: '0 0 2px' }}>Páginas del Storefront</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: C.gray400 }}>Se activan según los módulos de Step 1</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sfPages.map(page => {
                      const missing = !!(page.requiresModule && !selected.has(page.requiresModule));
                      const Icon = page.icon;
                      return (
                        <div key={page.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '5px', backgroundColor: page.enabled && !missing ? C.orange10 : C.gray50, border: `1px solid ${page.enabled && !missing ? `${C.orange}30` : C.gray100}`, opacity: missing ? 0.5 : 1 }}>
                          <Icon size={13} color={page.enabled && !missing ? C.orange : C.gray400} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.76rem', fontWeight: '500', color: C.gray800 as any }}>{page.label}</p>
                            <p style={{ margin: 0, fontSize: '0.63rem', color: C.gray400, fontFamily: 'monospace' }}>{page.path}{missing && <span style={{ color: C.amber, fontFamily: 'inherit', marginLeft: '4px' }}>· falta {page.requiresModule}</span>}</p>
                          </div>
                          <SlimToggle on={page.enabled && !missing} onChange={() => setSfPages(prev => prev.map(p => p.id === page.id && !p.alwaysOn ? { ...p, enabled: !p.enabled } : p))} disabled={!!page.alwaysOn || missing} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Secciones del Home */}
                <div style={card}>
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ ...sectionTitle, margin: '0 0 2px' }}>Secciones del Home</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: C.gray400 }}>Contenido visible en la página principal</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {homeSections.map((sec, idx) => {
                      const missing = !!(sec.requiresModule && !selected.has(sec.requiresModule));
                      const Icon = sec.icon;
                      return (
                        <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '5px', backgroundColor: sec.enabled && !missing ? C.orange10 : C.gray50, border: `1px solid ${sec.enabled && !missing ? `${C.orange}30` : C.gray100}`, opacity: missing ? 0.5 : 1 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: '600', color: C.gray300, minWidth: '16px', fontFamily: 'monospace' }}>{String(idx + 1).padStart(2, '0')}</span>
                          <Icon size={12} color={sec.enabled && !missing ? C.orange : C.gray400} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.76rem', fontWeight: '500', color: C.gray800 as any }}>{sec.label}</p>
                            <p style={{ margin: 0, fontSize: '0.63rem', color: C.gray400 }}>{sec.description}{missing && <span style={{ color: C.amber, marginLeft: '4px' }}>· falta {sec.requiresModule}</span>}</p>
                          </div>
                          <SlimToggle on={sec.enabled && !missing} onChange={() => setHomeSections(prev => prev.map(s => s.id === sec.id ? { ...s, enabled: !s.enabled } : s))} disabled={missing} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <button onClick={() => setStep('config')} style={btnGhost}>← Volver</button>
              <button disabled={!storeName} onClick={() => storeName && setStep('done')} style={btnPrimary(!!storeName)}>
                <Rocket size={14} /> Generar proyecto <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          STEP 4 — Output
      ════════════════════════════════════════ */}
      {step === 'done' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Header */}
            <div style={{ backgroundColor: C.white, border: `1px solid ${C.gray200}`, borderRadius: '8px', padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: C.orange10, border: `1px solid ${C.orange20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Rocket size={20} color={C.orange} />
              </div>
              <h2 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: '700', color: C.gray900, letterSpacing: '-0.01em' }}>
                <span style={{ color: C.orange }}>{storeName}</span> está listo
              </h2>
              <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: C.gray400 }}>
                {totalSelected} módulos · {totalSubs} proveedores · {allEnvVars.length} variables
              </p>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {[
                  { label: primaryColor, style: { backgroundColor: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}30` } },
                  { label: storeCurrency, style: { backgroundColor: C.green10, color: C.green, border: `1px solid #D1FAE5` } },
                  { label: `${homeSections.filter(s => s.enabled).length} secciones`, style: { backgroundColor: C.gray50, color: C.gray600, border: `1px solid ${C.gray200}` } },
                  { label: `${sfPages.filter(p => p.enabled).length} páginas`, style: { backgroundColor: C.gray50, color: C.gray600, border: `1px solid ${C.gray200}` } },
                ].map((chip, i) => (
                  <span key={i} style={{ fontSize: '0.72rem', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', fontFamily: i === 0 ? 'monospace' : 'inherit', ...chip.style }}>{chip.label}</span>
                ))}
              </div>
            </div>

            {/* Archivos descargables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* .env.example */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 1px', fontSize: '0.8rem', fontWeight: '600', color: C.gray900, fontFamily: 'monospace' }}>.env.example</p>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: C.gray400 }}>{allEnvVars.length} variables</p>
                  </div>
                </div>
                <div style={{ ...codeBlock, maxHeight: '200px', marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 8px', color: '#4B5563', fontSize: '0.65rem' }}># {projectName}</p>
                  {allEnvVars.map(v => (
                    <p key={v} style={{ margin: '1px 0', color: '#8B949E', fontSize: '0.7rem' }}>
                      <span style={{ color: '#79C0FF' }}>{v}</span>
                      <span style={{ color: '#4B5563' }}>=</span>
                      <span style={{ color: '#7EE787' }}>{v === 'VITE_STORE_NAME' ? `"${storeName}"` : v === 'VITE_CURRENCY' ? `"${storeCurrency}"` : v === 'VITE_PRIMARY_COLOR' ? `"${primaryColor}"` : v === 'VITE_SECONDARY_COLOR' ? `"${secondaryColor}"` : '""'}</span>
                    </p>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => download(buildEnvContent(), '.env.example', 'text/plain')} style={{ ...btnPrimary(), flex: 1, justifyContent: 'center', fontSize: '0.76rem', padding: '7px' }}>
                    <Download size={12} /> Descargar
                  </button>
                  <button onClick={() => copyText(buildEnvContent(), setCopied)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flex: 1, justifyContent: 'center', padding: '7px', borderRadius: '5px', border: `1px solid ${copied ? C.green : C.gray200}`, backgroundColor: copied ? C.green10 : C.white, color: copied ? C.green : C.gray600, fontSize: '0.76rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {copied ? <><CheckCheck size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
              </div>

              {/* charlie.config.json */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 1px', fontSize: '0.8rem', fontWeight: '600', color: C.gray900, fontFamily: 'monospace' }}>charlie.config.json</p>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: C.gray400 }}>Configuración completa del proyecto</p>
                  </div>
                  <FileJson size={14} color={C.gray300} />
                </div>
                <div style={{ ...codeBlock, maxHeight: '200px', marginBottom: '12px' }}>
                  {buildConfigJson().split('\n').map((line, i) => {
                    const isStrVal = /: "/.test(line);
                    const isBrace  = /^[\s]*[{}\[\],]$/.test(line.trim());
                    return (
                      <p key={i} style={{ margin: 0, fontSize: '0.7rem', color: isBrace ? '#4B5563' : isStrVal ? '#7EE787' : '#79C0FF', whiteSpace: 'pre', lineHeight: '1.6' }}>{line}</p>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => download(buildConfigJson(), 'charlie.config.json', 'application/json')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flex: 1, justifyContent: 'center', padding: '7px', borderRadius: '5px', border: 'none', backgroundColor: C.gray900, color: C.white, fontSize: '0.76rem', fontWeight: '500', cursor: 'pointer' }}>
                    <Download size={12} /> Descargar
                  </button>
                  <button onClick={() => copyText(buildConfigJson(), setCopiedJson)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flex: 1, justifyContent: 'center', padding: '7px', borderRadius: '5px', border: `1px solid ${copiedJson ? C.green : C.gray200}`, backgroundColor: copiedJson ? C.green10 : C.white, color: copiedJson ? C.green : C.gray600, fontSize: '0.76rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {copiedJson ? <><CheckCheck size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Pasos siguientes */}
            <div style={card}>
              <p style={sectionTitle}>Próximos pasos</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { n: '01', title: 'Clonar template',           cmd: `git clone https://github.com/CharlieUY711/oddy-template ${projectName}` },
                  { n: '02', title: 'Copiar archivos de config', cmd: `Mover .env.example y charlie.config.json a la raíz del repo` },
                  { n: '03', title: 'Completar variables',       cmd: `mv .env.example .env  →  completar valores reales` },
                  { n: '04', title: 'Instalar dependencias',     cmd: `cd ${projectName} && pnpm install` },
                  { n: '05', title: 'Configurar Supabase',       cmd: 'supabase.com → nuevo proyecto → copiar URL y anon key' },
                  { n: '06', title: 'Deploy',                    cmd: 'Conectar repo a Vercel / Netlify → deploy automático en push' },
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: C.orange10, border: `1px solid ${C.orange20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: C.orange }}>{s.n}</span>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '0.78rem', fontWeight: '600', color: C.gray900 }}>{s.title}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: C.gray500, fontFamily: 'monospace', backgroundColor: C.gray50, padding: '3px 7px', borderRadius: '4px', border: `1px solid ${C.gray100}` }}>{s.cmd}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aplicar a tenant */}
              <div style={{ marginTop: '24px', padding: '20px', backgroundColor: C.orange10, borderRadius: '12px', border: `1px solid ${C.orange20}` }}>
                <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.875rem', color: C.orange }}>
                  Aplicar módulos a un tenant
                </p>
                <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: C.gray500 }}>
                  Actualiza tenant_config.modulos en Supabase Charlie para el tenant indicado.
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={tenantSlug}
                    onChange={e => { setTenantSlug(e.target.value); setApplyResult(null); setLoadResult(null); }}
                    placeholder="slug del tenant (ej: oddy)"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: `1px solid ${C.gray200}`, fontSize: '0.875rem', outline: 'none' }}
                  />
                  <button
                    onClick={loadTenant}
                    disabled={!tenantSlug.trim() || loadingTenant}
                    style={btnGhost}
                  >
                    {loadingTenant ? 'Cargando...' : '← Cargar'}
                  </button>
                  <button
                    onClick={handleApplyToTenant}
                    disabled={!tenantSlug.trim() || applyingTenant}
                    style={btnPrimary(!!tenantSlug.trim() && !applyingTenant)}
                  >
                    {applyingTenant ? 'Aplicando...' : 'Aplicar →'}
                  </button>
                </div>
                {applyResult === 'ok' && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>
                    ✅ Módulos aplicados correctamente a "{tenantSlug}"
                  </p>
                )}
                {applyResult === 'error' && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: C.red, fontWeight: 600 }}>
                    ❌ Error al aplicar. Verificá que el tenant existe.
                  </p>
                )}
                {loadResult === 'ok'  && <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#16A34A' }}>✅ Módulos de "{tenantSlug}" cargados — revisá y modificá en el paso 1</p>}
                {loadResult === 'error' && <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: C.red }}>❌ Tenant no encontrado. Verificá el slug.</p>}
              </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <button onClick={resetAll} style={btnGhost}>← Nuevo proyecto</button>
              <a href="https://github.com/CharlieUY711" target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, textDecoration: 'none', backgroundColor: C.gray900, color: C.white, border: 'none' }}>
                <ExternalLink size={13} /> Ver en GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
