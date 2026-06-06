import { FadeUp } from "@/components/ui/Motion";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <FadeUp y={8}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          ) : null}
        </div>
      </FadeUp>
      {action ? (
        <div className="flex flex-wrap items-center gap-3">{action}</div>
      ) : null}
    </div>
  );
}
