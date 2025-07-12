import type {
  AnimationPlaybackControlsWithThen,
  TransformProperties,
  ValueAnimationWithDynamicDelay,
} from 'motion'
import { Ref } from 'preact'
import { CSSProperties } from 'preact/compat'
import { SUPPORTED_OPTIONS } from './constants'

export type DOMKeyframesDefinition = Omit<
  import('motion').DOMKeyframesDefinition,
  keyof TransformProperties | `transition${string}`
>

export type AnimationRef = Ref<AnimationPlaybackControlsWithThen>

type UncheckedPick<T, K> = { [P in keyof T as Extract<P, K>]: T[P] }

type MotionMiniOptions = UncheckedPick<
  ValueAnimationWithDynamicDelay,
  keyof typeof SUPPORTED_OPTIONS
>

export type AnimationOptionsFn = (prop: string) => MotionMiniOptions

export interface AnimationOptions extends MotionMiniOptions {
  /**
   * Receive the animation controls.
   */
  ref?: AnimationRef
  /**
   * Customize the animation options for each style property.
   */
  transition?:
    | { [K in keyof DOMKeyframesDefinition]?: MotionMiniOptions }
    | AnimationOptionsFn
}

export type AnimationProps = DOMKeyframesDefinition & AnimationOptions

// This animation updates on render.
export type AnimateRenderProps = AnimationProps & {
  /**
   * If defined, the animation will only be updated when this key changes.
   */
  key?: string
}

export type EventAnimationProps = AnimationProps & {
  /**
   * Define the animation that occurs when the event is no longer active. By
   * default, the initial keyframes from the *event animation* are used, along
   * with its animation options. If this option is defined, nothing from the
   * event animation is used.
   */
  reverse?: AnimationProps
}

// These animations update on lifecycle events.
export type AnimateLifecycleProps = {
  /**
   * The initial style values to be applied before mounting.
   */
  initial?: CSSProperties
  /**
   * Animate when this element is re-rendered.
   */
  update?: AnimateRenderProps
  /**
   * Animate when this element is added to the DOM.
   *
   * If you pass a callback, it will receive `true` to indicate this element is
   * mounting at the same time as its `AnimatePresence` parent. This allows you
   * to define a different animation for the first mount.
   */
  enter?: AnimationProps | ((isInitial: boolean | undefined) => AnimationProps)
  /**
   * Animate before this element is removed from the DOM.
   */
  leave?: AnimationProps & { reverse?: true }
  /**
   * Animate when this element is hovered on.
   */
  whileHover?: EventAnimationProps
  /**
   * Animate when this element is focused.
   */
  whileFocus?: EventAnimationProps
  /**
   * Animate when this element is pressed on.
   */
  whilePress?: EventAnimationProps
}

export type AnimateProp = AnimateRenderProps | AnimateLifecycleProps
