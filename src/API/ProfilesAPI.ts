import {Profile} from '../models/Profile';

export interface ProfilesAPI {
  get(uid: string): Promise<Profile>;
  set(profile: Profile): Promise<void>;
  delete(uid: string): Promise<void>;
  uidWihEmail(email: string): Promise<string | undefined>;
}
