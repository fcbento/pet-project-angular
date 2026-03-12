import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { CloseToast, OpenToast } from './toast.actions';
import { ToastModel } from './toast.models';

const DEFAULT_TOAST_TIMER = 3000;

@State<ToastModel>({
  name: 'toast',
  defaults: {
    title: '',
    message: '',
    duration: 0,
    type: 'info',
  },
})
@Injectable()
export class ToastState {
  @Action(OpenToast)
  public open(ctx: StateContext<ToastModel>, action: OpenToast): void {
    ctx.patchState({ ...action.toast, duration: action.toast.duration ?? DEFAULT_TOAST_TIMER });
  }

  @Action(CloseToast)
  public close(ctx: StateContext<ToastModel>): void {
    ctx.patchState({
      title: '',
      message: '',
      duration: 0,
      type: 'success',
    });
  }
}
