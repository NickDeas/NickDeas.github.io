/**
 * toc.js
 * ---------------------------------------------------------------------
 * Builds the table of contents from the article's h2/h3 headings and
 * highlights the section currently in view. No configuration needed —
 * just write normal <h2>/<h3> headings inside .article-body and this
 * populates <nav class="toc-list"> automatically.
 */

(function () {
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function buildToc() {
    const article = document.querySelector(".article-body");
    const tocList = document.getElementById("toc-list");
    if (!article || !tocList) return;

    const headings = Array.from(article.querySelectorAll("h2, h3"));
    if (headings.length === 0) {
      tocList.closest(".toc")?.setAttribute("hidden", "");
      return;
    }

    const usedIds = new Set();
    const rootUl = document.createElement("ul");
    let currentH2Li = null;
    let currentH2Ul = null;

    headings.forEach((heading) => {
      if (!heading.id) {
        let base = slugify(heading.textContent);
        let id = base;
        let n = 2;
        while (usedIds.has(id) || document.getElementById(id)) {
          id = `${base}-${n++}`;
        }
        heading.id = id;
      }
      usedIds.add(heading.id);

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${heading.id}`;
      a.textContent = heading.textContent;
      li.appendChild(a);

      if (heading.tagName === "H2") {
        rootUl.appendChild(li);
        currentH2Li = li;
        currentH2Ul = null;
      } else {
        // H3: nest under the most recent H2, creating a sub-list on demand.
        if (!currentH2Li) {
          rootUl.appendChild(li); // orphan h3 before any h2 — still show it
          return;
        }
        if (!currentH2Ul) {
          currentH2Ul = document.createElement("ul");
          currentH2Li.appendChild(currentH2Ul);
        }
        currentH2Ul.appendChild(li);
      }
    });

    tocList.appendChild(rootUl);
    setupScrollSpy(headings);
  }

  function setupScrollSpy(headings) {
    const links = new Map(
      Array.from(document.querySelectorAll(".toc-list a")).map((a) => [
        a.getAttribute("href").slice(1),
        a,
      ])
    );

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = links.get(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            document.querySelectorAll(".toc-list a.active").forEach((a) => a.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildToc);
  } else {
    buildToc();
  }
})();
