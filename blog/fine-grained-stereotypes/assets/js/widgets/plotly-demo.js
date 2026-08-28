/**
 * plotly-demo.js
 * ---------------------------------------------------------------------
 * Minimal Plotly figure driven by buttons, using Plotly.react (not a full
 * teardown/rebuild) so switching datasets animates smoothly. Copy this
 * pattern for real per-axis stereotype-score distributions: swap
 * DATASET_A / DATASET_B and CATEGORIES for real data, keep the
 * button-wiring structure.
 */

(function () {
  const el = document.getElementById("plotly-canvas");
  if (!el || typeof Plotly === "undefined") return;

  const CATEGORIES = ["profession", "trait", "role", "appearance", "hobby"];
  const DATASET_A = [0.42, 0.31, 0.55, 0.18, 0.27];
  const DATASET_B = [0.12, 0.48, 0.22, 0.51, 0.36];

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function trace(values) {
    return [{
      x: CATEGORIES,
      y: values,
      type: "bar",
      marker: { color: cssVar("--color-accent") },
    }];
  }

  const layout = {
    margin: { t: 20, r: 20, b: 40, l: 48 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { family: cssVar("--font-sans"), color: cssVar("--color-ink") },
    yaxis: { title: "example score", gridcolor: cssVar("--color-border"), zerolinecolor: cssVar("--color-border") },
    xaxis: { gridcolor: cssVar("--color-border") },
  };

  Plotly.newPlot(el, trace(DATASET_A), layout, { displayModeBar: false, responsive: true });

  const btnA = document.getElementById("plotly-dataset-a");
  const btnB = document.getElementById("plotly-dataset-b");

  function setActive(activeBtn, inactiveBtn) {
    activeBtn.classList.add("is-active");
    inactiveBtn.classList.remove("is-active");
  }

  btnA?.addEventListener("click", () => {
    Plotly.react(el, trace(DATASET_A), layout, { displayModeBar: false, responsive: true });
    setActive(btnA, btnB);
  });
  btnB?.addEventListener("click", () => {
    Plotly.react(el, trace(DATASET_B), layout, { displayModeBar: false, responsive: true });
    setActive(btnB, btnA);
  });
})();
