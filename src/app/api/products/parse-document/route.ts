import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded. Please select a valid DOCX file.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse DOCX to HTML using mammoth
    const mammothResult = await mammoth.convertToHtml({ buffer });
    const html = mammothResult.value;

    // 1. Extract HTML Tables — match both <td> and <th> cells (mammoth renders
    //    bold/header-style cells as <th>, including the "Field Key" column which
    //    contains keys like "productName". Previously only <td> was matched, so
    //    row[0] was always empty and no schema keys were ever found.
    const tables: string[][][] = [];
    const tableMatches = html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi);
    for (const tableMatch of tableMatches) {
      const rows: string[][] = [];
      const rowMatches = tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      for (const rowMatch of rowMatches) {
        const cells: string[] = [];
        // Match both <td> and <th> — mammoth uses <th> for bold/first-column cells
        const cellMatches = rowMatch[1].matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi);
        for (const cellMatch of cellMatches) {
          // Replace inner <p> / <br> with a space so multi-paragraph cells join correctly
          const cellContent = cellMatch[1]
            .replace(/<\/p>\s*<p[^>]*>/gi, ' ')  // join adjacent paragraphs
            .replace(/<br\s*\/?>/gi, ' ')          // line breaks → space
            .replace(/<[^>]*>/g, '')               // strip remaining tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')                 // collapse whitespace
            .trim();
          cells.push(cellContent);
        }
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
      if (rows.length > 0) {
        tables.push(rows);
      }
    }

    // 2. Identify and parse the Schema Configuration Table
    let name = '';
    let description = '';
    let price = '';
    let originalPrice = '';
    let stock = '10';
    let category = '';
    let image = '';
    let images: string[] = [];

    const normalizeKey = (str: string): string => {
      const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.includes('productname') || clean === 'title' || clean === 'name' || clean === 'product') {
        return 'productname';
      }
      if (clean.includes('description')) {
        return 'description';
      }
      if (clean.includes('originalprice')) {
        return 'originalprice';
      }
      if (clean.includes('price')) {
        return 'price';
      }
      if (clean.includes('stock') || clean.includes('inventory')) {
        return 'inventorystock';
      }
      if (clean.includes('category')) {
        return 'category';
      }
      if (clean.includes('mainimage') || clean.includes('image')) {
        return 'mainimage';
      }
      if (clean.includes('galleryimage') || clean.includes('gallery')) {
        return 'galleryimages';
      }
      return clean;
    };

    const targetKeys = [
      'productname',
      'description',
      'price',
      'originalprice',
      'inventorystock',
      'category',
      'mainimage',
      'galleryimages',
    ];

    let schemaTable: string[][] | null = null;
    for (const table of tables) {
      const hasSchemaKeys = table.some((row) => {
        if (!row[0]) return false;
        const norm = normalizeKey(row[0]);
        return targetKeys.includes(norm);
      });
      if (hasSchemaKeys) {
        schemaTable = table;
        break;
      }
    }

    if (schemaTable) {
      let i = 0;
      while (i < schemaTable.length) {
        const row = schemaTable[i];
        if (row.length < 1) { i++; continue; }
        const rawKey = row[0];
        const normKey = normalizeKey(rawKey);
        if (!normKey || !targetKeys.includes(normKey)) { i++; continue; }

        // For 5-col schema table, col index 3 = Sample Data; fallback to col 1 if 3 is empty/placeholder
        let rawValue = '';
        if (row.length >= 4 && row[3]?.trim()) {
          rawValue = row[3].trim();
          // If sample data looks like a placeholder [See Full Description Below], skip
          if (rawValue.startsWith('[See') || rawValue.toLowerCase().includes('see full description')) {
            rawValue = '';
          }
        }
        if (!rawValue && row[1]?.trim()) {
          rawValue = row[1].trim();
        }

        // Accumulate continuation rows (where first cell is blank — mammoth wraps long cell content)
        let j = i + 1;
        while (j < schemaTable.length) {
          const next = schemaTable[j];
          const nextKey = (next[0] || '').trim();
          const nextNormKey = normalizeKey(nextKey);
          if (nextKey && targetKeys.includes(nextNormKey)) break; // next real key
          // blank first cell = continuation of current value
          const extra = (next[3] || next[1] || '').trim();
          if (extra) rawValue = (rawValue ? rawValue + ' ' : '') + extra;
          j++;
        }
        i = j;

        const value = rawValue.trim();
        switch (normKey) {
          case 'productname': name = value; break;
          case 'description': description = value; break;
          case 'price': price = value; break;
          case 'originalprice': originalPrice = value; break;
          case 'inventorystock': stock = value; break;
          case 'category': category = value; break;
          case 'mainimage': image = value; break;
          case 'galleryimages':
            if (value) {
              try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                  images = parsed.map(x => String(x).trim());
                } else {
                  images = [value];
                }
              } catch (e) {
                const cleaned = value.replace(/[\[\]"']/g, '').trim();
                images = cleaned.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean);
              }
            }
            break;
        }
      }
    }

    if (!name) {
      // Fallback: extract the first H1 or H2 heading as the product name
      const headingMatch = html.match(/<h[1-2][^>]*>([\s\S]*?)<\/h[1-2]>/i);
      if (headingMatch) {
        name = headingMatch[1].replace(/<[^>]*>/g, '').trim();
      }
    }

    // 3. Identify and parse the Technical Specifications Table
    const specifications: Record<string, string> = {};
    for (const table of tables) {
      if (table === schemaTable) continue;
      
      const firstRow = table[0];
      const isSpecTable =
        (firstRow && firstRow[0]?.toLowerCase().includes('specification key')) ||
        (table.length > 1 && table.every((row) => row.length === 2) && table.some((row) => row[0]?.toLowerCase() === 'brand'));

      if (isSpecTable) {
        for (const row of table) {
          if (row.length < 2) continue;
          const key = row[0].trim();
          const val = row[1].trim();

          // Skip headers
          if (
            key.toLowerCase().includes('specification key') ||
            key.toLowerCase() === 'brand' && val.toLowerCase() === 'sameili' && firstRow === row
          ) {
            continue;
          }
          if (key && val) {
            specifications[key] = val;
          }
        }
      }
    }

    // 4. Extract SEO Metadata
    let seoTitle = '';
    let seoDescription = '';
    let seoKeywords = '';

    const paragraphMatches = html.matchAll(/<(?:p|li)[^>]*>([\s\S]*?)<\/(?:p|li)>/gi);
    for (const pMatch of paragraphMatches) {
      const text = pMatch[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      const titleMatch = text.match(/metaTitle:\s*(.*)/i);
      if (titleMatch) seoTitle = titleMatch[1].trim();

      const descMatch = text.match(/metaDescription:\s*(.*)/i);
      if (descMatch) seoDescription = descMatch[1].trim();

      const keywordsMatch = text.match(/metaKeywords:\s*(.*)/i);
      if (keywordsMatch) seoKeywords = keywordsMatch[1].trim();
    }

    // 5. Extract Raw Markdown Content (Section 3) if present
    const headingRegex = /<h[1-6][^>]*>[^<]*?(?:3\.\s*)?Raw\s+Markdown\s+Content[\s\S]*?<\/h[1-6]>/i;
    const headingMatch = html.match(headingRegex);
    if (headingMatch) {
      const headingIndex = html.indexOf(headingMatch[0]);
      const afterHeadingHtml = html.substring(headingIndex + headingMatch[0].length);

      let textContent = afterHeadingHtml
        .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (match, p1) => {
          const cleanText = p1.replace(/<[^>]*>/g, '').trim();
          return `\n\n### ${cleanText}\n\n`;
        })
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (match, p1) => {
          const cleanText = p1.replace(/<[^>]*>/g, '').trim();
          if (cleanText.startsWith('-') || cleanText.startsWith('*')) {
            return `${cleanText}\n`;
          }
          return `- ${cleanText}\n`;
        })
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, p1) => {
          const cleanText = p1.replace(/<[^>]*>/g, '').trim();
          return `${cleanText}\n\n`;
        })
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      textContent = textContent.replace(/\n{3,}/g, '\n\n');

      if (textContent) {
        description = textContent;
      }
    }

    // Format category string (clean up crumbs if category format was like "Car Accessories > Interior")
    if (category.includes('>')) {
      const parts = category.split('>');
      category = parts[parts.length - 1].trim();
    }

    return NextResponse.json({
      success: true,
      data: {
        name,
        description,
        price,
        originalPrice,
        stock,
        category,
        image,
        images,
        specifications,
        seoTitle,
        seoDescription,
        seoKeywords,
      },
    });
  } catch (error: any) {
    console.error('Error parsing document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred while parsing the document.' },
      { status: 500 }
    );
  }
}
