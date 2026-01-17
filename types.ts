export interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  transport?: string;
  notes?: string;
}

export interface DayPlan {
  id: string;
  date: string;
  dayOfWeek: string;
  weather?: {
    temp: string;
    condition: string;
    outfit: string;
  };
  items: ItineraryItem[];
}

export interface FoodRecommendation {
  name: string;
  localName: string; // Changed from hangul to generic
  reason: string;
  price: string;
}

export interface ActivityRecommendation {
  name: string;
  localName: string; // Changed from hangul to generic
  description: string;
  tips: string;
}

export interface TranslationResult {
  original: string; // Changed from korean
  pronunciation: string; // Changed from romaji
}

export enum Tab {
  ITINERARY = 'ITINERARY',
  AI_CONCIERGE = 'AI_CONCIERGE',
  CHECKLIST = 'CHECKLIST'
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'Document' | 'Clothing' | 'Electronics' | 'Toiletries' | 'App & Guide';
}

export interface ItineraryProps {
  plans: DayPlan[];
  onUpdatePlans: (newPlans: DayPlan[]) => void;
  onReset: () => void;
  destination: string; // Pass destination to context
}

export interface TripProfile {
  destination: string; // New field
  dates: string;
  hotel: string;
  travelerType: string;
  interests: string;
  mustVisit: string;
  foodPrefs: string;
}