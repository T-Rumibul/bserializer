import { serializeData, deserializeData } from '../dist/index.js';

describe('Edge Case Handling', () => {
    const roundtripValue = (val) => {
      const buf = serializeData(val);
      const offset =  0 ;
      return deserializeData(buf);
    };
  
    test('empty array', () => {
      expect(roundtripValue([])).toEqual([]);
    });
  
    test('array with undefined values', () => {
      const arr = [undefined, 1];
      const result = roundtripValue(arr);
      // undefined values are not handled, so expect an error or conversion
      expect(result).toEqual([undefined, 1]); // optional: update if undefined is converted to null
    });
  
    test('very large number', () => {
      const input = Number.MAX_SAFE_INTEGER;
      expect(roundtripValue(input)).toEqual(input);
    });
  
    test('very small float', () => {
      const input = 0.00000000012345;
      expect(roundtripValue(input)).toBeCloseTo(input, 10);
    });
  
    test('deeply nested arrays', () => {
      const input = [[[[[[42]]]]]];
      expect(roundtripValue(input)).toEqual(input);
    });
  
    test('array with duplicate references (deep equality)', () => {
      const shared = { a: 1 };
      const arr = [shared, shared];
      const result = roundtripValue(arr);
      expect(result).toEqual([{ a: 1 }, { a: 1 }]);
      expect(result[0]).not.toBe(result[1]); // Different object instances
    });
  
    test('max length string (255 bytes)', () => {
      const str = 'a'.repeat(255);
      expect(roundtripValue(str)).toEqual(str);
    });
  
  });
