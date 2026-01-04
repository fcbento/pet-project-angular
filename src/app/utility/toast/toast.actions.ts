import { ToastModel } from './toast.models';

export class OpenToast {
  public static readonly type = '[Toast] Open toast';
  public constructor(public toast: ToastModel) {}
}

export class CloseToast {
  public static readonly type = '[Toast] Close toast';
  public constructor() {}
}
