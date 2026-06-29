export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string[];
  fonts: {
    primary: string;
    accent: string;
  };
}

export interface PhotoItem {
  id: number;
  url: string;
  title: string;
  description: string;
  date: string;
}

export interface WishItem {
  text: string;
  sender: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
  image: string;
}

export interface PersonalLetterConfig {
  paragraphs: string[];
  signature: string;
}

export interface CakeStyleConfig {
  layers: number;
  frostingColor: string;
  candleCount: number;
}

export interface BirthdayConfig {
  recipientName: string;
  secretCode?: string;
  birthdayDate: string;
  theme: ThemeConfig;
  music: {
    bgMusicUrl: string;
    giftOpenSfx: string;
    clickSfx: string;
    confettiSfx: string;
    fireworksSfx: string;
  };
  photos: PhotoItem[];
  wishes: WishItem[];
  timeline: TimelineItem[];
  personalLetter: PersonalLetterConfig;
  cakeStyle: CakeStyleConfig;
}
