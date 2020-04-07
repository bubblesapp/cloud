import {Bubble} from '../models/Bubble';

export interface BubbleAPI {
  set(bubble: Bubble): Promise<void>;
  get(uid: string): Promise<Bubble>;
  exists(uid: string): Promise<boolean>;
  delete(uid: string): Promise<void>;
  waitUntilExists(uid: string): Promise<boolean>;
  waitUntilDeleted(uid: string): Promise<boolean>;
  pop(uid: string): Promise<void>;
  isPopped(uid: string): Promise<boolean>;
}
