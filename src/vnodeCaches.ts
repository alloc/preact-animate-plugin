import { VNode } from 'preact'
import { PresenceContext } from './presence'
import { AnimateProp } from './types'

export const vnodeToPresence = new WeakMap<VNode, PresenceContext | undefined>()
export const vnodeToAnimateProp = new WeakMap<VNode, AnimateProp>()
