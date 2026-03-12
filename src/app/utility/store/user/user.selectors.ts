import { Selector } from '@ngxs/store';
import { User } from '../../models/user.model';
import { UserState } from './user.state';

export class UserSelectors {
  @Selector([UserState])
  public static user(state: User): User {
    return state;
  }
}
