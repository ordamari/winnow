export function StyleNumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "pt",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="shrink-0 text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-20 accent-primary"
        />
        <span className="w-12 text-end text-xs text-muted-foreground tabular-nums">
          {value}
          {unit}
        </span>
      </div>
    </div>
  );
}
