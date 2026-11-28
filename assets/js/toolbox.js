/* Toolbox catalog: shared data + desktop App Manager applet. */
(() => {
 'use strict';
 const TOOLS = [
 {name:'Google Search Console',cat:'SEO & Analytics',desc:'Search performance and indexing insights; reporting workflows are still developing.',level:'Developing',slug:'googlesearchconsole'},
 {name:'Google Analytics 4',cat:'SEO & Analytics',desc:'Hands-on setup and tracking configuration; report building is still developing.',level:'Hands-on setup',slug:'googleanalytics'},
 {name:'Google Tag Manager',cat:'SEO & Analytics',desc:'Configure tags, triggers and variables for measurement.',level:'Hands-on',slug:'googletagmanager'},
 {name:'Screaming Frog SEO Spider',cat:'SEO & Analytics',desc:'Website crawling, technical SEO analysis and crawl-based reporting.',level:'Hands-on',slug:'screamingfrog'},
 {name:'Ahrefs',cat:'SEO & Analytics',desc:'Backlink analysis, domain metrics, keyword and competitor research.',level:'Used',slug:'ahrefs'},
 {name:'SEMrush',cat:'SEO & Analytics',desc:'SEO research workflows including keywords, backlinks and competitors.',level:'Used',slug:'semrush'},
 {name:'Moz',cat:'SEO & Analytics',desc:'SEO research using domain metrics, backlink and keyword analysis.',level:'Used',slug:'moz'},
 {name:'RustySEO',cat:'SEO & Analytics',desc:'SEO analysis and research workflows.',level:'Used',slug:''},
 {name:'Sitebulb',cat:'SEO & Analytics',desc:'Familiar with its website auditing and visualization workflows.',level:'Familiar',slug:'sitebulb'},
 {name:'Google Keyword Planner',cat:'SEO & Analytics',desc:'Keyword discovery and search-demand research.',level:'Used',slug:'googleads'},
 {name:'Looker Studio',cat:'SEO & Analytics',desc:'Dashboard and reporting fundamentals covered in training; no hands-on reporting project yet.',level:'Training',slug:'lookerstudio'},
 {name:'PageSpeed Insights',cat:'SEO & Analytics',desc:'Page performance insights and Core Web Vitals checks.',level:'Used',slug:'pagespeedinsights'},
 {name:'GTmetrix',cat:'SEO & Analytics',desc:'Performance testing and page-load diagnostics.',level:'Used',slug:'gtmetrix'},
 {name:'Rich Results Test',cat:'SEO & Analytics',desc:'Validate structured data eligibility and markup issues.',level:'Used',slug:'google'},
 {name:'Schema Markup Validator',cat:'SEO & Analytics',desc:'Inspect and validate schema markup.',level:'Used',slug:'schemaorg'},
 {name:'WordPress',cat:'Web Development & CMS',desc:'Website development, customization and CMS management.',level:'Hands-on',slug:'wordpress'},
 {name:'LocalWP',cat:'Web Development & CMS',desc:'Local WordPress development and testing environments.',level:'Hands-on',slug:'local'},
 {name:'Elementor',cat:'Web Development & CMS',desc:'WordPress page building and layout customization.',level:'Used',slug:'elementor'},
 {name:'Yoast SEO',cat:'Web Development & CMS',desc:'WordPress SEO configuration and on-page optimization.',level:'Used',slug:'yoast'},
 {name:'Rank Math',cat:'Web Development & CMS',desc:'Preferred WordPress SEO plugin for on-page optimization and configuration.',level:'Preferred',slug:'rankmath'},
 {name:'HTML, CSS & JavaScript',cat:'Web Development & CMS',desc:'Modify, troubleshoot and adapt code, with AI assistance for more complex implementations.',level:'Developing',slug:'html5'},
 {name:'Git & GitHub',cat:'Web Development & CMS',desc:'Version control, repositories and collaboration workflows.',level:'Used',slug:'github'},
 {name:'GitHub Pages',cat:'Web Development & CMS',desc:'Publish and host static websites.',level:'Used',slug:'github'},
 {name:'Render',cat:'Web Development & CMS',desc:'Deploy and host web applications.',level:'Used',slug:'render'},
 {name:'ChatGPT',cat:'AI & AI-assisted Workflow',desc:'Content writing, prompt engineering, research, brainstorming and coding assistance.',level:'Used',slug:'openai'},
 {name:'Gemini',cat:'AI & AI-assisted Workflow',desc:'Content writing, prompt engineering, research, brainstorming and coding assistance.',level:'Used',slug:'googlegemini'},
 {name:'Claude',cat:'AI & AI-assisted Workflow',desc:'AI-assisted project work, research, writing and development support.',level:'Used',slug:'claude'},
 {name:'Claude Code',cat:'AI & AI-assisted Workflow',desc:'AI-assisted website development, code implementation, debugging and project work.',level:'Used',slug:'claude'},
 {name:'Photoshop',cat:'Creative & Media',desc:'Photo editing and image manipulation for personal projects.',level:'Personal projects',slug:'adobephotoshop'},
 {name:'DaVinci Resolve',cat:'Creative & Media',desc:'Video editing and creative media projects.',level:'Personal projects',slug:'davinciresolve'},
 {name:'Canva',cat:'Creative & Media',desc:'Graphic design and visual content for personal projects.',level:'Personal projects',slug:'canva'},
 {name:'CapCut',cat:'Creative & Media',desc:'Video editing for personal projects.',level:'Personal projects',slug:'capcut'},
 {name:'Lightroom',cat:'Creative & Media',desc:'Photo processing and editing for personal projects.',level:'Personal projects',slug:'adobelightroom'}
 ];
 const cats=['SEO & Analytics','Web Development & CMS','AI & AI-assisted Workflow'];
 const root=document.createElement('div');root.id='toolbox-ui';root.innerHTML='<div class="tb-scrim"></div><section class="tb-window" role="dialog" aria-modal="true" aria-label="App Manager"><header class="tb-head"><div><b>App Manager</b><small>My tools and workflow</small></div><button class="tb-close" aria-label="Close">×</button></header><div class="tb-layout"><nav class="tb-nav"></nav><main class="tb-main"><div class="tb-search"><input type="search" placeholder="Search tools…" aria-label="Search tools"></div><div class="tb-results"></div><div class="tb-detail" hidden></div></main></div></section>';
 document.body.append(root);
 const nav=root.querySelector('.tb-nav'),results=root.querySelector('.tb-results'),search=root.querySelector('input'),detail=root.querySelector('.tb-detail');
 cats.forEach((c,i)=>{let b=document.createElement('button');b.textContent=c;b.dataset.cat=c;b.className=i===0?'active':'';nav.append(b)});
 let active=cats[0],query='';
 function logo(t){return t.slug?'<img loading="lazy" alt="" src="https://cdn.simpleicons.org/'+encodeURIComponent(t.slug)+'" onerror="this.hidden=true;this.parentElement.querySelector(\'.tb-fallback\').hidden=false">':'<span class="tb-fallback">◈</span>'}
 function render(){detail.hidden=true;results.hidden=false;results.innerHTML='';let filtered=TOOLS.filter(t=>t.cat===active&&(!query||t.name.toLowerCase().includes(query)||t.desc.toLowerCase().includes(query)));if(!filtered.length){results.innerHTML='<p class="tb-empty">No matching tools.</p>';return}filtered.forEach(t=>{let b=document.createElement('button');b.className='tb-card';b.innerHTML='<span class="tb-logo">'+logo(t)+'<span class="tb-fallback" hidden>◈</span></span><span class="tb-cardtxt"><b></b><small></small></span><span class="tb-level"></span>';b.querySelector('b').textContent=t.name;b.querySelector('small').textContent=t.desc;b.querySelector('.tb-level').textContent=t.level;b.onclick=()=>show(t);results.append(b)})}
 function show(t){detail.hidden=false;detail.innerHTML='<button class="tb-back">‹ Back to catalog</button><div class="tb-detailhead"><span class="tb-logo">'+logo(t)+'<span class="tb-fallback" hidden>◈</span></span><div><h2></h2><small></small></div></div><p></p><span class="tb-chip"></span>';detail.querySelector('h2').textContent=t.name;detail.querySelector('small').textContent=t.cat;detail.querySelector('p').textContent=t.desc;detail.querySelector('.tb-chip').textContent=t.level;detail.querySelector('.tb-back').onclick=render;results.hidden=true}
 nav.onclick=e=>{let b=e.target.closest('[data-cat]');if(!b)return;active=b.dataset.cat;nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render()};
 search.oninput=()=>{query=search.value.trim().toLowerCase();render()};
 function open(){root.classList.add('open');active=cats[0];query='';search.value='';nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.cat===active));results.hidden=false;render();search.focus()}
 function close(){root.classList.remove('open')}
 root.querySelector('.tb-close').onclick=close;root.querySelector('.tb-scrim').onclick=close;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('open'))close()});
 document.addEventListener('click',e=>{if(e.target.closest('[data-toolbox-open]')){e.preventDefault();open()}});
 window.ToolboxManager={open,close,tools:TOOLS};
})();