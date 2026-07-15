// Friendly browser console banner that greets engineers who open devtools
// Uses console styling so it stands out without leaving stray logs in production
'use client';

import { useEffect } from 'react';

export function DevtoolsBanner() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const headline = '%cCem Besli%c — software engineer';
    const headlineStyle =
      'font-size:48px;font-weight:700;color:#6366f1;text-shadow:0 2px 16px rgba(99,102,241,0.4);';
    const subStyle = 'font-size:18px;color:#94a3b8;margin-left:8px;';
    const lines = [
      'You opened devtools. I like the way you think.',
      'Curl me as plain text:   curl https://cembesli.com/api/cv',
      'Get my whoami JSON:      curl https://cembesli.com/api/whoami',
      'Want to chat?            cem@cembesli.com'
    ].join('\n');
    // eslint-disable-next-line no-console
    console.info(headline, headlineStyle, subStyle);
    // eslint-disable-next-line no-console
    console.info(`%c${lines}`, 'font-family:ui-monospace,monospace;color:#34d399;');
  }, []);
  return null;
}
