import type { CharacterProfile, CharacterStats, CharacterResources } from "../../../database/schema";

export interface User {
  id: string;
  email?: string;
  name?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserSession {
  user: User;
  character: CharacterProfile;
  stats: CharacterStats[];
  resources: CharacterResources;
}

export interface UserContextType {
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsCharacterCreation: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  createCharacter: (characterData: any) => Promise<void>;
  updateCharacter: (updates: Partial<CharacterProfile>) => Promise<void>;
  updateResources: (updates: Partial<CharacterResources>) => Promise<void>;
}