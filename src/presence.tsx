import { AnimationPlaybackControlsWithThen } from 'motion'
import { ComponentChildren, createContext, Key, VNode } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { castArray } from 'radashi'
import { getComponentForVNode, getElementForVNode } from './internal/vnode'
import { vnodeToAnimateProp, vnodeToPresence } from './vnodeCaches'

export interface PresenceSubscription {
  callback: PresenceCallback
  remove: () => void
}

export type PresenceCallback = (
  leavingElement: Element | null,
  leavingComponent: any
) => AnimationPlaybackControlsWithThen | null

export type PresenceContext = {
  isInitial: boolean
  enterDelay: number | undefined
  keys: Key[]
  nodes: VNode[]
  leavingKeys: Set<string>
  subscriptions: Set<PresenceSubscription>
  subscribe: (callback: PresenceCallback) => PresenceSubscription
}

export const PresenceContext = createContext<PresenceContext>(null!)

export function AnimatePresence(props: {
  /**
   * Delay `enter` animations if `leave` animations are in progress.
   */
  enterDelay?: number
  children: ComponentChildren
}) {
  const [context] = useState((): PresenceContext => {
    return {
      isInitial: true,
      enterDelay: undefined,
      keys: [],
      nodes: [],
      leavingKeys: new Set(),
      subscriptions: new Set(),
      subscribe(callback) {
        const subscription = {
          callback,
          remove: () => {
            this.subscriptions.delete(subscription)
          },
        }
        this.subscriptions.add(subscription)
        return subscription
      },
    }
  })

  context.enterDelay = props.enterDelay

  useEffect(() => {
    context.isInitial = false
  }, [])

  const prevNodes = context.nodes
  const prevKeys = context.keys

  const nextNodes: VNode[] = (context.nodes = [])
  const nextKeys: Key[] = (context.keys = [])

  const children = castArray(props.children)
  children.forEach((child, index) => {
    if (isVNode(child)) {
      // If a key is not defined, assume the order never changes.
      nextKeys.push(child.key ?? '__' + index)
      nextNodes.push(child)

      if (typeof child.type === 'string' && vnodeToAnimateProp.has(child)) {
        vnodeToPresence.set(child, context)
      }
    }
  })

  const forceUpdate = useForceUpdate()
  const leavingNodes = prevNodes.filter((prevNode, index) => {
    const prevKey = prevKeys[index]
    if (nextKeys.includes(prevKey)) {
      return false
    }
    if (context.leavingKeys.has(prevKey)) {
      // Preserve this node in the DOM.
      nextKeys.push(prevKey)
      nextNodes.push(prevNode)
      return true
    }
    const prevElement = getElementForVNode(prevNode)
    const prevComponent = getComponentForVNode(prevNode)
    for (const subscription of context.subscriptions.values()) {
      const animation = subscription.callback(prevElement, prevComponent)
      if (animation) {
        context.leavingKeys.add(prevKey)
        animation.then(() => {
          context.leavingKeys.delete(prevKey)
          subscription.remove()
          forceUpdate()
        })

        // Preserve this node in the DOM.
        nextKeys.push(prevKey)
        nextNodes.push(prevNode)
        return true
      }
    }
  })

  return (
    <PresenceContext value={context}>
      {[...leavingNodes, ...children]}
    </PresenceContext>
  )
}

function useForceUpdate() {
  const [, setState] = useState(0)
  return () => setState(state => state + 1)
}

function isVNode(value: any): value is VNode {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    'props' in value
  )
}
