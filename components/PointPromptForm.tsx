"use client";
import { useId, useState, type FormEvent } from "react";

type PointPromptFormProps = {
  onSubmit: (point: { x: number; y: number }, label: 0 | 1) => void;
  allowNegative: boolean;
  disabled: boolean;
  actionLabel: string;
};

export default function PointPromptForm({
  onSubmit,
  allowNegative,
  disabled,
  actionLabel,
}: PointPromptFormProps) {
  const xId = useId();
  const yId = useId();
  const labelId = useId();
  const [x, setX] = useState(20);
  const [y, setY] = useState(20);
  const [label, setLabel] = useState<0 | 1>(1);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      setError("Enter finite numeric values.");
      return;
    }
    if (x < 0 || x >= 210 || y < 0 || y >= 297) {
      setError("Coordinates must be within corrected A4: 0≤x<210, 0≤y<297 mm.");
      return;
    }
    setError("");
    const effectiveLabel: 0 | 1 = allowNegative ? label : 1;
    onSubmit({ x: x * 5, y: y * 5 }, effectiveLabel);
  };

  return (
    <form className="point-fields" onSubmit={submit}>
      <p className="form-field">Coordinates are measured in millimetres from the top-left of corrected A4.</p>
      <div className="form-field">
        <label htmlFor={xId}>X (mm)</label>
        <input
          id={xId}
          type="number"
          min={0}
          max={209.9}
          step={0.1}
          value={Number.isFinite(x)?x:""}
          disabled={disabled}
          onChange={(e) => setX(e.target.valueAsNumber)}
        />
      </div>
      <div className="form-field">
        <label htmlFor={yId}>Y (mm)</label>
        <input
          id={yId}
          type="number"
          min={0}
          max={296.9}
          step={0.1}
          value={Number.isFinite(y)?y:""}
          disabled={disabled}
          onChange={(e) => setY(e.target.valueAsNumber)}
        />
      </div>
      {allowNegative && (
        <div className="form-field">
          <label htmlFor={labelId}>Point type</label>
          <select
            id={labelId}
            value={label}
            disabled={disabled}
            onChange={(e) => setLabel(Number(e.target.value) as 0 | 1)}
          >
            <option value={1}>Inside paper</option>
            <option value={0}>Outside paper</option>
          </select>
        </div>
      )}
      {error && (
        <p className="form-field" role="alert">
          {error}
        </p>
      )}
      <div className="form-field">
        <button type="submit" disabled={disabled}>
          {actionLabel}
        </button>
      </div>
    </form>
  );
}
