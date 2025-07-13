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
  const post = unsafeOptions[name]
  unsafeOptions[name] = post
    ? (arg: any) => {
        hook(arg)
        post(arg)
      }
    : hook
}
