# Steps

Edit `package.json` and point `@lastolivegames/becsy` to the local fork, mine was at `../becsy-fork`.

pnpm:
- `pnpm install`
- `pnpm dev`
- navigate to http://localhost:8080
- uncomment line 126 in `src/lib/becsy.ts`

npm:
- `npm install`
- `npm run dev`
- navigate to http://localhost:8080
- uncomment line 126 in `src/lib/becsy.ts`
