// dfps.js

import {
  calculateQFraction,
  calculateStreamLeakage,
  calculateStreamDischarge,
  calculateDrawdown,
  calculateLogTimeSteps,
} from "./calculations.js";

const data_form = document.querySelector("#data_form");
const negative_value_message = document.querySelector(
  "#negative_value_message"
);
const error_message1 = document.querySelector("#error_message1");
const error_message2 = document.querySelector("#error_message2");
const results_message = document.querySelector("#result_message");

// Declare variables to store time increments and parameters
let timeIncrements = [];
let currentTimeIndex = 0;
let params = {};

// Listen to form submission
data_form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get input values with proper unit conversions
  const data = new FormData(this);
  const d = Number(data.get("in_d")); // meters
  const F = Number(data.get("in_F"));
  const Ka = Number(data.get("in_Ka")); // cm/s
  const b = Number(data.get("in_b")); // meters
  const Sy = Number(data.get("in_Sy")); // dimensionless
  const Qs = Number(data.get("in_Qs")); // m³/s
  const QwInput = Number(data.get("in_Qw")); // L/min
  const t = Number(data.get("in_t")); // days
  const ox1 = Number(data.get("in_ox1"));
  const oy1 = Number(data.get("in_oy1"));
  const ox2 = Number(data.get("in_ox2"));
  const oy2 = Number(data.get("in_oy2"));

  // Convert hydraulic conductivity from cm/s to m/day
  const KaInMeterPerDay = Ka * 0.01 * 86400; // cm/s to m/day
  const T = KaInMeterPerDay * b; // m²/day

  // Convert pumping rate from L/min to m³/day
  const Qw = QwInput * 1e-3 * 1440; // L/min to m³/day

  // Define well location
  const xwell = 0; // Well is at (0,0)
  const ywell = 0;

  // Clear any existing messages
  negative_value_message.innerHTML = "";
  error_message1.innerHTML = "";
  error_message2.innerHTML = "";
  results_message.innerHTML = "";

  // Check for negative values in inputs
  if (d < 0 || F < 0 || Ka < 0 || b < 0 || Sy < 0 || t < 0) {
    negative_value_message.innerHTML =
      "Error: Inputs cannot be negative or invalid.";
    negative_value_message.style.color = "red";
    return;
  }

  try {
    // Calculate time increments logarithmically, avoiding t=0
    const n = 10; // Number of time increments (adjustable)
    const multiplier = 2.5;
    timeIncrements = calculateLogTimeSteps(t, n, multiplier);

    // Ensure time increments do not include zero time
    timeIncrements = timeIncrements.filter((time) => time > 0);

    params = {
      d,
      F,
      Ka: KaInMeterPerDay,
      b,
      Sy,
      Qs,
      Qw,
      T,
      xwell,
      ywell,
    };

    const fractionPumpingValues = timeIncrements.map((time) =>
      calculateQFraction(d, Sy, T, time)
    );

    const streamflowValues = timeIncrements.map((time, index) => {
      const Qfraction = fractionPumpingValues[index];
      const QstreamLeakage = calculateStreamLeakage(params.Qw, Qfraction);
      const QstreamLeakageInM3PerSec = QstreamLeakage / 86400;
      return calculateStreamDischarge(Qs, QstreamLeakageInM3PerSec);
    });

    const drawdownOne = timeIncrements.map((time) =>
      calculateDrawdown(
        ox1,
        oy1,
        time,
        params.Qw,
        params.T,
        params.Sy,
        params.d,
        params.xwell,
        params.ywell
      )
    );
    console.log("Drawdown at observation well 1:", drawdownOne);

    const drawdownTwo = timeIncrements.map((time) =>
      calculateDrawdown(
        ox2,
        oy2,
        time,
        params.Qw,
        params.T,
        params.Sy,
        params.d,
        params.xwell,
        params.ywell
      )
    );
    console.log("Drawdown at observation well 2:", drawdownTwo);

    // Plot Qfraction graph
    Plotly.newPlot(
      "qFractionPlot",
      [
        {
          x: timeIncrements,
          y: fractionPumpingValues,
          mode: "lines+markers",
          name: "Stream Depletion Fraction",
          marker: { color: "blue", size: 6 },
          line: { shape: "spline" },
        },
      ],
      {
        title: "Fraction of Pumping Over Time",
        xaxis: {
          title: "Time (days)",
          range: [0, t],
        },
        yaxis: {
          title: "Fraction Pumping",
          range: [0, 1],
        },
      }
    );

    // Plot streamflow graph
    Plotly.newPlot(
      "streamflowPlot",
      [
        {
          x: timeIncrements,
          y: streamflowValues,
          mode: "lines+markers",
          name: "Stream Discharge",
          marker: { color: "blue", size: 6 },
          line: { shape: "spline" },
        },
      ],
      {
        title: "Stream Flow Rate Over Time",
        xaxis: {
          title: "Time (days)",
          range: [0, t],
        },
        yaxis: {
          title: "Stream Discharge (m³/s)",
          range: [Math.min(...streamflowValues) * 0.95, Qs * 1.05],
        },
      }
    );

    // Plot for the first observation well
    Plotly.newPlot(
      "obsWellOne",
      [
        {
          x: timeIncrements,
          y: drawdownOne.map((s) => -s), // Invert drawdown
          mode: "lines+markers",
          type: "scatter",
          name: "Drawdown at Well 1",
          line: { shape: "spline" },
          marker: { color: "blue", size: 6 },
        },
      ],
      {
        title: "Drawdown vs Time (Well 1)",
        xaxis: { title: "Time (days)" },
        yaxis: { title: "Drawdown (meters)" },
        displayModeBar: false,
        showlegend: false,
      }
    );

    // Plot for the second observation well
    Plotly.newPlot(
      "obsWellTwo",
      [
        {
          x: timeIncrements,
          y: drawdownTwo.map((s) => -s), // Invert drawdown
          mode: "lines+markers",
          type: "scatter",
          name: "Drawdown at Well 2",
          line: { shape: "spline" },
          marker: { color: "blue", size: 6 },
        },
      ],
      {
        title: "Drawdown vs Time (Well 2)",
        xaxis: { title: "Time (days)" },
        yaxis: { title: "Drawdown (meters)" },
        displayModeBar: false,
        showlegend: false,
      }
    );

    // Initialize current time index and update plots
    currentTimeIndex = 0;
    updatePlots();
  } catch (error) {
    console.error("Error during calculations or plotting:", error);
    error_message1.innerHTML = "Error calculating results: " + error.message;
    error_message1.style.color = "red";
  }
});

// Event listeners for time navigation buttons
document.getElementById("prevTime").addEventListener("click", function () {
  if (currentTimeIndex > 0) {
    currentTimeIndex--;
    updatePlots();
  }
});

document.getElementById("nextTime").addEventListener("click", function () {
  if (currentTimeIndex < timeIncrements.length - 1) {
    currentTimeIndex++;
    updatePlots();
  }
});

function updatePlots() {
  const currentTime = timeIncrements[currentTimeIndex];
  const { d, F, Qw, T, Sy, xwell, ywell } = params;

  // Update current time display
  document.getElementById(
    "currentTimeDisplay"
  ).innerText = `Time: ${currentTime.toFixed(2)} days`;

  // Generate data for cross-sections and contour map
  updateCrossSectionPlots(currentTime);
  updateContourPlot(currentTime);
}

// Function to update cross-section plots
function updateCrossSectionPlots(currentTime) {
  const { d, F, Qw, T, Sy, xwell, ywell } = params;

  // W-E cross-section at y = 0
  const xStart_WE = -3 * d; // -150 m
  const xEnd_WE = d; // +50 m
  const L_WE = xEnd_WE - xStart_WE; // 200 m
  const numPoints_WE = 100;
  const x_WE = [];
  const s_WE = [];
  const y_WE = 0;

  for (let i = 0; i <= numPoints_WE; i++) {
    const x = xStart_WE + (L_WE * i) / numPoints_WE;
    // Omit x=0
    if (x === 0) {
      continue;
    }
    x_WE.push(x);
    const s = calculateDrawdown(
      x,
      y_WE,
      currentTime,
      Qw,
      T,
      Sy,
      d,
      xwell,
      ywell
    );
    s_WE.push(-s); // Invert drawdown
  }

  // Plot W-E cross-section
  Plotly.react(
    "crossSectionWEPlot",
    [
      {
        x: x_WE,
        y: s_WE,
        mode: "lines",
        name: `t=${currentTime.toFixed(2)} days`,
        line: { color: "green" },
      },
    ],
    {
      title: `W-E Cross-Section at y=${y_WE.toFixed(2)} m`,
      xaxis: { title: "x (m)", range: [xStart_WE, xEnd_WE] },
      yaxis: { title: "Drawdown (m)" },
    }
  );

  // S-N cross-section at x = 0
  const yStart_SN = -100; // Adjusted range -100 m
  const yEnd_SN = 100; // Adjusted range +100 m
  const L_SN = yEnd_SN - yStart_SN;
  const numPoints_SN = 100;
  const y_SN = [];
  const s_SN = [];
  const x_SN = 0;

  for (let i = 0; i <= numPoints_SN; i++) {
    const y = yStart_SN + (L_SN * i) / numPoints_SN;
    // Omit y=0
    if (y === 0) {
      continue;
    }
    y_SN.push(y);
    const s = calculateDrawdown(
      x_SN,
      y,
      currentTime,
      Qw,
      T,
      Sy,
      d,
      xwell,
      ywell
    );
    s_SN.push(-s); // Invert drawdown
  }

  // Plot S-N cross-section
  Plotly.react(
    "crossSectionSNPlot",
    [
      {
        x: y_SN,
        y: s_SN,
        mode: "lines",
        name: `t=${currentTime.toFixed(2)} days`,
        line: { color: "red" },
      },
    ],
    {
      title: `S-N Cross-Section at x=${x_SN.toFixed(2)} m`,
      xaxis: { title: "y (m)", range: [yStart_SN, yEnd_SN] },
      yaxis: { title: "Drawdown (m)" },
    }
  );
}

// Function to update contour plot
function updateContourPlot(currentTime) {
  const { d, F, Qw, T, Sy, xwell, ywell } = params;

  const xStart = -3 * d;
  const xEnd = d;
  const yStart = -3 * d;
  const yEnd = d;
  const numPoints = 50;

  const xValues = [];
  const yValues = [];
  const zValues = [];

  for (let i = 0; i <= numPoints; i++) {
    const x = xStart + ((xEnd - xStart) * i) / numPoints;
    xValues.push(x);
  }

  for (let j = 0; j <= numPoints; j++) {
    const y = yStart + ((yEnd - yStart) * j) / numPoints;
    yValues.push(y);
  }

  for (let j = 0; j <= numPoints; j++) {
    const y = yValues[j];
    const zRow = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = xValues[i];
      const s = calculateDrawdown(
        x,
        y,
        currentTime,
        Qw,
        T,
        Sy,
        d,
        xwell,
        ywell
      );
      zRow.push(-s); // Invert drawdown
    }
    zValues.push(zRow);
  }

  // Plot contour map
  Plotly.react(
    "contourPlot",
    [
      {
        x: xValues,
        y: yValues,
        z: zValues,
        type: "contour",
        colorscale: "Viridis",
        contours: {
          coloring: "heatmap",
          showlabels: true,
          labelfont: {
            size: 12,
            color: "white",
          },
        },
        colorbar: {
          title: "Drawdown (m)",
          titleside: "right",
        },
      },
    ],
    {
      title: `Contour Map of Drawdown at t=${currentTime.toFixed(2)} days`,
      xaxis: { title: "x (m)", range: [xStart, xEnd] },
      yaxis: { title: "y (m)", range: [yStart, yEnd] },
    }
  );
}

// Listen to form reset button
data_form.addEventListener("reset", function () {
  // Clear any messages when the form is reset
  negative_value_message.innerHTML = "";
  error_message1.innerHTML = "";
  error_message2.innerHTML = "";
  results_message.innerHTML = "";

  // Clear plots
  Plotly.purge("qFractionPlot");
  Plotly.purge("streamflowPlot");
  Plotly.purge("crossSectionWEPlot");
  Plotly.purge("crossSectionSNPlot");
  Plotly.purge("contourPlot");
  Plotly.purge("obsWellOne");
  Plotly.purge("obsWellTwo");

  // Reset time index and display
  currentTimeIndex = 0;
  document.getElementById("currentTimeDisplay").innerText = `Time: 0 days`;
});
