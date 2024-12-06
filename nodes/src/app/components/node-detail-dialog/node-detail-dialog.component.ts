import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LearningService } from '../../services/learning.service';
import { LearningEntry } from '../../interfaces/learning-entry.interface';
import { FieldValue, serverTimestamp } from '@angular/fire/firestore';
import { DialogResult } from '../../interfaces/dialog-result.interface';

interface UpdateData extends Omit<LearningEntry, 'updatedAt'> {
  updatedAt: FieldValue;
}

@Component({
  selector: 'app-node-detail-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './node-detail-dialog.component.html',
  styleUrl: './node-detail-dialog.component.scss',
})
export class NodeDetailDialogComponent {
  data = inject(DIALOG_DATA);
  private dialogRef = inject(DialogRef);

  isEditing = signal(false);
  editForm = inject(FormBuilder).group({
    title: [''],
    description: [''],
  });

  constructor(private learningService: LearningService) {
    console.log('Dialog Data:', this.data); // Add this line
    this.editForm.patchValue({
      title: this.data.title,
      description: this.data.description,
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  deleteEntry(): void {
    this.learningService.deleteEntry(this.data.id).then(() => {
      this.dialogRef.close({ status: 'deleted' });
    });
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  saveChanges(): void {
    if (this.editForm.valid) {
      const updatedData: UpdateData = {
        id: this.data.id,
        title: this.editForm.value.title!,
        description: this.editForm.value.description!,
        mainTopic: this.data.mainTopic,
        subTopic: this.data.subTopic,
        createdAt: this.data.createdAt,
        updatedAt: serverTimestamp(),
      };

      this.learningService
        .updateEntry(updatedData as LearningEntry)
        .then(() => {
          this.isEditing.set(false);
          this.dialogRef.close({
            status: 'updated',
            path: {
              mainTopic: this.data.mainTopic,
              subTopic: this.data.subTopic,
              title: updatedData.title,
            },
          });
        });
    }
  }

  cancelEditing(): void {
    this.editForm.patchValue({
      title: this.data.title,
      description: this.data.description,
    });
    this.isEditing.set(false);
  }
}
