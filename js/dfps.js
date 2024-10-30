import { calculateQFraction, calculateLogarithmicTimeSteps, calculateDrawdown } from "./calculations.js";

const data_form = document.querySelector('#data_form');
const negative_value_message = document.querySelector('#negative_value_message');
const error_message1 = document.querySelector('#error_message1');
const error_message2 = document.querySelector('#error_message2');
const results_message = document.querySelector('#result_message');
const graphDiv = document.getElementById('qFractionPlot');
// Listen to form submission
data_form.addEventListener('submit', function(e) {
  e.preventDefault();
  e.preventDefault();
    
  // Initiate values
  const data = new FormData(this);
  const d = Number(data.get('in_d'));
  const F = Number(data.get('in_F'));
  const Ka = Number(data.get('in_Ka'));
  const b = Number(data.get('in_b'));
  const Sy = Number(data.get('in_Sy'));
  const Qs = Number(data.get('in_Qs'));
  const Qw = Number(data.get('in_Qw'));
  const ox1 = Number(data.get('in_ox1'));
  const oy1 = Number(data.get('in_oy1'));
  const ox2 = Number(data.get('in_ox2'));
  const oy2 = Number(data.get('in_oy2'));
  const t = Number(data.get('in_t'));
  const n = Number(data.get('in_n'));  
  const T = Ka * b // Calc Transmissivity

  console.log("Input values:", { d, Sy, Ka, b, t, n, T });
  // Clear any existing messages
  negative_value_message.innerHTML = '';
  error_message1.innerHTML = '';
  error_message2.innerHTML = '';
  results_message.innerHTML = ''; // Ensure this is cleared properly

  // Check for negative values in inputs (except Ox1, Ox2, Oy1, Oy2)
  if (d < 0 || F < 0 || Ka < 0 || b < 0 || Sy < 0 || n < 0 || t < 0) {
    // Display an error message and stop further processing
    negative_value_message.innerHTML = 'Error: Inputs for Distance, Factor, Hydraulic Conductivity, Thickness, Specific Yield, Duration, and Time Increments cannot be negative.';
    negative_value_message.style.color = 'red';
    return; // Exit the function if any invalid input is found
  }

  // Make sure to display the results after validation
  try {
    const timeSteps = calculateLogarithmicTimeSteps(t,50);
    console.log(timeSteps);

    const drawdownOne = timeSteps.map(time => 
      calculateDrawdown(0, 0, time, Qw, Ka, Sy, d, ox1, oy1)
    );
    console.log(drawdownOne);

    const drawdownTwo = timeSteps.map(time => 
      calculateDrawdown(0, 0, time, Qw, Ka, Sy, d, ox2, oy2)
    );

      Plotly.newPlot('obsWellOne', [{
        x: timeSteps,
        y: drawdownOne,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Drawdown at Well 1',
        marker: { color: 'blue', size: 6 },
        line: {shape : "spline"}
    }], {
        title: 'Drawdown vs Time (Well 1)',
        xaxis: { title: 'Time (days)' },
        yaxis: { title: 'Drawdown (meters)' },
    });

    // Plot for the second observation well
      Plotly.newPlot('obsWellTwo', [{
        x: timeSteps,
        y: drawdownTwo,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Drawdown at Well 2',
        line: {shape : "spline"},
        marker: { color: 'blue', size: 6 }
    }], {
        title: 'Drawdown vs Time (Well 2)',
        xaxis: { title: 'Time (days)' },
        yaxis: { title: 'Drawdown (meters)' },
        displayModeBar: false, // Hide the mode bar
        showlegend: false   
    });
    } catch (error) {
      console.error("Error during calculations or plotting:", error);
    }
    try {
    const timeIncrements = calculateLogarithmicTimeSteps(t, 50);
    const fractionPumpingValues = timeIncrements.map(time => calculateQFraction(d, Sy, T, time));
    
    // Log calculated values to confirm
    console.log("Calculated time increments:", timeIncrements);
    console.log("Calculated fraction pumping values:", fractionPumpingValues);

    // Plotting the graph
    Plotly.newPlot(graphDiv, [{
        x: timeIncrements,
        y: fractionPumpingValues,
        mode: 'lines+markers',
        marker: { color: 'blue', size: 6 },
        line: {shape : "spline"},
    }], {
        title: 'Fraction of Pumping Over Time',
        xaxis: { title: 'Time (days)'},
        yaxis: { title: 'Fraction Pumping', range: [0, 1] }
    });
  } catch (error) {
    console.error("Error during calculations or plotting:", error);
  }
  });

  // Reset event listener

  data_form.addEventListener('reset', function() {
    // Clear any messages when the form is reset
    negative_value_message.innerHTML = '';
    error_message1.innerHTML = '';
    error_message2.innerHTML = '';
    results_message.innerHTML = '';
  
    // Retrieve default values directly from the inputs
    const d = Number(document.getElementById('disttoS').value);
    const F = Number(document.getElementById('factor').value);
    const Ka = Number(document.getElementById('conductivity').value);
    const b = Number(document.getElementById('thickness').value);
    const Sy = Number(document.getElementById('Sy').value);
    const Qs = Number(document.getElementById('streamrate').value);
    const Qw = Number(document.getElementById('pumprate').value);
    const ox1 = Number(document.getElementById('ox1').value);
    const oy1 = Number(document.getElementById('oy1').value);
    const ox2 = Number(document.getElementById('ox2').value);
    const oy2 = Number(document.getElementById('oy2').value);
    const t = Number(document.getElementById('pumptime').value);
    const n = Number(document.getElementById('timeincrements').value);
    const T = Ka * b; // Calculate Transmissivity
  
    // Try calculations and catch any errors that might cause issues
    try {
      const timeSteps = calculateLogarithmicTimeSteps(t,50);
      console.log(timeSteps);
  
      const drawdownOne = timeSteps.map(time => 
        calculateDrawdown(0, 0, time, Qw, Ka, Sy, d, ox1, oy1)
      );
      console.log(drawdownOne);
  
      const drawdownTwo = timeSteps.map(time => 
        calculateDrawdown(0, 0, time, Qw, Ka, Sy, d, ox2, oy2)
      );
  
        Plotly.newPlot('obsWellOne', [{
          x: timeSteps,
          y: drawdownOne,
          mode: 'lines+markers',
          type: 'scatter',
          name: 'Drawdown at Well 1',
          line: {shape : "spline"},
          marker: { color: 'blue', size: 6 }
      }], {
          title: 'Drawdown vs Time (Well 1)',
          xaxis: { title: 'Time (days)' },
          yaxis: { title: 'Drawdown (meters)' },
          displayModeBar: false, // Hide the mode bar
          showlegend: false,      // Hide the legend
      });
  
      // Plot for the second observation well
        Plotly.newPlot('obsWellTwo', [{
          x: timeSteps,
          y: drawdownTwo,
          mode: 'lines+markers',
          type: 'scatter',
          name: 'Drawdown at Well 2',
          line: {shape : "spline"},
          marker: { color: 'blue', size: 6 }
      }], {
          title: 'Drawdown vs Time (Well 2)',
          xaxis: { title: 'Time (days)' },
          yaxis: { title: 'Drawdown (meters)' },
          displayModeBar: false, // Hide the mode bar
          showlegend: false   
      });
      } catch (error) {
        console.error("Error during calculations or plotting:", error);
      }
    try {
      const timeIncrements = calculateLogarithmicTimeSteps(t, 50);
      const fractionPumpingValues = timeIncrements.map(time => calculateQFraction(d, Sy, T, time));
      
      // Log calculated values to confirm
      console.log("Calculated time increments:", timeIncrements);
      console.log("Calculated fraction pumping values:", fractionPumpingValues);

      // Plotting the graph
      Plotly.newPlot('qFractionPlot', [{
          x: timeIncrements,
          y: fractionPumpingValues,
          mode: 'lines+markers',
          line: {shape : "spline"},
          marker: { color: 'blue', size: 6 }
      }], {
          title: 'Fraction of Pumping Over Time',
          xaxis: { title: 'Time (days)' },
          yaxis: { title: 'Fraction Pumping', range: [0, 1] }
      });
  } catch (error) {
    console.error("Error during calculations or plotting:", error);
  }
    });
