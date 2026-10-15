# QuickThrowMail

A small disposable-email web app. Pick a username and domain, get a temporary
mailbox, read incoming messages, and throw the mailbox away when you are done.

Built with Vite, React 18, TypeScript and Tailwind CSS.

## Attribution

All mailbox and message handling is provided by the free [mail.tm](https://mail.tm)
API. QuickThrowMail is an independent client and is not affiliated with or
endorsed by mail.tm. Please follow their terms of service.

## Setup

Requires Node.js 18 or newer.

```bash
npm ci
npm run dev
```

## Scripts

| Script              | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the Vite dev server             |
| `npm run build`     | Production build into `dist/`         |
| `npm run preview`   | Preview the production build          |
| `npm run lint`      | Run ESLint                            |
| `npm run typecheck` | Run the TypeScript compiler (no emit) |

## Privacy notes

- There is no backend. The browser talks directly to `api.mail.tm`.
- Only the mailbox id, address and access token are kept, in `sessionStorage`,
  so the session ends when the tab closes. The password is never stored.
- Message HTML is sanitized with DOMPurify. Scripts, styles, forms, frames and
  remote images (tracking pixels) are removed, and links open in a new tab with
  `rel="noopener noreferrer"`.
- Mailbox retention is controlled by mail.tm and is not guaranteed. Do not use
  temporary mailboxes for anything important, and use "Delete account" to
  remove a mailbox you no longer need.
