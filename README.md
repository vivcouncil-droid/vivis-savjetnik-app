# Viv's Savjetnik

AI savjetnik s 5 perspektiva za svakodnevne odluke.

## Deploy na Vercel

1. Uploadaj ovaj folder na GitHub
2. Poveži GitHub repo s Vercelom
3. U Vercel postavkama dodaj Environment Variable:
   - `ANTHROPIC_API_KEY` = tvoj Anthropic API ključ
4. Deploy!

## Lokalni razvoj

```bash
npm install
cp .env.local.example .env.local
# uredi .env.local i dodaj svoj API ključ
npm run dev
```
