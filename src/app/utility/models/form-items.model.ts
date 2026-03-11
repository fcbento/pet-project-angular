import { FieldTree } from '@angular/forms/signals';

export interface FormItems {
  placeholder: string;
  label: string;
  type: string;
  field: FieldTree<string>;
}
