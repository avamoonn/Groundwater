// streamDischarge.test.js
const { calculateStreamDischarge } = require('./streamDischarge');

describe('calculateStreamDischarge', () => {

    // Test case 1: General test with typical values
    test('should calculate the stream discharge correctly', () => {
        const Qs = 10; 
        const QstreamLeakage = 1; 
        const result = calculateStreamDischarge(Qs, QstreamLeakage);
        
        expect(result).toBe(9);
    });

    // Test case 2: Test with zero leakage
    test('should return the same discharge if there is no leakage', () => {
        const Qs = 10; 
        const QstreamLeakage = 0; 
        const result = calculateStreamDischarge(Qs, QstreamLeakage);
        
        expect(result).toBe(10);
    });

});
