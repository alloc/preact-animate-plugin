import { animate } from 'motion/mini'
import {
  Animation,
  applyLifecycleAnimation,
  setAnimationControls,
  stopAnimation,
} from './animation'
import { getReverseKeyframes } from './internal/motion'
import { splitAnimateProp } from './props'
import { DOMKeyframesDefinition, EventAnimationProps } from './types'

export type EventAnimation = {
  props: EventAnimationProps
  keyframes: DOMKeyframesDefinition | null
  active: boolean
  remove: () => void
}

export function diffEventAnimation(
  dom: HTMLElement,
  animation: Animation,
  props: EventAnimationProps | undefined,
  startEvent: string,
  stopEvent: string
) {
  let self: EventAnimation

  if (animation.events && (self = animation.events[startEvent])) {
    if (props) {
      self.props
      self.props = props
      if (self.active) {
        applyLifecycleAnimation(dom, animation, props)
      }
    } else {
      self.remove()
      delete animation.events[startEvent]
    }
    return
  }
  if (!props) {
    return
  }

  let onStop: (() => void) | undefined

  const onStart = (event: Event) => {
    if (
      startEvent === 'pointerenter' &&
      (event as PointerEvent).pointerType === 'touch'
    ) {
      return
    }

    // Are we interrupting an animation?
    const isInterrupt = Boolean(
      animation.controls && animation.controls.state !== 'finished'
    )

    const controls = applyLifecycleAnimation(dom, animation, self.props)
    if (!controls) {
      return // Nothing was animated.
    }

    self.active = true

    let reverseKeyframes: DOMKeyframesDefinition
    let reverseOptions = animation.options

    if (self.props.reverse) {
      const { keyframes, options } = splitAnimateProp(self.props.reverse, true)
      if (keyframes) {
        reverseKeyframes = keyframes
      }
      // Always override the inherited options.
      reverseOptions = options
    }

    // We cannot safely infer the reverse keyframes if we interrupted another
    // animation, since the initial keyframes could have been inferred from
    // the interrupted animation.
    reverseKeyframes ||=
      (isInterrupt && self.keyframes) || getReverseKeyframes(controls)

    if (!isInterrupt) {
      self.keyframes = reverseKeyframes
    }

    dom.addEventListener(
      stopEvent,
      (onStop = () => {
        self.active = false
        if (animation.controls === controls) {
          stopAnimation(animation, self.props.ref)
        }
        setAnimationControls(
          animation,
          animate(dom, reverseKeyframes, reverseOptions),
          self.props.ref
        )
      }),
      { once: true }
    )
  }

  dom.addEventListener(startEvent, onStart)

  animation.events ??= {}
  animation.events[startEvent] = self = {
    props,
    keyframes: null,
    active: true,
    remove: () => {
      dom.removeEventListener(startEvent, onStart)
      if (onStop) {
        dom.removeEventListener(stopEvent, onStop)
      }
    },
  }
}
