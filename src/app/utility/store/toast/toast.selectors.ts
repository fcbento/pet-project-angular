import { Selector } from '@ngxs/store';
import { ToastModel } from './toast.models';
import { ToastState } from './toast.state';

export class ToastSelectors {
  @Selector([ToastState])
  public static open(state: ToastModel): ToastModel {
    return state;
  }
}
