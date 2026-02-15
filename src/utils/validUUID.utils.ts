import { isUUID } from 'class-validator';

export function isValidUUID(id: string): boolean {
  return isUUID(id);
}
