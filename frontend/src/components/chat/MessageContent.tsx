"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  variant: "user" | "assistant";
};

export function MessageContent({ content, variant }: Props) {
  if (variant === "user") {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="chat-prose"
      components={{
        h2: ({ children }) => (
          <h2 className="mb-2 mt-4 first:mt-0 text-[15px] font-medium text-ink">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1.5 mt-3 first:mt-0 text-sm font-semibold text-ink">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-2.5 last:mb-0 leading-relaxed text-ink/90">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="chat-list-ul">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="chat-list-ol">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="chat-list-item">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-ink">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-ink/80 italic">{children}</em>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-accent/30 pl-3 text-sm text-muted">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-canvas px-1.5 py-0.5 font-mono text-xs text-accent">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
