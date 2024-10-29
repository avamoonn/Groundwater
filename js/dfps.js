import {
  calculateLogarithmicTimeSteps,
  calculateQFraction,
  calculateStreamLeakage,
  calculateStreamDischarge,
} from "./calculations.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("data_form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get input values
    const d = parseFloat(document.getElementById("disttoS").value);
    const Sy = parseFloat(document.getElementById("Sy").value);
    const T =
      parseFloat(document.getElementById("conductivity").value) *
      parseFloat(document.getElementById("thickness").value) *
      86400; // Convert to m²/day
    const t = parseFloat(document.getElementById("pumptime").value);
    const n = parseInt(document.getElementById("timeincrements").value);
    const Qw =
      parseFloat(document.getElementById("pumprate").value) / (60 * 1000); // Convert L/min to m³/s
    const Qs = parseFloat(document.getElementById("streamrate").value);

    // Calculate time steps
    const timeSteps = calculateLogarithmicTimeSteps(t, n);

    // Calculate Qfraction for each time step
    const qFractions = timeSteps.map((time) =>
      calculateQFraction(d, Sy, T, time)
    );

    // Calculate stream depletion and discharge for each time step
    const streamflow = timeSteps.map((time, index) => {
      const Qfraction = qFractions[index];
      const QstreamLeakage = calculateStreamLeakage(Qw, Qfraction);
      return calculateStreamDischarge(Qs, QstreamLeakage);
    });

    // Create Qfraction plot
    const qFractionTrace = {
      x: timeSteps,
      y: qFractions,
      type: "scatter",
      mode: "lines",
      name: "Stream Depletion Fraction",
      line: {
        color: "red",
        width: 2,
      },
    };

    const qFractionLayout = {
      title: "Stream Depletion Fraction Over Time",
      xaxis: {
        title: "Time (days)",
        type: "log",
      },
      yaxis: {
        title: "Stream Depletion Fraction",
        range: [0, 1],
      },
      showlegend: true,
    };

    // Create streamflow plot
    const streamflowTrace = {
      x: timeSteps,
      y: streamflow,
      type: "scatter",
      mode: "lines",
      name: "Stream Discharge",
      line: {
        color: "blue",
        width: 2,
      },
    };

    const streamflowLayout = {
      title: "Stream Discharge Over Time",
      xaxis: {
        title: "Time (days)",
        type: "log",
      },
      yaxis: {
        title: "Stream Discharge (m³/s)",
      },
      showlegend: true,
    };

    // Plot both graphs
    Plotly.newPlot("qFractionPlot", [qFractionTrace], qFractionLayout);
    Plotly.newPlot("streamflowPlot", [streamflowTrace], streamflowLayout);
  });
});
