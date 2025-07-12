import {
  AnimationPlaybackControls,
  NativeAnimation,
  NativeAnimationOptions,
  ValueKeyframe,
} from 'motion'
import { DOMKeyframesDefinition } from '../types'

export function getReverseKeyframes(controls: AnimationPlaybackControls) {
  const reversed: Record<string, any> = {}

  // https://github.com/motiondivision/motion/blob/89a2a6eb1401aaee92ee2da3960bdd98e2cb800e/packages/motion-dom/src/animation/GroupAnimation.ts#L16
  const animations = (controls as any).animations as NativeAnimation<
    string | number
  >[]

  for (const animation of animations) {
    // https://github.com/motiondivision/motion/blob/89a2a6eb1401aaee92ee2da3960bdd98e2cb800e/packages/motion-dom/src/animation/NativeAnimation.ts#L40
    const options = (animation as any).options as NativeAnimationOptions
    const keyframes = options.keyframes as ValueKeyframe[]

    // Store the first keyframe, to reverse the animation.
    reversed[options.name] = keyframes[0]
  }

  return reversed as DOMKeyframesDefinition
}
