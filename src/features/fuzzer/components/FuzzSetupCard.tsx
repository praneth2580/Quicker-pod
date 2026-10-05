import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { HexInput } from "@/features/protocol-lab/components/HexInput";
import { useConnectionStore } from "@/store/connectionStore";
import { TRIPPER_CHAR_UUID, TRIPPER_SERVICE_UUID } from "@/bluetooth/tripper/constants";
import { truncateUuid } from "@/utils/format";
import {
  COMMAND_LABELS,
  DEFAULT_RAW_BASE_HEX,
  ENCODINGS,
  MAX_FUZZ_VALUES,
  MIN_FUZZ_DELAY_MS,
  STRATEGY_LABELS,
  boundaryValues,
  fieldDescription,
  fieldsForCommand,
  formatValueList,
  parseValueList,
  recommendedValues,
  validateConfig,
} from "../engine";
import { useFuzzStore } from "../store";
import type {
  FuzzCommand,
  FuzzSession,
  FuzzSessionConfig,
  FuzzStrategy,
} from "../types";

const SELECT_CLASS =
  "w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-3 text-white";

const COMMANDS: FuzzCommand[] = ["nav", "compass", "time", "raw"];
const STRATEGIES: FuzzStrategy[] = ["field", "byte", "bit", "encoding"];

type ByteMode = "exhaustive" | "small" | "custom";

function allBytes(): number[] {
  return Array.from({ length: 256 }, (_, i) => i);
}

function smallValues(): number[] {
  return Array.from({ length: 16 }, (_, i) => i);
}

function configFromSession(session: FuzzSession): FuzzSessionConfig {
  const {
    name,
    serviceUuid,
    characteristicUuid,
    command,
    strategy,
    basePacketHex,
    field,
    offset,
    encoding,
    values,
    allowHeader,
    delayMs,
    responseTimeoutMs,
    dryRun,
    pauseOnReaction,
  } = session;
  return {
    name,
    serviceUuid,
    characteristicUuid,
    command,
    strategy,
    basePacketHex,
    field,
    offset,
    encoding,
    values,
    allowHeader,
    delayMs,
    responseTimeoutMs,
    dryRun,
    pauseOnReaction,
  };
}

function defaultValuesFor(
  command: FuzzCommand,
  strategy: FuzzStrategy,
  field: string | null,
  encoding: string | null,
): number[] {
  if (strategy === "field") return recommendedValues(command, field ?? fieldsForCommand(command)[0] ?? "");
  if (strategy === "bit") return [0, 1, 2, 3, 4, 5, 6, 7];
  if (strategy === "encoding") return boundaryValues(encoding ?? "uint16_be");
  return allBytes();
}

interface TargetOption {
  serviceUuid: string;
  characteristicUuid: string;
  label: string;
}

function useWritableTargets(): TargetOption[] {
  const services = useConnectionStore((s) => s.services);
  return useMemo(() => {
    const out: TargetOption[] = [
      {
        serviceUuid: TRIPPER_SERVICE_UUID,
        characteristicUuid: TRIPPER_CHAR_UUID,
        label: `Tripper write char (${truncateUuid(TRIPPER_CHAR_UUID)})`,
      },
    ];
    for (const svc of services) {
      for (const ch of svc.characteristics) {
        if (!ch.properties.write && !ch.properties.writeWithoutResponse) continue;
        if (ch.uuid.toLowerCase() === TRIPPER_CHAR_UUID.toLowerCase()) continue;
        out.push({
          serviceUuid: svc.uuid,
          characteristicUuid: ch.uuid,
          label: `${truncateUuid(ch.uuid)} · ${truncateUuid(svc.uuid)}`,
        });
      }
    }
    return out;
  }, [services]);
}

interface FuzzSetupCardProps {
  session: FuzzSession;
}

export function FuzzSetupCard({ session }: FuzzSetupCardProps) {
  const updateActiveConfig = useFuzzStore((s) => s.updateActiveConfig);
  const targets = useWritableTargets();

  const [form, setForm] = useState<FuzzSessionConfig>(() => configFromSession(session));
  const [valuesText, setValuesText] = useState(() => formatValueList(session.values, session.strategy !== "encoding"));
  const [byteMode, setByteMode] = useState<ByteMode>("exhaustive");

  useEffect(() => {
    setForm(configFromSession(session));
    setValuesText(formatValueList(session.values, session.strategy !== "encoding"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const persist = (patch: Partial<FuzzSessionConfig>) => {
    setForm((f) => ({ ...f, ...patch }));
    void updateActiveConfig(patch);
  };

  const applyValues = (values: number[], strategy = form.strategy) => {
    setValuesText(formatValueList(values, strategy !== "encoding"));
    persist({ values });
  };

  const handleCommand = (command: FuzzCommand) => {
    let strategy = form.strategy;
    if (command === "raw" && strategy === "field") strategy = "byte";
    const field = strategy === "field" ? (fieldsForCommand(command)[0] ?? null) : null;
    const encoding = strategy === "encoding" ? (form.encoding ?? "uint16_be") : form.encoding;
    const values = defaultValuesFor(command, strategy, field, encoding);
    const basePacketHex =
      command === "raw" && !form.basePacketHex ? DEFAULT_RAW_BASE_HEX : form.basePacketHex;
    persist({ command, strategy, field, encoding, values, basePacketHex });
    setValuesText(formatValueList(values, strategy !== "encoding"));
  };

  const handleStrategy = (strategy: FuzzStrategy) => {
    const field = strategy === "field" ? (form.field ?? fieldsForCommand(form.command)[0] ?? null) : null;
    const encoding = strategy === "encoding" ? (form.encoding ?? "uint16_be") : form.encoding;
    const offset =
      strategy === "field" ? form.offset : form.offset ?? 5;
    const values = defaultValuesFor(form.command, strategy, field, encoding);
    persist({ strategy, field, encoding, offset, values });
    setValuesText(formatValueList(values, strategy !== "encoding"));
    if (strategy === "byte") setByteMode("exhaustive");
  };

  const handleField = (field: string) => {
    const values = recommendedValues(form.command, field);
    persist({ field, values });
    setValuesText(formatValueList(values, true));
  };

  const handleEncoding = (encoding: string) => {
    const values = boundaryValues(encoding);
    persist({ encoding, values });
    setValuesText(formatValueList(values, false));
  };

  const handleByteMode = (mode: ByteMode) => {
    setByteMode(mode);
    if (mode === "exhaustive") applyValues(allBytes(), "byte");
    else if (mode === "small") applyValues(smallValues(), "byte");
  };

  const handleValuesText = (text: string) => {
    setValuesText(text);
    persist({ values: parseValueList(text) });
  };

  const handleTarget = (value: string) => {
    const [serviceUuid, characteristicUuid] = value.split("|");
    if (serviceUuid && characteristicUuid) persist({ serviceUuid, characteristicUuid });
  };

  const validation = validateConfig(form);
  const targetValue = `${form.serviceUuid}|${form.characteristicUuid}`;
  const targetKnown = targets.some(
    (t) => `${t.serviceUuid}|${t.characteristicUuid}` === targetValue,
  );

  return (
    <Card title="Configure attack" subtitle="One field or byte changes per packet; CRC is always recomputed.">
      <div className="space-y-4">
        <Input label="Session name" value={form.name} onChange={(e) => persist({ name: e.target.value })} />

        <label className="block">
          <span className="mb-2 block text-sm text-gray-400">Target characteristic</span>
          <select className={SELECT_CLASS} value={targetKnown ? targetValue : "custom"} onChange={(e) => handleTarget(e.target.value)}>
            {targets.map((t) => (
              <option key={`${t.serviceUuid}|${t.characteristicUuid}`} value={`${t.serviceUuid}|${t.characteristicUuid}`}>
                {t.label}
              </option>
            ))}
            {!targetKnown && <option value="custom">{truncateUuid(form.characteristicUuid)} (current)</option>}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-sm text-gray-400">Command</span>
            <select className={SELECT_CLASS} value={form.command} onChange={(e) => handleCommand(e.target.value as FuzzCommand)}>
              {COMMANDS.map((c) => (
                <option key={c} value={c}>
                  {COMMAND_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-gray-400">Strategy</span>
            <select className={SELECT_CLASS} value={form.strategy} onChange={(e) => handleStrategy(e.target.value as FuzzStrategy)}>
              {STRATEGIES.filter((s) => !(s === "field" && form.command === "raw")).map((s) => (
                <option key={s} value={s}>
                  {STRATEGY_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {form.command === "raw" && (
          <HexInput
            label="Base frame (18 or 20 bytes)"
            value={form.basePacketHex}
            onChange={(hex) => persist({ basePacketHex: hex })}
          />
        )}

        {form.strategy === "field" && (
          <label className="block">
            <span className="mb-2 block text-sm text-gray-400">Field</span>
            <select className={SELECT_CLASS} value={form.field ?? ""} onChange={(e) => handleField(e.target.value)}>
              {fieldsForCommand(form.command).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {form.field && <p className="mt-1 text-xs text-gray-500">{fieldDescription(form.command, form.field)}</p>}
          </label>
        )}

        {(form.strategy === "byte" || form.strategy === "bit" || form.strategy === "encoding") && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Byte offset (0–17)"
              type="number"
              min={0}
              max={17}
              value={form.offset ?? 0}
              onChange={(e) => persist({ offset: Number(e.target.value) })}
            />
            {form.strategy === "encoding" && (
              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">Encoding</span>
                <select className={SELECT_CLASS} value={form.encoding ?? "uint16_be"} onChange={(e) => handleEncoding(e.target.value)}>
                  {ENCODINGS.map((enc) => (
                    <option key={enc} value={enc}>
                      {enc}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {form.strategy === "byte" && (
              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">Values</span>
                <select className={SELECT_CLASS} value={byteMode} onChange={(e) => handleByteMode(e.target.value as ByteMode)}>
                  <option value="exhaustive">0–255 (all 256)</option>
                  <option value="small">0–15 (enum)</option>
                  <option value="custom">Custom list</option>
                </select>
              </label>
            )}
          </div>
        )}

        {form.strategy === "bit" ? (
          <p className="text-xs text-gray-500">Toggles bits 0–7 of byte[{form.offset ?? 0}] — 8 candidates, one bit each.</p>
        ) : (
          <label className="block">
            <span className="mb-2 block text-sm text-gray-400">
              Value plan ({form.values.length} / {MAX_FUZZ_VALUES})
            </span>
            <textarea
              value={valuesText}
              onChange={(e) => handleValuesText(e.target.value)}
              rows={2}
              spellCheck={false}
              disabled={form.strategy === "byte" && byteMode !== "custom"}
              className="w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-3 font-mono text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
              placeholder="0x00 0x10 0x20  or  0-255  or  100, 200, 500"
            />
            <p className="mt-1 text-xs text-gray-500">Space/comma separated. Supports 0xNN, decimals, and ranges like 0-255.</p>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`Delay (ms, min ${MIN_FUZZ_DELAY_MS})`}
            type="number"
            min={MIN_FUZZ_DELAY_MS}
            value={form.delayMs}
            onChange={(e) => persist({ delayMs: Number(e.target.value) })}
          />
          <Input
            label="Response wait (ms)"
            type="number"
            min={0}
            value={form.responseTimeoutMs}
            onChange={(e) => persist({ responseTimeoutMs: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Toggle
            label="Dry run"
            description="Generate and record packets without transmitting."
            checked={form.dryRun}
            onChange={(v) => persist({ dryRun: v })}
          />
          <Toggle
            label="Pause on reaction"
            description="Stop the moment a candidate is reacted upon, so you can confirm it."
            checked={form.pauseOnReaction}
            onChange={(v) => persist({ pauseOnReaction: v })}
          />
          <Toggle
            label="Allow header bytes (0–1)"
            description="Danger: byte 0–1 select the command — the OTA path lives here too."
            checked={form.allowHeader}
            onChange={(v) => persist({ allowHeader: v })}
          />
        </div>

        {!validation.ok && <p className="text-sm text-danger">{validation.error}</p>}
      </div>
    </Card>
  );
}
