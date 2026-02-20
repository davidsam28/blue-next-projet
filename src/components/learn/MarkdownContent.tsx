'use client'

interface MarkdownContentProps {
  content: string
}

/**
 * Simple markdown renderer that handles basic formatting.
 * Handles headings, bold, italic, links, lists, code blocks, blockquotes, and paragraphs.
 */
export function MarkdownContent({ content }: MarkdownContentProps) {
  const html = markdownToHtml(content)

  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:text-[#001A80] prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-[#0033FF] prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-[#001A80]
        prose-ul:text-gray-600 prose-ol:text-gray-600
        prose-li:mb-1
        prose-blockquote:border-l-[#0033FF] prose-blockquote:text-gray-500 prose-blockquote:italic
        prose-code:bg-[#F2F2F2] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-[#1a1a2e] prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6
        prose-img:rounded-xl prose-img:shadow-md
        prose-strong:text-gray-900
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function markdownToHtml(md: string): string {
  let html = md

  // Code blocks (```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />')

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Paragraphs — wrap remaining plain text lines
  const lines = html.split('\n')
  const result: string[] = []
  let inBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      result.push('')
      continue
    }
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') ||
        trimmed.startsWith('<li') || trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<hr') || trimmed.startsWith('</')) {
      inBlock = true
      result.push(line)
      if (trimmed.endsWith('>')) inBlock = false
      continue
    }
    if (inBlock) {
      result.push(line)
      continue
    }
    result.push(`<p>${trimmed}</p>`)
  }

  return result.join('\n')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
