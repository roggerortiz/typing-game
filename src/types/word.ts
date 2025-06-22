import type { TLetter } from './letter'

export type TWord = {
  id: number
  letters: TLetter[]
  active: boolean
  correct?: boolean
}
