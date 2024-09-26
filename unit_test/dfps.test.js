
/**
 * Unit tests of all calculations for DFPS tool
 * @jest-environment jsdom
 */
const { calculateLogarithmicTimeSteps } = require('../js/calculations');

describe('DFPS Calculation Tests', () => {
  const epsilon = 0.01; // Small margin for floating point comparison
  
  function arraysAreClose(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (Math.abs(arr1[i] - arr2[i]) > epsilon) {
        console.log(`Value mismatch at index ${i}: Expected ${arr2[i]}, but got ${arr1[i]}`);
        return false;
      }
    }
    return true;
  }
  
  test('Test case 1: total time 100, increments 5', () => {
    const t = 100, n = 5;
    const expected = [1.55, 5.43, 15.13, 39.38, 100];
    const result = calculateLogarithmicTimeSteps(t, n);
    console.log('Result:', result); // Log the result for debugging
    expect(arraysAreClose(result, expected)).toBe(true);
  });
  
  test('Test case 2: total time 50, increments 4', () => {
    const t = 50, n = 4;
    const expected = [1.97, 6.90, 19.21, 50]; // Adjusted expected values based on the new formula
    
    const result = calculateLogarithmicTimeSteps(t, n);
    console.log('Result:', result); // Log the result for debugging
    expect(arraysAreClose(result, expected)).toBe(true);
  });
    
  test('Test case 3: total time 200, increments 6', () => {
    const t = 200, n = 6;
    const expected = [1.23, 4.32, 12.03, 31.31, 79.51, 200]; // Adjusted expected values
    
    const result = calculateLogarithmicTimeSteps(t, n);
    console.log('Result:', result); // Log the result for debugging
    expect(arraysAreClose(result, expected)).toBe(true);
  }); 
});
