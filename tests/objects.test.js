import { serializeData, deserializeData } from '../dist/index.js';



describe('Object Serialization', () => {
    const roundtrip = async (obj) => {
      const buf = serializeData(obj);
      const result = deserializeData(buf);
      return result;
    };
  
    test('serialize and deserialize flat object', async () => {
      const input = {
        name: 'Alice',
        age: 30,
        active: true,
      };
      expect(await roundtrip(input)).toEqual(input);
    });
  
    test('serialize and deserialize object with nulls and empty strings', async () => {
      const input = {
        message: '',
        deleted: null,
        flag: false,
      };
      expect(await roundtrip(input)).toEqual(input);
    });
  
    test('serialize and deserialize nested object', async () => {
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
      expect(await roundtrip(input)).toEqual(input);
    });
  
    test('serialize and deserialize object with number edge cases', async () => {
      const input = {
        maxSafe: Number.MAX_SAFE_INTEGER,
        minSafe: Number.MIN_SAFE_INTEGER,
        pi: 3.1415926535,
      };
      expect(await roundtrip(input)).toEqual(input);
    });
  });