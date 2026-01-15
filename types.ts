
export enum PlanType {
  TRADITIONAL = 'TRADITIONAL',
  LEAN = 'LEAN'
}

export interface SectionDetail {
  id: string;
  title: string;
  timestamp?: string;
  description: string;
  icon: string;
}

export interface BusinessContext {
  idea: string;
}
