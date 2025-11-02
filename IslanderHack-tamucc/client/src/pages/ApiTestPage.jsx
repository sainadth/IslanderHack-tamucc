import { useState } from 'react';
import { apiService } from '../services/apiService';

export default function ApiTestPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runTest = async (testName, testFn) => {
    setLoading(true);
    setError('');
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (err) {
      setError(`${testName} failed: ${err.message}`);
      setResults(prev => ({ ...prev, [testName]: { error: err.message } }));
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: 'Health Check',
      fn: () => apiService.healthCheck()
    },
    {
      name: 'Geocode ZIP 78401',
      fn: () => apiService.geocode('78401')
    },
    {
      name: 'Find Shelters',
      fn: () => apiService.findShelters('78401', { radius: 5000, max_results: 3 })
    },
    {
      name: 'Evacuation Route',
      fn: () => apiService.getEvacuationRoute('78401')
    },
    {
      name: 'Traffic Route to San Antonio',
      fn: () => apiService.getRoute('78401', 'San Antonio, TX')
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4 text-slate-800">
            🧪 API Integration Test Suite
          </h1>
          <p className="text-slate-600 mb-6">
            Test the connection between React client and Node.js server
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">❌ {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {tests.map(test => (
              <button
                key={test.name}
                onClick={() => runTest(test.name, test.fn)}
                disabled={loading}
                className="px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-lg transition font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {test.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              tests.forEach((test, i) => {
                setTimeout(() => runTest(test.name, test.fn), i * 1000);
              });
            }}
            disabled={loading}
            className="w-full px-6 py-4 bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-lg transition font-bold shadow-lg"
          >
            🚀 Run All Tests
          </button>
        </div>

        {/* Results Display */}
        <div className="space-y-4">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-linear-to-r from-slate-700 to-slate-800 px-6 py-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                  {result.error ? '❌' : '✅'}
                  {testName}
                </h3>
              </div>
              <div className="p-6">
                <pre className="bg-slate-50 rounded-lg p-4 overflow-auto max-h-96 text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(results).length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-slate-400 text-lg">
              Click a test button to see results here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
