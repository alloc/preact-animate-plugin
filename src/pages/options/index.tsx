import { withExamples } from '~/utils/withExamples'
import { withVisibility } from '~/utils/withVisibility'

const TransitionOption = ({ visible }: { visible: boolean }) => {
  return (
    <div
      animate={{
        opacity: visible ? 1 : 0,
        transform: `scale(${visible ? 1 : 0.5})`,
        transition: {
          duration: 0.2,
          opacity: { duration: 1 },
        },
      }}>
      Transition Option
    </div>
  )
}

export default withExamples([
  withVisibility(TransitionOption), //
])
