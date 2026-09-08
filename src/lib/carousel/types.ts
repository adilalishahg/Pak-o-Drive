import type { PDFDocument, PDFPage, PDFFont, PDFImage } from 'pdf-lib';

export interface ChartBarItem {
  name: string;
  pct: number;
  isHighlight?: boolean;
}

export interface ColumnChartItem {
  label: string;
  sub?: string;
  pct: number;
  h?: number;
  isHighlight?: boolean;
}

export interface DiagramFlow {
  leftTasks: string[];
  centerUserText?: string;
  centerAgentText?: string;
  rightOutcomes: string[];
}

export interface CardContentBlock {
  badge?: string;
  tagline?: string;
  title?: string;
  subtitle?: string;
  highlightText?: string;
  bodyLines?: string[];
}

export interface CarouselSlide {
  tag?: string;
  headline: string;
  subheadline?: string;
  slideType?: 'cover' | 'intro' | 'stat_card' | 'bar_chart' | 'column_chart' | 'diagram' | 'code_terminal' | 'outro';
  chartData?: ChartBarItem[];
  columnData?: ColumnChartItem[];
  diagramData?: DiagramFlow;
  cardContent?: CardContentBlock;
  codeSnippet?: string;
  points?: string[];
  takeawayQuote?: string;
  footer?: string;
  isCover?: boolean;
  isSummary?: boolean;
}

export interface CarouselDeck {
  topic: string;
  caption: string;
  slides: CarouselSlide[];
}

export interface FontBundle {
  fontBold: PDFFont;
  fontRegular: PDFFont;
  fontCode: PDFFont;
}

export interface SlideRenderContext {
  pdfDoc: PDFDocument;
  page: PDFPage;
  fonts: FontBundle;
  slide: CarouselSlide;
  slideIndex: number;
  totalSlides: number;
  embeddedCoverImage?: PDFImage | null;
}
