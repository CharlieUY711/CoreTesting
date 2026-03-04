import { MODULE_MANIFEST } from '../utils/moduleManifest';
import { supabase } from '../../utils/supabase/client';

export async function syncManifestToRoadmap() {
  try {
    // Convertir cada entry a objeto para upsert
    const modulesToSync = MODULE_MANIFEST.map(entry => ({
      id: entry.section,
      status: 'not-started' as const,
      priority: 'medium' as const,
      tiene_view: !!entry.component,
      tiene_backend: entry.hasSupabase === true,
    }));

    // Obtener módulos existentes para preservar status y priority
    const { data: existingModules, error: fetchError } = await supabase
      .from('roadmap_modules')
      .select('id, status, priority, tiene_backend')
      .in('id', modulesToSync.map(m => m.id));

    if (fetchError) {
      console.error('[SyncManifest] Error obteniendo módulos existentes:', fetchError);
      return;
    }

    // Crear mapa de módulos existentes
    const existingMap = new Map(
      (existingModules || []).map(m => [m.id, { status: m.status, priority: m.priority, tiene_backend: m.tiene_backend }])
    );

    // Preparar datos para upsert, preservando status y priority si existen
    // Solo actualiza updated_at si tiene_backend cambió
    const upsertData = modulesToSync.map(module => {
      const existing = existingMap.get(module.id);
      const backendChanged = existing?.tiene_backend !== module.tiene_backend;
      return {
        ...module,
        status: existing?.status || module.status,
        priority: existing?.priority || module.priority,
        ...(backendChanged ? { updated_at: new Date().toISOString() } : {}),
      };
    });

    // Realizar upsert
    const { error: upsertError } = await supabase
      .from('roadmap_modules')
      .upsert(upsertData, { onConflict: 'id' });

    if (upsertError) {
      console.error('[SyncManifest] Error en upsert:', upsertError);
      return;
    }

    console.log(`[SyncManifest] ${modulesToSync.length} módulos sincronizados`);
  } catch (error) {
    console.error('[SyncManifest] Error inesperado:', error);
  }
}
