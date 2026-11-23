/*!
 * jpt-chat.js - "Ask Jampol", a chat box for jpldeleon.github.io
 * Mission: let visitors get to know Jampol (the answers are written in his first-person voice). Zero dependencies. No backend: answers come from the KNOWLEDGE BASE below.
 * Embed: <script src="assets/js/jpt-chat.js" defer></script> before </body>
 */
(() => {
  'use strict';
  if (window.__jpt) return;
  window.__jpt = true;

  /* ───────────────────────── KNOWLEDGE BASE ─────────────────────────
   * add(id, keywords[], answer, {w: weight, cmd: [exact commands]})
   * - keywords with a space are matched as phrases (worth 2 points)
   * - single words are matched as whole words / prefixes (worth 1 point)
   * - answers are first-person, in Jampol's voice; pass an array of lines: '' = blank gap, '• text' = bullet, anything else = its own line
   * - answers support **bold**, [text](https://url), {{clickable command}}
   * Entries marked  // EDIT  are drafts in your voice - tweak them!
   * ─────────────────────────────────────────────────────────────── */
  const SITE = 'https://jpldeleon.github.io';
  const E = [];
  const add = (id, k, a, o = {}) =>
    E.push({ id, k, a: Array.isArray(a) ? a.join('\n') : a, w: o.w || 1, cmd: o.cmd || [id] });

  /* ---- core ---- */
  add('help', ['help', 'commands', 'menu', 'options', 'what can you do', 'what can i ask', 'what do you know', 'how does this work', 'how to use', 'topics', 'list topics'],
    [
      `Happy to help! Ask me anything about me in plain English, like "why should we hire you?", or tap a topic:`,
      ``,
      `• **Professional:** {{about}}, {{experience}}, {{skills}}, {{projects}}, {{education}}, {{certs}}, {{resume}}, {{contact}}`,
      `• **Off the clock:** {{hobbies}}, {{johnoffthewall}}`,
      `• **Hiring questions:** {{interview}}`,
      ``,
      `{{clear}} wipes the slate whenever you like.`
    ],
    { cmd: ['help', '?', 'menu', 'commands'] });

  add('greeting', ['hi', 'hello', 'hey', 'yo', 'sup', 'hola', 'kumusta', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy', 'hiya', 'kamusta', 'musta'],
    [
      `Hi there! 👋 I'm **John Paul De Leon**, but my friends call me **Jampol**.`,
      ``,
      `{{about}} is a great place to start, or {{help}} shows everything I can talk about.`
    ],
    { cmd: ['hi', 'hello', 'hey'] });

  add('thanks', ['thanks', 'thank', 'salamat', 'cheers', 'appreciate', 'thank you', 'thx', 'ty', 'maraming salamat', 'much appreciated'],
    `You're so welcome! 😄 If you're still curious, my {{projects}} show my work in action, and my {{resume}} has the full story.`);

  add('bot', ['bot', 'chatbot', 'human', 'are you real', 'are you ai', 'are you a bot', 'powered by', 'your name', 'jupiter', 'who are you', 'what are you', 'are you chatgpt', 'are you gpt', 'are you a real person', 'is this ai', 'is this a bot', 'who made you', 'who built you', 'who created you', 'what is jupiter', 'who is jupiter'],
    `Good question! This chat is a hand-built script that answers in my voice. It's not a live person and it's not an AI: it matches your words against what I've shared about myself, so everything stays in your browser. If it ever misses the mark, {{help}} shows what I can answer, or you can {{contact}} me directly.`,
    { w: 0.9, cmd: ['whoareyou', 'who are you', 'jupiter'] });

  add('nickname', ['nickname', 'nicknamed', 'what do friends call', 'call him', 'who is jampol', 'why jampol', 'what does jampol mean', 'jampol mean'],
    `**Jampol** is what my friends call me, and **JP** works too, so use whichever feels right. My mission here is simple: help you get to know me, both the professional and the off-the-clock sides, starting with {{about}} or {{hobbies}}.`,
    { w: 3, cmd: ['jampol', 'nickname', 'jp'] });

  add('about', ['about', 'yourself', 'whoami', 'intro', 'introduce', 'summary', 'profile', 'who'],
    [
      `I'm **John Paul De Leon**, but call me **Jampol**. I'm a Technical SEO Specialist based in Metro Manila, PH.`,
      ``,
      `• **Experience:** about 5 years of link prospecting, backlink research and outreach at Intelligent.com LLC and Awisee`,
      `• **Training:** a full-stack web development bootcamp and a Technical SEO certification`,
      `• **Style:** I'm curious, adaptable, detail-focused and research-driven, with a long-term commitment to SEO`,
      ``,
      `Explore my {{experience}}, {{skills}} and {{projects}}, or my off-duty side in {{hobbies}}.`
    ],
    { cmd: ['about', 'whoami', 'about me', 'summary'] });

  /* ---- experience ---- */
  add('experience', ['experience', 'work', 'career', 'history', 'jobs', 'employment', 'timeline', 'background', 'work history', 'employment history', 'previous jobs', 'past jobs', 'where has he worked', 'where did he work', 'companies', 'employers'],
    [
      `My career is built on research, starting in 2013:`,
      ``,
      `• **May 2025 to now:** self-directed learning (full-stack bootcamp, Technical SEO Sprint, AI workflows)`,
      `• **Jan to May 2025:** SEO Outreach Specialist, Awisee ({{awisee}})`,
      `• **Nov 2020 to Sep 2024:** Research Analyst, SEO link prospecting, Intelligent.com ({{intelligent.com}})`,
      `• **May to Nov 2020:** Contact Finder, Intelligent.com ({{contact finder}})`,
      `• **Jan 2019 to May 2020:** Freelance Research Consultant ({{freelance}})`,
      `• **Sep 2013 to Nov 2018:** Research Analyst (Web Researcher), Straive ({{straive}})`
    ],
    { cmd: ['experience', 'career', 'work', 'ls career'] });

  add('awisee', ['awisee', 'outreach specialist', 'stockholm'],
    [
      `At Awisee (remote, with a Stockholm team, January to May 2025), I worked as an **SEO Outreach Specialist**.`,
      ``,
      `• Built and verified prospect lists that kept link-building campaigns running smoothly, cutting manual list-building time`,
      `• Cleaned and organized lead data so outreach reached higher-quality contacts`,
      `• Spotted ways to streamline the prospect-list workflow and proposed improvements to the team`
    ],
    { w: 2 });

  add('intelligent', ['intelligent', 'intelligent.com', 'prospecting', 'analyst', 'seattle', 'research analyst', 'link prospecting', 'contact research', 'data quality', 'email database', 'email databases', 'intelligent com', 'research role', 'link prospector', 'prospector', 'email research', 'contact finding', 'database errors', 'submitted files', 'recurring errors', 'accuracy of contact'],
    [
      `At Seattle-based Intelligent.com LLC (remote, November 2020 to September 2024), I was a **Research Analyst for SEO Link Prospecting**.`,
      ``,
      `• Wrote the research specs that guided the US and outreach teams, clarifying them with team leaders to match campaign goals ({{research guide}})`,
      `• Built monthly prospect lists that met and sustained monthly and yearly outreach quotas`,
      `• Reviewed submitted files and investigated errors in the link and email databases, helping improve contact research accuracy`,
      `• Wrote a personal script to streamline my research workflow`,
      `• Was trusted to pilot link-prospecting strategy for new client accounts ({{pilot projects}})`
    ],
    { w: 1.5 });

  add('contactfinder', ['contact finder', 'finder', 'verification'],
    [
      `Before becoming an analyst, I was a **Contact Finder** at Intelligent.com LLC (May to November 2020).`,
      ``,
      `• Researched and verified high-quality leads for link-building outreach`,
      `• Met daily and monthly quotas under tight deadlines`,
      `• Applied consistent qualification criteria that saved the team from wasting outreach on low-authority or irrelevant sites`,
      `• Shared research and verification techniques with colleagues`,
      ``,
      `That track record earned me a promotion to Research Analyst ({{intelligent.com}}).`
    ],
    { w: 2 });

  add('freelance', ['freelance', 'freelancer', 'consultant', 'upwork', 'golance', 'scraping', 'referral'],
    [
      `From January 2019 to May 2020, I ran a referral-based practice as a **Research Consultant**.`,
      ``,
      `• Delivered lead-generation projects for outsourced clients`,
      `• Used web scraping and data entry to build and organize prospect and contact lists`,
      `• Kept every client's data accurate and consistent`,
      ``,
      `Profiles: [Upwork](https://www.upwork.com/freelancers/~01562764cad5d47331) and [GoLance](https://golance.com/freelancer/john.paul.leonard.de.leon).`
    ],
    { w: 1.5 });

  add('straive', ['straive', 'spi', 'lean', 'six sigma', 'sigma', 'award'],
    [
      `My first big chapter ran from September 2013 to November 2018 at Straive (formerly SPi Global), on-site as a **Research Analyst (Web Researcher)**.`,
      ``,
      `• Built an Excel macro (an automation solution) that helped win a **Lean Six Sigma Award** ({{excel macro}})`,
      `• Piloted and onboarded new projects and accounts ({{pilot projects}})`,
      `• Temporarily stepped in to support and lead other teams during critical deadlines ({{leadership}})`,
      `• Consistently met quota and deadlines, including overtime on other accounts`
    ],
    { w: 2 });

  /* ---- skills ---- */
  add('skills', ['skills', 'stack', 'tech', 'technologies', 'tools', 'proficient', 'expertise', 'good', 'languages', 'skillset', 'skill set', 'what can he do', 'capabilities', 'strong in', 'tech stack', 'programming', 'coding'],
    [
      `My toolkit blends search and code:`,
      ``,
      `• **SEO:** technical, on-page and off-page SEO, site architecture, Core Web Vitals, schema markup, performance optimization ({{seo}})`,
      `• **Web development:** HTML, CSS, JavaScript, Node.js, Express.js, EJS, PostgreSQL, Bootstrap, Git/GitHub, REST APIs, responsive design`,
      `• **WordPress:** Elementor, WooCommerce, Rank Math, Yoast SEO, WPForms, LocalWP, theme customization ({{wordpress}})`,
      `• **Tools & analytics:** Google Analytics, Search Console, Screaming Frog, SEMrush, Ahrefs, Looker Studio, Lighthouse`,
      `• **AI & automation:** prompt and context engineering, LLM APIs, local models with Ollama, still learning ({{ai}})`
    ],
    { cmd: ['skills', 'stack', 'tools'] });

  add('seo', ['seo', 'technical seo', 'backlink', 'backlinks', 'linkbuilding', 'link building', 'audit', 'screaming frog', 'core web vitals', 'cwv', 'seo skills', 'seo knowledge', 'seo expertise', 'search engine optimization', 'seo experience', 'seo background', 'link building experience', 'link prospecting experience'],
    [
      `SEO is my home turf.`,
      ``,
      `• **Off-page:** 5+ years of research-driven link prospecting, qualification, vetting and outreach lists`,
      `• **Technical:** learned through the SEO Workout certification and hands-on projects`,
      `• **Focus areas:** Core Web Vitals, performance, schema markup and site architecture`,
      `• **Tools:** full list in {{skills}}`,
      ``,
      `The proof is in {{auditkit}}, {{badlands ink}} and {{nothingtechblob}}.`
    ],
    { cmd: ['seo', 'technical seo'] });

  add('seo-tech', ['indexing', 'indexability', 'metadata', 'meta tags', 'crawlability', 'crawl', 'crawling', 'page speed', 'pagespeed', 'broken links', 'structured data', 'schema', 'technical seo issues', 'audit', 'audits', 'technical audit', 'site audit', 'crawl issues', 'sitemap', 'robots.txt', 'canonical', 'site speed', 'load time', 'indexing issues', 'missing metadata', 'meta descriptions', 'title tags', 'seo issues', 'seo problems'],
    [
      `I enjoy finding and troubleshooting technical SEO issues such as:`,
      ``,
      `• Broken links and missing metadata`,
      `• Indexing problems and crawlability`,
      `• Page speed and structured data`,
      ``,
      `I also like exploring ideas for tools that could make that work easier, like {{auditkit}}. My wider SEO background is in {{seo}}.`
    ],
    { w: 2.5 });

  add('seo-trends', ['seo trends', 'seo news', 'industry updates', 'industry news', 'staying current', 'stay current', 'stay updated', 'keep up', 'trends', 'follow seo', 'latest in seo', 'google updates', 'algorithm updates', 'algorithm', 'newsletters', 'communities', 'forums', 'keep up with seo', 'up to date', 'how do you stay'],
    [
      `I keep up with SEO by following professionals, websites, forums and communities.`,
      ``,
      `Chances for independent experimentation have been limited, although I've tried a local WordPress setup ({{wordpress}}).`
    ],
    { w: 2.5 });

  add('wordpress', ['wordpress', 'wp', 'woocommerce', 'elementor', 'localwp', 'ecommerce', 'e-commerce', 'plugin', 'wordpress experience', 'wordpress skills', 'woocommerce experience', 'wordpress projects'],
    [
      `WordPress and WooCommerce are central to my builds.`,
      ``,
      `• Built and practiced on multiple LocalWP projects with Elementor, Rank Math, Yoast SEO and WPForms, plus theme customization`,
      `• {{badlands ink}} is my full WooCommerce build, with a product catalog, payments and optimization`,
      `• {{nothingtechblob}} pairs WordPress with technical and on-page SEO`
    ],
    { cmd: ['wordpress', 'woocommerce'] });

  add('ai', ['ai', 'prompt', 'ollama', 'workflows', 'context engineering', 'llms', 'chatgpt', 'ai skills', 'ai knowledge', 'ai proficiency', 'ai experience', 'ai automation', 'artificial intelligence', 'machine learning', 'llm', 'beginner in ai', 'ai expert', 'ai expertise', 'does he know ai', 'ai tools', 'ai level'],
    [
      `I'm a beginner in AI and still learning its practical applications.`,
      ``,
      `• **Using now:** prompt and context engineering, and AI-assisted coding for my portfolio`,
      `• **Exploring:** LLM API integration and local models with Ollama`,
      `• **Learning next:** RAG, embeddings and semantic search, and AI agents`,
      `• **Interested in:** AI for SEO workflows, automation and useful tools, always AI-assisted and human-checked`,
      ``,
      `{{ai coding}} shows how I work with it day to day.`
    ],
    { w: 1.5, cmd: ['ai', 'ai workflows'] });

  add('q-aicoding', ['ai coding', 'ai-assisted', 'vibe coding', 'vibe', 'code review', 'ai assisted coding', 'how do you use ai', 'use ai', 'development', 'ai development', 'coding with ai', 'copilot', 'ai assistant', 'prompting', 'chatgpt for coding', 'use chatgpt', 'use claude', 'coding with chatgpt', 'coding with claude'],
    [
      `This is how I work with AI when I build:`,
      ``,
      `• I use AI to help implement ideas, refine prompts and review code`,
      `• I test every change in the browser and use developer tools to investigate issues`,
      `• I fix what I can myself, and ask AI for help when I'm stuck`,
      ``,
      `For where I stand with AI overall, see {{ai}}.`
    ],
    { w: 3, cmd: ['ai coding', 'vibe coding'] });

  /* ---- hobbies & interests (mirrors the Hobbies & Interests applet) ---- */
  add('hobbies', ['hobbies', 'hobby', 'interests', 'interest', 'free time', 'for fun', 'off the clock', 'outside work', 'outside of work', 'passions', 'dotfiles', 'fun', 'leisure', 'pastimes', 'weekends', 'personal life', 'beyond work', 'personal side', 'personal interests'],
    [
      `Away from the keyboard, I'm into:`,
      ``,
      `• {{music}}: {{pop punk}}, {{nu metal}}, {{alternative rock}} and {{opm}}`,
      `• {{nba}}: favorite players, no favorite team named`,
      `• {{gaming}}: Dota, CS, NBA 2K and more`,
      `• {{tech hobbies}}: {{linux mint}}, {{android}}, {{open source}} and {{local ai}}`,
      `• {{seo tools}} and {{web development}}: research, AEO/GEO and building small tools`,
      `• {{creative}}: {{photography}}, Lightroom and {{davinci resolve}}`,
      `• {{adventures}}: {{motorcycles}}, {{cars}} and {{travel}}`,
      `• {{dogs}}: Bucky and Loki`,
      `• {{watchlist}}: sitcoms, {{marvel}}, {{john wick}} and {{ghibli}}`,
      `• {{personality}}: how I'm wired`,
      `• Dreams: {{bucket list}}, {{dream careers}} and {{life goals}}`,
      ``,
      `For even more of me outside work, visit {{johnoffthewall}}.`
    ],
    { w: 1.5, cmd: ['hobbies', 'hobby', 'interests', 'dotfiles', 'off the clock'] });

  add('hob-tech', ['tech hobbies', 'linux', 'arch', 'android', 'custom rom', 'custom roms', 'rom', 'roms', 'firmware', 'hardware', 'foss', 'open source', 'open-source', 'desktop customization', 'ricing', 'tinkering', 'zsh', 'everforest'],
    [
      `My tech tinkering is basically a lifestyle.`,
      ``,
      `• **Linux:** desktop customization (Arch, zsh and Everforest)`,
      `• **Mobile:** Android, custom ROMs and firmware`,
      `• **Hardware and open source:** PC hardware and troubleshooting, FOSS`,
      `• **AI and web:** local LLMs and AI tools, web experiments, coding`,
      `• **Also:** tech news and UI/UX design`,
      ``,
      `This very desktop is the hobby in action ({{linux inspiration}}). Related: {{ai}} and {{hobbies}}.`
    ],
    { w: 2, cmd: ['tech hobbies'] });

  add('hob-creative', ['creative', 'photography', 'photo', 'photos', 'photoshop', 'lightroom', 'davinci', 'resolve', 'video editing', 'graphic design', 'editing'],
    `My creative side shows up in photography, graphic design and video work, with Photoshop, Lightroom and DaVinci Resolve as my go-to tools.`,
    { w: 2, cmd: ['creative'] });

  add('hob-adventures', ['adventures', 'adventure', 'travel', 'traveling', 'travelling', 'motorcycle', 'motorcycles', 'motorbike', 'cars', 'driving', 'cycling', 'bike', 'hiking', 'nature', 'food trip', 'food trips', 'trips'],
    [
      `I'm happiest when I'm exploring.`,
      ``,
      `• Travel and food trips to taste the local cuisine`,
      `• Scenic rides on motorcycles, cars and bikes`,
      `• Hiking and nature`,
      ``,
      `Whatever is still unchecked lives on my {{bucket list}}.`
    ],
    { w: 1.5, cmd: ['adventures'] });

  add('hob-gaming', ['gaming', 'games', 'game', 'gamer', 'dota', 'nba 2k', 'counter-strike', 'cs', 'pubg', 'call of duty', 'left 4 dead', 'need for speed', 'red alert', 'battle realms', 'mat online'],
    [
      `My gaming shelf mixes nostalgic classics, competitive shooters, strategy, sports and racing.`,
      ``,
      `• **In the rotation:** Dota 1, NBA 2K, MAT Online, Counter-Strike, Red Alert, Battle Realms, Call of Duty, PUBG, Left 4 Dead and Need for Speed`
    ],
    { w: 2, cmd: ['gaming', 'games'] });

  add('hob-music', ['music', 'listen', 'listening', 'songs', 'song', 'bands', 'band', 'artists', 'artist', 'playlist', 'favorite band', 'favourite band', 'linkin park', 'metallica', 'blink-182', 'blink', 'green day', 'my chemical romance', 'emo', 'punk', 'metal', 'nu metal', 'rock', 'genres', 'genre'],
    [
      `My playlist leans alternative, nu metal, emo, punk and metal.`,
      ``,
      `• **Often on repeat:** Linkin Park, Metallica, Saosin, blink-182, My Chemical Romance, Silverstein, Yellowcard, Guns N' Roses, The Used and Green Day`
    ],
    { w: 2, cmd: ['music'] });

  add('hob-dogs', ['dogs', 'dog', 'pets', 'pet', 'puppy', 'bucky', 'loki'],
    `Life is simply better with dogs around, and for me that means Bucky and Loki, who bring the chaos, the cuddles and the company. 🐕`,
    { w: 2, cmd: ['dogs', 'dog'] });

  add('hob-watch', ['watchlist', 'watch', 'movies', 'movie', 'shows', 'tv', 'series', 'film', 'films', 'favorite movie', 'favourite movie', 'life of pi', 'ghibli', 'marvel', 'sitcom', 'sitcoms', 'the office', 'netflix'],
    [
      `My watchlist is rewatch-heavy.`,
      ``,
      `• **Sitcoms:** The Office, The Big Bang Theory, How I Met Your Mother, Brooklyn Nine-Nine, Friends, Modern Family and Young Sheldon`,
      `• **Also:** Marvel movies and series, and Studio Ghibli films`,
      `• **All-time favorite movie:** **Life of Pi**`
    ],
    { w: 2, cmd: ['watchlist', 'movies'] });

  add('hob-bucket', ['bucket list', 'bucketlist', 'bucket', 'skydiving', 'bikepacking', 'wingsuit', 'paragliding', 'hang gliding', 'snowboarding', 'skiing', 'surfing', 'longboarding', 'camping', 'solo camping', 'before you die'],
    [
      `My bucket list is full of adventure and open air.`,
      ``,
      `• **Up in the air:** skydiving, wingsuit flying, hang gliding, paragliding`,
      `• **Snow and water:** skiing, snowboarding, surfing`,
      `• **On the ground:** solo camping, bikepacking, downhill longboarding`
    ],
    { w: 2.5, cmd: ['bucket list', 'bucketlist'] });

  add('hob-career', ['dream job', 'dream jobs', 'dream career', 'dream careers', 'aspire', 'aspiring', 'data scientist', 'ai engineer', 'software developer', 'web developer', 'career path', 'where are you headed'],
    [
      `My dream careers all point toward search, development, data and AI.`,
      ``,
      `• SEO Specialist and Web Developer`,
      `• Software Developer, Data Scientist and AI Engineer`,
      ``,
      `Where I'm headed: {{future goals}}. What I've built so far: {{projects}}.`
    ],
    { w: 2.5, cmd: ['dream careers', 'dream job'] });

  add('hob-life', ['life goals', 'personal goals', 'dream home', 'dream house', 'dream life', 'off-grid', 'off grid', 'dream car', 'dream cars', 'dream motorcycle', 'dream motorcycles', 'home by the sea', 'lifestyle'],
    [
      `My big-picture life goals are about freedom and nature.`,
      ``,
      `• A home by the sea, a lake or a river (or deep in nature)`,
      `• Off-grid living`,
      `• A few dream cars and dream motorcycles in the garage`
    ],
    { w: 2.5, cmd: ['life goals', 'personal goals'] });

  /* ---- interests: deep dives (each links back to the hobbies hub) ---- */
  add('int-linux', ['linux mint', 'mint', 'cinnamon', 'cinnamon desktop', 'desktop themes', 'icon packs', 'icon themes', 'desktop layout', 'terminal commands', 'linux customization', 'customize linux', 'linux themes', 'which distro', 'what linux do you use', 'which linux distro', 'favorite linux distro', 'favourite linux distro', 'linux mint cinnamon', 'customize cinnamon', 'customizing linux', 'linux ricing', 'linux themes and icons', 'do you use linux', 'linux terminal', 'terminal tricks'],
    [
      `Linux Mint with the Cinnamon desktop is where I enjoy customizing the most. It feels familiar out of the box, so I can spend my time on the fun part: desktop themes, icon packs, panel layouts and little terminal commands that make things work my way.`,
      ``,
      `I like trying different distributions to see how each one feels, but I'm a hobbyist, not a sysadmin. This site's desktop look came from the same itch ({{linux inspiration}}). More tinkering in {{tech hobbies}}.`
    ],
    { w: 3, cmd: ['linux mint', 'cinnamon', 'linux customization'] });

  add('int-android', ['android rooting', 'rooting', 'root android', 'magisk', 'bootloader', 'unlock bootloader', 'debloat', 'debloating', 'bloatware', 'lineageos', 'lineage', 'evolution x', 'crdroid', 'derpfest', 'launcher', 'launchers', 'niagara', 'nova launcher', 'lawnchair', 'custom rom', 'custom roms', 'android customization', 'android', 'flash rom', 'optimization', 'do you root', 'do you root your phone', 'custom rom android', 'custom android rom', 'which custom rom', 'favorite custom rom', 'best custom rom', 'android roms', 'android tinkering', 'debloat android', 'android debloating', 'stock android', 'vanilla android', 'pure android', 'near stock android', 'favorite launcher', 'favourite launcher', 'which launcher', 'what launcher', 'niagara launcher', 'evolution-x', 'crdroid rom', 'derpfest rom', 'lineage os', 'android modding', 'android mods', 'flashing roms'],
    [
      `Android is my favorite playground. I like rooting, debloating, optimizing and customizing a phone until it feels like mine.`,
      ``,
      `• **ROMs I like:** LineageOS, Evolution X, crDroid and Derpfest`,
      `• **Launchers:** Niagara Launcher and Lawnchair are my kind of clean. Nova Launcher is a classic, though I'm not using it right now`,
      `• **What I look for:** an easy bootloader unlock and a vanilla, close-to-stock experience`,
      ``,
      `It all ties back to free and open-source software ({{open source}}). Which phones catch my eye? See {{phones}}.`
    ],
    { w: 3, cmd: ['android', 'custom roms', 'rooting', 'launchers'] });

  add('int-phones', ['phones', 'smartphone', 'smartphones', 'phone brands', 'favorite phone', 'favourite phone', 'favorite phones', 'phone brand', 'phone recommendation', 'nothing phone', 'cmf', 'cmf phone', 'sony', 'sony xperia', 'xperia', 'motorola', 'moto g', 'oneplus', 'google pixel', 'pixel phone', 'pixel phones', 'tech brands', 'favorite brands', 'favorite tech brand', 'which phone', 'favorite phone brand', 'favourite phone brand', 'what phone do you like', 'what phones do you like', 'what phone brands', 'which phone brand', 'phone preferences', 'phone you like', 'nothing phone 2', 'nothing phone 3', 'nothing brand', 'nothing cmf', 'google pixel phone', 'sony phones', 'motorola phones', 'oneplus phones', 'unlockable bootloader', 'easy bootloader unlock', 'what to look for in a phone'],
    [
      `My phone radar is tuned to a handful of brands: **Nothing, CMF, Sony, Motorola, OnePlus and Google Pixel**.`,
      ``,
      `What they share is what I care about: a clean, near-stock Android feel and, ideally, an easy bootloader unlock so I can tinker later. I'm also budget-conscious, so CMF and Motorola appeal to me for value. Nothing even inspired one of my projects ({{nothingtechblob}}).`,
      ``,
      `The software side lives in {{android}}.`
    ],
    { w: 3, cmd: ['phones', 'smartphones', 'phone brands'] });

  add('int-foss', ['foss', 'open source', 'open-source', 'free software', 'free and open source', 'open source software', 'open source projects', 'libreoffice', 'firefox', 'brave', 'brave browser', 'vs code', 'vscode', 'visual studio code', 'browser', 'browsers', 'favorite software', 'favorite apps', 'favorite tools', 'software i use', 'do you like open source', 'why open source', 'why foss', 'open source fan', 'open source apps', 'open source tools', 'free and open-source software', 'free open source', 'favorite browser', 'favourite browser', 'which browser', 'what browser do you use', 'office suite', 'libre office', 'what editor do you use', 'code editor', 'favorite code editor', 'what software do you use', 'apps you use'],
    [
      `I'm a big fan of free and open-source software. I like being able to see how things work, tweak them and not pay for everything.`,
      ``,
      `• **Daily drivers I like:** Firefox, Brave, VS Code, LibreOffice and Linux Mint`,
      `• **Beyond that:** I enjoy discovering other open-source projects and trying them out`,
      ``,
      `The privacy-friendly, budget-friendly angle is a big part of the appeal. See also {{linux mint}} and {{android}}.`
    ],
    { w: 3, cmd: ['open source', 'foss', 'firefox'] });

  add('int-localai', ['local ai', 'local llm', 'local llms', 'local models', 'self hosting', 'self-hosting', 'self hosted', 'self-hosted', 'selfhost', 'claude', 'gemini', 'favorite ai', 'favourite ai', 'which ai', 'which ai do you use', 'ai assistants', 'ai chatbots', 'chatgpt claude gemini', 'chatgpt vs claude', 'claude vs chatgpt', 'automation tools', 'which ai tools do you use', 'what ai tools do you use', 'what ai do you use', 'do you use chatgpt claude or gemini', 'claude or chatgpt', 'chatgpt or gemini', 'gemini or claude', 'run ai locally', 'run llms locally', 'local ai models', 'ai at home', 'privacy ai', 'ai privacy', 'self host', 'self-host', 'ai agents', 'automate tasks', 'what do you automate', 'interested in automation'],
    [
      `On the AI side I use **ChatGPT, Claude and Gemini** as everyday helpers for research, brainstorming and coding.`,
      ``,
      `What really interests me is local AI, self-hosting and automation: running models on my own machine, keeping control of my data and letting software handle the repetitive bits. I'm still learning, so treat me as an enthusiast, not an expert.`,
      ``,
      `For my honest skill level see {{ai}}, and for how I code with it see {{ai coding}}.`
    ],
    { w: 3, cmd: ['local ai', 'self-hosting'] });

  add('int-seotools', ['seo tools', 'keyword research', 'keywords', 'ga4', 'google analytics', 'analytics', 'website tracking', 'tracking', 'tag manager', 'semrush', 'ahrefs', 'link building tools', 'outreach', 'seo software', 'favorite seo tools', 'seo workflow', 'what seo tools do you use', 'favorite seo tool', 'favourite seo tool', 'seo tool', 'seo tools you use', 'how do you research keywords', 'keyword tools', 'keyword research tools', 'google analytics 4', 'ga 4', 'track website', 'tracking setup', 'website analytics', 'analytics setup', 'how do you track', 'link prospecting tools', 'outreach tools', 'outreach tool', 'email outreach', 'link outreach'],
    [
      `I like the research side of SEO: keyword research, link building and outreach, plus the tooling around them.`,
      ``,
      `• **Tools:** Screaming Frog, SEMrush, Ahrefs, Search Console and Looker Studio`,
      `• **Measurement:** GA4 and website tracking, because I like knowing what's actually working`,
      ``,
      `My 5+ years of link prospecting and outreach are in {{seo}}, and my audit-minded side is in {{technical audit}}.`
    ],
    { w: 2.5, cmd: ['seo tools', 'ga4', 'keyword research'] });

  add('int-aeo', ['aeo', 'geo', 'answer engine optimization', 'answer engine', 'generative engine optimization', 'generative engine', 'ai search', 'ai overviews', 'ai visibility', 'llm seo', 'seo for ai', 'search with ai', 'answer engine optimisation', 'answer engine optimization aeo', 'generative engine optimisation', 'generative engine optimization geo', 'what is geo', 'what is aeo', 'aeo and geo', 'geo and aeo', 'seo in the age of ai', 'future of seo', 'ai search optimization', 'ai search optimisation', 'chatgpt search', 'optimize for ai', 'optimise for ai', 'optimize for chatgpt', 'get cited by ai', 'ai citations', 'zero click', 'ai answers', 'search generative experience', 'sge'],
    [
      `AEO (answer engine optimization) and GEO (generative engine optimization) are the topics I'm most curious about right now. Search is shifting toward AI-written answers, and I want to understand how content gets cited in them.`,
      ``,
      `I'm exploring it as a learner, with a technical SEO foundation to build on ({{seo}}). It also connects my two interests: {{ai}} and search.`
    ],
    { w: 4, cmd: ['aeo', 'geo'] });

  add('int-webdev', ['web development', 'web developer', 'web apps', 'web app', 'web application', 'web applications', 'personal tools', 'build tools', 'html', 'css', 'javascript', 'front end', 'frontend', 'woocommerce hobby', 'building websites', 'build websites', 'do you code', 'do you build websites', 'do you build web apps', 'what do you build', 'what do you like to build', 'build a web app', 'tools you build', 'tools you have built', 'personal web tools', 'small tools', 'web projects', 'web dev', 'webdev', 'frontend development', 'front-end', 'html css js', 'html and css', 'learn web development', 'coding projects', 'coding hobby'],
    [
      `I like building small, useful things for the web with HTML, CSS and JavaScript, plus WordPress and WooCommerce when a project calls for them.`,
      ``,
      `Mostly it's personal tools and web apps that solve a problem I actually have. I prefer simple, practical builds over anything fancy. See {{projects}} for what I've made and {{wordpress}} for the CMS side.`
    ],
    { w: 2.5, cmd: ['web development', 'web apps'] });

  add('int-video', ['video editing', 'video editor', 'video', 'videos', 'davinci resolve', 'davinci', 'resolve', 'wedding video', 'wedding videos', 'wedding', 'personal videos', 'cinematic', 'cinematic edit', 'cinematic edits', 'color grading', 'colour grading', 'music sync', 'music synchronization', 'videography', 'editing videos', 'do you edit videos', 'do you edit video', 'video editing software', 'which video editor', 'what video editor', 'what editor for video', 'editing software', 'da vinci resolve', 'davinci resolve free', 'video projects', 'video editing projects', 'wedding video editing', 'wedding videographer', 'wedding edits', 'color grade', 'colour grade', 'color correction', 'music video', 'music videos', 'beat sync', 'sync music', 'cinematic videos', 'cinematic video', 'video storytelling', 'film editing', 'film editor'],
    [
      `Video editing is where my creative side gets to play, and **DaVinci Resolve** is my editor of choice.`,
      ``,
      `• **What I make:** wedding videos and personal videos`,
      `• **What I enjoy most:** cinematic edits, syncing cuts to music and color grading`,
      `• **Why:** I love telling a story visually, and the beat of a song can turn simple clips into something that feels like a memory`,
      ``,
      `Still photos live in {{photography}}.`
    ],
    { w: 3, cmd: ['video editing', 'davinci resolve', 'davinci'] });

  add('int-photo', ['photography', 'photographer', 'photo', 'photos', 'photoshop', 'photo editing', 'editing photos', 'travel photography', 'visual storytelling', 'camera', 'lightroom', 'graphic design', 'do you take photos', 'do you take pictures', 'do you do photography', 'photo editing software', 'which photo editor', 'photo editor', 'photography hobby', 'photography gear', 'travel photos', 'travel pictures', 'landscape photography', 'photo storytelling', 'photo editing apps', 'edit photos', 'photoshop skills', 'do you use photoshop', 'adobe photoshop', 'adobe lightroom', 'pictures', 'visual stories'],
    [
      `Photography is how I hold on to moments, and I enjoy it most on trips, so travel photography is my favorite flavor.`,
      ``,
      `• **Editing:** Lightroom and Photoshop`,
      `• **What I care about:** visual storytelling, where a single frame says what a paragraph can't`,
      ``,
      `Moving pictures are in {{video editing}}, and the trips themselves are in {{travel}}.`
    ],
    { w: 3, cmd: ['photography', 'photoshop', 'travel photography'] });

  add('int-moto', ['motorcycle', 'motorcycles', 'motorbike', 'motorbikes', 'motorcycle maintenance', 'motorcycle customization', 'motorcycle mods', 'bike maintenance', 'motorcycle touring', 'motorcycle trip', 'motorcycle trips', 'riding', 'rider', 'ride', 'moto', 'motorcycle road trip', 'do you ride', 'do you ride a motorcycle', 'do you have a motorcycle', 'motorcycle hobby', 'motorcycle rides', 'motorcycle riding', 'motorcycle road trips', 'motorcycle diy', 'diy motorcycle', 'motorcycle repair', 'motorcycle repairs', 'motorcycle modifications', 'modify motorcycle', 'customize motorcycle', 'custom motorcycle', 'touring motorcycle', 'long rides', 'long ride', 'riding trips', 'bikers', 'biker', 'motorcyclist'],
    [
      `Motorcycles are my favorite way to travel: road trips, touring and the freedom of the open road.`,
      ``,
      `I enjoy the hands-on side too, learning about motorcycle maintenance and customization, since knowing your bike makes every ride more relaxed. I'm a passionate rider and tinkerer, not a professional mechanic.`,
      ``,
      `Dream bikes are in {{life goals}}, and four-wheeled interests are in {{cars}}.`
    ],
    { w: 3, cmd: ['motorcycles', 'motorcycle'] });

  add('int-cars', ['cars', 'car', 'automotive', 'automotive technology', 'car tech', 'car maintenance', 'car repair', 'diy repair', 'diy repairs', 'diy car repair', 'vehicle', 'vehicles', 'car reliability', 'vehicle reliability', 'car comparison', 'car comparisons', 'vehicle comparison', 'vehicle comparisons', 'which car', 'car buying', 'do you like cars', 'car hobby', 'car enthusiast', 'cars you like', 'favorite car', 'favourite car', 'favorite cars', 'favourite cars', 'car brands', 'car brand', 'car technology', 'automotive tech', 'car comparison reviews', 'car research', 'how do cars work', 'diy car repairs', 'car diy', 'fix cars', 'work on cars', 'car mechanic', 'reliable cars', 'reliable car', 'most reliable car', 'best car for the money', 'car recommendations', 'ev', 'evs', 'electric cars', 'electric vehicles'],
    [
      `I like cars from the practical side: how the technology works, what's reliable and which vehicle makes the most sense for the money.`,
      ``,
      `• **Research:** comparing vehicles and checking reliability before forming an opinion`,
      `• **Hands-on:** DIY repairs when they're within my reach`,
      ``,
      `It's the same research-first habit as in {{decisions}}. Two-wheeled fun is in {{motorcycles}}.`
    ],
    { w: 3, cmd: ['cars', 'automotive'] });

  add('int-travel', ['travel', 'traveling', 'travelling', 'trip', 'trips', 'road trip', 'road trips', 'beach', 'beaches', 'island hopping', 'islands', 'island', 'hiking', 'hike', 'mountain', 'mountains', 'budget travel', 'budget trip', 'budget trips', 'camping trip', 'camping trips', 'go camping', 'food trip', 'food trips', 'vacation', 'where have you traveled', 'favorite destination', 'do you like to travel', 'do you like traveling', 'do you like travelling', 'travel hobby', 'travel style', 'travel plans', 'travel bucket list', 'places you have been', 'places you visited', 'places visited', 'favorite place', 'favourite place', 'favorite places', 'best trip', 'best trips', 'best trip ever', 'beach trip', 'beach trips', 'beach hopping', 'island trip', 'island trips', 'island hop', 'hiking trails', 'hiking trip', 'mountain hike', 'mountain hikes', 'mountain climbing', 'climbing', 'trekking', 'trek', 'budget friendly travel', 'cheap travel', 'travel on a budget', 'how do you travel', 'food travel', 'food tripping', 'foodie', 'eating out', 'weekend trip', 'weekend trips', 'getaway', 'getaways', 'staycation', 'adventure travel'],
    [
      `Travel for me is beaches, island hopping, mountain hikes, camping and food trips, ideally done on a budget and on my own schedule.`,
      ``,
      `• **How:** road trips, and motorcycle touring when I can ({{motorcycles}})`,
      `• **Why:** I love scenery, local food and the small unplanned moments, which I try to capture ({{photography}})`,
      ``,
      `The bigger dreams are on my {{bucket list}}.`
    ],
    { w: 3, cmd: ['travel', 'road trips', 'beaches'] });

  add('int-poppunk', ['pop punk', 'pop-punk', 'poppunk', 'emo', 'emo bands', 'emo music', 'post-hardcore', 'post hardcore', 'sum 41', 'simple plan', 'good charlotte', 'new found glory', 'the offspring', 'offspring', 'fall out boy', 'paramore', 'all-american rejects', 'all american rejects', 'red jumpsuit apparatus', 'boys like girls', 'taking back sunday', 'story of the year', 'dashboard confessional', 'favorite pop punk bands', 'favourite pop punk bands', 'pop punk bands', 'pop punk music', 'emo band', 'emo songs', 'post hardcore bands', 'post-hardcore bands', 'emo phase', 'my chemical romance', 'mcr', 'fob', 'green day or blink', 'blink 182', 'sum41', 'dashboard', 'the used', 'saosin', 'silverstein', 'yellowcard', 'paramore band', 'aar', 'simple plan band', 'pop-punk bands', '2000s music', '2000s bands', '2000s emo', '00s music', 'early 2000s', 'teenage music'],
    [
      `Pop punk, emo and post-hardcore are the soundtrack of my comfort zone.`,
      ``,
      `• **Pop punk:** Sum 41, Green Day, blink-182, The Offspring, Simple Plan, Good Charlotte, New Found Glory and The All-American Rejects`,
      `• **Emo and post-hardcore:** My Chemical Romance, Fall Out Boy, Paramore, Taking Back Sunday, The Used, Story of the Year, Saosin, Silverstein and Dashboard Confessional`,
      `• **Also:** Yellowcard, Boys Like Girls and The Red Jumpsuit Apparatus`,
      ``,
      `Big choruses, honest lyrics and a lot of energy. The wider mix is in {{music}}.`
    ],
    { w: 3, cmd: ['pop punk', 'emo', 'post-hardcore'] });

  add('int-metal', ['nu metal', 'nu-metal', 'numetal', 'metal bands', 'heavy metal', 'metal music', 'heavier music', 'limp bizkit', 'korn', 'slipknot', 'metallica', 'linkin park hybrid theory', 'do you like metal', 'metal music taste', 'heavy music', 'heavy bands', 'nu metal bands', 'nu metal music', 'nu-metal bands', 'favorite metal band', 'favourite metal band', 'favorite metal bands', 'favourite metal bands', 'metal band', 'metalhead', 'metal head', 'slipknot band', 'korn band', 'limp bizkit band', 'linkin park nu metal', 'hybrid theory', 'rap metal', 'rap rock', 'metal bands you like', 'heavy metal bands'],
    [
      `When I want something heavier, I go to nu metal and metal.`,
      ``,
      `• **Nu metal:** Linkin Park, Limp Bizkit, Korn and Slipknot`,
      `• **Metal:** Metallica`,
      ``,
      `Linkin Park is the bridge between those and my lighter picks in {{pop punk}}. The full picture is in {{music}}.`
    ],
    { w: 3, cmd: ['nu metal', 'metal'] });

  add('int-altrock', ['alternative rock', 'alt rock', 'alt-rock', 'grunge', 'punk rock', 'nirvana', 'red hot chili peppers', 'rhcp', 'chili peppers', 'gorillaz', 'wheatus', 'teenage dirtbag', 'alternative bands', 'alternative music', 'alt bands', 'alt music', 'alternative rock bands', 'alt rock bands', 'punk rock bands', 'punk bands', 'punk music', 'rock bands', 'rock music', 'grunge bands', 'grunge music', '90s rock', '90s alternative', 'red hot chili peppers band', 'chili peppers songs', 'rhcp songs', 'nirvana songs', 'nirvana band', 'gorillaz band', 'wheatus band', 'other favorite bands', 'other favourite bands', 'other favorites', 'more bands'],
    [
      `On the alternative and punk rock side, I enjoy Nirvana, Red Hot Chili Peppers, Gorillaz and Wheatus, along with the punk-leaning bands from {{pop punk}}.`,
      ``,
      `I like how this style can be raw, catchy or quirky depending on the band. For the full playlist see {{music}}.`
    ],
    { w: 3, cmd: ['alternative rock', 'alt rock'] });

  add('int-opm', ['opm', 'filipino bands', 'filipino band', 'filipino music', 'pinoy rock', 'pinoy bands', 'pinoy band', 'pinoy music', 'local bands', 'philippine bands', 'original pilipino music', 'slapshock', 'greyhoundz', 'wolfgang', 'parokya ni edgar', 'parokya', 'kamikazee', 'eraserheads', 'urbandub', 'franco', 'filipino rock', 'filipino rock bands', 'filipino music taste', 'philippine rock', 'philippine music', 'pinoy rock bands', 'pinoy band music', 'opm bands', 'opm rock', 'opm music', 'opm songs', 'pinoy opm', 'local rock', 'local rock bands', 'filipino punk', 'filipino metal', 'pinoy punk', 'pinoy metal', 'pinoy alternative', 'pinoy alt rock', 'parokya ni edgar band', 'kamikazee band', 'eraserheads band', 'urbandub band', 'slapshock band', 'greyhoundz band', 'wolfgang band', 'franco band', 'philippine bands you like', 'bands from the philippines', 'pilipino bands'],
    [
      `I'm proudly a fan of Filipino rock, and these bands are staples for me:`,
      ``,
      `• **Slapshock, Greyhoundz and Wolfgang** for the heavier, louder side`,
      `• **Kamikazee, Urbandub and Franco** for the alternative punch`,
      `• **Parokya ni Edgar and Eraserheads** for the classics and the sing-along energy`,
      ``,
      `It's great seeing local bands hold their own next to the international ones in {{music}}.`
    ],
    { w: 3, cmd: ['opm', 'filipino bands'] });

  add('int-marvel', ['marvel', 'marvel movies', 'marvel series', 'mcu', 'avengers', 'superhero', 'superheroes', 'superhero movies', 'marvel fan', 'do you like marvel', 'favorite marvel', 'favourite marvel', 'marvel films', 'marvel shows', 'marvel tv', 'marvel cinematic universe', 'mcu movies', 'mcu series', 'mcu fan', 'avengers movies', 'superhero films', 'superhero shows', 'superhero series', 'comic book movies', 'comic movies', 'disney plus marvel'],
    [
      `I'm a Marvel fan, both the movies and the series. The shared universe makes everything feel connected, and a good superhero film is easy to rewatch.`,
      ``,
      `More of what I watch is in {{watchlist}}.`
    ],
    { w: 3, cmd: ['marvel', 'mcu'] });

  add('int-johnwick', ['john wick', 'johnwick', 'keanu', 'keanu reeves', 'action movies', 'action movie', 'action films', 'action film', 'do you like john wick', 'john wick movies', 'john wick films', 'john wick fan', 'john wick series', 'favorite action movie', 'favourite action movie', 'favorite action movies', 'favourite action movies', 'action movie fan', 'action flicks', 'action flick', 'keanu reeves movies', 'continental', 'baba yaga', 'gun fu', 'gun-fu', 'fight choreography'],
    [
      `John Wick is my go-to for action. I like the stylish fight choreography and the way the movies build their own underworld with its own rules.`,
      ``,
      `For my other picks, see {{watchlist}}.`
    ],
    { w: 3, cmd: ['john wick'] });

  add('int-ghibli', ['studio ghibli', 'ghibli', 'miyazaki', 'anime', 'animation', 'animated movies', 'animated films', 'anime movies', 'cartoons', 'do you like ghibli', 'ghibli movies', 'ghibli films', 'ghibli fan', 'studio ghibli movies', 'studio ghibli films', 'favorite ghibli', 'favourite ghibli', 'miyazaki films', 'miyazaki movies', 'hayao miyazaki', 'spirited away', 'totoro', 'my neighbor totoro', 'princess mononoke', 'japanese animation', 'japanese anime', 'do you watch anime', 'anime fan', 'anime shows', 'anime series', 'favorite anime', 'favourite anime', 'animated movie', 'cartoon movies', 'comfort movie', 'comfort movies', 'cozy movies'],
    [
      `Studio Ghibli films are my comfort watch. They're calm and beautifully drawn, and they leave room for wonder, which makes a nice change after a day of spreadsheets and audits.`,
      ``,
      `More of what I watch is in {{watchlist}}.`
    ],
    { w: 3, cmd: ['ghibli', 'anime'] });

  add('int-nba', ['nba', 'basketball', 'michael jordan', 'jordan', 'mj', 'kobe', 'kobe bryant', 'derrick rose', 'rose', 'anthony edwards', 'ant edwards', 'ja morant', 'morant', 'favorite player', 'favourite player', 'favorite nba player', 'favorite basketball player', 'favorite team', 'favourite team', 'nba team', 'nba players', 'do you watch nba', 'nba fan', 'nba player', 'nba stars', 'nba legends', 'favorite nba players', 'favourite nba players', 'favorite nba team', 'favourite nba team', 'who is your favorite nba player', 'who is your favourite nba player', 'who is your favorite player', 'who do you root for', 'who do you support', 'basketball fan', 'do you like basketball', 'do you play basketball', 'basketball player', 'basketball players', 'basketball stars', 'best basketball player', 'goat', 'the goat', 'mj or kobe', 'jordan or kobe', 'kobe or jordan', 'black mamba', 'mamba mentality', 'anthony edwards ant', 'd rose', 'derrick rose mvp', 'ja morant memphis', 'morant grizzlies', 'edwards timberwolves'],
    [
      `I follow the NBA mostly through the players. My favorites are **Michael Jordan, Kobe Bryant, Derrick Rose, Anthony Edwards and Ja Morant**.`,
      ``,
      `I enjoy the mix of legends and fearless, explosive guards. I haven't named a favorite team, so I'll stick to the players I like watching.`,
      ``,
      `Hoops on the console is in {{gaming}}.`
    ],
    { w: 3, cmd: ['nba', 'basketball'] });

  add('int-personality', ['personality', 'personality traits', 'traits', 'character traits', 'introvert', 'introverted', 'introvert or extrovert', 'extrovert', 'laid-back', 'laid back', 'sense of humor', 'humor', 'funny', 'what are you like', 'what kind of person', 'what is he like', 'describe your personality', 'type of person', 'what are you like as a person', 'what kind of person are you', 'what type of person are you', 'what is your personality', 'what personality do you have', 'your personality', 'his personality', 'personality type', 'mbti', 'introvert extrovert', 'are you introverted', 'are you an extrovert', 'are you shy', 'are you quiet', 'are you funny', 'do you have a sense of humor', 'sense of humour', 'humour', 'are you laid back', 'are you easygoing', 'easygoing', 'easy going', 'describe yourself in words', 'describe yourself in three words', 'three words', 'how would friends describe you', 'how would your friends describe you', 'how do friends describe you', 'how would coworkers describe you', 'how would colleagues describe you', 'character', 'characteristics', 'personal traits', 'strongest traits', 'best traits'],
    [
      `In a nutshell: curious, independent and practical, with a laid-back, introverted streak and a sense of humor that sneaks in when people least expect it.`,
      ``,
      `• **How I think:** analytical, detail-oriented and a bit skeptical`,
      `• **How I work:** resourceful, adaptable and creative`,
      `• **How I live:** budget-conscious and adventurous, usually on a bike or a trail`,
      ``,
      `The professional version is in {{strengths}} and {{work style}}.`
    ],
    { w: 3, cmd: ['personality', 'personality traits'] });

  add('int-decisions', ['decisions', 'decision making', 'make decisions', 'making decisions', 'decision-making', 'research before buying', 'before buying', 'how do you shop', 'shopping', 'simplicity', 'keep it simple', 'practical solutions', 'budget conscious', 'budget-conscious', 'frugal', 'skeptical', 'skeptic', 'overcomplicate', 'overcomplicated', 'how do you decide', 'how do you make decisions', 'how do you make a decision', 'how do you choose', 'how do you choose what to buy', 'how do you buy things', 'how do you research', 'research before decisions', 'research first', 'do your research', 'do you research before buying', 'do you compare options', 'compare options', 'weigh options', 'weighing options', 'pros and cons', 'are you frugal', 'are you cheap', 'are you budget conscious', 'do you like saving money', 'save money', 'saving money', 'value for money', 'good value', 'practical approach', 'practical mindset', 'practical person', 'simple solutions', 'simple solution', 'keep things simple', 'avoid complicated', 'avoid complications', 'unnecessary complications', 'overthinking', 'skeptical about', 'are you skeptical', 'are you a skeptic', 'healthy skepticism', 'trust but verify', 'read reviews', 'reading reviews'],
    [
      `I research before I commit, whether it's a phone, a vehicle or a tool. I compare options, read reviews with a healthy dose of skepticism and look for the practical choice, not the flashy one.`,
      ``,
      `I'm budget-conscious and I prefer simple solutions to complicated ones. If something works and doesn't need extra steps, that wins.`,
      ``,
      `That mindset shows up in {{phones}}, {{cars}} and my {{problem solving}}.`
    ],
    { w: 3, cmd: ['decisions', 'decision making'] });

  /* ---- projects & design story (from the JuPiter knowledge base) ---- */
  add('q-personal-projects', ['personal projects', 'side projects', 'side project', 'custom roms', 'what projects', 'hobby projects', 'things he built', 'what has he built', 'what did you build', 'android roms', 'linux distros', 'distros', 'distro'],
    [
      `Outside of work, I tinker and build.`,
      ``,
      `• **Tinkering:** custom Android ROMs and Linux distributions`,
      `• **Builds:** SEO, web development and WordPress projects, all 7 in {{projects}}`,
      `• **Resume website:** this desktop, my proudest build ({{proudest project}})`
    ],
    { w: 2.5 });

  add('q-proudest', ['proudest project', 'resume website', 'this website', 'this site', 'this desktop', 'desktop environment', 'portfolio website', 'website', 'design', 'proudest work', 'favorite project', 'favourite project', 'best project', 'best work', 'showcase', 'chatbot', 'how was this site built', 'how was this built', 'how did you build this', 'who built this', 'built this site', 'this portfolio'],
    [
      `I'm especially proud of this resume website. It began as a Bootstrap theme and grew into a personalized Linux-inspired desktop with:`,
      ``,
      `• A dock and a top panel`,
      `• Widgets and applets`,
      `• Application windows and terminal-style interfaces`,
      `• A chatbot, which is what you're talking to right now 🙂`,
      ``,
      `{{linux inspiration}} tells how it started.`
    ],
    { w: 3 });

  add('q-linux', ['linux inspiration', 'why linux', 'inspired by linux', 'linux design', 'desktop interface', 'windows 11', 'design inspiration', 'website design', 'desktop design', 'why this design', 'design choice', 'inspiration for the website', 'resource efficiency', 'lightweight', 'linux desktop', 'why a desktop', 'linux for the design', 'pick linux', 'picked linux', 'choose linux', 'chose linux', 'why did he pick linux', 'linux theme'],
    [
      `How the Linux-inspired design came about:`,
      ``,
      `• I got interested in Linux after seeing how resource-efficient it is compared with Windows 11`,
      `• I wanted my portfolio to stand out`,
      `• So I challenged myself to build a desktop-like web experience through experimentation and AI-assisted coding ({{ai coding}})`
    ],
    { w: 3.5, cmd: ['linux inspiration'] });

  /* ---- education / certs ---- */
  add('education', ['education', 'school', 'degree', 'college', 'university', 'studied', 'study', 'graduate', 'ieti', 'diploma', 'schooling', 'alma mater', 'where did he study'],
    [
      `I have two degrees:`,
      ``,
      `• **B.S. in Marine Engineering,** Philippine Merchant Marine School (2009 to 2013)`,
      `• **A.S. in Information & Communication Technology,** IETI (2006 to 2008)`,
      ``,
      `My web and SEO training is in {{certs}}.`
    ],
    { cmd: ['education', 'school'] });

  add('certs', ['certifications', 'certification', 'certificate', 'certs', 'bootcamp', 'udemy', 'sprint', 'courses', 'training', 'seo workout', 'gab valimento', 'credentials', 'certified', 'full-stack bootcamp', 'fullstack'],
    [
      `I have two certifications to show:`,
      ``,
      `• **The Complete Full-Stack Web Development Bootcamp,** Udemy (2026), [view it](${SITE}/assets/img/certifications/cert-fullstack-bootcamp_F.webp)`,
      `• **Technical SEO and SEO Sprint,** SEO Workout by Gab Valimento (2025), [view it](${SITE}/assets/img/certifications/cert_techseosprint_F.webp)`
    ],
    { cmd: ['certs', 'certifications', 'certificates'] });

  /* ---- projects ---- */
  add('projects', ['projects', 'portfolio', 'built', 'build', 'apps', 'demos', 'samples', 'capstone'],
    [
      `I've shipped **7 projects**:`,
      ``,
      `• **SEO + WordPress:** [Badlands Ink](${SITE}/badlands-ink/) ({{badlands ink}}) and [NothingTechBlob](${SITE}/nothingtechblob/) ({{nothingtechblob}})`,
      `• **API:** [AuditKit](${SITE}/auditkit/), my capstone ({{auditkit}})`,
      `• **Node.js, Express & EJS:** [PixelLog](${SITE}/pixellog/) ({{pixellog}}), [JamporuDEX](${SITE}/jamporudex/) with PostgreSQL ({{jamporudex}}) and [Route 196](${SITE}/route196/) ({{route196}})`,
      `• **HTML & CSS:** [John Off the Wall](${SITE}/johnoffthewall/), my capstone and personal site ({{johnoffthewall}})`
    ],
    { cmd: ['projects', 'portfolio', 'ls portfolio', 'ls ~/portfolio'] });

  add('auditkit', ['auditkit', 'audit kit'],
    `Wait for it: **AuditKit** is my API capstone project, and you can [take it for a spin here](${SITE}/auditkit/).`, { w: 3 });
  add('nothingtechblob', ['nothingtechblob', 'nothing tech blob', 'blob'],
    `**NothingTechBlob** is where I pair technical and on-page SEO with WordPress development, and you can [see it live here](${SITE}/nothingtechblob/).`, { w: 3 });
  add('badlands', ['badlands', 'badlands ink', 'ink', 'tattoo'],
    `**Badlands Ink** is my playground for technical, local and e-commerce SEO with WordPress and WooCommerce, from the product catalog and payments to optimization, and you can [explore it here](${SITE}/badlands-ink/).`,
    { w: 3, cmd: ['badlands ink', 'badlands'] });
  add('pixellog', ['pixellog', 'pixel log'],
    `**PixelLog** is a Node.js, Express.js and EJS capstone of mine, and you can [check it out here](${SITE}/pixellog/).`, { w: 3 });
  add('jamporudex', ['jamporudex', 'jamporu', 'dex'],
    `**JamporuDEX** is my Node.js, Express, PostgreSQL and EJS capstone, and you can [check it out here](${SITE}/jamporudex/).`, { w: 3 });
  add('route196', ['route196', 'route 196', '196'],
    `**Route 196** is another Node.js, Express.js and EJS capstone of mine, and you can [check it out here](${SITE}/route196/).`, { w: 3 });

  add('johnoffthewall', ['johnoffthewall', 'john off the wall', 'off the wall', 'jotw', 'offthewall'],
    [
      `**John Off the Wall** ("Me, off the wall.") is my personal corner of the web and my HTML and CSS capstone, the best place to get to know me outside of work.`,
      ``,
      `• **Built with:** HTML5, CSS3, JavaScript, Bootstrap 5 and GLightbox`,
      `• **Look and feel:** dynamic light and dark mode, and a fully responsive layout (Bootstrap 5 grids plus custom media queries)`,
      `• **Interactions:** GLightbox pop-ups with touch gestures and custom button alignment scripting`,
      `• **Under the hood:** semantic HTML5, with DOM error handling that swaps in fallback SVG placeholders for missing images`,
      `• **Also:** a contact form and featured project showcases`,
      `• **Inside:** {{music}}, {{gaming}} and {{dogs}}, with {{hobbies}} as the quick tour`,
      ``,
      `Visit the [project page](${SITE}/johnoffthewall/), the [live site](https://johnoffthewall.github.io/) or the [GitHub repo](https://github.com/johnoffthewall/johnoffthewall.github.io).`
    ],
    { w: 3, cmd: ['johnoffthewall', 'john off the wall', 'jotw'] });

  /* ---- contact ---- */
  add('contact', ['contact', 'email', 'phone', 'reach', 'message', 'call', 'connect', 'socials', 'linkedin', 'github', 'location', 'based', 'live', 'located', 'get in touch', 'reach out', 'contact him', 'contact details', 'how can i contact', 'where can i find him', 'social media'],
    [
      `Want to chat? I'm based in Metro Manila, Philippines.`,
      ``,
      `• **Best way:** [LinkedIn](https://www.linkedin.com/in/jpldl/)`,
      `• **Work:** [GitHub](https://github.com/jpldeleon), [Upwork](https://www.upwork.com/freelancers/~01562764cad5d47331) and [GoLance](https://golance.com/freelancer/john.paul.leonard.de.leon)`,
      `• **Email and phone:** in the Resume section of the site, or on my {{resume}}`
    ],
    { cmd: ['contact', 'socials', 'email', 'linkedin', 'github'] });

  add('resume', ['resume', 'cv', 'download', 'pdf', 'curriculum vitae', 'download resume', 'resume pdf', 'cv pdf', 'get the resume', 'see resume', 'full resume'],
    `Here's my full CV, ready to grab: [johnpauldeleon_resume.pdf](${SITE}/assets/johnpauldeleon_resume.pdf).`,
    { cmd: ['resume', 'cv', 'cat resume', 'download cv'] });

  /* ---- interview questions ---- */
  add('interview', ['interview', 'questions', 'faq'],
    [
      `Put me in the hot seat with the classics:`,
      ``,
      `• **About me:** {{tell me about yourself}}, {{why seo?}}, {{what are your strengths?}}, {{what is your weakness?}}, {{why should we hire you?}}, {{biggest achievement?}}, {{what motivates you?}}`,
      `• **How I work:** {{how do you handle pressure?}}, {{how do you prioritize?}}, {{how do you work in a team?}}, {{do you prefer working independently?}}, {{how do you handle feedback?}}, {{how do you handle mistakes?}}, {{how do you solve problems?}}, {{how do you learn new things?}}`,
      `• **The practical stuff:** {{how is your english?}}, {{tell me about your career gap}}, {{why are you looking for a new role?}}, {{where do you see yourself in 5 years?}}, {{salary expectations?}}, {{remote or on-site?}}`
    ],
    { cmd: ['interview', 'faq', 'questions'] });

  add('q-self', ['tell me about yourself', 'walk me through your resume', 'introduce yourself', 'describe yourself', 'professional background', 'your background', 'his background', 'background', 'introduction', 'tell me about him', 'tell me about jampol', 'overview', 'bio', 'about him', 'elevator pitch'],
    [
      `In short, I'm a curious, adaptable professional who moved from research into technical SEO.`,
      ``,
      `• **Where I started:** research analysis, SEO link prospecting and outreach, with workflow improvement and project piloting along the way`,
      `• **What I added:** a full-stack bootcamp and a Technical SEO certification`,
      `• **What drives me:** solving problems, learning independently and improving processes`,
      ``,
      `Details: {{experience}} and {{projects}}.`
    ],
    { w: 2.5 });

  add('q-why-seo', ['why seo', 'why do you like seo', 'why this field', 'why this career', 'why do you do seo', 'why did you choose seo', 'what do you like about seo', 'why are you into seo', 'why work in seo', 'why seo specialist'],
    [
      `For me, SEO is where research, data and building things meet.`,
      ``,
      `• I started in link prospecting and got hooked on seeing which numbers actually move results`,
      `• That curiosity led me into technical SEO and web development`,
      ``,
      `I'm in it for the long run, not as a stepping stone ({{future goals}}).`
    ],
    { w: 2.5 });

  add('q-motivation', ['motivation', 'motivated', 'motivates', 'passion', 'inspiration', 'job satisfaction', 'what drives you', 'drives you', 'inspires you', 'what drives', 'what inspires', 'what excites', 'what keeps you going', 'what makes you tick', 'what do you enjoy'],
    [
      `What motivates me:`,
      ``,
      `• Figuring things out and solving problems`,
      `• Bringing projects to life`,
      `• Improving efficiency and helping others`,
      ``,
      `Learning something new is especially rewarding because it usually leads to more topics and possibilities to explore.`
    ],
    { w: 2.5 });

  add('q-strengths', ['strengths', 'strength', 'best at', 'what are you good at', 'greatest strength', 'strong points', 'what is he good at', 'top skills', 'core strengths', 'key strengths', 'what are his strengths'],
    [
      `My biggest strengths:`,
      ``,
      `• **Research-driven and detail-focused:** I qualify sites and contacts against consistent criteria so outreach is never wasted`,
      `• **Troubleshooting:** I dig into databases, code and data until I find the cause ({{problem solving}})`,
      `• **Automation mindset:** my Excel macro and a personal research script ({{excel macro}})`,
      `• **Reliable:** I meet quotas consistently and I'm trusted to pilot new accounts ({{pilot projects}})`
    ],
    { w: 2.5 });

  add('q-weakness', ['weakness', 'weaknesses', 'improve', 'improvement', 'areas for improvement', 'worst at', 'greatest weakness', 'time management', 'challenges', 'biggest weakness', 'flaws', 'shortcomings', 'needs improvement', 'areas to improve', 'weak points'],
    [
      `I'm candid about where I'm still growing:`,
      ``,
      `• **Time management:** my curiosity keeps sparking new ideas and experiments, so I handle responsibilities and deadlines first and explore later`,
      `• **Newer skills:** hands-on technical SEO is the newest part of my toolkit, built through {{badlands ink}}, {{nothingtechblob}} and {{auditkit}}`,
      `• **Continuous learning:** SEO, web development and AI keep changing ({{learning style}})`
    ],
    { w: 2.5 });

  add('q-hire', ['hire you', 'why you', 'why should we hire', 'why hire', 'what makes you different', 'stand out', 'what can you bring', 'add value', 'value', 'what he offers', 'what does he offer', 'candidate strengths', 'employer value', 'candidate', 'why hire him', 'why hire jampol', 'why should i hire', 'why choose', 'why pick', 'selling point', 'what sets you apart', 'competitive advantage'],
    [
      `What I bring to a team:`,
      ``,
      `• Critical thinking and intellectual curiosity`,
      `• Independent learning and adaptability`,
      `• A focus on process improvement ({{excel macro}})`,
      `• 5 years of SEO research and link-building experience`,
      `• Practical ideas, and dependable delivery under quotas and deadlines`
    ],
    { w: 2.5 });

  add('q-achievement', ['achievement', 'accomplishment', 'proudest', 'proud of', 'biggest win', 'success', 'accomplishments', 'award', 'biggest achievement', 'greatest achievement', 'proudest moment', 'biggest accomplishment', 'best accomplishment', 'career highlight', 'awards', 'recognition'],
    [
      `My proudest professional moments:`,
      ``,
      `• **Lean Six Sigma Award** for my Excel macro ({{excel macro}})`,
      `• **Promotion** from Contact Finder to Research Analyst ({{contact finder}})`,
      `• **Trusted to pilot** link-prospecting strategy for new client accounts ({{pilot projects}})`
    ],
    { w: 2.5 });

  add('q-macro', ['excel macro', 'macro', 'macros', 'repetitive tasks', 'repetitive work', 'process improvement', 'improve processes', 'workflow improvement', 'automation', 'automate', 'automated', 'lean six sigma', 'six sigma', 'lean', 'excel', 'vba', 'spreadsheet', 'streamline', 'repetitive'],
    [
      `At Straive, I developed an Excel macro to streamline complex, repetitive tasks and help prevent recurring errors.`,
      ``,
      `• It received a **Lean Six Sigma award**`,
      `• It helped improve my account's standing, an account that had often faced cost-cutting`,
      `• That progress supported opportunities to serve additional clients`,
      ``,
      `More from Straive: {{straive}}.`
    ],
    { w: 4, cmd: ['process improvement', 'excel macro'] });

  add('q-guide', ['research guide', 'specification guide', 'spec guide', 'research specs', 'research specification', 'accuracy', 'collaborated', 'collaboration guide', 'teamwork guide', 'specs', 'guideline', 'guidelines', 'documentation', 'playbook'],
    [
      `I collaborated on a research specification guide for contact-finding and marketing teams.`,
      ``,
      `• It aimed to reduce errors when identifying relevant contacts and doing outreach`,
      `• It also made the work more consistent`,
      ``,
      `It came from my time at {{intelligent.com}}.`
    ],
    { w: 3, cmd: ['research guide'] });

  add('q-pressure', ['pressure', 'deadline', 'deadlines', 'stress', 'stressful', 'quota', 'quotas', 'tight', 'deadline risk', 'ask for help', 'asking for help', 'miss a deadline', 'at risk', 'under pressure', 'tight deadline', 'overwhelmed', 'crunch', 'time pressure', 'work under pressure', 'meet deadlines', 'meeting deadlines'],
    [
      `Pressure is familiar territory for me:`,
      ``,
      `• I've met daily and monthly quotas in every role`,
      `• I communicate early if a deadline is at risk, and ask for help when needed`,
      `• In urgent periods, I focus on priority tasks and save workflow experiments for later`,
      `• At Straive, I supported another team through a critical deadline ({{leadership}})`
    ],
    { w: 2.5 });

  add('q-priorities', ['priorities', 'prioritize', 'prioritise', 'prioritization', 'workload', 'urgent', 'competing', 'multitask', 'multitasking', 'multiple tasks', 'multiple projects', 'juggle', 'manage time', 'manage priorities', 'too many tasks', 'task management'],
    [
      `How I set priorities:`,
      ``,
      `• I weigh urgency and business needs`,
      `• I make sure my existing responsibilities are not neglected`,
      `• I handle the highest-priority work first, then move on to the rest`
    ],
    { w: 2.5 });

  add('q-mistakes', ['mistake', 'mistakes', 'error', 'errors', 'accountability', 'lessons learned', 'fail', 'failure', 'messed up', 'make a mistake', 'made a mistake', 'handle mistakes', 'own up', 'take responsibility'],
    [
      `When something goes wrong, I:`,
      ``,
      `• Investigate the cause`,
      `• Inform the people affected and fix the issue`,
      `• Look for ways to keep it from happening again`,
      ``,
      `I value accountability and sharing lessons so the team can improve.`
    ],
    { w: 2.5 });

  add('q-team', ['team', 'teamwork', 'collaborate', 'collaboration', 'colleagues', 'conflict', 'manager', 'teammate', 'teammates', 'reliability', 'reliable', 'team contribution', 'work in a team', 'team player', 'get along', 'coworkers', 'co-workers', 'working with others', 'team environment'],
    [
      `Teammates can expect me to be curious, adaptable and helpful, with ideas to contribute.`,
      ``,
      `• I clarify specs with team leaders first so research lines up with campaign goals`,
      `• I share the verification and research tricks I discover`,
      `• I welcome discussion about practical improvements ({{research guide}} is an example)`,
      ``,
      `I also enjoy independent work ({{work style}}).`
    ],
    { w: 1.2 });

  add('q-workstyle', ['work style', 'working style', 'independent', 'independently', 'working alone', 'work alone', 'solo', 'alone', 'independent worker', 'self-directed', 'self directed', 'work on his own', 'on your own', 'solo work', 'prefer to work alone', 'alone or team'],
    [
      `My work style has two sides:`,
      ``,
      `• **Independent:** it gives me room to think creatively, experiment and take responsibility for my work`,
      `• **Collaborative:** just as valuable for sharing knowledge, coordinating tasks and building better solutions together ({{teamwork}})`
    ],
    { w: 2.5 });

  add('q-leadership', ['leadership', 'delegation', 'delegate', 'team management', 'lead a team', 'led a team', 'manage a team', 'lead others', 'led others', 'leader', 'lead people', 'supervise', 'team lead', 'mentoring', 'mentor', 'train others', 'training others'],
    [
      `My leadership experience comes from Straive:`,
      ``,
      `• I temporarily supported an additional team during a sudden deadline, while keeping up with my own responsibilities`,
      `• I shared my techniques and assigned tasks to streamline the work and improve efficiency`,
      `• I also piloted and onboarded new projects ({{pilot projects}})`
    ],
    { w: 2.5, cmd: ['leadership'] });

  add('q-initiative', ['initiative', 'pilot', 'pilots', 'pilot projects', 'implementation', 'new accounts', 'take ownership', 'take initiative', 'proactive', 'self starter', 'self-starter', 'above and beyond', 'project pilot', 'pilot a project', 'rollout', 'acquired'],
    [
      `I've helped pilot projects at Straive and Intelligent.com:`,
      ``,
      `• Researching requirements`,
      `• Developing and testing workflows, then refining the process`,
      `• Training others and supporting implementation`,
      ``,
      `Several of the projects I helped pilot were eventually acquired.`
    ],
    { w: 2.5 });

  add('q-feedback', ['feedback', 'criticism', 'suggestions', 'disagreement', 'disagreements', 'disagree', 'critique', 'constructive', 'receive feedback', 'take feedback', 'handle criticism', 'constructive criticism', 'negative feedback', 'pushback', 'push back'],
    [
      `When I get feedback, I:`,
      ``,
      `• Evaluate it and ask questions to clarify the suggestion`,
      `• Experiment where it makes sense`,
      `• Explain my reasoning, then aim to align with others or blend ideas into a better solution`
    ],
    { w: 2.5 });

  add('q-gap', ['gap', 'career gap', 'since 2024', 'recent', 'doing now', 'currently', 'right now', 'lately', 'employment gap', 'gap in your resume', 'resume gap', 'what have you been doing', 'time off', 'unemployed', 'between jobs'], // EDIT
    [
      `Since May 2025, I've been deliberately upskilling:`,
      ``,
      `• The Complete Full-Stack Web Development Bootcamp and the Technical SEO and SEO Sprint certification ({{certs}})`,
      `• Seven shipped projects across WordPress, WooCommerce, Node.js, Express and PostgreSQL ({{projects}})`,
      `• AI-assisted workflows and local LLMs with Ollama ({{ai}})`
    ],
    { w: 2 });

  add('q-leave', ['why leave', 'looking for', 'new role', 'new job', 'why are you looking', 'why did you leave', 'leaving', 'left', 'reason for leaving', 'why are you leaving', 'new opportunity', 'job search', 'looking for work', 'seeking'], // EDIT
    [
      `I'm looking for a role that uses both sides of my profile:`,
      ``,
      `• My SEO research experience`,
      `• The technical skills I've built since`,
      ``,
      `Ideally it's a technical SEO role where diagnosing and fixing site issues is part of the job.`
    ],
    { w: 2.5 });

  add('q-future', ['5 years', 'five years', 'future', 'goals', 'career goals', 'long term', 'long-term', 'ambition', 'grow', 'three year', '3 years', 'three years', 'career growth', 'seo and ai', 'three-year plan', 'five-year plan', 'three-year', 'five-year', '3-year', '5-year', '5 year plan', 'five year plan', 'in five years', 'in 5 years', 'career plan', 'long term goals', 'future plans', 'what s next', 'where do you see yourself'],
    [
      `Where I want to go:`,
      ``,
      `• Become a well-rounded SEO specialist and deepen my expertise`,
      `• Take on more responsibility and build useful tools`,
      `• Find practical ways to bring AI into workflows`,
      `• Pair my research and SEO background with stronger technical skills`,
      ``,
      `I see web development and AI as complementary to SEO.`
    ],
    { w: 1.5 });

  add('q-salary', ['salary', 'pay', 'compensation', 'rate', 'rates', 'expected', 'expectations', 'budget', 'how much', 'salary expectation', 'expected salary', 'pay expectations', 'how much do you want', 'compensation expectations', 'asking rate', 'hourly rate'], // EDIT
    `I'm open to talking numbers based on the scope of the role and the market, and a chat on [LinkedIn](https://www.linkedin.com/in/jpldl/) is the best way to find something fair for both sides.`,
    { w: 1.5 });

  add('q-remote', ['remote', 'on-site', 'onsite', 'office', 'hybrid', 'wfh', 'timezone', 'time zone', 'availability', 'available', 'start', 'flexibility', 'flexible', 'work culture', 'preferred environment', 'work environment', 'work from home', 'work remotely', 'remote work', 'prefer remote', 'in office', 'on site', 'work setup', 'notice period', 'when can you start', 'when can he start', 'start date'],
    [
      `I thrive in flexible, independent setups.`,
      ``,
      `• **Prefer:** remote work, flexible hours, room to work independently and freedom to experiment, with teamwork when needed`,
      `• **Remote record:** Intelligent.com (Seattle) and Awisee (Stockholm), both fully remote with international teams`,
      `• **On-site:** Straive`,
      `• **Availability and start date:** message me on [LinkedIn](https://www.linkedin.com/in/jpldl/)`
    ],
    { w: 1.5 });

  add('q-problem', ['solve problems', 'problem solving', 'problem-solving', 'troubleshoot', 'troubleshooting', 'debug', 'stuck', 'approach', 'root cause', 'solutions', 'solve a problem', 'problem solver', 'fix problems', 'diagnose', 'find the cause', 'troubleshooter'],
    [
      `I look for the root cause before treating symptoms:`,
      ``,
      `• I investigate what went wrong`,
      `• I test possible solutions and explore alternatives`,
      `• I look for ways to prevent it from recurring`,
      ``,
      `That's how I handled the link and email databases at Intelligent.com, and why I build scripts to remove repetitive steps.`
    ],
    { w: 2 });

  add('q-learn', ['learn', 'learning', 'new things', 'upskill', 'upskilling', 'self-learning', 'self learning', 'learning style', 'experimentation', 'research', 'learn new things', 'learn quickly', 'quick learner', 'self taught', 'self-taught', 'pick up new'],
    [
      `I learn by combining:`,
      ``,
      `• Online research`,
      `• Hands-on experimentation`,
      `• Troubleshooting`,
      ``,
      `When a subject interests me, I explore it well beyond what work requires. It took me from bootcamp to capstone projects and now into AI-assisted workflows.`
    ],
    { w: 1.2 });

  add('q-curiosity', ['curiosity', 'curious', 'tinkering', 'how things work', 'what are you curious about', 'curious about', 'what interests', 'what are you interested in', 'love learning', 'experimenting'],
    [
      `I enjoy reading, researching, experimenting and understanding how things work.`,
      ``,
      `My curiosity runs through technology, Linux, open-source software, web development, AI, photography and creative projects. More in {{hobbies}}.`
    ],
    { w: 2.5 });

  add('q-adapt', ['adaptability', 'adapt', 'adaptable', 'unfamiliar', 'new tools', 'new clients', 'new projects', 'adapt to change', 'new environment', 'new industry', 'quick to adapt', 'handle change', 'new process'],
    [
      `When a project or client is new, I:`,
      ``,
      `• Research the subject and understand what the client needs`,
      `• Test workflows and refine my approach through experimentation`,
      `• Mix independent investigation with collaboration when it helps`
    ],
    { w: 2.5 });

  add('q-values', ['values', 'what do you value', 'what does he value', 'what he values', 'jampol value', 'jampol values', 'jampol s values', 'does he value', 'work ethic', 'principles', 'professional values', 'ownership', 'core values', 'what matters', 'philosophy', 'work philosophy'],
    [
      `What I value:`,
      ``,
      `• Continuous learning`,
      `• Problem-solving and practical results`,
      `• Independent ownership, with teamwork when needed`,
      `• The freedom to experiment and find better ways of doing things`
    ],
    { w: 2.5 });

  add('q-challenges', ['favorite challenges', 'favourite challenges', 'difficult problems', 'difficult problem', 'technical issues', 'research challenges', 'hardest problem', 'enjoy solving', 'workflow', 'challenge', 'enjoy most', 'favorite part', 'favourite part', 'tough problems', 'complex problems', 'challenging tasks'],
    [
      `I enjoy:`,
      ``,
      `• Solving technical issues`,
      `• Improving repetitive workflows`,
      `• Answering difficult research questions`,
      `• Building tools`,
      ``,
      `At Intelligent.com, my Research Manager and a higher-level Project Manager regularly talked through problems and workflow improvements with me and trusted my input.`
    ],
    { w: 2.5 });

  add('q-english', ['english', 'fluency', 'communication', 'speaking', 'confidence', 'english proficiency', 'speak english', 'communicate', 'english skills', 'english level', 'speak english well', 'language skills', 'spoken english', 'communication skills', 'nervous speaking', 'english fluency'],
    [
      `I may feel a little nervous at first when speaking English in professional conversations.`,
      ``,
      `I get more comfortable as the conversation goes on, and I keep building my fluency and confidence through practice and experience.`
    ],
    { w: 3 });

  /* ---- easter eggs (cmd only) ---- */
  add('sudo', [], `Nice try! 😄 guest isn't in the sudoers file, and this incident will be reported.`, { cmd: ['sudo', 'sudo su', 'sudo hire jp'] });
  add('rm', [], `Whoa there! Permission denied: removing '/' isn't allowed, which is lucky, because that is the entire portfolio.`, { cmd: ['rm -rf /', 'rm -rf', 'rm -rf /*'] });
  add('neofetch', [],
    `**guest@jp-portfolio** is running Arch Linux x86_64 with zsh 5.9 and the Everforest theme, and it belongs to me, a Technical SEO Specialist who works in HTML, CSS, JS, Node and PostgreSQL and has 7 projects and 2 certifications to my name.`,
    { cmd: ['neofetch', 'fastfetch'] });

  /* ───────────────────────── MATCHING ───────────────────────── */
  const SUGGEST = ['about', 'experience', 'skills', 'projects', 'hobbies', 'interview', 'contact'];
  const norm = s => s.toLowerCase().replace(/[^a-z0-9+#.\- ]+/g, ' ').replace(/\s+/g, ' ').trim();

  function find(q) {
    const t = norm(q);
    if (!t) return null;
    const t2 = t.replace(/^(cat|ls|open|show|run|\.\/|\$)\s*/, '').trim();
    for (const e of E) if (e.cmd.includes(t) || e.cmd.includes(t2)) return e;
    const toks = t.split(' ');
    let best = null, bs = 0;
    for (const e of E) {
      let s = 0;
      for (const k of e.k) {
        if (k.includes(' ')) { if (t.includes(k)) s += 2; }
        else if (toks.includes(k) || (k.length > 4 && toks.some(w => w.startsWith(k)))) s += 1;
      }
      s *= e.w;
      if (s > bs) { bs = s; best = e; }
    }
    return bs > 0 ? best : null;
  }

  /* ───────────────────────── UI ─────────────────────────
   * The chat is a search bar on the taskbar (built below, #taskbar-ask) plus any form[data-ask] (the phone layout's bottom bar).
   * Focusing or submitting the taskbar bar opens this chat box right above it.
   * window.jptOpen() opens it from anywhere else. */
  const ICON = (() => {
    try { const src = document.currentScript && document.currentScript.src; if (src) return new URL('../img/astrobot.svg', src).href; } catch (e) {}
    return 'assets/img/astrobot.svg';
  })();

  const css = `
.jpt{--bg:var(--background-color,#2d353b);--bg2:color-mix(in srgb,var(--bg) 80%,#000);--bg2t:color-mix(in srgb,var(--bg2) 55%,transparent);--fg:var(--default-color,#d3c6aa);--dim:var(--muted-color,color-mix(in srgb,var(--fg) 62%,var(--bg)));--lk:var(--link-color,var(--typed-color,#7fbbb3));--on:var(--on-accent-color,var(--bg));--bd:var(--border-color,color-mix(in srgb,var(--fg) 14%,transparent));--g:var(--accent-highlight,#a7c080);--a:var(--accent-color,#83c092);--y:var(--heading-color,#dbbc7f);--b:var(--typed-color,#7fbbb3);--r:var(--danger-color,var(--cmd-red,#e67e80));
 font-family:inherit;font-size:13.5px;line-height:1.55;color:var(--fg);position:fixed;left:0;right:0;top:var(--jpt-top,0px);height:var(--jpt-vh,100%);z-index:2147483000;display:none;align-items:flex-end;justify-content:center;padding:16px 16px var(--jpt-bot,64px)}
.jpt *{box-sizing:border-box}
.jpt.open{display:flex}
.jpt-svg{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}
.jpt-back{position:absolute;inset:0;background:rgba(0,0,0,.22)}

/* the chat box: centered horizontally, just above the taskbar, translucent, frosted */
.jpt-win{position:relative;display:flex;flex-direction:column;width:min(560px,100%);height:min(540px,100%);max-height:none;padding:0!important;margin:0!important;background:color-mix(in srgb,var(--bg) 58%,transparent);-webkit-backdrop-filter:blur(18px) saturate(1.3);backdrop-filter:blur(18px) saturate(1.3);border:1px solid color-mix(in srgb,var(--fg) 16%,transparent);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5),0 4px 14px rgba(0,0,0,.3);overflow:hidden;animation:jpt-in .15s ease-out}
@keyframes jpt-in{from{opacity:0}to{opacity:1}}

/* taskbar mode (desktop): the box is a flyout anchored above the taskbar search bar. its left edge follows the bar (--jpt-left),
   the dim backdrop stops at the taskbar so the bar stays usable, and the bar itself is the input, so the box's own field is hidden */
.jpt.jpt-tb{justify-content:flex-start;padding-left:var(--jpt-left,16px);pointer-events:none}
.jpt.jpt-tb .jpt-back{bottom:calc(var(--jpt-bot,64px) - 8px);pointer-events:auto}
.jpt.jpt-tb .jpt-win{pointer-events:auto;transform-origin:bottom left;animation-name:jpt-rise}
.jpt.jpt-tb .jpt-in{display:none}
.jpt.jpt-tb .jpt-chips{padding-bottom:12px}
@keyframes jpt-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

/* header: the astronaut, static (no animation, no hover effect) */
.jpt-bar{display:flex;align-items:center;gap:10px;padding:12px 10px 10px 16px;flex:none;border-bottom:1px solid color-mix(in srgb,var(--fg) 10%,transparent)}
.jpt-ico{display:block;width:36px;height:36px;flex:none;object-fit:contain;filter:url(#jpt-tint);user-select:none;-webkit-user-drag:none}
.jpt-ttl{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.25}
.jpt-ttl b{font-weight:600;font-size:15px;color:var(--fg)}
.jpt-ttl small{color:var(--dim);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jpt-ib{background:none;border:0;padding:0;color:var(--dim);width:30px;height:30px;display:grid;place-items:center;border-radius:8px;cursor:pointer;flex:none}
.jpt-ib svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.jpt-ib:hover,.jpt-ib:focus-visible{color:var(--g);background:color-mix(in srgb,var(--fg) 8%,transparent);outline:none}
.jpt-x:hover,.jpt-x:focus-visible{color:var(--r)}

/* conversation: chat bubbles */
.jpt-out{flex:1 1 0;min-height:0;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}
.jpt-out::-webkit-scrollbar{width:4px}.jpt-out::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--fg) 25%,transparent);border-radius:2px}
.jpt-ln{margin:0;padding:8px 13px;max-width:90%;overflow-wrap:anywhere;border-radius:14px;background:color-mix(in srgb,var(--fg) 9%,transparent);align-self:flex-start;border-bottom-left-radius:4px}
.jpt-ln.u{align-self:flex-end;background:color-mix(in srgb,var(--g) 28%,transparent);border-bottom-left-radius:14px;border-bottom-right-radius:4px}
.jpt-ln b{color:var(--y);font-weight:600}
.jpt-li{display:block;padding-left:2ch;text-indent:-2ch;margin:2px 0}
.jpt-gap{display:block;height:6px}
.jpt-ln code{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--b);background:var(--bg2t);padding:0 4px;border-radius:3px}
.jpt-ln a{color:var(--lk);text-decoration:underline;text-underline-offset:2px}
.jpt-cmd{font:inherit;color:var(--g);background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:left;text-decoration:underline dotted;text-underline-offset:3px}
.jpt-cmd:hover,.jpt-cmd:focus-visible{text-decoration-style:solid;outline:none}
.jpt-chips{display:flex;gap:6px;padding:0 16px 8px;overflow-x:auto;scrollbar-width:none;flex:none}
.jpt-chips::-webkit-scrollbar{display:none}
/* desktop: the chips wrap onto a second row so every suggestion is visible (a hidden-scrollbar strip can't be scrolled with a mouse) */
@media (min-width:769px){.jpt-chips{flex-wrap:wrap;overflow-x:visible}}
.jpt-chips .jpt-cmd{white-space:nowrap;flex:none;color:var(--dim);text-decoration:none;padding:3px 11px;border-radius:999px;background:color-mix(in srgb,var(--fg) 9%,transparent)}
.jpt-chips .jpt-cmd:hover,.jpt-chips .jpt-cmd:focus-visible{color:var(--g)}
.jpt-in{display:flex;gap:6px;align-items:center;margin:0 12px 12px;padding:0 4px 0 16px;flex:none;border-radius:999px;background:color-mix(in srgb,var(--fg) 10%,transparent);border:1px solid var(--bd)}
.jpt-in:focus-within{border-color:var(--g)}
.jpt-in input{flex:1;min-width:0;height:40px;background:none;border:0;outline:0;color:var(--fg);font:inherit;caret-color:var(--g)}
.jpt-in input::placeholder{color:var(--dim)}
.jpt-send:not(:disabled){color:var(--g)}
.jpt-send:disabled{opacity:.4;cursor:default}
.jpt-caret{display:inline-block;width:.5em;height:1em;margin-left:1px;vertical-align:text-bottom;background:var(--g);animation:jpt-blink 1s steps(1) infinite}
@keyframes jpt-blink{50%{opacity:0}}
.jpt-dots:after{content:"";animation:jpt-d 1s steps(4) infinite}
@keyframes jpt-d{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}

/* phone (<=768px): the chat is an Android-style bubble sheet in Material 3 colours: tonal surfaces, 28dp sheet, 20dp message shapes,
   filled-tonal chips, a 28dp pill field and a filled send button. the sheet keeps one fixed height. Flat colours, no borders, no gradients. */
@media (max-width:768px){
.jpt.adr-on{display:block;padding:0;pointer-events:none;z-index:2147480000}
.jpt.adr-on .jpt-back{display:none}
.jpt.adr-on .jpt-win{position:fixed;left:var(--adr-left,8px);right:auto;top:var(--adr-top,106px);bottom:auto;width:var(--adr-w,calc(100% - 16px));height:var(--adr-h,calc(100dvh - 232px));max-height:none;padding:0!important;
  pointer-events:auto;background:color-mix(in srgb,var(--fg) 7%,var(--bg));-webkit-backdrop-filter:none;backdrop-filter:none;border:0;border-radius:28px;box-shadow:0 8px 24px rgba(0,0,0,.45);animation:none}
.jpt.adr-on .jpt-win.adr-bubbled{visibility:hidden;pointer-events:none}
/* top app bar */
.jpt.adr-on .jpt-bar{min-height:56px;padding:8px 8px 8px 20px;gap:12px;border:0;background:color-mix(in srgb,var(--g) 26%,var(--bg))}
.jpt.adr-on .jpt-ico{width:34px;height:34px}
.jpt.adr-on .jpt-ttl b{font-size:16px;font-weight:600;letter-spacing:.01em}
.jpt.adr-on .jpt-ttl small{font-size:12px}
.jpt.adr-on .jpt-ib{width:40px;height:40px;border-radius:50%}
.jpt.adr-on .jpt-ib svg{width:20px;height:20px}
.jpt.adr-on .jpt-ib:hover,.jpt.adr-on .jpt-ib:focus-visible{background:color-mix(in srgb,var(--fg) 12%,transparent)}
.jpt.adr-on .jpt-x{display:none}
/* messages */
.jpt.adr-on .jpt-out{flex:1 1 0;min-height:0;padding:14px 14px 6px;gap:6px}
.jpt.adr-on .jpt-ln{max-width:88%;padding:10px 14px;border-radius:20px 20px 20px 6px;background:color-mix(in srgb,var(--fg) 13%,var(--bg));font-size:14px;line-height:1.5}
.jpt.adr-on .jpt-ln.u{border-radius:20px 20px 6px 20px;background:color-mix(in srgb,var(--g) 34%,var(--bg))}
/* suggestion chips */
.jpt.adr-on .jpt-chips{gap:8px;padding:6px 14px 10px}
.jpt.adr-on .jpt-chips .jpt-cmd{height:32px;display:inline-flex;align-items:center;padding:0 14px;border-radius:8px;background:color-mix(in srgb,var(--fg) 11%,var(--bg));color:var(--fg);font-size:13px;font-weight:500}
.jpt.adr-on .jpt-chips .jpt-cmd:active{background:color-mix(in srgb,var(--g) 30%,var(--bg))}
/* text field + send */
.jpt.adr-on .jpt-in{margin:0 12px calc(12px + env(safe-area-inset-bottom,0px));padding:0 6px 0 20px;height:52px;border:0;border-radius:28px;background:color-mix(in srgb,var(--fg) 13%,var(--bg))}
.jpt.adr-on .jpt-in:focus-within{box-shadow:inset 0 0 0 2px var(--g)}
.jpt.adr-on .jpt-in input{height:100%;font-size:16px}
.jpt.adr-on .jpt-send{width:40px;height:40px;background:color-mix(in srgb,var(--fg) 12%,transparent);color:var(--dim)}
.jpt.adr-on .jpt-send:not(:disabled){background:var(--g);color:var(--on)}
.jpt.adr-on .jpt-send:disabled{opacity:1}
}

@media (max-width:480px){.jpt{padding:10px 10px var(--jpt-bot,64px)}.jpt-in input{font-size:16px}}
@media (prefers-reduced-motion:reduce){.jpt-win,.jpt-dots:after,.jpt-caret{animation:none!important}.jpt *{scroll-behavior:auto!important}}
`;

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* line layout: '• ' lines become hanging-indent bullets, blank lines become a small gap, other lines break with <br> */
  const layout = (a, l) => {
    const t = !l.trim() ? 'g' : /^•\s/.test(l) ? 'li' : 'p';
    const h = t === 'g' ? '<span class="jpt-gap"></span>' : t === 'li' ? '<span class="jpt-li">' + l + '</span>' : l;
    return { out: a.out + (t === 'p' && a.prev === 'p' ? '<br>' : '') + h, prev: t };
  };
  const fmt = s => esc(s)
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (m, label, href) =>
      /\.pdf([?#]|$)/i.test(href)
        /* PDFs download directly instead of opening the browser's PDF viewer */
        ? '<a href="' + href + '" download rel="noopener">' + label + '</a>'
        : '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + label + '</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\{\{([^}]+)\}\}/g, '<button type="button" class="jpt-cmd" data-q="$1">$1</button>')
    .split('\n').reduce(layout, { out: '', prev: '' }).out;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'jpt';
  root.innerHTML = `
    <svg class="jpt-svg" aria-hidden="true" focusable="false" width="0" height="0">
      <filter id="jpt-tint" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
        <feFlood id="jpt-tint-flood" flood-color="#83c092" result="flood"/>
        <feBlend in="flood" in2="SourceGraphic" mode="color" result="blend"/>
        <feComposite in="blend" in2="SourceGraphic" operator="in" result="clip"/>
        <feComposite in="clip" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.55" k3="0.45" k4="0"/>
      </filter>
    </svg>
    <div class="jpt-back"></div>
    <section class="jpt-win" id="jpt-win" role="dialog" aria-label="Ask Jampol">
      <div class="jpt-bar">
        <img class="jpt-ico" src="${ICON}" alt="" width="36" height="36" draggable="false">
        <div class="jpt-ttl"><b>Ask Jampol</b><small>Get to know John Paul De Leon</small></div>
        <button class="jpt-ib jpt-clr" type="button" aria-label="Clear chat" title="Clear chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg></button>
        <button class="jpt-ib jpt-x" type="button" aria-label="Close chat" title="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="jpt-out" role="log" aria-live="polite"></div>
      <div class="jpt-chips" aria-label="Suggestions"></div>
      <div class="jpt-in">
        <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ask me anything, or type help" aria-label="Ask Jampol a question">
        <button class="jpt-ib jpt-send" type="button" aria-label="Send" title="Send" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button>
      </div>
    </section>`;
  document.body.appendChild(root);
  document.body.appendChild(root.querySelector('.jpt-svg'));

  /* theme-aware (static) tint for the astronaut: follows --accent-color, re-synced when the theme changes */
  const de = document.documentElement;
  const flood = document.getElementById('jpt-tint-flood');
  const tint = () => {
    const c = getComputedStyle(de).getPropertyValue('--accent-color').trim();
    if (c && flood.getAttribute('flood-color') !== c) flood.setAttribute('flood-color', c);
  };
  tint();
  new MutationObserver(tint).observe(de, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  document.addEventListener('click', ev => {
    if (ev.target.closest('[data-theme-choice]')) { requestAnimationFrame(tint); setTimeout(tint, 150); }
  });
  root.querySelector('.jpt-ico').addEventListener('error', ev => { ev.target.style.display = 'none'; });

  const $ = s => root.querySelector(s);
  const out = $('.jpt-out'), input = $('.jpt-in input'), chips = $('.jpt-chips');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hist = []; let hi = 0, booted = false;
  let searchForm = null, tbInput = null;   // the taskbar search bar (set by mountSearch)

  SUGGEST.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'jpt-cmd'; b.dataset.q = s; b.textContent = s;
    chips.appendChild(b);
  });

  const print = (html, cls = '') => {
    const p = document.createElement('div');
    p.className = 'jpt-ln ' + cls;
    p.innerHTML = html;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
    return p;
  };

  const isOpen = () => root.classList.contains('open');

  /* ───────────── phone: Android-style chat head ─────────────
   * window.adrBubbles comes from android.js (the app-bubbles block). On <=768px this chat registers there as a sheet:
   * it opens under the bubble row, folds into a round astronaut head that stacks with the project heads, shows a red dot when a
   * reply arrives while folded, and closes when its head is dragged to the X. */
  const win = $('#jpt-win'), mqp = matchMedia('(max-width:768px)');
  const bub = () => window.adrBubbles || null;
  function openHead() {
    const B = bub();
    root.classList.add('open', 'adr-on');
    if (B.has('chat')) B.open('chat');
    else B.add({
      id: 'chat', kind: 'chat', el: win, bar: $('.jpt-bar'), title: 'Ask Jampol', close: closeHead,
      iconHTML: '<img class="adr-bub-img" src="' + ICON + '" alt="" draggable="false">'
    });
    boot();
  }
  function closeHead() {
    const B = bub();
    if (B && B.has('chat')) B.remove('chat');
    win.classList.remove('adr-sheet', 'adr-bubbled');
    ['--adr-top', '--adr-h'].forEach(p => win.style.removeProperty(p));
    win.style.translate = '';
    root.classList.remove('open', 'adr-on');
  }

  function boot() {
    if (booted) return;
    booted = true;
    print(fmt(`Hi there! 👋 I'm **John Paul De Leon**, but my friends call me **Jampol**. Ask me anything about my work, my projects or what I'm into off the clock.`), 's');
    say(fmt([
      'Where would you like to start?', '',
      '• **The professional side:** {{experience}}, {{skills}}, {{projects}} or the classic {{interview}} questions',
      '• **Off the clock:** {{hobbies}} or my personal corner of the web, {{johnoffthewall}}',
      '• **Not sure?** Just say {{help}}'
    ].join('\n')));
  }

  /* typewriter for bot replies: reveals text node by node so links, bold and
     command buttons keep working and only appear once the typing reaches them */
  let typer = null;
  function typeInto(el) {
    if (typer) typer.skip();
    const nodes = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) {
      if (!n.nodeValue) continue;
      const p = n.parentElement;
      const host = p && p !== el ? p.closest('button,a,b,code') : null;
      nodes.push({ n, t: n.nodeValue, host: host && el.contains(host) ? host : null });
    }
    const total = nodes.reduce((a, x) => a + x.t.length, 0);
    if (!total) return;
    nodes.forEach(x => { x.n.nodeValue = ''; if (x.host) x.host.style.display = 'none'; });
    const caret = document.createElement('span');
    caret.className = 'jpt-caret';
    const ticks = Math.max(1, Math.min(1600, Math.max(450, total * 10)) / 18);
    const per = Math.max(1, Math.ceil(total / ticks));
    let ni = 0, ci = 0, last = null, timer = 0;
    const finish = () => {
      clearInterval(timer);
      nodes.forEach(x => { x.n.nodeValue = x.t; if (x.host) x.host.style.display = ''; });
      caret.remove();
      out.scrollTop = out.scrollHeight;
      out.setAttribute('aria-busy', 'false');
      if (typer === t) typer = null;
    };
    const step = () => {
      let budget = per;
      while (budget > 0 && ni < nodes.length) {
        const x = nodes[ni];
        if (ci === 0 && x.host) x.host.style.display = '';
        const take = Math.min(budget, x.t.length - ci);
        ci += take; budget -= take; last = x;
        x.n.nodeValue = x.t.slice(0, ci);
        if (ci >= x.t.length) { ni++; ci = 0; }
      }
      if (last) { const ref = last.host || last.n; ref.parentNode.insertBefore(caret, ref.nextSibling); }
      out.scrollTop = out.scrollHeight;
      if (ni >= nodes.length) finish();
    };
    const t = { skip: finish };
    typer = t;
    out.setAttribute('aria-busy', 'true');
    timer = setInterval(step, 18);
    step();
  }
  /* bot output: typed when the window is open, instant when it arrives while closed */
  function say(html, cls = '') {
    const p = print(html, cls);
    const B = bub();
    if (B && B.has('chat') && B.isCollapsed('chat')) B.badge('chat', true);
    if (!reduce && isOpen()) typeInto(p);
    return p;
  }

  function clearChat() {
    if (typer) typer.skip();
    out.innerHTML = '';
    print(fmt('Fresh start! Tap a suggestion or type {{help}} to begin again.'), 's');
  }

  const sendBtn = $('.jpt-send');
  const syncSend = () => { sendBtn.disabled = !input.value.trim(); };
  const send = () => { const v = input.value; input.value = ''; syncSend(); run(v); focusIn(); };
  input.addEventListener('input', syncSend);
  input.addEventListener('keyup', syncSend);
  sendBtn.addEventListener('click', send);
  $('.jpt-clr').addEventListener('click', () => { clearChat(); focusIn(); });
  out.addEventListener('click', ev => { if (typer && !ev.target.closest('a,button')) typer.skip(); });

  /* on phones keep the centered box inside the visible area when the on-screen keyboard is up */
  const vv = window.visualViewport;
  const syncVV = () => {
    if (!vv) return;
    if (vv.scale > 1.01) { root.style.removeProperty('--jpt-top'); root.style.removeProperty('--jpt-vh'); return; }
    root.style.setProperty('--jpt-top', Math.round(vv.offsetTop) + 'px');
    root.style.setProperty('--jpt-vh', Math.round(vv.height) + 'px');
  };
  if (vv) { vv.addEventListener('resize', syncVV); vv.addEventListener('scroll', syncVV); syncVV(); }

  /* sit the box just above the taskbar (measured, so it follows the taskbar's real height) */
  const place = () => {
    const tb = document.getElementById('top-panel');
    if (!tb || !isOpen()) return;
    const t = tb.getBoundingClientRect(), r = root.getBoundingClientRect();
    if (t.height && t.top > r.top) root.style.setProperty('--jpt-bot', Math.round(r.bottom - t.top + 8) + 'px');
    /* line the box's left edge up with the search bar, kept inside the screen */
    if (searchForm && root.classList.contains('jpt-tb')) {
      const s = searchForm.getBoundingClientRect(), w = Math.min(560, innerWidth - 32);
      root.style.setProperty('--jpt-left', Math.round(Math.max(16, Math.min(s.left, innerWidth - w - 16))) + 'px');
    }
  };
  /* taskbar mode is on when the taskbar search bar exists and we are not on the phone layout */
  const useTb = () => !!searchForm && searchForm.isConnected && !mqp.matches;
  const focusIn = () => (root.classList.contains('jpt-tb') && tbInput ? tbInput : input).focus();
  addEventListener('resize', place);
  if (vv) vv.addEventListener('resize', place);

  function toggle(open) {
    const B = bub();
    if (!open && B && B.has('chat')) { closeHead(); return; }
    if (open && B && mqp.matches) { openHead(); return; }
    if (!open && tbInput && document.activeElement === tbInput) tbInput.blur();
    if (open) root.classList.toggle('jpt-tb', useTb());
    root.classList.toggle('open', open);
    if (open) { place(); boot(); setTimeout(focusIn, 30); }
  }

  function run(q) {
    q = q.trim();
    if (!q) return;
    if (typer) typer.skip();
    print(esc(q), 'u');
    hist.push(q); hi = hist.length;
    const n = norm(q);
    if (n === 'clear' || n === 'cls') { clearChat(); return; }
    if (['exit', 'quit', 'q', ':q', 'close'].includes(n)) { toggle(false); return; }
    const wait = reduce ? 0 : 220;
    const dots = wait ? print('<span class="jpt-dots">thinking</span>', 's') : null;
    setTimeout(() => {
      if (dots) dots.remove();
      const e = find(q);
      if (e) say(fmt(e.a));
      else say(fmt(`Hmm, I couldn't find anything for **${q.slice(0, 40)}**. I can only talk about my resume, work experience, projects and career, so try {{help}} or {{interview}}, or {{contact}} me directly.`));
    }, wait);
  }

  $('.jpt-x').addEventListener('click', () => toggle(false));
  $('.jpt-back').addEventListener('click', () => toggle(false));
  root.addEventListener('click', ev => {
    const b = ev.target.closest('.jpt-cmd');
    if (b) { run(b.dataset.q); focusIn(); }
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && isOpen()) toggle(false);
  });
  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { send(); }
    else if (ev.key === 'ArrowUp') { if (hi > 0) input.value = hist[--hi]; ev.preventDefault(); }
    else if (ev.key === 'ArrowDown') { input.value = hi < hist.length - 1 ? hist[++hi] : (hi = hist.length, ''); ev.preventDefault(); }
    else if (ev.key === 'Tab') {
      ev.preventDefault();
      const v = norm(input.value); if (!v) return;
      const all = [...new Set(E.flatMap(e => e.cmd))].filter(c => c.startsWith(v));
      if (all.length) input.value = all[0];
    } else if (ev.key === 'l' && ev.ctrlKey) { ev.preventDefault(); clearChat(); }
  });

  /* ───────────── form[data-ask] hookup (phone bottom bar) ───────────── */
  const menu = document.getElementById('app-menu');
  const menuBtn = document.getElementById('taskbar-menu-btn');
  const closeMenu = () => { if (menu && menuBtn && menu.classList.contains('open')) menuBtn.click(); };
  /* every form[data-ask] (the phone layout's bottom search bar) opens this chat */
  document.querySelectorAll('form[data-ask]').forEach(askForm => {
    const askInput = askForm.querySelector('input');
    if (!askInput) return;
    askForm.addEventListener('submit', ev => {
      ev.preventDefault();
      const q = askInput.value.trim();
      askInput.value = '';
      askInput.blur();
      closeMenu();
      toggle(true);
      if (q) run(q);
    });
    /* typing in the bar must not trigger any menu / desktop shortcuts */
    askInput.addEventListener('keydown', ev => {
      ev.stopPropagation();
      if (ev.key === 'Escape') { askInput.blur(); closeMenu(); }
    });
  });

  /* ───────────── taskbar search bar: the far left of the taskbar, before the social links ─────────────
   * Click or focus it and the chat opens above it. Type a question and press Enter to ask it. The bar stays
   * the input while the chat is open. Hidden on the phone layout (see taskbar.css), which has its own bottom bar. */
  const mountSearch = () => {
    if (document.getElementById('taskbar-ask')) return;
    const bar = document.getElementById('top-panel') || document.querySelector('.top-panel, .taskbar');
    if (!bar) return;
    const f = document.createElement('form');
    f.id = 'taskbar-ask'; f.className = 'taskbar-search'; f.setAttribute('role', 'search'); f.setAttribute('autocomplete', 'off');
    f.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
      '<input type="text" placeholder="Ask Jampol" aria-label="Ask Jampol a question" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      '<button type="submit" class="taskbar-send" aria-label="Send" title="Send" disabled><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button>';
    const social = bar.querySelector('.panel-connect');
    const mb = bar.querySelector('.taskbar-menu, #taskbar-menu-btn');
    const left = bar.querySelector('.panel-left');
    /* far left of the taskbar: before the social links, so the chat box (which lines up with this bar) opens at the left edge */
    if (left) left.prepend(f);
    else if (social) social.before(f);
    else if (mb) mb.before(f);
    else bar.insertBefore(f, bar.firstChild);
    searchForm = f; tbInput = f.querySelector('input');
    const sendB = f.querySelector('.taskbar-send');
    const sync = () => { sendB.disabled = !tbInput.value.trim(); };
    tbInput.addEventListener('input', sync);

    const openIt = () => { if (!isOpen() && !mqp.matches) toggle(true); };
    tbInput.addEventListener('focus', openIt);
    tbInput.addEventListener('click', openIt);
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      const q = tbInput.value.trim();
      tbInput.value = ''; sync();
      openIt();
      if (q) run(q);
    });
    tbInput.addEventListener('keydown', ev => {
      ev.stopPropagation();   // typing here must not trigger desktop shortcuts
      if (ev.key === 'Escape') { tbInput.value = ''; sync(); toggle(false); }
      else if (ev.key === 'ArrowUp') { if (hi > 0) tbInput.value = hist[--hi]; sync(); ev.preventDefault(); }
      else if (ev.key === 'ArrowDown') { tbInput.value = hi < hist.length - 1 ? hist[++hi] : (hi = hist.length, ''); sync(); ev.preventDefault(); }
      else if (ev.key === 'Tab') {
        const v = norm(tbInput.value); if (!v) return;
        const all = [...new Set(E.flatMap(e => e.cmd))].filter(c => c.startsWith(v));
        if (all.length) { ev.preventDefault(); tbInput.value = all[0]; sync(); }
      } else if (ev.key === 'l' && ev.ctrlKey) { ev.preventDefault(); clearChat(); }
    });
    new MutationObserver(() => f.classList.toggle('is-open', isOpen())).observe(root, { attributes: true, attributeFilter: ['class'] });
  };
  mountSearch();
  { let n = 0; const t = setInterval(() => { mountSearch(); if (document.getElementById('taskbar-ask') || ++n > 20) clearInterval(t); }, 500); }   // the taskbar may be built a moment later
  document.addEventListener('DOMContentLoaded', mountSearch);
  document.addEventListener('desktop:booted', mountSearch);
  addEventListener('load', mountSearch);

  /* optional hooks for other buttons */
  window.jptReset = () => {
    if (typer) typer.skip();
    out.innerHTML = ''; booted = false; hist.length = 0; hi = 0;
    input.value = ''; syncSend(); toggle(false);
  };
  window.jptOpen = () => toggle(true);
})();