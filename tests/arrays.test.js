import { serializeData, deserializeData, writeToFile, readFromFile } from '../dist/index.js';
import fs from 'fs'

describe("Array Serialization", () => {
    // Test primitive arrays
    test("should roundtrip 1D number array", () => {
      const input = [1, 2, 3];
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  
    test("should roundtrip 2D number array", () => {
      const input = [[1, 2], [3, 4]];
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  
    // Test mixed type arrays
    test("should handle mixed primitive types", () => {
      const input = [1, "test", true, null];
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  
    // Test nested arrays
    test("should handle nested arrays", () => {
      const input = [[1, [2, 3]], [4]];
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  
    // Test empty arrays
    test("should handle empty 1D array", () => {
      const input = [];
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  
    test("should handle empty 2D array", () => {
      const input = [[]];
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  
    // Test complex arrays through object API
    test("should handle arrays with objects through object API", () => {
      const testObj = {
        data: [
          { id: 1, values: [1.1, 2.2] },
          { id: 2, values: [3.3, 4.4] }
        ]
      };
  
      const testFile = "__test_complex_array.json.gz";
      writeToFile(testFile, testObj);
      const result = readFromFile(testFile);
      fs.unlinkSync(testFile);
      
      expect(result).toEqual(testObj);
    });
  
    // Test large arrays
    test("should handle large arrays", () => {
      const input = Array(1000).fill().map((_, i) => i);
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  
    // Test fixed-point numbers
    test("should handle decimal numbers with scaling", () => {
      const input = [1.5, 2.25, 3.333];
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  
    // Test jagged arrays
    test("should handle jagged 2D arrays", () => {
      const input = [[1, 2], [3], [4, 5, 6]];
      const buffer = serializeData(input);
      const result = deserializeData(buffer);
      expect(result).toEqual(input);
    });
  });