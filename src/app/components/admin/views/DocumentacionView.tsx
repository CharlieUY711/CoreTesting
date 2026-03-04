/* =====================================================
   DocumentacionView — Módulo de Documentación
   Charlie Marketplace Builder v1.5
   Vista: Sistema → Documentación
   Nivel 1: Edición manual + versioning
   Preparado para Nivel 2: auto-update desde cambios del sistema
   ===================================================== */
import React, { useState, useCallback } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { useOrchestrator } from '../../../../shells/DashboardShell/app/providers/OrchestratorProvider';
import {
  BookOpen, FileText, Code, Settings, Shield, Package,
  Plug, Truck, ShoppingCart, Wrench, ChevronRight,
  Edit2, Save, X, Clock, Tag, Plus, History,
  AlertTriangle, CheckCircle, Users, Globe, Zap,
  ChevronDown, Lock,
} from 'lucide-react';
import { toast } from 'sonner';

const ORANGE = '#FF6835';
interface Props { onNavigate: (s: MainSection) => void; }

/* ── Tipos ── */
type DocTab = 'usuario' | 'tecnica';

interface VersionEntry {
  version: string;
  date: string;
  author: string;
  summary: string;
}

interface DocSection {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  tecnica: boolean;  // true = solo Admin/Editor/SuperAdmin
  content: string;
  versions: VersionEntry[];
  lastModified: string;
  currentVersion: string;
}

/* ── Contenido inicial de las secciones ── */
const INITIAL_SECTIONS: DocSection[] = [
  {
    id: 'introduccion',
    label: 'Introducción & Overview',
    icon: BookOpen,
    color: ORANGE,
    tecnica: false,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'Carlos M.', summary: 'Release inicial de documentación oficial.' },
      { version: 'v1.4.0', date: '15 Ene 2026', author: 'Carlos M.', summary: 'Actualización de módulos de marketing.' },
    ],
    content: `# Charlie Marketplace Builder v1.5

**Charlie** es una plataforma empresarial modular diseñada para gestionar eCommerce, logística, marketing, ERP y más desde un único panel de control.

## ¿Qué incluye?

- **68 módulos activos** organizados en 7 grandes áreas
- **Multi-país y multi-tenant**: soporte para UY, AR y expansión regional
- **Multi-rol**: 5 niveles de acceso configurables (Cliente, Colaborador, Editor, Administrador, SuperAdmin)
- **Paleta de diseño**: Naranja (#FF6835), Negro y Blanco

## Áreas principales

| Área | Descripción |
|------|-------------|
| eCommerce | Pedidos, productos, clientes, pagos, envíos |
| Marketing | Campañas, email, RRSS, SEO, sorteos |
| Gestión ERP | Inventario, facturación, RRHH, CRM |
| Logística | Transportistas, rutas, fulfillment |
| Herramientas | OCR, editor, presupuestos, QR |
| Integraciones | Pagos, logística, RRSS, tiendas |
| Sistema | Config, auditoría, documentación |

## Versión actual: v1.5.0
Fecha de release: 21 de febrero de 2026
`,
  },
  {
    id: 'guia-inicio',
    label: 'Guía de inicio rápido',
    icon: Zap,
    color: '#10B981',
    tecnica: false,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'María G.', summary: 'Guía completa para nuevos usuarios.' },
    ],
    content: `# Guía de Inicio Rápido

## Paso 1: Acceder al sistema

1. Ingresá a **charlie.io/admin**
2. Usá tu email y contraseña asignados
3. El sistema te llevará a tu **Dashboard personalizado** según tu rol

## Paso 2: Navegación

El panel izquierdo (sidebar naranja) contiene todos los módulos disponibles para tu rol:

- 🏠 **Dashboard** — Vista general de métricas
- 🛒 **eCommerce** — Gestión de ventas
- 📣 **Marketing** — Campañas y comunicación
- 📊 **Gestión** — ERP completo
- 🚚 **Logística** — Envíos y rutas
- 🔧 **Herramientas** — Suite de trabajo
- ⚙️ **Sistema** — Configuración

## Paso 3: Tu primer pedido

1. Ir a **eCommerce → Pedidos**
2. Click en **"Nuevo Pedido"**
3. Buscar el cliente o crearlo
4. Agregar productos del catálogo
5. Seleccionar método de pago y envío
6. Confirmar

## Paso 4: Personalizar tu perfil

Ve a **Sistema → Dashboard de Usuario** para ver tu vista personalizada y ajustar preferencias.
`,
  },
  {
    id: 'modulos',
    label: 'Módulos del sistema',
    icon: Package,
    color: '#3B82F6',
    tecnica: false,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'Carlos M.', summary: 'Documentación de los 68 módulos activos.' },
    ],
    content: `# Módulos del Sistema

## eCommerce (12 módulos)
Gestión completa del ciclo de ventas.

- **Pedidos**: Crear, editar y trackear órdenes
- **Clientes**: CRM básico y perfiles
- **Productos**: Catálogo con variantes y precios
- **Pagos**: Historial y gestión de cobros
- **Envíos**: Tracking y gestión logística
- **Storefront**: Vista pública del comercio
- **POS**: Punto de venta presencial
- **Second Hand**: Marketplace de usados

## Marketing (8 módulos)
Herramientas de comunicación y crecimiento.

- **Campañas**: Email y push notifications
- **RRSS Hub**: Meta Business, TikTok, Instagram
- **SEO**: Optimización de motores de búsqueda
- **Mailing**: Gestión de listas y envíos masivos
- **Fidelización**: Programa de puntos y recompensas
- **Rueda de Sorteos**: Gamificación para clientes
- **Google Ads**: Integración publicitaria

## Gestión ERP (10 módulos)
Suite empresarial completa.

- **Inventario**: Stock, alertas y movimientos
- **Facturación**: Comprobantes electrónicos
- **Compras**: Órdenes de compra a proveedores
- **RRHH**: Personal, liquidaciones y ausencias
- **CRM**: Pipeline de ventas y contactos
- **Contabilidad**: Asientos y reportes financieros
- **Proyectos**: Gestión ágil de proyectos

## Sistema (6 módulos)
Configuración y control del sistema.

- **Dashboard Admin**: Métricas de administración
- **Dashboard Usuario**: Vista personalizada por rol
- **Config. Vistas**: Permisos granulares por rol
- **Documentación**: Esta sección
- **Diseño & Pruebas**: UI preview y testing
- **Checklist & Roadmap**: Estado del proyecto
`,
  },
  {
    id: 'integraciones-doc',
    label: 'Integraciones & Pasarelas',
    icon: Plug,
    color: '#14B8A6',
    tecnica: false,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'Carlos M.', summary: 'Guía de integraciones disponibles.' },
    ],
    content: `# Integraciones & Pasarelas de Pago

## Pasarelas de Pago disponibles

### Mercado Pago 🟡
La pasarela principal para mercado latinoamericano.
- Checkout transparente y redirect
- Pagos con tarjeta, efectivo, transferencia
- Suscripciones y pagos recurrentes
- **Estado**: Activo

### Plexo 🔵
Orquestador de pagos multi-adquirente para Uruguay.
- Visa, Mastercard, OCA, Cabal
- ANDA, BPS, Club del Este
- **Estado**: En configuración

### Transferencia bancaria
- BROU, Santander, ITAÚ, BBVA, Scotiabank
- **Estado**: Activo

### Efectivo / Contra entrega
- **Estado**: Activo

## Integraciones Logísticas

| Proveedor | País | Estado |
|-----------|------|--------|
| Correo UY | UY | Disponible |
| Correo UY | UY | Disponible |
| PedidosYa | UY/AR | Disponible |

## RRSS Conectadas

- **Meta Business**: Facebook + Instagram Ads
- **TikTok for Business**: Ads y catálogo
- **Google Ads**: Campañas de búsqueda y shopping

## Tiendas Marketplace

- **Mercado Libre**: Sincronización de catálogo
- **Shopify**: Import/Export de productos
`,
  },
  {
    id: 'faq',
    label: 'Preguntas frecuentes',
    icon: Users,
    color: '#8B5CF6',
    tecnica: false,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'María G.', summary: 'FAQ inicial del sistema.' },
    ],
    content: `# Preguntas Frecuentes

## General

**¿Qué es Charlie Marketplace Builder?**
Charlie es una plataforma all-in-one para gestionar tu negocio digital: ventas, logística, marketing, ERP y más desde un único panel.

**¿Funciona para múltiples países?**
Sí. Charlie es multi-país (Uruguay, Brasil, Latam) con soporte multi-moneda y multi-impuestos.

**¿Puedo tener múltiples tiendas?**
Sí, la arquitectura es multi-tenant. Cada tenant tiene su propia configuración, datos y usuarios.

## Acceso y roles

**¿Cómo recupero mi contraseña?**
En la pantalla de login, click en "Olvidé mi contraseña". Recibirás un email con el link de recuperación.

**¿Qué diferencia hay entre un Editor y un Colaborador?**
- **Colaborador**: Gestión operativa (pedidos, clientes, tareas)
- **Editor**: Acceso completo a marketing, contenido y RRSS. Sin acceso a sistema/config.

**¿Un cliente puede ver el panel admin?**
No. Los clientes acceden al Storefront público. El panel admin es solo para roles internos.

## Pedidos y pagos

**¿Puedo procesar devoluciones?**
Sí, desde eCommerce → Pedidos → Devoluciones (requiere rol Administrador).

**¿Mercado Pago cobra comisión?**
Sí, según el plan contratado con MP. Charlie no agrega comisión adicional.

## Técnico

**¿Dónde están los logs del sistema?**
En Sistema → Auditoría → System Logs.

**¿Con qué frecuencia se hace backup?**
Backup automático diario a las 03:00 AM. También podés ejecutar backup manual desde Auditoría.
`,
  },

  /* ── SECCIONES TÉCNICAS ── */
  {
    id: 'arquitectura',
    label: 'Arquitectura del sistema',
    icon: Code,
    color: '#1F2937',
    badge: 'Técnico',
    tecnica: true,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'Carlos M.', summary: 'Documentación arquitectura v1.5.' },
      { version: 'v1.4.0', date: '15 Ene 2026', author: 'Carlos M.', summary: 'Migración a Supabase Edge Functions.' },
    ],
    content: `# Arquitectura del Sistema

## Stack tecnológico

\`\`\`
Frontend:    React 18.3 + TypeScript + Vite 6.3 + Tailwind CSS v4
Backend:     Supabase Edge Functions + Hono + Deno
Database:    PostgreSQL (Supabase managed)
Auth:        Supabase Auth (JWT)
Storage:     Supabase Storage (S3-compatible)
Deploy:      Vercel / Netlify (frontend) + Supabase (backend)
\`\`\`

## Arquitectura tres capas

\`\`\`
[Frontend React]  →  [Supabase Edge Function / Hono]  →  [PostgreSQL]
     ↕                          ↕
[Supabase Auth]         [Supabase Storage]
\`\`\`

## Estructura de directorios

\`\`\`
/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Entry point
│   │   ├── AdminDashboard.tsx         # Shell principal + routing
│   │   ├── routes.tsx                 # React Router config
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminSidebar.tsx   # Sidebar naranja colapsable
│   │   │   │   ├── HubView.tsx        # Componente hub reutilizable
│   │   │   │   ├── OrangeHeader.tsx   # Header estándar de módulo
│   │   │   │   └── views/             # ~70 vistas de módulos
│   │   │   └── ui/                    # Componentes UI genéricos
│   │   └── storefront/                # Vistas públicas del storefront
│   └── styles/
│       ├── theme.css                  # Tokens de diseño
│       └── fonts.css                  # Tipografías
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx              # Servidor Hono principal
│           └── kv_store.tsx           # KV Store utilities
└── utils/
    └── supabase/
        └── info.tsx                   # projectId + publicAnonKey
\`\`\`

## Patrones de diseño

- **HubView Pattern**: Cada módulo principal expone un HubView (estilo RRSS) con cards de acceso a sub-módulos
- **MainSection routing**: El shell AdminDashboard gestiona la navegación por estado (sin React Router para el admin)
- **onNavigate prop**: Todas las vistas reciben \`onNavigate: (s: MainSection) => void\` para navegación interna

## Base de datos

- **Tabla principal**: \`kv_store\` (key-value store flexible)
- **Auth tables**: Gestionadas por Supabase Auth (no tocar directamente)
- **Storage buckets**: Supabase Storage Buckets
`,
  },
  {
    id: 'api-endpoints',
    label: 'API & Endpoints',
    icon: Globe,
    color: '#3B82F6',
    badge: 'Técnico',
    tecnica: true,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'Carlos M.', summary: 'Documentación de endpoints v1.5.' },
    ],
    content: `# API & Endpoints

## Base URL

\`\`\`
https://{projectId}.supabase.co/functions/v1/api
\`\`\`

## Autenticación

Todas las requests requieren el header:
\`\`\`
Authorization: Bearer {publicAnonKey}
\`\`\`

Para rutas protegidas, usar el \`access_token\` del usuario:
\`\`\`
Authorization: Bearer {access_token}
\`\`\`

## Endpoints disponibles

### Carga Masiva
\`\`\`
POST /api/carga-masiva/upload
Content-Type: multipart/form-data

Body: { file: File, tipo: 'productos' | 'clientes' | 'precios' }
Response: { jobId, total, procesados, errores }
\`\`\`

### KV Store (interno)
\`\`\`
GET    /api/kv/{key}
POST   /api/kv/{key}
DELETE /api/kv/{key}
\`\`\`

### Auth
\`\`\`
POST /api/signup
Body: { email, password, name, role }

POST /api/auth/verify
Headers: { Authorization: Bearer token }
\`\`\`

## Respuestas estándar

\`\`\`json
// Éxito
{ "data": {...}, "error": null }

// Error
{ "data": null, "error": { "code": "...", "message": "..." } }
\`\`\`

## CORS

Todos los endpoints responden con:
\`\`\`
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
\`\`\`
`,
  },
  {
    id: 'auth-config',
    label: 'Autenticación & Roles',
    icon: Shield,
    color: '#7C3AED',
    badge: 'Técnico',
    tecnica: true,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'Carlos M.', summary: 'Config de Supabase Auth + roles.' },
    ],
    content: `# Autenticación & Configuración de Roles

## Supabase Auth

Charlie usa Supabase Auth con JWT para la autenticación de usuarios.

### Flujo de registro
\`\`\`typescript
// Llamar al endpoint del servidor (usa service role key)
POST /api/signup
{
  email: "user@example.com",
  password: "secure-password",
  name: "Nombre Apellido",
  role: "Editor"
}
\`\`\`

### Flujo de login (frontend)
\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

const accessToken = data.session?.access_token;
\`\`\`

### Verificar sesión activa
\`\`\`typescript
const { data: { session } } = await supabase.auth.getSession();
if (session?.access_token) {
  // Usuario logueado
}
\`\`\`

## Sistema de roles

Los roles se almacenan en \`user_metadata\` de Supabase Auth:

\`\`\`json
{
  "role": "Editor",
  "name": "Diego López",
  "tenant_id": "empresa-xyz"
}
\`\`\`

### Jerarquía de roles

| Rol | Nivel | Acceso |
|-----|-------|--------|
| SuperAdmin | 5 | Total |
| Administrador | 4 | Avanzado |
| Editor | 3 | Editorial |
| Colaborador | 2 | Operativo |
| Cliente | 1 | Básico |

## Variables de entorno requeridas

\`\`\`bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Solo backend
SUPABASE_DB_URL=postgresql://...
\`\`\`

⚠️ **IMPORTANTE**: Nunca exponer \`SUPABASE_SERVICE_ROLE_KEY\` en el frontend.
`,
  },
  {
    id: 'changelog',
    label: 'Changelog & Versiones',
    icon: History,
    color: '#F59E0B',
    badge: 'Técnico',
    tecnica: true,
    currentVersion: 'v1.5.0',
    lastModified: '21 Feb 2026',
    versions: [
      { version: 'v1.5.0', date: '21 Feb 2026', author: 'Carlos M.', summary: 'Release v1.5 — Nuevos módulos y correcciones.' },
    ],
    content: `# Changelog & Versiones

## v1.5.0 — 21 Feb 2026

### Nuevos módulos
- ✅ **AuthRegistroView**: Sistema de autenticación completo con OAuth
- ✅ **CargaMasivaView**: Upload masivo de productos/clientes con backend Hono
- ✅ **MetaBusinessView**: Integración Meta Business (Facebook + Instagram)
- ✅ **UnifiedWorkspaceView**: Workspace unificado para herramientas
- ✅ **AdminDashboardView**: Dashboard de administración del sistema
- ✅ **UserDashboardView**: Dashboard personalizado por rol
- ✅ **ConfigVistasPorRolView**: Configurador granular de permisos
- ✅ **DocumentacionView**: Este módulo de documentación

### Correcciones
- 🔧 \`@supabase/supabase-js\` instalado y configurado correctamente
- 🔧 Constante \`META_BLUE\` reordenada en UnifiedWorkspaceView
- 🔧 Errores de importación corregidos en todos los módulos nuevos

### Mejoras de arquitectura
- Patrón HubView consolidado como componente reutilizable
- AdminSidebar con soporte para secciones anidadas
- OrangeHeader v3.0 con slot derecho flexible

---

## v1.4.0 — 15 Ene 2026

### Nuevos módulos
- ✅ AuditoriaHubView + HealthMonitorView + SystemLogsView
- ✅ RepositorioAPIsView
- ✅ ConstructorView (GitHub integration)
- ✅ 6 workspaces: Biblioteca, Editor, OCR, QR, Documentos, Impresión

### Mejoras
- Migración a Supabase Edge Functions + Hono
- Multi-país: soporte UY + AR
- Sistema de integraciones: 65 proveedores en 6 módulos

---

## v1.3.0 — 10 Dic 2025

### Nuevos módulos
- ✅ Suite completa de integraciones (Pagos, Logística, RRSS, Tiendas, Servicios)
- ✅ ERP completo: Inventario, Facturación, Compras, RRHH, CRM, Contabilidad
- ✅ Logística: Transportistas, Rutas, Fulfillment, Abastecimiento

---

## Próximas versiones (roadmap)

### v1.6.0 (planificado)
- 🔲 GitHub API → generación automática de repositorio desde Constructor
- 🔲 Integración Mercado Pago real (backend conectado)
- 🔲 Integración Plexo (pasarela UY)
- 🔲 Nivel 2 de Config. de Vistas (aplicación en tiempo real)

### v2.0.0 (futuro)
- 🔲 Documentación auto-generada desde JSDoc + GitHub webhooks
- 🔲 Module Marketplace (módulos enterprise portables)
- 🔲 Multi-idioma (ES, EN, PT)
`,
  },
];

/* ── Componente principal ── */
export function DocumentacionView({ onNavigate: _ }: Props) {
  const { clienteNombre } = useOrchestrator();
  const [activeTab,    setActiveTab]    = useState<DocTab>('usuario');
  const [activeSec,    setActiveSec]    = useState('introduccion');
  const [editing,      setEditing]      = useState(false);
  const [editContent,  setEditContent]  = useState('');
  const [showHistory,  setShowHistory]  = useState(false);
  const [sections,     setSections]     = useState<DocSection[]>(INITIAL_SECTIONS);

  /* Simular rol — en producción vendría del contexto de auth */
  const [simulRole, setSimulRole] = useState<'usuario' | 'tecnico'>('tecnico');

  const filteredSections = sections.filter(s =>
    activeTab === 'tecnica' ? s.tecnica : !s.tecnica
  );

  const currentSec = sections.find(s => s.id === activeSec)
    ?? filteredSections[0]
    ?? sections[0];

  const handleEdit = () => {
    setEditContent(currentSec.content);
    setEditing(true);
    setShowHistory(false);
  };

  const handleSave = useCallback(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' });

    setSections(prev => prev.map(s => {
      if (s.id !== currentSec.id) return s;
      const parts = s.currentVersion.replace('v', '').split('.');
      const newPatch = parseInt(parts[2] || '0') + 1;
      const newVersion = `v${parts[0]}.${parts[1]}.${newPatch}`;
      return {
        ...s,
        content: editContent,
        lastModified: dateStr,
        currentVersion: newVersion,
        versions: [
          { version: newVersion, date: dateStr, author: 'SuperAdmin', summary: 'Edición manual desde el módulo de documentación.' },
          ...s.versions,
        ],
      };
    }));

    setEditing(false);
    toast.success('Documentación guardada', { description: `Sección "${currentSec.label}" actualizada con nueva versión.` });
  }, [currentSec, editContent]);

  const handleCancel = () => {
    setEditing(false);
    setEditContent('');
  };

  /* Renderizar markdown básico como HTML */
  const renderContent = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 style="font-size:0.95rem;font-weight:700;color:#1A1A2E;margin:18px 0 8px;">$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2 style="font-size:1.1rem;font-weight:800;color:#1A1A2E;margin:22px 0 10px;padding-bottom:6px;border-bottom:2px solid #F3F4F6;">$2</h2>')
      .replace(/^# (.+)$/gm,   '<h1 style="font-size:1.35rem;font-weight:900;color:#1A1A2E;margin:0 0 18px;">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:0.82em;font-family:monospace;color:#374151;">$1</code>')
      .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre style="background:#1F2937;color:#E5E7EB;padding:16px;border-radius:10px;font-size:0.78rem;overflow-x:auto;line-height:1.6;margin:14px 0;">$1</pre>')
      .replace(/^\| (.+) \|$/gm, (match) => {
        const cells = match.split('|').filter(c => c.trim() && !c.match(/^[-\s]+$/));
        return '<tr>' + cells.map(c => `<td style="padding:6px 12px;border:1px solid #E5E7EB;font-size:0.8rem;">${c.trim()}</td>`).join('') + '</tr>';
      })
      .replace(/^- (.+)$/gm, '<li style="font-size:0.85rem;color:#374151;margin:5px 0;line-height:1.5;">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="margin:10px 0 10px 20px;padding:0;">$&</ul>')
      .replace(/\n\n/g, '</p><p style="margin:0 0 12px;font-size:0.85rem;color:#374151;line-height:1.6;">')
      .replace(/^(?!<[hupltc])/gm, '')
      .replace(/⚠️/g, '<span style="color:#F59E0B;">⚠️</span>');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      <OrangeHeader
        icon={BookOpen}
        title="Documentación"
        subtitle={`${clienteNombre} · Sistema de Gestión`}
        rightSlot={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: '500' }}>Vista como:</span>
            {(['usuario', 'tecnico'] as const).map(r => (
              <button
                key={r}
                onClick={() => setSimulRole(r)}
                style={{
                  padding: '5px 12px', borderRadius: 7,
                  border: `1.5px solid ${simulRole === r ? ORANGE : '#E5E7EB'}`,
                  backgroundColor: simulRole === r ? `${ORANGE}10` : '#fff',
                  color: simulRole === r ? ORANGE : '#6B7280',
                  fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                }}
              >
                {r === 'usuario' ? '👤 Usuario' : '🔧 Técnico'}
              </button>
            ))}
          </div>
        }
      />

      {/* ── Tabs de tipo de doc ── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 28px', display: 'flex', gap: 0, flexShrink: 0 }}>
        {([['usuario', BookOpen, 'Documentación de Usuario', 'Todos los roles'], ['tecnica', Code, 'Documentación Técnica', 'Admin · Editor · SuperAdmin']] as const).map(([tab, Icon, label, desc]) => {
          const active = tab === activeTab;
          const locked = tab === 'tecnica' && simulRole === 'usuario';
          return (
            <button
              key={tab}
              onClick={() => {
                if (locked) { toast.warning('Solo disponible para Admin, Editor y SuperAdmin'); return; }
                setActiveTab(tab);
                setEditing(false);
                const firstSec = INITIAL_SECTIONS.find(s => tab === 'tecnica' ? s.tecnica : !s.tecnica);
                if (firstSec) setActiveSec(firstSec.id);
              }}
              style={{
                padding: '14px 22px', border: 'none',
                borderBottom: active ? `3px solid ${ORANGE}` : '3px solid transparent',
                backgroundColor: 'transparent',
                color: active ? ORANGE : locked ? '#D1D5DB' : '#6B7280',
                fontSize: '0.85rem', fontWeight: active ? '800' : '600',
                cursor: locked ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              {locked ? <Lock size={13} color='#D1D5DB' /> : <Icon size={14} color={active ? ORANGE : '#9CA3AF'} />}
              <div style={{ textAlign: 'left' }}>
                <div>{label}</div>
                <div style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: '400' }}>{desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Layout: sidebar + contenido ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* Sidebar de secciones */}
        <div style={{ width: 240, borderRight: '1px solid #E5E7EB', backgroundColor: '#fff', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '16px 16px 8px' }}>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Secciones
            </p>
          </div>
          {filteredSections.map(sec => {
            const active = sec.id === activeSec;
            return (
              <button
                key={sec.id}
                onClick={() => { setActiveSec(sec.id); setEditing(false); setShowHistory(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '10px 16px', border: 'none',
                  backgroundColor: active ? `${sec.color}10` : 'transparent',
                  borderLeft: active ? `3px solid ${sec.color}` : '3px solid transparent',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.12s',
                }}
              >
                <sec.icon size={14} color={active ? sec.color : '#9CA3AF'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: active ? '700' : '500', color: active ? sec.color : '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {sec.label}
                  </p>
                  {sec.badge && (
                    <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#9CA3AF', backgroundColor: '#F3F4F6', padding: '1px 5px', borderRadius: 4 }}>
                      {sec.badge}
                    </span>
                  )}
                </div>
                {active && <ChevronRight size={12} color={sec.color} />}
              </button>
            );
          })}
        </div>

        {/* Área de contenido */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Meta info de la sección */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${currentSec.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <currentSec.icon size={18} color={currentSec.color} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1A1A2E' }}>{currentSec.label}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: currentSec.color, backgroundColor: `${currentSec.color}15`, padding: '2px 8px', borderRadius: 5 }}>
                    {currentSec.currentVersion}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} /> {currentSec.lastModified}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => { setShowHistory(!showHistory); setEditing(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  border: '1.5px solid #E5E7EB', backgroundColor: showHistory ? '#F3F4F6' : '#fff',
                  color: '#6B7280', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                }}
              >
                <History size={13} /> Historial
              </button>
              {!editing && (
                <button
                  onClick={handleEdit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8,
                    border: 'none', backgroundColor: ORANGE,
                    color: '#fff', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
                  }}
                >
                  <Edit2 size={13} /> Editar
                </button>
              )}
              {editing && (
                <>
                  <button
                    onClick={handleCancel}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB', backgroundColor: '#fff', color: '#6B7280', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    <X size={13} /> Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', backgroundColor: '#10B981', color: '#fff', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    <Save size={13} /> Guardar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Historial de versiones */}
          {showHistory && (
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '18px 20px', marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '0.88rem', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: 7 }}>
                <History size={15} color={ORANGE} /> Historial de versiones — {currentSec.label}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentSec.versions.map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < currentSec.versions.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: i === 0 ? ORANGE : '#6B7280', backgroundColor: i === 0 ? `${ORANGE}15` : '#F3F4F6', padding: '3px 9px', borderRadius: 6, flexShrink: 0 }}>
                      {v.version}
                    </span>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '0.8rem', color: '#374151', fontWeight: '600' }}>{v.summary}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#9CA3AF' }}>{v.author} · {v.date}</p>
                    </div>
                    {i === 0 && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: '700', color: '#10B981', backgroundColor: '#D1FAE5', padding: '2px 7px', borderRadius: 5 }}>
                        Actual
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor o Vista */}
          {editing ? (
            <div>
              <div style={{ marginBottom: 12, padding: '10px 14px', backgroundColor: '#FFFBEB', borderRadius: 8, border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: 7 }}>
                <AlertTriangle size={14} color='#F59E0B' />
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#92400E' }}>
                  Editando en formato Markdown. Al guardar se creará una nueva versión automáticamente.
                </p>
              </div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                style={{
                  width: '100%', minHeight: 480,
                  padding: '20px', borderRadius: 12,
                  border: `2px solid ${ORANGE}40`,
                  fontSize: '0.84rem', lineHeight: '1.7',
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  color: '#1A1A2E', backgroundColor: '#FAFAFA',
                  outline: 'none', resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ) : (
            <div
              style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '28px 32px', lineHeight: '1.7' }}
              dangerouslySetInnerHTML={{ __html: renderContent(currentSec.content) }}
            />
          )}

          {/* Footer de sección */}
          {!editing && (
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: 10, border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <CheckCircle size={13} color='#10B981' />
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Última actualización: <strong>{currentSec.lastModified}</strong> · Versión <strong>{currentSec.currentVersion}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={12} color='#9CA3AF' />
                <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                  Charlie Marketplace Builder · Nivel 1 — Edición manual
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

