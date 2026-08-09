import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  children: string
}

export default function Markdown({ children }: MarkdownProps) {
  return (
    <article className="prose prose-sm max-w-none prose-headings:text-[#191F28] prose-headings:font-bold prose-p:text-[#4E5968] prose-p:leading-relaxed prose-li:text-[#4E5968] prose-strong:text-[#191F28] prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-l-orange-400 prose-blockquote:bg-orange-50 prose-blockquote:py-1 prose-blockquote:not-italic prose-table:border prose-table:border-gray-200 prose-th:border prose-th:border-gray-200 prose-th:bg-gray-50 prose-th:p-2 prose-th:text-[#191F28] prose-td:border prose-td:border-gray-200 prose-td:p-2 prose-td:text-[#4E5968] prose-hr:border-gray-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </article>
  )
}
