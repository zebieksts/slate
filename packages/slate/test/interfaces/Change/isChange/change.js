import { Change } from 'slate'

export const input = {
  value: {
    nodes: [],
    selection: null,
    annotations: {},
  },
  operations: [],
}

export const test = value => {
  return Change.isChange(value)
}

export const output = true