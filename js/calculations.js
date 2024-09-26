/**
 * Contains all functions for DFPS calculations
 * */
function calculateLogarithmicTimeSteps(t, n) {
  const timeSteps = []; // Initialize an array to store time steps
  const base = 2.5; // Constant for each subsequent step to be 2.5 times longer

  // Calculate the first time step
  const firstStep = t * (1.5 / (Math.pow(base, n) - 1));

  // Add the first time step to the array
  let cumulativeTime = firstStep;
  timeSteps.push(cumulativeTime);

  // Calculate each subsequent time step
  for (let i = 1; i < n; i++) {
    const nextStep = firstStep * Math.pow(base, i); // Each step is 2.5 times the previous
    cumulativeTime += nextStep; // Add it to the cumulative total
    timeSteps.push(cumulativeTime); // Store the cumulative time
  }

  // Adjust the final step to exactly match the total time 't'
  timeSteps[timeSteps.length - 1] = t;

  return timeSteps;
}

module.exports = { calculateLogarithmicTimeSteps };
