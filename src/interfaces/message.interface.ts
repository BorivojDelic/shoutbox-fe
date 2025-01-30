import { FileInterface } from './file.interface';

export interface MessageInterface {
  id: number;
  userIp: string;
  userAgent: string;
  message: string;
  createdAt: string;
  files: FileInterface[];
}