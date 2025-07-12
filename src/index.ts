import { VNode } from 'preact'
import {
  Animation,
  applyLifecycleAnimation,
  applyUpdateAnimation,
} from './animation'
import { diffEventAnimation } from './eventAnimation'
import { getContextValue } from './internal/context'
import { currentComponent } from './internal/currentComponent'
import { hook } from './internal/hook'
import { getElementForVNode } from './internal/vnode'
import { PresenceContext } from './presence'
import { splitAnimateProp } from './props'
import { AnimateLifecycleProps, AnimateProp } from './types'

declare module 'preact' {
  namespace JSX {
    interface HTMLAttributes<RefType extends EventTarget> {
      animate?: AnimateProp
    }
  }
}

const vnodeToPresence = new WeakMap<VNode, PresenceContext | undefined>()
const vnodeToAnimateProp = new WeakMap<VNode, AnimateProp>()
const animations = new WeakMap<Element, Animation>()

hook('vnode', (vnode: VNode) => {
  if (typeof vnode.type === 'string' && 'animate' in vnode.props) {
    const { animate, presence, ...props } = vnode.props as any
    vnode.props = props

    vnodeToPresence.set(vnode, presence)
    vnodeToAnimateProp.set(vnode, animate)
  }
})

hook('diffed', (vnode: VNode) => {
  const dom = getElementForVNode(vnode)
  if (dom) {
    const props = vnodeToAnimateProp.get(vnode)
    if (!props) {
      return
    }

    let animation = animations.get(dom)
    if (!animation) {
      animations.set(
        dom,
        (animation = {
          key: undefined,
          props: null,
          leaveProps: null,
          leaveSubscription: null,
          keyframes: undefined,
          options: undefined,
          controls: null,
          events: null,
        })
      )
    }

    const { lifecycle, ...update } = splitAnimateProp(props)

    if (lifecycle) {
      if (dom.isConnected) {
        if (lifecycle.update) {
          applyUpdateAnimation(
            dom,
            animation,
            props,
            splitAnimateProp(lifecycle.update, true)
          )
        }
      } else {
        if (lifecycle.initial) {
          Object.assign(dom.style, lifecycle.initial)
        }
        if (lifecycle.enter) {
          const presence =
            vnodeToPresence.get(vnode) || getContextValue(PresenceContext)

          let props = lifecycle.enter
          if (typeof props === 'function') {
            props = props(presence?.isInitial)
          }
          if (presence?.enterDelay && presence.leavingKeys.size > 0) {
            props = { ...props, delay: presence.enterDelay }
          }

          applyLifecycleAnimation(dom, animation, props)
        }
      }
      diffLeaveAnimation(
        dom,
        vnode,
        animation,
        lifecycle.leave,
        lifecycle.initial
      )
      diffEventAnimation(
        dom,
        animation,
        lifecycle.whileHover,
        'pointerenter',
        'pointerleave'
      )
      diffEventAnimation(
        dom,
        animation,
        lifecycle.whileFocus,
        'focusin',
        'focusout'
      )
      diffEventAnimation(
        dom,
        animation,
        lifecycle.whilePress,
        'pointerdown',
        'pointerup'
      )
    }
    // If no lifecycle animations are passed, default to an "update" animation.
    else {
      applyUpdateAnimation(dom, animation, props, update)
    }
  }
})

hook('unmount', (vnode: VNode) => {
  const dom = getElementForVNode(vnode)
  if (dom) {
    const animation = animations.get(dom)
    animation?.leaveSubscription?.remove()
  }
})

function diffLeaveAnimation(
  dom: HTMLElement,
  vnode: VNode,
  animation: Animation,
  leave: AnimateLifecycleProps['leave'],
  initial: AnimateLifecycleProps['initial']
) {
  if (leave) {
    const presence =
      vnodeToPresence.get(vnode) || getContextValue(PresenceContext)
    if (!presence) {
      console.warn('Cannot use animate.leave without AnimatePresence', dom)
      return
    }

    if (leave.reverse) {
      Object.assign(leave, initial)
      delete leave.reverse
    }

    animation.leaveProps = leave

    if (!animation.leaveSubscription) {
      const component = currentComponent

      animation.leaveSubscription = presence.subscribe(
        (leavingElement, leavingComponent) => {
          const props = animation.leaveProps!

          if (leavingElement?.contains(dom)) {
            return applyLifecycleAnimation(dom, animation, props)
          }
          if (component === leavingComponent) {
            return applyLifecycleAnimation(dom, animation, props)
          }
          return null
        }
      )
    }
  } else if (animation.leaveSubscription) {
    animation.leaveSubscription.remove()
    animation.leaveSubscription = null
    animation.leaveProps = null
  }
}

export { animate } from 'motion/mini'

export { AnimatePresence } from './presence'

export type * from './types'
