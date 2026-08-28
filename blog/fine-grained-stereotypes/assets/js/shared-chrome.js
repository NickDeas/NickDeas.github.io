/**
 * shared-chrome.js
 * ---------------------------------------------------------------------
 * Defines <site-header> and <site-footer> custom elements so every page
 * shares one nav/footer definition without a build step or fetch()-based
 * include (which breaks over file:// and adds a flash-of-missing-chrome).
 *
 * Usage, on any page:
 *   <site-header root="./" current="index"></site-header>
 *   <site-footer root="./"></site-footer>
 *
 * `root`    — relative path prefix back to the site root from this page.
 *             Use "./" at the root, "../" one level deep (e.g. pages/),
 *             "../../" two levels deep, etc.
 * `current` — id of the nav entry to mark aria-current="page". Matches
 *             the `key` values in NAV_LINKS below.
 *
 * To add/rename pages, edit NAV_LINKS once — it's used on every page.
 */

const NAV_LINKS = [
  { key: "index", label: "Article", href: "index.html" },
  // Add further pages here, e.g.:
  // { key: "methods", label: "Methods", href: "pages/methods.html" },
];

const SITE_TITLE = "Project Name — Fine-Grained Stereotypes in LLMs";
const SITE_SHORT_TITLE = "Fine-Grained LLM Stereotypes";
const REPO_URL = "https://github.com/your-org/your-repo"; // TODO: update

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const root = this.getAttribute("root") || "./";
    const current = this.getAttribute("current") || "";

    const navHtml = NAV_LINKS.map((link) => {
      const href = root + link.href;
      const isCurrent = link.key === current;
      return `<a href="${href}"${isCurrent ? ' aria-current="page"' : ""}>${link.label}</a>`;
    }).join("");

    this.innerHTML = `
      <div class="site-header-inner">
        <a class="site-title" href="${root}index.html">${SITE_SHORT_TITLE}</a>
        <nav class="site-nav" aria-label="Primary">
          ${navHtml}
        </nav>
        <button class="theme-toggle" type="button" aria-label="Toggle dark mode">◐ Theme</button>
      </div>
    `;

    this.querySelector(".theme-toggle").addEventListener("click", toggleTheme);
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const root = this.getAttribute("root") || "./";
    const year = new Date().getFullYear();
    this.innerHTML = `
      <p>
        &copy; ${year} ${SITE_TITLE}. ·
        <a href="${REPO_URL}" target="_blank" rel="noopener">Source on GitHub</a> ·
        Built with a self-styled Distill-lineage template.
      </p>
    `;
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  if (next === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
  try {
    localStorage.setItem("theme", next);
  } catch (e) {
    /* localStorage may be unavailable (privacy mode, sandboxed iframe) — theme
       toggle still works for the session, it just won't persist. */
  }
}

// Apply saved theme before paint as much as possible; this script is loaded
// with `defer` so it runs after parse but still before most content paints.
(function restoreTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {
    /* ignore */
  }
})();

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
