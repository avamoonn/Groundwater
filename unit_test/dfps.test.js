/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/**
 * Unit tests of all calculations for DFPS tool
 * @jest-environment jsdom
 */
const {
  calculateLogarithmicTimeSteps,
  erfc,
  W,
  calculateQFraction,
  calculateDrawdown,
  calculateDistance,
  calculateStreamLeakage,
  calculateStreamDischarge,
  createVelocityGrid,
  displayVelocityGrid,
} = require("../js/calculations");

describe("DFPS Calculation Tests", () => {
  /**
   * Helper function to compare two arrays within a small epsilon.
   * Returns true if all corresponding elements are within epsilon.
   */
  function arraysAreClose(arr1, arr2, epsilon = 0.01) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (Math.abs(arr1[i] - arr2[i]) > epsilon) {
        console.log(
          `Value mismatch at index ${i}: Expected ${arr2[i]}, but got ${arr1[i]}`
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Helper function to compare two numbers within a small epsilon.
   * Returns true if the difference is within epsilon.
   */
  function numbersAreClose(num1, num2, epsilon = 0.01) {
    return Math.abs(num1 - num2) <= epsilon;
  }

  // Tests for calculateLogarithmicTimeSteps
  describe("calculateLogarithmicTimeSteps", () => {
    test("Test case 1: total time 100, increments 5", () => {
      const t = 100,
        n = 5;
      const expected = [1.55, 5.43, 15.13, 39.38, 100];
      const result = calculateLogarithmicTimeSteps(t, n);
      console.log("Logarithmic Time Steps Result:", result); // Log the result for debugging
      expect(arraysAreClose(result, expected, 0.1)).toBe(true); // Increased epsilon for approximation
    });

    test("Test case 2: total time 50, increments 4", () => {
      const t = 50,
        n = 4;
      const expected = [1.97, 6.9, 19.21, 50]; // Adjusted expected values based on the new formula

      const result = calculateLogarithmicTimeSteps(t, n);
      console.log("Logarithmic Time Steps Result:", result); // Log the result for debugging
      expect(arraysAreClose(result, expected, 0.1)).toBe(true);
    });

    test("Test case 3: total time 200, increments 6", () => {
      const t = 200,
        n = 6;
      const expected = [1.23, 4.32, 12.03, 31.31, 79.51, 200]; // Adjusted expected values

      const result = calculateLogarithmicTimeSteps(t, n);
      console.log("Logarithmic Time Steps Result:", result); // Log the result for debugging
      expect(arraysAreClose(result, expected, 0.1)).toBe(true);
    });
  });

  // Tests for erfc function
  describe("erfc Function", () => {
    test("erfc(0) should return approximately 1", () => {
      const input = 0;
      const expected = 1;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(1) should be approximately 0.1572992", () => {
      const input = 1;
      const expected = 0.1572992;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(-1) should be approximately 1.8427008", () => {
      const input = -1;
      const expected = 1.8427008;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(2) should be approximately 0.00467773", () => {
      const input = 2;
      const expected = 0.00467773;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });
  });

  // Tests for calculateQFraction
  describe("calculateQFraction", () => {
    test("Valid inputs should return correct Qfraction", () => {
      // Example values
      const d = 100; // meters
      const Sy = 0.2; // dimensionless
      const T = 500; // m²/day
      const t = 10; // days

      const argument = (d * d * Sy) / (4 * T * t); // (10000 * 0.2) / (2000) = 1
      const expected = erfc(argument); // erfc(1) ≈ 0.1572992

      const result = calculateQFraction(d, Sy, T, t);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Qfraction with d=0 should return erfc(0) = 1", () => {
      const d = 0;
      const Sy = 0.2;
      const T = 500;
      const t = 10;

      const expected = erfc(0); // 1

      const result = calculateQFraction(d, Sy, T, t);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Qfraction with large d should approach 0", () => {
      const d = 10000; // very large distance
      const Sy = 0.2;
      const T = 500;
      const t = 10;

      const argument = (d * d * Sy) / (4 * T * t); // (100000000 * 0.2) / 20000 = 1000

      const result = calculateQFraction(d, Sy, T, t);
      expect(result).toBeCloseTo(0, 6);
    });

    test("Zero time should throw an error", () => {
      expect(() => {
        calculateQFraction(100, 0.2, 500, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });

    test("Negative time should throw an error", () => {
      expect(() => {
        calculateQFraction(100, 0.2, 500, -5);
      }).toThrow("Time 't' must be greater than 0.");
    });
  });

  // Tests for calculateDistance
  describe("calculateDistance", () => {
    test("Distance between (0,0) and (3,4) should be 5", () => {
      const xgrid = 3;
      const ygrid = 4;
      const xwell = 0;
      const ywell = 0;
      const expected = 5;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance between (1,1) and (4,5) should be 5", () => {
      const xgrid = 4;
      const ygrid = 5;
      const xwell = 1;
      const ywell = 1;
      const expected = 5;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance between (-2,-3) and (4,1) should be 7.21110255", () => {
      const xgrid = 4;
      const ygrid = 1;
      const xwell = -2;
      const ywell = -3;
      const expected = Math.sqrt((4 - -2) ** 2 + (1 - -3) ** 2); // sqrt(36 + 16) = sqrt(52) ≈ 7.21110255

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance when grid and well are the same point should be 0", () => {
      const xgrid = 5;
      const ygrid = 5;
      const xwell = 5;
      const ywell = 5;
      const expected = 0;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });
  });

  // Tests for calculateDrawdown
  describe("calculateDrawdown", () => {
    test("Drawdown with W(u) - W(u') = 0 should return 0", () => {
      // When u = u', W(u) - W(u') = 0
      // This happens when r = d
      const x = 100; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      // At x = d, y = 0, r = d
      // u = (d^2 * Sy) / (4 * T * t) = (10000 * 0.2) / 2000 = 1
      // u' = ((2d - r)^2 * Sy) / (4 * T * t) = (100^2 * 0.2) / 2000 = 1
      // W(u) - W(u') = 0
      const expected = 0;

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with different u and u' should return correct value", () => {
      // Choose r ≠ d, so u ≠ u'
      const x = 50; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      // Calculate r, u, u'
      const r = calculateDistance(x, y, xwell, ywell); // 50
      const u = (r * r * Sy) / (4 * T * t); // (2500 * 0.2) / 2000 = 0.25
      const uPrime = ((2 * d - r) * (2 * d - r) * Sy) / (4 * T * t); // ((200 -50)^2 *0.2)/2000 = (150^2*0.2)/2000= (22500*0.2)/2000= 4500/2000=2.25

      const W_u = W(u); // W(0.25)
      const W_uPrime = W(uPrime); // W(2.25) ≈ 0

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with r = 0", () => {
      // At the well location, r = 0
      const x = 0; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      const u = 0;
      const uPrime = (200 * 200 * 0.2) / (4 * 500 * 10); // ((200)^2 *0.2)/20000 = 8000 / 20000 = 0.4

      const W_u = W(u); // W(0) = 0
      const W_uPrime = W(uPrime); // W(0.4)

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with large u and u' should approach 0", () => {
      // Use large r and d to make u and u' large
      const x = 1000; // meters
      const y = 0; // meters
      const t = 1; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 1000; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      const r = calculateDistance(x, y, xwell, ywell); // 1000
      const u = (r * r * Sy) / (4 * T * t); // (1000000 * 0.2)/2000 = 100
      const uPrime = ((2000 - 1000) * (2000 - 1000) * 0.2) / (4 * 500 * 1); // (1000^2 *0.2)/2000= (1000000*0.2)/2000=200000/2000=100

      const W_u = W(u); // W(100) ≈ 0
      const W_uPrime = W(uPrime); // W(100) ≈ 0

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, 0, 1e-6)).toBe(true);
    });

    test("Drawdown with zero time should throw an error", () => {
      expect(() => {
        calculateDrawdown(100, 0, 0, 10, 500, 0.2, 100, 0, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });

    test("Drawdown with negative time should throw an error", () => {
      expect(() => {
        calculateDrawdown(100, 0, -5, 10, 500, 0.2, 100, 0, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });
  });

  describe("createVelocityGrid", () => {
    test("should return a grid with correct dimensions", () => {
      const gridSize = 21;
      const Ka = 0.001; // Example hydraulic conductivity
      const grid = createVelocityGrid(gridSize, Ka);

      expect(grid.length).toBe(gridSize);
      expect(grid[0].length).toBe(gridSize);
    });

    test("should calculate the correct velocity at the center of the grid", () => {
      const gridSize = 21;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      // Assuming the well is at the center (x = 50, y = 50), which would be at grid[10][10] in a 21x21 grid
      const centerPoint = grid[10][10];
      expect(centerPoint.velocity).toBeGreaterThan(0); // Velocity should be positive
    });

    test("should handle small grid sizes without errors", () => {
      const gridSize = 5;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      expect(grid.length).toBe(5);
      expect(grid[0].length).toBe(5);
    });

    test("should calculate velocity correctly for edge points", () => {
      const gridSize = 21;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      // Check edge of grid (first point in the grid)
      const edgePoint = grid[0][0];
      expect(edgePoint.velocity).toBeGreaterThan(0); // Velocity should be positive

      // Check another edge point (last point in the grid)
      const lastPoint = grid[20][20];
      expect(lastPoint.velocity).toBeGreaterThan(0);
    });

    test("should return consistent velocities for the same grid size and Ka", () => {
      const gridSize = 21;
      const Ka = 0.001;

      const grid1 = createVelocityGrid(gridSize, Ka);
      const grid2 = createVelocityGrid(gridSize, Ka);

      // Compare velocities at some points in both grids to ensure consistency
      expect(grid1[10][10].velocity).toBeCloseTo(grid2[10][10].velocity);
      expect(grid1[0][0].velocity).toBeCloseTo(grid2[0][0].velocity);
    });
  });

  describe("displayVelocityGrid", () => {
    beforeEach(() => {
      // Set up our document body
      document.body.innerHTML = `
      <input type="number" id="conductivity" value="0.001" />
      <div id="result_message"></div>
    `;
    });

    test("should display a velocity grid table with 21 rows", () => {
      displayVelocityGrid();

      const tableRows = document.querySelectorAll("#result_message table tr");
      expect(tableRows.length).toBe(21); // Expect 21 rows for a 21x21 grid
    });

    test("should display a velocity value in each table cell", () => {
      displayVelocityGrid();

      const tableCells = document.querySelectorAll("#result_message table td");
      expect(tableCells.length).toBe(21 * 21); // 21x21 grid = 441 cells

      const firstCell = tableCells[0].innerHTML;
      expect(firstCell).toContain("V:"); // Ensure velocity is displayed
    });

    test("should render table inside #result_message", () => {
      displayVelocityGrid();

      const resultDiv = document.getElementById("result_message");
      expect(resultDiv.innerHTML).toContain("<table");
    });

    test("should handle different Ka values correctly", () => {
      const conductivityInput = document.getElementById("conductivity");
      conductivityInput.value = 0.005; // Set a different hydraulic conductivity

      displayVelocityGrid();

      const tableCells = document.querySelectorAll("#result_message table td");
      const firstVelocityValue = tableCells[0].innerHTML;

      expect(firstVelocityValue).toContain("V:");
    });

    test("should replace existing grid when called multiple times", () => {
      displayVelocityGrid();
      const firstRender = document.querySelectorAll(
        "#result_message table td"
      ).length;

      displayVelocityGrid();
      const secondRender = document.querySelectorAll(
        "#result_message table td"
      ).length;

      expect(firstRender).toBe(secondRender); // The grid should be replaced, not appended
    });
  });

  // Tests for erfc function
  describe("erfc Function", () => {
    test("erfc(0) should return approximately 1", () => {
      const input = 0;
      const expected = 1;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(1) should be approximately 0.1572992", () => {
      const input = 1;
      const expected = 0.1572992;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(-1) should be approximately 1.8427008", () => {
      const input = -1;
      const expected = 1.8427008;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(2) should be approximately 0.00467773", () => {
      const input = 2;
      const expected = 0.00467773;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });
  });

  // Tests for calculateQFraction
  describe("calculateQFraction", () => {
    test("Valid inputs should return correct Qfraction", () => {
      // Example values
      const d = 100; // meters
      const Sy = 0.2; // dimensionless
      const T = 500; // m²/day
      const t = 10; // days

      const argument = (d * d * Sy) / (4 * T * t); // (10000 * 0.2) / (2000) = 1
      const expected = erfc(argument); // erfc(1) ≈ 0.1572992

      const result = calculateQFraction(d, Sy, T, t);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Qfraction with d=0 should return erfc(0) = 1", () => {
      const d = 0;
      const Sy = 0.2;
      const T = 500;
      const t = 10;

      const expected = erfc(0); // 1

      const result = calculateQFraction(d, Sy, T, t);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Qfraction with large d should approach 0", () => {
      const d = 10000; // very large distance
      const Sy = 0.2;
      const T = 500;
      const t = 10;

      const argument = (d * d * Sy) / (4 * T * t); // (100000000 * 0.2) / 20000 = 1000

      const result = calculateQFraction(d, Sy, T, t);
      expect(result).toBeCloseTo(0, 6);
    });

    test("Zero time should throw an error", () => {
      expect(() => {
        calculateQFraction(100, 0.2, 500, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });

    test("Negative time should throw an error", () => {
      expect(() => {
        calculateQFraction(100, 0.2, 500, -5);
      }).toThrow("Time 't' must be greater than 0.");
    });
  });

  // Tests for calculateDistance
  describe("calculateDistance", () => {
    test("Distance between (0,0) and (3,4) should be 5", () => {
      const xgrid = 3;
      const ygrid = 4;
      const xwell = 0;
      const ywell = 0;
      const expected = 5;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance between (1,1) and (4,5) should be 5", () => {
      const xgrid = 4;
      const ygrid = 5;
      const xwell = 1;
      const ywell = 1;
      const expected = 5;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance between (-2,-3) and (4,1) should be 7.21110255", () => {
      const xgrid = 4;
      const ygrid = 1;
      const xwell = -2;
      const ywell = -3;
      const expected = Math.sqrt((4 - -2) ** 2 + (1 - -3) ** 2); // sqrt(36 + 16) = sqrt(52) ≈ 7.21110255

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance when grid and well are the same point should be 0", () => {
      const xgrid = 5;
      const ygrid = 5;
      const xwell = 5;
      const ywell = 5;
      const expected = 0;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });
  });

  // Tests for calculateDrawdown
  describe("calculateDrawdown", () => {
    test("Drawdown with W(u) - W(u') = 0 should return 0", () => {
      // When u = u', W(u) - W(u') = 0
      // This happens when r = d
      const x = 100; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      // At x = d, y = 0, r = d
      // u = (d^2 * Sy) / (4 * T * t) = (10000 * 0.2) / 2000 = 1
      // u' = ((2d - r)^2 * Sy) / (4 * T * t) = (100^2 * 0.2) / 2000 = 1
      // W(u) - W(u') = 0
      const expected = 0;

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with different u and u' should return correct value", () => {
      // Choose r ≠ d, so u ≠ u'
      const x = 50; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      // Calculate r, u, u'
      const r = calculateDistance(x, y, xwell, ywell); // 50
      const u = (r * r * Sy) / (4 * T * t); // (2500 * 0.2) / 2000 = 0.25
      const uPrime = ((2 * d - r) * (2 * d - r) * Sy) / (4 * T * t); // ((200 -50)^2 *0.2)/2000 = (150^2*0.2)/2000= (22500*0.2)/2000= 4500/2000=2.25

      const W_u = W(u); // W(0.25)
      const W_uPrime = W(uPrime); // W(2.25) ≈ 0

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with r = 0", () => {
      // At the well location, r = 0
      const x = 0; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      const u = 0;
      const uPrime = (200 * 200 * 0.2) / (4 * 500 * 10); // ((200)^2 *0.2)/20000 = 8000 / 20000 = 0.4

      const W_u = W(u); // W(0) = 0
      const W_uPrime = W(uPrime); // W(0.4)

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with large u and u' should approach 0", () => {
      // Use large r and d to make u and u' large
      const x = 1000; // meters
      const y = 0; // meters
      const t = 1; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 1000; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      const r = calculateDistance(x, y, xwell, ywell); // 1000
      const u = (r * r * Sy) / (4 * T * t); // (1000000 * 0.2)/2000 = 100
      const uPrime = ((2000 - 1000) * (2000 - 1000) * 0.2) / (4 * 500 * 1); // (1000^2 *0.2)/2000= (1000000*0.2)/2000=200000/2000=100

      const W_u = W(u); // W(100) ≈ 0
      const W_uPrime = W(uPrime); // W(100) ≈ 0

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, 0, 1e-6)).toBe(true);
    });

    test("Drawdown with zero time should throw an error", () => {
      expect(() => {
        calculateDrawdown(100, 0, 0, 10, 500, 0.2, 100, 0, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });

    test("Drawdown with negative time should throw an error", () => {
      expect(() => {
        calculateDrawdown(100, 0, -5, 10, 500, 0.2, 100, 0, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });
  });

  describe("createVelocityGrid", () => {
    test("should return a grid with correct dimensions", () => {
      const gridSize = 21;
      const Ka = 0.001; // Example hydraulic conductivity
      const grid = createVelocityGrid(gridSize, Ka);

      expect(grid.length).toBe(gridSize);
      expect(grid[0].length).toBe(gridSize);
    });

    test("should calculate the correct velocity at the center of the grid", () => {
      const gridSize = 21;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      // Assuming the well is at the center (x = 50, y = 50), which would be at grid[10][10] in a 21x21 grid
      const centerPoint = grid[10][10];
      expect(centerPoint.velocity).toBeGreaterThan(0); // Velocity should be positive
    });

    test("should handle small grid sizes without errors", () => {
      const gridSize = 5;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      expect(grid.length).toBe(5);
      expect(grid[0].length).toBe(5);
    });

    test("should calculate velocity correctly for edge points", () => {
      const gridSize = 21;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      // Check edge of grid (first point in the grid)
      const edgePoint = grid[0][0];
      expect(edgePoint.velocity).toBeGreaterThan(0); // Velocity should be positive

      // Check another edge point (last point in the grid)
      const lastPoint = grid[20][20];
      expect(lastPoint.velocity).toBeGreaterThan(0);
    });

    test("should return consistent velocities for the same grid size and Ka", () => {
      const gridSize = 21;
      const Ka = 0.001;

      const grid1 = createVelocityGrid(gridSize, Ka);
      const grid2 = createVelocityGrid(gridSize, Ka);

      // Compare velocities at some points in both grids to ensure consistency
      expect(grid1[10][10].velocity).toBeCloseTo(grid2[10][10].velocity);
      expect(grid1[0][0].velocity).toBeCloseTo(grid2[0][0].velocity);
    });
  });

  describe("displayVelocityGrid", () => {
    beforeEach(() => {
      // Set up our document body
      document.body.innerHTML = `
      <input type="number" id="conductivity" value="0.001" />
      <div id="result_message"></div>
    `;
    });

    test("should display a velocity grid table with 21 rows", () => {
      displayVelocityGrid();

      const tableRows = document.querySelectorAll("#result_message table tr");
      expect(tableRows.length).toBe(21); // Expect 21 rows for a 21x21 grid
    });

    test("should display a velocity value in each table cell", () => {
      displayVelocityGrid();

      const tableCells = document.querySelectorAll("#result_message table td");
      expect(tableCells.length).toBe(21 * 21); // 21x21 grid = 441 cells

      const firstCell = tableCells[0].innerHTML;
      expect(firstCell).toContain("V:"); // Ensure velocity is displayed
    });

    test("should render table inside #result_message", () => {
      displayVelocityGrid();

      const resultDiv = document.getElementById("result_message");
      expect(resultDiv.innerHTML).toContain("<table");
    });

    test("should handle different Ka values correctly", () => {
      const conductivityInput = document.getElementById("conductivity");
      conductivityInput.value = 0.005; // Set a different hydraulic conductivity

      displayVelocityGrid();

      const tableCells = document.querySelectorAll("#result_message table td");
      const firstVelocityValue = tableCells[0].innerHTML;

      expect(firstVelocityValue).toContain("V:");
    });

    test("should replace existing grid when called multiple times", () => {
      displayVelocityGrid();
      const firstRender = document.querySelectorAll(
        "#result_message table td"
      ).length;

      displayVelocityGrid();
      const secondRender = document.querySelectorAll(
        "#result_message table td"
      ).length;

      expect(firstRender).toBe(secondRender); // The grid should be replaced, not appended
    });
  });

  // Tests for erfc function
  describe("erfc Function", () => {
    test("erfc(0) should return approximately 1", () => {
      const input = 0;
      const expected = 1;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(1) should be approximately 0.1572992", () => {
      const input = 1;
      const expected = 0.1572992;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(-1) should be approximately 1.8427008", () => {
      const input = -1;
      const expected = 1.8427008;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(2) should be approximately 0.00467773", () => {
      const input = 2;
      const expected = 0.00467773;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });
  });

  // Tests for calculateQFraction
  describe("calculateQFraction", () => {
    test("Valid inputs should return correct Qfraction", () => {
      // Example values
      const d = 100; // meters
      const Sy = 0.2; // dimensionless
      const T = 500; // m²/day
      const t = 10; // days

      const argument = (d * d * Sy) / (4 * T * t); // (10000 * 0.2) / (2000) = 1
      const expected = erfc(argument); // erfc(1) ≈ 0.1572992

      const result = calculateQFraction(d, Sy, T, t);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Qfraction with d=0 should return erfc(0) = 1", () => {
      const d = 0;
      const Sy = 0.2;
      const T = 500;
      const t = 10;

      const expected = erfc(0); // 1

      const result = calculateQFraction(d, Sy, T, t);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Qfraction with large d should approach 0", () => {
      const d = 10000; // very large distance
      const Sy = 0.2;
      const T = 500;
      const t = 10;

      const argument = (d * d * Sy) / (4 * T * t); // (100000000 * 0.2) / 20000 = 1000

      const result = calculateQFraction(d, Sy, T, t);
      expect(result).toBeCloseTo(0, 6);
    });

    test("Zero time should throw an error", () => {
      expect(() => {
        calculateQFraction(100, 0.2, 500, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });

    test("Negative time should throw an error", () => {
      expect(() => {
        calculateQFraction(100, 0.2, 500, -5);
      }).toThrow("Time 't' must be greater than 0.");
    });
  });

  // Tests for calculateDistance
  describe("calculateDistance", () => {
    test("Distance between (0,0) and (3,4) should be 5", () => {
      const xgrid = 3;
      const ygrid = 4;
      const xwell = 0;
      const ywell = 0;
      const expected = 5;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance between (1,1) and (4,5) should be 5", () => {
      const xgrid = 4;
      const ygrid = 5;
      const xwell = 1;
      const ywell = 1;
      const expected = 5;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance between (-2,-3) and (4,1) should be 7.21110255", () => {
      const xgrid = 4;
      const ygrid = 1;
      const xwell = -2;
      const ywell = -3;
      const expected = Math.sqrt((4 - -2) ** 2 + (1 - -3) ** 2); // sqrt(36 + 16) = sqrt(52) ≈ 7.21110255

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance when grid and well are the same point should be 0", () => {
      const xgrid = 5;
      const ygrid = 5;
      const xwell = 5;
      const ywell = 5;
      const expected = 0;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });
  });

  // Tests for calculateDrawdown
  describe("calculateDrawdown", () => {
    test("Drawdown with W(u) - W(u') = 0 should return 0", () => {
      // When u = u', W(u) - W(u') = 0
      // This happens when r = d
      const x = 100; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      // At x = d, y = 0, r = d
      // u = (d^2 * Sy) / (4 * T * t) = (10000 * 0.2) / 2000 = 1
      // u' = ((2d - r)^2 * Sy) / (4 * T * t) = (100^2 * 0.2) / 2000 = 1
      // W(u) - W(u') = 0
      const expected = 0;

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with different u and u' should return correct value", () => {
      // Choose r ≠ d, so u ≠ u'
      const x = 50; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      // Calculate r, u, u'
      const r = calculateDistance(x, y, xwell, ywell); // 50
      const u = (r * r * Sy) / (4 * T * t); // (2500 * 0.2) / 2000 = 0.25
      const uPrime = ((2 * d - r) * (2 * d - r) * Sy) / (4 * T * t); // ((200 -50)^2 *0.2)/2000 = (150^2*0.2)/2000= (22500*0.2)/2000= 4500/2000=2.25

      const W_u = W(u); // W(0.25)
      const W_uPrime = W(uPrime); // W(2.25) ≈ 0

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with r = 0", () => {
      // At the well location, r = 0
      const x = 0; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      const u = 0;
      const uPrime = (200 * 200 * 0.2) / (4 * 500 * 10); // ((200)^2 *0.2)/20000 = 8000 / 20000 = 0.4

      const W_u = W(u); // W(0) = 0
      const W_uPrime = W(uPrime); // W(0.4)

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with large u and u' should approach 0", () => {
      // Use large r and d to make u and u' large
      const x = 1000; // meters
      const y = 0; // meters
      const t = 1; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 1000; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      const r = calculateDistance(x, y, xwell, ywell); // 1000
      const u = (r * r * Sy) / (4 * T * t); // (1000000 * 0.2)/2000 = 100
      const uPrime = ((2000 - 1000) * (2000 - 1000) * 0.2) / (4 * 500 * 1); // (1000^2 *0.2)/2000= (1000000*0.2)/2000=200000/2000=100

      const W_u = W(u); // W(100) ≈ 0
      const W_uPrime = W(uPrime); // W(100) ≈ 0

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, 0, 1e-6)).toBe(true);
    });

    test("Drawdown with zero time should throw an error", () => {
      expect(() => {
        calculateDrawdown(100, 0, 0, 10, 500, 0.2, 100, 0, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });

    test("Drawdown with negative time should throw an error", () => {
      expect(() => {
        calculateDrawdown(100, 0, -5, 10, 500, 0.2, 100, 0, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });
  });

  describe("createVelocityGrid", () => {
    test("should return a grid with correct dimensions", () => {
      const gridSize = 21;
      const Ka = 0.001; // Example hydraulic conductivity
      const grid = createVelocityGrid(gridSize, Ka);

      expect(grid.length).toBe(gridSize);
      expect(grid[0].length).toBe(gridSize);
    });

    test("should calculate the correct velocity at the center of the grid", () => {
      const gridSize = 21;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      // Assuming the well is at the center (x = 50, y = 50), which would be at grid[10][10] in a 21x21 grid
      const centerPoint = grid[10][10];
      expect(centerPoint.velocity).toBeGreaterThan(0); // Velocity should be positive
    });

    test("should handle small grid sizes without errors", () => {
      const gridSize = 5;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      expect(grid.length).toBe(5);
      expect(grid[0].length).toBe(5);
    });

    test("should calculate velocity correctly for edge points", () => {
      const gridSize = 21;
      const Ka = 0.001;
      const grid = createVelocityGrid(gridSize, Ka);

      // Check edge of grid (first point in the grid)
      const edgePoint = grid[0][0];
      expect(edgePoint.velocity).toBeGreaterThan(0); // Velocity should be positive

      // Check another edge point (last point in the grid)
      const lastPoint = grid[20][20];
      expect(lastPoint.velocity).toBeGreaterThan(0);
    });

    test("should return consistent velocities for the same grid size and Ka", () => {
      const gridSize = 21;
      const Ka = 0.001;

      const grid1 = createVelocityGrid(gridSize, Ka);
      const grid2 = createVelocityGrid(gridSize, Ka);

      // Compare velocities at some points in both grids to ensure consistency
      expect(grid1[10][10].velocity).toBeCloseTo(grid2[10][10].velocity);
      expect(grid1[0][0].velocity).toBeCloseTo(grid2[0][0].velocity);
    });
  });

  describe("displayVelocityGrid", () => {
    beforeEach(() => {
      // Set up our document body
      document.body.innerHTML = `
      <input type="number" id="conductivity" value="0.001" />
      <div id="result_message"></div>
    `;
    });

    test("should display a velocity grid table with 21 rows", () => {
      displayVelocityGrid();

      const tableRows = document.querySelectorAll("#result_message table tr");
      expect(tableRows.length).toBe(21); // Expect 21 rows for a 21x21 grid
    });

    test("should display a velocity value in each table cell", () => {
      displayVelocityGrid();

      const tableCells = document.querySelectorAll("#result_message table td");
      expect(tableCells.length).toBe(21 * 21); // 21x21 grid = 441 cells

      const firstCell = tableCells[0].innerHTML;
      expect(firstCell).toContain("V:"); // Ensure velocity is displayed
    });

    test("should render table inside #result_message", () => {
      displayVelocityGrid();

      const resultDiv = document.getElementById("result_message");
      expect(resultDiv.innerHTML).toContain("<table");
    });

    test("should handle different Ka values correctly", () => {
      const conductivityInput = document.getElementById("conductivity");
      conductivityInput.value = 0.005; // Set a different hydraulic conductivity

      displayVelocityGrid();

      const tableCells = document.querySelectorAll("#result_message table td");
      const firstVelocityValue = tableCells[0].innerHTML;

      expect(firstVelocityValue).toContain("V:");
    });

    test("should replace existing grid when called multiple times", () => {
      displayVelocityGrid();
      const firstRender = document.querySelectorAll(
        "#result_message table td"
      ).length;

      displayVelocityGrid();
      const secondRender = document.querySelectorAll(
        "#result_message table td"
      ).length;

      expect(firstRender).toBe(secondRender); // The grid should be replaced, not appended
    });
  });

  // Tests for erfc function
  describe("erfc Function", () => {
    test("erfc(0) should return approximately 1", () => {
      const input = 0;
      const expected = 1;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(1) should be approximately 0.1572992", () => {
      const input = 1;
      const expected = 0.1572992;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(-1) should be approximately 1.8427008", () => {
      const input = -1;
      const expected = 1.8427008;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("erfc(2) should be approximately 0.00467773", () => {
      const input = 2;
      const expected = 0.00467773;
      const result = erfc(input);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });
  });

  // Tests for calculateQFraction
  describe("calculateQFraction", () => {
    test("Valid inputs should return correct Qfraction", () => {
      // Example values
      const d = 100; // meters
      const Sy = 0.2; // dimensionless
      const T = 500; // m²/day
      const t = 10; // days

      const argument = (d * d * Sy) / (4 * T * t); // (10000 * 0.2) / (2000) = 1
      const expected = erfc(argument); // erfc(1) ≈ 0.1572992

      const result = calculateQFraction(d, Sy, T, t);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Qfraction with d=0 should return erfc(0) = 1", () => {
      const d = 0;
      const Sy = 0.2;
      const T = 500;
      const t = 10;

      const expected = erfc(0); // 1

      const result = calculateQFraction(d, Sy, T, t);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Qfraction with large d should approach 0", () => {
      const d = 10000; // very large distance
      const Sy = 0.2;
      const T = 500;
      const t = 10;

      const argument = (d * d * Sy) / (4 * T * t); // (100000000 * 0.2) / 20000 = 1000
      const expected = erfc(argument); // should be very close to 0

      const result = calculateQFraction(d, Sy, T, t);
      expect(result).toBeCloseTo(0, 6);
    });

    test("Zero time should throw an error", () => {
      expect(() => {
        calculateQFraction(100, 0.2, 500, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });

    test("Negative time should throw an error", () => {
      expect(() => {
        calculateQFraction(100, 0.2, 500, -5);
      }).toThrow("Time 't' must be greater than 0.");
    });
  });

  // Tests for calculateDistance
  describe("calculateDistance", () => {
    test("Distance between (0,0) and (3,4) should be 5", () => {
      const xgrid = 3;
      const ygrid = 4;
      const xwell = 0;
      const ywell = 0;
      const expected = 5;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance between (1,1) and (4,5) should be 5", () => {
      const xgrid = 4;
      const ygrid = 5;
      const xwell = 1;
      const ywell = 1;
      const expected = 5;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance between (-2,-3) and (4,1) should be 7.21110255", () => {
      const xgrid = 4;
      const ygrid = 1;
      const xwell = -2;
      const ywell = -3;
      const expected = Math.sqrt((4 - -2) ** 2 + (1 - -3) ** 2); // sqrt(36 + 16) = sqrt(52) ≈ 7.21110255

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Distance when grid and well are the same point should be 0", () => {
      const xgrid = 5;
      const ygrid = 5;
      const xwell = 5;
      const ywell = 5;
      const expected = 0;

      const result = calculateDistance(xgrid, ygrid, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });
  });

  // Tests for calculateDrawdown
  describe("calculateDrawdown", () => {
    test("Drawdown with W(u) - W(u') = 0 should return 0", () => {
      // When u = u', W(u) - W(u') = 0
      // This happens when r = d
      const x = 100; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      // At x = d, y = 0, r = d
      // u = (d^2 * Sy) / (4 * T * t) = (10000 * 0.2) / 2000 = 1
      // u' = ((2d - r)^2 * Sy) / (4 * T * t) = (100^2 * 0.2) / 2000 = 1
      // W(u) - W(u') = 0
      const expected = 0;

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with different u and u' should return correct value", () => {
      // Choose r ≠ d, so u ≠ u'
      const x = 50; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      // Calculate r, u, u'
      const r = calculateDistance(x, y, xwell, ywell); // 50
      const u = (r * r * Sy) / (4 * T * t); // (2500 * 0.2) / 2000 = 0.25
      const uPrime = ((2 * d - r) * (2 * d - r) * Sy) / (4 * T * t); // ((200 -50)^2 *0.2)/2000 = (150^2*0.2)/2000= (22500*0.2)/2000= 4500/2000=2.25

      const W_u = W(u); // W(0.25)
      const W_uPrime = W(uPrime); // W(2.25) ≈ 0

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with r = 0", () => {
      // At the well location, r = 0
      const x = 0; // meters
      const y = 0; // meters
      const t = 10; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 100; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      const r = 0;
      const u = 0;
      const uPrime = (200 * 200 * 0.2) / (4 * 500 * 10); // ((200)^2 *0.2)/20000 = 8000 / 20000 = 0.4

      const W_u = W(u); // W(0) = 0
      const W_uPrime = W(uPrime); // W(0.4)

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime);

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, expected, 1e-6)).toBe(true);
    });

    test("Drawdown with large u and u' should approach 0", () => {
      // Use large r and d to make u and u' large
      const x = 1000; // meters
      const y = 0; // meters
      const t = 1; // days
      const Qw = 10; // m³/s
      const T = 500; // m²/day
      const Sy = 0.2; // dimensionless
      const d = 1000; // meters
      const xwell = 0; // meters
      const ywell = 0; // meters

      const r = calculateDistance(x, y, xwell, ywell); // 1000
      const u = (r * r * Sy) / (4 * T * t); // (1000000 * 0.2)/2000 = 100
      const uPrime = ((2000 - 1000) * (2000 - 1000) * 0.2) / (4 * 500 * 1); // (1000^2 *0.2)/2000= (1000000*0.2)/2000=200000/2000=100

      const W_u = W(u); // W(100) ≈ 0
      const W_uPrime = W(uPrime); // W(100) ≈ 0

      const expected = (Qw / (4 * Math.PI * T)) * (W_u - W_uPrime); // ≈0

      const result = calculateDrawdown(x, y, t, Qw, T, Sy, d, xwell, ywell);
      expect(numbersAreClose(result, 0, 1e-6)).toBe(true);
    });

    test("Drawdown with zero time should throw an error", () => {
      expect(() => {
        calculateDrawdown(100, 0, 0, 10, 500, 0.2, 100, 0, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });

    test("Drawdown with negative time should throw an error", () => {
      expect(() => {
        calculateDrawdown(100, 0, -5, 10, 500, 0.2, 100, 0, 0);
      }).toThrow("Time 't' must be greater than 0.");
    });
  });

  //Stream Leakage Tests
  describe("calculateStreamLeakage", () => {
    // Test case 1: Basic case
    test("should correctly calculate stream leakage for valid inputs", () => {
      const Qw = 10;
      const Qfraction = 0.2;
      const result = calculateStreamLeakage(Qw, Qfraction);
      expect(result).toBe(2);
    });
    // Test case 2: Zero pumping rate
    test("should return 0 when pumping rate is 0", () => {
      const Qw = 0;
      const Qfraction = 0.5;
      const result = calculateStreamLeakage(Qw, Qfraction);
      // Expect the leakage to be 0
      expect(result).toBe(0);
    });
  });
  // Tests for calculateStreamDischarge
  describe("calculateStreamDischarge", () => {
    // Test case 1: General test with typical values
    test("should calculate the stream discharge correctly", () => {
      const Qs = 10;
      const QstreamLeakage = 1;
      const result = calculateStreamDischarge(Qs, QstreamLeakage);
      expect(result).toBe(9);
    });
    // Test case 2: Test with zero leakage
    test("should return the same discharge if there is no leakage", () => {
      const Qs = 10;
      const QstreamLeakage = 0;
      const result = calculateStreamDischarge(Qs, QstreamLeakage);
      expect(result).toBe(10);
    });
  });
});
