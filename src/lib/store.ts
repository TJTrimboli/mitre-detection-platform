import { createWithEqualityFn } from 'zustand/traditional';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Matrix, Tactic, Technique, SubTechnique, DetectionFormat } from '../types';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface PersistedState {
  isDarkMode: boolean;
  selectedFormat: DetectionFormat;
  expandedMatrices: string[];
  expandedTactics: string[];
  expandedTechniques: string[];
}

interface AttackState extends ThemeState {
  matrices: Matrix[];
  selectedMatrix: string | null;
  selectedTactic: string | null;
  selectedTechnique: string | null;
  selectedFormat: DetectionFormat;
  expandedMatrices: string[];
  expandedTactics: string[];
  expandedTechniques: string[];
  setMatrices: (matrices: Matrix[]) => void;
  setSelectedMatrix: (id: string | null) => void;
  setSelectedTactic: (id: string | null) => void;
  setSelectedTechnique: (id: string | null) => void;
  setSelectedFormat: (format: DetectionFormat) => void;
  toggleExpandedMatrix: (id: string) => void;
  toggleExpandedTactic: (id: string) => void;
  toggleExpandedTechnique: (id: string) => void;
  updateTactics: (matrixId: string, tactics: Tactic[]) => void;
  updateTechniques: (tacticId: string, techniques: Technique[]) => void;
  updateSubTechniques: (techniqueId: string, subTechniques: SubTechnique[]) => void;
}

const initialState = {
  isDarkMode: false,
  matrices: [],
  selectedMatrix: null,
  selectedTactic: null,
  selectedTechnique: null,
  selectedFormat: 'sigma' as DetectionFormat,
  expandedMatrices: [] as string[],
  expandedTactics: [] as string[],
  expandedTechniques: [] as string[],
};

const isPersistedState = (state: unknown): state is Partial<PersistedState> => {
  if (typeof state !== 'object' || state === null) return false;
  const s = state as Record<string, unknown>;
  return (
    (typeof s.isDarkMode === 'boolean' || s.isDarkMode === undefined) &&
    (typeof s.selectedFormat === 'string' || s.selectedFormat === undefined) &&
    (Array.isArray(s.expandedMatrices) || s.expandedMatrices === undefined) &&
    (Array.isArray(s.expandedTactics) || s.expandedTactics === undefined) &&
    (Array.isArray(s.expandedTechniques) || s.expandedTechniques === undefined)
  );
};

export const useAttackStore = createWithEqualityFn<AttackState>()(
  persist(
    (set) => ({
      ...initialState,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setMatrices: (matrices) => set({ matrices }),
      setSelectedMatrix: (id) => set({ selectedMatrix: id }),
      setSelectedTactic: (id) => set({ selectedTactic: id }),
      setSelectedTechnique: (id) => set({ selectedTechnique: id }),
      setSelectedFormat: (format) => set({ selectedFormat: format }),
      toggleExpandedMatrix: (id) => set((state) => ({
        expandedMatrices: state.expandedMatrices?.includes(id)
          ? (state.expandedMatrices || []).filter((m) => m !== id)
          : [...(state.expandedMatrices || []), id],
      })),
      toggleExpandedTactic: (id) => set((state) => ({
        expandedTactics: state.expandedTactics?.includes(id)
          ? (state.expandedTactics || []).filter((t) => t !== id)
          : [...(state.expandedTactics || []), id],
      })),
      toggleExpandedTechnique: (id) => set((state) => ({
        expandedTechniques: state.expandedTechniques?.includes(id)
          ? (state.expandedTechniques || []).filter((t) => t !== id)
          : [...(state.expandedTechniques || []), id],
      })),
      updateTactics: (matrixId, tactics) =>
        set((state) => ({
          matrices: state.matrices.map((matrix) =>
            matrix.id === matrixId ? { ...matrix, tactics } : matrix
          ),
        })),
      updateTechniques: (tacticId, techniques) =>
        set((state) => ({
          matrices: state.matrices.map((matrix) => ({
            ...matrix,
            tactics: matrix.tactics.map((tactic) =>
              tactic.id === tacticId ? { ...tactic, techniques } : tactic
            ),
          })),
        })),
      updateSubTechniques: (techniqueId, subTechniques) =>
        set((state) => ({
          matrices: state.matrices.map((matrix) => ({
            ...matrix,
            tactics: matrix.tactics.map((tactic) => ({
              ...tactic,
              techniques: tactic.techniques.map((technique) =>
                technique.id === techniqueId
                  ? { ...technique, subTechniques }
                  : technique
              ),
            })),
          })),
        })),
    }),
    {
      name: 'attack-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        selectedFormat: state.selectedFormat,
        expandedMatrices: state.expandedMatrices || [],
        expandedTactics: state.expandedTactics || [],
        expandedTechniques: state.expandedTechniques || [],
      }),
      merge: (persistedState: unknown, currentState: AttackState): AttackState => {
        if (!isPersistedState(persistedState)) return currentState;
        return {
          ...currentState,
          ...persistedState,
          expandedMatrices: Array.isArray(persistedState.expandedMatrices) ? persistedState.expandedMatrices : [],
          expandedTactics: Array.isArray(persistedState.expandedTactics) ? persistedState.expandedTactics : [],
          expandedTechniques: Array.isArray(persistedState.expandedTechniques) ? persistedState.expandedTechniques : [],
        };
      },
    }
  ),
  Object.is
);