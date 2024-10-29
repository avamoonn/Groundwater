import { calculateQFraction, calculateLogarithmicTimeSteps } from "./calculations.js";

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

// Example: display the data in result_message for testing

   // Try calculations, and catch any errors that might cause the 405 error
   try {
    const timeIncrements = calculateLogarithmicTimeSteps(t, n);
    const fractionPumpingValues = timeIncrements.map(time => calculateQFraction(d, Sy, T, time));
    
    // Log calculated values to confirm
    console.log("Calculated time increments:", timeIncrements);
    console.log("Calculated fraction pumping values:", fractionPumpingValues);

    // Plotting the graph
    Plotly.newPlot(graphDiv, [{
        x: timeIncrements,
        y: fractionPumpingValues,
        mode: 'lines+markers',
        marker: { color: 'blue', size: 6 }
    }], {
        title: 'Fraction of Pumping Over Time',
        xaxis: { title: 'Time (days)'},
        yaxis: { title: 'Fraction Pumping', range: [0, 1] }
    });
} catch (error) {
    console.error("Error during calculations or plotting:", error);
}

});

// Listen to form reset button
// Listen to form reset button
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

  console.log("Input values:", { d, F, Ka, b, Sy, Qs, Qw, ox1, oy1, ox2, oy2, t, n, T });

  // Try calculations and catch any errors that might cause issues
  try {
    const timeIncrements = calculateLogarithmicTimeSteps(t, n);
    const fractionPumpingValues = timeIncrements.map(time => calculateQFraction(d, Sy, T, time));
    
    // Log calculated values to confirm
    console.log("Calculated time increments:", timeIncrements);
    console.log("Calculated fraction pumping values:", fractionPumpingValues);

    // Plotting the graph
    Plotly.newPlot('qFractionPlot', [{
        x: timeIncrements,
        y: fractionPumpingValues,
        mode: 'lines+markers',
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


/*
  
  // model calculations
  // recharge is p - et
  const rYR = (pYR);
  //convert mm/yr to m/d
  const rDay = (pYR) / 365.25/ 1000;
  //calculate flow at left
  const qLeft = (kH * (hLt * hLt - hRt * hRt) / 2 / distL) - 
        (rDay * (distL / 2 - 0));
  //calculate flow at top
  const qTop = rDay * distL;
  //calculate flow at right
  const qRight = (kH * (hLt * hLt - hRt * hRt) / 2 / distL) - 
        (rDay * (distL / 2 - distL));
    //calculate flow divide location
  let divide = (distL / 2 - (kH / rDay) * (hLt * hLt - hRt * hRt) / 2 / distL);

  //check if divide is outside of system such that there is no diivide in land mass, 
  // that is flow is all either positive or negative 
  // set a value of divide outside to the location of the higher of the boundary heads
  if (divide <= 0) {
    divideAdjusted = 0; // divide is on the left
  } else if (divide >= distL) {
    divideAdjusted = distL; // divide is on the right
  } else {
    divideAdjusted = divide; // divide is within land mass so divide and divideAdjusted are the same
  }
        
  // calculate hmax from base equations and then hmax for adjusted divide position
  const inner_SQRT = (hLt * hLt) - ((hLt * hLt - hRt * hRt) * divide / distL) + 
    (rDay / kH) * (distL - divide) * divide;
    // hMax at location adjusted from outside of land mass
  const inner_SQRToutside = (hLt * hLt) - ((hLt * hLt - hRt * hRt) * divideAdjusted / distL) + 
                 (rDay / kH) * (distL - divideAdjusted) * divideAdjusted;
    // can't take square root of negative value so set hMax to 0
  if (inner_SQRT < 0){
    hMax = 0;
  } else {
    hMax = Math.sqrt(inner_SQRT);
  }
  if (inner_SQRToutside < 0){
    hMaxAdjusted = 0;
  } else {
    hMaxAdjusted = Math.sqrt(inner_SQRToutside);
  }
    
  // determine the proper labels given the flow configuration
  result_Div = ' ';
  arrows = true;

  // if no recharge (p=et) there is no divide and flow is either through in one direction or stagnant
  //if p=et then if hLt higher flow is left to right, if hRt high right to left and if = then water is stagnant
  if (pYR === 0) {
    if (hLt > hRt){
      side = 'calculated divide is <font color=black>' + 
        divide.toPrecision(sigFig).toString() + 
        '<font color=blue>, the distance needed for accumulated recharge to ' +
        ' equal flow in from the left.';
    } if (hLt < hRt){
      side = 'calculated divide is <font color=black>' + 
        divide.toPrecision(sigFig).toString() + 
        '<font color=blue>, the distance needed for accumulated recharge to ' +
        ' equal flow in from the right.';
    } if (hLt === hRt){
      side = ' GROUNDWATER is STAGNANT';
      arrows = false;
    }
    result_Div = '<b><font color=blue><font size=3px>NO DIVIDE&nbsp&nbsp&nbsp&nbsp'  + side;
  }
  // get the proper labels for the accumulated recharge when divide is outside the land mass
  else {
    if (divide < 0){
      if (rDay < 0){
        //special case adjust divide calculation and direction when recharge is negative
        divide = Math.abs(divide) + distL;
        side3 = '<font color=black> NO DIVIDE<br>CALCULATED DIVIDE <font color=blue>' + 
          divide.toPrecision(sigFig).toString() + 
          '<font color=black> for recharge to equal inflow from right' ;
      }
      else {
        side3 = '<font color=black> NO DIVIDE<br>CALCULATED DIVIDE <font color=blue>' + 
        divide.toPrecision(sigFig).toString() + 
        '<font color=black> for recharge to equal inflow from left';
      }
    } else if (divide > distL){
      if (rDay < 0){
        //special case adjust divide calculation and direction when recharge is negative
        divide = -1 * divide + distL;
        side3 = '<font color=black> NO DIVIDE<br>CALCULATED DIVIDE <font color=blue>' + 
          divide.toPrecision(sigFig).toString() + 
          '<font color=black> for recharge to equal inflow from left';
      }
      else {
        side3 = '<font color=black> NO DIVIDE<br>CALCULATED DIVIDE <font color=blue>' + 
        divide.toPrecision(sigFig).toString() + 
        '<font color=black> for recharge to equal inflow from right' ;
      }
    } else {
      side3 = ' ';
    }
    // create label for the divide information
    if (divideAdjusted > 0 && divideAdjusted < distL) { 
      if (hMaxAdjusted === 0) {
        result_Div = '<b><font color=blue><font size=3px> Groundwater Divide is at <font color=black> &nbsp &nbsp x = ' + 
          divideAdjusted.toPrecision(sigFig).toString() + 
          ' meters <font color=blue> &nbsp &nbsp with &nbsp &nbsp <font color=red> Head below aquifer bottom. <font color=black>'
          + side3  + '<font color=black>';
      }
      else {
        result_Div = '<b><font color=blue><font size=3px> Groundwater Divide is at <font color=black> &nbsp &nbsp x = ' + 
        divideAdjusted.toPrecision(sigFig).toString() + 
        ' meters <font color=blue> &nbsp &nbsp with &nbsp &nbsp <font color=black>Head = ' 
        + hMaxAdjusted.toPrecision(sigFig).toString() +
        ' meters' + side3  + '<font color=black>';
      }
    } else {
      result_Div = '<b><font color=blue><font size=3px>' + side3  + '<font color=black>';
    }
  }

  // prepare cautionary messages
  modeler_Caution = '<u>A modeler\'s job is to determine whether results are useful in any way ' +
                        'and, if not, what to do next.</b><br><br></u>';
  // warn if adjusted hMax is above ground surface or below aquifer bottom
  above = hMaxAdjusted - zGS;
  // warning above surface
  if (hMaxAdjusted > zGS) {
    result_Error =  '<br><b><font color=red>ERROR!! &nbsp&nbsp WATER TABLE IS &nbsp&nbsp&nbsp&nbsp' +  
        above.toPrecision(sigFig).toString() + ' m  &nbsp&nbsp&nbsp&nbsp  ABOVE GROUND SURFACE' +
        '<br> ' + modeler_Caution;
  } // warning if hMax below aquifer base
  else if (hMaxAdjusted <= 0) {
    result_Error =  '<br><b><font color=red>ERROR!! &nbsp&nbsp WATER TABLE IS BELOW AQUIFER BOTTOM' +
        '<br><br>ASSUMPTIONS of NON-ZERO AQUIFER THICKNESS and HORIZONTAL FLOW are BROKEN<br><br>' + 
        'WATER LEVELS and FLOW RATES are NOT RELIABLE<br></br>'
        + modeler_Caution;
    redFlagHead = 'Heads are negative.';
  } else // water level is OK so no message
  {
    result_Error =  '<b>'; 
  }

  // set output format --- # of decimals and scientific notation or decimal format
  let type_dec = true;
  if (notation === 1){
    type_dec = true;}
  else if (notation === 2){
    type_dec = false;
  }

  // put results in proper format #sig figs and decimal or scientific notation
  let mmYR = 0;
  let mDay = 0;
  let textQtop = 0;
  let textQleft = 0;
  let textQright = 0;
  if (type_dec === true){
    mmYR = rYR.toPrecision(sigFig).toString();
    mDay = rDay.toPrecision(sigFig).toString();
    textQleft = qLeft.toPrecision(sigFig).toString();
    textQtop = qTop.toPrecision(sigFig).toString();
    textQright = qRight.toPrecision(sigFig).toString();
  }
  else {
    mmYR = rYR.toExponential(sigFig).replace('e', ' x 10<sup>').toString() + '</sup>';
    mDay = rDay.toExponential(sigFig).replace('e', ' x 10<sup>').toString() + '</sup>';
    textQleft = qLeft.toExponential(sigFig).replace('e', ' x 10<sup>').toString() + '</sup>';
    textQtop = qTop.toExponential(sigFig).replace('e', ' x 10<sup>').toString() + '</sup>';
    textQright = qRight.toExponential(sigFig).replace('e', ' x 10<sup>').toString() + '</sup>';
  }
    
  // define output flow arrows based on directions of system flow
  let arrow_L = '\u{21E6}';
  let arrow_T = '\u{21E9}';
  let arrow_R = '\u{21E8}';

  // create text recharge rate converted mm/yr to m/day
  const result_Rch = '<font color=green><b>Recharge Rate (Precipitation-Runoff-Evapotranspiration) &nbsp&nbsp&nbsp&nbsp mm/YR = ' + mmYR +
    ' &nbsp&nbsp&nbsp&nbsp m/DAY = '  + mDay + '</b><br>' + '<br>';
   
  // create text  for left top & right of model - determine the values and the arrow color and direction
  results = '<font color=blue><b>Resulting Flow rates (Q) <br>(m<sup>3</sup>/day per meter distance perpendicular ' +
    'to the cross section)</b><br>';
  // left
  if (qLeft < 0) {
    result_L = '<font color=blue><b>Q left = ' + textQleft +  '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
    arrow_L = '<br><font color=blue><font size=350px>' + '\u{21E6}' + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
  }
  else if (qLeft > 0) {
    result_L = '<font color=blue><b>Q left = ' + textQleft + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
    arrow_L = '<br><font color=blue><font size=350px>' + '\u{21E8}' + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
  } else if (qLeft === 0)  {
    result_L = '<font color=black><b>Q left = ' + textQleft + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
    arrow_L = '<br><font color=black><font size=350px>' + '\u{2022}' + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
  }
  // top
  if (qTop < 0) {
    result_T = '<font color=red><b>Q recharge = ' + textQtop + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
    arrow_T = '<font color=red><font size=350px>' + '\u{21E7}' + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
  } else if (qTop > 0) {
    result_T = '<font color=blue><b>Q recharge = ' + textQtop + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
    arrow_T = '<font color=blue><font size=350px>' + '\u{21E9}' + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
  } else if (qTop === 0) {
    result_T = '<font color=black><b>Q recharge = ' + textQtop + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
    arrow_T = '<font color=black><font size=350px>' + '\u{2022}' + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
  }
  // right
  if (qRight < 0) {
    result_R = '<font color=blue><b>Q right = ' + textQright;
    arrow_R = '<font color=blue><font size=50px>' + '\u{21E6}' + '</font size>';
  } else if (qRight > 0) {
    result_R = '<font color=blue><b>Q right = ' + textQright;
    arrow_R = '<font color=blue><font size=50px>' + '\u{21E8}' + '</font size>';
  } else if (qRight === 0) {
    result_R = '<font color=black><b>Q right = ' + textQright;
    arrow_R = '<font color=black><font size=50px>' + '\u{2022}' + '</font size>';
  }

  // create message that graphs follow
  const graph_caption = '<font color=black><font size=3px>The results are plotted below</font size>';

  // this prints the values and arrows and message about the divide then message that the graph follows
  if (!stop) {
    results_message.innerHTML = result_Rch + results + result_Error + result_L + result_T  + result_R +
      arrow_L + arrow_T + arrow_R + '<br>' + result_Div + '<br>' + graph_caption;
  } else {
    results_message.innerHTML = result_Error;
  }
      
  // generate the graphs of water level and flow rate
  // h at x
  let exp =
      'Math.sqrt(((hLt * hLt) - ((hLt * hLt - hRt * hRt) * x / distL) + (rDay / kH) * (distL - x) * x))';
    // q at x
  let exp2 = '(kH * (hLt * hLt - hRt * hRt) / 2 / distL) - (rDay * (distL / 2 - x))';
  // set functions for calculating graph values to 0 in the following cases
  if (stop || distL <= 0 || zGS <= 0 || hLt <= 0 || hRt <= 0 || hLt > zGS || hRt > zGS || kH <= 0) {
    exp = 'x * 0';
    exp2 = 'x * 0';
    results_message.innerHTML = ' ';
  } 

  // generate values for water levels
  const xValues = [];
  const yValues = [];
  for (let x = 0; x <= distL; x += 0.01) {
    xValues.push(x);
    yValues.push(eval(exp));
  }
  xValues.unshift(0);
  yValues.unshift(0);
  xValues.push(distL);
  if (stop) {
    yValues.push(0);
  } else {
    yValues.push(hRt);
  }

  // generate values for flow rate
  const xQvalues = [];
  const yQvalues = [];
  // chcek for water levels of NaN and adjust corresponding Flow rates
  //let n = -1;
  for (let x = 0; x <= distL; x += 0.01) {
    n++;
    xQvalues.push(x);
    yQvalues.push(eval(exp2));
    // if h at this x is NaN then make q = NaN
    if (yValues[n] !== yValues[n]) {
      yQvalues[n] = 1 / 0;
    }
  }
  // get max min for y axis of flow graph
  ymin = Math.min(yQvalues);
  ymax = Math.max(yQvalues);

  const Head = {
    x: xValues,
    y: yValues,
    type: 'line'
  };
      
  const Flow = {
    x: xQvalues,
    y: yQvalues,
    xaxis: 'x2',
    yaxis: 'y2',
    type: 'line'
  };
      
  const mydata = [Head, Flow];
      
  const layout = {
    grid: {rows: 2, columns: 1, pattern: 'independent'},
    showlegend: false,
    title: 'BLUE: Water Table Elevation (m)<br>ORANGE: Flow (m<sup>3</sup>/day per meter) ',
	    xaxis: {range: [0, distL], title: 'Distance Meters'}
  };
      
  Plotly.newPlot('myPlot', mydata, layout);
     
});*/
