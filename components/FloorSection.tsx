// Conceptual cross-section of an electric underfloor heating build-up.
const layers = [
  { label: "کف‌پوش", h: "h-6", cls: "bg-chalk" },
  { label: "ملات و کابل حرارتی", h: "h-16", cls: "bg-[#cfccc3]", cable: true },
  { label: "عایق حرارتی", h: "h-10", cls: "bg-paper pending" },
  { label: "کف سازه‌ای", h: "h-14", cls: "bg-steel" },
];

export function FloorSection() {
  return (
    <figure>
      <div className="border border-coal/20">
        {layers.map((l) => (
          <div key={l.label} className="grid grid-cols-[1fr_9.5rem] items-stretch border-b border-coal/15 last:border-b-0 sm:grid-cols-[1fr_12rem]">
            <div className={`${l.h} ${l.cls} relative overflow-hidden`}>
              {l.cable && (
                <div className="absolute inset-0 flex items-center justify-around px-4" aria-hidden="true">
                  {Array.from({ length: 9 }, (_, i) => (
                    <span key={i} style={{ animationDelay: `${i * 0.18}s` }} className="heat-dot size-3 rounded-full bg-heat shadow-[0_0_0_6px_rgb(255_107_53/0.18),0_0_0_14px_rgb(255_107_53/0.08)]" />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center border-s border-coal/15 bg-paper px-4 text-sm font-medium">{l.label}</div>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-sm text-coal/70">
        برش مفهومی از گرمایش از کف برقی. ترتیب و ضخامت لایه‌ها در هر پروژه جداگانه طراحی می‌شود.
      </figcaption>
    </figure>
  );
}
