import { User } from '../../models/user.model';

export class UserStore {
  public static readonly type = '[User] Get user logged';
  public constructor(public user: User) {}
}
