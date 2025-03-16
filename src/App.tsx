import React from 'react';
import { Search, Shield, Code2, Moon, Sun } from 'lucide-react';
import TechniqueList from './components/TechniqueList';
import DetectionViewer from './components/DetectionViewer';
import { DetectionFormat } from './types';
import { useAttackStore } from './lib/store';

function App() {
  const {
    isDarkMode,
    toggleDarkMode,
    selectedTechnique,
    selectedFormat,
    setSelectedFormat,
  } = useAttackStore();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className={`h-8 w-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              MITRE ATT&CK Detection Platform
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Technique Browser */}
          <div className={`col-span-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search techniques..."
                  className={`w-full pl-10 pr-4 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
              </div>
            </div>
            <TechniqueList />
          </div>

          {/* Main Content - Detection Viewer */}
          <div className={`col-span-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center space-x-4">
                <Code2 className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Detection Rules
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as DetectionFormat)}
                  className={`border rounded-md px-3 py-1.5 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                >
                  <option value="sigma">Sigma</option>
                  <option value="yara">YARA</option>
                  <option value="kql">KQL</option>
                </select>
              </div>
            </div>
            <DetectionViewer
              technique={selectedTechnique}
              format={selectedFormat}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;