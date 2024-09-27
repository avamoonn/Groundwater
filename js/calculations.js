// calculations.js

/**
 * Contains all functions for DFPS calculations
 */

/**
 * Complementary Error Function (erfc)
 *
 * @param {number} x - The input value.
 * @returns {number} - The complementary error function value.
 */
function erfc(x) {
  // Save the sign of x
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  // Constants for the approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Abramowitz and Stegun formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const poly =
    a1 +
    a2 * t +
    a3 * Math.pow(t, 2) +
    a4 * Math.pow(t, 3) +
    a5 * Math.pow(t, 4);
  const y = poly * t * Math.exp(-x * x);

  return sign === 1 ? y : 2 - y;
}

/**
 * Well Function W(u)
 *
 * Approximates the well function using a series expansion for u < 1
 * and an asymptotic expansion for u >= 1.
 * Reference: Hydrogeology textbooks and numerical methods.
 *
 * @param {number} u - The input value.
 * @returns {number} - The well function value.
 */
function W(u) {
  if (u === 0) {
    return 0;
  } else if (u < 1) {
    // Series expansion for u < 1
    const eulerMascheroni = 0.5772156649;
    let sum = eulerMascheroni - Math.log(u);
    let term = u;
    let n = 1;
    const maxIterations = 100;
    const tolerance = 1e-10;

    while (Math.abs(term / n) > tolerance && n < maxIterations) {
      sum += (Math.pow(-1, n + 1) * Math.pow(u, n)) / n;
      n++;
    }

    return sum;
  } else {
    // Asymptotic expansion for u >= 1
    // W(u) ≈ exp(-u) / u * (1 - 1/u + 2/u² - 6/u³ + ...)
    let sum = 0;
    const maxIterations = 10;
    const tolerance = 1e-10;
    for (let n = 0; n < maxIterations; n++) {
      const term = ((-1) ** n * factorial(n)) / Math.pow(u, n + 1);
      sum += term;
      if (Math.abs(term) < tolerance) {
        break;
      }
    }
    return Math.exp(-u) * sum;
  }
}

/**
 * Factorial Function
 *
 * Computes the factorial of a non-negative integer n.
 *
 * @param {number} n - The input integer.
 * @returns {number} - The factorial of n.
 */
function factorial(n) {
  if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers.");
  }
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculate Stream Depletion Fraction (Qfraction) Over Time
 *
 * Equation 2.1:
 * Qfraction = erfc( (d² * Sy) / (4 * T * t) )
 *
 * @param {number} d - Distance from well to stream (meters).
 * @param {number} Sy - Specific yield (dimensionless).
 * @param {number} T - Transmissivity (m²/day).
 * @param {number} t - Time since pumping began (days).
 * @returns {number} - Fraction of pumping rate coming from the stream.
 */
function calculateQFraction(d, Sy, T, t) {
  if (t <= 0) {
    throw new Error("Time 't' must be greater than 0.");
  }
  const argument = (d * d * Sy) / (4 * T * t);
  return erfc(argument);
}

/**
 * Calculate Drawdown at Location (x, y) and Time t
 *
 * Equation 2.4:
 * s(x, y, t) = (Qw / (4πT)) * (W(u) - W(u'))
 * where:
 *   u = (r² * Sy) / (4 * T * t)
 *   u' = ((2d - r)² * Sy) / (4 * T * t)
 *   r = sqrt((x - xwell)² + (y - ywell)²)
 *
 * @param {number} x - X-coordinate of the grid point (meters).
 * @param {number} y - Y-coordinate of the grid point (meters).
 * @param {number} t - Time since pumping began (days).
 * @param {number} Qw - Pumping rate (m³/s).
 * @param {number} T - Transmissivity (m²/day).
 * @param {number} Sy - Specific yield (dimensionless).
 * @param {number} d - Distance from well to stream (meters).
 * @param {number} xwell - X-coordinate of the well (meters).
 * @param {number} ywell - Y-coordinate of the well (meters).
 * @returns {number} - Drawdown at the specified location and time (meters).
 */
function calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell) {
  if (t <= 0) {
    throw new Error("Time 't' must be greater than 0.");
  }

  const r = calculateDistance(x, y, xwell, ywell);
  const u = (r * r * Sy) / (4 * T * t);
  const uPrime = ((2 * d - r) * (2 * d - r) * Sy) / (4 * T * t);

  const W_u = W(u);
  const W_uPrime = W(uPrime);

  const drawdown = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

  return drawdown;
}

/**
 * Calculate Straight-Line Distance r to the Well
 *
 * Equation 2.4 (part of grid calculations):
 * r = sqrt((xgrid - xwell)² + (ygrid - ywell)²)
 *
 * @param {number} xgrid - X-coordinate of the grid point (meters).
 * @param {number} ygrid - Y-coordinate of the grid point (meters).
 * @param {number} xwell - X-coordinate of the well (meters).
 * @param {number} ywell - Y-coordinate of the well (meters).
 * @returns {number} - Distance r (meters).
 */
function calculateDistance(xgrid, ygrid, xwell, ywell) {
  return Math.sqrt(Math.pow(xgrid - xwell, 2) + Math.pow(ygrid - ywell, 2));
}

/**
 * Calculate Logarithmic Time Steps
 *
 * This function calculates logarithmically spaced time steps.
 *
 * @param {number} t - Total time (days).
 * @param {number} n - Number of increments.
 * @returns {number[]} - Array of cumulative time steps.
 */
function calculateLogarithmicTimeSteps(t, n) {
  const timeSteps = [];
  const base = 2.5;

  const firstStep = t * (1.5 / (Math.pow(base, n) - 1));

  let cumulativeTime = firstStep;
  timeSteps.push(cumulativeTime);

  for (let i = 1; i < n; i++) {
    const nextStep = firstStep * Math.pow(base, i);
    cumulativeTime += nextStep;
    timeSteps.push(cumulativeTime);
  }

  // Adjust the final step to exactly match the total time 't'
  timeSteps[timeSteps.length - 1] = t;

  return timeSteps;
}

/**
 * Calculate velocity using Darcy's Law
 *
 * @param {number} hmax - The maximum hydraulic head.
 * @param {number} hmin - The minimum hydraulic head.
 * @param {number} Ka - Hydraulic conductivity.
 * @param {number} L - The grid cell side length.
 * @returns {number} - Velocity (m/s).
 */
function calculateVelocity(hmax, hmin, Ka, L) {
  return ((hmax - hmin) * Ka) / (0.02 * L);
}

/**
 * Creates a velocity grid for groundwater flow simulation.
 *
 * @param {number} gridSize - The number of grid points along one dimension (gridSize x gridSize grid).
 * @param {number} Ka - The hydraulic conductivity of the aquifer.
 * @returns {Array<Array<{x: number, y: number, velocity: number}>>} A 2D array representing the velocity grid.
 */
function createVelocityGrid(gridSize, Ka) {
  let grid = [];
  let L = 100 / (gridSize - 1);

  for (let i = 0; i < gridSize; i++) {
    let row = [];
    for (let j = 0; j < gridSize; j++) {
      let xgrid = i * L;
      let ygrid = j * L;
      let r = Math.sqrt((xgrid - 50) ** 2 + (ygrid - 50) ** 2);

      let hmax = 10 - 0.01 * r;
      let hmin = 5 - 0.005 * r;

      // Calculate velocity using Darcy's Law
      let v = calculateVelocity(hmax, hmin, Ka, L);

      row.push({
        x: xgrid,
        y: ygrid,
        velocity: v,
      });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Displays a velocity grid in an HTML table format.
 *
 * This function retrieves the hydraulic conductivity value from an input element,
 * creates a velocity grid using the specified grid size and hydraulic conductivity,
 * and then displays the grid in a table format within a specified result div.
 *
 * The table cells contain the coordinates and velocity at each grid point.
 *
 * @function
 * @name displayVelocityGrid
 * @returns {void}
 */
function displayVelocityGrid() {
  let gridSize = 21;
  let Ka = parseFloat(document.getElementById("conductivity").value);
  let grid = createVelocityGrid(gridSize, Ka);

  let resultDiv = document.getElementById("result_message");
  resultDiv.innerHTML = "<h4>Velocity Grid:</h4>";

  let table = '<table border="1">';
  for (let i = 0; i < grid.length; i++) {
    table += "<tr>";
    for (let j = 0; j < grid[i].length; j++) {
      let point = grid[i][j];
      table += `<td>(${point.x.toFixed(2)}, ${point.y.toFixed(
        2
      )}) <br> V: ${point.velocity.toFixed(4)} m/s</td>`;
    }
    table += "</tr>";
  }
  table += "</table>";

  resultDiv.innerHTML += table;
}

// eslint-disable-next-line no-undef
module.exports = {
  calculateLogarithmicTimeSteps,
  erfc,
  W,
  calculateQFraction,
  calculateDrawdown,
  createVelocityGrid,
  displayVelocityGrid,
  calculateDistance,
  calculateVelocity,
};
