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

  /**
   * Adds a new learning entry to the Firestore database.
   *
   * @param entry - The learning entry to be added.
   * @returns A Promise that resolves when the entry has been successfully added.
   */
  addEntry(entry: LearningEntry): Promise<void> {
    const entriesRef = collection(this.firestore, 'learningEntries');
    return from(addDoc(entriesRef, entry))
      .pipe(map(() => void 0))
      .toPromise();
  }

  /**
   * Updates an existing learning entry in the Firestore database.
   *
   * @param entry - The learning entry to be updated, including its unique identifier.
   * @returns A Promise that resolves when the entry has been successfully updated.
   */
  updateEntry(entry: LearningEntry & { id: string }): Promise<void> {
    const docRef = doc(this.firestore, 'learningEntries', entry.id);
    return from(
      updateDoc(docRef, {
        ...entry,
        updatedAt: serverTimestamp(),
      })
    ).toPromise();
  }

  /**
   * Deletes an existing learning entry from the Firestore database.
   *
   * @param id - The unique identifier of the learning entry to be deleted.
   * @returns A Promise that resolves when the entry has been successfully deleted.
   */
  deleteEntry(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'learningEntries', id);
    return from(deleteDoc(docRef)).toPromise();
  }

  /**
   * Retrieves a list of learning entries from the Firestore database, ordered by creation date in descending order.
   *
   * @returns An Observable that emits the list of learning entries.
   */
  getEntries(): Observable<LearningEntry[]> {
    const entriesRef = collection(this.firestore, 'learningEntries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<LearningEntry[]>;
  }
}
