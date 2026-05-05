const colors = {
  bg: "#f5f1eb",        // linen
  text: "#1C1D21",      // carbon black
  muted: "#1C1D21",     // secondary text
  market: "#97A12B",    // toxic green
  accent: "#d97706"      // tangerine highlight
};

// <----------------------------------------------------------------------------------->
// market size chart
// dimensions
const margin = { top: 40, right: 20, bottom: 50, left: 70 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// SVG
const svg = d3.select("#market-size-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// load data
d3.csv("JMM429 Project data - Clean FF Market Value.csv").then(data => {

  // convert types
  data.forEach(d => {
    d.Year = +d.Year;
    d["Market value in billion US Dollars"] = +d["Market value in billion US Dollars"];
    d.MarketValue = +d["Market value in billion US Dollars"];
  });

  // x scale (categorical)
  const x = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([0, width])
    .padding(0.2);

  // y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.MarketValue)])
    .nice()
    .range([height, 0]); // flipped so larger values go higher on the screen

  // axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove());

  // bars
  const bars = svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.Year))
    .attr("y", height)              // start at bottom
    .attr("width", x.bandwidth())
    .attr("height", 0)               // start invisible
    .attr("fill", colors.market);

  // bar labels (initially hidden)
  const barLabels = svg.selectAll(".bar-label")
  .data(data)
  .enter()
  .append("text")
  .attr("class", "bar-label")
  .attr("x", d => x(d.Year) + x.bandwidth() / 2)
  .attr("y", height - 8)
  .attr("text-anchor", "middle")
  .attr("fill", "#111111")
  .style("font-size", "13px")
  .style("font-weight", "800")
  .style("pointer-events", "none")
  .style("opacity", 0)
  .text(d => `$${d.MarketValue.toFixed(0)}B`);

  // title
  svg.append("text")
    .attr("x", width / 2) // width/2 centers the title
    .attr("y", -10) // negative y moves it above the chart area
    .attr("text-anchor", "middle") // centers the text on the x coordinate
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Fast Fashion Market Growth in Billion USD (2010-2020)");

  // ── Externally-driven bar animation ─────────────────────────────
  // Called by main.js with progress 0→1
  window.driveBarChart = function(progress) {
  const clamped = Math.max(0, Math.min(1, progress));

  bars
    .attr("y", d => y(d.MarketValue) + (height - y(d.MarketValue)) * (1 - clamped))
    .attr("height", d => (height - y(d.MarketValue)) * clamped);

  barLabels
    .attr("opacity", clamped >= 0.75 ? 1 : 0)
    .attr("y", d => {
      const barTop = y(d.MarketValue) + (height - y(d.MarketValue)) * (1 - clamped);
      return Math.max(14, barTop - 8);
    });
};

  // Initialize at zero
  window.driveBarChart(0);

});
