import { useState } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown,
  Code2, Command, Copy, Database, Github, Layers3, Menu, Route,
  Search, ShieldCheck, Sparkles, Terminal, X,
} from 'lucide-react';

const sections = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'routing', label: 'Routing', icon: Route },
  { id: 'controllers', label: 'Controllers', icon: Code2 },
  { id: 'database', label: 'Database', icon: Database },
];

const topics = {
  overview: {
    eyebrow: 'THE FIELD GUIDE · 01',
    title: <>A little less<br /><span>framework.</span></>,
    description: 'Everything you need to build structured PHP applications, without the weight you don’t.',
    file: 'app/controllers/Welcome.php',
    code: [
      ['kw', '<?php'],
      ['plain', ''],
      ['kw', 'class '], ['class', 'Welcome '], ['kw', 'extends '], ['class', 'Controller'],
      ['plain', '{'],
      ['indent', '    '], ['kw', 'public function '], ['fn', 'index'], ['plain', '()'],
      ['indent', '    {'],
      ['indent', '        '], ['this', '$this'], ['plain', '->call->view('], ['str', "'welcome'"], ['plain', ');'],
      ['indent', '    }'],
      ['plain', '}'],
    ],
    note: 'Your first controller is already a complete starting point.',
  },
  routing: {
    eyebrow: 'THE FIELD GUIDE · 02',
    title: <>Routes with<br /><span>clear intent.</span></>,
    description: 'Map a URL to exactly the action that should handle it. Keep the entry points readable.',
    file: 'app/config/routes.php',
    code: [
      ['kw', '<?php'], ['plain', ''],
      ['var', '$router'], ['plain', '->get('], ['str', "'/'"], ['plain', ', '], ['str', "'Welcome::index'"], ['plain', ');'],
      ['var', '$router'], ['plain', '->get('], ['str', "'/about'"], ['plain', ', '], ['str', "'Welcome::about'"], ['plain', ');'],
      ['var', '$router'], ['plain', '->post('], ['str', "'/users/store'"], ['plain', ', '], ['str', "'Users::store'"], ['plain', ');'],
      ['plain', ''], ['cm', '// One route, one clear destination.'],
    ],
    note: 'Register routes in one place, then let the framework do the rest.',
  },
  controllers: {
    eyebrow: 'THE FIELD GUIDE · 03',
    title: <>Actions that<br /><span>stay focused.</span></>,
    description: 'Controllers connect requests to the right view or model, and keep each job easy to follow.',
    file: 'app/controllers/Welcome.php',
    code: [
      ['kw', '<?php'], ['plain', ''],
      ['kw', 'class '], ['class', 'Welcome '], ['kw', 'extends '], ['class', 'Controller'],
      ['plain', '{'],
      ['indent', '    '], ['kw', 'public function '], ['fn', 'about'], ['plain', '()'],
      ['indent', '    {'],
      ['indent', '        '], ['this', '$this'], ['plain', '->call->view('], ['str', "'about'"], ['plain', ');'],
      ['indent', '    }'], ['plain', '}'],
    ],
    note: 'Keep request handling predictable and your views easy to reuse.',
  },
  database: {
    eyebrow: 'THE FIELD GUIDE · 04',
    title: <>Data access,<br /><span>no detours.</span></>,
    description: 'Use a familiar, readable query interface to work with the database from your models.',
    file: 'app/models/User_model.php',
    code: [
      ['kw', '<?php'], ['plain', ''],
      ['kw', 'class '], ['class', 'User_model '], ['kw', 'extends '], ['class', 'Model'],
      ['plain', '{'],
      ['indent', '    '], ['kw', 'protected '], ['$this', '$table'], ['plain', ' = '], ['str', "'users'"], ['plain', ';'],
      ['indent', ''], ['indent', '    '], ['kw', 'public function '], ['fn', 'all'], ['plain', '()'],
      ['indent', '    {'],
      ['indent', '        '], ['kw', 'return '], ['this', '$this'], ['plain', '->db->table('], ['this', '$this'], ['plain', '->table)->get();'],
      ['indent', '    }'], ['plain', '}'],
    ],
    note: 'Put persistence rules in models and keep controllers lean.',
  },
};

const features = [
  { icon: Route, title: 'Routing', text: 'Readable URL maps with flexible request handling.', number: '01' },
  { icon: Layers3, title: 'MVC structure', text: 'A place for every piece, from model to view.', number: '02' },
  { icon: Database, title: 'Database tools', text: 'Straightforward queries and migration support.', number: '03' },
  { icon: ShieldCheck, title: 'Built-in security', text: 'Practical safeguards for everyday applications.', number: '04' },
];

function CodePreview({ topic }) {
  return (
    <div className="code-window">
      <div className="code-topbar">
        <div className="window-lights"><i /><i /><i /></div>
        <span className="code-path">{topic.file}</span>
        <span className="php-mark">PHP</span>
      </div>
      <pre className="code-content"><code>{topic.code.map(([kind, text], index) => (
        <span className={`syntax-${kind}`} key={`${kind}-${index}`}>{text}{'\n'}</span>
      ))}</code></pre>
      <div className="code-footer"><span className="live-dot" /> A good place to begin <span className="code-lines">PHP 7.4+</span></div>
    </div>
  );
}

function App() {
  const [active, setActive] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const topic = topics[active];
  const filteredSections = sections.filter((section) => section.label.toLowerCase().includes(search.toLowerCase()));

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText('git clone https://github.com/ronmarasigan/lavalust.git');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function selectSection(id) {
    setActive(id);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#top" onClick={() => selectSection('overview')}>
          <span className="brand-mark"><span /></span>
          <span className="brand-name">lavalust<span className="brand-period">.</span><small>DEVELOPER GUIDE</small></span>
        </a>
        <button className="mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={19} /></button>

        <div className="sidebar-caption">GETTING STARTED</div>
        <label className="search-box">
          <Search size={15} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a topic" aria-label="Find a topic" />
          <kbd>/</kbd>
        </label>
        <nav className="side-nav" aria-label="Guide sections">
          {filteredSections.map(({ id, label, icon: Icon }, index) => (
            <button className={`side-link ${active === id ? 'is-active' : ''}`} key={id} onClick={() => selectSection(id)}>
              <Icon size={16} strokeWidth={1.7} /><span>{label}</span><span className="side-number">0{index + 1}</span>
            </button>
          ))}
          {filteredSections.length === 0 && <p className="empty-search">No matching topics.</p>}
        </nav>

        <div className="sidebar-bottom">
          <div className="version-card"><span className="version-icon"><Sparkles size={15} /></span><span><b>Made to stay light</b><small>PHP 7.4 and above</small></span><ArrowUpRight size={14} /></div>
          <a className="github-link" href="https://github.com/ronmarasigan/lavalust" target="_blank" rel="noreferrer"><Github size={16} /> View on GitHub <ArrowUpRight size={13} /></a>
        </div>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Guide</span><span className="crumb-slash">/</span><strong>{sections.find((item) => item.id === active)?.label}</strong></div>
          <div className="topbar-right"><span className="status-label"><span /> OPEN SOURCE, OPEN ROAD</span><a href="https://github.com/ronmarasigan/lavalust" target="_blank" rel="noreferrer" className="top-github">GitHub <ArrowUpRight size={14} /></a></div>
        </header>

        <div className="page-content">
          <section className="hero-grid">
            <div className="hero-copy" key={topic.eyebrow}>
              <div className="eyebrow"><span className="eyebrow-line" />{topic.eyebrow}</div>
              <h1>{topic.title}</h1>
              <p className="hero-description">{topic.description}</p>
              <div className="hero-actions">
                <a className="button button-dark" href="#quick-start">Get started <ArrowRight size={16} /></a>
                <a className="text-link" href="https://github.com/ronmarasigan/lavalust" target="_blank" rel="noreferrer">Explore the repo <ArrowUpRight size={15} /></a>
              </div>
              <div className="hero-footnote"><span className="footnote-star">✳</span> Less ceremony. More making.</div>
            </div>
            <div className="hero-art" aria-label="Illustration of the LavaLust framework architecture">
              <div className="art-label art-label-top">YOUR APP, IN GOOD COMPANY</div>
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="orbit-dot orbit-dot-one" /><div className="orbit-dot orbit-dot-two" /><div className="orbit-dot orbit-dot-three" />
              <div className="art-core"><span className="core-flame">⌁</span><b>LAVA<span>LUST</span></b><small>THE LIGHTWEIGHT PHP FRAMEWORK</small></div>
              <div className="orbit-tag tag-top"><Route size={13} /> ROUTES</div>
              <div className="orbit-tag tag-right"><Database size={13} /> DATA</div>
              <div className="orbit-tag tag-bottom"><Layers3 size={13} /> VIEWS</div>
              <span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span>
              <div className="art-label art-label-bottom"><span>01</span> A SIMPLE, SOLID FOUNDATION</div>
            </div>
          </section>

          <section className="quick-start" id="quick-start">
            <div className="section-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" />FIRST THINGS FIRST</div><h2>Up and running<span className="heading-period">.</span></h2></div>
              <span className="step-count"><span>01</span> / 03</span>
            </div>
            <div className="start-row">
              <div className="start-copy"><span className="step-marker"><Terminal size={15} /></span><div><h3>Get the framework</h3><p>Clone the repository and make it yours.</p></div></div>
              <div className="command-bar"><Command size={15} /><code>git clone https://github.com/ronmarasigan/lavalust.git</code><button aria-label="Copy clone command" onClick={copyCommand} title="Copy command">{copied ? <Check size={16} /> : <Copy size={15} />}</button></div>
            </div>
            <div className="next-step"><span>THEN</span><span>Point your web server to the project root</span><ArrowDown size={14} /></div>
          </section>

          <section className="guide-section">
            <div className="section-heading feature-heading"><div><div className="eyebrow"><span className="eyebrow-line" />THE RIGHT AMOUNT OF FRAMEWORK</div><h2>Tools that get out<br />of the way<span className="heading-period">.</span></h2></div><p>Useful conventions and built-in tools, without a mountain of abstractions between you and your app.</p></div>
            <div className="feature-list">{features.map(({ icon: Icon, title, text, number }) => (
              <button className={`feature-row ${active === title.toLowerCase().split(' ')[0] ? 'feature-selected' : ''}`} key={number} onClick={() => selectSection(title === 'MVC structure' ? 'controllers' : title === 'Database tools' ? 'database' : title === 'Routing' ? 'routing' : 'overview')}>
                <span className="feature-number">{number}</span><span className="feature-icon"><Icon size={19} strokeWidth={1.65} /></span><span className="feature-text"><b>{title}</b><small>{text}</small></span><ArrowRight className="feature-arrow" size={17} />
              </button>
            ))}</div>
          </section>

          <section className="code-section">
            <div className="code-intro"><div className="eyebrow"><span className="eyebrow-line" />A TASTE OF THE SYNTAX</div><h2>Familiar from<br />the first line<span className="heading-period">.</span></h2><p>{topic.note}</p><button className="code-topic-select" onClick={() => selectSection(sections[(sections.findIndex((item) => item.id === active) + 1) % sections.length].id)}>Next topic <ArrowRight size={14} /></button></div>
            <CodePreview topic={topic} />
          </section>

          <footer className="footer"><a className="footer-brand" href="#top">lavalust<span>.</span></a><span>Made for builders who like a little less baggage.</span><a href="https://github.com/ronmarasigan/lavalust" target="_blank" rel="noreferrer">Open source, MIT licensed <ArrowUpRight size={13} /></a></footer>
        </div>
      </main>
      {menuOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}

export default App;
