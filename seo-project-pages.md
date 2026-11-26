# Per-project page SEO (each folder's own index.html)

Each project is its own URL, so each needs its own title, description and canonical.
Put these in that page's `<head>` (replace the title and description if they already exist).
Keep titles under about 60 characters and descriptions under about 155.
I have not seen these pages yet. Check what each one has now and adjust the wording to match what the page really shows.

Template (change the four values per project):

```html
<title>TITLE</title>
<meta name="description" content="DESCRIPTION">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="https://jpldeleon.github.io/FOLDER/">
<meta property="og:type" content="article">
<meta property="og:site_name" content="John Paul De Leon">
<meta property="og:url" content="https://jpldeleon.github.io/FOLDER/">
<meta property="og:title" content="TITLE">
<meta property="og:description" content="DESCRIPTION">
<meta property="og:image" content="https://jpldeleon.github.io/assets/img/jpdeleon-og.png">
<meta name="twitter:card" content="summary_large_image">
```

Use the project's own screenshot for og:image and twitter:image when you have a 1200x630 one.

| Folder | Title | Description |
|---|---|---|
| nothingtechblob | NothingTechBlob \| Technical SEO & WordPress Project | A WordPress tech site built and optimized by John Paul De Leon, with technical and on-page SEO work and what changed. |
| badlands-ink | Badlands Ink \| Local & E-Commerce SEO WordPress Project | A WooCommerce store with a product catalog and payments, plus technical, local and e-commerce SEO. |
| superbdan | SuperbDan Audit \| Technical SEO Audit & Roadmap | A technical SEO audit of a WordPress tech news site, with findings and a prioritized fix roadmap. |
| auditkit | AuditKit \| Technical SEO Checker Web App | A simple tool that checks a website's technical SEO, built as an API capstone project. |
| johnoffthewall | John Off the Wall \| HTML & CSS Capstone Project | A hand-coded HTML and CSS capstone project, with a responsive layout. |
| pixellog | PixelLog \| Node.js, Express & EJS Capstone Project | A Node.js, Express and EJS web app built as a full-stack bootcamp capstone. |
| jamporudex | JamporuDEX \| Node.js, Express & PostgreSQL Project | A Node.js, Express, PostgreSQL and EJS web app built as a full-stack bootcamp capstone. |
| route196 | Route 196 \| Node.js, Express & EJS Capstone Project | A Node.js, Express and EJS web app built as a full-stack bootcamp capstone. |

Add a link back to the home page on every project page (a "Back to portfolio" link to `https://jpldeleon.github.io/`).
