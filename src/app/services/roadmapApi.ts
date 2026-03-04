/* =====================================================
   Roadmap API Service — Frontend ↔ Backend
   Migrado a supabase.from() directo para evitar CORS
   ===================================================== */
import { supabase } from '../../utils/supabase/client';
import { MODULE_MANIFEST } from '../utils/moduleManifest';
import { MODULES_DATA } from '../utils/modulesData';

// Mapa de enriquecimiento: id (section) → datos base de MODULES_DATA
const BASE_DATA_MAP = new Map<string, { name: string; category: string; description: string; estimatedHours?: number; submodules?: any[] }>();
MODULES_DATA.forEach(m => {
  BASE_DATA_MAP.set(m.id, m);
});

/** Convierte un section ID a nombre legible: 'mapa-envios' → 'Mapa Envios' */
function sectionToName(section: string): string {
  return section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Infiere category desde section ID */
function sectionToCategory(section: string): string {
  if (['dashboard','sistema','departamentos','checklist','diseno','auth-registro','config-vistas','documentacion','metamap-config'].includes(section)) return 'admin';
  if (['personas','organizaciones','clientes'].includes(section)) return 'admin';
  if (['ecommerce','pedidos','pagos','metodos-pago','metodos-envio','pos','storefront','secondhand','carga-masiva'].includes(section)) return 'ecommerce';
  if (['logistica','envios','transportistas','rutas','vehiculos','depositos','inventario','entregas','fulfillment','produccion','abastecimiento','mapa-envios','tracking-publico','etiqueta-emotiva'].includes(section)) return 'logistics';
  if (['marketing','google-ads','mailing','seo','fidelizacion','rueda-sorteos','redes-sociales','migracion-rrss','rrss','meta-business'].includes(section)) return 'marketing';
  if (['herramientas','biblioteca','editor-imagenes','gen-documentos','gen-presupuestos','ocr','impresion','qr-generator','ideas-board','unified-workspace','google-maps-test'].includes(section)) return 'tools';
  if (['gestion','erp-inventario','erp-facturacion','erp-compras','erp-crm','erp-contabilidad','erp-rrhh','proyectos'].includes(section)) return 'erp';
  if (['integraciones','integraciones-pagos','integraciones-logistica','integraciones-tiendas','integraciones-rrss','integraciones-servicios','integraciones-marketplace','integraciones-comunicacion','integraciones-identidad','integraciones-api-keys','integraciones-webhooks','integraciones-apis'].includes(section)) return 'integrations';
  if (['auditoria','auditoria-health','auditoria-logs'].includes(section)) return 'audit';
  if (['constructor','roadmap','dashboard-admin','dashboard-usuario'].includes(section)) return 'builder';
  return 'admin';
}

// ── Tipos ────────────────────────────────────────────────────────────────

export type ModuleStatus =
  | 'not-started'
  | 'spec-ready'
  | 'progress-10'
  | 'progress-50'
  | 'progress-80'
  | 'ui-only'
  | 'completed';

export type ModulePriority = 'critical' | 'high' | 'medium' | 'low';

export interface RoadmapModule {
  id: string;
  name?: string;
  category?: string;
  description?: string;
  status: ModuleStatus;
  priority: ModulePriority;
  execOrder?: number;
  estimatedHours?: number;
  notas?: string;
  submodules?: Array<{
    id: string;
    name: string;
    status: ModuleStatus;
    estimatedHours?: number;
  }>;
  tiene_view?: boolean;
  tiene_backend?: boolean;
  endpoint_ok?: boolean;
  tiene_datos?: boolean;
  updated_at?: string;
}

export interface RoadmapTask {
  id: string;
  module_id: string;
  submodule_id?: string;
  nombre: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  responsable?: string;
  fecha_estimada?: string;
  blocker?: string;
  notas?: string;
  orden?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HistorialEntry {
  id: string;
  module_id: string;
  status_anterior?: string;
  status_nuevo: string;
  notas?: string;
  origen: 'manual' | 'auditoria' | 'promocion_idea';
  created_at: string;
}

export interface IdeaPromovida {
  id: string;
  idea_id: string;
  module_id?: string;
  idea_texto: string;
  idea_area?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'convertida';
  notas?: string;
  created_at: string;
}

export interface TaskInput {
  module_id: string;
  submodule_id?: string;
  nombre: string;
  status?: 'todo' | 'in-progress' | 'done' | 'blocked';
  responsable?: string;
  fecha_estimada?: string;
  blocker?: string;
  notas?: string;
  orden?: number;
}

export interface AuditOpts {
  moduleId: string;
  endpointUrl?: string;
  tableName?: string;
  tiene_view?: boolean;
  tiene_backend?: boolean;
}

export interface AuditResult {
  ok: boolean;
  tiene_view?: boolean;
  tiene_backend?: boolean;
  endpoint_ok?: boolean;
  tiene_datos?: boolean;
  status?: ModuleStatus;
  error?: string;
}

export interface PromocionInput {
  idea_id: string;
  idea_texto: string;
  idea_area?: string;
  notas?: string;
}

// ── Helpers (mantenidos para endpoints que aún usan Edge Functions) ────────

import { apiUrl, publicAnonKey } from '../../utils/supabase/client';

const BASE = `${apiUrl}/roadmap`;
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
  'apikey': publicAnonKey,
};

async function apiGet<T>(path: string): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, error: json.error || 'Error en la petición' };
    }
    return { ok: true, data: json };
  } catch (err) {
    console.error(`Roadmap API GET ${path}:`, err);
    return { ok: false, error: String(err) };
  }
}

async function apiPost<T>(path: string, body: any): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, error: json.error || 'Error en la petición' };
    }
    return { ok: true, data: json };
  } catch (err) {
    console.error(`Roadmap API POST ${path}:`, err);
    return { ok: false, error: String(err) };
  }
}

async function apiPut<T>(path: string, body: any): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, error: json.error || 'Error en la petición' };
    }
    return { ok: true, data: json };
  } catch (err) {
    console.error(`Roadmap API PUT ${path}:`, err);
    return { ok: false, error: String(err) };
  }
}

// ── Módulos ───────────────────────────────────────────────────────────────

export async function getModules(): Promise<RoadmapModule[]> {
  try {
    // Obtener estado dinámico desde SQL
    const { data: sqlData, error } = await supabase
      .from('roadmap_modules')
      .select('*')
      .order('exec_order', { ascending: true, nullsFirst: false });
    
    if (error) {
      console.error('[roadmapApi] Error en getModules:', error);
      return [];
    }
    
    // Crear mapa de estado desde SQL (id → estado)
    const stateMap = new Map<string, any>();
    (sqlData ?? []).forEach((row: any) => {
      stateMap.set(row.id, {
        status: row.status,
        priority: row.priority,
        execOrder: row.exec_order,
        estimatedHours: row.estimated_hours,
        notas: row.notas,
        tiene_view: row.tiene_view,
        tiene_backend: row.tiene_backend,
        endpoint_ok: row.endpoint_ok,
        tiene_datos: row.tiene_datos,
        updated_at: row.updated_at,
      });
    });
    
    // Iterar sobre el manifest (fuente única de verdad de secciones/vistas)
    // y enriquecer con datos base de MODULES_DATA cuando exista match por ID legacy
    const modules = MODULE_MANIFEST.map((entry) => {
      const id = entry.section;
      const state = stateMap.get(id);
      const base = BASE_DATA_MAP.get(id);
      return {
        id,
        name: base?.name ?? sectionToName(id),
        category: base?.category ?? sectionToCategory(id),
        description: base?.description ?? entry.notes ?? '',
        status: state?.status ?? 'not-started',
        priority: state?.priority ?? 'medium',
        execOrder: state?.execOrder ?? undefined,
        estimatedHours: state?.estimatedHours ?? base?.estimatedHours ?? undefined,
        notas: state?.notas ?? undefined,
        submodules: base?.submodules?.map(sub => ({
          id: sub.id,
          name: sub.name,
          status: state?.status ?? 'not-started',
          estimatedHours: sub.estimatedHours,
        })),
        tiene_view: state?.tiene_view ?? false,
        tiene_backend: state?.tiene_backend ?? false,
        endpoint_ok: state?.endpoint_ok ?? false,
        tiene_datos: state?.tiene_datos ?? false,
        updated_at: state?.updated_at ?? undefined,
      };
    });
    
    console.log('[roadmapApi] Módulos recibidos:', modules.length);
    return modules;
  } catch (err) {
    console.error('[roadmapApi] Error en getModules:', err);
    return [];
  }
}

export async function saveModulesBulk(modules: RoadmapModule[]): Promise<void> {
  try {
    // Preparar datos para upsert en SQL
    const rows = modules.map(mod => ({
      id: mod.id,
      status: mod.status,
      priority: mod.priority || 'medium',
      exec_order: mod.execOrder ?? null,
      estimated_hours: mod.estimatedHours ?? null,
      notas: mod.notas || null,
      tiene_view: mod.tiene_view ?? false,
      tiene_backend: mod.tiene_backend ?? false,
      endpoint_ok: mod.endpoint_ok ?? false,
      tiene_datos: mod.tiene_datos ?? false,
      updated_at: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('roadmap_modules')
      .upsert(rows, { onConflict: 'id' });
    
    if (error) {
      console.error('[roadmapApi] Error en saveModulesBulk:', error);
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('[roadmapApi] Error en saveModulesBulk:', err);
    throw err;
  }
}

export async function saveModule(moduleId: string, data: Partial<RoadmapModule>): Promise<void> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.execOrder !== undefined) updateData.exec_order = data.execOrder;
    if (data.estimatedHours !== undefined) updateData.estimated_hours = data.estimatedHours;
    if (data.notas !== undefined) updateData.notas = data.notas;
    if (data.tiene_view !== undefined) updateData.tiene_view = data.tiene_view;
    if (data.tiene_backend !== undefined) updateData.tiene_backend = data.tiene_backend;
    if (data.endpoint_ok !== undefined) updateData.endpoint_ok = data.endpoint_ok;
    if (data.tiene_datos !== undefined) updateData.tiene_datos = data.tiene_datos;
    
    const { error } = await supabase
      .from('roadmap_modules')
      .update(updateData)
      .eq('id', moduleId);
    
    if (error) {
      console.error('[roadmapApi] Error en saveModule:', error);
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('[roadmapApi] Error en saveModule:', err);
    throw err;
  }
}

export async function resetModules(): Promise<void> {
  const { error } = await supabase
    .from('roadmap_modules')
    .delete()
    .neq('id', '');
  if (error) throw new Error(error.message);
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function getTasks(moduleId: string): Promise<RoadmapTask[]> {
  const res = await apiGet<{ tasks: RoadmapTask[] }>(`/tasks/${moduleId}`);
  if (!res.ok || !res.data) return [];
  return res.data.tasks || [];
}

export async function createTask(data: TaskInput): Promise<RoadmapTask> {
  const res = await apiPost<{ task: RoadmapTask }>('/tasks', data);
  if (!res.ok || !res.data) throw new Error(res.error || 'Error creando task');
  return res.data.task;
}

export async function updateTask(taskId: string, data: Partial<TaskInput>): Promise<RoadmapTask> {
  const res = await apiPut<{ task: RoadmapTask }>(`/tasks/${taskId}`, data);
  if (!res.ok || !res.data) throw new Error(res.error || 'Error actualizando task');
  return res.data.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('roadmap_tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw new Error(error.message);
}

// ── Historial ────────────────────────────────────────────────────────────

export async function getHistorial(moduleId?: string): Promise<HistorialEntry[]> {
  const path = moduleId ? `/historial/${moduleId}` : '/historial';
  const res = await apiGet<{ historial: HistorialEntry[] }>(path);
  if (!res.ok || !res.data) return [];
  return res.data.historial || [];
}

// ── Auditoría ─────────────────────────────────────────────────────────────

export async function auditModule(moduleId: string, opts: AuditOpts): Promise<AuditResult> {
  const res = await apiPost<AuditResult>('/audit', { moduleId, ...opts });
  if (!res.ok || !res.data) {
    return { ok: false, error: res.error || 'Error en auditoría' };
  }
  return res.data;
}

export async function auditAll(modules: AuditOpts[]): Promise<AuditResult[]> {
  const res = await apiPost<{ ok: boolean; results: AuditResult[] }>('/audit/all', { modules });
  if (!res.ok || !res.data) return [];
  return res.data.results || [];
}

// ── Ideas Promovidas ──────────────────────────────────────────────────────

export async function getIdeasPromovidas(): Promise<IdeaPromovida[]> {
  try {
    const { data, error } = await supabase
      .from('ideas_promovidas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[roadmapApi] Error en getIdeasPromovidas:', error);
      return [];
    }
    
    return (data ?? []).map((row: any) => ({
      id: row.id,
      idea_id: row.idea_id,
      module_id: row.module_id,
      idea_texto: row.idea_texto,
      idea_area: row.idea_area,
      estado: row.estado,
      notas: row.notas,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error('[roadmapApi] Error en getIdeasPromovidas:', err);
    return [];
  }
}

export async function promoverIdea(data: PromocionInput): Promise<IdeaPromovida> {
  try {
    const insertData = {
      idea_id: data.idea_id,
      idea_texto: data.idea_texto,
      idea_area: data.idea_area || null,
      estado: 'pendiente' as const,
      notas: data.notas || null,
    };
    
    const { data: inserted, error } = await supabase
      .from('ideas_promovidas')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error('[roadmapApi] Error en promoverIdea:', error);
      throw new Error(error.message);
    }
    
    return {
      id: inserted.id,
      idea_id: inserted.idea_id,
      module_id: inserted.module_id,
      idea_texto: inserted.idea_texto,
      idea_area: inserted.idea_area,
      estado: inserted.estado,
      notas: inserted.notas,
      created_at: inserted.created_at,
    };
  } catch (err) {
    console.error('[roadmapApi] Error en promoverIdea:', err);
    throw err;
  }
}

export async function resolverIdea(
  id: string,
  estado: 'aprobada' | 'rechazada' | 'convertida',
  moduleId?: string
): Promise<void> {
  try {
    const updateData: any = { estado };
    if (estado === 'convertida' && moduleId) {
      updateData.module_id = moduleId;
    }
    
    const { error } = await supabase
      .from('ideas_promovidas')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error('[roadmapApi] Error en resolverIdea:', error);
      throw new Error(error.message);
    }
    
    // Si se convierte a módulo, crear/actualizar el módulo en roadmap_modules
    if (estado === 'convertida' && moduleId) {
      const { data: idea } = await supabase
        .from('ideas_promovidas')
        .select('idea_texto')
        .eq('id', id)
        .single();
      
      if (idea) {
        await supabase
          .from('roadmap_modules')
          .upsert({
            id: moduleId,
            status: 'spec-ready',
            priority: 'medium',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        
        await supabase
          .from('roadmap_historial')
          .insert({
            module_id: moduleId,
            status_anterior: null,
            status_nuevo: 'spec-ready',
            origen: 'promocion_idea',
            notas: `Convertido desde idea: ${idea.idea_texto}`,
          });
      }
    }
  } catch (err) {
    console.error('[roadmapApi] Error en resolverIdea:', err);
    throw err;
  }
}
