import React, { useMemo } from 'react';
import { sanitizeHtml } from '../utils/sanitizeHtml';

interface MessageBodyProps {
  html?: string | string[] | null;
  text?: string | null;
  className?: string;
}

const MessageBody: React.FC<MessageBodyProps> = ({ html, text, className }) => {
  const safeHtml = useMemo(() => (html ? sanitizeHtml(Array.isArray(html) ? html.join('') : html) : ''), [html]);

  if (safeHtml) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }

  // Plain text is rendered as text, never as HTML.
  return <pre className={`whitespace-pre-wrap break-words font-sans text-gray-900 ${className ?? ''}`}>{text}</pre>;
};

export default MessageBody;
