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

// Helper functions for calculations
function erf(beta) {
  const numerator = 2 * beta;
  const denominator = 1 + Math.pow(beta, 4);
  return (2 / Math.PI) * Math.atan(numerator / denominator);
}

function erfc(beta) {
  return 1 - erf(beta);
}

function W(u) {
  const a0 = -0.57721566;
  const a1 = 0.99999193;
  const a2 = -0.24991055;
  const a3 = 0.05519968;
  const a4 = -0.00976004;
  const a5 = 0.00107857;

  if (u <= 0) {
    return 0;
  }

  return (
    -Math.log(u) +
    a0 +
    a1 * u +
    a2 * Math.pow(u, 2) +
    a3 * Math.pow(u, 3) +
    a4 * Math.pow(u, 4) +
    a5 * Math.pow(u, 5)
  );
}

function calculateQFraction(d, Sy, T, t) {
  const beta = Math.sqrt((Sy * Math.pow(d, 2)) / (4 * T * t));
  return erfc(beta);
}

function calculateDrawdown(x, y, d, Sy, T, t, Qw) {
  // Well is at (0,0)
  const x_well = 0;
  const y_well = 0;

  const r = Math.sqrt(Math.pow(x - x_well, 2) + Math.pow(y - y_well, 2));
  const x_mirror = 2 * d - x;
  const r_mirror = Math.sqrt(
    Math.pow(x_mirror - x_well, 2) + Math.pow(y - y_well, 2)
  );

  const u = (Sy * Math.pow(r, 2)) / (4 * T * t);
  const u_mirror = (Sy * Math.pow(r_mirror, 2)) / (4 * T * t);

  const W_u = W(u);
  const W_u_mirror = W(u_mirror);

  const s = (Qw / (4 * Math.PI * T)) * (W_u - W_u_mirror);

  return s; // in meters
}

function calculateTimeIncrements(totalTime, numSteps, multiplier) {
  const timeIncrements = [];
  const denominator = Math.pow(multiplier, numSteps) - 1;
  const time1 = (totalTime * (multiplier - 1)) / denominator;
  let cumulativeTime = 0;

  for (let i = 0; i < numSteps; i++) {
    const timeStep = time1 * Math.pow(multiplier, i);
    cumulativeTime += timeStep;
    timeIncrements.push(cumulativeTime);
  }

  return timeIncrements;
}

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
  const Qw = Number(data.get("in_Qw")); // L/min
  const t = Number(data.get("in_t")); // days
  const n = Number(data.get("in_n"));
  const ox1 = Number(data.get("in_ox1"));
  const oy1 = Number(data.get("in_oy1"));
  const ox2 = Number(data.get("in_ox2"));
  const oy2 = Number(data.get("in_oy2"));

  // Convert units
  const KaInMeterPerDay = Ka * 0.01 * 86400; // cm/s to m/day
  const T = KaInMeterPerDay * b; // m²/day
  const QwInCubicMetersPerDay = Qw * 1.44; // L/min to m³/day (1 L/min = 1.44 m³/day)

  console.log("Input values:", {
    d,
    F,
    Ka,
    b,
    Sy,
    Qs,
    Qw,
    t,
    n,
    ox1,
    oy1,
    ox2,
    oy2,
    T,
  });

  // Clear any existing messages
  negative_value_message.innerHTML = "";
  error_message1.innerHTML = "";
  error_message2.innerHTML = "";
  results_message.innerHTML = "";

  // Check for negative or zero values in inputs
  if (
    d < 0 ||
    F <= 0 ||
    Ka <= 0 ||
    b <= 0 ||
    Sy <= 0 ||
    n <= 0 ||
    t <= 0 ||
    Qw <= 0
  ) {
    negative_value_message.innerHTML =
      "Error: Inputs cannot be negative or zero where not applicable.";
    negative_value_message.style.color = "red";
    return;
  }

  try {
    // Time increments
    const multiplier = 2.5; // You can allow the user to set this value
    const timeIncrements = calculateTimeIncrements(t, n, multiplier);

    // Calculate Qfraction over time
    const fractionPumpingValues = timeIncrements.map((time) => {
      const fraction = calculateQFraction(d, Sy, T, time);
      return fraction;
    });

    // Calculate streamflow values over time
    const streamflowValues = timeIncrements.map((time, index) => {
      const Qfraction = fractionPumpingValues[index];
      const QstreamLeakage = (Qfraction * QwInCubicMetersPerDay) / 86400; // m³/s
      const discharge = Qs - QstreamLeakage;
      return discharge;
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
          line: { shape: "spline" }, // Smooth line between points
        },
      ],
      {
        title: "Fraction of Pumping Over Time",
        xaxis: {
          title: "Time (days)",
          type: "linear",
          range: [0, t],
          dtick: t / 10,
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
          type: "linear",
          range: [0, t],
          dtick: t / 10,
        },
        yaxis: {
          title: "Stream Discharge (m³/s)",
          range: [Math.min(...streamflowValues) * 0.95, Qs * 1.05],
        },
      }
    );

    // Calculate drawdown at observation wells over time
    const drawdownAtObs1 = timeIncrements.map((time) =>
      calculateDrawdown(ox1, oy1, d, Sy, T, time, QwInCubicMetersPerDay)
    );

    const drawdownAtObs2 = timeIncrements.map((time) =>
      calculateDrawdown(ox2, oy2, d, Sy, T, time, QwInCubicMetersPerDay)
    );

    // Plot drawdown at observation wells
    Plotly.newPlot(
      "drawdownPlot",
      [
        {
          x: timeIncrements,
          y: drawdownAtObs1,
          mode: "lines+markers",
          name: `Observation Well 1 (${ox1}, ${oy1})`,
          marker: { color: "red", size: 6 },
          line: { shape: "spline" },
        },
        {
          x: timeIncrements,
          y: drawdownAtObs2,
          mode: "lines+markers",
          name: `Observation Well 2 (${ox2}, ${oy2})`,
          marker: { color: "green", size: 6 },
          line: { shape: "spline" },
        },
      ],
      {
        title: "Drawdown at Observation Wells Over Time",
        xaxis: {
          title: "Time (days)",
          type: "linear",
          range: [0, t],
          dtick: t / 10,
        },
        yaxis: {
          title: "Drawdown (m)",
          autorange: true,
        },
      }
    );

    // Cross-Section Calculations at final time increment
    const t_crossSection = t; // Or select any desired time
    const numPoints = 100; // Resolution of cross-section graphs

    // West-East Cross-Section along y = 0
    const x_max = F * d;
    const xValues_WE = [];
    const sValues_WE = [];

    for (let i = 0; i <= numPoints; i++) {
      const x = -x_max + (2 * x_max * i) / numPoints;
      const y = 0;

      const s = calculateDrawdown(
        x,
        y,
        d,
        Sy,
        T,
        t_crossSection,
        QwInCubicMetersPerDay
      );
      xValues_WE.push(x);
      sValues_WE.push(s);
    }

    // Plot West-East Cross-Section
    Plotly.newPlot(
      "westEastCrossSection",
      [
        {
          x: xValues_WE,
          y: sValues_WE,
          mode: "lines",
          name: "Drawdown",
          line: { color: "blue" },
        },
      ],
      {
        title: `West-East Cross-Section at t = ${t_crossSection.toFixed(
          2
        )} days`,
        xaxis: { title: "Distance (m)", zeroline: true },
        yaxis: { title: "Drawdown (m)", autorange: true },
      }
    );

    // South-North Cross-Section along x = 0
    const y_max = F * d;
    const yValues_SN = [];
    const sValues_SN = [];

    for (let i = 0; i <= numPoints; i++) {
      const y = -y_max + (2 * y_max * i) / numPoints;
      const x = 0;

      const s = calculateDrawdown(
        x,
        y,
        d,
        Sy,
        T,
        t_crossSection,
        QwInCubicMetersPerDay
      );
      yValues_SN.push(y);
      sValues_SN.push(s);
    }

    // Plot South-North Cross-Section
    Plotly.newPlot(
      "southNorthCrossSection",
      [
        {
          x: yValues_SN,
          y: sValues_SN,
          mode: "lines",
          name: "Drawdown",
          line: { color: "green" },
        },
      ],
      {
        title: `South-North Cross-Section at t = ${t_crossSection.toFixed(
          2
        )} days`,
        xaxis: { title: "Distance (m)", zeroline: true },
        yaxis: { title: "Drawdown (m)", autorange: true },
      }
    );
  } catch (error) {
    console.error("Error during calculations or plotting:", error);
    error_message1.innerHTML = "Error calculating results: " + error.message;
    error_message1.style.color = "red";
  }
});

// Listen to form reset button
data_form.addEventListener("reset", function (e) {
  // Clear any messages when the form is reset
  negative_value_message.innerHTML = "";
  error_message1.innerHTML = "";
  error_message2.innerHTML = "";
  results_message.innerHTML = "";

  // Clear plots
  Plotly.purge("qFractionPlot");
  Plotly.purge("streamflowPlot");
  Plotly.purge("drawdownPlot");
  Plotly.purge("westEastCrossSection");
  Plotly.purge("southNorthCrossSection");
});
