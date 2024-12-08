import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { KIService } from '../../services/ki.service';
import { LearningService } from '../../services/learning.service';
import { MarkdownModule } from 'ngx-markdown';
import { DialogResult } from '../../interfaces/dialog-result.interface';

@Component({
  selector: 'app-add-node-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIcon,
    ReactiveFormsModule,
    MarkdownModule,
  ],
  templateUrl: './add-node-dialog.component.html',
  styleUrl: './add-node-dialog.component.scss',
})
export class AddNodeDialogComponent implements OnInit {
  nodeForm = inject(FormBuilder).group({
    rootNode: ['', [Validators.required, Validators.minLength(2)]],
    middleNode: [''],
    leafNode: [''],
    aiPrompt: [''],
    kiContent: [''],
  });
  @ViewChild('stepper') stepper!: MatStepper;

  isLoadingResponse = signal(false);
  currentKiResponse = signal('');
  isPreviewMode = signal(false);

  constructor(
    private dialogRef: MatDialogRef<AddNodeDialogComponent>,
    private kiService: KIService,
  ) {}

  ngOnInit() {
    // Aktiviere KI-Prompt nur wenn Leaf-Node ausgefüllt wird
    this.nodeForm
      .get('leafNode')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        const aiPromptControl = this.nodeForm.get('aiPrompt');
        if (value) {
          aiPromptControl?.enable();
        } else {
          aiPromptControl?.disable();
          aiPromptControl?.setValue('');
          this.currentKiResponse.set('');
        }
      });
  }

  async getKiResponse() {
    if (!this.nodeForm.get('aiPrompt')?.value) return;

    this.isLoadingResponse.set(true);
    try {
      const response = await firstValueFrom(
        this.kiService.sendPrompt(this.nodeForm.get('aiPrompt')?.value!)
      );
      const content = response.choices[0].message.content;
      this.currentKiResponse.set(content);
      this.nodeForm.patchValue({ kiContent: content });
    } catch (error) {
      console.error('KI-Fehler:', error);
      // Hier könnten wir einen MatSnackBar oder ähnliches für Fehlermeldungen einbauen
    } finally {
      this.isLoadingResponse.set(false);
      this.stepper.next();
    }
  }

  onSubmit() {
    if (this.nodeForm.valid) {
      const result: DialogResult = {
        status: 'created',
        path: {
          mainTopic: this.nodeForm.get('rootNode')?.value!,
          subTopic: this.nodeForm.get('middleNode')?.value!,
          title: this.nodeForm.get('leafNode')?.value!,
        },
        kiContent: this.nodeForm.get('kiContent')?.value!,
      };
      this.dialogRef.close(result);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  togglePreview(): void {
    this.isPreviewMode.update((prev) => !prev);
  }
}
