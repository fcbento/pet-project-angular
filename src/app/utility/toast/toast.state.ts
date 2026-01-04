import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { CloseToast, OpenToast } from './toast.actions';
import { ToastModel } from './toast.models';

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
    ctx.patchState(action.toast);
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
