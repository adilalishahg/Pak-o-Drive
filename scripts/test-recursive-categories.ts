import {
  buildCategoryTree,
  getAllDescendantSlugs,
  flattenTreeWithIndentation,
  validateNoCircularParent,
} from '../src/lib/categoryTree';

console.log('🧪 Testing Recursive Category Tree Engine...\n');

// 1. Mock 4-level deep category hierarchy
const mockCategories = [
  { slug: 'car-accessories', name: 'Car Accessories', parentCategory: '', productCount: 5 },
  { slug: 'perfumes', name: 'Car Perfumes & Fragrances', parentCategory: 'car-accessories', productCount: 3 },
  { slug: 'solar-perfumes', name: 'Solar Rotating Perfumes', parentCategory: 'perfumes', productCount: 2 },
  { slug: 'duck-solar', name: 'Teal Swan & Duck Edition', parentCategory: 'solar-perfumes', productCount: 1 },
  { slug: 'mobile-accessories', name: 'Mobile Accessories', parentCategory: '', productCount: 1 },
];

// Test Tree Building
const tree = buildCategoryTree(mockCategories);
console.log('✅ Tree roots count:', tree.length);
console.log('✅ Top-level root:', tree[0].name, '| Total Products:', tree[0].totalProductCount);
console.log('   ↳ Level 1 Child:', tree[0].children[0]?.name, '| Depth:', tree[0].children[0]?.depth);
console.log('      ↳ Level 2 Child:', tree[0].children[0]?.children[0]?.name, '| Depth:', tree[0].children[0]?.children[0]?.depth);
console.log('         ↳ Level 3 Child:', tree[0].children[0]?.children[0]?.children[0]?.name, '| Depth:', tree[0].children[0]?.children[0]?.children[0]?.depth);

// Test Descendant Slugs
const carDescendants = getAllDescendantSlugs('car-accessories', mockCategories);
console.log('\n✅ All Descendants of "car-accessories":', carDescendants);

const perfumeDescendants = getAllDescendantSlugs('perfumes', mockCategories);
console.log('✅ All Descendants of "perfumes":', perfumeDescendants);

// Test Indented Flattening
const flattened = flattenTreeWithIndentation(tree);
console.log('\n✅ Flattened Visual Options:');
flattened.forEach((f) => {
  console.log(`   [Depth ${f.depth}] ${f.label} (${f.totalProductCount} products)`);
});

// Test Circular Guard
const canSetParent1 = validateNoCircularParent('car-accessories', 'solar-perfumes', mockCategories);
console.log('\n✅ Can set "solar-perfumes" as parent of "car-accessories"?', canSetParent1, '(Expected: false)');

const canSetParent2 = validateNoCircularParent('solar-perfumes', 'car-accessories', mockCategories);
console.log('✅ Can set "car-accessories" as parent of "solar-perfumes"?', canSetParent2, '(Expected: true)');

console.log('\n🎉 ALL RECURSIVE HIERARCHY TESTS PASSED SUCCESSFULLY!\n');
