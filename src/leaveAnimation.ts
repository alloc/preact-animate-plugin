import { VNode } from 'preact'
import { Animation, applyLifecycleAnimation } from './animation'
import { getContextValue } from './internal/context'
import { PresenceContext } from './presence'
import { AnimateLifecycleProps } from './types'
import { vnodeToPresence } from './vnodeCaches'

export function diffLeaveAnimation(
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
      Object.assign(leave, animation.initial || initial)
      delete leave.reverse
    }

    animation.leaveProps = leave
    animation.leaveSubscription ||= presence.subscribe(leavingElement => {
      if (leavingElement.contains(dom)) {
        return applyLifecycleAnimation(dom, animation, animation.leaveProps!)
      }
    })
  } else if (animation.leaveSubscription) {
    animation.leaveSubscription.remove()
    animation.leaveSubscription = null
    animation.leaveProps = null
  }
}
