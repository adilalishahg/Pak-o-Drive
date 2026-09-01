/**
 * Theme & UI Customization Types for Pak-o-Drive Platform
 */

export type IconLibrary = 'fontawesome' | 'material' | 'bootstrap' | 'remix' | 'phosphor';

export interface SvgLogoSettings {
  enabled: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  text1: string;
  text2: string;
  fontFamily: string;
  fontWeight: string;
  letterSpacing: number;
  fontSize: number;
  fontStyle: 'normal' | 'italic';
  showIcon: boolean;
  showText: boolean;
  height: number;
  brandName?: string;
  tagline?: string;
  glowEffect?: boolean;
  scale?: number;
  boldness?: '300' | '400' | '600' | '700' | '800' | '900';
  iconStyle?: 'turbo-shield' | 'minimal-car' | 'lightning-bolt' | 'hex-gear' | 'crown-drive';
}

export interface IHeroSlideItem {
  _id?: string;
  enabled: boolean;
  productId?: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageType: 'product' | 'custom';
  imageUrl: string;
  bgGradient?: string;
}

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  fontFamily: string;
  fontSizeBase: string;
  borderRadius: string;
  buttonRadius: string;
  cardRadius: string;
  animationsEnabled: boolean;
  glassmorphismEnabled: boolean;
  shadowIntensity: 'none' | 'light' | 'medium' | 'strong';
  navbarStyle: 'dark' | 'light' | 'gradient';
  footerStyle: 'dark' | 'light';
  heroGradientStart: string;
  heroGradientEnd: string;
  iconLibrary: IconLibrary;
  siteTagline: string;
  announcementBarText: string;
  announcementBarEnabled: boolean;
  layoutTheme: 'classic' | 'modern-green' | 'theme1';
  svgLogo?: SvgLogoSettings;
  homepageSections: {
    heroSlides?: IHeroSlideItem[];
    heroSliderSettings?: {
      autoSlideEnabled?: boolean;
      autoSlideIntervalSec?: number;
      showArrows?: boolean;
      showDots?: boolean;
    };
    heroBig: { enabled: boolean; badge: string; title: string; subtitle: string; buttonText: string; buttonLink: string; imageUrl: string };
    heroSmall: { enabled: boolean; badge: string; title: string; highlight: string; imageUrl: string };
    trendingProducts: { enabled: boolean; title: string; limit: number };
    collections: { enabled: boolean; title: string };
    weeklyDeal: { enabled: boolean; label: string; title: string; description: string; buttonText: string; buttonLink: string; imageUrl: string };
    moreDeals: { enabled: boolean; title: string; limit: number };
    featuredSection: { enabled: boolean; title: string; limit: number };
    valueProps: { enabled: boolean };
    offerBanner1: { enabled: boolean; subtitle: string; title: string; discount: string; buttonLink: string; imageUrl: string };
    offerBanner2: { enabled: boolean; subtitle: string; title: string; discount: string; buttonLink: string; imageUrl: string };
  };
}

export interface ThemeHeaderProps {
  saving: boolean;
  toast: { type: 'success' | 'danger'; message: string } | null;
  onSave: () => Promise<void>;
  onReset: () => void;
}

export interface ThemeLivePreviewProps {
  theme: SiteTheme;
  onSetForm?: React.Dispatch<React.SetStateAction<SiteTheme>>;
}

export interface TypographySectionProps {
  fontFamily: string;
  fontSizeBase: string;
  onSet: <K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => void;
}

export interface LayoutThemeSelectorProps {
  layoutTheme: SiteTheme['layoutTheme'];
  onSelectPreset: (preset: 'classic' | 'modern-green' | 'theme1') => void;
}

export interface NavbarFooterSectionProps {
  form: SiteTheme;
  onSet: <K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => void;
}

export interface HeroSlidesManagerProps {
  form: SiteTheme;
  availableProducts: any[];
  onAddSlide: () => void;
  onUpdateSlide: (idx: number, field: string, val: any) => void;
  onDeleteSlide: (idx: number) => void;
  onMoveSlide: (idx: number, direction: 'up' | 'down') => void;
  onSelectProduct: (idx: number, prodId: string) => void;
  onUpdateSliderSetting: (key: string, val: any) => void;
}

export interface SvgLogoStudioProps {
  svgLogo: SvgLogoSettings | undefined;
  onSetSvgLogo: <K extends keyof SvgLogoSettings>(key: K, val: SvgLogoSettings[K]) => void;
}

export interface ThemeContextValue {
  theme: SiteTheme;
  loading: boolean;
  refresh: () => void;
}

export interface DynamicThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: any;
}

export type ThemeTabKey = 'hero' | 'logo' | 'colors' | 'shapes' | 'nav' | 'all';


