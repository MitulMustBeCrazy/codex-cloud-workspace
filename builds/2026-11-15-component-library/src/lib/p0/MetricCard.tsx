import type { ReactNode } from "react";

export type MetricTrend = {
  value: number;
  direction: "up" | "down" | "flat";
  positiveWhen?: "up" | "down";
  comparison?: string;
};
export type MetricCardProps = {
  label: string;
  value: string | number;
  locale?: string;
  prefix?: string;
  suffix?: string;
  period?: string;
  trend?: MetricTrend;
  loading?: boolean;
  note?: ReactNode;
};

/** A single semantic KPI, usable in dashboard or presentation contexts. */
export function P0MetricCard({
  label, value, locale = "en-BD", prefix = "", suffix = "",
  period, trend, loading = false, note,
}: MetricCardProps) {
  const formatted = typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
    : String(value);
  const isPositive = trend && trend.direction !== "flat" &&
    trend.direction === (trend.positiveWhen ?? "up");
  const delta = trend && (
    <span className={"pcl-metric__trend " +
      (trend.direction === "flat" ? "pcl-metric__trend--neutral" :
        isPositive ? "pcl-metric__trend--positive" : "pcl-metric__trend--negative")}>
      {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "•"} {Math.abs(trend.value).toLocaleString(locale)}%
      {trend.comparison && <span className="pcl-metric__comparison"> {trend.comparison}</span>}
    </span>
  );
  return (
    <article className="pcl-metric" aria-label={label} aria-busy={loading}>
      <div className="pcl-metric__top"><span>{label}</span>{period && <small>{period}</small>}</div>
      <div className="pcl-metric__value" aria-live="off">{loading ? "…" : prefix + formatted + suffix}</div>
      <div className="pcl-metric__bottom">{loading ? <span role="status">Loading metric</span> : delta}{note && <span>{note}</span>}</div>
    </article>
  );
}

export function P0ProgressMeter({ label, value, max, locale = "en-BD" }: {
  label: string; value: number; max: number; locale?: string;
}) {
  const valid = Number.isFinite(value) && Number.isFinite(max) && max > 0;
  const bounded = valid ? Math.max(0, Math.min(max, value)) : 0;
  const percentage = valid ? Math.round(bounded / max * 100) : 0;
  return (
    <div className="pcl-meter">
      <div className="pcl-meter__labels"><strong>{label}</strong><span>{valid ? new Intl.NumberFormat(locale).format(value) + " / " + new Intl.NumberFormat(locale).format(max) : "No target"}</span></div>
      <div className="pcl-meter__track" role="progressbar" aria-label={label}
        aria-valuemin={0} aria-valuemax={valid ? max : 100} aria-valuenow={bounded}
        aria-valuetext={valid ? percentage + "%" : "No valid target"}>
        <span style={{ width: percentage + "%" }} />
      </div>
    </div>
  );
}
