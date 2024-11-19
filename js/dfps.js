import {
  calculateQFraction,
  calculateLogTimeSteps,
  calculateStreamLeakage,
  calculateStreamDischarge,
  calculateDrawdown,
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
  const Qw = Number(data.get("in_Qw")) / (1000 * 60); // L/min to m³/s
  const t = Number(data.get("in_t")); // days

  // Convert hydraulic conductivity from cm/s to m/day
  const KaInMeterPerDay = Ka * 0.01 * 86400; // cm/s to m/day
  const T = KaInMeterPerDay * b; // m²/day

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
    // Calculate time increments logarithmically
    const n = 10; // Number of time increments (adjustable)
    const multiplier = 2.5;
    timeIncrements = calculateLogTimeSteps(t, n, multiplier);

    params = {
      d,
      F,
      Ka: KaInMeterPerDay,
      b,
      Sy,
      Qs: Qs * 86400, // Convert to m³/day
      Qw: Qw * 86400, // Convert to m³/day
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
      const QstreamDischarge = calculateStreamDischarge(
        params.Qs,
        QstreamLeakage
      );
      return QstreamDischarge / 86400; // Convert back to m³/s for plotting
    });

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
          range: [
            Math.min(...streamflowValues) * 0.95,
            (params.Qs / 86400) * 1.05,
          ],
        },
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
  const { d, F, Ka, b, Sy, Qw, T, xwell, ywell } = params;

  const numPoints = 100;

  // Adjust x-range from -3d to +d
  const xStart = -3 * d;
  const xEnd = d;

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

  const numPoints = 100;

  // Adjust x-range from -3d to +d
  const xStart = -3 * d;
  const xEnd = d;

  // W-E cross-section at y = 0
  const x_WE = [];
  const s_WE = [];
  const y_WE = 0;

  for (let i = 0; i <= numPoints; i++) {
    const x = xStart + ((xEnd - xStart) * i) / numPoints;
    x_WE.push(x);
    let s = calculateDrawdown(x, y_WE, currentTime, Qw, T, Sy, d, xwell, ywell);
    if (x === xwell && y_WE === ywell) {
      s = null; // Skip plotting at the well location
    }
    s_WE.push(s);
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
      xaxis: { title: "x (m)", range: [xStart, xEnd] },
      yaxis: {
        title: "Drawdown (m)",
        autorange: true,
        // Reverse y-axis so positive drawdown goes down
        autorange: "reversed",
      },
    }
  );

  // S-N cross-section at x = 0
  const yStart = -d;
  const yEnd = d;
  const y_SN = [];
  const s_SN = [];
  const x_SN = 0;

  for (let i = 0; i <= numPoints; i++) {
    const y = yStart + ((yEnd - yStart) * i) / numPoints;
    y_SN.push(y);
    let s = calculateDrawdown(x_SN, y, currentTime, Qw, T, Sy, d, xwell, ywell);
    if (x_SN === xwell && y === ywell) {
      s = null; // Skip plotting at the well location
    }
    s_SN.push(s);
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
      xaxis: { title: "y (m)", range: [yStart, yEnd] },
      yaxis: {
        title: "Drawdown (m)",
        autorange: true,
        // Reverse y-axis so positive drawdown goes down
        autorange: "reversed",
      },
    }
  );
}

// Function to update contour plot
function updateContourPlot(currentTime) {
  const { d, F, Qw, T, Sy, xwell, ywell } = params;

  const xStart = -3 * d;
  const xEnd = d;
  const yStart = -d;
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

  for (let i = 0; i <= numPoints; i++) {
    const zRow = [];
    for (let j = 0; j <= numPoints; j++) {
      const x = xValues[i];
      const y = yValues[j];
      let s = calculateDrawdown(x, y, currentTime, Qw, T, Sy, d, xwell, ywell);
      if (x === xwell && y === ywell) {
        s = null; // Skip the well location
      }
      zRow.push(s);
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
      yaxis: { title: "y (m)", range: [yStart, yEnd], scaleanchor: "x" },
      width: 600,
      height: 500,
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

  // Reset time index and display
  currentTimeIndex = 0;
  document.getElementById("currentTimeDisplay").innerText = `Time: 0 days`;
});
