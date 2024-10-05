# vault-block


## Local Development

Currently local development is ran using a Procfile. To start I recommend installing goreman:
```
go install github.com/mattn/goreman@latest
```

Once you have it installed you can run the entire stack locally using:
```
bun run dev
```

## Stack

Bun, Hono, Vite, Drizzle

## Infra Solutions

### Cloudflare Pages
Functions and SPA are deployed to Cloudflare Pages. This gives a super cheap hosting solution allowing me to host the application for next to nothing

### Cloudflare KV
Cloudflare KV was chosen for convenience since I am already using Cloudflare, we primarily use it as a temporary storage layer for refresh tokens

### Turso
Turso was chosen due to it's generous free tier along with it's reasonable limits. Once again chosen due to my primary goal in choosing the stack is to minimize costs








