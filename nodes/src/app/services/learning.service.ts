import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  collectionData,
  DocumentReference,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearningEntry } from '../interfaces/learning-entry.interface';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  constructor(private firestore: Firestore) {}

  addEntry(entry: Omit<LearningEntry, 'id'>): Promise<void> {
    const entriesRef = collection(this.firestore, 'learningEntries');
    return from(
      addDoc(entriesRef, {
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    )
      .pipe(map(() => void 0))
      .toPromise();
  }

  getEntries(): Observable<LearningEntry[]> {
    const entriesRef = collection(this.firestore, 'learningEntries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    return collectionData(q) as Observable<LearningEntry[]>;
  }
}
