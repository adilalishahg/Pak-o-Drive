/**
 * Rule matcher (supports exact, contains, and regex)
 */
export function matchRule(text: string, rules: any[]) {
  const clean = text.toLowerCase().trim();
  const words = clean.split(/[\s,?.!#@_+\-:]+/).filter(Boolean);

  for (const rule of rules) {
    if (!rule.keywords || rule.keywords.length === 0) continue;

    const hasMatch = rule.keywords.some((rawK: string) => {
      if (!rawK) return false;
      const k = rawK.toLowerCase().trim();
      if (!k) return false;

      if (k.length <= 2) {
        return clean === k || words.includes(k);
      }
      if (rule.triggerType === 'exact') {
        return clean === k;
      }
      if (rule.triggerType === 'contains') {
        return clean === k || words.includes(k) || (k.length >= 4 && clean.includes(k));
      }
      if (rule.triggerType === 'regex') {
        try {
          return new RegExp(k, 'i').test(clean);
        } catch {
          return false;
        }
      }
      return false;
    });

    if (hasMatch) return rule;
  }

  // Default fallback rule if defined
  return rules.find((r) => r.triggerType === 'default');
}
