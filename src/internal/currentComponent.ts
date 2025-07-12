import { PrivateHook, hook } from './hook'
import { getComponentForVNode } from './vnode'

export let currentComponent: any = null

let componentStack: any[] = []

hook(PrivateHook.Render, (vnode: any) => {
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
