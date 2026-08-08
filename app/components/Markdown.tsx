import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  children: string
}

export default function Markdown({ children }: MarkdownProps) {
  return (
    <article className="prose prose-sm max-w-none prose-headings:text-[#191F28] prose-p:text-[#4E5968] prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-[#191F28] prose-code:text-[#191F28] prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-blockquote:border-l-blue-500 prose-blockquote:text-[#4E5968] prose-li:text-[#4E5968] prose-table:text-sm prose-th:bg-gray-50 prose-th:text-[#191F28] prose-td:text-[#4E5968]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </article>
  )
}
