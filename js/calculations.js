// calculations.js

/**
 * Complementary Error Function (erfc)
 *
 * @param {number} x - The input value.
 * @returns {number} - The complementary error function value.
 */
export function erfc(x) {
  return 1 - erf(x);
}

/**
 * Error Function (erf)
 *
 * Approximation using numerical methods.
 *
 * @param {number} x - The input value.
 * @returns {number} - The error function value.
 */
function erf(x) {
  // Save the sign of x
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  // Constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Approximation
  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Calculate Stream Depletion Fraction (Qfraction) Over Time
 *
 * Qfraction = erfc( d / (2 * sqrt(T * t / Sy)) )
 *
 * @param {number} d - Distance from well to stream (meters).
 * @param {number} Sy - Specific yield (dimensionless).
 * @param {number} T - Transmissivity (m²/day).
 * @param {number} t - Time since pumping began (days).
 * @returns {number} - Fraction of pumping rate coming from the stream.
 */
export function calculateQFraction(d, Sy, T, t) {
  if (t <= 0) {
    throw new Error("Time 't' must be greater than 0.");
  }
  const argument = d / (2 * Math.sqrt((T * t) / Sy));
  return erfc(argument);
}

/**
 * Calculate Drawdown at Location (x, y) and Time t
 *
 * s(x, y, t) = (Qw / (4πT)) * [ W(u) + W(u') ]
 *
 * where:
 *   u = (r² * Sy) / (4 * T * t)
 *   u' = (r'² * Sy) / (4 * T * t)
 *   r = sqrt((x - xwell)² + (y - ywell)²)
 *   r' = sqrt((x - xImage)² + (y - ywell)²)
 *   xImage = xwell + 2d (location of image well)
 *
 * @param {number} x - X-coordinate of the grid point (meters).
 * @param {number} y - Y-coordinate of the grid point (meters).
 * @param {number} t - Time since pumping began (days).
 * @param {number} Qw - Pumping rate (m³/day).
 * @param {number} T - Transmissivity (m²/day).
 * @param {number} Sy - Specific yield (dimensionless).
 * @param {number} d - Distance from well to stream (meters).
 * @param {number} xwell - X-coordinate of the well (meters).
 * @param {number} ywell - Y-coordinate of the well (meters).
 * @returns {number} - Drawdown at the specified location and time (meters).
 */
export function calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell) {
  if (t <= 0) {
    throw new Error("Time 't' must be greater than 0.");
  }

  const rSquared = (x - xwell) ** 2 + (y - ywell) ** 2;
  const u = (rSquared * Sy) / (4 * T * t);

  const xImage = xwell + 2 * d; // Image well x-coordinate
  const rPrimeSquared = (x - xImage) ** 2 + (y - ywell) ** 2;
  const uPrime = (rPrimeSquared * Sy) / (4 * T * t);

  const W_u = wellFunction(u);
  const W_uPrime = wellFunction(uPrime);

  const drawdown = (Qw / (4 * Math.PI * T)) * (W_u + W_uPrime);

  return drawdown;
}

/**
 * Well Function W(u)
 *
 * Approximation using exponential integral.
 *
 * @param {number} u - The input value.
 * @returns {number} - The well function value.
 */
export function wellFunction(u) {
  if (u === 0) {
    return 0;
  } else if (u < 1) {
    // Use series expansion
    const eulerMascheroni = 0.5772156649;
    let sum = -Math.log(u) + eulerMascheroni;
    let term = u;
    let n = 1;
    while (term > 1e-8) {
      sum -= term / n;
      n++;
      term *= -u;
    }
    return sum;
  } else {
    // Use approximation for large u
    return Math.exp(-u) / u;
  }
}

/**
 * Calculate Stream Leakage
 *
 * @param {number} Qw - Pumping rate (m³/day)
 * @param {number} Qfraction - Stream depletion fraction
 * @returns {number} - Stream leakage rate (m³/day)
 */
export function calculateStreamLeakage(Qw, Qfraction) {
  return Qw * Qfraction;
}

/**
 * Calculate Stream Discharge
 *
 * @param {number} Qs - Initial stream discharge (m³/day)
 * @param {number} QstreamLeakage - Stream leakage rate (m³/day)
 * @returns {number} - Remaining stream discharge (m³/day)
 */
export function calculateStreamDischarge(Qs, QstreamLeakage) {
  return Qs - QstreamLeakage;
}

/**
 * Calculate Logarithmic Time Steps
 *
 * This function calculates logarithmically spaced time steps.
 *
 * @param {number} totalTime - Total time (days).
 * @param {number} n - Number of increments.
 * @param {number} multiplier - Multiplier for time steps.
 * @returns {number[]} - Array of cumulative time steps.
 */
export function calculateLogTimeSteps(totalTime, n, multiplier) {
  let times = [];
  let time =
    (totalTime * (multiplier - 1)) / (Math.pow(multiplier, n) - 1 || 1);
  let cumulativeTime = time;
  times.push(cumulativeTime);

  for (let i = 1; i < n; i++) {
    time *= multiplier;
    cumulativeTime += time;
    times.push(cumulativeTime);
  }

  // Ensure the last time step is exactly totalTime
  times[times.length - 1] = totalTime;

  return times;
}
