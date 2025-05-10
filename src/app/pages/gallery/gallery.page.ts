import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface ImagenData {
  description: string;
  image: string;
  createdAt: string;
}

@Component({
  standalone:false,
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage implements OnInit {
  imagenes$: Observable<ImagenData[]>;

  constructor(private firestore: Firestore) {
    const col = collection(this.firestore, 'imagenes');
    this.imagenes$ = collectionData(col, { idField: 'id' }) as Observable<ImagenData[]>;
  }

  ngOnInit() {}
}
