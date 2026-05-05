const colors3 = {
  bg: "#f5f1eb",
  text: "#1f1a17",
  muted: "#6f6257",
  high: "#9f2f3f",
  medHigh: "#c96b2c",
  medium: "#d8b64c",
  medLow: "#98a84b",
  low: "#6f7d3c"
};

const rankColor = {
  5: colors3.high,
  4: colors3.medHigh,
  3: colors3.medium,
  2: colors3.medLow,
  1: colors3.low
};

const margin3 = { top: 90, right: 30, bottom: 70, left: 110 };
const width3 = 900 - margin3.left - margin3.right;
const height3 = 420 - margin3.top - margin3.bottom;

const svg3 = d3.select("#materials-chart")
  .append("svg")
  .attr("width", width3 + margin3.left + margin3.right)
  .attr("height", height3 + margin3.top + margin3.bottom)
  .append("g")
  .attr("transform", `translate(${margin3.left},${margin3.top})`);

d3.csv("JMM429 Project data - Clean Impact of manufacturing.csv").then(data => {
  data.forEach(d => {
    d.Rank = +d.Rank;
  });

  const categories = [
    "Climate Change",
    "Land Use",
    "Water Use",
    "Eutrophication",
    "Mineral Resource Use",
    "Fossil Resource Use",
    "Toxicity"
  ];

  const ranks = [5, 4, 3, 2, 1];

  const x = d3.scaleBand()
    .domain(categories)
    .range([0, width3])
    .padding(0.08);

  const y = d3.scaleBand()
    .domain(ranks)
    .range([0, height3])
    .padding(0.18);

  // Title
  svg3.append("text")
    .attr("x", width3 / 2)
    .attr("y", -55)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "700")
    .style("fill", colors3.text)
    .text("Which textiles rank worst across environmental impacts?");

  // Subtitle / note
  svg3.append("text")
    .attr("x", width3 / 2)
    .attr("y", -28)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", colors3.muted)
    .text("*Rankings compare the relative environmental burden of 1 kg of dyed woven fabric.");

  // Cells
  svg3.selectAll(".impact-cell")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "impact-cell")
    .attr("x", d => x(d.Category))
    .attr("y", d => y(d.Rank))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("rx", 4)
    .attr("fill", d => rankColor[d.Rank])
    .style("cursor", "pointer")
    .style("transition", "opacity 0.2s ease")
    .on("mouseover", function(event, d) {
      const hoveredTextile = d.Textile;

      // Dim all cells and labels that don't match
      svg3.selectAll(".impact-cell")
        .style("opacity", cell => cell.Textile === hoveredTextile ? 1 : 0.35);

      svg3.selectAll(".cell-label")
        .style("opacity", cell => cell.Textile === hoveredTextile ? 1 : 0.45);
    })
    .on("mouseout", function() {
      // Restore all cells and labels
      svg3.selectAll(".impact-cell")
        .style("opacity", 1);

      svg3.selectAll(".cell-label")
        .style("opacity", 1);
    });

  // Cell labels
  svg3.selectAll(".cell-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "cell-label")
    .attr("x", d => x(d.Category) + x.bandwidth() / 2)
    .attr("y", d => y(d.Rank) + y.bandwidth() / 2 + 4)
    .attr("text-anchor", "middle")
    .style("fill", "#fffaf4")
    .style("font-size", "11px")
    .style("font-weight", "600")
    .style("pointer-events", "none")
    .style("transition", "opacity 0.2s ease")
    .text(d => d.Textile);

  // Top category labels
  svg3.selectAll(".category-label")
    .data(categories)
    .enter()
    .append("text")
    .attr("class", "category-label")
    .attr("x", d => x(d) + x.bandwidth() / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "700")
    .style("fill", colors3.text)
    .text(d => d)
    .call(wrapText, x.bandwidth());

  // Left-side rank labels
  svg3.selectAll(".rank-label")
    .data(ranks)
    .enter()
    .append("text")
    .attr("class", "rank-label")
    .attr("x", -18)
    .attr("y", d => y(d) + y.bandwidth() / 2 + 4)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .style("font-weight", "600")
    .style("fill", colors3.text)
    .text(d => d);

  // Left-side descriptor
  svg3.append("text")
    .attr("x", -70)
    .attr("y", height3 / 2)
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90, -70, ${height3 / 2})`)
    .style("font-size", "12px")
    .style("font-weight", "700")
    .style("fill", colors3.text)
    .text("Impact rank");

  // High / low cues
  svg3.append("text")
    .attr("x", -18)
    .attr("y", y(5) - 10)
    .attr("text-anchor", "end")
    .style("font-size", "11px")
    .style("fill", colors3.high)
    .style("font-weight", "700")
    .text("Higher impact");

  svg3.append("text")
    .attr("x", -18)
    .attr("y", y(1) + y.bandwidth() + 16)
    .attr("text-anchor", "end")
    .style("font-size", "11px")
    .style("fill", colors3.low)
    .style("font-weight", "700")
    .text("Lower impact");

  // Simple legend
  const legendData = [
    { Rank: 5, label: "5" },
    { Rank: 4, label: "4" },
    { Rank: 3, label: "3" },
    { Rank: 2, label: "2" },
    { Rank: 1, label: "1" }
  ];

  const legend = svg3.append("g")
    .attr("transform", `translate(${width3 - 210}, ${height3 + 35})`);

  legend.append("text")
    .attr("x", 0)
    .attr("y", -8)
    .style("font-size", "11px")
    .style("font-weight", "700")
    .style("fill", colors3.text)
    .text("Impact scale");

  legend.selectAll(".legend-box")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 34)
    .attr("y", 0)
    .attr("width", 24)
    .attr("height", 14)
    .attr("rx", 2)
    .attr("fill", d => rankColor[d.Rank]);

  legend.selectAll(".legend-label")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 34 + 12)
    .attr("y", 28)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", colors3.text)  // fixed: was colors.text (bug in original)
    .text(d => d.label);
});

// helper for wrapping long category labels
function wrapText(text, width) {
  text.each(function() {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1;
    const y = text.attr("y");
    const x = text.attr("x");
    let tspan = text.text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", "0em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", `${++lineNumber * lineHeight}em`)
          .text(word);
      }
    }
  });
}