import type { Element, Root, Text } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const BLOCK_ELEMENTS = new Set([
  'p',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'td',
  'th',
  'blockquote',
  'figcaption',
])

function isNonEmptyTextNode(node: unknown): node is Text {
  return (
    typeof node === 'object'
    && node !== null
    && 'type' in node
    && node.type === 'text'
    && 'value' in node
    && typeof node.value === 'string'
    && node.value.trim().length > 0
  )
}

function isNonBrElementNode(node: unknown): node is Element {
  return (
    typeof node === 'object'
    && node !== null
    && 'type' in node
    && node.type === 'element'
    && 'tagName' in node
    && node.tagName !== 'br'
  )
}

const rehypeWrapTextNodes: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (!BLOCK_ELEMENTS.has(node.tagName)) {
        return
      }

      if (!node.children || node.children.length <= 1) {
        return
      }

      const hasNonEmptyTextNode = node.children.some(isNonEmptyTextNode)
      const hasElementNode = node.children.some(isNonBrElementNode)

      if (!hasNonEmptyTextNode || !hasElementNode) {
        return
      }

      node.children = node.children.map((child) => {
        if (isNonEmptyTextNode(child)) {
          return {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: [child],
          } as Element
        }
        return child
      })
    })
  }
}

export default rehypeWrapTextNodes
