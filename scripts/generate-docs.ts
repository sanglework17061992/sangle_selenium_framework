import * as fs from 'fs';
import * as path from 'path';

interface DocItem {
  id: string;
  title: string;
  file: string;
  children?: DocItem[];
}

const docsStructure: DocItem[] = [
  {
    id: 'intro',
    title: 'Introduction',
    file: 'docs/01-introduction.md'
  },
  {
    id: 'installation',
    title: 'Installation',
    file: 'docs/02-installation.md'
  },
  {
    id: 'writing-tests',
    title: 'Writing Tests',
    file: 'docs/03-writing-tests.md'
  },
  {
    id: 'page-objects',
    title: 'Page Objects',
    file: 'docs/04-page-objects.md'
  },
  {
    id: 'assertions',
    title: 'Assertions',
    file: 'docs/05-assertions.md'
  },
  {
    id: 'advanced',
    title: 'Advanced Topics',
    file: 'docs/06-advanced.md'
  },
  {
    id: 'auto-wait',
    title: 'Auto-Wait Feature',
    file: 'docs/07-auto-wait.md'
  },
  {
    id: 'auto-retry',
    title: 'Auto-Retry Feature',
    file: 'docs/08-auto-retry.md'
  },
  {
    id: 'architecture',
    title: 'Architecture & Class Diagram',
    file: 'docs/09-architecture.md'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    file: 'docs/10-troubleshooting.md'
  }
];

function generateSidebar(currentId: string): string {
  let html = '<nav class="sidebar-nav">\n';
  html += '<div class="sidebar-header">\n';
  html += '<h2>Documentation</h2>\n';
  html += '</div>\n';
  html += '<ul class="nav-list">\n';

  docsStructure.forEach(item => {
    const isActive = currentId === item.id;
    const activeClass = isActive ? ' active' : '';
    html += `<li class="nav-item${activeClass}">\n`;
    html += `<a href="${item.id}.html" class="nav-link${activeClass}">\n`;
    html += `${item.title}\n`;
    html += '</a>\n';
    html += '</li>\n';
  });

  html += '</ul>\n';
  html += '</nav>\n';
  return html;
}

function generateTableOfContents(markdown: string): string {
  const lines = markdown.split('\n');
  let toc = '<div class="toc">\n<h3>On this page</h3>\n<ul>\n';

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const title = line.replace('## ', '').trim();
      const id = title.toLowerCase().replace(/\s+/g, '-');
      toc += `<li><a href="#${id}">${title}</a></li>\n`;
    }
  }

  toc += '</ul>\n</div>\n';
  return toc;
}

function addHeadingIds(html: string): string {
  // Add IDs to h2 headings based on their content
  return html.replace(/<h2>([^<]+)<\/h2>/g, (match, content) => {
    const id = content.trim().toLowerCase().replace(/\s+/g, '-');
    return `<h2 id="${id}">${content}</h2>`;
  });
}

function markdownToHtml(markdown: string): string {
  let html = markdown;
  const codeBlockPlaceholders: Map<string, string> = new Map();
  let blockIndex = 0;

  // Extract code blocks and replace with placeholders
  html = html.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `___CODE_BLOCK_${blockIndex}___`;
    codeBlockPlaceholders.set(placeholder, `<pre><code class="language-${lang}">${code}</code></pre>`);
    blockIndex++;
    return placeholder;
  });

  html = html.replace(/```\n([\s\S]*?)```/g, (match, code) => {
    const placeholder = `___CODE_BLOCK_${blockIndex}___`;
    codeBlockPlaceholders.set(placeholder, `<pre><code>${code}</code></pre>`);
    blockIndex++;
    return placeholder;
  });

  // Headers (now safe, code blocks are protected)
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Blockquotes (before lists to avoid conflicts)
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists (handle both * and - bullets) - use marker to distinguish from ordered
  html = html.replace(/^[*-] (.*?)$/gm, '<UL_ITEM>$1</UL_ITEM>');
  // Wrap consecutive unordered list items with <ul></ul>
  html = html.replace(/(<UL_ITEM>(?:.*?<\/UL_ITEM>)+)/s, '<ul>$1</ul>');
  html = html.replace(/<UL_ITEM>(.*?)<\/UL_ITEM>/g, '<li>$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*?)$/gm, '<OL_ITEM>$1</OL_ITEM>');
  // Wrap consecutive ordered list items with <ol></ol>
  html = html.replace(/(<OL_ITEM>(?:.*?<\/OL_ITEM>)+)/s, '<ol>$1</ol>');
  html = html.replace(/<OL_ITEM>(.*?)<\/OL_ITEM>/g, '<li>$1</li>');

  // Paragraphs (after lists to avoid breaking them)
  // But protect code block placeholders
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/<p>(___CODE_BLOCK_\d+___)<\/p>/g, '$1');
  html = '<p>' + html + '</p>';

  // Clean up
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<ul><li>/g, '<ul>\n<li>');
  html = html.replace(/<\/li><li>/g, '</li>\n<li>');
  html = html.replace(/<\/li><\/ul>/g, '</li>\n</ul>');
  html = html.replace(/<ol><li>/g, '<ol>\n<li>');
  html = html.replace(/<\/li><li>/g, '</li>\n<li>');
  html = html.replace(/<\/li><\/ol>/g, '</li>\n</ol>');
  html = html.replace(/<p><ul>/g, '<ul>');
  html = html.replace(/<\/ul><\/p>/g, '</ul>');
  html = html.replace(/<p><ol>/g, '<ol>');
  html = html.replace(/<\/ol><\/p>/g, '</ol>');
  html = html.replace(/<p>(___CODE_BLOCK_\d+___)<\/p>/g, '$1');

  // Restore code blocks from placeholders
  codeBlockPlaceholders.forEach((codeBlockHtml, placeholder) => {
    html = html.replace(new RegExp(placeholder, 'g'), codeBlockHtml);
  });

  return html;
}

async function generateHTML(item: DocItem, markdown: string): Promise<string> {
  // Use simple markdown parser instead of marked
  let content = markdownToHtml(markdown);
  
  // Convert markdown links to html links
  const linkMap: { [key: string]: string } = {
    '01-introduction.md': 'intro.html',
    '02-installation.md': 'installation.html',
    '03-writing-tests.md': 'writing-tests.html',
    '04-page-objects.md': 'page-objects.html',
    '05-assertions.md': 'assertions.html',
    '06-advanced.md': 'advanced.html',
    '07-auto-wait.md': 'auto-wait.html',
    '08-auto-retry.md': 'auto-retry.html',
    '09-architecture.md': 'architecture.html',
    '10-troubleshooting.md': 'troubleshooting.html',
  };

  for (const [mdFile, htmlFile] of Object.entries(linkMap)) {
    content = content.replace(new RegExp(`href="${mdFile}"`, 'g'), `href="${htmlFile}"`);
  }
  
  content = addHeadingIds(content);
  const sidebar = generateSidebar(item.id);
  const toc = generateTableOfContents(markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="SaniumTS Selenium Framework - ${item.title}">
  <meta name="og:title" content="${item.title} - SaniumTS Framework Documentation">
  <meta name="og:description" content="Comprehensive guide for ${item.title}">
  <title>${item.title} - SaniumTS Framework Documentation</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%230078d4'>S</text></svg>">
</head>
<body>
  <div class="container">
    ${sidebar}
    <main class="main-content">
      <header class="page-header">
        <h1>${item.title}</h1>
        <nav class="breadcrumb">
          <a href="intro.html">Home</a>
          <span>/</span>
          <span>${item.title}</span>
        </nav>
      </header>

      <div class="content-wrapper">
        ${toc}
        <article class="markdown-content">
          ${content}
        </article>
      </div>

      <footer class="page-footer">
        <div class="footer-nav">
          ${getPrevNext(item.id)}
        </div>
        <p class="footer-text">SaniumTS Selenium Framework Documentation | Last updated: ${new Date().toISOString().split('T')[0]}</p>
      </footer>
    </main>
  </div>
  <script src="docs.js"></script>
</body>
</html>`;
}

function getPrevNext(currentId: string): string {
  const currentIndex = docsStructure.findIndex(item => item.id === currentId);
  let html = '';

  if (currentIndex > 0) {
    const prev = docsStructure[currentIndex - 1];
    html += `<a href="${prev.id}.html" class="nav-prev">Previous: ${prev.title}</a>`;
  }

  if (currentIndex < docsStructure.length - 1) {
    const next = docsStructure[currentIndex + 1];
    html += `<a href="${next.id}.html" class="nav-next">Next: ${next.title}</a>`;
  }

  return html;
}

async function generateDocs(): Promise<void> {
  const outDir = 'docs-html';

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Generate each doc page
  for (const item of docsStructure) {
    const mdPath = path.join(process.cwd(), item.file);
    if (!fs.existsSync(mdPath)) {
      console.warn(`Missing: ${mdPath}`);
      continue;
    }

    const markdown = fs.readFileSync(mdPath, 'utf-8');
    const html = await generateHTML(item, markdown);
    const outPath = path.join(outDir, `${item.id}.html`);

    fs.writeFileSync(outPath, html);
    console.log(`Generated: ${outPath}`);
  }

  // Copy styles
  const cssPath = path.join(outDir, 'styles.css');
  fs.writeFileSync(cssPath, getStylesCSS());
  console.log(`Generated: ${cssPath}`);

  // Generate JavaScript helper
  const jsPath = path.join(outDir, 'docs.js');
  fs.writeFileSync(jsPath, getDocsJS());
  console.log(`Generated: ${jsPath}`);

  // Generate index.html redirect
  const indexPath = path.join(outDir, 'index.html');
  fs.writeFileSync(indexPath, `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=intro.html">
  <title>Redirect</title>
</head>
<body>
  Redirecting to <a href="intro.html">documentation</a>...
</body>
</html>`);
  console.log(`Generated: ${indexPath}`);

  console.log('\nDocumentation generated successfully!');
  console.log(`Open: file://${path.resolve(outDir, 'index.html')}\n`);
}

function getDocsJS(): string {
  return `// Documentation interactivity
document.addEventListener('DOMContentLoaded', function() {
  // Syntax highlighting for code blocks
  const codeBlocks = document.querySelectorAll('pre code');
  codeBlocks.forEach(block => {
    if (!block.classList.contains('hljs')) {
      block.classList.add('plain-code');
    }
  });

  // Add copy button to code blocks
  const preBlocks = document.querySelectorAll('pre');
  preBlocks.forEach((pre, index) => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.type = 'button';
    copyBtn.setAttribute('data-block', index);
    
    copyBtn.addEventListener('click', function() {
      const code = pre.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      });
    });
    
    pre.style.position = 'relative';
    pre.appendChild(copyBtn);
  });

  // Smooth scrolling for TOC links
  document.querySelectorAll('.toc a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.getAttribute('href').substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Active TOC highlighting
  const headings = document.querySelectorAll('.markdown-content h2, .markdown-content h3');
  const tocLinks = document.querySelectorAll('.toc a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(\`.toc a[href="#\${entry.target.id}"]\`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, { rootMargin: '-50px 0px -66%' });

  headings.forEach(heading => observer.observe(heading));

  // Mobile menu toggle
  const sidebarToggle = document.createElement('button');
  sidebarToggle.className = 'sidebar-toggle';
  sidebarToggle.innerHTML = 'Menu';
  sidebarToggle.addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar-nav');
    sidebar.classList.toggle('open');
  });

  // Add toggle button to header on mobile
  if (window.innerWidth < 768) {
    document.querySelector('.page-header').appendChild(sidebarToggle);
  }

  // Close sidebar when clicking a link
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelector('.sidebar-nav').classList.remove('open');
    });
  });
});
`;
}

function getStylesCSS(): string {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #0078d4;
  --text-color: #333;
  --bg-color: #fff;
  --border-color: #e0e0e0;
  --sidebar-bg: #f5f5f5;
  --hover-bg: #f0f0f0;
  --code-bg: #f6f8fa;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
}

.container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar-nav {
  width: 280px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 20px;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
}

.sidebar-header {
  margin-bottom: 30px;
}

.sidebar-header h2 {
  font-size: 18px;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.nav-list {
  list-style: none;
}

.nav-item {
  margin-bottom: 8px;
}

.nav-link {
  display: block;
  padding: 10px 12px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.nav-link:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

.nav-item.active .nav-link,
.nav-link.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 40px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.page-header h1 {
  font-size: 32px;
  margin-bottom: 12px;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: var(--primary-color);
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb span {
  margin: 0 8px;
}

.content-wrapper {
  display: flex;
  flex: 1;
  padding: 40px;
  gap: 40px;
}

.toc {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: 40px;
  height: fit-content;
}

.toc h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-color);
}

.toc ul {
  list-style: none;
  font-size: 13px;
}

.toc li {
  margin-bottom: 8px;
}

.toc a {
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.toc a:hover {
  color: var(--primary-color);
}

.toc a.active {
  color: var(--primary-color);
  font-weight: 600;
  border-left: 3px solid var(--primary-color);
  padding-left: 8px;
  margin-left: -11px;
}

.markdown-content {
  flex: 1;
  max-width: 800px;
  line-height: 1.6;
}

.markdown-content h1 {
  font-size: 28px;
  margin: 32px 0 16px 0;
  line-height: 1.3;
}

.markdown-content h2 {
  font-size: 24px;
  margin: 28px 0 12px 0;
  line-height: 1.3;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.markdown-content h3 {
  font-size: 20px;
  margin: 20px 0 8px 0;
  line-height: 1.3;
}

.markdown-content p {
  margin-bottom: 16px;
}

.markdown-content ul, .markdown-content ol {
  margin: 16px 0;
  padding-left: 24px;
}

.markdown-content li {
  margin-bottom: 8px;
}

.markdown-content code {
  background-color: var(--code-bg);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #d73a49;
}

.markdown-content pre {
  background-color: var(--code-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
  position: relative;
  font-size: 13px;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

pre:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background-color: #005a9c;
}

.markdown-content pre code {
  background-color: transparent;
  color: var(--text-color);
  padding: 0;
  font-family: 'Courier New', Courier, monospace;
}

.markdown-content pre code.plain-code {
  display: block;
  overflow-x: auto;
}

.markdown-content blockquote {
  border-left: 4px solid var(--border-color);
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
  font-style: italic;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.markdown-content th, .markdown-content td {
  border: 1px solid var(--border-color);
  padding: 12px;
  text-align: left;
}

.markdown-content th {
  background-color: var(--code-bg);
  font-weight: 600;
}

.page-footer {
  padding: 40px;
  border-top: 1px solid var(--border-color);
  background-color: var(--sidebar-bg);
  margin-top: auto;
}

.footer-nav {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.nav-prev, .nav-next {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.nav-prev:hover, .nav-next:hover {
  text-decoration: underline;
}

.footer-text {
  font-size: 12px;
  color: #999;
}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
    gap: 20px;
  }

  .toc {
    width: 100%;
    position: static;
    background-color: var(--sidebar-bg);
    padding: 20px;
    border-radius: 6px;
  }

  .markdown-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .sidebar-nav {
    position: fixed;
    width: 280px;
    height: 100vh;
    left: -280px;
    z-index: 1000;
    transition: left 0.3s ease;
  }

  .sidebar-nav.open {
    left: 0;
  }

  .sidebar-toggle {
    display: block;
    padding: 8px 16px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-left: 12px;
  }

  .sidebar-toggle:hover {
    background-color: #005a9c;
  }

  .container {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0;
  }

  .content-wrapper {
    padding: 20px;
  }

  .page-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-header h1 {
    font-size: 24px;
    margin: 0;
  }

  .breadcrumb {
    font-size: 12px;
  }
}
`;
}

// Run generator
generateDocs().catch(error => {
  console.error('Error generating documentation:', error);
  process.exit(1);
});

