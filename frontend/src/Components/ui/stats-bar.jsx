import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const stats = [
  {
    icon: "ri-wallet-3-line",
    value: 1000000,
    format: "money",
    prefix: "Rp ",
    suffix: "+",
    label: "Nominal keuangan tercatat",
  },
  {
    icon: "ri-stack-line",
    value: 128,
    format: "number",
    suffix: "+",
    label: "Transaksi dikelola",
  },
  {
    icon: "ri-sparkling-2-line",
    value: 6,
    format: "number",
    label: "Fitur utama",
  },
  {
    icon: "ri-team-line",
    value: 7,
    format: "number",
    label: "Anggota tim SADAR",
  },
];

const moneyFormatter = new Intl.NumberFormat("id-ID");

const renderValue = (el, val) => {
  const format = el.dataset.format;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const number =
    format === "money" ? moneyFormatter.format(val) : String(val);
  el.textContent = `${prefix}${number}${suffix}`;
};

const StatsBar = () => {
  const scope = useRef(null);

  useGSAP(
    () => {
      const counters = gsap.utils.toArray("[data-counter]", scope.current);
      if (!counters.length) return;

      counters.forEach((el) => {
        const end = Number(el.dataset.counter);
        const obj = { val: 0 };
        renderValue(el, 0);
        gsap.to(obj, {
          val: end,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
          onUpdate: () => renderValue(el, Math.round(obj.val)),
        });
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative z-10 bg-[#F8FBFF] pb-2">
      <div className="mx-auto w-[min(calc(100%_-_96px),1360px)] max-lg:w-[min(calc(100%_-_48px),1080px)] max-sm:w-[min(calc(100%_-_28px),1080px)]">
        <div className="relative overflow-hidden rounded-[24px] bg-[#1E3A8A] px-8 py-9 shadow-[0_24px_60px_rgba(30,58,138,0.22)] max-md:px-6 max-md:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#14B8A6] opacity-25 blur-[70px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#2563EB] opacity-30 blur-[70px]"
          />

          <div className="relative grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 lg:justify-center"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#14B8A6] ring-1 ring-white/15">
                  <i className={`${stat.icon} text-[20px]`} aria-hidden="true"></i>
                </span>
                <div className="min-w-0">
                  <p className="m-0 whitespace-nowrap font-['Plus_Jakarta_Sans',sans-serif] text-[24px] font-extrabold leading-none text-white max-sm:text-[20px]">
                    <span
                      data-counter={stat.value}
                      data-format={stat.format}
                      data-prefix={stat.prefix || ""}
                      data-suffix={stat.suffix || ""}
                    >
                      0
                    </span>
                  </p>
                  <p className="m-0 mt-1.5 text-[11px] font-semibold text-blue-100/80">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;