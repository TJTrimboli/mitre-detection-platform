import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Matrix, Tactic, Technique, SubTechnique, DetectionFormat } from '../types';

interface AttackState {
  matrices: Matrix[];
  selectedMatrix: string | null;
  selectedTactic: string | null;
  selectedTechnique: string | null;
  selectedFormat: DetectionFormat;
  setMatrices: (matrices: Matrix[]) => void;
  setSelectedMatrix: (id: string | null) => void;
  setSelectedTactic: (id: string | null) => void;
  setSelectedTechnique: (id: string | null) => void;
  setSelectedFormat: (format: DetectionFormat) => void;
  updateTactics: (matrixId: string, tactics: Tactic[]) => void;
  updateTechniques: (tacticId: string, techniques: Technique[]) => void;
  updateSubTechniques: (techniqueId: string, subTechniques: SubTechnique[]) => void;
}

export const useAttackStore = create<AttackState>()(
  persist(
    (set) => ({
      matrices: [],
      selectedMatrix: null,
      selectedTactic: null,
      selectedTechnique: null,
      selectedFormat: 'sigma',
      setMatrices: (matrices) => set({ matrices }),
      setSelectedMatrix: (id) => set({ selectedMatrix: id }),
      setSelectedTactic: (id) => set({ selectedTactic: id }),
      setSelectedTechnique: (id) => set({ selectedTechnique: id }),
      setSelectedFormat: (format) => set({ selectedFormat: format }),
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
    }
  )
);