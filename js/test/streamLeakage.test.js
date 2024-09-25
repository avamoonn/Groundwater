// streamLeakage.test.js
const { calculateStreamLeakage } = require('./streamLeakage');

describe('calculateStreamLeakage', () => {

    // Test case 1: Basic case
    test('should correctly calculate stream leakage for valid inputs', () => {
        const Qw = 10;
        const Qfraction = 0.2;
        const result = calculateStreamLeakage(Qw, Qfraction);
        
        expect(result).toBe(2);
    });

    // Test case 2: Zero pumping rate
    test('should return 0 when pumping rate is 0', () => {
        const Qw = 0; 
        const Qfraction = 0.5;
        const result = calculateStreamLeakage(Qw, Qfraction);
        
        // Expect the leakage to be 0
        expect(result).toBe(0);
    });

});