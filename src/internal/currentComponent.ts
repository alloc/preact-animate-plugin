import { options } from 'preact'
import { getComponentForVNode } from './vnode'

export let currentComponent: any = null

let componentStack: any[] = []

const enum Hook {
  Diff = '__b',
  Render = '__r',
}

function hook(name: Hook | keyof typeof options, hook: (arg: any) => void) {
  const original = (options as any)[name]
  ;(options as any)[name] = (arg: any) => {
    original?.(arg)
    hook(arg)
  }
}

hook(Hook.Render, (vnode: any) => {
  componentStack.push(currentComponent)
  currentComponent = getComponentForVNode(vnode)
  // console.log('[render]', currentComponent)
})

hook('diffed', (vnode: any) => {
  if (currentComponent && currentComponent === getComponentForVNode(vnode)) {
    // console.log('[diff start]', currentComponent)
    currentComponent = componentStack.pop()
  }
})
