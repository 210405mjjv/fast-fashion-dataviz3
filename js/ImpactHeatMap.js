const colors3 = {
  bg: "#f5f1eb",
  text: "#1f1a17",
  muted: "#6f6257",
  high: "#690249",
  medHigh: "#8F0045",
  medium: "#BD153F",
  medLow: "#EA6121",
  low: "#EC961D"
};

const rankColor = {
  5: colors3.high,
  4: colors3.medHigh,
  3: colors3.medium,
  2: colors3.medLow,
  1: colors3.low
};

const materialInfo = {
  Polyester: {
    name: "Polyester",
    image: "images/fabric-production/polyester.JPG",
    body: "Polyester is made from a petroleum based-plastic, usually PET, that is melted and spun into fibres. It is used for cheap everyday clothing, such as activewear, dresses, and fleece, and in blended fabrics."
  },
  Cotton: {
    name: "Cotton",
    image: "images/fabric-production/cotton.WEBP",
    body: "Cotton fabric comes from natural cotton plant fibres that are harvested, cleaned, spun, woven, and dyed to make a variety of clothing. It is used in t-shirts, jeans, underwear, and other breathable clothing."
  },
  Nylon: {
    name: "Nylon",
    image: "images/fabric-production/nylon.WEBP",
    body: "Nylon is made from petroleum-based synthetic polymers that are melted and stretched into strong fibers. It is mainly used for tights, swimwear, windbreakers, activewear, and other lightweight pieces. "
  },
  Elastane: {
    name: "Elastane",
    image: "images/fabric-production/elastane.WEBP",
    body: "Elastane is made from synthetic polyurethane fibres. It is designed to stretch and return to its original shape, so it is commonly used in leggings, fitted tops, swimwear, and other stretchy fabric blends."
  },
  Acryl: {
    name: "Acryl",
    image: "images/fabric-production/acryl.JPG",
    body: "Acryl, also known as acrylic, is made from synthetic plastic fibres and is designed to imitate wool. Hence, it is used to make sweaters, scarves, knitwear, and other low-cost cold-weather clothing. "
  }
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
  // title
  addSvgTagTitle(
    svg3,
    width3 / 2, -70,
    "How different textiles rank across environmental impacts"
  );

  // Subtitle / note
  svg3.append("text")
    .attr("x", width3 / 2)
    .attr("y", -38)
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
      const info = materialInfo[hoveredTextile];

      svg3.selectAll(".impact-cell")
        .style("opacity", cell => cell.Textile === hoveredTextile ? 1 : 0.25);

      svg3.selectAll(".cell-label")
        .style("opacity", cell => cell.Textile === hoveredTextile ? 1 : 0.35);

      if (info) {
        document.getElementById("material-tag-name").textContent = info.name;
        document.getElementById("material-tag-body").textContent = info.body;
        document.getElementById("material-tag-image").innerHTML =
          `<img src="${info.image}" alt="${info.name} fabric image">`;

        document.getElementById("material-tag-image").style.display = "block";
        document.getElementById("material-tag").classList.add("is-active");
      }
    })
    .on("mouseout", function() {
      svg3.selectAll(".impact-cell").style("opacity", 1);
      svg3.selectAll(".cell-label").style("opacity", 1);

      document.getElementById("material-tag-name").textContent = "Hover over a material";
      document.getElementById("material-tag-body").textContent =
        "Select a textile in the chart to learn how it is made and where it is commonly used.";
      document.getElementById("material-tag-image").innerHTML = "";
      document.getElementById("material-tag-image").style.display = "none";
      document.getElementById("material-tag").classList.remove("is-active");
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

function addSvgTagTitle(svg, centerX, y, titleText) {
  const paddingLeft = 28;
  const paddingRight = 18;
  const paddingY = 8;
  const holeRadius = 5;
  const holeOffset = 10;

  const titleGroup = svg.append("g")
    .attr("class", "svg-tag-title");

  const text = titleGroup.append("text")
    .attr("x", centerX + holeOffset)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-family", "var(--font-sans)")
    .style("font-size", "14px")
    .style("font-weight", "700")
    .style("fill", "#211C1C")
    .text(titleText);

  const bbox = text.node().getBBox();

  const tagX = bbox.x - paddingLeft;
  const tagY = bbox.y - paddingY;
  const tagW = bbox.width + paddingLeft + paddingRight;
  const tagH = bbox.height + paddingY * 2;

  const holeX = tagX + 14;
  const holeY = tagY + tagH / 2;

  titleGroup.insert("rect", "text")
    .attr("x", tagX)
    .attr("y", tagY)
    .attr("width", tagW)
    .attr("height", tagH)
    .attr("rx", 8)
    .attr("fill", "#fffaf4")
    .attr("stroke", "#d8cbbb")
    .attr("stroke-width", 1.5);

  titleGroup.insert("circle", "text")
    .attr("cx", holeX)
    .attr("cy", holeY)
    .attr("r", holeRadius)
    .attr("fill", "#eee7dc")
    .attr("stroke", "#cdbba7")
    .attr("stroke-width", 1.5);

  // string — appended last so it sits on top of the tag
  titleGroup.append("line")
    .attr("x1", holeX)
    .attr("y1", holeY - holeRadius)
    .attr("x2", holeX + 2)
    .attr("y2", tagY - 18)
    .attr("stroke", "#c9a98f")
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round");
}