import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { Session } from './session.actions';
import { SessionUser } from './session.models';

@State<SessionUser>({
  name: 'session',
  defaults: {
    email: '',
    token: '',
  },
})
@Injectable()
export class SessionState {
  @Action(Session)
  public userSession(ctx: StateContext<SessionUser>, action: Session): void {
    ctx.patchState(action.session);
  }
}
