const CACHED_LUT: {
  categories: BudgetCategory[] | null;
  categoriesLut: KeyValueList<BudgetCategory> | null;
} = {
  categories: null,
  categoriesLut: null,
};

let initialized = false;

const initLut = async function () {
  if (initialized) return;
  const resp = await fetch("/api/Budget/GetCategories", { method: "GET" });
  CACHED_LUT.categories = (await resp.json()) as BudgetCategory[];
  CACHED_LUT.categoriesLut = CACHED_LUT.categories.reduce(
    (p, c) => ((p[c.cat_code] = c), p),
    {} as KeyValueList<BudgetCategory>
  );
  initialized = true;
};

initLut();

export default CACHED_LUT;
