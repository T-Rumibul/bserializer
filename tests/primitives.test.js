import { serializeData, deserializeData } from '../dist/index.js';

describe('Primitive Serialization', () => {
    const roundtrip = (val) => {
      const buf = serializeData(val);
      const result = deserializeData(buf);
      return result;
    };
  
    test('serialize and deserialize string', () => {
      expect(roundtrip('hello')).toBe('hello');
      expect(roundtrip('')).toBe('');
      expect(roundtrip('🌍🚀')).toBe('🌍🚀');
    });
  
    test('serialize and deserialize number', () => {
      expect(roundtrip(123)).toBe(123);
      expect(roundtrip(-456.789)).toBeCloseTo(-456.789, 6);
    });
  
    test('serialize and deserialize boolean', () => {
      expect(roundtrip(true)).toBe(true);
      expect(roundtrip(false)).toBe(false);
    });
  
    test('serialize and deserialize null', () => {
      expect(roundtrip(null)).toBeNull();
    });
  });