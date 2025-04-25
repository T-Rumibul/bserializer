import { serializeData, deserializeData } from '../dist/index.js';

describe('Primitive Serialization', () => {
    const roundtrip = async (val) => {
      const buf = serializeData(val);
      const result = deserializeData(buf);
      return result;
    };
  
    test('serialize and deserialize string', async () => {
      expect(await roundtrip('hello')).toBe('hello');
      expect(await roundtrip('')).toBe('');
      expect(await roundtrip('🌍🚀')).toBe('🌍🚀');
    });
  
    test('serialize and deserialize number', async () => {
      expect(await roundtrip(123)).toBe(123);
      expect(await roundtrip(-456.789)).toBeCloseTo(-456.789, 6);
    });
  
    test('serialize and deserialize boolean', async () => {
      expect(await roundtrip(true)).toBe(true);
      expect(await roundtrip(false)).toBe(false);
    });
  
    test('serialize and deserialize null', async () => {
      expect(await roundtrip(null)).toBeNull();
    });
  });