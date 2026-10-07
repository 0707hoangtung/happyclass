import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

/**
 * Parses content with LaTeX formulas ($...$ or $$...$$) and renders with KaTeX.
 * Gracefully handles incomplete syntax while the user is actively typing.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', block = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    try {
      // If block prop is requested or content starts with $$, render as display math
      const trimmed = content.trim();
      if (block || (trimmed.startsWith('$$') && trimmed.endsWith('$$'))) {
        const mathClean = trimmed.replace(/^\$\$|\$\$$/g, '');
        return katex.renderToString(mathClean, {
          displayMode: true,
          throwOnError: false,
        });
      }

      // Parse mixed text with inline $...$ or block $$...$$
      // Regex matches $$...$$ or $...$
      const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
      const parts = content.split(regex);

      return parts
        .map((part) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2);
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
            });
          } else if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
            });
          }
          // Escape HTML entities in plain text and preserve newlines
          return escapeHtml(part).replace(/\n/g, '<br />');
        })
        .join('');
    } catch (err) {
      // Fallback on raw text if parsing fails
      return escapeHtml(content).replace(/\n/g, '<br />');
    }
  }, [content, block]);

  return (
    <div
      className={`math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
