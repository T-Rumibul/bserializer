const DEFAULT_CHUNK_SIZE = 8192 * 8; // 64KB

export class BufferWriter {
    private chunks: Buffer[] = [];
    private current: Buffer;
    private offset = 0;
    constructor(initialSize = DEFAULT_CHUNK_SIZE) {
        this.current = Buffer.allocUnsafe(initialSize);
      }
    private ensure(size: number) {
      if (this.offset + size > this.current.length) this.flush(size)
  
    }
    get getChunks() {
        return this.chunks
    }
    flush(size: number = 0) {
        this.chunks.push(this.current.subarray(0, this.offset));
        this.offset = 0;
        this.current = Buffer.allocUnsafe(Math.max(size, DEFAULT_CHUNK_SIZE));
    }
    writeUInt8(val: number) {
      this.ensure(1);
      this.current.writeUInt8(val, this.offset++);
    }
  
    writeUInt32LE(val: number) {
      this.ensure(4);
      this.current.writeUInt32LE(val, this.offset);
      this.offset += 4;
    }
  
    writeDoubleLE(val: number) {
      this.ensure(8);
      this.current.writeDoubleLE(val, this.offset);
      this.offset += 8;
    }
  
    writeBigInt64LE(val: bigint) {
      this.ensure(8);
      this.current.writeBigInt64LE(val, this.offset);
      this.offset += 8;
    }
  
    writeString(str: string) {
        const strBuf = Buffer.from(str, "utf8");
        this.writeBuffer(strBuf);
      }
   writeBuffer(buf: Buffer) {
    this.ensure(buf.length);
    buf.copy(this.current, this.offset);
    this.offset += buf.length;
  }
  concat(buffer: BufferWriter) {
    buffer.flush()
    this.flush()
    this.chunks.push(...buffer.getChunks);
    

  }
    toBuffer(): Buffer<ArrayBuffer> {
      if (this.offset > 0) this.flush(); // Always flush final buffer
      if (this.chunks.length === 1) return this.chunks[0] as Buffer<ArrayBuffer>;
      return Buffer.concat(this.chunks);
      
      
    }
    
  }
  