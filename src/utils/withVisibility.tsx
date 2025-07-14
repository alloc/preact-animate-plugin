import { useSignal } from '@preact/signals'
import type { FunctionalComponent } from 'preact'

export const withVisibility =
  (Component: FunctionalComponent<{ visible: boolean }>) => () => {
    const visible = useSignal(true)
    return (
      <div class="column">
        <Component visible={visible.value} />
        <button
          onClick={() => {
            visible.value = !visible.value
          }}>
          Toggle Visibility
        </button>
      </div>
    )
  }
