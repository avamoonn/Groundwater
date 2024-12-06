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
 * Approximates the well function using a series expansion for u ≤ 1
 * and an asymptotic expansion for u > 1.
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

  // Constants for series expansion (u ≤ 1)
  const a0 = -0.57721566;
  const a1 = 0.99999193;
  const a2 = -0.24991055;
  const a3 = 0.05519968;
  const a4 = -0.00976004;
  const a5 = 0.00107857;

  if (u <= 1) {
    // Series expansion for small u
    const lnU = Math.log(u);
    const series =
      a1 * u + a2 * u ** 2 + a3 * u ** 3 + a4 * u ** 4 + a5 * u ** 5;
    return -lnU + a0 + series;
  } else {
    // Asymptotic expansion for large u
    const term1 = Math.exp(-u) / (4 * Math.PI * u);
    const term2 = 1 + 1 / (2 * u) + 1 / (4 * u ** 2) + 1 / (6 * u ** 3);
    return term1 * term2;
  }
}

/**
 * Calculate Stream Depletion Fraction (Qfraction) Over Time
 */
export function calculateQFraction(d, Sy, T, t) {
  if (t <= 0) {
    throw new Error("Time 't' must be greater than 0.");
  }
  const argument = Math.sqrt((d * d * Sy) / (4 * T * t));
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

  const u = (r * Sy) / (4 * T * t);
  const xImage = xwell + 2 * d; // Image well x-coordinate
  const rPrime = Math.sqrt((x - xImage) ** 2 + (y - ywell) ** 2);
  const uPrime = (rPrime * Sy) / (4 * T * t);
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
  // Qw is in m³/day, need to convert result to m³/s
  return Qw * Qfraction;
}

/**
 * Calculate Stream Discharge
 */
export function calculateStreamDischarge(Qs, QstreamLeakage) {
  // Qs is in m³/s, QstreamLeakage should be in m³/s
  return Qs - QstreamLeakage;
}

/**
 * Test function for W(u) calculations
 */
export function testWellFunction() {
  // Test cases from the provided table
  const testCases = [
    // Small u values (u ≤ 1)
    { u: 5e-4, expected: 7.0242 },
    { u: 1e-3, expected: 6.3315 },
    { u: 5e-3, expected: 4.9461 },
    { u: 1e-2, expected: 4.2579 },
    { u: 5e-2, expected: 2.8697 },
    { u: 1e-1, expected: 2.194 },
    { u: 5e-1, expected: 0.8588 },
    { u: 1.0, expected: 0.2194 },
    // Large u values (u > 1)
    { u: 2.0, expected: 0.0489 },
    { u: 5.0, expected: 0.0011 },
    { u: 10.0, expected: 0.00000454 },
  ];

  console.log("\n=== Testing Well Function W(u) ===");
  testCases.forEach(({ u, expected }) => {
    const calculated = W(u);
    const percentError = Math.abs(((calculated - expected) / expected) * 100);
    console.log(`u: ${u.toExponential(4)}`);
    console.log(`Expected W(u): ${expected}`);
    console.log(`Calculated W(u): ${calculated}`);
    console.log(`Percent Error: ${percentError.toFixed(4)}%\n`);
  });
}

/**
 * Test function for drawdown calculations
 */
export function testDrawdown() {
  // Test parameters based on spreadsheet
  const testParams = {
    T: 100, // m²/day
    Sy: 0.2,
    d: 50, // m
    Qw: 2880, // m³/day (2000 L/min)
  };

  // Test points at different distances and times
  const testPoints = [
    { x: 10, y: 0, t: 0.06 }, // Early time
    { x: 10, y: 0, t: 365 }, // Late time
    { x: 25, y: 0, t: 0.06 },
    { x: 25, y: 0, t: 365 },
  ];

  console.log("\n=== Testing Drawdown Calculations ===");
  testPoints.forEach((point) => {
    const s = calculateDrawdown(
      point.x,
      point.y,
      point.t,
      testParams.Qw,
      testParams.T,
      testParams.Sy,
      testParams.d,
      0,
      0
    );

    console.log(
      `\nTest Point: (${point.x}m, ${point.y}m) at t=${point.t} days`
    );
    console.log(`Drawdown: ${s !== null ? s.toFixed(3) : "null"} m`);

    // Calculate and log intermediate values
    const r = Math.sqrt(point.x * point.x + point.y * point.y);
    const u = (r * testParams.Sy) / (4 * testParams.T * point.t);
    const xImage = 2 * testParams.d;
    const rPrime = Math.sqrt(
      (point.x - xImage) * (point.x - xImage) + point.y * point.y
    );
    const uPrime = (rPrime * testParams.Sy) / (4 * testParams.T * point.t);

    console.log(`r: ${r.toFixed(3)} m`);
    console.log(`u: ${u.toExponential(4)}`);
    console.log(`r': ${rPrime.toFixed(3)} m`);
    console.log(`u': ${uPrime.toExponential(4)}`);
  });
}
