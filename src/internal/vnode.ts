import { VNode } from 'preact'

export function getComponentForVNode(vnode: VNode) {
  return (vnode as any).__c
}

export function getElementForVNode(vnode: VNode): HTMLElement | null {
  return (vnode as any).__e
}
