import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('removes scripts and inline event handlers', () => {
    const out = sanitizeHtml('<p onclick="x()">hi</p><script>alert(1)</script><img src="data:image/png;base64,AAAA" onerror="x()">');
    expect(out).not.toMatch(/script/i);
    expect(out).not.toMatch(/onclick|onerror/i);
    expect(out).toContain('hi');
  });

  it('removes javascript: URLs', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it('adds rel="noopener noreferrer" and target="_blank" to links', () => {
    const div = document.createElement('div');
    div.innerHTML = sanitizeHtml('<a href="https://example.com" target="_self">x</a>');
    const link = div.querySelector('a')!;
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('blocks remote images but keeps inline data images', () => {
    const out = sanitizeHtml('<img src="https://tracker.example/p.gif"><img src="//tracker.example/q.gif"><img src="data:image/png;base64,AAAA">');
    expect(out).not.toContain('tracker.example');
    expect(out).toContain('data:image/png');
  });

  it('strips styles, forms and frames', () => {
    const out = sanitizeHtml('<style>body{}</style><form action="https://evil"><input></form><iframe src="https://evil"></iframe><p style="color:red">ok</p>');
    expect(out).not.toMatch(/<style|<form|<iframe|style=/i);
    expect(out).toContain('ok');
  });
});
