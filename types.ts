
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface BrainState {
  charge: number; // 0 to 100
  depth: number;  // level of the concept 1-5
  currentConcept: string;
}

export interface ChatSession {
  messages: Message[];
  brainState: BrainState;
}
