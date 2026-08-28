let categoriesCache: any[] | null = null;
let categoriesPromise: Promise<any[]> | null = null;

export async function fetchCategoriesClient(): Promise<any[]> {
  if (categoriesCache) {
    return categoriesCache;
  }
  if (categoriesPromise) {
    return categoriesPromise;
  }
  categoriesPromise = (async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        categoriesCache = data.data;
        return data.data;
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch categories:', e);
      return [];
    } finally {
      categoriesPromise = null;
    }
  })();
  return categoriesPromise;
}
