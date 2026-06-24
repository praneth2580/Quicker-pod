import { PAYLOAD_CRC_LEN } from "./constants";

export function crc16(data: Uint8Array | Iterable<number>): number {
  let crc = 0xffff;
  for (const raw of data) {
    const b = raw & 0xff;
    crc ^= b << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

export function appendTripperCrc(payload18: Uint8Array): Uint8Array {
  const packet = new Uint8Array(20);
  packet.set(payload18.slice(0, PAYLOAD_CRC_LEN));
  const sum = crc16(packet.slice(0, PAYLOAD_CRC_LEN));
  packet[18] = (sum >> 8) & 0xff;
  packet[19] = sum & 0xff;
  return packet;
}

export function blankPayload(): Uint8Array {
  return new Uint8Array(PAYLOAD_CRC_LEN);
}
