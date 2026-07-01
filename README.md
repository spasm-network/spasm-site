## Spasm site

Mirrors: [Forgejo](https://git.spasm.network/spasm-network/spasm-site) [Codeberg](https://codeberg.org/spasm-network/spasm-site) [Github](https://github.com/spasm-network/spasm-site)

Generate nojs pages for a directory, blog, podcast, videos.

### Install

```bash
npm ci
```

### Customize

```bash
cp src/data.example.json src/data.json
vim src/data.json
```

### Run

```bash
npm run prod
```

Default port is 3366, you can change it via `.env` file:

```bash
cp .env.example .env
vim .env
```

### Customize

Copy your favicon.ico to `src/media/icons/favicon.ico`

#### Options

data.theme.name
- `spasm`, `spasm-dark`, `darkvegas`, `greeny`, `neon`

data.categories[0].width
- `full` - display category in a full screen
- `large`, `medium`, `small`

data.items[0].width
- `block` (default) - display item in a default block
- `full` - display item in a full line

data.categories[0].page.showMainHero
- `false` - hide main hero section

data.categories[0].frontPage
- `false` - hide category from home page

data.categories[0].showPagePath
- `false` - hide page path (`home/blog`)

`data.items[0].summary` - is displayed on index, categories pages. It's also shown on the item page if description doesn't exist.
`data.items[0].showSummaryAlways` - display summary even if description exists, e.g., on an item page.
`data.items[0].description` - is displayed on item pages only.

