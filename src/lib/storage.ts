import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'avatars';

export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase().storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase().storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return { publicUrl, filePath };
};

export const deleteAvatar = async (filePath: string) => {
  const { error } = await supabase().storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw error;
  }
};

export const getAvatarUrl = (path: string) => {
  if (!path) return null;

  const { data: { publicUrl } } = supabase().storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return publicUrl;
};

