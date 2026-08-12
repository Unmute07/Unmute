import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const AUDIO_BUCKET = "interview-audio";

let client: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return client;
}

export async function ensureAudioBucket(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === AUDIO_BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(AUDIO_BUCKET, { public: true });
    if (error && !error.message.includes("already exists")) {
      throw error;
    }
  }
}

export async function uploadAudioFile(
  path: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  await ensureAudioBucket();

  const { error } = await supabase.storage.from(AUDIO_BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
