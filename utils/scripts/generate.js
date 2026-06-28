const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configuration
const DATA_FILE = path.join(__dirname, '../../src', 'data.json');
const TEMPLATE_FILE = path.join(__dirname, '../../utils', 'templates/template-index.html');
const TEMPLATE_FILE_ITEM_PAGE = path.join(__dirname, '../../utils', 'templates/template-pages-item.html');
const OUTPUT_DIR = path.join(__dirname, '../../dist');

// Read Data and Template
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
let template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
let templateItemPage = fs.readFileSync(TEMPLATE_FILE_ITEM_PAGE, 'utf-8');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const themeHtml = data?.theme?.name ? `id="theme-${data.theme.name.toLowerCase()}"` : ''

// --- Generate Hero HTML --- //
let heroHtml = '';
if (data.hero) {
    const preHeader = data.hero['pre-header'] || '';
    const header = data.hero['header'] || '';
    const subHeader = data.hero['sub-header'] || '';

    if (preHeader || header || subHeader) {
        heroHtml = `
        <section class="hero-section">
            <div class="hero-container">
                ${preHeader ? `<div class="hero-pre-header">${preHeader}</div>` : ''}
                ${header ? `<h1 class="hero-header">${header}</h1>` : ''}
                ${subHeader ? `<p class="hero-sub-header">${subHeader}</p>` : ''}
            </div>
        </section>
        `;
    }
}

// --- Generate Navigation Links --- //
const navLinksHtmlArray = []
data.navbar.navLinks.forEach(item => {
  const itemContentHtml = `
    <span class="nav-links-item-content">
        ${item.icon ? `<img src="${item.icon}" class="nav-links-item-icon">` : ''}
        ${item.text ? `<span class="nav-links-item-text">${item.text}</span>` : ''}
    </span>
  `;
  let itemHtml = ""
  if (item.link) {
    itemHtml = `
      <a href="${item.link.toLowerCase()}" ${item.type === 'external' ? 'target="_blank"' : ''}>${itemContentHtml}</a>
    `
  } else {
    itemHtml = itemContentHtml
  }
  if (itemHtml) { navLinksHtmlArray.push(itemHtml) }
})
const navLinksHtml = navLinksHtmlArray.join("");

// --- Generate Footer Links HTML --- //
let footerLinksHtml = '';
if (data.footer && Array.isArray(data.footer.footerLinks)) {
    footerLinksHtml = data.footer.footerLinks.map(link => {
        const hasIcon = link.icon && link.icon.trim() !== '';
        const hasText = link.text && link.text.trim() !== '';
        
        // Skip if no content
        if (!hasIcon && !hasText) return '';

        const iconHtml = hasIcon ? `<img src="${link.icon}" class="footer-icon" alt="${link.text || ''}">` : '';
        const textHtml = hasText ? `<span class="footer-link-text">${link.text}</span>` : '';
        
        const targetAttr = link.type === 'external' ? 'target="_blank" rel="noopener noreferrer"' : '';
        
        return `
            <a href="${link.link}" class="footer-link" ${targetAttr}>${iconHtml}${textHtml}</a>
        `;
    }).filter(item => item.trim() !== '').join('');
}

// --- Generate Announcements HTML --- //
let announcementsHtml = '';
if (data.announcements && Array.isArray(data.announcements)) {
    announcementsHtml = '<div class="announcements">';
    data.announcements.forEach(ann => {
        const colorClass = `announcement-${ann.color || 'orange'}`;
        if (ann.link) {
            announcementsHtml += `<a href="${ann.link}" class="announcement-box ${colorClass}" ${ann.type === 'external' ? 'target="_blank"' : ''}>${ann.text}</a>`;
        } else {
            announcementsHtml += `<div class="announcement-box ${colorClass}">${ann.text}</div>`;
        }
    });
    announcementsHtml += '</div>';
}

// --- Function to generate a single section HTML --- //
function generateCategorySectionHTML(cat, ifCategoryPage) {
    const categoryName = cat.name
    const items = cat.items
    // let items = []
    // data.categories.forEach(cat => {
    //   if (String(cat?.name).toLowerCase() === String(categoryName).toLowerCase()) {
    //     items = cat.items
    //   }
    // })
    
    if (!Array.isArray(items)) return '';

    const cardsHtml = items.map(item => {
        // --- Width Logic ---
        const widthType = (item.width || 'block').toLowerCase().trim();
        const isFullWidth = ['full', 'line', 'inline', 'full-line'].includes(widthType);
        const widthClass = isFullWidth ? 'card-full-width' : '';

        // --- Tags Logic (Safe) ---
        const tagsNormal = item.tags || [];
        const tagsPros = item.tagsPros || [];
        const tagsCons = item.tagsCons || [];
        const tagsNormalHtml = tagsNormal.map(tag => `<span class="tag">${tag}</span>`).join('');
        const tagsProsHtml = tagsPros.map(tag => `<span class="tag-orange">${tag}</span>`).join('');
        const tagsConsHtml = tagsCons.map(tag => `<span class="tag-brown">${tag}</span>`).join('');

        // --- Year ---
        const yearHtml = item.year ? `<span class="tag">${item.year}</span>` : "";

        // const tagsHtml = tagsProsHtml + tagsNormalHtml + tagsConsHtml;
        const tagsHtml = tagsProsHtml + tagsConsHtml + tagsNormalHtml + yearHtml;

        // --- Labels Logic ---
        const labels = item.labels || [];
        const labelsHtml = labels.map(label => `<span class="label">${label}</span>`).join('');

        // --- Summary Logic ---
        let summaryHtml = '';
        if (Array.isArray(item.summary)) {
            summaryHtml = item.summary.map(line => `<p>${line}</p>`).join('');
        } else if (typeof item.summary === 'string') {
            // summaryHtml = `<p>${item.summary}</p>`;
            summaryHtml = item.summary ? marked.parse(item.summary) : '';
        } else {
            summaryHtml = '';
        }

        // --- Score ---
        const score = item.score || "";
        let scoreStatus = "normal";
        if (typeof (Number(score)) === "number") {
          if (Number(score) > 9) {
            scoreStatus = "highest";
          } else if (Number(score) > 7) {
            scoreStatus = "high";
          } else if (Number(score) > 3) {
            scoreStatus = "average";
          } else if (Number(score) > 0) {
            scoreStatus = "low";
          }
        }

        // --- Footer Icons Logic ---
        const footerIcons = item.footerIcons || [];
        let footerIconsHtml = '';
        if (footerIcons.length > 0) {
            footerIconsHtml = footerIcons.map(iconKey => {
                // return `<div class="item-block-footer-icon" title="${iconKey}"></div>`;
                return `<img src="media/icons/default-${iconKey}.svg" class="item-block-footer-icon">`;
            }).join('');
        }

        const itemTitleLink = item.title?.toLowerCase()
            .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')
            .replace(/---/g, '-').replace(/--/g, '-');

        return `
            <article class="card ${widthClass}">
                <div class="card-header">
                    <a href="/${itemTitleLink}">
                        <div class="item-title">
                            ${item.logo ? `<img src="${item.logo}">` : ''}
                            ${item.title ?  item.title : ''}
                        </div>
                    </a>
                    <div class="labels-container">
                        ${labelsHtml}
                        ${score ? `<span class="item-block-footer-score item-block-footer-score-${scoreStatus}">${score}</span>` : ''}
                    </div>
                </div>
                <div class="tags">
                    ${tagsHtml}
                </div>
                <div class="description">
                    ${summaryHtml}
                </div>
                <div class="card-footer">
                    <span></span>
                    ${footerIconsHtml ? `<div class="item-block-footer-icons">${footerIconsHtml}</div>` : ''}
                </div>
            </article>
        `;
    }).join('\n');
                // <div class="card-footer">
                //     ${score ? `<span class="item-block-footer-score item-block-footer-score-${scoreStatus}">${score}</span>` : '<span></span>'}
                //     ${footerIconsHtml ? `<div class="item-block-footer-icons">${footerIconsHtml}</div>` : ''}
                // </div>

                // <div class="card-footer">
                //     <a href="${item.link || '#'}" class="visit-link">Visit -></a>
                //     ${footerIconsHtml ? `<div class="item-block-footer-icons">${footerIconsHtml}</div>` : ''}
                // </div>
    const categoryWidth = cat.width ? cat.width : "medium";

    const categoryPageName = categoryName.toLowerCase()
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')
        .replace(/---/g, '-').replace(/--/g, '-')
    const homeLink = ifCategoryPage ? '<a href="/">home </a>' : ''
    let pagePathHtml = ''
    if (cat.showPagePath !== false && cat.showPagePath !== "false") {
      pagePathHtml = `<h2 class="section-title">${homeLink}/ <a href="${categoryPageName}">${categoryName}</a></h2>`
    }

    return `
        <section id="${categoryName}" class="section-block width-${categoryWidth}">
            ${pagePathHtml}
            <div class="products-grid">
                ${cardsHtml}
            </div>
        </section>
    `;
}

// --- Generate categories --- //
function groupItemsByCategories(input) {
  const { items: itemArray = [], categories: existingCategories = [] } = input;
  const categoryMap = new Map(); // Key: lowercase string, Value: Category Object

  // 1. Initialize map with existing categories
  // We use lowercase as the key for matching, but preserve original 'name' in the value
  for (const cat of existingCategories) {
    if (!cat || cat.name === undefined || cat.name === null) continue;

    const originalName = cat.name;
    const lookupKey = String(originalName).trim().toLowerCase();

    if (!lookupKey) continue;

    categoryMap.set(lookupKey, {
      ...cat,              // Keep all existing props (view, front, etc.)
      name: originalName,  // Ensure original casing is preserved
      items: []            // Initialize empty items array
    });
  }

  // 2. Process items and assign them to categories
  for (const item of itemArray ?? []) {
    const itemCategories = Array.isArray(item?.categories) ? item.categories : [];

    for (const cat of itemCategories) {
      if (cat === null || cat === undefined) continue;

      const originalCatName = String(cat).trim();
      const lookupKey = originalCatName.toLowerCase();

      if (!lookupKey) continue;

      let entry = categoryMap.get(lookupKey);

      // If category didn't exist in the original list, create a new one
      // The name will be the item's original casing
      if (!entry) {
        entry = { 
          name: originalCatName, 
          items: [] 
        };
        categoryMap.set(lookupKey, entry);
      }

      entry.items.push(item);
    }
  }

  return [...categoryMap.values()];
}

let allSectionsHtml = '';
// const categories = data.categories;
const categories = groupItemsByCategories(data);

categories.forEach(cat => {
    // Add a category to an index page
    const sectionHtmlForIndex = generateCategorySectionHTML(cat);
    if (
      !("frontPage" in cat) || cat.frontPage === true ||
      cat.frontPage === "true" || cat.frontPage === "show"
    ) {
      allSectionsHtml += sectionHtmlForIndex;
    }

    // Generate a dedicated page for a category
    const sectionHtmlForCategoryPage = generateCategorySectionHTML(cat, true);
    if (cat && cat.name && String(cat.name)) {
    // let heroCategoryPageHtml = heroHtml;
    // if (cat.page?.showMainHero === false || cat.page?.showMainHero === "false") {
    //   heroCategoryPageHtml = '';
    // }
    let heroCategoryPageHtml = '';
    if (cat.page?.showMainHero === true || cat.page?.showMainHero === "true") {
      heroCategoryPageHtml = heroHtml;
    }

    let categoryPageHtml = template
        .replace('{{SITE_TITLE}}', data.meta.title)
        .replace('{{THEME}}', themeHtml)
        .replace('{{LOGO_TEXT}}', data.navbar.brand)
        .replace('{{NAV_LINKS}}', navLinksHtml)
        .replace('{{ANNOUNCEMENTS_HTML}}', announcementsHtml)
        .replace('{{FOOTER_HTML}}', footerLinksHtml) 
        .replace('{{HERO_HTML}}', heroCategoryPageHtml)
        .replace('{{ALL_SECTIONS_HTML}}', sectionHtmlForCategoryPage);

      const categoryFileName = String(cat.name).toLowerCase()
          .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')
          .replace(/---/g, '-').replace(/--/g, '-');
      const outputPath = path.join(OUTPUT_DIR, `${categoryFileName}.html`);
      fs.writeFileSync(outputPath, categoryPageHtml);
    }
});

// --- Final Assembly for index.html --- //
let finalHtml = template
    .replace('{{SITE_TITLE}}', data.meta.title)
    .replace('{{THEME}}', themeHtml)
    .replace('{{LOGO_TEXT}}', data.navbar.brand)
    .replace('{{NAV_LINKS}}', navLinksHtml)
    .replace('{{ANNOUNCEMENTS_HTML}}', announcementsHtml)
    .replace('{{FOOTER_HTML}}', footerLinksHtml) 
    .replace('{{HERO_HTML}}', heroHtml)
    .replace('{{ALL_SECTIONS_HTML}}', allSectionsHtml);

// --- Write to dist/index.html --- //
const outputPath = path.join(OUTPUT_DIR, 'index.html');
fs.writeFileSync(outputPath, finalHtml);

console.log(`✅ Generated single page: dist/index.html`);
// console.log(`   Sections included: ${categories.join(', ')}`);

// --- Function to generate a single item page HTML --- //
function generateItemPage(item) {
    const slug = item.title?.toLowerCase()
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')
        .replace(/---/g, '-').replace(/--/g, '-');
    const outputPath = path.join(OUTPUT_DIR, `${slug}.html`);

    // --- Header Components ---
    const logoHtml = item.logo ? `<img src="../${item.logo}" class="item-logo" alt="${item.title}">` : '';
    
    // Labels (Joined with Score in one container)
    const labels = item.labels || [];
    const labelsHtml = labels.map(label => `<span class="item-label">${label}</span>`).join('');

    // Score
    const score = item.score || "";
    let scoreStatus = "normal";
    if (typeof (Number(score)) === "number") {
      if (Number(score) > 9) scoreStatus = "highest";
      else if (Number(score) > 7) scoreStatus = "high";
      else if (Number(score) > 3) scoreStatus = "average";
      else if (Number(score) > 0) scoreStatus = "low";
    }
    const scoreHtml = score ? `<span class="item-score ${scoreStatus === 'normal' ? '' : scoreStatus}">${score}</span>` : '';

    // Combined Labels & Score HTML for the header
    // Note: We wrap them in a flex container to keep them on the same line
    const headerMetaHtml = `
        <div class="item-header-meta">
            <div class="item-header-meta-row">
                ${labelsHtml}
                ${scoreHtml}
            </div>
        </div>
    `;

    // Links (Visit, Tor, I2P) + Footer Icons (Combined)
    const links = [];
    if (item.links?.website) links.push({ text: 'Visit', href: item.links?.website, isExternal: true });
    if (item.links?.onion) links.push({ text: 'Tor', href: item.links?.onion, isExternal: true });
    if (item.links?.i2p) links.push({ text: 'I2P', href: item.links?.i2p, isExternal: true });
    if (item.links?.discuss) links.push({ text: 'Discuss', href: item.links?.discuss, isExternal: true });
    
    const linkButtonsHtml = links.map(l => 
        `<a href="${l.href}" class="visit-link" ${l.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>${l.text} &rarr;</a>`
    ).join('');

    // Footer Icons
    const footerIcons = item.footerIcons || [];
    let footerIconsHtml = '';
    if (footerIcons.length > 0) {
        footerIconsHtml = footerIcons.map(iconKey => {
            return `<img src="../media/icons/default-${iconKey}.svg" class="item-footer-icon" alt="${iconKey}" title="${iconKey}">`;
        }).join('');
    }

    // Combined Links & Icons HTML
    const actionRowHtml = `
        <div class="item-action-row">
            ${linkButtonsHtml}
            ${footerIconsHtml ? `<div class="item-footer-icons">${footerIconsHtml}</div>` : ''}
        </div>
    `;

    // Tags
    const tagsPros = (item.tagsPros || []).map(t => `<span class="tag-orange">${t}</span>`).join('');
    const tagsCons = (item.tagsCons || []).map(t => `<span class="tag-brown">${t}</span>`).join('');
    const tagsNormal = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    const yearHtml = item.year ? `<span class="tag">${item.year}</span>` : "";
    const tagsHtml = tagsPros + tagsCons + tagsNormal + yearHtml;

    // Media
    let mediaHtml = '';
    let mediaHtmlArray = [];
    if (Array.isArray(item.media)) {
      item.media.forEach(mediaItem => {
        if (mediaItem.link && typeof(mediaItem.link) === "string") {
          const mediaItemHtml = wrapLinkInMediaHtmlTags(mediaItem.link);
          if (mediaItemHtml) {
            mediaHtmlArray.push(`
              <div class="media-file">
                ${mediaItemHtml}
              </div>
            `)
          };
        }
      });
      mediaHtml = mediaHtmlArray.join('');
    }

    // Summary
    // let summaryHtml = item.summary || '';
    // summaryHtml = summaryHtml.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
    let summaryHtml = item.summary ? marked.parse(item.summary) : '';

    // Description
    let descriptionHtml = '';
    if (Array.isArray(item.description)) {
        descriptionHtml = item.description.map(line => `<p>${line}</p>`).join('');
    } else if (typeof item.description === 'string') {
        // descriptionHtml = `<p>${item.description}</p>`;
        descriptionHtml = item.description ? marked.parse(item.description) : '';
    } else {
        descriptionHtml = '';
    }
    // const descriptionHtml = item.description ? marked.parse(item.description) : '';

    // Delete summary if description exists
    if (
      descriptionHtml && typeof(descriptionHtml) === "string" &&
      item.showSummaryAlways !== true && item.showSummaryAlways !== "true"
    ) { summaryHtml = ''; }

    // --- Extra Sections Logic ---
    let extraSectionsHtml = '';
    if (Array.isArray(item.extra)) {
        extraSectionsHtml = '<div class="item-extra-container">';
        item.extra.forEach(section => {
            const title = section.title ? `<h3 class="item-extra-title ${section.color || ''}">${section.title}</h3>` : '';
            
            // Parse Markdown for text
            const textHtml = section.text ? marked.parse(section.text) : '';

            let linksHtml = "";
            if (section.links && Array.isArray(section.links)) {
              let linksHtmlArray = [];
              section.links.forEach(item => {
                let linkStatsString = ''
                if (item.stats?.reply) {
                  const replyCount = Number(item.stats.reply);
                  if (typeof(replyCount) === "number" && replyCount) {
                    const step = 10;
                    if (replyCount >9) {
                      const bucket = Math.floor((replyCount) / step) * step;
                      linkStatsString = ` (${bucket}+ comments)`;
                    }

                  }
                }
                const linkColorClass = item.color ? `item-extra-link-${item.color}` : '';
                const linkHtml = `<p><span class="${linkColorClass}"><a href="${item.link.toLowerCase()}" ${item.type === 'external' ? 'target="_blank"' : ''}>${item.title}</a></span><span>${linkStatsString}</span></p>`;
                linksHtmlArray.push(linkHtml);
              })
              linksHtml = linksHtmlArray.join("");
            }
            
            // Apply color class to the container if specified
            const colorClass = section.color ? `item-extra-${section.color}` : '';
            
            extraSectionsHtml += `
                <section class="item-extra-section ${colorClass}">
                    ${title}
                    <div class="item-extra-text">${textHtml}</div>
                    ${linksHtml ? `<div class="item-extra-links">${linksHtml}</div>` : ''}
                </section>
            `;
        });
        extraSectionsHtml += '</div>';
    }

    // --- Assemble HTML ---
    let itemPageHtml = templateItemPage
        .replace('{{ITEM_NAME}}', item.title)
        .replace('{{ITEM_NAME}}', item.title)
        .replace('{{THEME}}', themeHtml)
        .replace('{{SITE_TITLE}}', data.meta.title)
        .replace('{{LOGO_TEXT}}', data.navbar.brand)
        .replace('{{NAV_LINKS}}', navLinksHtml)
        .replace('{{FOOTER_HTML}}', footerLinksHtml)
        .replace('{{ANNOUNCEMENTS_HTML}}', announcementsHtml)
        .replace('{{ITEM_LOGO}}', logoHtml)
        .replace('{{ITEM_HEADER_META}}', headerMetaHtml)
        .replace('{{ITEM_ACTION_ROW}}', actionRowHtml)
        .replace('{{ITEM_TAGS_HTML}}', tagsHtml)
        .replace('{{ITEM_MEDIA_HTML}}', mediaHtml)
        .replace('{{ITEM_DESCRIPTION_HTML}}', descriptionHtml)
        .replace('{{ITEM_SUMMARY_HTML}}', summaryHtml)
        .replace('{{ITEM_EXTRA_HTML}}', extraSectionsHtml);

    // Write file
    fs.writeFileSync(outputPath, itemPageHtml);
    console.log(`✅ Generated: dist/${slug}.html`);
}

// --- Execute Generation for item pages --- //
if (Array.isArray(data.items)) {
    data.items.forEach(generateItemPage);
    console.log(`\n🎉 Finished generating all item pages.`);
} else {
    console.log('❌ No items found in data.json');
}



// --- Helper functions --- //
function wrapLinkInMediaHtmlTags(url) {
  const safeUrl = escapeAttr(url);

  const clean = String(url).split('#')[0].split('?')[0];
  const extension = clean.toLowerCase().split('.').pop();

  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    ico: 'image/ico',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    flac: 'audio/flac',
    opus: 'audio/opus',
    m4a: 'audio/mp4',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    flv: 'video/x-flv'
  };

  const mimeType = mimeTypes[extension];

  if (!mimeType) {
    return `<a href="${safeUrl}" class="media-other" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
  }

  if (mimeType.startsWith('image/')) {
    return `<img src="${safeUrl}" class="media-image" alt="Embedded image" />`;
  }

  if (mimeType.startsWith('audio/')) {
    return `
      <div class="media-wrap">
        <audio class="media-audio" controls>
          <source src="${safeUrl}" type="${mimeType}">
          Your browser does not support the audio element.
        </audio>

        <div class="media-download">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <a href="${safeUrl}" target="_blank" download>Download</a>
        <div>
      </div>
    `.trim();
  }

  if (mimeType.startsWith('video/')) {
    return `
      <div class="media-wrap">
        <video class="media-video" controls>
          <source src="${safeUrl}" type="${mimeType}">
          Your browser does not support the video element.
        </video>

        <div class="media-download">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <a href="${safeUrl}" target="_blank" download>Download</a>
        <div>
      </div>
    `.trim();
  }

  return `<a href="${safeUrl}" class="media-other" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
