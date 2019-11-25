/** @jsx jsx */

import { Editor } from 'slate'
import { jsx } from '../../..'

export const run = editor => {
  Editor.removeMarks(editor, [{ key: 'a' }])
}

export const input = (
  <value>
    <block>
      w
      <mark key="a">
        <anchor />o
      </mark>
      <focus />
      rd
    </block>
  </value>
)

export const output = (
  <value>
    <block>
      w<anchor />o<focus />
      rd
    </block>
  </value>
)