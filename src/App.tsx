import React from 'react';
import { Search, Shield, Code2, Database, FileJson } from 'lucide-react';
import TechniqueList from './components/TechniqueList';
import DetectionViewer from './components/DetectionViewer';
import { useAttackStore } from './lib/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  const { selectedTechnique, selectedFormat, setSelectedFormat } = useAttackStore();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">MITRE ATT&CK Detection Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2">
                <FileJson className="h-4 w-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Technique Browser */}
            <div className="col-span-4 bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search techniques..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <TechniqueList />
            </div>

            {/* Main Content - Detection Viewer */}
            <div className="col-span-8 bg-white rounded-lg shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Code2 className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold">Detection Rules</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as any)}
                    className="border rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
    </QueryClientProvider>
  );
}

export default App;