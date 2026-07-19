import { useState, useEffect } from 'react'
import httpClient from './api/httpClient'

function App() {
  const [health, setHealth] = useState({ status: 'LOADING...', error: null })

  useEffect(() => {
    httpClient.get('/health')
      .then(response => {
        setHealth({ status: response.data.status || 'OK', error: null })
      })
      .catch(err => {
        console.error('Health check failed:', err)
        setHealth({ 
          status: 'ERROR', 
          error: err.message || 'Could not connect to backend' 
        })
      })
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-secondary p-8 rounded-xl shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">SyncBoard</h1>
        
        <div className="space-y-4">
          <p className="text-text-secondary text-center">
            Frontend is running successfully.
          </p>
          
          <div className={`p-4 rounded-md border ${
            health.status === 'LOADING...' ? 'bg-bg-tertiary border-border' :
            health.status === 'ERROR' ? 'bg-red-50 border-danger text-danger' :
            'bg-green-50 border-success text-success'
          }`}>
            <h2 className="font-semibold mb-2">Backend Connection Status:</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                health.status === 'LOADING...' ? 'bg-warning animate-pulse' :
                health.status === 'ERROR' ? 'bg-danger' :
                'bg-success'
              }`}></div>
              <span className="font-mono text-sm">{health.status}</span>
            </div>
            {health.error && (
              <p className="mt-2 text-xs opacity-80">{health.error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
