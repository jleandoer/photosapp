import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  async uploadImage(file: File): Promise<string | null> {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `public/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(environment.supabase.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.error('Error uploading to Supabase:', JSON.stringify(error, null, 2));
      return null;
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(environment.supabase.bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}
