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
    isDarkMode,
    matrices,
    selectedMatrix,
    selectedTactic,
    selectedTechnique,
    setMatrices,
    setSelectedMatrix,
    setSelectedTactic,
    setSelectedTechnique,
  } = useAttackStore();

  const { isLoading, isError, refetch, data } = useQuery({
    queryKey: ['matrices'],
    queryFn: fetchMatrices,
    retry: 2,
  });

  React.useEffect(() => {
    if (data) {
      console.log('Fetched matrices:', data);
      setMatrices(data);
      if (!selectedMatrix && data.length > 0) {
        setSelectedMatrix(data[0].id);
      }
    }
  }, [data, selectedMatrix, setMatrices, setSelectedMatrix]);

  if (isLoading) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p>Loading MITRE ATT&CK data...</p>
      </div>
    );
  }

  if (isError || matrices.length === 0) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="text-red-500 mb-4">
          <span className="block mb-2">⚠️</span>
          <p>Failed to load MITRE ATT&CK data</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
      {matrices.map((matrix) => (
        <div key={matrix.id} className={`border-b last:border-b-0 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => setSelectedMatrix(matrix.id)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between font-medium ${
              isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MatrixIcon type={matrix.type} />
              <span>{matrix.name}</span>
            </div>
            {selectedMatrix === matrix.id ? (
              <ChevronDown className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>

          {selectedMatrix === matrix.id && matrix.tactics.map((tactic) => (
            <div key={tactic.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setSelectedTactic(tactic.id)}
                className={`w-full text-left px-6 py-2 hover:bg-gray-50 flex items-center justify-between ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {tactic.name}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {tactic.id}
                  </div>
                </div>
                {selectedTactic === tactic.id ? (
                  <ChevronDown className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>

              {selectedTactic === tactic.id && tactic.techniques.map((technique) => (
                <div key={technique.id}>
                  <button
                    onClick={() => setSelectedTechnique(technique.id)}
                    className={`w-full text-left px-8 py-2 hover:bg-gray-50 flex items-center justify-between ${
                      selectedTechnique === technique.id 
                        ? isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'
                        : ''
                    } ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <div>
                      <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {technique.name}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {technique.id}
                      </div>
                    </div>
                    {technique.subTechniques.length > 0 && (
                      selectedTechnique === technique.id ? (
                        <ChevronDown className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      ) : (
                        <ChevronRight className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      )
                    )}
                  </button>

                  {selectedTechnique === technique.id && technique.subTechniques.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedTechnique(sub.id)}
                      className={`w-full text-left px-12 py-2 hover:bg-gray-50 ${
                        selectedTechnique === sub.id
                          ? isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'
                          : ''
                      } ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {sub.name}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sub.id}
                      </div>
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