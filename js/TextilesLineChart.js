let animateLineChart = () => {};

const colors2 = {
  generation: "#ff7033",
  landfill:   "#97A12B",
  connector:  "#c0a898",
  text:       "#1C1D21",      // carbon black
  muted:      "#1C1D21",
};

// Full-width: read container width at runtime
const container2 = document.getElementById("line-chart");
const totalW2    = container2.clientWidth || 900;

const margin2 = { top: 50, right: 80, bottom: 50, left: 70 };
const width2  = totalW2 - margin2.left - margin2.right;
const height2 = 420 - margin2.top - margin2.bottom;

const svg2 = d3.select("#line-chart")
  .append("svg")
  .attr("width",  totalW2)
  .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
  .attr("transform", `translate(${margin2.left},${margin2.top})`);

d3.csv("JMM429 Project data - Clean Textile production (1).csv").then(data => {

  data.forEach(d => {
    d.Year       = +d.Year;
    d.Generation = +d.Generation;
    d.Landfilled = +d.Landfilled;
  });

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Year))
    .range([0, width2]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.Generation, d.Landfilled))])
    .nice()
    .range([height2, 0]);

  const smoothLine = d3.line().curve(d3.curveCatmullRom.alpha(0.5))
    .curve(d3.curveMonotoneX); // Smooths the line;

  // ── Axes ───────────────────────────────────────────────────────
  svg2.append("g")
    .attr("transform", `translate(0,${height2})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .call(g => g.select(".domain").remove());

  svg2.append("g")
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove());

  // ── Title ──────────────────────────────────────────────────────
  svg2.append("text")
    .attr("x", width2 / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", colors2.text)
    .text("Textile Generation vs Landfilling in Thousand Tons");

  // ── Generation path ────────────────────────────────────────────
  const genPathData = data.map(d => [x(d.Year), y(d.Generation)]);

  const generationPath = svg2.append("path")
    .datum(genPathData)
    .attr("fill", "none")
    .attr("stroke", colors2.generation)
    .attr("stroke-width", 2.5)
    .attr("d", smoothLine)
    .attr("opacity", 0);

  const genLength = generationPath.node().getTotalLength();
  generationPath
    .attr("stroke-dasharray", genLength)
    .attr("stroke-dashoffset", genLength);

  // ── Landfill path ──────────────────────────────────────────────
  const landfillPathData = data.map(d => [x(d.Year), y(d.Landfilled)]);

  const landfillPath = svg2.append("path")
    .datum(landfillPathData)
    .attr("fill", "none")
    .attr("stroke", colors2.landfill)
    .attr("stroke-width", 2.5)
    .attr("d", smoothLine)
    .attr("opacity", 0);

  const landfillLength = landfillPath.node().getTotalLength();
  landfillPath
    .attr("stroke-dasharray", landfillLength)
    .attr("stroke-dashoffset", landfillLength);

  // ── Dots ───────────────────────────────────────────────────────
  const genDots = svg2.selectAll(".dot-gen")
    .data(data).enter().append("circle")
    .attr("class", "dot-gen")
    .attr("cx", d => x(d.Year)).attr("cy", d => y(d.Generation))
    .attr("r", 4).attr("fill", colors2.generation).attr("opacity", 0);

  const landfillDots = svg2.selectAll(".dot-landfill")
    .data(data).enter().append("circle")
    .attr("class", "dot-landfill")
    .attr("cx", d => x(d.Year)).attr("cy", d => y(d.Landfilled))
    .attr("r", 4).attr("fill", colors2.landfill).attr("opacity", 0);

  // ── Labels (appear with first dot of each phase) ───────────────
  const labelGen = svg2.append("text")
    .attr("class", "label-gen")
    .attr("x", x(data[1].Year))
    .attr("y", y(data[1].Generation) - 12)
    .attr("text-anchor", "middle")
    .style("font-size", "12px").style("font-weight", "600")
    .style("fill", colors2.generation)
    .attr("opacity", 0)
    .text("Generated");

  const labelLandfill = svg2.append("text")
    .attr("class", "label-landfill")
    .attr("x", x(data[0].Year))
    .attr("y", y(data[0].Landfilled) - 12)
    .attr("text-anchor", "middle")
    .style("font-size", "12px").style("font-weight", "600")
    .style("fill", colors2.landfill)
    .attr("opacity", 0)
    .text("Landfilled");

  // ── Scroll-driven animation ────────────────────────────────────
  // The section has extra scroll height (set in CSS via min-height on s-production)
  // so the chart stays in view while the user scrolls through phases.

  animateLineChart = function () {
    window.addEventListener("scroll", onLineScroll, { passive: true });
    onLineScroll();
  };

  function onLineScroll() {
    const section = document.getElementById("s-production");
    const rect = section.getBoundingClientRect();
    const winH = window.innerHeight;

    // progress goes 0 → 1 across the full scrollable height of the section
    // rect.top goes from winH (section just entered) to -(section.height - winH) (section leaving)
    const scrollable = section.offsetHeight - winH;
    const progress = scrollable > 0
      ? Math.max(0, Math.min(1, -rect.top / scrollable))
      : Math.max(0, Math.min(1, (winH - rect.top) / (winH + rect.height)));

    // Three equal phases across the scroll range
    const p1 = Math.max(0, Math.min(1, progress * 3));
    const p2 = Math.max(0, Math.min(1, progress * 3 - 1));

    // Phase 1 — generation line + dots
    generationPath.attr("opacity", 1)
      .attr("stroke-dashoffset", genLength * (1 - p1));
    labelGen.attr("opacity", p1 > 0.01 ? 1 : 0);
    genDots.attr("opacity", (d, i) => i < Math.floor(p1 * data.length) ? 1 : 0);

    // Phase 2 — landfill line + dots
    landfillPath.attr("opacity", p2 > 0 ? 1 : 0)
      .attr("stroke-dashoffset", landfillLength * (1 - p2));
    labelLandfill.attr("opacity", p2 > 0.01 ? 1 : 0);
    landfillDots.attr("opacity", (d, i) => i < Math.floor(p2 * data.length) ? 1 : 0);

  }

});