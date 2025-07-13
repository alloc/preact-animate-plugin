import { easeInOut, spring } from 'motion'
import 'preact-in-motion'
import { AnimatePresence } from 'preact-in-motion'
import { useState } from 'preact/hooks'
import { withExamples } from '~/utils/withExamples'
import { withVisibility } from '~/utils/withVisibility'

const BasicAnimation = ({ visible }: { visible: boolean }) => {
  return (
    <div
      animate={{
        opacity: visible ? 1 : 0,
        duration: 1,
        ease: easeInOut,
      }}>
      Basic Animation
    </div>
  )
}

// Lifecycle Animations Component
const LifecycleAnimations = () => {
  return (
    <>
      <div>Lifecycle Animations</div>
      <button
        animate={{
          initial: {
            opacity: 0,
          },
          enter: {
            opacity: 1,
          },
          whileHover: {
            transform: 'scale(1.3)',
            duration: 0.2,
          },
        }}>
        Hover me
      </button>
    </>
  )
}

// AnimatePresence Component
const AnimatePresenceExample = ({ visible }: { visible: boolean }) => {
  return (
    <AnimatePresence>
      {visible && (
        <h3
          animate={{
            leave: {
              opacity: 0,
            },
          }}>
          Fade Out Then Unmount
        </h3>
      )}
    </AnimatePresence>
  )
}

// AnimatePresence with Multiple Elements Component
const AnimatePresenceMultiple = () => {
  const [isHappy, setIsHappy] = useState(true)

  return (
    <div class="column">
      <AnimatePresence enterDelay={300}>
        {isHappy ? (
          <span
            key="happy"
            animate={{
              initial: { transform: 'translateX(50px)', opacity: 0 },
              enter: { transform: 'translateX(0)', opacity: 1 },
              leave: { reverse: true },
            }}>
            😄 I'm happy!
          </span>
        ) : (
          <span
            key="sad"
            animate={{
              initial: { transform: 'translateX(-50px)', opacity: 0 },
              enter: { transform: 'translateX(0)', opacity: 1 },
              leave: { reverse: true },
            }}>
            😢 I'm sad...
          </span>
        )}
      </AnimatePresence>
      <button onClick={() => setIsHappy(!isHappy)}>Toggle Mood</button>
    </div>
  )
}

// Spring Animation Component
const SpringAnimation = () => {
  return (
    <div
      animate={{
        transform: 'scale(1.1)',
        type: spring,
        bounce: 1,
        duration: 3,
        repeat: Infinity,
      }}>
      Spring Animation
    </div>
  )
}

// Easing Function Component
const EasingFunction = () => {
  return (
    <div
      animate={{
        color: ['magenta', 'orange', 'green'],
        ease: easeInOut,
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse',
      }}>
      Easing Function Animation
    </div>
  )
}

export default withExamples([
  withVisibility(BasicAnimation),
  LifecycleAnimations,
  withVisibility(AnimatePresenceExample),
  AnimatePresenceMultiple,
  SpringAnimation,
  EasingFunction,
])
