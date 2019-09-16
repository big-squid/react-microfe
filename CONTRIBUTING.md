# Contributing

Happily accepting PRs and feedback.

## To Develop

### Setup

- Checkout
- Install package deps `npm i`
- Setup the dev environment `npm run dev:setup`

### Development

This is a little tricky since you need to assert the changes work across multiple fake apps with a build process.

- Start the dev servers `npm run dev`
- Make any changes you want to the microfrontend in `apps/test-remote`
- run `npm run dev:buildremote` to create the new microfrontend artifact.
- localhost:3000 contains the main app shim with the loaded microfrontend
- localhost:3001 contains the microfrontend

## Testing

- Test `npm test`
- Watchmode `npm run test:watch`
- Generate coverage `npm run test:coverage`

## Build

- npm run build