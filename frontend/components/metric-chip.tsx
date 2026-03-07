type MetricChipProps = {
  label: string;
  value: string | number;
};

export function MetricChip({ label, value }: MetricChipProps) {
  return (
    <div className="rounded-2xl bg-mist px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-moss">{label}</div>
      <div className="mt-2 text-lg font-semibold text-ink">{value}</div>
    </div>
  );
}

