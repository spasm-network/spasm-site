## Spasm site

Mirrors: [Forgejo](https://git.spasm.network/spasm-network/spasm-site) [Codeberg](https://codeberg.org/spasm-network/spasm-site) [Github](https://github.com/spasm-network/spasm-site)

Generate nojs pages for a directory, blog, podcast, videos.

### Install

```bash
npm ci
```

### Customize

```bash
cp data.example.json data.json
vim data.json
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

### Development

```bash
# Test at localhost:3367
npm run dev
```

### Customize

- Copy your favicon.ico to `src/media/icons/favicon.ico`
- Add icons to `src/media`
- Add media files to `src/media`
- Add custom pages and other files to `src/`

You can access any file in `src/` folder using its path, e.g., `"icon": "/media/icons/my-icon.svg"`.

#### Options

##### General

data.theme.name
- `spasm`, `spasm-dark`, `darkvegas`, `greeny`, `neon`

##### Categories

data.categories[0].width
- `full` - display category in a full screen
- `large`, `medium`, `small`

data.categories[0].page.showMainHero
- `false` - hide main hero section

data.categories[0].frontPage
- `false` - hide category from home page

data.categories[0].showPagePath
- `false` - hide page path (`home/blog`)

##### Items

data.items[0].width
- `block` (default) - display item in a default block
- `full` - display item in a full line

`data.items[0].summary` - is displayed on index, categories pages. It's also shown on the item page if description doesn't exist.
`data.items[0].showSummaryAlways` - display summary even if description exists, e.g., on an item page.
`data.items[0].description` - is displayed on item pages only.

