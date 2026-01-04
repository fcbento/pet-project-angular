import { ToastType } from './toast.types';

export interface ToastModel {
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}
