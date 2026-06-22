import { BluetoothError, mapBluetoothError } from "./errors";
import {
  type PairingResult,
  type PairingTarget,
  type TripperPairingConfig,
  DEFAULT_PAIRING_CONFIG,
  encodePinPayload,
  isLikelyVendorService,
  isPairingResponseSuccess,
  normalizeTripperPin,
  validateTripperPin,
} from "./pairingConfig";

type GattServer = BluetoothRemoteGATTServer;
type GattService = BluetoothRemoteGATTService;
type GattCharacteristic = BluetoothRemoteGATTCharacteristic;

export async function discoverPairingTarget(server: GattServer): Promise<PairingTarget | null> {
  const services = await server.getPrimaryServices();

  for (const service of services) {
    if (!isLikelyVendorService(service.uuid)) continue;

    const target = await findPairingTargetInService(service);
    if (target) return target;
  }

  for (const service of services) {
    const target = await findPairingTargetInService(service);
    if (target) return target;
  }

  return null;
}

async function findPairingTargetInService(service: GattService): Promise<PairingTarget | null> {
  const characteristics = await service.getCharacteristics();
  const writeChar = characteristics.find(
    (c) => c.properties.write || c.properties.writeWithoutResponse,
  );
  if (!writeChar) return null;

  const notifyChar = characteristics.find(
    (c) => c.properties.notify || c.properties.indicate,
  );

  return {
    serviceUuid: service.uuid,
    writeCharacteristicUuid: writeChar.uuid,
    notifyCharacteristicUuid: notifyChar?.uuid,
  };
}

function resolveTarget(
  config: TripperPairingConfig,
  discovered: PairingTarget | null,
): PairingTarget {
  if (config.serviceUuid && config.writeCharacteristicUuid) {
    return {
      serviceUuid: config.serviceUuid,
      writeCharacteristicUuid: config.writeCharacteristicUuid,
      notifyCharacteristicUuid: config.notifyCharacteristicUuid,
    };
  }
  if (!discovered) {
    throw new BluetoothError(
      "NOT_FOUND",
      "Could not find a vendor pairing characteristic. Use Protocol Lab Explorer to identify UUIDs, then set them in Settings.",
    );
  }
  return discovered;
}

async function waitForCharacteristicNotification(
  characteristic: GattCharacteristic,
  timeoutMs: number,
): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: Uint8Array | null) => {
      if (settled) return;
      settled = true;
      characteristic.removeEventListener("characteristicvaluechanged", onChange);
      clearTimeout(timer);
      void characteristic.stopNotifications().catch(() => undefined);
      resolve(value);
    };

    const onChange = (event: Event) => {
      const target = event.target as GattCharacteristic;
      if (!target.value) return;
      finish(new Uint8Array(target.value.buffer));
    };

    const timer = setTimeout(() => finish(null), timeoutMs);

    characteristic.addEventListener("characteristicvaluechanged", onChange);
    void characteristic.startNotifications().catch(() => finish(null));
  });
}

export async function submitTripperPin(
  server: GattServer,
  pin: string,
  config: TripperPairingConfig = DEFAULT_PAIRING_CONFIG,
): Promise<PairingResult> {
  const pinError = validateTripperPin(pin);
  if (pinError) {
    throw new BluetoothError("PAIRING_FAILED", pinError);
  }

  const normalizedPin = normalizeTripperPin(pin);
  const discovered = await discoverPairingTarget(server);
  const target = resolveTarget(config, discovered);
  const payload = encodePinPayload(normalizedPin, config.pinEncoding);

  try {
    const service = await server.getPrimaryService(target.serviceUuid);
    const writeChar = await service.getCharacteristic(target.writeCharacteristicUuid);

    let response: Uint8Array | undefined;
    if (target.notifyCharacteristicUuid) {
      const notifyChar = await service.getCharacteristic(target.notifyCharacteristicUuid);
      const notificationPromise = waitForCharacteristicNotification(
        notifyChar,
        config.responseTimeoutMs,
      );

      if (writeChar.properties.writeWithoutResponse) {
        await writeChar.writeValueWithoutResponse(payload);
      } else {
        await writeChar.writeValue(payload);
      }

      response = (await notificationPromise) ?? undefined;
    } else if (writeChar.properties.writeWithoutResponse) {
      await writeChar.writeValueWithoutResponse(payload);
    } else {
      await writeChar.writeValue(payload);
    }

    await delay(500);

    if (!server.connected) {
      throw new BluetoothError(
        "PAIRING_FAILED",
        "Tripper rejected the PIN or disconnected. Check the code on your display and try again.",
      );
    }

    if (!isPairingResponseSuccess(response)) {
      throw new BluetoothError(
        "PAIRING_FAILED",
        "Incorrect PIN. Enter the 6-digit code shown on your Tripper display.",
      );
    }

    return {
      success: true,
      target,
      encoding: config.pinEncoding,
      response,
      message: "PIN accepted. Device paired successfully.",
    };
  } catch (error) {
    throw mapBluetoothError(error);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
