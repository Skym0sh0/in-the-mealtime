export function assertNever(value: never) {
  return new Error('Must never occur: ' + value);
}