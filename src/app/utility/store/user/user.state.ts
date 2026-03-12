import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { User } from '../../models/user.model';
import { UserStore } from './user.actions';

@State<User>({
  name: 'user',
  defaults: {
    createdAt: '',
    email: '',
    id: 0,
    lastName: '',
    name: '',
  },
})
@Injectable()
export class UserState {
  @Action(UserStore)
  public userSession(ctx: StateContext<User>, action: UserStore): void {
    if (!action.user) return;
    ctx.patchState(action.user!);
  }
}
