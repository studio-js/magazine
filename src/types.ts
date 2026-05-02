export type Locale = "ko" | "en";

export type LocalizedText = Record<Locale, string>;

export type LocalizedList = Record<Locale, string[]>;

export type PrimaryCategory = "art" | "tech" | "design" | "philosophy";

export type SubcategoryKey =
  | "exhibitions"
  | "artists"
  | "images"
  | "sound"
  | "ai"
  | "interface"
  | "tools"
  | "systems"
  | "graphic"
  | "product"
  | "space"
  | "brand"
  | "thought"
  | "ethics"
  | "time"
  | "body";

export type VisualClass =
  | "image-atelier"
  | "image-signal"
  | "image-interface"
  | "image-thought"
  | "image-material"
  | "image-system"
  | "image-library"
  | "image-field";

export interface SubcategoryDefinition {
  key: SubcategoryKey;
  label: LocalizedText;
}

export interface CategoryDefinition {
  key: PrimaryCategory;
  label: LocalizedText;
  description: LocalizedText;
  subcategories: SubcategoryDefinition[];
}

export interface ArticleSection {
  heading: LocalizedText;
  paragraphs: LocalizedList;
}

export interface Article {
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  deck: LocalizedText;
  category: PrimaryCategory;
  subcategoryKey: SubcategoryKey;
  subcategoryKeys: SubcategoryKey[];
  subcategory: LocalizedText;
  date: string;
  issue: string;
  readTime: LocalizedText;
  location: LocalizedText;
  heroClass: VisualClass;
  tags: LocalizedList;
  excerpt: LocalizedText;
  quote: LocalizedText;
  sections: ArticleSection[];
}

export interface Note {
  date: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface SiteContent {
  title: LocalizedText;
  description: LocalizedText;
  issue: string;
  month: LocalizedText;
  heroKicker: LocalizedText;
  heroTitle: LocalizedText;
  heroLead: LocalizedText;
  keywords: LocalizedList;
  categories: CategoryDefinition[];
  notes: Note[];
}
