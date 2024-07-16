export const DRAWER_WIDTH = 360;

export function assertNever(value: never) {
  return new Error('Must never occur: ' + value);
}