# Long Game Portfolio Guard

A mobile-first discipline dashboard for manual portfolio tracking and long-term investing guardrails.

This is not a trading app. It does not connect to Robinhood, request brokerage credentials, place trades, show news feeds, or provide trade execution. v1 stores data locally in the browser with LocalStorage and supports JSON export/import backups.

## Features

- Dashboard with account value, cash, margin used, buying power warning, monthly contribution timing, YTD performance, and portfolio health
- Manual holdings entry with thesis, add rules, sell rules, conviction score, and bucket assignment
- Margin guardrails with Green, Yellow, Orange, and Red status
- Bucket allocation tracking and speculative exposure warning
- Buy decision checklist with warning-only guardrails
- Monthly contribution planner
- Optional public-market price refresh for listed tickers
- Options Lock setting
- JSON backup export/import

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Build

```bash
pnpm build
```
