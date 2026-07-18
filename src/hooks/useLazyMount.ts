import { useRef } from 'react';

/**
 * Once `trigger` becomes truthy, keeps returning true permanently. Used to
 * defer mounting a lazily-imported component (and paying its bundle cost)
 * until it's actually needed, without unmounting it again afterward — so
 * exit animations keep working on every subsequent open/close, not just the
 * first one.
 */
export function useLazyMount(trigger: boolean): boolean {
  const mounted = useRef(false);
  if (trigger) mounted.current = true;
  return mounted.current;
}
