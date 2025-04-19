import { TYPE_CODES } from './typecodes.ts';


type OffsetRef = { offset: number };

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
    const keyLen = buffer.readUInt8(offsetRef.offset++);
    const key = buffer.toString('utf8', offsetRef.offset, offsetRef.offset + keyLen);
    offsetRef.offset += keyLen;
    obj[key] = deserializeData(buffer, offsetRef);
  }

  return obj;
}

export function deserializeData(buffer: Buffer, offsetRef: OffsetRef = { offset: 0 }): unknown {
  const type = buffer.readUInt8(offsetRef.offset++);
  const handlers: Record<number, (buffer: Buffer, ref: OffsetRef) => unknown> = {
    [TYPE_CODES.STRING]: (buf, ref) => {
      const len = buf.readUInt8(ref.offset++);
      const val = buf.toString('utf8', ref.offset, ref.offset + len);
      ref.offset += len;
      return val;
    },
    [TYPE_CODES.NUMBER]: (buf, ref) => {
      const val = buf.readDoubleLE(ref.offset);
      ref.offset += 8;
      return val;
    },
    [TYPE_CODES.BOOLEAN]: (buf, ref) => !!buf.readUInt8(ref.offset++),
    [TYPE_CODES.NULL]: () => null,
    [TYPE_CODES.UNDEFINED]: () => undefined,
    [TYPE_CODES.ARRAY]: deserializeArray,
    [TYPE_CODES.OBJECT]: deserializeObject,
    [TYPE_CODES.FIXED_POINT]: (buf, ref) => {
      const scale = buf.readUInt32LE(ref.offset);
      ref.offset += 4;
      const raw = buf.readBigInt64LE(ref.offset);
      ref.offset += 8;
      return Number(raw) / scale;
    },
    [TYPE_CODES.BIG_FLOAT_STRING]: (buf, ref) => {
        const len = buf.readUInt8(ref.offset++);
        const str = buf.toString('utf8', ref.offset, ref.offset + len);
        ref.offset += len;
        return parseFloat(str);
      },
  };

  const handler = handlers[type];
  if (!handler) throw new Error(`Unknown type code: 0x${type.toString(16)}`);
  return handler(buffer, offsetRef);
}
