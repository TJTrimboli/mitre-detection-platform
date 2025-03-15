import React from 'react';
import { ChevronRight, ChevronDown, Shield, Database, Factory } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { MatrixType } from '../types';
import { useAttackStore } from '../lib/store';
import { fetchMatrices } from '../lib/api';

const MatrixIcon = ({ type }: { type: MatrixType }) => {
  switch (type) {
    case 'enterprise':
      return <Shield className="h-5 w-5" />;
    case 'mobile':
      return <Database className="h-5 w-5" />;
    case 'ics':
      return <Factory className="h-5 w-5" />;
  }
};

const TechniqueList: React.FC = () => {
  const {
    matrices,
    selectedMatrix,
    selectedTactic,
    selectedTechnique,
    setMatrices,
    setSelectedMatrix,
    setSelectedTactic,
    setSelectedTechnique,
  } = useAttackStore();

  const { isLoading } = useQuery({
    queryKey: ['matrices'],
    queryFn: fetchMatrices,
    onSuccess: (data) => {
      setMatrices(data);
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p>Loading MITRE ATT&CK data...</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
      {matrices.map((matrix) => (
        <div key={matrix.id} className="border-b last:border-b-0">
          <button
            onClick={() => setSelectedMatrix(matrix.id)}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between font-medium"
          >
            <div className="flex items-center space-x-2">
              <MatrixIcon type={matrix.type} />
              <span>{matrix.name}</span>
            </div>
            {selectedMatrix === matrix.id ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {selectedMatrix === matrix.id && matrices
            .find(m => m.id === selectedMatrix)
            ?.tactics.map((tactic) => (
              <div key={tactic.id} className="border-t">
                <button
                  onClick={() => setSelectedTactic(tactic.id)}
                  className="w-full text-left px-6 py-2 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">{tactic.name}</div>
                    <div className="text-sm text-gray-500">{tactic.id}</div>
                  </div>
                  {selectedTactic === tactic.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {selectedTactic === tactic.id && tactic.techniques.map((technique) => (
                  <div key={technique.id}>
                    <button
                      onClick={() => setSelectedTechnique(technique.id)}
                      className={`w-full text-left px-8 py-2 hover:bg-gray-50 flex items-center justify-between ${
                        selectedTechnique === technique.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div>
                        <div className="text-sm text-gray-900">{technique.name}</div>
                        <div className="text-xs text-gray-500">{technique.id}</div>
                      </div>
                      {technique.subTechniques.length > 0 && (
                        selectedTechnique === technique.id ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )
                      )}
                    </button>

                    {selectedTechnique === technique.id && technique.subTechniques.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedTechnique(sub.id)}
                        className={`w-full text-left px-12 py-2 hover:bg-gray-50 ${
                          selectedTechnique === sub.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="text-sm text-gray-900">{sub.name}</div>
                        <div className="text-xs text-gray-500">{sub.id}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default TechniqueList;