(function () {
	"use strict";

	/* ---- Theme toggle -----------------------------------------------
	   Persists an explicit choice in localStorage; falls back to the
	   system preference (handled entirely in CSS) when nothing is set. */
	var root = document.documentElement;
	var toggleBtn = document.querySelector(".theme-toggle");

	function applyTheme(theme) {
		if (theme === "dark" || theme === "light") {
			root.setAttribute("data-theme", theme);
		} else {
			root.removeAttribute("data-theme");
		}
		if (toggleBtn) {
			var isDark = theme === "dark" ||
				(!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
			toggleBtn.textContent = isDark ? "☀" : "☽"; /* sun / moon */
			toggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
		}
	}

	var stored = null;
	try { stored = localStorage.getItem("theme"); } catch (e) { /* storage unavailable */ }
	applyTheme(stored);

	if (toggleBtn) {
		toggleBtn.addEventListener("click", function () {
			var current = root.getAttribute("data-theme");
			var isDark = current === "dark" ||
				(!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
			var next = isDark ? "light" : "dark";
			applyTheme(next);
			try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
		});
	}

	/* ---- Publication filter ------------------------------------------
	   Chips toggle multi-select; an item shows if it carries ANY active
	   tag, or if "All" is selected. */
	var filterBar = document.querySelector(".filter-bar");
	if (!filterBar) return;

	var chips = Array.prototype.slice.call(filterBar.querySelectorAll(".chip"));
	var pubItems = Array.prototype.slice.call(document.querySelectorAll(".pub-item"));
	var countEl = document.querySelector(".pub-count");
	var active = new Set(["all"]);

	function render() {
		var visible = 0;
		pubItems.forEach(function (item) {
			var tags = (item.getAttribute("data-tags") || "").split(/\s+/);
			var show = active.has("all") || tags.some(function (t) { return active.has(t); });
			item.classList.toggle("is-hidden", !show);
			if (show) visible++;
		});

		chips.forEach(function (chip) {
			chip.classList.toggle("is-active", active.has(chip.getAttribute("data-filter")));
		});

		if (countEl) {
			countEl.textContent = active.has("all")
				? "Showing all " + pubItems.length + " publications"
				: "Showing " + visible + " of " + pubItems.length + " publications";
		}
	}

	chips.forEach(function (chip) {
		chip.addEventListener("click", function () {
			var filter = chip.getAttribute("data-filter");

			if (filter === "all") {
				active = new Set(["all"]);
			} else {
				active.delete("all");
				if (active.has(filter)) {
					active.delete(filter);
				} else {
					active.add(filter);
				}
				if (active.size === 0) active.add("all");
			}

			render();
		});
	});

	render();
})();
