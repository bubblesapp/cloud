import {Notification} from '../models/Notification';

export interface NotificationsAPI {
  newInvite(fromUid: string, toUid: string): Promise<void>;
  notifyIfAllowed: (uid: string, notification: Notification) => Promise<void>;
}
