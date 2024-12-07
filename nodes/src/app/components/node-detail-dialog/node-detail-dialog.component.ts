import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LearningService } from '../../services/learning.service';
import { LearningEntry } from '../../interfaces/learning-entry.interface';
import { FieldValue, serverTimestamp } from '@angular/fire/firestore';
import { DialogResult } from '../../interfaces/dialog-result.interface';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';

import { firstValueFrom } from 'rxjs';
import { KIService } from '../../services/ki.service';

interface UpdateData extends Omit<LearningEntry, 'updatedAt'> {
  updatedAt: FieldValue;
}

@Component({
  selector: 'app-node-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MarkdownModule,
  ],
  templateUrl: './node-detail-dialog.component.html',
  styleUrl: './node-detail-dialog.component.scss',
})
export class NodeDetailDialogComponent {
  isEditing = signal(false);
  isLoadingResponse = signal(false); // Signal für Loading-State
  currentKiResponse = signal('');
  isPreviewMode = signal(false);
  editForm = inject(FormBuilder).group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    aiPrompt: [''],
  });

  constructor(
    private dialogRef: MatDialogRef<NodeDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private learningService: LearningService,
    private kiService: KIService
  ) {
    this.editForm.patchValue({
      title: this.data.title,
      description: this.data.description,
    });
  }

  async updateWithKi() {
    if (!this.editForm.get('aiPrompt')?.value) return;

    this.isLoadingResponse.set(true);
    try {
      const response = await firstValueFrom(
        this.kiService.sendPrompt(this.editForm.get('aiPrompt')?.value!)
      );
      const content = response.choices[0].message.content;
      this.currentKiResponse.set(content);
      this.editForm.patchValue({ description: content });
    } catch (error) {
      console.error('KI-Fehler:', error);
    } finally {
      this.isLoadingResponse.set(false);
    }
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

  deleteEntry(): void {
    this.learningService.deleteEntry(this.data.id).then(() => {
      this.dialogRef.close({ status: 'deleted' });
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  togglePreview(): void {
    this.isPreviewMode.update((prev) => !prev);
  }
}
