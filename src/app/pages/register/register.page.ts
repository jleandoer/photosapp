import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Preferences } from '@capacitor/preferences';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  image: string | null = null;
  description: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private firestore: Firestore
  ) {}

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });

    this.image = image.dataUrl!;
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  async submitForm() {
    if (!this.image || !this.description.trim()) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const fileName = `img_${Date.now()}.jpg`;
    const file = this.dataUrlToFile(this.image, fileName);

    const publicUrl = await this.supabaseService.uploadImage(file);

    if (!publicUrl) {
      alert('Error subiendo la imagen a Supabase');
      return;
    }

    const data = {
      description: this.description,
      image: publicUrl,
      createdAt: new Date().toISOString()
    };

    try {
      const col = collection(this.firestore, 'imagenes');
      await addDoc(col, data);

      const { value } = await Preferences.get({ key: 'images_data' });
      const existing = value ? JSON.parse(value) : [];
      existing.unshift(data);
      await Preferences.set({
        key: 'images_data',
        value: JSON.stringify(existing),
      });

      alert('Imagen subida correctamente');
      this.image = null;
      this.description = '';
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Error al guardar');
    }
  }
}
