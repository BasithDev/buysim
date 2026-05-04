"use client";

import { useState } from 'react';

export default function TestScrape() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/test-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scrape failed');
      setResult(data.markdown || JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResult('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-4 mt-20">
      <h1 className="text-2xl font-bold font-display">Dummy Firecrawl Tester</h1>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={url} 
          onChange={e => setUrl(e.target.value)} 
          className="border border-outline-variant p-3 flex-1 rounded-lg focus:outline-none focus:border-primary-container" 
          placeholder="https://amazon.com/dp/..."
        />
        <button 
          onClick={handleScrape} 
          disabled={loading || !url} 
          className="bg-primary-container text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? 'Scraping...' : 'Scrape'}
        </button>
      </div>
      <div className="border border-outline/30 rounded-lg p-4 h-[600px] overflow-auto bg-surface-container-low whitespace-pre-wrap font-data text-xs text-on-surface">
        {result || 'Results will appear here...'}
      </div>
    </div>
  )
}
