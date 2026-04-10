import supabase from '@/config/supabase';

// ===== FILE UPLOAD SERVICE =====
export const storageService = {
  // Upload user avatar
  async uploadAvatar(userId: string, fileUri: string) {
    try {
      // Convert file URI to blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const fileName = `avatars/${userId}-${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from('luna-files')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('luna-files')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  // Upload recording file
  async uploadRecording(userId: string, fileUri: string) {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const fileName = `recordings/${userId}-${Date.now()}.m4a`;

      const { data, error } = await supabase.storage
        .from('luna-files')
        .upload(fileName, blob, {
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('luna-files')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  },

  // Upload document (health records, etc)
  async uploadDocument(userId: string, fileUri: string, fileName: string) {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const path = `documents/${userId}/${Date.now()}-${fileName}`;

      const { data, error } = await supabase.storage
        .from('luna-files')
        .upload(path, blob, {
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('luna-files')
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Delete file
  async deleteFile(filePath: string) {
    try {
      const { error } = await supabase.storage
        .from('luna-files')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
};