import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';

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

function convertMarkdownLinks(html: string): string {
  // Create a mapping of markdown filenames to HTML IDs
  const linkMap: { [key: string]: string } = {
    '01-introduction.md': 'intro.html',
    '02-installation.md': 'installation.html',
    '03-writing-tests.md': 'writing-tests.html',
    '04-page-objects.md': 'page-objects.html',
    '05-assertions.md': 'assertions.html',
    '06-advanced.md': 'advanced.html',
    '07-auto-wait.md': 'auto-wait.html',
    '08-auto-retry.md': 'auto-retry.html',
    '10-troubleshooting.md': 'troubleshooting.html',
  };

  let result = html;
  for (const [mdFile, htmlFile] of Object.entries(linkMap)) {
    const regex = new RegExp(`href="${mdFile}"`, 'g');
    result = result.replace(regex, `href="${htmlFile}"`);
  }

  return result;
}

async function generateHTML(item: DocItem, markdown: string): Promise<string> {
  const rawContent = await marked(markdown);
  let content = convertMarkdownLinks(String(rawContent));
  content = addHeadingIds(content);
  const sidebar = generateSidebar(item.id);
  const toc = generateTableOfContents(markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item.title} - SaniumTS Framework Documentation</title>
  <link rel="stylesheet" href="styles.css">
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
        <p class="footer-text">SaniumTS Selenium Framework Documentation</p>
      </footer>
    </main>
  </div>
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

  console.log('Documentation generated successfully!');
  console.log(`Open: file://${path.resolve(outDir, 'index.html')}`);
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
}

.markdown-content pre code {
  background-color: transparent;
  color: var(--text-color);
  padding: 0;
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
    position: absolute;
    width: 100%;
    height: auto;
    left: -280px;
    z-index: 1000;
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
  }

  .page-header h1 {
    font-size: 24px;
  }
}
`;
}

// Run generator
generateDocs().catch(error => {
  console.error('Error generating documentation:', error);
  process.exit(1);
});

