import React, { useCallback, useMemo } from 'react'
import isHotkey from 'is-hotkey'
import { Editable, withReact, useSlate, Slate } from 'slate-react'
import { Editor, createEditor } from 'slate'
import { withHistory } from 'slate-history'

import { Button, Icon, Toolbar } from '../components'

const MARK_HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underlined',
  'mod+`': 'code',
}

const RichTextHugeDeepDocExample = () => {
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderMark = useCallback(props => <Mark {...props} />, [])
  const editor = useMemo(
    () => withRichText(withHistory(withReact(createEditor()))),
    []
  )

  return (
    <Slate editor={editor} defaultValue={initialValue()}>
      <Toolbar>
        <MarkButton type="bold" icon="format_bold" />
        <MarkButton type="italic" icon="format_italic" />
        <MarkButton type="underlined" icon="format_underlined" />
        <MarkButton type="code" icon="code" />
        <BlockButton type="heading-one" icon="looks_one" />
        <BlockButton type="heading-two" icon="looks_two" />
        <BlockButton type="block-quote" icon="format_quote" />
        <BlockButton type="numbered-list" icon="format_list_numbered" />
        <BlockButton type="bulleted-list" icon="format_list_bulleted" />
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderMark={renderMark}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={event => {
          for (const hotkey in MARK_HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault()
              editor.exec({
                type: 'toggle_mark',
                mark: MARK_HOTKEYS[hotkey],
              })
            }
          }
        }}
      />
    </Slate>
  )
}

const withRichText = editor => {
  const { exec } = editor

  editor.exec = command => {
    if (command.type === 'toggle_block') {
      const { block: type } = command
      const isActive = isBlockActive(editor, type)
      const isListType = type === 'bulleted-list' || type === 'numbered-list'
      Editor.unwrapNodes(editor, { match: { type: 'bulleted-list' } })
      Editor.unwrapNodes(editor, { match: { type: 'numbered-list' } })

      const newType = isActive ? 'paragraph' : isListType ? 'list-item' : type
      Editor.setNodes(editor, { type: newType })

      if (!isActive && isListType) {
        Editor.wrapNodes(editor, { type, children: [] })
      }

      return
    }

    if (command.type === 'toggle_mark') {
      const { mark: type } = command
      const isActive = isMarkActive(editor, type)
      const cmd = isActive ? 'remove_mark' : 'add_mark'
      editor.exec({ type: cmd, mark: { type } })
      return
    }

    exec(command)
  }

  return editor
}

const isMarkActive = (editor, type) => {
  const marks = Editor.activeMarks(editor)
  const isActive = marks.some(m => m.type === type)
  return isActive
}

const isBlockActive = (editor, type) => {
  const { selection } = editor
  if (!selection) return false
  const match = Editor.match(editor, selection, { type })
  return !!match
}

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    default:
      return <div {...attributes}>{children}</div>
  }
}

const Mark = ({ attributes, children, mark }) => {
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{children}</strong>
    case 'code':
      return <code {...attributes}>{children}</code>
    case 'italic':
      return <em {...attributes}>{children}</em>
    case 'underlined':
      return <u {...attributes}>{children}</u>
  }
}

const MarkButton = ({ type, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, type)}
      onMouseDown={event => {
        event.preventDefault()
        editor.exec({ type: 'toggle_mark', mark: type })
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const BlockButton = ({ type, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, type)}
      onMouseDown={event => {
        event.preventDefault()
        editor.exec({ type: 'toggle_block', block: type })
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const initialValue = () => {
  const el = {
    type: 'nested',
    children: [
      {
        type: 'heading-one',
        children: [
          {
            text: 'adsšasd',
            marks: [
              {
                type: 'italic',
              },
            ],
          },
        ],
      },
      {
        type: 'heading-two',
        children: [
          {
            text: 'asdšasdšasd',
            marks: [
              {
                type: 'italic',
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'This is editable ',
            marks: [],
          },
          {
            text: 'rich',
            marks: [
              {
                type: 'bold',
              },
            ],
          },
          {
            text: ' text, ',
            marks: [],
          },
          {
            text: 'much',
            marks: [
              {
                type: 'italic',
              },
            ],
          },
          {
            text: ' better than a ',
            marks: [],
          },
          {
            text: '<textarea>',
            marks: [
              {
                type: 'code',
              },
            ],
          },
          {
            text: '!',
            marks: [],
          },
        ],
      },
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                text: "Since it's rich text, you can ",
                marks: [],
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                text: 'do things li',
                marks: [],
              },
              {
                text: 'ke turn',
                marks: [
                  {
                    type: 'underlined',
                  },
                ],
              },
              {
                text: ' a selection of',
                marks: [
                  {
                    type: 'italic',
                  },
                  {
                    type: 'underlined',
                  },
                ],
              },
              {
                text: ' text ',
                marks: [
                  {
                    type: 'italic',
                  },
                ],
              },
              {
                text: 'bold',
                marks: [
                  {
                    type: 'bold',
                  },
                  {
                    type: 'italic',
                  },
                ],
              },
              {
                text: ', or add a semantically ',
                marks: [
                  {
                    type: 'italic',
                  },
                ],
              },
              {
                text:
                  'rendered block quote in the middle of the page, like this:',
                marks: [],
              },
            ],
          },
        ],
      },
      {
        type: 'block-quote',
        children: [
          {
            text: 'A wise quote.',
            marks: [],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Try it out for yourself!',
            marks: [],
          },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                text: 'dšas',
                marks: [],
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                text: 'asdš',
                marks: [],
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                text: 'asšasd',
                marks: [],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text: '',
                marks: [],
              },
            ],
          },
        ],
      },
    ],
  }

  const result = []
  for (let j = 0; j < 6; j++) {
    const children1 = []
    for (let i = 0; i < 6; i++) {
      const children = []
      for (let z = 0; z < 7; z++) {
        children.push(JSON.parse(JSON.stringify(el)))
      }
      children1.push({ type: 'nested', children })
    }
    result.push({ type: 'nested', children: children1 })
  }

  return result
}

export default RichTextHugeDeepDocExample
