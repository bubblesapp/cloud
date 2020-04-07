import {Friend} from '../models/Friend';

export interface FriendsAPI {
  get(friendUid: string, ofUid: string): Promise<Friend>;
  set(friend: Friend, ofUid: string): Promise<void>;
  delete(friendUid: string, ofUid: string): Promise<void>;
  exists(friendUid: string, ofUid: string): Promise<boolean>;
  waitUntilExists(ofUid: string, friendUid: string): Promise<boolean>;
  waitUntilDeleted(ofUid: string, friendUid: string): Promise<boolean>;
}
