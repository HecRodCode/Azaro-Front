// Input de texto pixel-art. Compatible con [(ngModel)] y control-value-accessor.
// Renderiza label + campo; el label se toma del input `label`.

import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'az-pixel-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PixelInput),
      multi: true,
    },
  ],
  template: `
    <label>
      @if (label()) {
        <span>{{ label() }}</span>
      }
      <input
        [type]="type()"
        [value]="value()"
        [placeholder]="placeholder()"
        [attr.maxlength]="maxLength()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
    </label>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 10px;
        color: var(--color-crt-ink-dim);
      }
      input {
        font-family: var(--font-pixel);
        font-size: 12px;
        padding: 10px;
        background: var(--color-crt-bg);
        border: 2px solid var(--color-crt-border);
        color: var(--color-crt-ink);
        outline: none;
        text-transform: uppercase;
      }
      input:focus {
        border-color: var(--color-crt-accent);
      }
      input:disabled {
        opacity: 0.5;
      }
    `,
  ],
})
export class PixelInput implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'number'>('text');
  readonly maxLength = input<number | null>(null);

  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
