import { TYPE_CODES } from './typecodes.ts';


type OffsetRef = { offset: number };
const {
  STRING,
  NUMBER,
  BOOLEAN,
  NULL,
  ARRAY,
  OBJECT,
  FIXED_POINT,
  UNDEFINED,
  BIG_FLOAT_STRING,
} = TYPE_CODES;

function deserializeArray(buffer: Buffer, offsetRef: OffsetRef): unknown[] {
  const len = buffer.readUInt32LE(offsetRef.offset);
  offsetRef.offset += 4;
  
  const result: unknown[] = [];
  for (let i = 0; i < len; i++) {
    result.push(deserializeData(buffer, offsetRef));
  }
  return result;
}

function deserializeObject(buffer: Buffer, offsetRef: OffsetRef): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  const count = buffer.readUInt32LE(offsetRef.offset);
  offsetRef.offset += 4;
  
  for (let i = 0; i < count; i++) {
    const keyLen = buffer.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4;
    const key = buffer.toString('utf8', offsetRef.offset, offsetRef.offset + keyLen);
    offsetRef.offset += keyLen;
    obj[key] = deserializeData(buffer, offsetRef);
  }

  return obj;
}

export function deserializeData(buffer: Buffer, offsetRef: OffsetRef = { offset: 0 }): unknown {
    const type = buffer.readUInt8(offsetRef.offset++);
  
    switch (type) {
      case STRING: {
        const len = buffer.readUInt32LE(offsetRef.offset);
        offsetRef.offset += 4;
        const val = buffer.toString('utf8', offsetRef.offset, offsetRef.offset + len);
        offsetRef.offset += len;
        return val;
      }
  
      case NUMBER: {
        const val = buffer.readDoubleLE(offsetRef.offset);
        offsetRef.offset += 8;
        return val;
      }
  
      case BOOLEAN: {
        return !!buffer.readUInt8(offsetRef.offset++);
      }
  
      case NULL: {
        return null;
      }
  
      case UNDEFINED: {
        return undefined;
      }
  
      case ARRAY: {
        return deserializeArray(buffer, offsetRef);
      }
  
      case OBJECT: {
        return deserializeObject(buffer, offsetRef);
      }
  
      case FIXED_POINT: {
        const scale = buffer.readUInt32LE(offsetRef.offset);
        offsetRef.offset += 4;
        const raw = buffer.readBigInt64LE(offsetRef.offset);
        offsetRef.offset += 8;
        return Number(raw) / scale;
      }
  
      case BIG_FLOAT_STRING: {
        const len = buffer.readUInt32LE(offsetRef.offset);
        offsetRef.offset += 4;
        const str = buffer.toString('utf8', offsetRef.offset, offsetRef.offset + len);
        offsetRef.offset += len;
        return parseFloat(str);
      }
  
      default:
        throw new Error(`Unknown type code: 0x${type.toString(16)}}`);
    }
  }
