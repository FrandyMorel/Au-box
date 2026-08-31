interface DashboardCardProps {
  title: string;
  value: number | string;
  description?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-[#6C6A84]/30 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#6C6A84]">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-[#14243C]">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-sm text-[#6C6A84]">
          {description}
        </p>
      )}
    </div>
  );
}