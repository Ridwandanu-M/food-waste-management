const summaryItems = [
  {
    icon: "🍱",
    label: "Tingkat Efisiensi",
    value: "94%",
    sub: "+2%",
    subColor: "text-green-600",
  },
  {
    icon: "🌱",
    label: "Limbah Dialihkan",
    value: "12.4kg",
    sub: null,
  },
  {
    icon: "💰",
    label: "Proyeksi Penghematan",
    value: "Rp 3.850.000",
    sub: null,
  },
];

export default function SummaryFooter() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"
        >
          <span className="text-3xl">{item.icon}</span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
            <p className="text-2xl font-bold text-[#1a2e1a] leading-tight">
              {item.value}
              {item.sub && (
                <span
                  className={`ml-1.5 text-sm font-semibold ${item.subColor}`}
                >
                  {item.sub}
                </span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
