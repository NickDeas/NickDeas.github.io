/**
 * network-demo.js
 * ---------------------------------------------------------------------
 * Minimal draggable force-directed network using D3 v7. Self-contained
 * proof of concept for the "draggable nodes in a network" widget type —
 * copy this file as a starting point for a real circuit/attribution
 * graph, swapping DEMO_NODES/DEMO_LINKS for real data and the color
 * scale for something dataset-specific.
 */

(function () {
  const svg = document.getElementById("network-canvas");
  if (!svg || typeof d3 === "undefined") return;

  const DEMO_NODES = [
    { id: "L0.H3", group: "head" },
    { id: "L2.H7", group: "head" },
    { id: "L5.H1", group: "head" },
    { id: "MLP.4", group: "mlp" },
    { id: "MLP.9", group: "mlp" },
    { id: "logit: role", group: "output" },
    { id: "logit: trait", group: "output" },
  ];

  const DEMO_LINKS = [
    { source: "L0.H3", target: "L2.H7", weight: 0.6 },
    { source: "L2.H7", target: "MLP.4", weight: 0.9 },
    { source: "L2.H7", target: "L5.H1", weight: 0.4 },
    { source: "MLP.4", target: "logit: role", weight: 0.8 },
    { source: "L5.H1", target: "MLP.9", weight: 0.5 },
    { source: "MLP.9", target: "logit: trait", weight: 0.7 },
    { source: "L5.H1", target: "logit: role", weight: 0.3 },
  ];

  const color = d3.scaleOrdinal()
    .domain(["head", "mlp", "output"])
    .range([
      getCssVar("--color-accent"),
      getCssVar("--color-secondary"),
      getCssVar("--color-ink-muted"),
    ]);

  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }

  let nodes = DEMO_NODES.map((d) => ({ ...d }));
  let links = DEMO_LINKS.map((d) => ({ ...d }));

  const svgSel = d3.select(svg);
  let width = svg.clientWidth || 600;
  let height = 340;
  svgSel.attr("viewBox", [0, 0, width, height]);

  const linkGroup = svgSel.append("g").attr("stroke-opacity", 0.5);
  const nodeGroup = svgSel.append("g");

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id).distance(90))
    .force("charge", d3.forceManyBody().strength(-220))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(34));

  let linkSel = linkGroup.selectAll("line");
  let nodeSel = nodeGroup.selectAll("g.node");

  function render() {
    linkSel = linkSel.data(links, (d) => `${d.source.id || d.source}-${d.target.id || d.target}`);
    linkSel.exit().remove();
    linkSel = linkSel.enter()
      .append("line")
      .attr("stroke", getCssVar("--color-border-strong"))
      .attr("stroke-width", (d) => 1 + d.weight * 2)
      .merge(linkSel);

    nodeSel = nodeSel.data(nodes, (d) => d.id);
    nodeSel.exit().remove();
    const nodeEnter = nodeSel.enter()
      .append("g")
      .attr("class", "node")
      .call(drag(simulation));

    nodeEnter.append("circle")
      .attr("r", 20)
      .attr("fill", (d) => color(d.group))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    nodeEnter.append("text")
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", 34)
      .attr("font-size", 11)
      .attr("font-family", "var(--font-sans)")
      .attr("fill", getCssVar("--color-ink"));

    nodeSel = nodeEnter.merge(nodeSel);

    simulation.on("tick", () => {
      linkSel
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  }

  function drag(sim) {
    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) sim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
  }

  render();
  simulation.force("link").links(links);
  simulation.force("center", d3.forceCenter(width / 2, height / 2));
  simulation.alpha(1).restart();

  document.getElementById("network-reheat")?.addEventListener("click", () => {
    simulation.alpha(0.8).restart();
  });

  let addCount = 0;
  document.getElementById("network-add-node")?.addEventListener("click", () => {
    addCount += 1;
    const newId = `extra.${addCount}`;
    nodes.push({ id: newId, group: "mlp", x: width / 2, y: height / 2 });
    links.push({ source: nodes[Math.floor(Math.random() * (nodes.length - 1))].id, target: newId, weight: 0.5 });
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    render();
    simulation.alpha(0.8).restart();
  });

  window.addEventListener("resize", () => {
    width = svg.clientWidth || width;
    svgSel.attr("viewBox", [0, 0, width, height]);
    simulation.force("center", d3.forceCenter(width / 2, height / 2));
    simulation.alpha(0.3).restart();
  });
})();
