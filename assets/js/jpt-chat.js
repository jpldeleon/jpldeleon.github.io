/*!
 * jpt-chat.js — compact terminal-style Q&A applet for jpldeleon.github.io
 * Zero dependencies. No backend: answers come from the KNOWLEDGE BASE below.
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
   * - answers support **bold**, [text](https://url), {{clickable command}}
   * Entries marked  // EDIT  are drafts in your voice — tweak them!
   * ─────────────────────────────────────────────────────────────── */
  const SITE = 'https://jpldeleon.github.io';
  const E = [];
  const add = (id, k, a, o = {}) =>
    E.push({ id, k, a: Array.isArray(a) ? a.join('\n') : a, w: o.w || 1, cmd: o.cmd || [id] });

  /* ---- core ---- */
  add('help', ['help', 'commands', 'menu', 'options'], [
    '**Ask me anything** about JP\'s resume, projects or interview-style questions, or run:',
    '{{about}} {{experience}} {{skills}} {{projects}} {{education}}',
    '{{certs}} {{johnoffthewall}} {{interview}} {{contact}} {{resume}} {{clear}}',
    'Try plain English too, e.g. "why should we hire you?"'
  ], { cmd: ['help', '?', 'menu', 'commands'] });

  add('greeting', ['hi', 'hello', 'hey', 'yo', 'sup', 'hola', 'kumusta'], [
    'Hey there 👋 I\'m a tiny scripted bot that knows JP\'s resume.',
    'Type {{help}} or tap a suggestion below.'
  ], { cmd: ['hi', 'hello', 'hey'] });

  add('thanks', ['thanks', 'thank', 'salamat', 'cheers', 'appreciate'], 'Anytime! Want to see {{projects}} or grab the {{resume}}?');

  add('bot', ['bot', 'chatbot', 'human', 'are you real', 'are you ai', 'are you a bot', 'powered by'], [
    'I\'m not an LLM — I\'m a small rule-based script that matches keywords against JP\'s resume and portfolio.',
    'No data leaves your browser. If I miss something, try {{help}} or {{contact}} JP directly.'
  ], { w: 0.9, cmd: ['whoareyou', 'who are you'] });

  add('about', ['about', 'yourself', 'whoami', 'intro', 'introduce', 'summary', 'profile', 'who'], [
    '**John Paul De Leon** — Technical SEO Specialist · Metro Manila, PH',
    'SEO Specialist with 5 years of experience in link prospecting, backlink research and outreach (Intelligent.com LLC, Awisee). Recently expanded into technical SEO through a full-stack bootcamp and SEO certification, so I can diagnose an issue and ship the fix in code.',
    'Detail-focused, research-driven, and committed to SEO as a long-term career.',
    'Next: {{experience}} · {{skills}} · {{projects}}'
  ], { cmd: ['about', 'whoami', 'about me', 'summary'] });

  /* ---- experience ---- */
  add('experience', ['experience', 'work', 'career', 'history', 'jobs', 'employment', 'timeline', 'background'], [
    '**~/career**',
    '`May 2025 – now`  Self-directed learning: Full-Stack Bootcamp · Technical SEO Sprint · AI workflows',
    '`Jan – May 2025`  SEO Outreach Specialist — {{awisee}}',
    '`Nov 2020 – Sep 2024`  Research Analyst, SEO Link Prospecting — {{intelligent.com}}',
    '`May – Nov 2020`  Contact Finder — {{contact finder}}',
    '`Jan 2019 – May 2020`  Freelance Research Consultant — {{freelance}}',
    '`Sep 2013 – Nov 2018`  Research Analyst, Web Researcher — {{straive}}'
  ], { cmd: ['experience', 'career', 'work', 'ls career'] });

  add('awisee', ['awisee', 'outreach specialist', 'stockholm'], [
    '**SEO Outreach Specialist** · Awisee (remote, Stockholm) · Jan – May 2025',
    '• Built and verified prospect lists that kept link-building campaigns running smoothly, cutting manual list-building time',
    '• Cleaned and organized lead data for sharper outreach targeting',
    '• Proposed process improvements to the prospect-list workflow'
  ], { w: 2 });

  add('intelligent', ['intelligent', 'intelligent.com', 'prospecting', 'analyst', 'seattle'], [
    '**Research Analyst (SEO Link Prospecting)** · Intelligent.com LLC (remote, Seattle) · Nov 2020 – Sep 2024',
    '• Wrote research specs guiding the US and outreach teams\' link prospecting',
    '• Built monthly prospect lists that met and sustained monthly + yearly outreach quotas',
    '• Maintained and troubleshot link and email databases',
    '• Built a personal script to streamline research workflow',
    '• Trusted to pilot link prospecting strategy for new client accounts'
  ], { w: 1.5 });

  add('contactfinder', ['contact finder', 'finder', 'verification'], [
    '**Contact Finder** · Intelligent.com LLC · May – Nov 2020',
    '• Researched and verified high-quality leads for link-building outreach',
    '• Met daily and monthly quotas under tight deadlines',
    '• Applied qualification criteria that cut wasted outreach on low-authority sites',
    '• Promoted to Research Analyst after a strong track record'
  ], { w: 2 });

  add('freelance', ['freelance', 'freelancer', 'consultant', 'upwork', 'golance', 'scraping', 'referral'], [
    '**Freelance Research Consultant** · Jan 2019 – May 2020 (referral-based)',
    '• Delivered lead-gen projects for outsourced clients',
    '• Web scraping + data entry to build prospect/contact lists',
    '• Kept client data sets accurate and consistent',
    'Profiles: [Upwork](https://www.upwork.com/freelancers/~01562764cad5d47331) · [GoLance](https://golance.com/freelancer/john.paul.leonard.de.leon)'
  ], { w: 1.5 });

  add('straive', ['straive', 'spi', 'lean', 'six sigma', 'sigma', 'award'], [
    '**Research Analyst (Web Researcher)** · Straive, formerly SPi Global (on-site, PH) · Sep 2013 – Nov 2018',
    '• Built an automation solution that helped the team win a **Lean Six Sigma Award**',
    '• Piloted several new projects/accounts and onboarded them successfully',
    '• Stepped in to lead other teams in deadline-driven periods',
    '• Consistently met quota and deadlines; took on extra overtime for other accounts'
  ], { w: 2 });

  /* ---- skills ---- */
  add('skills', ['skills', 'stack', 'tech', 'technologies', 'tools', 'proficient', 'expertise', 'good', 'languages'], [
    '**~/stack**',
    '**Core:** Technical SEO · WordPress development · E-commerce/WooCommerce',
    '**SEO:** On-page · Off-page (5+ yrs link research, prospecting, vetting) · Core Web Vitals & performance',
    '**Dev:** HTML, CSS, JavaScript, Bootstrap, Node.js, Express.js, EJS, PostgreSQL, automation scripts',
    '**Tools:** Screaming Frog, Rank Math, Yoast SEO, Elementor, LocalWP, GitHub',
    '**AI:** Prompt & context engineering · AI-assisted dev + SEO research · exploring LLM APIs & local models (Ollama)',
    'Dig deeper: {{seo}} · {{ai}}'
  ], { cmd: ['skills', 'stack', 'tools'] });

  add('seo', ['seo', 'technical seo', 'backlink', 'backlinks', 'linkbuilding', 'link building', 'audit', 'screaming frog', 'core web vitals', 'cwv'], [
    '**SEO focus:** research-driven link prospecting for 5+ years (specs, qualification, vetting, outreach lists), plus technical SEO learned via the SEO Workout certification and hands-on projects.',
    'Tools: Screaming Frog, Rank Math, Yoast. Also practiced performance and Core Web Vitals work.',
    'See it applied: {{auditkit}} · {{badlands ink}} · {{nothingtechblob}}'
  ], { cmd: ['seo', 'technical seo'] });

  add('wordpress', ['wordpress', 'wp', 'woocommerce', 'elementor', 'localwp', 'ecommerce', 'e-commerce', 'plugin'], [
    '**WordPress & WooCommerce:** built and practiced multiple projects on LocalWP using Elementor, Rank Math and Yoast. {{badlands ink}} covers a full WooCommerce build: catalog, payments and optimization.'
  ], { cmd: ['wordpress', 'woocommerce'] });

  add('ai', ['ai', 'prompt', 'ollama', 'automation', 'workflows', 'context engineering', 'llms', 'chatgpt'], [
    '**AI workflows:** prompt & context engineering for reliable LLM output, AI-assisted development and debugging, and LLM-assisted SEO research and data cleanup.',
    'Currently exploring LLM API integration and local models with Ollama. Principle: AI-assisted, human-checked.'
  ], { w: 0.9, cmd: ['ai', 'ai workflows'] });

  add('interests', ['interests', 'hobbies', 'linux', 'arch', 'android', 'rom', 'foss', 'open-source', 'fun', 'free time'], [
    '**Off the clock:** Linux & desktop customization (Arch, zsh, Everforest), Android & custom ROMs, PC hardware, FOSS, local LLMs, UI/UX and web experiments.'
  ]);

  /* ---- education / certs ---- */
  add('education', ['education', 'school', 'degree', 'college', 'university', 'studied', 'study', 'graduate', 'ieti'], [
    '**A.S. Information & Communication Technology** · Philippine Merchant Marine School (IETI) · 2006 – 2008'
  ], { cmd: ['education', 'school'] });

  add('certs', ['certifications', 'certification', 'certificate', 'certs', 'bootcamp', 'udemy', 'sprint', 'courses', 'training'], [
    '**Certifications**',
    '• The Complete Full-Stack Web Development Bootcamp (Udemy) → [view](' + SITE + '/assets/img/certifications/cert-fullstack-bootcamp_F.webp)',
    '• Technical SEO and SEO Sprint — SEO Workout by Gab Valimento, 2025 → [view](' + SITE + '/assets/img/certifications/cert_techseosprint_F.webp)'
  ], { cmd: ['certs', 'certifications', 'certificates'] });

  /* ---- projects ---- */
  add('projects', ['projects', 'portfolio', 'built', 'build', 'apps', 'demos', 'samples', 'capstone'], [
    '**~/portfolio** (7 projects)',
    '• [AuditKit](' + SITE + '/auditkit/) — API capstone · {{auditkit}}',
    '• [NothingTechBlob](' + SITE + '/nothingtechblob/) — technical & on-page SEO + WordPress · {{nothingtechblob}}',
    '• [Badlands Ink](' + SITE + '/badlands-ink/) — technical, local & e-commerce SEO + WP · {{badlands ink}}',
    '• [John Off the Wall](' + SITE + '/johnoffthewall/) — HTML & CSS capstone · {{johnoffthewall}}',
    '• [PixelLog](' + SITE + '/pixellog/) — Node.js, Express, EJS · {{pixellog}}',
    '• [JamporuDEX](' + SITE + '/jamporudex/) — Node.js, Express, PostgreSQL, EJS · {{jamporudex}}',
    '• [Route 196](' + SITE + '/route196/) — Node.js, Express, EJS · {{route196}}'
  ], { cmd: ['projects', 'portfolio', 'ls portfolio', 'ls ~/portfolio'] });

  add('auditkit', ['auditkit', 'audit kit'], 'Wait for it: **AuditKit** is an API capstone project. [Open it](' + SITE + '/auditkit/).', { w: 3 });
  add('nothingtechblob', ['nothingtechblob', 'nothing tech blob', 'blob'], '**NothingTechBlob** — technical & on-page SEO plus WordPress development. [Open it](' + SITE + '/nothingtechblob/).', { w: 3 });
  add('badlands', ['badlands', 'badlands ink', 'ink', 'tattoo'], '**Badlands Ink** — technical, local & e-commerce SEO with WordPress/WooCommerce: product catalog, payments and optimization. [Open it](' + SITE + '/badlands-ink/).', { w: 3, cmd: ['badlands ink', 'badlands'] });
  add('pixellog', ['pixellog', 'pixel log'], '**PixelLog** — Node.js, Express.js & EJS capstone. [Open it](' + SITE + '/pixellog/).', { w: 3 });
  add('jamporudex', ['jamporudex', 'jamporu', 'dex'], '**JamporuDEX** — Node.js, Express, PostgreSQL & EJS capstone. [Open it](' + SITE + '/jamporudex/).', { w: 3 });
  add('route196', ['route196', 'route 196', '196'], '**Route 196** — Node.js, Express.js & EJS capstone. [Open it](' + SITE + '/route196/).', { w: 3 });

  add('johnoffthewall', ['johnoffthewall', 'john off the wall', 'off the wall', 'jotw', 'offthewall'], [
    '**John Off the Wall** — "Me, off the wall." · HTML & CSS capstone (a personal website)',
    '**Stack:** HTML5, CSS3, JavaScript, Bootstrap 5, GLightbox',
    '**Features:**',
    '• Dynamic light/dark mode',
    '• Interactive GLightbox pop-ups with touch gestures and custom button alignment scripting',
    '• Fully responsive: Bootstrap 5 grids plus custom media queries',
    '• Semantic HTML5 structure; dynamic DOM error handling swaps in fallback SVG placeholders for missing images',
    '• Includes a contact form and featured project showcases',
    '**Links:** [project page](' + SITE + '/johnoffthewall/) · [live site](https://johnoffthewall.github.io/) · [GitHub repo](https://github.com/johnoffthewall/johnoffthewall.github.io)'
  ], { w: 3, cmd: ['johnoffthewall', 'john off the wall', 'jotw'] });

  /* ---- contact ---- */
  add('contact', ['contact', 'email', 'phone', 'reach', 'message', 'call', 'connect', 'socials', 'linkedin', 'github', 'location', 'based', 'live', 'located'], [
    '**Contact JP**',
    '• [LinkedIn](https://www.linkedin.com/in/jpldl/) (best way to reach out)',
    '• [GitHub](https://github.com/jpldeleon)',
    '• [Upwork](https://www.upwork.com/freelancers/~01562764cad5d47331) · [GoLance](https://golance.com/freelancer/john.paul.leonard.de.leon)',
    '• Email & phone are in the Resume section of the site',
    '• Based in Metro Manila, Philippines'
  ], { cmd: ['contact', 'socials', 'email', 'linkedin', 'github'] });

  add('resume', ['resume', 'cv', 'download', 'pdf'], [
    'Grab the full CV: [johnpauldeleon_resume.pdf](' + SITE + '/assets/johnpauldeleon_resume.pdf)'
  ], { cmd: ['resume', 'cv', 'cat resume', 'download cv'] });

  /* ---- interview questions ---- */
  add('interview', ['interview', 'questions', 'faq'], [
    '**Common interview questions** (tap one):',
    '{{tell me about yourself}}',
    '{{why seo?}}',
    '{{what are your strengths?}}',
    '{{what is your weakness?}}',
    '{{why should we hire you?}}',
    '{{biggest achievement?}}',
    '{{how do you handle pressure?}}',
    '{{how do you work in a team?}}',
    '{{tell me about your career gap}}',
    '{{why are you looking for a new role?}}',
    '{{where do you see yourself in 5 years?}}',
    '{{salary expectations?}}',
    '{{remote or on-site?}}',
    '{{how do you solve problems?}}',
    '{{how do you learn new things?}}'
  ], { cmd: ['interview', 'faq', 'questions'] });

  add('q-self', ['tell me about yourself', 'walk me through your resume', 'introduce yourself', 'describe yourself'], [
    'I\'m JP, a Technical SEO Specialist. I spent about 5 years in link prospecting and outreach research (Intelligent.com, Awisee), and a decade-plus in web research overall. I got curious about the numbers behind the worksheets, so I moved into research-driven SEO, then took a full-stack bootcamp and a Technical SEO certification.',
    'Now I can diagnose a site problem and fix it in code, and I use AI tools to speed up audits and research while keeping the judgement human.'
  ], { w: 2.5 });

  add('q-why-seo', ['why seo', 'why do you like seo', 'why this field', 'why this career', 'passion', 'motivates you', 'motivation'], [
    'SEO is where research, data and building things meet. I started in link prospecting, got hooked on seeing which numbers actually move results, and followed that into technical SEO and web dev. I want it as a long-term career, not a stepping stone.'
  ], { w: 2.5 });

  add('q-strengths', ['strengths', 'strength', 'best at', 'what are you good at', 'greatest strength'], [
    '• **Research-driven & detail-focused:** I qualify sites and contacts with consistent criteria, so outreach isn\'t wasted.',
    '• **Troubleshooting over guessing:** I dig into databases, code and data to find the cause.',
    '• **Automation mindset:** my Straive automation helped win a Lean Six Sigma Award, and I built my own script to streamline research at Intelligent.com.',
    '• **Reliable:** quotas met consistently and trusted to pilot new accounts.'
  ], { w: 2.5 });

  add('q-weakness', ['weakness', 'weaknesses', 'improve', 'areas for improvement', 'worst at', 'greatest weakness'], [ // EDIT
    'My hands-on technical SEO is newer: I built it through certification and real projects rather than a full-time technical role. I close the gap by auditing and building actual sites ({{badlands ink}}, {{nothingtechblob}}, {{auditkit}}) and by pairing AI tools with manual verification instead of trusting output blindly.'
  ], { w: 2.5 });

  add('q-hire', ['hire you', 'why you', 'why should we hire', 'what makes you different', 'stand out', 'what can you bring', 'add value', 'value'], [ // EDIT
    'I combine 5 years of SEO research and link-building experience with the ability to read and fix code, which is a combination that\'s hard to find. I can run the audit, understand why something is broken, and ship the fix. I\'m also dependable under quotas and deadlines, and I\'m quick to improve a process when I spot a slow one.'
  ], { w: 2.5 });

  add('q-achievement', ['achievement', 'accomplishment', 'proudest', 'proud of', 'biggest win', 'success', 'accomplishments'], [
    'At Straive I built an automation solution that helped the team win a **Lean Six Sigma Award** and raised the account\'s status. Other highlights: promoted from Contact Finder to Research Analyst, and trusted to pilot link-prospecting strategy for new client accounts.'
  ], { w: 2.5 });

  add('q-pressure', ['pressure', 'deadline', 'deadlines', 'stress', 'stressful', 'quota', 'quotas', 'tight'], [
    'I\'ve met daily and monthly quotas across every role. At Straive I stepped in to lead other teams during critical, deadline-driven periods and took overtime work for other accounts. My approach is to break work into clear specs, systemize repetitive steps (often with a script), and keep quality checks in place.'
  ], { w: 2.5 });

  add('q-team', ['team', 'teamwork', 'collaborate', 'collaboration', 'colleagues', 'conflict', 'leadership', 'lead', 'manager'], [
    'I clarify specs with team leaders before starting so research lines up with campaign goals, and I share the verification and research techniques I find with colleagues so the whole team gets faster. When asked, I\'ve led and onboarded other teams too.'
  ], { w: 1.2 });

  add('q-gap', ['gap', 'career gap', 'since 2024', 'recent', 'doing now', 'currently', 'right now', 'lately'], [ // EDIT
    'Since May 2025 I\'ve been deliberately upskilling: the Complete Full-Stack Web Development Bootcamp, the Technical SEO and SEO Sprint certification, and seven shipped projects (WordPress, WooCommerce, Node/Express/PostgreSQL), while exploring AI-assisted workflows and local LLMs with Ollama.'
  ], { w: 2 });

  add('q-leave', ['why leave', 'looking for', 'new role', 'new job', 'why are you looking', 'why did you leave', 'leaving', 'left'], [ // EDIT
    'I want a role where I can use both sides of my profile: SEO research experience and the technical skills I\'ve built since. I\'m aiming for technical SEO work where diagnosing and fixing site issues is part of the job.'
  ], { w: 2.5 });

  add('q-future', ['5 years', 'five years', 'future', 'goals', 'career goals', 'long term', 'long-term', 'ambition', 'grow'], [
    'Grow into a strong technical SEO who can audit, explain and implement fixes, building a long-term SEO career. I also plan to keep going deeper on AI workflows (LLM APIs, local models) to make audits and research faster.'
  ], { w: 1.5 });

  add('q-salary', ['salary', 'pay', 'compensation', 'rate', 'rates', 'expected', 'expectations', 'budget', 'how much'], [ // EDIT
    'I\'m open to discussing it based on the scope of the role and the market. Let\'s talk on [LinkedIn](https://www.linkedin.com/in/jpldl/) and find something fair for both sides.'
  ], { w: 1.5 });

  add('q-remote', ['remote', 'on-site', 'onsite', 'office', 'hybrid', 'wfh', 'timezone', 'time zone', 'availability', 'available', 'start'], [ // EDIT
    'My recent roles (Intelligent.com in Seattle, Awisee in Stockholm) were fully remote with international teams, so async communication comes naturally. I also did on-site work at Straive. For availability and start date, message me on [LinkedIn](https://www.linkedin.com/in/jpldl/).'
  ], { w: 1.5 });

  add('q-problem', ['solve problems', 'problem solving', 'problem-solving', 'troubleshoot', 'troubleshooting', 'debug', 'stuck', 'approach'], [
    'I troubleshoot instead of guessing: reproduce the issue, narrow it down, check the data or code, fix it, then verify. Examples: maintaining and fixing link/email databases at Intelligent.com, and building scripts to remove repetitive manual steps.'
  ], { w: 2 });

  add('q-learn', ['learn', 'learning', 'feedback', 'new things', 'adapt', 'adaptable', 'upskill', 'upskilling', 'curious'], [
    'I learn by building: bootcamp → capstone projects → real WordPress/SEO builds. The same pattern took me from link prospecting to technical SEO and web dev, and now into AI-assisted workflows.'
  ], { w: 1.2 });

  /* ---- easter eggs (cmd only) ---- */
  add('sudo', [], 'Nice try. guest is not in the sudoers file. This incident will be reported 😄', { cmd: ['sudo', 'sudo su', 'sudo hire jp'] });
  add('rm', [], 'rm: cannot remove \'/\': Permission denied (good, that\'s the portfolio).', { cmd: ['rm -rf /', 'rm -rf', 'rm -rf /*'] });
  add('neofetch', [], [
    '**guest@jp-portfolio**',
    'OS: Arch Linux x86_64 · Shell: zsh 5.9 · Theme: Everforest',
    'Role: Technical SEO Specialist · Focus: SEO · WordPress · Web Dev',
    'Stack: HTML, CSS, JS, Node, PostgreSQL · Projects: 7, Certs: 2'
  ], { cmd: ['neofetch', 'fastfetch'] });

  /* ───────────────────────── MATCHING ───────────────────────── */
  const SUGGEST = ['about', 'experience', 'skills', 'projects', 'interview', 'contact'];
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
  const css = `
.jpt{--bg:#2d353b;--bg2:#232a2e;--bd:#475258;--fg:#d3c6aa;--dim:#859289;--g:#a7c080;--a:#83c092;--y:#dbbc7f;--r:#e67e80;--b:#7fbbb3;
 font:13px/1.5 ui-monospace,"JetBrains Mono","Fira Code",SFMono-Regular,Menlo,Consolas,monospace;color:var(--fg);position:fixed;right:16px;bottom:16px;z-index:2147483000}
.jpt *{box-sizing:border-box}
.jpt-fab{display:flex;gap:8px;align-items:center;background:var(--bg);color:var(--g);border:1px solid var(--bd);border-radius:999px;padding:9px 16px;font:inherit;font-weight:600;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.35);transition:transform .15s,border-color .15s}
.jpt-fab:hover,.jpt-fab:focus-visible{transform:translateY(-2px);border-color:var(--g);outline:none}
.jpt-fab i{font-style:normal;color:var(--y)}
.jpt-win{position:absolute;right:0;bottom:52px;width:min(400px,calc(100vw - 32px));height:min(480px,calc(100vh - 100px));display:none;flex-direction:column;background:var(--bg);border:1px solid var(--bd);border-radius:10px;overflow:hidden;box-shadow:0 14px 48px rgba(0,0,0,.5)}
.jpt.open .jpt-win{display:flex;animation:jpt-in .15s ease-out}
@keyframes jpt-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.jpt-bar{display:flex;align-items:center;gap:6px;padding:8px 10px;background:var(--bg2);border-bottom:1px solid var(--bd)}
.jpt-bar span.d{width:10px;height:10px;border-radius:50%}
.jpt-bar b{flex:1;text-align:center;font-weight:500;color:var(--dim);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jpt-x{background:none;border:0;color:var(--dim);font:inherit;font-size:18px;line-height:1;cursor:pointer;padding:0 4px}
.jpt-x:hover{color:var(--r)}
.jpt-out{flex:1;overflow-y:auto;padding:10px 12px;scroll-behavior:smooth}
.jpt-out::-webkit-scrollbar{width:6px}.jpt-out::-webkit-scrollbar-thumb{background:var(--bd);border-radius:3px}
.jpt-ln{margin:0 0 8px;word-wrap:break-word;overflow-wrap:anywhere}
.jpt-ln.u{color:var(--a)}.jpt-ln.u:before{content:"$ ";color:var(--g)}
.jpt-ln.s{color:var(--dim)}
.jpt-ln b{color:var(--y);font-weight:600}
.jpt-ln code{color:var(--b);background:var(--bg2);padding:0 4px;border-radius:3px}
.jpt-ln a{color:var(--b);text-decoration:underline;text-underline-offset:2px}
.jpt-cmd{font:inherit;color:var(--g);background:var(--bg2);border:1px solid var(--bd);border-radius:4px;padding:0 6px;margin:1px 2px 1px 0;cursor:pointer;text-align:left}
.jpt-cmd:hover,.jpt-cmd:focus-visible{border-color:var(--g);outline:none}
.jpt-chips{display:flex;gap:6px;padding:6px 10px;overflow-x:auto;border-top:1px solid var(--bd);scrollbar-width:none}
.jpt-chips::-webkit-scrollbar{display:none}
.jpt-chips .jpt-cmd{white-space:nowrap;flex:none}
.jpt-in{display:flex;gap:8px;align-items:center;padding:8px 12px;background:var(--bg2);border-top:1px solid var(--bd)}
.jpt-in span{color:var(--g)}
.jpt-in input{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--fg);font:inherit;caret-color:var(--g)}
.jpt-in input::placeholder{color:var(--dim)}
.jpt-dots:after{content:"";animation:jpt-d 1s steps(4) infinite}
@keyframes jpt-d{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}
@media (max-width:480px){.jpt{right:10px;bottom:10px}.jpt-win{position:fixed;inset:10px 10px 62px 10px;width:auto;height:auto}.jpt-in input{font-size:16px}}
@media (prefers-reduced-motion:reduce){.jpt *{animation:none!important;scroll-behavior:auto!important}}
`;

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = s => esc(s)
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\{\{([^}]+)\}\}/g, '<button type="button" class="jpt-cmd" data-q="$1">$1</button>')
    .replace(/\n/g, '<br>');

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'jpt';
  root.innerHTML = `
    <section class="jpt-win" id="jpt-win" role="dialog" aria-label="Terminal chat about John Paul De Leon">
      <div class="jpt-bar">
        <span class="d" style="background:#e67e80"></span><span class="d" style="background:#dbbc7f"></span><span class="d" style="background:#a7c080"></span>
        <b>guest@jp-portfolio: ~</b>
        <button class="jpt-x" type="button" aria-label="Close terminal">×</button>
      </div>
      <div class="jpt-out" role="log" aria-live="polite"></div>
      <div class="jpt-chips" aria-label="Suggestions"></div>
      <label class="jpt-in"><span aria-hidden="true">$</span>
        <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ask me anything or type help" aria-label="Type a command or question">
      </label>
    </section>
    <button class="jpt-fab" type="button" aria-expanded="false" aria-controls="jpt-win"><i>&gt;_</i> ask jp</button>`;
  document.body.appendChild(root);

  const $ = s => root.querySelector(s);
  const out = $('.jpt-out'), input = $('input'), fab = $('.jpt-fab'), chips = $('.jpt-chips');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hist = []; let hi = 0, booted = false;

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

  function toggle(open) {
    root.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', open);
    if (open) {
      if (!booted) {
        booted = true;
        print(fmt('**JP\'s terminal** v1.0 — a scripted Q&A bot, no AI, no tracking.'), 's');
        print(fmt('Ask about the resume, {{projects}}, {{johnoffthewall}}, or common {{interview}} questions. Type {{help}} anytime.'));
      }
      setTimeout(() => input.focus(), 30);
    } else fab.focus();
  }

  function run(q) {
    q = q.trim();
    if (!q) return;
    print(esc(q), 'u');
    hist.push(q); hi = hist.length;
    const n = norm(q);
    if (n === 'clear' || n === 'cls') { out.innerHTML = ''; return; }
    if (['exit', 'quit', 'q', ':q', 'close'].includes(n)) { toggle(false); return; }
    const wait = reduce ? 0 : 220;
    const dots = wait ? print('<span class="jpt-dots">thinking</span>', 's') : null;
    setTimeout(() => {
      if (dots) dots.remove();
      const e = find(q);
      if (e) print(fmt(e.a));
      else print(fmt('command not found: **' + q.slice(0, 40) + '**\nI only know JP\'s resume, projects and interview answers. Try {{help}}, {{interview}} or {{contact}} JP directly.'));
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
    if (ev.key === 'Enter') { run(input.value); input.value = ''; }
    else if (ev.key === 'ArrowUp') { if (hi > 0) input.value = hist[--hi]; ev.preventDefault(); }
    else if (ev.key === 'ArrowDown') { input.value = hi < hist.length - 1 ? hist[++hi] : (hi = hist.length, ''); ev.preventDefault(); }
    else if (ev.key === 'Tab') {
      ev.preventDefault();
      const v = norm(input.value); if (!v) return;
      const all = [...new Set(E.flatMap(e => e.cmd))].filter(c => c.startsWith(v));
      if (all.length) input.value = all[0];
    } else if (ev.key === 'l' && ev.ctrlKey) { ev.preventDefault(); out.innerHTML = ''; }
  });

  window.jptOpen = () => toggle(true); // optional: call from any link/button
})();
