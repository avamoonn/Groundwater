// dfps.js

import {
  calculateQFraction,
  calculateLogarithmicTimeSteps,
  calculateStreamLeakage,
  calculateStreamDischarge,
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
  const Qw = Number(data.get("in_Qw")) / (60 * 1000); // L/min to m³/s
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
      Qs,
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
      return calculateStreamDischarge(Qs, QstreamLeakage);
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
          range: [Math.min(...streamflowValues) * 0.95, Qs * 1.05],
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

  const L = d * F;

  // Update current time display
  document.getElementById(
    "currentTimeDisplay"
  ).innerText = `Time: ${currentTime.toFixed(2)} days`;

  // Generate data for cross-sections and contour map
  updateCrossSectionPlots(currentTime);
  updateContourPlot(currentTime);
}

function calculateLogTimeSteps(totalTime, n, multiplier) {
  let times = [];
  let time = (totalTime * (multiplier - 1)) / (Math.pow(multiplier, n) - 1);
  let cumulativeTime = time;
  times.push(cumulativeTime);

  for (let i = 1; i < n; i++) {
    time *= multiplier;
    cumulativeTime += time;
    times.push(cumulativeTime);
  }

  return times;
}

// Updated calculateDrawdown function
function calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell) {
  // x, y: coordinates where we want to calculate drawdown
  // t: time (in days)
  // Qw: pumping rate (m³/day)
  // T: transmissivity (m²/day)
  // Sy: Specific yield (dimensionless)
  // d: distance from well to stream (m)
  // xwell, ywell: well coordinates

  const S = Sy; // Assuming Sy is storativity

  const rSquared = (x - xwell) ** 2 + (y - ywell) ** 2;
  const u = (rSquared * S) / (4 * T * t);

  const xImage = xwell + 2 * d; // Image well x-coordinate
  const rPrimeSquared = (x - xImage) ** 2 + (y - ywell) ** 2;
  const uPrime = (rPrimeSquared * S) / (4 * T * t);

  const Wu = wellFunction(u);
  const WuPrime = wellFunction(uPrime);

  const drawdown = (Qw / (4 * Math.PI * T)) * (Wu - WuPrime);

  return drawdown; // Drawdown at point (x,y) at time t
}

// Well function approximation
function wellFunction(u) {
  const a0 = -0.57721566;
  const a1 = 0.99999193;
  const a2 = -0.24991055;
  const a3 = 0.05519968;
  const a4 = -0.00976004;
  const a5 = 0.00107857;

  if (u <= 0) {
    return 0;
  }

  const lnU = Math.log(u);
  const W =
    -lnU + a0 + a1 * u + a2 * u ** 2 + a3 * u ** 3 + a4 * u ** 4 + a5 * u ** 5;

  return W;
}

// Function to update cross-section plots
function updateCrossSectionPlots(currentTime) {
  const { d, F, Qw, T, Sy, xwell, ywell } = params;

  const L = d * F;
  const numPoints = 100;

  // W-E cross-section at y = 0
  const x_WE = [];
  const s_WE = [];
  const y_WE = 0;

  for (let i = 0; i <= numPoints; i++) {
    const x = -L / 2 + (L * i) / numPoints;
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
      xaxis: { title: "x (m)" },
      yaxis: { title: "Drawdown (m)" },
    }
  );

  // S-N cross-section at x = 0
  const y_SN = [];
  const s_SN = [];
  const x_SN = 0;

  for (let i = 0; i <= numPoints; i++) {
    const y = -L / 2 + (L * i) / numPoints;
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
      xaxis: { title: "y (m)" },
      yaxis: { title: "Drawdown (m)" },
    }
  );
}

// Function to update contour plot
function updateContourPlot(currentTime) {
  const { d, F, Qw, T, Sy, xwell, ywell } = params;

  const L = d * F;
  const numPoints = 50;

  const xValues = [];
  const yValues = [];
  const zValues = [];

  for (let i = 0; i <= numPoints; i++) {
    const x = -L / 2 + (L * i) / numPoints;
    xValues.push(x);
  }

  for (let j = 0; j <= numPoints; j++) {
    const y = -L / 2 + (L * j) / numPoints;
    yValues.push(y);
  }

  for (let i = 0; i <= numPoints; i++) {
    const zRow = [];
    for (let j = 0; j <= numPoints; j++) {
      const x = xValues[i];
      const y = yValues[j];
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
      xaxis: { title: "x (m)" },
      yaxis: { title: "y (m)" },
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
