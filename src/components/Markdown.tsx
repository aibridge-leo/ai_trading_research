"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Props {
  children: string;
  className?: string;
}

/**
 * 토론 카드 본문 전용 Markdown 렌더러.
 * GFM(테이블, 체크박스, ~~취소선~~ 등) 지원.
 * 다크 모드 + 좁은 카드 폭에 맞춰 컴팩트하게 스타일링.
 */
export function Markdown({ children, className }: Props) {
  return (
    <div className={cn("md-body text-sm leading-relaxed text-[var(--color-foreground)]/90", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-bold text-foreground first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="mb-2 mt-4 text-sm font-bold text-foreground first:mt-0">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="mb-1.5 mt-3 text-[13px] font-semibold text-foreground/95 first:mt-0">
              {children}
            </h5>
          ),
          h4: ({ children }) => (
            <h6 className="mb-1 mt-2 text-[12px] font-semibold text-foreground/95 first:mt-0">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-0.5 pl-5 last:mb-0 marker:text-[var(--color-muted)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-0.5 pl-5 last:mb-0 marker:text-[var(--color-muted)]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline decoration-emerald-500/40 underline-offset-2 hover:text-emerald-300"
            >
              {children}
            </a>
          ),
          code: ({ children, ...props }) => {
            // inline vs block 구분: react-markdown 9+ 기본 동작
            const isInline = !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="rounded bg-[var(--color-border-subtle)] px-1 py-0.5 font-mono text-[12px] text-emerald-300"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="block font-mono text-[12px]" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-md border border-[var(--color-border-subtle)] bg-black/40 p-3 text-[12px] last:mb-0">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-emerald-500/40 bg-emerald-500/5 py-1 pl-3 text-[13px] italic text-foreground/80 last:mb-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-[var(--color-border-subtle)]" />,
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto rounded-md border border-[var(--color-border-subtle)] last:mb-0">
              <table className="w-full text-[12px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--color-surface-elevated)] text-foreground">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-[var(--color-border-subtle)] last:border-b-0">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1.5 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1.5 align-top text-foreground/90">{children}</td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
