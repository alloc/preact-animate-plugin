import type { ComponentType } from 'preact'
import { isArray } from 'radashi'

export function withExamples(
  components: ComponentType[] | Record<string, ComponentType[]>
) {
  return () => (
    <div class="examples">
      {isArray(components)
        ? components.map(Component => (
            <div class="example column">
              <Component />
            </div>
          ))
        : Object.entries(components).map(([title, components]) => (
            <>
              <h2>{title}</h2>
              {components.map(Component => (
                <div class="example column">
                  <Component />
                </div>
              ))}
            </>
          ))}
    </div>
  )
}
