# Shopify TypeScript x Node.js x Express.js x React.js Boilerplate

An embedded app starter template to get up and ready with Shopify app development with TypeScript. This is heavily influenced by the choices Shopify Engineering team made in building their [starter template](https://github.com/shopify/shopify-app-node) to ensure smooth transition between templates.

I've also included [notes](/NOTES.md) on this repo which goes over the repo on why certain choices were made.

Other repos:

- [Shopify Node.js x Express.js x React.js Boilerplate](https://github.com/kinngh/shopify-express-mongodb-app): This repo but in `JavaScript`.
- [Koa x Next.js](https://github.com/kinngh/shopify-node-mongodb-next-app): Starter template based on Shopify's older tech stack of using Koa and Next.js.
- [Shopify Playground](https://github.com/kinngh/shopify-polaris-playground): A playground for Shopify Polaris to allow for building App UI locally and drag/drop directly into this repo to speed up development.

## Tech Stack

- React.js
  - `hookrouter` for easier routing.
- Express.js
- MongoDB
- Vite
- Localtunnel
  - Localtunnel replaces use of commercial software like `ngrok`, also because `ngrok` doesn't really work well with slower connections
- Apollo/Client

## Why I made this

The Shopify CLI generates an amazing starter app but it still needs some more boilerplate code and customizations so I can jump on to building apps with a simple clone. This includes:

- MongoDB based session and database management.
- Monetization (recurring subscriptions) ready to go.
- Local Tunnel instead of Ngrok.
- Webhooks isolated and setup.
- React routing taken care of (I miss Next.js mostly because of routing and under the hood improvements).
- Misc boilerplate code and templates to quickly setup inApp subscriptions, routes, webhooks and more.

## Notes

### Setup

- Refer to [SETUP](/SETUP.md)

### Misc

- Storing data is kept to a minimal to allow building custom models for flexibility.
  - Session persistence is also kept to a minimal and based on the Redis example provided by Shopify, but feel free to modify as required.
- When pushing to production, add `__templates` to `.gitignore`.