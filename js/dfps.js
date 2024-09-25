// prepare to pas messages to html
const data_form = document.querySelector('#data_form');
const error_message = document.querySelector('#error_message');
const error_message1 = document.querySelector('#error_message1');
const error_message2 = document.querySelector('#error_message2');
const results_message = document.querySelector('#result_message');

//listen to input data
data_form.addEventListener('submit', function(e) {
  e.preventDefault();
  //initiate values
  const data = new FormData(this);
  let count = 0;
  let error = false;
  let error1 = false;
  let error2 = false;
  let message = ' ';
  let message1 = ' ';
  let message2 = ' ';
  let results = ' ';
  //set message color
  error_message.style.color = 'black';
  error_message1.style.color = 'black';
  error_message2.style.color = 'black';
  result_message.style.color = 'black';
  //get data from form inputs  
  let distL = data.get('in_distL');
  let zGS = data.get('in_zGS');
  let hLt = data.get('in_hLt');
  let hRt = data.get('in_hRt');
  let kH = data.get('in_kH');
  let pYR = data.get('in_pYR');
  let sigFig = data.get('in_sigFig');
  let notation = data.get('in_notation');
  //change text to numbers
  distL = Number(distL);
  zGS = Number(zGS);
  hLt = Number(hLt);
  hRt = Number(hRt);
  kH = Number(kH);
  pYR = Number(pYR);
  sigFig = Number(sigFig);
  notation = Number(notation);
  //prepare to stop if needed
  let stop = false;

  //check for input errors address them as needed with messages or defaults
  message = ' ';
  message1 = ' ';
  message2 = '<b>Warning: </b>';
  if (distL <= 0){
    error = true;
    count ++;
    message = message + ' <b>L</b> ';
  }
  if (zGS <= 0){
    error = true;
    count ++;
    message = message + '  <b>z</b> ';
  }
  if (hLt <= 0){
    error = true;
    count ++;
    message = message + ' <b>Hleft</b> ';
  }
  if (hLt > zGS){
    error2 = true;
    message2 = message2 + ' <b> Hleft </b> ';
  }
  if (hRt <= 0){
    error = true;
    count ++;
    message = message + '  <b>Hright</b> ';
  }
  if (hRt > zGS){
    error2 = true;
    message2 = message2 + ' <b> Hright </b> ';
  }
  if (kH <= 0){
    error = true;
    count ++;
    message = message + '  <b>Kh</b> ';
  }
  if (error === true){
    stop = true;
    if (count >1) {
      message = message + ' must be <b>>0</b>. ';
    } else {
      message = message + ' must be <b>>0</b>. '; 
    }
  }
  if (sigFig <= 0){
    error1 = true;
    sigFig = 3;
    message1 = message1 + '  <b>SigFigs</b> must be <b>>0, will assume 3</b>. ';
  }
  if (sigFig > 20){
    error1 = true;
    sigFig = 20;
    message1 = message1 + '  <b>SigFigs</b> must be <b><=20, will assume 20</b>. ';
  }
  if (notation !== 1 && notation !== 2){
    error1 = true;
    notation = 1;
    message1 = message1 + '  <b>Notation</b> must be <b>1 or 2, will assume 1</b>. ';
  }

  if (error === true) {
    error_message.style.color = 'red';
    error_message.innerHTML = message;
  } 
  if (error === false) {
    error_message.style.color = 'black';
    error_message.innerHTML = ' ';
  }
  if (error1 === true) {
    message1 = message1 + '</b> ';
    error_message1.style.color = 'red';
    error_message1.innerHTML = message1;
  } 
  if (error1 === false) {
    error_message1.style.color = 'black';
    error_message1.innerHTML = ' ';
  }
  if (error2 === true) {
    message2 = message2 + '<b> - higher than groundsurface.</b> ';
    error_message2.style.color = 'red';
    error_message2.innerHTML = message2;
  } 
  if (error2 === false) {
    error_message2.style.color = 'black';
    error_message2.innerHTML = ' ';
  }

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
  let n = -1;
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
     
});
