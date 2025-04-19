import { serializeData, deserializeData } from '../dist/index.js';



describe('Object Serialization', () => {
    const roundtrip = (obj) => {
      const buf = serializeData(obj);
      const result = deserializeData(buf);
      return result;
    };
  
    test('serialize and deserialize flat object', () => {
      const input = {
        name: 'Alice',
        age: 30,
        active: true,
      };
      expect(roundtrip(input)).toEqual(input);
    });
  
    test('serialize and deserialize object with nulls and empty strings', () => {
      const input = {
        message: '',
        deleted: null,
        flag: false,
      };
      expect(roundtrip(input)).toEqual(input);
    });
  
    test('serialize and deserialize nested object', () => {
      const input = {
        user: {
          id: 1,
          profile: {
            username: 'test',
            verified: false,
          },
        },
        tags: ['a', 'b'],
      };
      expect(roundtrip(input)).toEqual(input);
    });
  
    test('serialize and deserialize object with number edge cases', () => {
      const input = {
        maxSafe: Number.MAX_SAFE_INTEGER,
        minSafe: Number.MIN_SAFE_INTEGER,
        pi: 3.1415926535,
      };
      expect(roundtrip(input)).toEqual(input);
    });
  });