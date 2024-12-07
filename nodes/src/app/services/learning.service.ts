import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearningEntry } from '../interfaces/learning-entry.interface';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  constructor(private firestore: Firestore) {}

  addEntry(entry: LearningEntry): Promise<void> {
    const entriesRef = collection(this.firestore, 'learningEntries');
    return from(addDoc(entriesRef, entry))
      .pipe(map(() => void 0))
      .toPromise();
  }

  updateEntry(entry: LearningEntry & { id: string }): Promise<void> {
    const docRef = doc(this.firestore, 'learningEntries', entry.id);
    return from(
      updateDoc(docRef, {
        ...entry,
        updatedAt: serverTimestamp(),
      })
    ).toPromise();
  }

  deleteEntry(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'learningEntries', id);
    return from(deleteDoc(docRef)).toPromise();
  }

  getEntries(): Observable<LearningEntry[]> {
    const entriesRef = collection(this.firestore, 'learningEntries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<LearningEntry[]>;
  }
}
