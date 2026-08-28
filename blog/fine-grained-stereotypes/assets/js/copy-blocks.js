/**
 * copy-blocks.js
 * ---------------------------------------------------------------------
 * Wires up any button matching `.copy-btn[data-copy-target]` to copy the
 * text content of the element with that id to the clipboard. Used for
 * citation boxes, but works for any block — the markup pattern is:
 *
 *   <div class="citation-box">
 *     <button class="copy-btn" type="button" data-copy-target="my-id">Copy</button>
 *     <pre id="my-id"><code>...text to copy...</code></pre>
 *   </div>
 */

(function () {
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Fallback for non-secure contexts (e.g. plain http://) or older browsers.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(ta);
    }
  }

  document.querySelectorAll(".copy-btn[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = document.getElementById(btn.getAttribute("data-copy-target"));
      if (!target) return;

      try {
        await copyText(target.textContent.trim());
      } catch (err) {
        console.error("Copy failed:", err);
        return;
      }

      const original = btn.textContent;
      btn.textContent = "Copied!";
      btn.classList.add("is-copied");
      window.clearTimeout(btn._copyResetTimer);
      btn._copyResetTimer = window.setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("is-copied");
      }, 1500);
    });
  });
})();
