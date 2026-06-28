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
nano src/data.json
```

### Run

```bash
npm run prod
```

### Options

data.categories[0].width
- `full` - display category in a full screen

data.items[0].width
- `block` (default) - display item in a default block
- `full` - display item in a full line

data.categories[0].page.shoMainHero
- `false` - hide main hero section

data.categories[0].frontPage
- `false` - hide category from home page
