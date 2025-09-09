"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserContextType, UserSession } from '@/types/user';
import { CharacterService } from '@/lib/character-service';
import type { CharacterCreationData } from '../../components/character/CharacterCreation';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsCharacterCreation, setNeedsCharacterCreation] = useState(false);

  // Initialize user session
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      // For now, we'll create a mock session
      // In a real app, this would check for existing auth tokens and fetch user data
      const mockSession: UserSession = {
        user: {
          id: 'demo-user-1',
          email: 'hero@life-rpg.com',
          name: 'Life Hero',
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        character: {
          id: 'char-1',
          characterName: 'Life Hero',
          characterLevel: 25,
          totalXp: 24500,
          characterClass: 'Life Explorer',
          avatarUrl: null,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        stats: [
          {
            id: 'stat-1',
            statName: 'Productivity',
            baseValue: 75,
            currentValue: 75,
            maxValue: 100,
            statCategory: 'primary' as const,
            updatedAt: new Date(),
          },
          {
            id: 'stat-2',
            statName: 'Wellness',
            baseValue: 68,
            currentValue: 68,
            maxValue: 100,
            statCategory: 'primary' as const,
            updatedAt: new Date(),
          },
          {
            id: 'stat-3',
            statName: 'Social',
            baseValue: 82,
            currentValue: 82,
            maxValue: 100,
            statCategory: 'primary' as const,
            updatedAt: new Date(),
          },
        ],
        resources: {
          id: 'res-1',
          resourceType: 'energy' as const,
          currentValue: 75,
          maxValue: 100,
          regenRate: 5,
          lastUpdated: new Date(),
          modifiers: {},
        },
      };
      
      setSession(mockSession);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Mock sign in - in a real app this would authenticate with Supabase
      console.log('Signing in:', { email, password });
      await initializeSession();
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      // Mock sign up - in a real app this would create user in Supabase
      console.log('Signing up:', { email, password, name });
      await initializeSession();
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // Mock sign out
      console.log('Signing out');
      setSession(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      await initializeSession();
    } catch (error) {
      console.error('Failed to refresh session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharacter = async (updates: Partial<typeof session.character>) => {
    if (!session) return;
    
    try {
      // Mock character update - in a real app this would call API
      console.log('Updating character:', updates);
      setSession({
        ...session,
        character: {
          ...session.character,
          ...updates,
        },
      });
    } catch (error) {
      console.error('Failed to update character:', error);
      throw error;
    }
  };

  const updateResources = async (updates: Partial<typeof session.resources>) => {
    if (!session) return;
    
    try {
      // Mock resources update - in a real app this would call API
      console.log('Updating resources:', updates);
      setSession({
        ...session,
        resources: {
          ...session.resources,
          ...updates,
        },
      });
    } catch (error) {
      console.error('Failed to update resources:', error);
      throw error;
    }
  };

  const createCharacter = async (characterData: CharacterCreationData) => {
    try {
      setIsLoading(true);
      console.log('Creating character:', characterData);
      
      // Use CharacterService to initialize character
      const initializedCharacter = await CharacterService.initializeCharacter({
        characterName: characterData.characterName,
        characterClass: characterData.characterClass,
        age: characterData.age,
      });

      // Create session with initialized character
      const newSession: UserSession = {
        user: {
          id: 'demo-user-1',
          email: 'hero@life-rpg.com',
          name: characterData.characterName,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        character: initializedCharacter.profile,
        stats: initializedCharacter.stats,
        resources: initializedCharacter.resources[0], // Use first resource (energy) as primary
      };

      setSession(newSession);
      setNeedsCharacterCreation(false);
    } catch (error) {
      console.error('Failed to create character:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: UserContextType = {
    session,
    isLoading,
    isAuthenticated: !!session,
    needsCharacterCreation,
    signIn,
    signUp,
    signOut,
    refreshSession,
    createCharacter,
    updateCharacter,
    updateResources,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}