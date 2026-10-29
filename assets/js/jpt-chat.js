/*!
 * jpt-chat.js — "JuPiter", a compact terminal-style guide for jpldeleon.github.io
 * Mission: get to know Jampol. Zero dependencies. No backend: answers come from the KNOWLEDGE BASE below.
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
   * - answers are third-person; pass an array of lines: '' = blank gap, '• text' = bullet, anything else = its own line
   * - answers support **bold**, [text](https://url), {{clickable command}}
   * Entries marked  // EDIT  are drafts in your voice — tweak them!
   * ─────────────────────────────────────────────────────────────── */
  const SITE = 'https://jpldeleon.github.io';
  const E = [];
  const add = (id, k, a, o = {}) =>
    E.push({ id, k, a: Array.isArray(a) ? a.join('\n') : a, w: o.w || 1, cmd: o.cmd || [id] });

  /* ---- core ---- */
  add('help', ['help', 'commands', 'menu', 'options', 'what can you do', 'what can i ask', 'what do you know', 'how does this work', 'how to use', 'topics', 'list topics'],
    [
      `Happy to help! Ask about Jampol in plain English, like "why should we hire you?", or tap a topic:`,
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
      `Hi there! 👋 I'm JuPiter, and my mission is to help you get to know **John Paul De Leon**, who goes by Jampol with his friends.`,
      ``,
      `{{about}} is a great place to start, or {{help}} shows everything I can talk about.`
    ],
    { cmd: ['hi', 'hello', 'hey'] });

  add('thanks', ['thanks', 'thank', 'salamat', 'cheers', 'appreciate', 'thank you', 'thx', 'ty', 'maraming salamat', 'much appreciated'],
    `You're so welcome! 😄 If you're still curious, Jampol's {{projects}} show his work in action, and the {{resume}} has the full story.`);

  add('bot', ['bot', 'chatbot', 'human', 'are you real', 'are you ai', 'are you a bot', 'powered by', 'your name', 'jupiter', 'who are you', 'what are you', 'are you chatgpt', 'are you gpt', 'are you a real person', 'is this ai', 'is this a bot', 'who made you', 'who built you', 'who created you', 'what is jupiter', 'who is jupiter'],
    `I'm JuPiter, Jampol's guide around this portfolio, and I'm neither an AI nor a person but a hand-built script that matches your words against what Jampol has shared about himself, so everything stays in your browser. If I ever miss the mark, {{help}} shows what I know, or you can {{contact}} Jampol directly.`,
    { w: 0.9, cmd: ['whoareyou', 'who are you', 'jupiter'] });

  add('nickname', ['nickname', 'nicknamed', 'what do friends call', 'call him', 'who is jampol', 'why jampol', 'what does jampol mean', 'jampol mean'],
    `**Jampol** is the name his friends use for John Paul De Leon (**JP** for short), so feel free to use whichever feels right. This guide goes by JuPiter, and its mission is simple: help you get to know Jampol, both the professional and the off-the-clock sides, starting with {{about}} or {{hobbies}}.`,
    { w: 3, cmd: ['jampol', 'nickname', 'jp'] });

  add('about', ['about', 'yourself', 'whoami', 'intro', 'introduce', 'summary', 'profile', 'who'],
    [
      `Meet **John Paul De Leon**, who goes by **Jampol**, a Technical SEO Specialist based in Metro Manila, PH.`,
      ``,
      `• **Experience:** about 5 years of link prospecting, backlink research and outreach at Intelligent.com LLC and Awisee`,
      `• **Training:** a full-stack web development bootcamp and a Technical SEO certification`,
      `• **Style:** curious, adaptable, detail-focused and research-driven, with a long-term commitment to SEO`,
      ``,
      `Explore his {{experience}}, {{skills}} and {{projects}}, or his off-duty side in {{hobbies}}.`
    ],
    { cmd: ['about', 'whoami', 'about me', 'summary'] });

  /* ---- experience ---- */
  add('experience', ['experience', 'work', 'career', 'history', 'jobs', 'employment', 'timeline', 'background', 'work history', 'employment history', 'previous jobs', 'past jobs', 'where has he worked', 'where did he work', 'companies', 'employers'],
    [
      `Jampol's career is built on research, starting in 2013:`,
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
      `At Awisee (remote, with a Stockholm team, January to May 2025), Jampol worked as an **SEO Outreach Specialist**.`,
      ``,
      `• Built and verified prospect lists that kept link-building campaigns running smoothly, cutting manual list-building time`,
      `• Cleaned and organized lead data so outreach reached higher-quality contacts`,
      `• Spotted ways to streamline the prospect-list workflow and proposed improvements to the team`
    ],
    { w: 2 });

  add('intelligent', ['intelligent', 'intelligent.com', 'prospecting', 'analyst', 'seattle', 'research analyst', 'link prospecting', 'contact research', 'data quality', 'email database', 'email databases', 'intelligent com', 'research role', 'link prospector', 'prospector', 'email research', 'contact finding', 'database errors', 'submitted files', 'recurring errors', 'accuracy of contact'],
    [
      `At Seattle-based Intelligent.com LLC (remote, November 2020 to September 2024), Jampol was a **Research Analyst for SEO Link Prospecting**.`,
      ``,
      `• Wrote the research specs that guided the US and outreach teams, clarifying them with team leaders to match campaign goals ({{research guide}})`,
      `• Built monthly prospect lists that met and sustained monthly and yearly outreach quotas`,
      `• Reviewed submitted files and investigated errors in the link and email databases, helping improve contact research accuracy`,
      `• Wrote a personal script to streamline his research workflow`,
      `• Was trusted to pilot link-prospecting strategy for new client accounts ({{pilot projects}})`
    ],
    { w: 1.5 });

  add('contactfinder', ['contact finder', 'finder', 'verification'],
    [
      `Before becoming an analyst, Jampol was a **Contact Finder** at Intelligent.com LLC (May to November 2020).`,
      ``,
      `• Researched and verified high-quality leads for link-building outreach`,
      `• Met daily and monthly quotas under tight deadlines`,
      `• Applied consistent qualification criteria that saved the team from wasting outreach on low-authority or irrelevant sites`,
      `• Shared research and verification techniques with colleagues`,
      ``,
      `That track record earned him a promotion to Research Analyst ({{intelligent.com}}).`
    ],
    { w: 2 });

  add('freelance', ['freelance', 'freelancer', 'consultant', 'upwork', 'golance', 'scraping', 'referral'],
    [
      `From January 2019 to May 2020, Jampol ran a referral-based practice as a **Research Consultant**.`,
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
      `Jampol's first big chapter ran from September 2013 to November 2018 at Straive (formerly SPi Global), on-site as a **Research Analyst (Web Researcher)**.`,
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
      `Jampol's toolkit blends search and code:`,
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
      `SEO is Jampol's home turf.`,
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
      `Jampol is interested in finding and troubleshooting technical SEO issues such as:`,
      ``,
      `• Broken links and missing metadata`,
      `• Indexing problems and crawlability`,
      `• Page speed and structured data`,
      ``,
      `He also likes exploring ideas for tools that could make that work easier, like {{auditkit}}. His wider SEO background is in {{seo}}.`
    ],
    { w: 2.5 });

  add('seo-trends', ['seo trends', 'seo news', 'industry updates', 'industry news', 'staying current', 'stay current', 'stay updated', 'keep up', 'trends', 'follow seo', 'latest in seo', 'google updates', 'algorithm updates', 'algorithm', 'newsletters', 'communities', 'forums', 'keep up with seo', 'up to date', 'how do you stay'],
    [
      `Jampol keeps up with SEO by following professionals, websites, forums and communities.`,
      ``,
      `Chances for independent experimentation have been limited, although he has tried a local WordPress setup ({{wordpress}}).`
    ],
    { w: 2.5 });

  add('wordpress', ['wordpress', 'wp', 'woocommerce', 'elementor', 'localwp', 'ecommerce', 'e-commerce', 'plugin', 'wordpress experience', 'wordpress skills', 'woocommerce experience', 'wordpress projects'],
    [
      `WordPress and WooCommerce are central to Jampol's builds.`,
      ``,
      `• Built and practiced on multiple LocalWP projects with Elementor, Rank Math, Yoast SEO and WPForms, plus theme customization`,
      `• {{badlands ink}} is his full WooCommerce build, with a product catalog, payments and optimization`,
      `• {{nothingtechblob}} pairs WordPress with technical and on-page SEO`
    ],
    { cmd: ['wordpress', 'woocommerce'] });

  add('ai', ['ai', 'prompt', 'ollama', 'workflows', 'context engineering', 'llms', 'chatgpt', 'ai skills', 'ai knowledge', 'ai proficiency', 'ai experience', 'ai automation', 'artificial intelligence', 'machine learning', 'llm', 'beginner in ai', 'ai expert', 'ai expertise', 'does he know ai', 'ai tools', 'ai level'],
    [
      `Jampol is a beginner in AI and is still learning its practical applications.`,
      ``,
      `• **Using now:** prompt and context engineering, and AI-assisted coding for his portfolio`,
      `• **Exploring:** LLM API integration and local models with Ollama`,
      `• **Learning next:** RAG, embeddings and semantic search, and AI agents`,
      `• **Interested in:** AI for SEO workflows, automation and useful tools, always AI-assisted and human-checked`,
      ``,
      `{{ai coding}} shows how he works with it day to day.`
    ],
    { w: 1.5, cmd: ['ai', 'ai workflows'] });

  add('q-aicoding', ['ai coding', 'ai-assisted', 'vibe coding', 'vibe', 'code review', 'ai assisted coding', 'how do you use ai', 'use ai', 'development', 'ai development', 'coding with ai', 'copilot', 'ai assistant', 'prompting', 'chatgpt for coding', 'use chatgpt', 'use claude', 'coding with chatgpt', 'coding with claude'],
    [
      `This is how Jampol works with AI when he builds:`,
      ``,
      `• Uses AI to help implement ideas, refine prompts and review code`,
      `• Tests every change in the browser and uses developer tools to investigate issues`,
      `• Fixes what he can himself, and asks AI for help when he is stuck`,
      ``,
      `For where he stands with AI overall, see {{ai}}.`
    ],
    { w: 3, cmd: ['ai coding', 'vibe coding'] });

  /* ---- hobbies & interests (mirrors the Hobbies & Interests applet) ---- */
  add('hobbies', ['hobbies', 'hobby', 'interests', 'interest', 'free time', 'for fun', 'off the clock', 'outside work', 'outside of work', 'passions', 'dotfiles', 'fun', 'leisure', 'pastimes', 'weekends', 'personal life', 'beyond work', 'personal side', 'personal interests'],
    [
      `Away from the keyboard, Jampol is into:`,
      ``,
      `• {{music}}: alternative, nu metal, emo, punk and metal`,
      `• {{gaming}}: Dota, CS, NBA 2K and more`,
      `• {{tech hobbies}}: Linux, Android, custom ROMs and local LLMs`,
      `• {{creative}}: photography, Lightroom and DaVinci Resolve`,
      `• {{adventures}}: motorcycles, bikes and hiking trails`,
      `• {{dogs}}: Bucky and Loki`,
      `• {{watchlist}}: sitcoms, Marvel and Ghibli`,
      `• Dreams: {{bucket list}}, {{dream careers}} and {{life goals}}`,
      ``,
      `For even more of him outside work, visit {{johnoffthewall}}.`
    ],
    { w: 1.5, cmd: ['hobbies', 'hobby', 'interests', 'dotfiles', 'off the clock'] });

  add('hob-tech', ['tech hobbies', 'linux', 'arch', 'android', 'custom rom', 'custom roms', 'rom', 'roms', 'firmware', 'hardware', 'foss', 'open source', 'open-source', 'desktop customization', 'ricing', 'tinkering', 'zsh', 'everforest'],
    [
      `Jampol's tech tinkering is basically a lifestyle.`,
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
    `Jampol's creative side shows up in photography, graphic design and video work, with Photoshop, Lightroom and DaVinci Resolve as his go-to tools.`,
    { w: 2, cmd: ['creative', 'photography'] });

  add('hob-adventures', ['adventures', 'adventure', 'travel', 'traveling', 'travelling', 'motorcycle', 'motorcycles', 'motorbike', 'cars', 'driving', 'cycling', 'bike', 'hiking', 'nature', 'food trip', 'food trips', 'trips'],
    [
      `Jampol is happiest when he is exploring.`,
      ``,
      `• Travel and food trips to taste the local cuisine`,
      `• Scenic rides on motorcycles, cars and bikes`,
      `• Hiking and nature`,
      ``,
      `Whatever is still unchecked lives on his {{bucket list}}.`
    ],
    { w: 1.5, cmd: ['adventures', 'travel'] });

  add('hob-gaming', ['gaming', 'games', 'game', 'gamer', 'dota', 'nba 2k', 'counter-strike', 'cs', 'pubg', 'call of duty', 'left 4 dead', 'need for speed', 'red alert', 'battle realms', 'mat online'],
    [
      `Jampol's gaming shelf mixes nostalgic classics, competitive shooters, strategy, sports and racing.`,
      ``,
      `• **In the rotation:** Dota 1, NBA 2K, MAT Online, Counter-Strike, Red Alert, Battle Realms, Call of Duty, PUBG, Left 4 Dead and Need for Speed`
    ],
    { w: 2, cmd: ['gaming', 'games'] });

  add('hob-music', ['music', 'listen', 'listening', 'songs', 'song', 'bands', 'band', 'artists', 'artist', 'playlist', 'favorite band', 'favourite band', 'linkin park', 'metallica', 'blink-182', 'blink', 'green day', 'my chemical romance', 'emo', 'punk', 'metal', 'nu metal', 'rock', 'genres', 'genre'],
    [
      `Jampol's playlist leans alternative, nu metal, emo, punk and metal.`,
      ``,
      `• **Often on repeat:** Linkin Park, Metallica, Saosin, blink-182, My Chemical Romance, Silverstein, Yellowcard, Guns N' Roses, The Used and Green Day`
    ],
    { w: 2, cmd: ['music'] });

  add('hob-dogs', ['dogs', 'dog', 'pets', 'pet', 'puppy', 'bucky', 'loki'],
    `Life is simply better with dogs around, and for Jampol that means Bucky and Loki, who bring the chaos, the cuddles and the company. 🐕`,
    { w: 2, cmd: ['dogs', 'dog'] });

  add('hob-watch', ['watchlist', 'watch', 'movies', 'movie', 'shows', 'tv', 'series', 'film', 'films', 'favorite movie', 'favourite movie', 'life of pi', 'ghibli', 'marvel', 'sitcom', 'sitcoms', 'the office', 'netflix'],
    [
      `Jampol's watchlist is rewatch-heavy.`,
      ``,
      `• **Sitcoms:** The Office, The Big Bang Theory, How I Met Your Mother, Brooklyn Nine-Nine, Friends, Modern Family and Young Sheldon`,
      `• **Also:** Marvel movies and series, and Studio Ghibli films`,
      `• **All-time favorite movie:** **Life of Pi**`
    ],
    { w: 2, cmd: ['watchlist', 'movies'] });

  add('hob-bucket', ['bucket list', 'bucketlist', 'bucket', 'skydiving', 'bikepacking', 'wingsuit', 'paragliding', 'hang gliding', 'snowboarding', 'skiing', 'surfing', 'longboarding', 'camping', 'solo camping', 'before you die'],
    [
      `Jampol's bucket list is full of adventure and open air.`,
      ``,
      `• **Up in the air:** skydiving, wingsuit flying, hang gliding, paragliding`,
      `• **Snow and water:** skiing, snowboarding, surfing`,
      `• **On the ground:** solo camping, bikepacking, downhill longboarding`
    ],
    { w: 2.5, cmd: ['bucket list', 'bucketlist'] });

  add('hob-career', ['dream job', 'dream jobs', 'dream career', 'dream careers', 'aspire', 'aspiring', 'data scientist', 'ai engineer', 'software developer', 'web developer', 'career path', 'where are you headed'],
    [
      `Jampol's dream careers all point toward search, development, data and AI.`,
      ``,
      `• SEO Specialist and Web Developer`,
      `• Software Developer, Data Scientist and AI Engineer`,
      ``,
      `Where he is headed: {{future goals}}. What he has built so far: {{projects}}.`
    ],
    { w: 2.5, cmd: ['dream careers', 'dream job'] });

  add('hob-life', ['life goals', 'personal goals', 'dream home', 'dream house', 'dream life', 'off-grid', 'off grid', 'dream car', 'dream cars', 'dream motorcycle', 'dream motorcycles', 'home by the sea', 'lifestyle'],
    [
      `Jampol's big-picture life goals are about freedom and nature.`,
      ``,
      `• A home by the sea, a lake or a river (or deep in nature)`,
      `• Off-grid living`,
      `• A few dream cars and dream motorcycles in the garage`
    ],
    { w: 2.5, cmd: ['life goals', 'personal goals'] });

  /* ---- projects & design story (from the JuPiter knowledge base) ---- */
  add('q-personal-projects', ['personal projects', 'side projects', 'side project', 'custom roms', 'what projects', 'hobby projects', 'things he built', 'what has he built', 'what did you build', 'android roms', 'linux distros', 'distros', 'distro'],
    [
      `Outside of work, Jampol tinkers and builds.`,
      ``,
      `• **Tinkering:** custom Android ROMs and Linux distributions`,
      `• **Builds:** SEO, web development and WordPress projects, all 7 in {{projects}}`,
      `• **Resume website:** this desktop, his proudest build ({{proudest project}})`
    ],
    { w: 2.5 });

  add('q-proudest', ['proudest project', 'resume website', 'this website', 'this site', 'this desktop', 'desktop environment', 'portfolio website', 'website', 'design', 'proudest work', 'favorite project', 'favourite project', 'best project', 'best work', 'showcase', 'chatbot', 'how was this site built', 'how was this built', 'how did you build this', 'who built this', 'built this site', 'this portfolio'],
    [
      `Jampol is especially proud of this resume website. It began as a Bootstrap theme and grew into a personalized Linux-inspired desktop with:`,
      ``,
      `• A dock and a top panel`,
      `• Widgets and applets`,
      `• Application windows and terminal-style interfaces`,
      `• A chatbot, which is me 🙂`,
      ``,
      `{{linux inspiration}} tells how it started.`
    ],
    { w: 3 });

  add('q-linux', ['linux inspiration', 'why linux', 'inspired by linux', 'linux design', 'desktop interface', 'windows 11', 'design inspiration', 'website design', 'desktop design', 'why this design', 'design choice', 'inspiration for the website', 'resource efficiency', 'lightweight', 'linux desktop', 'why a desktop', 'linux for the design', 'pick linux', 'picked linux', 'choose linux', 'chose linux', 'why did he pick linux', 'linux theme'],
    [
      `How the Linux-inspired design came about:`,
      ``,
      `• Jampol got interested in Linux after seeing how resource-efficient it is compared with Windows 11`,
      `• He wanted his portfolio to stand out`,
      `• So he challenged himself to build a desktop-like web experience through experimentation and AI-assisted coding ({{ai coding}})`
    ],
    { w: 3.5, cmd: ['linux inspiration'] });

  /* ---- education / certs ---- */
  add('education', ['education', 'school', 'degree', 'college', 'university', 'studied', 'study', 'graduate', 'ieti', 'diploma', 'schooling', 'alma mater', 'where did he study'],
    [
      `Jampol has two degrees:`,
      ``,
      `• **B.S. in Marine Engineering,** Philippine Merchant Marine School (2009 to 2013)`,
      `• **A.S. in Information & Communication Technology,** IETI (2006 to 2008)`,
      ``,
      `His web and SEO training is in {{certs}}.`
    ],
    { cmd: ['education', 'school'] });

  add('certs', ['certifications', 'certification', 'certificate', 'certs', 'bootcamp', 'udemy', 'sprint', 'courses', 'training', 'seo workout', 'gab valimento', 'credentials', 'certified', 'full-stack bootcamp', 'fullstack'],
    [
      `Jampol has two certifications to show:`,
      ``,
      `• **The Complete Full-Stack Web Development Bootcamp,** Udemy (2026), [view it](${SITE}/assets/img/certifications/cert-fullstack-bootcamp_F.webp)`,
      `• **Technical SEO and SEO Sprint,** SEO Workout by Gab Valimento (2025), [view it](${SITE}/assets/img/certifications/cert_techseosprint_F.webp)`
    ],
    { cmd: ['certs', 'certifications', 'certificates'] });

  /* ---- projects ---- */
  add('projects', ['projects', 'portfolio', 'built', 'build', 'apps', 'demos', 'samples', 'capstone'],
    [
      `Jampol has shipped **7 projects**:`,
      ``,
      `• **SEO + WordPress:** [Badlands Ink](${SITE}/badlands-ink/) ({{badlands ink}}) and [NothingTechBlob](${SITE}/nothingtechblob/) ({{nothingtechblob}})`,
      `• **API:** [AuditKit](${SITE}/auditkit/), his capstone ({{auditkit}})`,
      `• **Node.js, Express & EJS:** [PixelLog](${SITE}/pixellog/) ({{pixellog}}), [JamporuDEX](${SITE}/jamporudex/) with PostgreSQL ({{jamporudex}}) and [Route 196](${SITE}/route196/) ({{route196}})`,
      `• **HTML & CSS:** [John Off the Wall](${SITE}/johnoffthewall/), his capstone and personal site ({{johnoffthewall}})`
    ],
    { cmd: ['projects', 'portfolio', 'ls portfolio', 'ls ~/portfolio'] });

  add('auditkit', ['auditkit', 'audit kit'],
    `Wait for it: **AuditKit** is Jampol's API capstone project, and you can [take it for a spin here](${SITE}/auditkit/).`, { w: 3 });
  add('nothingtechblob', ['nothingtechblob', 'nothing tech blob', 'blob'],
    `**NothingTechBlob** is where Jampol pairs technical and on-page SEO with WordPress development, and you can [see it live here](${SITE}/nothingtechblob/).`, { w: 3 });
  add('badlands', ['badlands', 'badlands ink', 'ink', 'tattoo'],
    `**Badlands Ink** is Jampol's playground for technical, local and e-commerce SEO with WordPress and WooCommerce, from the product catalog and payments to optimization, and you can [explore it here](${SITE}/badlands-ink/).`,
    { w: 3, cmd: ['badlands ink', 'badlands'] });
  add('pixellog', ['pixellog', 'pixel log'],
    `**PixelLog** is a Node.js, Express.js and EJS capstone from Jampol, and you can [check it out here](${SITE}/pixellog/).`, { w: 3 });
  add('jamporudex', ['jamporudex', 'jamporu', 'dex'],
    `**JamporuDEX** is Jampol's Node.js, Express, PostgreSQL and EJS capstone, and you can [check it out here](${SITE}/jamporudex/).`, { w: 3 });
  add('route196', ['route196', 'route 196', '196'],
    `**Route 196** is another Node.js, Express.js and EJS capstone from Jampol, and you can [check it out here](${SITE}/route196/).`, { w: 3 });

  add('johnoffthewall', ['johnoffthewall', 'john off the wall', 'off the wall', 'jotw', 'offthewall'],
    [
      `**John Off the Wall** ("Me, off the wall.") is Jampol's personal corner of the web and his HTML and CSS capstone, the best place to get to know him outside of work.`,
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
      `Want to chat with Jampol? He is based in Metro Manila, Philippines.`,
      ``,
      `• **Best way:** [LinkedIn](https://www.linkedin.com/in/jpldl/)`,
      `• **Work:** [GitHub](https://github.com/jpldeleon), [Upwork](https://www.upwork.com/freelancers/~01562764cad5d47331) and [GoLance](https://golance.com/freelancer/john.paul.leonard.de.leon)`,
      `• **Email and phone:** in the Resume section of the site, or on his {{resume}}`
    ],
    { cmd: ['contact', 'socials', 'email', 'linkedin', 'github'] });

  add('resume', ['resume', 'cv', 'download', 'pdf', 'curriculum vitae', 'download resume', 'resume pdf', 'cv pdf', 'get the resume', 'see resume', 'full resume'],
    `Here is Jampol's full CV, ready to grab: [johnpauldeleon_resume.pdf](${SITE}/assets/johnpauldeleon_resume.pdf).`,
    { cmd: ['resume', 'cv', 'cat resume', 'download cv'] });

  /* ---- interview questions ---- */
  add('interview', ['interview', 'questions', 'faq'],
    [
      `Put Jampol in the hot seat with the classics:`,
      ``,
      `• **About him:** {{tell me about yourself}}, {{why seo?}}, {{what are your strengths?}}, {{what is your weakness?}}, {{why should we hire you?}}, {{biggest achievement?}}, {{what motivates you?}}`,
      `• **How he works:** {{how do you handle pressure?}}, {{how do you prioritize?}}, {{how do you work in a team?}}, {{do you prefer working independently?}}, {{how do you handle feedback?}}, {{how do you handle mistakes?}}, {{how do you solve problems?}}, {{how do you learn new things?}}`,
      `• **The practical stuff:** {{how is your english?}}, {{tell me about your career gap}}, {{why are you looking for a new role?}}, {{where do you see yourself in 5 years?}}, {{salary expectations?}}, {{remote or on-site?}}`
    ],
    { cmd: ['interview', 'faq', 'questions'] });

  add('q-self', ['tell me about yourself', 'walk me through your resume', 'introduce yourself', 'describe yourself', 'professional background', 'your background', 'his background', 'background', 'introduction', 'tell me about him', 'tell me about jampol', 'overview', 'bio', 'about him', 'elevator pitch'],
    [
      `In short, Jampol is a curious, adaptable professional who moved from research into technical SEO.`,
      ``,
      `• **Where he started:** research analysis, SEO link prospecting and outreach, with workflow improvement and project piloting along the way`,
      `• **What he added:** a full-stack bootcamp and a Technical SEO certification`,
      `• **What drives him:** solving problems, learning independently and improving processes`,
      ``,
      `Details: {{experience}} and {{projects}}.`
    ],
    { w: 2.5 });

  add('q-why-seo', ['why seo', 'why do you like seo', 'why this field', 'why this career', 'why do you do seo', 'why did you choose seo', 'what do you like about seo', 'why are you into seo', 'why work in seo', 'why seo specialist'],
    [
      `For Jampol, SEO is where research, data and building things meet.`,
      ``,
      `• He started in link prospecting and got hooked on seeing which numbers actually move results`,
      `• That curiosity led him into technical SEO and web development`,
      ``,
      `He is in it for the long run, not as a stepping stone ({{future goals}}).`
    ],
    { w: 2.5 });

  add('q-motivation', ['motivation', 'motivated', 'motivates', 'passion', 'inspiration', 'job satisfaction', 'what drives you', 'drives you', 'inspires you', 'what drives', 'what inspires', 'what excites', 'what keeps you going', 'what makes you tick', 'what do you enjoy'],
    [
      `What motivates Jampol:`,
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
      `Jampol's biggest strengths:`,
      ``,
      `• **Research-driven and detail-focused:** qualifies sites and contacts against consistent criteria so outreach is never wasted`,
      `• **Troubleshooting:** digs into databases, code and data until he finds the cause ({{problem solving}})`,
      `• **Automation mindset:** his Excel macro and a personal research script ({{excel macro}})`,
      `• **Reliable:** meets quotas consistently and is trusted to pilot new accounts ({{pilot projects}})`
    ],
    { w: 2.5 });

  add('q-weakness', ['weakness', 'weaknesses', 'improve', 'improvement', 'areas for improvement', 'worst at', 'greatest weakness', 'time management', 'challenges', 'biggest weakness', 'flaws', 'shortcomings', 'needs improvement', 'areas to improve', 'weak points'],
    [
      `Jampol is candid about where he is still growing:`,
      ``,
      `• **Time management:** his curiosity keeps sparking new ideas and experiments, so he handles responsibilities and deadlines first and explores later`,
      `• **Newer skills:** hands-on technical SEO is the newest part of his toolkit, built through {{badlands ink}}, {{nothingtechblob}} and {{auditkit}}`,
      `• **Continuous learning:** SEO, web development and AI keep changing ({{learning style}})`
    ],
    { w: 2.5 });

  add('q-hire', ['hire you', 'why you', 'why should we hire', 'why hire', 'what makes you different', 'stand out', 'what can you bring', 'add value', 'value', 'what he offers', 'what does he offer', 'candidate strengths', 'employer value', 'candidate', 'why hire him', 'why hire jampol', 'why should i hire', 'why choose', 'why pick', 'selling point', 'what sets you apart', 'competitive advantage'],
    [
      `What Jampol brings to a team:`,
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
      `Jampol's proudest professional moments:`,
      ``,
      `• **Lean Six Sigma Award** for his Excel macro ({{excel macro}})`,
      `• **Promotion** from Contact Finder to Research Analyst ({{contact finder}})`,
      `• **Trusted to pilot** link-prospecting strategy for new client accounts ({{pilot projects}})`
    ],
    { w: 2.5 });

  add('q-macro', ['excel macro', 'macro', 'macros', 'repetitive tasks', 'repetitive work', 'process improvement', 'improve processes', 'workflow improvement', 'automation', 'automate', 'automated', 'lean six sigma', 'six sigma', 'lean', 'excel', 'vba', 'spreadsheet', 'streamline', 'repetitive'],
    [
      `At Straive, Jampol developed an Excel macro to streamline complex, repetitive tasks and help prevent recurring errors.`,
      ``,
      `• It received a **Lean Six Sigma award**`,
      `• It helped improve his account's standing, an account that had often faced cost-cutting`,
      `• That progress supported opportunities to serve additional clients`,
      ``,
      `More from Straive: {{straive}}.`
    ],
    { w: 4, cmd: ['process improvement', 'excel macro'] });

  add('q-guide', ['research guide', 'specification guide', 'spec guide', 'research specs', 'research specification', 'accuracy', 'collaborated', 'collaboration guide', 'teamwork guide', 'specs', 'guideline', 'guidelines', 'documentation', 'playbook'],
    [
      `Jampol collaborated on a research specification guide for contact-finding and marketing teams.`,
      ``,
      `• It aimed to reduce errors when identifying relevant contacts and doing outreach`,
      `• It also made the work more consistent`,
      ``,
      `It came from his time at {{intelligent.com}}.`
    ],
    { w: 3, cmd: ['research guide'] });

  add('q-pressure', ['pressure', 'deadline', 'deadlines', 'stress', 'stressful', 'quota', 'quotas', 'tight', 'deadline risk', 'ask for help', 'asking for help', 'miss a deadline', 'at risk', 'under pressure', 'tight deadline', 'overwhelmed', 'crunch', 'time pressure', 'work under pressure', 'meet deadlines', 'meeting deadlines'],
    [
      `Pressure is familiar territory for Jampol:`,
      ``,
      `• Has met daily and monthly quotas in every role`,
      `• Communicates early if a deadline is at risk, and asks for help when needed`,
      `• In urgent periods, focuses on priority tasks and saves workflow experiments for later`,
      `• At Straive, supported another team through a critical deadline ({{leadership}})`
    ],
    { w: 2.5 });

  add('q-priorities', ['priorities', 'prioritize', 'prioritise', 'prioritization', 'workload', 'urgent', 'competing', 'multitask', 'multitasking', 'multiple tasks', 'multiple projects', 'juggle', 'manage time', 'manage priorities', 'too many tasks', 'task management'],
    [
      `How Jampol sets priorities:`,
      ``,
      `• Weighs urgency and business needs`,
      `• Makes sure his existing responsibilities are not neglected`,
      `• Handles the highest-priority work first, then moves on to the rest`
    ],
    { w: 2.5 });

  add('q-mistakes', ['mistake', 'mistakes', 'error', 'errors', 'accountability', 'lessons learned', 'fail', 'failure', 'messed up', 'make a mistake', 'made a mistake', 'handle mistakes', 'own up', 'take responsibility'],
    [
      `When something goes wrong, Jampol:`,
      ``,
      `• Investigates the cause`,
      `• Informs the people affected and fixes the issue`,
      `• Looks for ways to keep it from happening again`,
      ``,
      `He values accountability and sharing lessons so the team can improve.`
    ],
    { w: 2.5 });

  add('q-team', ['team', 'teamwork', 'collaborate', 'collaboration', 'colleagues', 'conflict', 'manager', 'teammate', 'teammates', 'reliability', 'reliable', 'team contribution', 'work in a team', 'team player', 'get along', 'coworkers', 'co-workers', 'working with others', 'team environment'],
    [
      `Teammates can expect Jampol to be curious, adaptable and helpful, with ideas to contribute.`,
      ``,
      `• Clarifies specs with team leaders first so research lines up with campaign goals`,
      `• Shares the verification and research tricks he discovers`,
      `• Welcomes discussion about practical improvements ({{research guide}} is an example)`,
      ``,
      `He also enjoys independent work ({{work style}}).`
    ],
    { w: 1.2 });

  add('q-workstyle', ['work style', 'working style', 'independent', 'independently', 'working alone', 'work alone', 'solo', 'alone', 'independent worker', 'self-directed', 'self directed', 'work on his own', 'on your own', 'solo work', 'prefer to work alone', 'alone or team'],
    [
      `Jampol's work style has two sides:`,
      ``,
      `• **Independent:** it gives him room to think creatively, experiment and take responsibility for his work`,
      `• **Collaborative:** just as valuable for sharing knowledge, coordinating tasks and building better solutions together ({{teamwork}})`
    ],
    { w: 2.5 });

  add('q-leadership', ['leadership', 'delegation', 'delegate', 'team management', 'lead a team', 'led a team', 'manage a team', 'lead others', 'led others', 'leader', 'lead people', 'supervise', 'team lead', 'mentoring', 'mentor', 'train others', 'training others'],
    [
      `Jampol's leadership experience comes from Straive:`,
      ``,
      `• Temporarily supported an additional team during a sudden deadline, while keeping up with his own responsibilities`,
      `• Shared his techniques and assigned tasks to streamline the work and improve efficiency`,
      `• Also piloted and onboarded new projects ({{pilot projects}})`
    ],
    { w: 2.5, cmd: ['leadership'] });

  add('q-initiative', ['initiative', 'pilot', 'pilots', 'pilot projects', 'implementation', 'new accounts', 'take ownership', 'take initiative', 'proactive', 'self starter', 'self-starter', 'above and beyond', 'project pilot', 'pilot a project', 'rollout', 'acquired'],
    [
      `Jampol has helped pilot projects at Straive and Intelligent.com:`,
      ``,
      `• Researching requirements`,
      `• Developing and testing workflows, then refining the process`,
      `• Training others and supporting implementation`,
      ``,
      `Several of the projects he helped pilot were eventually acquired.`
    ],
    { w: 2.5 });

  add('q-feedback', ['feedback', 'criticism', 'suggestions', 'disagreement', 'disagreements', 'disagree', 'critique', 'constructive', 'receive feedback', 'take feedback', 'handle criticism', 'constructive criticism', 'negative feedback', 'pushback', 'push back'],
    [
      `When he gets feedback, Jampol:`,
      ``,
      `• Evaluates it and asks questions to clarify the suggestion`,
      `• Experiments where it makes sense`,
      `• Explains his reasoning, then aims to align with others or blend ideas into a better solution`
    ],
    { w: 2.5 });

  add('q-gap', ['gap', 'career gap', 'since 2024', 'recent', 'doing now', 'currently', 'right now', 'lately', 'employment gap', 'gap in your resume', 'resume gap', 'what have you been doing', 'time off', 'unemployed', 'between jobs'], // EDIT
    [
      `Since May 2025, Jampol has been deliberately upskilling:`,
      ``,
      `• The Complete Full-Stack Web Development Bootcamp and the Technical SEO and SEO Sprint certification ({{certs}})`,
      `• Seven shipped projects across WordPress, WooCommerce, Node.js, Express and PostgreSQL ({{projects}})`,
      `• AI-assisted workflows and local LLMs with Ollama ({{ai}})`
    ],
    { w: 2 });

  add('q-leave', ['why leave', 'looking for', 'new role', 'new job', 'why are you looking', 'why did you leave', 'leaving', 'left', 'reason for leaving', 'why are you leaving', 'new opportunity', 'job search', 'looking for work', 'seeking'], // EDIT
    [
      `Jampol is looking for a role that uses both sides of his profile:`,
      ``,
      `• His SEO research experience`,
      `• The technical skills he has built since`,
      ``,
      `Ideally it is a technical SEO role where diagnosing and fixing site issues is part of the job.`
    ],
    { w: 2.5 });

  add('q-future', ['5 years', 'five years', 'future', 'goals', 'career goals', 'long term', 'long-term', 'ambition', 'grow', 'three year', '3 years', 'three years', 'career growth', 'seo and ai', 'three-year plan', 'five-year plan', 'three-year', 'five-year', '3-year', '5-year', '5 year plan', 'five year plan', 'in five years', 'in 5 years', 'career plan', 'long term goals', 'future plans', 'what s next', 'where do you see yourself'],
    [
      `Where Jampol wants to go:`,
      ``,
      `• Become a well-rounded SEO specialist and deepen his expertise`,
      `• Take on more responsibility and build useful tools`,
      `• Find practical ways to bring AI into workflows`,
      `• Pair his research and SEO background with stronger technical skills`,
      ``,
      `He sees web development and AI as complementary to SEO.`
    ],
    { w: 1.5 });

  add('q-salary', ['salary', 'pay', 'compensation', 'rate', 'rates', 'expected', 'expectations', 'budget', 'how much', 'salary expectation', 'expected salary', 'pay expectations', 'how much do you want', 'compensation expectations', 'asking rate', 'hourly rate'], // EDIT
    `Jampol is open to talking numbers based on the scope of the role and the market, and a chat on [LinkedIn](https://www.linkedin.com/in/jpldl/) is the best way to find something fair for both sides.`,
    { w: 1.5 });

  add('q-remote', ['remote', 'on-site', 'onsite', 'office', 'hybrid', 'wfh', 'timezone', 'time zone', 'availability', 'available', 'start', 'flexibility', 'flexible', 'work culture', 'preferred environment', 'work environment', 'work from home', 'work remotely', 'remote work', 'prefer remote', 'in office', 'on site', 'work setup', 'notice period', 'when can you start', 'when can he start', 'start date'],
    [
      `Jampol thrives in flexible, independent setups.`,
      ``,
      `• **Prefers:** remote work, flexible hours, room to work independently and freedom to experiment, with teamwork when needed`,
      `• **Remote record:** Intelligent.com (Seattle) and Awisee (Stockholm), both fully remote with international teams`,
      `• **On-site:** Straive`,
      `• **Availability and start date:** message him on [LinkedIn](https://www.linkedin.com/in/jpldl/)`
    ],
    { w: 1.5 });

  add('q-problem', ['solve problems', 'problem solving', 'problem-solving', 'troubleshoot', 'troubleshooting', 'debug', 'stuck', 'approach', 'root cause', 'solutions', 'solve a problem', 'problem solver', 'fix problems', 'diagnose', 'find the cause', 'troubleshooter'],
    [
      `Jampol looks for the root cause before treating symptoms:`,
      ``,
      `• Investigates what went wrong`,
      `• Tests possible solutions and explores alternatives`,
      `• Looks for ways to prevent it from recurring`,
      ``,
      `That is how he handled the link and email databases at Intelligent.com, and why he builds scripts to remove repetitive steps.`
    ],
    { w: 2 });

  add('q-learn', ['learn', 'learning', 'new things', 'upskill', 'upskilling', 'self-learning', 'self learning', 'learning style', 'experimentation', 'research', 'learn new things', 'learn quickly', 'quick learner', 'self taught', 'self-taught', 'pick up new'],
    [
      `Jampol learns by combining:`,
      ``,
      `• Online research`,
      `• Hands-on experimentation`,
      `• Troubleshooting`,
      ``,
      `When a subject interests him, he explores it well beyond what work requires. It took him from bootcamp to capstone projects and now into AI-assisted workflows.`
    ],
    { w: 1.2 });

  add('q-curiosity', ['curiosity', 'curious', 'tinkering', 'how things work', 'what are you curious about', 'curious about', 'what interests', 'what are you interested in', 'love learning', 'experimenting'],
    [
      `Jampol enjoys reading, researching, experimenting and understanding how things work.`,
      ``,
      `His curiosity runs through technology, Linux, open-source software, web development, AI, photography and creative projects. More in {{hobbies}}.`
    ],
    { w: 2.5 });

  add('q-adapt', ['adaptability', 'adapt', 'adaptable', 'unfamiliar', 'new tools', 'new clients', 'new projects', 'adapt to change', 'new environment', 'new industry', 'quick to adapt', 'handle change', 'new process'],
    [
      `When a project or client is new, Jampol:`,
      ``,
      `• Researches the subject and understands what the client needs`,
      `• Tests workflows and refines his approach through experimentation`,
      `• Mixes independent investigation with collaboration when it helps`
    ],
    { w: 2.5 });

  add('q-values', ['values', 'what do you value', 'what does he value', 'what he values', 'jampol value', 'jampol values', 'jampol s values', 'does he value', 'work ethic', 'principles', 'professional values', 'ownership', 'core values', 'what matters', 'philosophy', 'work philosophy'],
    [
      `What Jampol values:`,
      ``,
      `• Continuous learning`,
      `• Problem-solving and practical results`,
      `• Independent ownership, with teamwork when needed`,
      `• The freedom to experiment and find better ways of doing things`
    ],
    { w: 2.5 });

  add('q-challenges', ['favorite challenges', 'favourite challenges', 'difficult problems', 'difficult problem', 'technical issues', 'research challenges', 'hardest problem', 'enjoy solving', 'workflow', 'challenge', 'enjoy most', 'favorite part', 'favourite part', 'tough problems', 'complex problems', 'challenging tasks'],
    [
      `Jampol enjoys:`,
      ``,
      `• Solving technical issues`,
      `• Improving repetitive workflows`,
      `• Answering difficult research questions`,
      `• Building tools`,
      ``,
      `At Intelligent.com, his Research Manager and a higher-level Project Manager regularly talked through problems and workflow improvements with him and trusted his input.`
    ],
    { w: 2.5 });

  add('q-english', ['english', 'fluency', 'communication', 'speaking', 'confidence', 'english proficiency', 'speak english', 'communicate', 'english skills', 'english level', 'speak english well', 'language skills', 'spoken english', 'communication skills', 'nervous speaking', 'english fluency'],
    [
      `Jampol may feel a little nervous at first when speaking English in professional conversations.`,
      ``,
      `He gets more comfortable as the conversation goes on, and keeps building his fluency and confidence through practice and experience.`
    ],
    { w: 3 });

  /* ---- easter eggs (cmd only) ---- */
  add('sudo', [], `Nice try! 😄 guest isn't in the sudoers file, and this incident will be reported.`, { cmd: ['sudo', 'sudo su', 'sudo hire jp'] });
  add('rm', [], `Whoa there! Permission denied: removing '/' isn't allowed, which is lucky, because that is the entire portfolio.`, { cmd: ['rm -rf /', 'rm -rf', 'rm -rf /*'] });
  add('neofetch', [],
    `**guest@jp-portfolio** is running Arch Linux x86_64 with zsh 5.9 and the Everforest theme, and it belongs to a Technical SEO Specialist who works in HTML, CSS, JS, Node and PostgreSQL and has 7 projects and 2 certifications to his name.`,
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

  /* ───────────────────────── UI ───────────────────────── */
  const ICON = (() => {
    try { const src = document.currentScript && document.currentScript.src; if (src) return new URL('../img/astrobot.svg', src).href; } catch (e) {}
    return 'assets/img/astrobot.svg';
  })();

  const css = `
.jpt{--bg:var(--background-color,#2d353b);--bg2:color-mix(in srgb,var(--bg) 80%,#000);--bg2t:color-mix(in srgb,var(--bg2) 55%,transparent);--fg:var(--default-color,#d3c6aa);--bd:color-mix(in srgb,var(--fg) 20%,var(--bg));--dim:color-mix(in srgb,var(--fg) 58%,var(--bg));--g:var(--accent-highlight,#a7c080);--a:var(--accent-color,#83c092);--y:var(--heading-color,#dbbc7f);--b:var(--typed-color,#7fbbb3);--r:var(--cmd-red,#e67e80);--hot:var(--heading-color,#dbbc7f);--sz:60px;--ico:46px;--jpt-w:340px;--jpt-h:420px;
 font:12.5px/1.5 "JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--fg);position:fixed;right:16px;bottom:calc(16px + var(--jpt-kb,0px));z-index:2147483000;transition:opacity .6s ease}
.jpt *{box-sizing:border-box}
/* hidden until the desktop has finished booting and its layout has settled */
.jpt.jpt-hold{opacity:0;visibility:hidden;pointer-events:none;transition:none}
.jpt-svg{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}

/* launcher: the tinted astrobot. Hover / tap / open = warmer tint + a soft halo (no scaling, so it stays sharp) */
.jpt-fab{position:relative;display:block;width:var(--sz);height:var(--sz);background:none;border:0;border-radius:50%;padding:0;color:var(--fg);cursor:pointer;-webkit-tap-highlight-color:transparent}
.jpt-fab:focus-visible{outline:2px solid var(--g);outline-offset:0}
.jpt-fab:before{content:"";position:absolute;inset:calc(var(--sz) * .18);border-radius:50%;pointer-events:none;opacity:0;transform:scale(.82);transition:opacity .22s ease,transform .22s ease;background:radial-gradient(circle,color-mix(in srgb,var(--hot) 34%,transparent) 0,color-mix(in srgb,var(--hot) 12%,transparent) 58%,transparent 74%);box-shadow:0 0 12px 3px color-mix(in srgb,var(--hot) 42%,transparent),0 0 28px 8px color-mix(in srgb,var(--hot) 20%,transparent)}
.jpt-ico{display:block;object-fit:contain;filter:url(#jpt-tint);user-select:none;-webkit-user-drag:none}
.jpt.open .jpt-fab:before,.jpt-fab:active:before,.jpt-fab:focus-visible:before{opacity:1;transform:none}
.jpt.open .jpt-stage .jpt-ico,.jpt-fab:active .jpt-stage .jpt-ico,.jpt-fab:focus-visible .jpt-stage .jpt-ico{filter:url(#jpt-tint-hot) drop-shadow(0 0 2px var(--hot)) drop-shadow(0 0 7px var(--hot))}
@media (hover:hover){
.jpt-fab:hover:before{opacity:1;transform:none}
.jpt-fab:hover .jpt-stage .jpt-ico{filter:url(#jpt-tint-hot) drop-shadow(0 0 2px var(--hot)) drop-shadow(0 0 7px var(--hot))}
}
/* floating: the launcher bobs gently (stops while the window is open) */
.jpt-fab{animation:jpt-float 4.6s ease-in-out infinite}
.jpt.open .jpt-fab{animation:none}
@keyframes jpt-float{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--sz) * -.12))}}
/* first appearance: starts tiny and far away, then grows into place with a soft overshoot */
.jpt.jpt-arrive{animation:jpt-arrive 1.8s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes jpt-arrive{from{transform:scale(.04);opacity:0}to{transform:none;opacity:1}}
.jpt-stage{display:block;position:relative;width:var(--sz);height:var(--sz);flex:none;perspective:calc(var(--sz) * 1.8);transform-style:preserve-3d}
.jpt-stage .jpt-ico{position:absolute;left:50%;top:50%;width:var(--ico);height:var(--ico);transform:translate(-50%,-50%)}
.jpt-noimg .jpt-ico{display:none}
.jpt-noimg .jpt-stage:before{content:">_";position:absolute;inset:0;display:grid;place-items:center;color:var(--g);font-weight:700}

/* window: borderless, translucent, shadow only. It opens flush against the launcher, up or down, left or right
   (data-v / data-h are set from the space available) and is resized from its free corner. */
.jpt-win{position:absolute;right:0;bottom:100%;width:min(var(--jpt-w),var(--jpt-maxw,calc(100vw - 32px)));height:min(var(--jpt-h),var(--jpt-maxh,calc(var(--jpt-vh,100vh) - 110px)));display:none;flex-direction:column;background:var(--bg);background:color-mix(in srgb,var(--bg) 72%,transparent);-webkit-backdrop-filter:blur(10px) saturate(1.2);backdrop-filter:blur(10px) saturate(1.2);border:0;border-radius:8px;box-shadow:0 14px 36px rgba(0,0,0,.5),0 3px 10px rgba(0,0,0,.3);overflow:hidden}
.jpt[data-v=down] .jpt-win{bottom:auto;top:100%}
.jpt[data-h=r] .jpt-win{right:auto;left:0}
.jpt.open .jpt-win{display:flex;animation:jpt-in .12s ease-out}
.jpt.rs-on .jpt-win{user-select:none;-webkit-user-select:none}
@keyframes jpt-in{from{opacity:0}to{opacity:1}}
.jpt-bar{display:flex;align-items:center;gap:6px;padding:0 4px 0 10px;flex:none}
.jpt-bar .jpt-ico{width:14px;height:14px;flex:none}
.jpt-bar b{flex:1;min-width:0;font-weight:500;color:var(--dim);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jpt-ib{background:none;border:0;padding:0;color:var(--dim);width:26px;height:26px;display:grid;place-items:center;border-radius:4px;cursor:pointer;flex:none}
.jpt-ib svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.jpt-ib:hover,.jpt-ib:focus-visible{color:var(--g);outline:none}
.jpt-x:hover,.jpt-x:focus-visible{color:var(--r)}
.jpt-out{flex:1;min-height:0;overflow-y:auto;padding:0 12px;overscroll-behavior:contain}
.jpt-out::-webkit-scrollbar{width:4px}.jpt-out::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px}
.jpt-ln{margin:0;padding:3px 0;overflow-wrap:anywhere}
.jpt-out>.jpt-ln:first-child{padding-top:0}
.jpt-out>.jpt-ln:last-child{padding-bottom:0}
.jpt-ln.u{color:var(--a)}.jpt-ln.u:before{content:"$ ";color:var(--g)}
.jpt-ln.s{color:var(--dim)}
.jpt-ln b{color:var(--y);font-weight:600}
.jpt-li{display:block;padding-left:2ch;text-indent:-2ch;margin:2px 0}
.jpt-gap{display:block;height:6px}
.jpt-ln code{color:var(--b);background:var(--bg2t);padding:0 4px;border-radius:3px}
.jpt-ln a{color:var(--b);text-decoration:underline;text-underline-offset:2px}
.jpt-cmd{font:inherit;color:var(--g);background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:left;text-decoration:underline dotted;text-underline-offset:3px}
.jpt-cmd:hover,.jpt-cmd:focus-visible{text-decoration-style:solid;outline:none}
.jpt-chips{display:flex;gap:14px;padding:4px 12px 0;overflow-x:auto;scrollbar-width:none;flex:none}
.jpt-chips::-webkit-scrollbar{display:none}
.jpt-chips .jpt-cmd{white-space:nowrap;flex:none;color:var(--dim);text-decoration:none}
.jpt-chips .jpt-cmd:hover,.jpt-chips .jpt-cmd:focus-visible{color:var(--g)}
.jpt-in{display:flex;gap:8px;align-items:center;padding:0 4px 0 12px;flex:none}
.jpt-in>span{color:var(--g)}
.jpt-in input{flex:1;min-width:0;height:34px;background:none;border:0;outline:0;color:var(--fg);font:inherit;caret-color:var(--g)}
.jpt-in input::placeholder{color:var(--dim)}
.jpt-send:not(:disabled){color:var(--g)}
.jpt-send:disabled{opacity:.4;cursor:default}
.jpt-caret{display:inline-block;width:.55em;height:1.05em;margin-left:1px;vertical-align:text-bottom;background:var(--g);animation:jpt-blink 1s steps(1) infinite}
@keyframes jpt-blink{50%{opacity:0}}
.jpt-dots:after{content:"";animation:jpt-d 1s steps(4) infinite}
@keyframes jpt-d{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}

/* resize grip: sits on the window's free corner (the one away from the launcher) */
.jpt-rs{position:absolute;z-index:4;display:block;width:22px;height:22px;top:0;left:0;cursor:nwse-resize;touch-action:none}
.jpt-rs:after{content:"";position:absolute;top:5px;left:5px;width:8px;height:8px;border:0 solid var(--dim);border-top-width:2px;border-left-width:2px;border-top-left-radius:3px;opacity:.45;transition:opacity .15s,border-color .15s}
.jpt-rs:hover:after,.jpt.rs-on .jpt-rs:after{opacity:1;border-color:var(--g)}
.jpt[data-h=r] .jpt-rs{left:auto;right:0;cursor:nesw-resize}
.jpt[data-h=r] .jpt-rs:after{left:auto;right:5px;border-left-width:0;border-right-width:2px;border-top-left-radius:0;border-top-right-radius:3px}
.jpt[data-v=down] .jpt-rs{top:auto;bottom:0;cursor:nesw-resize}
.jpt[data-v=down] .jpt-rs:after{top:auto;bottom:5px;border-top-width:0;border-bottom-width:2px;border-top-left-radius:0;border-bottom-left-radius:3px}
.jpt[data-h=r][data-v=down] .jpt-rs{cursor:nwse-resize}
.jpt[data-h=r][data-v=down] .jpt-rs:after{border-left-width:0;border-right-width:2px;border-bottom-left-radius:0;border-bottom-right-radius:3px}
.jpt[data-h=r][data-v=up] .jpt-bar{padding-right:22px}
.jpt[data-h=r][data-v=down] .jpt-in{padding-right:22px}

@media (max-width:480px){.jpt{right:10px;bottom:calc(10px + var(--jpt-kb,0px));--jpt-w:320px;--jpt-h:360px}.jpt-in input{font-size:16px}.jpt-ib{width:32px;height:32px}}
@media (pointer:coarse){.jpt-rs{width:32px;height:32px}.jpt-rs:after{top:8px;left:8px}.jpt[data-h=r] .jpt-rs:after{right:8px}.jpt[data-v=down] .jpt-rs:after{bottom:8px}}
@media (prefers-reduced-motion:reduce){.jpt{transition:none!important}.jpt *{scroll-behavior:auto!important}.jpt-win,.jpt-dots:after,.jpt-caret{animation:none!important}.jpt-fab,.jpt.jpt-arrive{animation:none!important}.jpt-fab:before{transition:none}}
`;


  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* line layout: '• ' lines become hanging-indent bullets, blank lines become a small gap, other lines break with <br> */
  const layout = (a, l) => {
    const t = !l.trim() ? 'g' : /^•\s/.test(l) ? 'li' : 'p';
    const h = t === 'g' ? '<span class="jpt-gap"></span>' : t === 'li' ? '<span class="jpt-li">' + l + '</span>' : l;
    return { out: a.out + (t === 'p' && a.prev === 'p' ? '<br>' : '') + h, prev: t };
  };
  const fmt = s => esc(s)
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\{\{([^}]+)\}\}/g, '<button type="button" class="jpt-cmd" data-q="$1">$1</button>')
    .split('\n').reduce(layout, { out: '', prev: '' }).out;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'jpt jpt-hold';           // stays hidden until the desktop has loaded (see "reveal" below)
  root.dataset.h = 'l';                       // l = window grows leftwards, r = rightwards
  root.dataset.v = 'up';                      // up = window grows upwards, down = downwards
  root.innerHTML = `
    <svg class="jpt-svg" aria-hidden="true" focusable="false" width="0" height="0">
      <filter id="jpt-tint" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
        <feFlood id="jpt-tint-flood" flood-color="#83c092" result="flood"/>
        <feBlend in="flood" in2="SourceGraphic" mode="color" result="blend"/>
        <feComposite in="blend" in2="SourceGraphic" operator="in" result="clip"/>
        <feComposite in="clip" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.55" k3="0.45" k4="0"/>
      </filter>
      <filter id="jpt-tint-hot" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
        <feFlood id="jpt-hot-flood" flood-color="#dbbc7f" result="flood"/>
        <feBlend in="flood" in2="SourceGraphic" mode="color" result="blend"/>
        <feComposite in="blend" in2="SourceGraphic" operator="in" result="clip"/>
        <feComposite in="clip" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.6" k3="0.45" k4="0"/>
      </filter>
    </svg>
    <section class="jpt-win" id="jpt-win" role="dialog" aria-label="JuPiter, a chat guide to John Paul De Leon">
      <div class="jpt-bar">
        <img class="jpt-ico" src="${ICON}" alt="" width="14" height="14" draggable="false">
        <b>JuPiter · get to know Jampol</b>
        <button class="jpt-ib jpt-clr" type="button" aria-label="Clear chat" title="Clear chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg></button>
        <button class="jpt-ib jpt-x" type="button" aria-label="Close chat" title="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="jpt-out" role="log" aria-live="polite"></div>
      <div class="jpt-chips" aria-label="Suggestions"></div>
      <div class="jpt-in"><span aria-hidden="true">$</span>
        <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ask me about Jampol, or type help" aria-label="Type a command or question">
        <button class="jpt-ib jpt-send" type="button" aria-label="Send" title="Send" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button>
      </div>
      <i class="jpt-rs" role="separator" aria-label="Resize chat" title="Drag to resize"></i>
    </section>
    <button class="jpt-fab" type="button" aria-expanded="false" aria-controls="jpt-win" aria-label="Chat with JuPiter">
      <span class="jpt-stage" aria-hidden="true">
        <img class="jpt-ico" src="${ICON}" alt="" width="26" height="26" draggable="false">
      </span>
    </button>`;
  document.body.appendChild(root);

  /* Theme-aware tints: the icon uses --accent-color, and --heading-color on hover / tap / open.
     Re-synced whenever the theme attribute changes or a theme dot is clicked. */
  const de = document.documentElement;
  const flood = root.querySelector('#jpt-tint-flood');
  const hotFlood = root.querySelector('#jpt-hot-flood');
  const tint = () => {
    const cs = getComputedStyle(de);
    const c = cs.getPropertyValue('--accent-color').trim();
    const h = cs.getPropertyValue('--heading-color').trim();
    if (c && flood.getAttribute('flood-color') !== c) flood.setAttribute('flood-color', c);
    if (h && hotFlood.getAttribute('flood-color') !== h) hotFlood.setAttribute('flood-color', h);
  };
  tint();
  new MutationObserver(tint).observe(de, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  document.addEventListener('click', ev => {
    if (ev.target.closest('[data-theme-choice]')) { requestAnimationFrame(tint); setTimeout(tint, 150); }
  });
  root.querySelectorAll('.jpt-ico').forEach(i => i.addEventListener('error', () => root.classList.add('jpt-noimg')));

  const $ = s => root.querySelector(s);
  const out = $('.jpt-out'), input = $('input'), fab = $('.jpt-fab'), chips = $('.jpt-chips'), win = $('.jpt-win');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width:991px)');
  const hist = []; let hi = 0, booted = false, shown = false, wantOpen = false;

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

  function boot() {
    if (booted) return;
    booted = true;
    print(fmt(`Hi there! 👋 I'm **JuPiter**, your guide around this desktop. My mission: help you get to know **Jampol** (John Paul De Leon).`), 's');
    say(fmt([
      'Where would you like to start?', '',
      '• **The professional side:** {{experience}}, {{skills}}, {{projects}} or the classic {{interview}} questions',
      '• **Off the clock:** {{hobbies}} or his personal corner of the web, {{johnoffthewall}}',
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
  const send = () => { const v = input.value; input.value = ''; syncSend(); run(v); input.focus(); };
  input.addEventListener('input', syncSend);
  input.addEventListener('keyup', syncSend);
  sendBtn.addEventListener('click', send);
  $('.jpt-clr').addEventListener('click', () => { clearChat(); input.focus(); });
  out.addEventListener('click', ev => { if (typer && !ev.target.closest('a,button')) typer.skip(); });

  /* on phones keep the compact window above the on-screen keyboard */
  const vv = window.visualViewport;
  const syncVV = () => {
    if (!vv) return;
    if (vv.scale > 1.01) { root.style.removeProperty('--jpt-kb'); root.style.removeProperty('--jpt-vh'); return; }
    root.style.setProperty('--jpt-kb', Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)) + 'px');
    root.style.setProperty('--jpt-vh', Math.round(vv.height) + 'px');
    if (shown && isOpen()) fit();
  };
  if (vv) { vv.addEventListener('resize', syncVV); vv.addEventListener('scroll', syncVV); syncVV(); }

  function toggle(open) {
    root.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', open);
    if (open) {
      boot();
      fit();
      setTimeout(() => input.focus(), 30);
    } else fab.focus();
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
      else say(fmt(`Hmm, I couldn't find anything for **${q.slice(0, 40)}**. I focus on Jampol's resume, professional experience, projects and career, so try {{help}} or {{interview}}, or {{contact}} Jampol directly.`));
    }, wait);
  }

  fab.addEventListener('click', () => toggle(!root.classList.contains('open')));
  $('.jpt-x').addEventListener('click', () => toggle(false));
  root.addEventListener('click', ev => {
    const b = ev.target.closest('.jpt-cmd');
    if (b) { run(b.dataset.q); input.focus(); }
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && root.classList.contains('open')) toggle(false);
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

  /* ───────────── placement: beside the Skills section, computed once ─────────────
   * ANCHOR_SELECTOR: the element the launcher sits beside (the Skills section). Edit it if your markup differs.
   *   If nothing matches, a heading whose text is "Skills" is used, then the .conky widget as a last resort.
   * anchor(): puts the launcher at that element's bottom-left corner, just outside it, nudged (left / up / down) until it no longer covers any
   *           widget (.conky, .cky-widget, .linux-dock). Runs only when the chat is revealed and on window resize.
   * fit():    when the chat opens, picks the corner (up/down, left/right) that covers the least and caps the size to it.
   * Below 992px the widgets stack in the page flow, so the launcher keeps its default bottom-right corner. */
  const ANCHOR_SELECTOR = '#skills, [data-section="skills"], [data-widget="skills"], [data-window="skills"], .skills-section, .skills, [id*="skills" i], [class*="skills" i]';
  const WIDGETS = '.conky,.cky-widget,.linux-dock';
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 40 && r.height > 24 && getComputedStyle(el).visibility !== 'hidden' && !root.contains(el); };
  function findAnchor() {
    try { for (const el of document.querySelectorAll(ANCHOR_SELECTOR)) if (visible(el)) return el; } catch (e) { }
    for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6,[class*="title" i],[class*="head" i]')) {
      if (h.children.length < 3 && /^\s*(~\/)?(skills|stack)\b/i.test(h.textContent || '')) {
        const box = h.closest('section,article,aside,[class*="widget" i],[class*="card" i],[class*="window" i]') || h.parentElement;
        if (box && visible(box)) return box;
      }
    }
    return null;
  }
  const rects = (except, pad) => [...document.querySelectorAll(WIDGETS)]
    .filter(el => visible(el) && el !== except && !(except && except.contains(el)))
    .map(el => { const r = el.getBoundingClientRect(); return { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad }; });
  const overlap = (x, y, w, h, o) => { const ox = Math.min(x + w, o.r) - Math.max(x, o.l), oy = Math.min(y + h, o.b) - Math.max(y, o.t); return ox > 0 && oy > 0 ? ox * oy : 0; };

  const cap = { w: 340, h: 420 };
  const LAUNCHER_MIN = 60;   // px: smallest launcher size; raise it for a bigger icon
  /* launcher size = the dock's icon tile (measured) x1.5 (never below LAUNCHER_MIN) */
  function syncSize() {
    let sz = 40;
    const d = document.querySelector('.linux-dock');
    if (d) {
      const t = [...d.querySelectorAll('a,button,li,[role="button"],[class*="item" i],[class*="icon" i]')]
        .map(e => e.getBoundingClientRect()).filter(r => r.width >= 24 && r.width <= 72 && Math.abs(r.width - r.height) <= 12)
        .map(r => Math.min(r.width, r.height)).sort((x, y) => x - y)[0];
      if (t) sz = Math.round(t);
    }
    sz = Math.max(LAUNCHER_MIN, Math.round(sz * 1.5));   // clearly larger than a dock tile so the astrobot reads at the dock's visual weight
    sz = Math.round(sz / 2) * 2;                          // even sizes keep the centred icon on whole pixels (no half-pixel blur)
    root.style.setProperty('--sz', sz + 'px');
    root.style.setProperty('--ico', Math.round(sz * .76 / 2) * 2 + 'px');
    return sz;
  }
  function anchor() {
    root.dataset.h = 'l';
    const L = syncSize();
    const reset = () => { root.style.left = ''; root.style.right = ''; root.style.bottom = ''; };
    if (narrow.matches) return reset();
    const vw = innerWidth, vh = innerHeight, M = 16, GAP = 14;
    const sk = findAnchor();
    let x0, y0;
    if (sk) {                                            // bottom-left corner of the Skills section, just outside it
      const r = sk.getBoundingClientRect();
      x0 = r.left - GAP - L; y0 = r.bottom - L;
      if (x0 < M) x0 = M;
    } else {
      const c = document.querySelector('.conky'), r = c && c.getBoundingClientRect();
      if (!r || !r.width) return reset();                // nothing to anchor to: default corner
      x0 = r.left - GAP - L; y0 = r.bottom - L;
      if (x0 < M) x0 = r.right + GAP;
    }
    y0 = Math.min(vh - M - L, Math.max(M, y0));
    const obs = rects(sk, 8);
    let best = null;
    for (let dx = 0; dx <= 240; dx += 12) for (let dy = 0; dy <= 360; dy += 12) for (const sg of (dy ? [-1, 1] : [1])) {
      const x = x0 - dx, y = y0 + dy * sg;                // search leftwards, then up / down, away from the widgets
      if (x < M || x + L > vw - M || y < M || y + L > vh - M) continue;
      let ov = 0; for (const o of obs) ov += overlap(x, y, L, L, o);
      const score = ov * 10 + dx + dy * 1.2;
      if (!best || score < best.s) best = { x, y, s: score };
    }
    if (!best) return;                                   // keep the current spot instead of snapping to the default corner
    root.style.left = Math.round(best.x) + 'px';
    root.style.right = 'auto';
    root.style.bottom = 'calc(' + Math.round(vh - (best.y + L)) + 'px + var(--jpt-kb,0px))';
  }
  function fit() {
    const m = narrow.matches ? 10 : 16;
    const f = fab.getBoundingClientRect();
    const cs = getComputedStyle(root);
    const wantW = parseFloat(cs.getPropertyValue('--jpt-w')) || 340, wantH = parseFloat(cs.getPropertyValue('--jpt-h')) || 420;
    const obs = narrow.matches ? [] : rects(null, 0);
    const sk = narrow.matches ? null : findAnchor();
    if (sk) { const r = sk.getBoundingClientRect(); obs.push({ l: r.left, t: r.top, r: r.right, b: r.bottom }); }
    let best = null;
    [['l', 'up'], ['r', 'up'], ['l', 'down'], ['r', 'down']].forEach(([h, v], i) => {
      const mw = Math.max(200, Math.floor(h === 'r' ? innerWidth - f.left - m : f.right - m));
      const mh = Math.max(160, Math.floor(v === 'up' ? f.top - m : innerHeight - f.bottom - m));
      const w = Math.min(wantW, mw), hh = Math.min(wantH, mh);
      const x = h === 'r' ? f.left : f.right - w, y = v === 'up' ? f.top - hh : f.bottom;
      let ov = 0; for (const o of obs) ov += overlap(x, y, w, hh, o);
      const score = ov + (wantW * wantH - w * hh) * 3 + i;   // least overlap, then biggest, then up/left first
      if (!best || score < best.s) best = { s: score, h, v, mw, mh };
    });
    root.dataset.h = best.h; root.dataset.v = best.v;
    cap.w = best.mw; cap.h = best.mh;
    root.style.setProperty('--jpt-maxw', cap.w + 'px');
    root.style.setProperty('--jpt-maxh', cap.h + 'px');
  }

  /* ───────────── resize: drag the grip on the window's free corner ───────────── */
  const MIN_W = 260, MIN_H = 200;
  const grip = $('.jpt-rs');
  let drag = null, lastSize = null;
  try {
    const s = JSON.parse(sessionStorage.getItem('jpt-size') || 'null');
    if (s && s.w >= MIN_W && s.h >= MIN_H) {
      root.style.setProperty('--jpt-w', s.w + 'px'); root.style.setProperty('--jpt-h', s.h + 'px'); lastSize = s;
    }
  } catch (e) { }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  grip.addEventListener('pointerdown', ev => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    ev.preventDefault();
    const r = win.getBoundingClientRect();
    drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, w: r.width, h: r.height };
    try { grip.setPointerCapture(ev.pointerId); } catch (e) { }
    root.classList.add('rs-on');
  });
  grip.addEventListener('pointermove', ev => {
    if (!drag || ev.pointerId !== drag.id) return;
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    const w = Math.round(clamp(drag.w + (root.dataset.h === 'r' ? dx : -dx), MIN_W, cap.w));
    const h = Math.round(clamp(drag.h + (root.dataset.v === 'down' ? dy : -dy), MIN_H, cap.h));
    root.style.setProperty('--jpt-w', w + 'px');
    root.style.setProperty('--jpt-h', h + 'px');
    lastSize = { w, h };
    out.scrollTop = out.scrollHeight;
  });
  const endDrag = ev => {
    if (!drag || (ev && ev.pointerId !== drag.id)) return;
    drag = null;
    root.classList.remove('rs-on');
    try { if (lastSize) sessionStorage.setItem('jpt-size', JSON.stringify(lastSize)); } catch (e) { }
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => grip.addEventListener(t, endDrag));

  /* ───────────── reveal: wait for boot + a fully settled desktop ─────────────
   * The chat stays hidden (and unpositioned) while the boot sequence plays (html.boot-on / html.boot-ui-in),
   * until the page, fonts and widgets are loaded, and until the conky / widgets / dock stop moving.
   * It is then anchored, flies in from far away (jpt-arrive), and is re-checked for a few seconds in case the layout still shifts.
   * A boot restart hides it again. */
  const busy = () => de.classList.contains('boot-on') || de.classList.contains('boot-ui-in');
  const snap = () => [...document.querySelectorAll(WIDGETS), findAnchor()].filter(Boolean).map(el => {
    const r = el.getBoundingClientRect();
    return [r.left, r.top, r.width, r.height].map(Math.round).join(',');
  }).join('|') + '|' + innerWidth + 'x' + innerHeight;

  /* true while any widget (or something inside it) still has a finite CSS animation running */
  const moving = () => {
    try {
      return [...document.querySelectorAll(WIDGETS), findAnchor()].filter(Boolean).some(el => el.getAnimations &&
        el.getAnimations({ subtree: true }).some(a => a.playState === 'running' && a.effect && isFinite(a.effect.getComputedTiming().endTime)));
    } catch (e) { return false; }
  };
  /* after reveal, re-anchor if the desktop layout still shifts during the first seconds */
  function lateWatch(my) {
    let base = snap(), n = 0;
    const t = setInterval(() => {
      if (my !== token || ++n > 16) return clearInterval(t);
      const s = snap();
      if (s !== base && !drag) { base = s; anchor(); if (isOpen()) fit(); }
    }, 250);
  }
  root.addEventListener('animationend', ev => { if (ev.target === root && ev.animationName === 'jpt-arrive') root.classList.remove('jpt-arrive'); });

  /* full reset: conversation, history, window size and position all go back to the defaults */
  function resetChat() {
    if (typer) typer.skip();
    out.innerHTML = ''; booted = false; hist.length = 0; hi = 0;
    input.value = ''; syncSend();
    drag = null; lastSize = null; root.classList.remove('rs-on');
    root.style.removeProperty('--jpt-w'); root.style.removeProperty('--jpt-h');
    root.style.removeProperty('--jpt-maxw'); root.style.removeProperty('--jpt-maxh');
    root.style.left = ''; root.style.right = ''; root.style.bottom = '';
    root.dataset.h = 'l'; root.dataset.v = 'up';
    try { sessionStorage.removeItem('jpt-size'); } catch (e) { }
  }
  let token = 0, waiting = false;
  function hold() {                                    // runs when the boot sequence (re)starts, e.g. the Restart button
    token++; waiting = false; shown = false; wantOpen = false;
    root.classList.add('jpt-hold');
    root.classList.remove('jpt-arrive');
    root.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
    resetChat();
  }
  function show(my) {
    if (my !== token) return;
    anchor();
    root.classList.remove('jpt-arrive');
    root.classList.remove('jpt-hold');
    if (!reduce) { void root.offsetWidth; root.classList.add('jpt-arrive'); }
    waiting = false; shown = true;
    if (wantOpen) { wantOpen = false; toggle(true); }
    lateWatch(my);
  }
  function reveal() {
    const my = ++token; waiting = true;
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => { }) : Promise.resolve();
    Promise.all([loaded, fonts]).then(() => {
      let last = '', same = 0, idle = 0;
      const poll = () => {
        if (my !== token) return;
        if (busy()) { same = 0; last = ''; return setTimeout(poll, 150); }
        const s = snap() + (moving() ? '|m' + performance.now() : '');
        same = s === last ? same + 1 : 0; last = s; idle += 120;
        const ready = same >= 8 && (!!(findAnchor() || document.querySelector('.conky')) || narrow.matches);   // ~1s without any movement or running animation
        if (ready || idle > 8000) return show(my);
        setTimeout(poll, 120);
      };
      poll();
    });
  }
  const watch = () => {
    if (busy()) { if (shown || waiting) hold(); }
    else if (!shown && !waiting) reveal();
  };
  new MutationObserver(watch).observe(de, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('boot:done', watch);
  watch();

  /* keep the launcher beside the conky when the browser window is resized (never during load) */
  let rt = 0;
  const relayout = () => { if (!shown) return; clearTimeout(rt); rt = setTimeout(() => { anchor(); fit(); }, 120); };
  addEventListener('resize', relayout);
  if (narrow.addEventListener) narrow.addEventListener('change', relayout);

  window.jptReset = resetChat;                      // optional: call from any other reset button
  window.jptOpen = () => { if (shown) toggle(true); else wantOpen = true; }; // optional: call from any link/button
})();