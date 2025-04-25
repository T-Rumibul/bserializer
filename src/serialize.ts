import { TYPE_CODES } from "./typecodes.ts";
import { Buffer } from "buffer";
import { BufferWriter } from "./bufferWriter.ts";

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

function getFloatScaleInfo(
  value: number
): { scale: number; decimalPlaces: number } | null {
  const str = value.toString();
  const dotIndex = str.indexOf(".");
  if (dotIndex === -1) return null;
  const eIndex = str.indexOf("e");
  if (eIndex !== -1) return null; // Skip exponential notation

  const fractionalPart = str.substring(dotIndex + 1);
  const decimalPlaces = fractionalPart.length;
  if (decimalPlaces === 0) return null;
  const scale = 10 ** decimalPlaces;
  return { scale, decimalPlaces };
}

function _serializePrimitive(
  data: unknown,
  buffer: BufferWriter,
  type: string
) {
  if (data === null) {
    buffer.writeUInt8(NULL);
    return;
  }
  if (data === undefined) {
    buffer.writeUInt8(UNDEFINED);
    return;
  }
  switch (type) {
    case "string": {
      buffer.writeUInt8(STRING);
      const strBuf = Buffer.from(data as string, "utf8");
      buffer.writeUInt32LE(strBuf.length);
      buffer.writeBuffer(strBuf);

      return;
    }

    case "number": {
      const scaleInfo = getFloatScaleInfo(data as number);
      if (scaleInfo) {
        const { scale } = scaleInfo;

        if (scale > 0xffffffff) {
          // Too big to store in UInt32, fall back to stringified float
          const str = (data as number).toString();
          const strLen = Buffer.byteLength(str, "utf-8");
          buffer.writeUInt8(BIG_FLOAT_STRING);
          buffer.writeUInt32LE(strLen);
          buffer.writeString(str);
          return;
        }

        const scaled = BigInt(Math.round((data as number) * scale));

        buffer.writeUInt8(FIXED_POINT);

        buffer.writeUInt32LE(scale);

        buffer.writeBigInt64LE(scaled);

        return;
      } else {
        buffer.writeUInt8(NUMBER);
        buffer.writeDoubleLE(data as number);

        return;
      }
    }

    case "boolean": {
      buffer.writeUInt8(BOOLEAN);
      buffer.writeUInt8(data ? 1 : 0);
      return;
    }
    default: {
      throw new Error("Unsupported data type: " + type);
    }
  }
}

function _serializeData(data: unknown, buffer: BufferWriter): void {
  const type = typeof data;
  if (type !== "object" || data === null || data === undefined) {
    _serializePrimitive(data, buffer, type);
    return;
  }

  if (Array.isArray(data)) {
    const length = data.length;

    buffer.writeUInt8(ARRAY);
    buffer.writeUInt32LE(length);

    for (let i = 0; i < length; i++) {
      _serializeData(data[i], buffer);
    }

    return;
  }

  if (type === "object") {
    buffer.writeUInt8(OBJECT);
    const entries = Object.entries(data);
    const entriesLength = entries.length;
    buffer.writeUInt32LE(entriesLength);

    for (let i = 0; i < entriesLength; i++) {
      const keyBuf = Buffer.from(entries[i][0], "utf8");
      buffer.writeUInt32LE(keyBuf.length);
      buffer.writeBuffer(keyBuf);
      _serializeData(entries[i][1], buffer);
    }
    return;
  }
}

export function serializeData(data: any) {
  
  const buffer = new BufferWriter();
  _serializeData(data, buffer);
  return buffer.toBuffer();
}
