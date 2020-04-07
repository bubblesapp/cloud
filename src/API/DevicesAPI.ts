import {Device} from '../models/Device';

export interface DevicesAPI {
  get(uid: string, id: string): Promise<Device>;
  list(uid: string): Promise<Device[]>;
  delete(uid: string, id: string): Promise<void>;
}
