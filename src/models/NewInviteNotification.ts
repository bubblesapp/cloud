import {Profile} from './Profile';
import {Notification} from './Notification';
import I18n from '../i18n';

export class NewInviteNotification implements Notification {
  constructor(from: Profile, public iOSBadge: number = 0) {
    this.title = I18n.t('notifications.newInvite.title');
    this.text = I18n.t('notifications.newInvite.text').replace('$0', from.name);
  }
  title: string;
  text: string;
}
