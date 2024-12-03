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
export function erfc(x) {
  // Save the sign of x
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  // A fairly good approximation is:
  // erfc(β) ≈ 2/π * arctan(2β / (1 + β^4))
  const numerator = 2 * x;
  const denominator = 1 + Math.pow(x, 4);

  const result = (2 / Math.PI) * Math.atan(numerator / denominator);

  return sign === 1 ? result : 2 - result;
}

/**
 * Well Function W(u)
 *
 * Approximates the well function using a series expansion for u < 1
 * and an asymptotic expansion for u >= 1.
 *
 * @param {number} u - The input value.
 * @returns {number} - The well function value.
 */
export function W(u) {
  if (u <= 0) {
    console.log(
      "Error: u must be positive for the well function. Returning 0."
    );
    return 0;
  }

  // Coefficients from the document
  const a0 = -0.57721566;
  const a1 = 0.99999193;
  const a2 = -0.24991055;
  const a3 = 0.05519968;
  const a4 = -0.00976004;
  const a5 = 0.00107857;

  // Handle very small u values differently
  if (u < 1e-3) {
    // For very small u, use a different approximation
    const lnU = Math.log(u);
    return -lnU + a0;
  }

  const lnU = Math.log(u);
  const series =
    a1 * u +
    a2 * Math.pow(u, 2) +
    a3 * Math.pow(u, 3) +
    a4 * Math.pow(u, 4) +
    a5 * Math.pow(u, 5);

  return -lnU + a0 + series;
}

/**
 * Calculate Stream Depletion Fraction (Qfraction) Over Time
 */
export function calculateQFraction(d, Sy, T, t) {
  if (t <= 0) {
    throw new Error("Time 't' must be greater than 0.");
  }
  const argument = (d * d * Sy) / (4 * T * t);
  return erfc(argument);
}

/**
 * Calculate Drawdown at Location (x, y) and Time t
 */
export function calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell) {
  const r = Math.sqrt((x - xwell) ** 2 + (y - ywell) ** 2);

  // Compute u and u' using the document's exact formula
  const u = (r * r) / ((4 * T * t) / Sy);

  // Image well calculation
  const xImage = xwell + 2 * d;
  const rPrime = Math.sqrt((x - xImage) ** 2 + (y - ywell) ** 2);
  const uPrime = (rPrime * rPrime) / ((4 * T * t) / Sy);

  console.log(`Computed u: ${u}, uPrime: ${uPrime}`);

  const Wu = W(u);
  const WuPrime = W(uPrime);

  const drawdown = (Qw / (4 * Math.PI * T)) * (Wu - WuPrime);
  console.log(`\nCalculating drawdown at (${x}, ${y}) for t=${t} days`);
  console.log(`Well function results: Wu=${Wu}, WuPrime=${WuPrime}`);

  console.log(`Final drawdown: ${drawdown}`);
  return drawdown;
}

/**
 * Calculate Logarithmic Time Steps
 */
export function calculateLogTimeSteps(totalTime, n, multiplier) {
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

/**
 * Calculate Stream Leakage
 */
export function calculateStreamLeakage(Qw, Qfraction) {
  return Qw * Qfraction;
}

/**
 * Calculate Stream Discharge
 */
export function calculateStreamDischarge(Qs, QstreamLeakage) {
  return Qs - QstreamLeakage;
}
