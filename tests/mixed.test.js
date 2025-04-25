import { serializeData, deserializeData } from '../dist/index.js';

describe('Mixed-type Array Serialization', () => {
    const roundtrip = async (input) => {
      const buf = serializeData(input);
      const result = deserializeData(buf);
      return result;
    };
  
    test('serialize and deserialize 1D array with mixed types', async () => {
      const input = [42, 'hello', true, null, 3.1415, [1, 2], { a: 1 }];
      expect(await roundtrip(input)).toEqual(input);
    });
  
    test('serialize and deserialize 2D array with mixed types', async () => {
      const input = [
        [1, 'x', null],
        [false, 99.99, [5, 6]],
        [{ k: 'v' }, 0, true],
      ];
      expect(await roundtrip(input)).toEqual(input);
    });
  
    test('serialize nested mixed array', async () => {
      const input = [1, ['a', ['b', 2]], { x: [null, true] }];
      expect(await roundtrip(input)).toEqual(input);
    });
  
    test('serialize sparse array-like structure with nulls', async () => {
      const input = [1, null, , , 'end'];
      expect(await roundtrip(input)).toEqual([1, null, undefined, undefined, 'end']);
    });
  });