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

  // Constants for the approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Abramowitz and Stegun formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const poly = a1 * t + a2 * t ** 2 + a3 * t ** 3 + a4 * t ** 4 + a5 * t ** 5;
  const y = poly * Math.exp(-x * x);

  return sign === 1 ? y : 2 - y;
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
    return 0; // Return a default value for invalid u
  }

  console.log(`Calculating well function W(u) for u=${u}`);

  const a0 = -0.57721566;
  const a1 = 0.99999193;
  const a2 = -0.24991055;
  const a3 = 0.05519968;
  const a4 = -0.00976004;
  const a5 = 0.00107857;

  const lnU = Math.log(u);
  const series = a1 * u + a2 * u ** 2 + a3 * u ** 3 + a4 * u ** 4 + a5 * u ** 5;

  const result = -lnU + a0 + series;
  console.log(`W(u): ${result} (lnU=${lnU}, series=${series})`);

  return result;
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
  if (t <= 0) {
    console.log("Error: Time 't' must be greater than 0.");
    throw new Error("Time 't' must be greater than 0.");
  }

  console.log(`\nCalculating drawdown at (${x}, ${y}) for t=${t} days`);
  console.log(
    `Inputs: Qw=${Qw}, T=${T}, Sy=${Sy}, d=${d}, xwell=${xwell}, ywell=${ywell}`
  );

  const r = Math.sqrt((x - xwell) ** 2 + (y - ywell) ** 2);
  console.log(`Distance to well (r): ${r}`);

  if (r === 0) {
    console.log(
      "Drawdown cannot be calculated at the well location (r = 0). Returning null."
    );
    return null;
  }

  const u = (r ** 2 * Sy) / (4 * T * t);
  const xImage = xwell + 2 * d; // Image well x-coordinate
  const rPrime = Math.sqrt((x - xImage) ** 2 + (y - ywell) ** 2);
  const uPrime = (rPrime ** 2 * Sy) / (4 * T * t);
  console.log(`Computed u: ${u}, uPrime: ${uPrime}`);

  if (u <= 0 || uPrime <= 0 || isNaN(u) || isNaN(uPrime)) {
    console.log(
      `Invalid values for u or uPrime: u=${u}, uPrime=${uPrime}. Returning null.`
    );
    return null;
  }

  const Wu = W(u);
  const WuPrime = W(uPrime);
  console.log(`Well function results: Wu=${Wu}, WuPrime=${WuPrime}`);

  const drawdown = (Qw / (4 * Math.PI * T)) * (Wu - WuPrime);
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
