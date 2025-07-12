import { options } from 'preact'

export const enum PrivateHook {
  Diff = '__b',
  Render = '__r',
}

const unsafeOptions = options as any

export function hook(
  name: PrivateHook | keyof typeof options,
  hook: (arg: any) => void
) {
  const before = unsafeOptions[name]
  unsafeOptions[name] = before
    ? (arg: any) => {
        before(arg)
        hook(arg)
      }
    : hook
}
