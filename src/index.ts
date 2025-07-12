import { options, VNode } from 'preact'
import {
  Animation,
  applyLifecycleAnimation,
  applyUpdateAnimation,
} from './animation'
import { diffEventAnimation } from './eventAnimation'
import { getContextValue } from './internal/context'
import { currentComponent } from './internal/currentComponent'
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

const animationQueue = new WeakMap<VNode, AnimateProp>()
const animations = new WeakMap<Element, Animation>()

const original = { ...options }

options.vnode = vnode => {
  original.vnode?.(vnode)

  if (typeof vnode.type === 'string' && 'animate' in vnode.props) {
    const { animate, ...props } = vnode.props
    vnode.props = props

    animationQueue.set(vnode, animate as AnimateProp)
  }
}

options.diffed = vnode => {
  original.diffed?.(vnode)

  const dom = getElementForVNode(vnode)
  if (dom) {
    const props = animationQueue.get(vnode)
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
          const presence = getContextValue(PresenceContext)

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
      diffLeaveAnimation(dom, animation, lifecycle)
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
}

options.unmount = vnode => {
  original.unmount?.(vnode)

  const dom = getElementForVNode(vnode)
  if (dom) {
    const animation = animations.get(dom)
    animation?.leaveSubscription?.remove()
  }
}

function diffLeaveAnimation(
  dom: HTMLElement,
  animation: Animation,
  { leave, initial }: AnimateLifecycleProps
) {
  if (initial && leave?.reverse) {
    Object.assign(leave, initial)
  }
  if (leave) {
    const presence = getContextValue(PresenceContext)
    if (!presence) {
      console.warn('Cannot use animate.leave without AnimatePresence', dom)
      return
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

export {
  anticipate,
  backIn,
  backInOut,
  backOut,
  circIn,
  circInOut,
  circOut,
  cubicBezier,
  easeIn,
  easeInOut,
  easeOut,
  spring,
  stagger,
  steps,
  transform,
} from 'motion'

export { animate } from 'motion/mini'

export { AnimatePresence } from './presence'

export type * from './types'
