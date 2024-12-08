import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { KIService } from '../../services/ki.service';
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

  /**
   * Enables or disables the 'aiPrompt' form control based on the value of the 'leafNode' form control.
   * If the 'leafNode' form control has a value, the 'aiPrompt' form control is enabled.
   * Otherwise, the 'aiPrompt' form control is disabled and its value is set to an empty string.
   * The 'currentKiResponse' signal is also set to an empty string in this case.
   */
  ngOnInit() {
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

  /**
   * Sends a prompt to the KI service, retrieves the response, and updates the form and UI accordingly.
   * If the 'aiPrompt' form control is empty, the method returns without doing anything.
   * Otherwise, it sets the 'isLoadingResponse' signal to true, sends the prompt to the KI service,
   * and updates the 'currentKiResponse' signal and the 'kiContent' form control with the response.
   * If an error occurs, it logs the error to the console.
   * Finally, it sets the 'isLoadingResponse' signal to false and moves to the next step in the stepper.
   */
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

  /**
   * Handles the submission of the node form. If the form is valid, it creates a `DialogResult` object
   * with the form values and closes the dialog, passing the result back to the caller.
   */
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

  /**
   * Closes the dialog.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Toggles the preview mode of the component.
   */
  togglePreview(): void {
    this.isPreviewMode.update((prev) => !prev);
  }
}
