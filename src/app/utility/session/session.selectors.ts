import { Selector } from '@ngxs/store';
import { SessionUser } from './session.models';
import { SessionState } from './session.state';

export class SessionSelectors {
  @Selector([SessionState])
  public static session(state: SessionUser): SessionUser {
    return state;
  }
}
