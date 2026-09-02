/**
 * Universal Infinite / N-Level Recursive Category Tree Engine for Pak-o-Drive
 * 
 * Supports arbitrary nested depths: Category ➔ Subcategory ➔ Sub-subcategory ➔ ...
 * Handles recursive tree assembly, descendant slug resolution for queries,
 * circular dependency prevention, and visual indentation for dropdowns.
 */

export interface CategoryTreeNode {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parentCategory?: string;
  productCount: number;
  totalProductCount: number;
  depth: number;
  path: string[];
  children: CategoryTreeNode[];
  subcategories: CategoryTreeNode[]; // Alias for backward compatibility
}

export interface FlattenedCategoryOption {
  id: string;
  name: string;
  slug: string;
  icon: string;
  depth: number;
  label: string;
  parentCategory?: string;
  productCount: number;
  totalProductCount: number;
}

/**
 * Builds an N-level deep recursive category tree from a flat list of categories.
 */
export function buildCategoryTree(flatList: any[]): CategoryTreeNode[] {
  if (!Array.isArray(flatList) || flatList.length === 0) return [];

  // Normalize list
  const normalized = flatList.map((item) => ({
    ...item,
    id: item.id || item._id?.toString() || item.slug,
    parentCategory: (item.parentCategory || '').trim(),
    productCount: Number(item.productCount || 0),
  }));

  // Group children by parentCategory (matching slug or name)
  const childrenByParent = new Map<string, any[]>();
  for (const item of normalized) {
    if (item.parentCategory) {
      const parentKey = item.parentCategory.toLowerCase();
      if (!childrenByParent.has(parentKey)) {
        childrenByParent.set(parentKey, []);
      }
      childrenByParent.get(parentKey)!.push(item);
    }
  }

  // Recursive tree builder function
  function constructNode(item: any, currentDepth = 0, currentPath: string[] = []): CategoryTreeNode {
    const itemSlugKey = (item.slug || '').toLowerCase();
    const itemNameKey = (item.name || '').toLowerCase();
    const childItems = [
      ...(childrenByParent.get(itemSlugKey) || []),
      ...(itemSlugKey !== itemNameKey ? childrenByParent.get(itemNameKey) || [] : []),
    ];

    // Deduplicate children by slug
    const uniqueChildrenMap = new Map<string, any>();
    for (const ch of childItems) {
      if (ch.slug !== item.slug && !currentPath.includes(ch.slug)) {
        uniqueChildrenMap.set(ch.slug, ch);
      }
    }

    const nextPath = [...currentPath, item.slug];
    const children: CategoryTreeNode[] = Array.from(uniqueChildrenMap.values()).map((child) =>
      constructNode(child, currentDepth + 1, nextPath)
    );

    const cumulativeCount = (item.productCount || 0) + children.reduce((sum, ch) => sum + ch.totalProductCount, 0);

    return {
      _id: item._id,
      id: item.id,
      name: item.name,
      slug: item.slug,
      icon: item.icon || 'fas fa-tag',
      image: item.image || '',
      parentCategory: item.parentCategory || '',
      productCount: item.productCount || 0,
      totalProductCount: cumulativeCount,
      depth: currentDepth,
      path: nextPath,
      children,
      subcategories: children,
    };
  }

  // Root categories have no parentCategory
  const roots = normalized.filter((item) => !item.parentCategory);

  // If data has orphaned categories whose parent does not exist, include them as roots
  const allSlugsAndNames = new Set(normalized.flatMap((c) => [c.slug.toLowerCase(), c.name.toLowerCase()]));
  const orphans = normalized.filter(
    (item) => item.parentCategory && !allSlugsAndNames.has(item.parentCategory.toLowerCase())
  );

  const topLevel = [...roots, ...orphans];
  return topLevel.map((root) => constructNode(root, 0, []));
}

/**
 * Recursively collects all descendant category slugs (children, grandchildren, etc.)
 * for a given parent category slug.
 */
export function getAllDescendantSlugs(targetSlug: string, flatList: any[]): string[] {
  if (!targetSlug || !Array.isArray(flatList)) return [];

  const targetKey = targetSlug.toLowerCase().trim();
  const directChildren = flatList.filter((c) => {
    const parentKey = (c.parentCategory || '').toLowerCase().trim();
    return parentKey === targetKey;
  });

  const descendantSlugs: string[] = [];
  for (const child of directChildren) {
    if (!descendantSlugs.includes(child.slug)) {
      descendantSlugs.push(child.slug);
      const innerDescendants = getAllDescendantSlugs(child.slug, flatList);
      for (const inner of innerDescendants) {
        if (!descendantSlugs.includes(inner)) {
          descendantSlugs.push(inner);
        }
      }
    }
  }

  return descendantSlugs;
}

/**
 * Flattens a recursive category tree into an indented array for dropdown selectors,
 * search bars, and admin parent selectors.
 */
export function flattenTreeWithIndentation(tree: CategoryTreeNode[]): FlattenedCategoryOption[] {
  const result: FlattenedCategoryOption[] = [];

  function traverse(node: CategoryTreeNode) {
    const indentPrefix = node.depth === 0 ? '' : `${'— '.repeat(node.depth)}↳ `;
    result.push({
      id: node.id || node.slug,
      name: node.name,
      slug: node.slug,
      icon: node.icon || 'fas fa-tag',
      depth: node.depth,
      label: `${indentPrefix}${node.name}`,
      parentCategory: node.parentCategory,
      productCount: node.productCount,
      totalProductCount: node.totalProductCount,
    });

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const root of tree) {
    traverse(root);
  }

  return result;
}

/**
 * Checks if setting `proposedParentSlug` as parent of `targetSlug` would cause a circular cycle.
 */
export function validateNoCircularParent(targetSlug: string, proposedParentSlug: string, flatList: any[]): boolean {
  if (!targetSlug || !proposedParentSlug) return true;
  if (targetSlug === proposedParentSlug) return false;

  // Check if proposedParent is a descendant of target
  const descendants = getAllDescendantSlugs(targetSlug, flatList);
  return !descendants.includes(proposedParentSlug);
}

/**
 * Returns full ancestor breadcrumb trail for a given category slug.
 */
export function getCategoryAncestors(slug: string, flatList: any[]): any[] {
  if (!slug || !Array.isArray(flatList)) return [];

  const trail: any[] = [];
  let currSlug = slug.toLowerCase().trim();
  const visited = new Set<string>();

  while (currSlug && !visited.has(currSlug)) {
    visited.add(currSlug);
    const cat = flatList.find(
      (c) => (c.slug || '').toLowerCase() === currSlug || (c.name || '').toLowerCase() === currSlug
    );
    if (!cat) break;

    trail.unshift(cat);
    currSlug = (cat.parentCategory || '').toLowerCase().trim();
  }

  return trail;
}
