import {ProfilesAPI} from './ProfilesAPI';
import {FriendsAPI} from './FriendsAPI';
import {InvitesAPI} from './InvitesAPI';
import {BubbleAPI} from './BubbleAPI';
import {DevicesAPI} from './DevicesAPI';
import {NotificationsAPI} from './NotificationsAPI';

export interface API {
  profiles: ProfilesAPI;
  friends: FriendsAPI;
  invites: InvitesAPI;
  bubble: BubbleAPI;
  devices: DevicesAPI;
  notifications: NotificationsAPI;
  wait: (milliseconds: number) => Promise<void>;
  destroy: () => Promise<void>;
}
