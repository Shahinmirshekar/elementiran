// All site copy lives here so text can be replaced without touching components.
// Nothing below states a specification, rating, warranty or certificate:
// those come from the original website once its content is migrated.

export const LIVE_SITE = "https://www.elementiran.com/";
export const CATALOG_URL = "https://www.elementiran.com/elementiran.pdf";

export const nav = [
  { href: "/products", label: "محصولات" },
  { href: "/solutions", label: "راهکارها" },
  { href: "/projects", label: "پروژه‌ها" },
  { href: "/about", label: "درباره ما" },
  { href: "/resources", label: "منابع و کاتالوگ‌ها" },
  { href: "/contact", label: "تماس با ما" },
];

export type Product = { slug: string; title: string; summary: string; uses: string[] };

export const products: Product[] = [
  {
    slug: "heating-cables",
    title: "کابل‌های حرارتی",
    summary: "کابل حرارتی برای گرم نگه‌داشتن لوله و مخزن، جلوگیری از یخ‌زدگی و گرمایش کف، رمپ و بام.",
    uses: ["لوله و مخزن", "رمپ و پیاده‌رو", "بام و ناودان", "گرمایش از کف"],
  },
  {
    slug: "heating-cable-structure",
    title: "ساختار کابل حرارتی",
    summary: "لایه‌ها و اجزای کابل حرارتی و نقشی که هر کدام در تولید و انتقال گرما دارند.",
    uses: [],
  },
  {
    slug: "mirror-defogger",
    title: "گرم‌کن ضد بخار آینه",
    summary: "المنتی که پشت آینه نصب می‌شود و سطح آن را گرم نگه می‌دارد تا بخار روی آینه ننشیند.",
    uses: ["حمام و سرویس بهداشتی", "هتل و اقامتگاه"],
  },
  {
    slug: "towel-warmer",
    title: "حوله گرم‌کن برقی",
    summary: "حوله‌گرم‌کن برقی برای حمام و سرویس بهداشتی.",
    uses: ["خانه", "هتل و اقامتگاه"],
  },
  {
    slug: "underfloor-mat",
    title: "زیرفرشی برقی",
    summary: "گرمایش از کف قابل حمل که زیر فرش پهن می‌شود و بدون تغییر در ساختمان کار می‌کند.",
    uses: ["اتاق نشیمن", "محل کار"],
  },
  {
    slug: "industrial-elements",
    title: "المنت‌های صنعتی",
    summary: "المنت‌های حرارتی برای مصارف صنعتی، با امکان ساخت بر اساس نیاز هر پروژه.",
    uses: ["خطوط تولید", "تجهیزات فرایندی"],
  },
];

export const solutionGroups = [
  {
    id: "industrial",
    title: "صنعتی",
    items: [
      { title: "هیت تریسینگ لوله و مخزن", text: "ثابت نگه‌داشتن دمای سیال در لوله‌ها و مخازن با کابل حرارتی." },
      { title: "حفاظت در برابر یخ‌زدگی", text: "جلوگیری از یخ‌زدن خطوط آب و تأسیسات در فصل سرد." },
      { title: "نفت، گاز و پتروشیمی", text: "گرمایش الکتریکی خطوط و تجهیزات در صنایع انرژی." },
      { title: "المنت سفارشی", text: "طراحی و ساخت المنت بر اساس شرایط کاری دستگاه." },
    ],
  },
  {
    id: "building",
    title: "تجاری و ساختمانی",
    items: [
      { title: "رمپ و پیاده‌رو", text: "آب‌کردن برف و یخ روی رمپ پارکینگ و مسیرهای رفت‌وآمد." },
      { title: "بام و ناودان", text: "باز نگه‌داشتن مسیر آب روی بام و در ناودان هنگام یخبندان." },
      { title: "گرمایش از کف برقی", text: "گرمایش یکنواخت فضا با کابل حرارتی زیر کف‌پوش." },
    ],
  },
  {
    id: "home",
    title: "خانگی",
    items: [
      { title: "گرمایش از کف", text: "کف گرم برای اتاق، حمام و آشپزخانه." },
      { title: "آینه بدون بخار", text: "گرم‌کن پشت آینه برای حمام." },
      { title: "حوله گرم‌کن و زیرفرشی", text: "گرمای موضعی، بدون نیاز به تغییر در ساختمان." },
    ],
  },
];

// Names as they appear on the original website. Photos and descriptions follow with the migration.
export const projects = ["باتیس", "هتل لوتوس", "گنجنامه همدان"];
