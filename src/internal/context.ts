import { Context } from 'preact'
import { currentComponent } from './currentComponent'

export function getContextValue<T>(provider: Context<T>): T | undefined {
  if (currentComponent) {
    const contextId = (provider as any).__c
    const context = currentComponent.context[contextId]
    if (context) {
      return context.props.value
    }
    // Return the default value
    return (provider as any).__
  }
}
