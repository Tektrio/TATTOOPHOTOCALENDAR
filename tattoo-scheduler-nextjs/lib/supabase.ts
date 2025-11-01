// Clientes Supabase para Storage e Realtime
import { createClient } from '@supabase/supabase-js';

// Cliente Admin (com service_role) - APENAS para uso no servidor
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Cliente público (com anon key) - Para uso no cliente/servidor
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Upload de arquivo para Supabase Storage
 */
export async function uploadFileToSupabase(
  file: File | Buffer,
  path: string,
  bucket: string = 'uploads'
) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file instanceof File ? file.type : 'application/octet-stream',
        upsert: false
      });

    if (error) throw error;

    // Retornar URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { success: true, path: data.path, publicUrl };
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return { success: false, error };
  }
}

/**
 * Download de arquivo do Supabase Storage
 */
export async function downloadFileFromSupabase(
  path: string,
  bucket: string = 'uploads'
) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    return { success: false, error };
  }
}

/**
 * Deletar arquivo do Supabase Storage
 */
export async function deleteFileFromSupabase(
  path: string,
  bucket: string = 'uploads'
) {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return { success: false, error };
  }
}

