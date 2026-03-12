import { SessionUser } from './session.models';

export class Session {
  public static readonly type = '[Session] Get user logged';
  public constructor(public session: SessionUser) {}
}
