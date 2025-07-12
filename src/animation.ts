import { dequal } from 'dequal'
import { AnimationPlaybackControlsWithThen } from 'motion'
import { animate } from 'motion/mini'
import { EventAnimation } from './eventAnimation'
import { PresenceSubscription } from './presence'
import { splitAnimateProp, UpdateAnimationProps } from './props'
import {
  AnimationOptions,
  AnimationProps,
  AnimationRef,
  DOMKeyframesDefinition,
} from './types'

// Internal animation state.
export interface Animation {
  /** The current animation key. */
  key: string | undefined
  /** The last animation props seen by this node. */
  props: AnimationProps | null
  /** Stable reference to the current "leave" animation props. */
  leaveProps: AnimationProps | null
  /** The callback used to subscribe to the presence context. */
  leaveSubscription: PresenceSubscription | null
  /**
   * The last keyframes this node was animated with. This property is not used
   * for lifecycle animations (except `update`).
   */
  keyframes: DOMKeyframesDefinition | undefined
  /**
   * The last animation options this node was animated with.
   */
  options: AnimationOptions | undefined
  /** The controls of the last animation. */
  controls: AnimationPlaybackControlsWithThen | null
  /** Event-driven animation state. */
  events: {
    [startEvent: string]: EventAnimation
  } | null
}

export function applyUpdateAnimation(
  dom: HTMLElement,
  animation: Animation,
  props: AnimationProps,
  { assigned, keyframes, options, key, ref }: UpdateAnimationProps
) {
  const needsUpdate =
    key === undefined
      ? !dequal(keyframes, animation.keyframes)
      : key !== animation.key

  if (!needsUpdate) {
    return
  }

  animation.key = key
  animation.props = props
  animation.keyframes = keyframes
  animation.options = options

  if (assigned) {
    requestAnimationFrame(() => {
      Object.assign(dom.style, assigned)
    })
  }
  if (keyframes) {
    setAnimationControls(animation, animate(dom, keyframes, options), ref)
  } else {
    stopAnimation(animation, ref)
  }
}

export function applyLifecycleAnimation(
  dom: HTMLElement,
  animation: Animation,
  props: AnimationProps
) {
  const { assigned, keyframes, options, ref } = splitAnimateProp(props, true)

  animation.props = props
  animation.options = options

  if (assigned) {
    requestAnimationFrame(() => {
      Object.assign(dom.style, assigned)
    })
  }
  if (keyframes) {
    setAnimationControls(animation, animate(dom, keyframes, options), ref)
    return animation.controls
  }
  return null
}

export function stopAnimation(
  animation: Animation,
  ref: AnimationRef | undefined
) {
  if (animation.controls) {
    animation.controls.stop()
    setAnimationControls(animation, null, ref)
  }
}

export function setAnimationControls(
  animation: Animation,
  controls: AnimationPlaybackControlsWithThen | null,
  ref?: AnimationRef | undefined
) {
  animation.controls = controls
  updateAnimationRef(ref, controls)
}

export function updateAnimationRef(
  ref: AnimationRef | undefined,
  controls: AnimationPlaybackControlsWithThen | null
) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(controls)
  } else {
    ref.current = controls
  }
}
