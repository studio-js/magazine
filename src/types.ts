export type Locale = "ko" | "en";

export type LocalizedText = Record<Locale, string>;

export type LocalizedList = Record<Locale, string[]>;

export type PrimaryCategory = "art" | "tech" | "design" | "space" | "beauty" | "philosophy";

export type SubcategoryKey =
  | "exhibitions"
  | "artists"
  | "images"
  | "sound"
  | "architecture"
  | "interior"
  | "urban"
  | "ai"
  | "interface"
  | "tools"
  | "systems"
  | "graphic"
  | "product"
  | "brand"
  | "skincare"
  | "makeup"
  | "fragrance"
  | "haircare"
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

export type ArticleRailMode = "default" | "image" | "text";

export interface ArticleBlockImage {
  imageClass?: VisualClass;
  image?: string;
}

export type ArticleSectionBlock =
  | {
    type: "paragraph";
    text: LocalizedText;
  }
  | {
    type: "quote";
    text: LocalizedText;
  }
  | {
    type: "gallery";
    images: ArticleBlockImage[];
    caption?: LocalizedText;
  };

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
  blocks?: ArticleSectionBlock[];
  railTitle?: LocalizedText;
  railText?: LocalizedText;
  railClass?: VisualClass;
  railImage?: string;
  hideRailImage?: boolean;
  sectionImageClass?: VisualClass | "";
  sectionImage?: string;
  sectionImageCaption?: LocalizedText;
  hideSectionImage?: boolean;
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
  heroImage?: string;
  hideHeroImage?: boolean;
  tags: LocalizedList;
  excerpt: LocalizedText;
  quote: LocalizedText;
  railMode?: ArticleRailMode;
  railClass?: VisualClass;
  railImage?: string;
  hideRailImage?: boolean;
  railTitle?: LocalizedText;
  railText?: LocalizedText;
  sections: ArticleSection[];
}

export interface Note {
  date: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface IssueCredit {
  label: LocalizedText;
  value: LocalizedText;
}

export interface IssueFeature {
  slug: string;
  role: LocalizedText;
  title: LocalizedText;
  intro: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedList;
  credit: LocalizedText;
  location: LocalizedText;
  readTime: LocalizedText;
  heroClass: VisualClass;
  heroImage?: string;
}

export interface IssueProject {
  number: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  deck: LocalizedText;
  date: LocalizedText;
  format: LocalizedText;
  availability: LocalizedText;
  coverCredit: LocalizedText;
  coverImage?: string;
  editorNote: LocalizedText;
  credits: IssueCredit[];
  features: IssueFeature[];
}

export interface SiteContent {
  title: LocalizedText;
  description: LocalizedText;
  issueProjects: IssueProject[];
  month: LocalizedText;
  heroKicker: LocalizedText;
  heroTitle: LocalizedText;
  heroLead: LocalizedText;
  keywords: LocalizedList;
  categories: CategoryDefinition[];
  notes: Note[];
}
