import { TYPE_CODES } from './typecodes.ts';
import { Buffer } from 'buffer';

function getFloatScaleInfo(value: number): { scale: number; decimalPlaces: number } | null {
  const str = value.toString();
  if (!/^-?\d+\.\d+$/.test(str)) return null;
  const decimalPlaces = str.split('.')[1].length;
  const scale = 10 ** decimalPlaces;
  return { scale, decimalPlaces };
}

function serializeArray(arr: unknown[]): Buffer {
  const buffers: Buffer[] = [];
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32LE(arr.length, 0);
  buffers.push(lengthBuf);

  for (const el of arr) {
    buffers.push(serializeData(el));
  }

  return Buffer.concat(buffers);
}

function serializeObject(obj: Record<string, unknown>): Buffer {
  const buffers: Buffer[] = [];
  const entries = Object.entries(obj);
  const countBuf = Buffer.alloc(4);
  countBuf.writeUInt32LE(entries.length, 0);
  buffers.push(countBuf);

  for (const [key, value] of entries) {
    const keyBuf = Buffer.from(key, 'utf8');
    if (keyBuf.length > 255) throw new Error('Key too long');

    buffers.push(Buffer.from([keyBuf.length]));
    buffers.push(keyBuf);
    buffers.push(serializeData(value));
  }

  return Buffer.concat(buffers);
}

export function serializeData(data: unknown): Buffer {
  const type = typeof data;

  const handlers: Record<string, (val: any) => Buffer> = {
    string: (val: string) => {
      const buf = Buffer.from(val, 'utf8');
      return Buffer.concat([Buffer.from([TYPE_CODES.STRING, buf.length]), buf]);
    },
    number: (val: number) => {
      const scaleInfo = getFloatScaleInfo(val);
      if (scaleInfo) {
        const { scale } = scaleInfo;

        if (scale > 0xffffffff) {
            // Too big to store in UInt32, fall back to stringified float
            const str = val.toString();
            const strBuf = Buffer.from(str, 'utf8');
            return Buffer.concat([
              Buffer.from([TYPE_CODES.BIG_FLOAT_STRING, strBuf.length]),
              strBuf,
            ]);
          }
          
        const scaled = BigInt(Math.round(val * scale));
        const buf = Buffer.alloc(12);
        buf.writeUInt32LE(scale, 0);
        buf.writeBigInt64LE(scaled, 4);
        return Buffer.concat([Buffer.from([TYPE_CODES.FIXED_POINT]), buf]);
      } else {
        const buf = Buffer.alloc(8);
        buf.writeDoubleLE(val);
        return Buffer.concat([Buffer.from([TYPE_CODES.NUMBER]), buf]);
      }
    },
    boolean: (val: boolean) => Buffer.from([TYPE_CODES.BOOLEAN, val ? 1 : 0]),
    object: (val: any) => {
      if (val === null) return Buffer.from([TYPE_CODES.NULL]);
      if (Array.isArray(val)) {
        return Buffer.concat([Buffer.from([TYPE_CODES.ARRAY]), serializeArray(val)]);
      }
      return Buffer.concat([Buffer.from([TYPE_CODES.OBJECT]), serializeObject(val)]);
    },
    undefined: () => Buffer.from([TYPE_CODES.UNDEFINED]),
  };

  const handler = handlers[type];
  if (!handler) throw new Error('Unsupported data type: ' + type);
  return handler(data);
}
