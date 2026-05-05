// CompositionChart.js

window.driveCompositionChart = () => {};

(() => {
  const svg = d3.select("#shirt-composition-svg");
  if (svg.empty()) return;

  // ---------------------------
  // Textile values
  // ---------------------------
  const MATERIAL_1_NAME = "Polyester";
  const MATERIAL_1_PCT = 95;

  const MATERIAL_2_NAME = "Elastane";
  const MATERIAL_2_PCT = 5;

  // Shirt fill area bounds
  const FILL_X = 0;
  const FILL_Y_BOTTOM = 493;
  const FILL_WIDTH = 479;
  const FILL_HEIGHT = 493;

  const fill1 = svg.select("#material-fill-1");
  const fill2 = svg.select("#material-fill-2");
  const splitLine = svg.select("#composition-split-line");
  const label1 = svg.select("#composition-label-1");
  const label2 = svg.select("#composition-label-2");

  // Update labels from constants
  label1.select(".composition-label-pct").text(`${MATERIAL_1_PCT}%`);
  label1.select(".composition-label-name").text(MATERIAL_1_NAME);

  label2.select(".composition-label-pct").text(`${MATERIAL_2_PCT}%`);
  label2.select(".composition-label-name").text(MATERIAL_2_NAME);

  const material1Height = FILL_HEIGHT * (MATERIAL_1_PCT / 100);
  const material2Height = FILL_HEIGHT * (MATERIAL_2_PCT / 100);

  const splitY = FILL_Y_BOTTOM - material1Height;

  splitLine
    .attr("y1", splitY)
    .attr("y2", splitY);

  function setFill(rect, height, bottomY) {
    rect
      .attr("height", Math.max(0, height))
      .attr("y", bottomY - Math.max(0, height));
  }

  // Progress logic:
  // 0.00 - 0.55 => fill material 1
  // 0.55 - 0.72 => show line + label 1
  // 0.72 - 1.00 => fill material 2 + show label 2
  window.driveCompositionChart = function(progress) {
    const p = Math.max(0, Math.min(1, progress));

    const phase1 = Math.max(0, Math.min(1, p / 0.55));
    const phase2 = Math.max(0, Math.min(1, (p - 0.55) / 0.17));
    const phase3 = Math.max(0, Math.min(1, (p - 0.72) / 0.28));

    // Material 1 fill
    const fill1Height = material1Height * phase1;
    setFill(fill1, fill1Height, FILL_Y_BOTTOM);

    // Boundary line + label 1
    splitLine.attr("opacity", phase2);
    label1.attr("opacity", phase2);

    // Material 2 fill
    const fill2Height = material2Height * phase3;
    setFill(fill2, fill2Height, splitY);

    // Label 2 appears as second fill begins
    label2.attr("opacity", phase3 > 0.08 ? phase3 : 0);
  };

  driveCompositionChart(0);
})();