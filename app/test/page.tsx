"use client";
import { useState, useRef, useEffect, forwardRef } from 'react';

interface LogEntry { step: number; message: string; done?: boolean; error?: boolean; durationMs?: number; subStep?: number; subTotal?: number; }
interface ProductData { title: string; brand: string; asin: string; url: string; price: string; originalPrice: string; rating: string; reviewCount: number; category: string[]; productType: string; specifications: Record<string, string>; features: string[]; images: string[]; searchQuery: string; }
interface NormalizedProduct { asin: string; title: string; brand: string; price: number; currency: string; originalPrice: number; rating: number; reviewCount: number; capacity: string; material: string; keySpecs: Record<string, string>; }
interface ComparisonResult { normalizedProducts: NormalizedProduct[]; insights: { strengths: string[]; weaknesses: string[]; improvements: string[]; summary: string; }; }
interface AnalysisResult { mainProduct: ProductData; competitors: ProductData[]; comparison: ComparisonResult; meta: { totalScrapes: number; competitorAsins: string[]; timeTakenMs: number }; }

const STEPS = [
  { icon: '🔍', label: 'Getting Details' },
  { icon: '🧠', label: 'Analyzing' },
  { icon: '🔎', label: 'Finding Rivals' },
  { icon: '⚔️', label: 'Comparing' },
  { icon: '📊', label: 'AI Insights' },
  { icon: '✅', label: 'Complete' },
];

export default function TestScrape() {
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight); }, [logs]);

  const handleAnalyze = async () => {
    setLoading(true); setResult(null); setLogs([]); setError(''); setActiveStep(0);
    try {
      const res = await fetch('/api/test-scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(part.slice(6));
            if (ev.type === 'progress') { setActiveStep(ev.step); setLogs(p => [...p, ev]); }
            else if (ev.type === 'complete') setResult(ev.data);
            else if (ev.type === 'error') setError(ev.message);
          } catch {}
        }
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, margin: 0 }}>🔬 BuySim Analysis Lab</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: '0.95rem' }}>Paste an Amazon URL to get instant competitive intelligence</p>
        <div style={{ maxWidth: 680, margin: '24px auto 0', display: 'flex', gap: 8 }}>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.amazon.com/dp/..."
            style={{ flex: 1, padding: '14px 18px', borderRadius: 12, border: 'none', fontSize: '1rem', outline: 'none', background: 'rgba(255,255,255,0.95)' }} />
          <button onClick={handleAnalyze} disabled={loading || !url}
            style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: loading ? '#555' : '#e94560', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {(logs.length > 0 || loading) && <ProgressLog logs={logs} activeStep={activeStep} loading={loading} ref={logRef} />}
        {error && <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: 12, padding: 16, color: '#c33', marginBottom: 24 }}>{error}</div>}

        {result && (
          <>
            <ProductCard product={result.mainProduct} isMain />
            {result.comparison && <InsightsPanel insights={result.comparison.insights} />}
            {result.comparison?.normalizedProducts?.length > 1 && <NormalizedTable products={result.comparison.normalizedProducts} />}
            {result.competitors.length > 0 && <FullComparisonTable main={result.mainProduct} competitors={result.competitors} />}
            <details style={{ marginTop: 24, background: '#fff', borderRadius: 12, border: '1px solid #e0e0e0' }}>
              <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 600, color: '#666' }}>📄 Raw JSON</summary>
              <pre style={{ padding: 16, overflow: 'auto', maxHeight: 400, fontSize: 11, background: '#fafafa' }}>{JSON.stringify(result, null, 2)}</pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Progress Log ── */
const ProgressLog = forwardRef<HTMLDivElement, { logs: LogEntry[]; activeStep: number; loading: boolean }>(
  ({ logs, activeStep, loading }, ref) => {
    const latest = new Map<string, LogEntry>();
    logs.forEach(l => latest.set(l.subStep ? `${l.step}-${l.subStep}` : `${l.step}`, l));
    const display = [...latest.values()];

    return (
      <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => {
            const num = i + 1;
            const active = activeStep === num && loading;
            const done = activeStep > num || (activeStep === num && !loading);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20,
                background: active ? 'rgba(233,69,96,0.2)' : done ? 'rgba(0,200,120,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${active ? '#e94560' : done ? '#00c878' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.3s' }}>
                <span style={{ fontSize: 13 }}>{s.icon}</span>
                <span style={{ fontSize: 11, color: active ? '#e94560' : done ? '#00c878' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.label}</span>
                {active && <span className="spinner" />}
                {done && <span style={{ color: '#00c878', fontSize: 13 }}>✓</span>}
              </div>
            );
          })}
        </div>
        <div ref={ref} style={{ maxHeight: 180, overflow: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
          {display.map((l, i) => (
            <div key={i} style={{ padding: '3px 0', color: l.error ? '#ff6b6b' : l.done ? '#00c878' : 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'space-between', animation: 'fadeIn 0.3s' }}>
              <span><span style={{ opacity: 0.5, marginRight: 8 }}>{l.error ? '✗' : l.done ? '✓' : '›'}</span>{l.message}</span>
              {l.durationMs && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, flexShrink: 0, marginLeft: 12 }}>{(l.durationMs / 1000).toFixed(1)}s</span>}
            </div>
          ))}
          {loading && <div style={{ color: 'rgba(255,255,255,0.4)', padding: '3px 0' }}><span className="blink">▌</span></div>}
        </div>
        <style>{`
          .spinner{display:inline-block;width:11px;height:11px;border:2px solid rgba(233,69,96,0.3);border-top-color:#e94560;border-radius:50%;animation:spin .8s linear infinite}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
          .blink{animation:blink 1s step-end infinite}
          @keyframes blink{50%{opacity:0}}
        `}</style>
      </div>
    );
  }
);
ProgressLog.displayName = 'ProgressLog';

/* ── Product Card ── */
function ProductCard({ product, isMain }: { product: ProductData; isMain?: boolean }) {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = product.images?.length ? product.images : [];
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: isMain ? '2px solid #e94560' : '1px solid #e0e0e0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>{isMain ? '📦' : '⚔️'}</span>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: isMain ? '#e94560' : '#333' }}>{isMain ? 'Your Product' : 'Competitor'}</h2>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {imgs.length > 0 && (
          <div style={{ width: 200, flexShrink: 0 }}>
            <img src={imgs[imgIdx]} alt={product.title} style={{ width: '100%', height: 200, objectFit: 'contain', borderRadius: 12, background: '#f8f8f8', border: '1px solid #eee' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            {imgs.length > 1 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {imgs.slice(0, 5).map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                    style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, border: i === imgIdx ? '2px solid #e94560' : '1px solid #ddd', cursor: 'pointer', background: '#f8f8f8' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 280 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 }}>{product.title}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <Pill label="Brand" value={product.brand} />
            <Pill label="Price" value={product.price} color="#00875a" />
            <Pill label="MRP" value={product.originalPrice} strike />
            <Pill label="Rating" value={product.rating ? `${product.rating} ⭐` : ''} />
            <Pill label="Reviews" value={product.reviewCount?.toLocaleString()} />
            <Pill label="ASIN" value={product.asin} />
          </div>
          {product.features?.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#555', lineHeight: 1.6 }}>
              {product.features.slice(0, 4).map((f, i) => <li key={i}>{f.length > 120 ? f.substring(0, 120) + '...' : f}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value, color, strike }: { label: string; value: any; color?: string; strike?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '6px 12px' }}>
      <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: color || '#333', textDecoration: strike ? 'line-through' : 'none' }}>{value}</div>
    </div>
  );
}

/* ── AI Insights Panel ── */
function InsightsPanel({ insights }: { insights: ComparisonResult['insights'] }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)', borderRadius: 16, padding: 24, marginBottom: 24, color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>🤖</span>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>AI Competitive Insights</h2>
      </div>
      {insights.summary && (
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', marginBottom: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: 12, borderLeft: '3px solid #e94560' }}>
          {insights.summary}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <InsightCard icon="💪" title="Strengths" items={insights.strengths} color="#00c878" />
        <InsightCard icon="⚠️" title="Weaknesses" items={insights.weaknesses} color="#ff6b6b" />
        <InsightCard icon="🚀" title="Improvements" items={insights.improvements} color="#4ecdc4" />
      </div>
    </div>
  );
}

function InsightCard({ icon, title, items, color }: { icon: string; title: string; items: string[]; color: string }) {
  if (!items?.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, border: `1px solid rgba(255,255,255,0.1)` }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color }}>{icon} {title}</h3>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
        {items.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
      </ul>
    </div>
  );
}

/* ── Normalized Comparison Table ── */
function NormalizedTable({ products }: { products: NormalizedProduct[] }) {
  if (!products?.length) return null;
  const best = {
    price: Math.min(...products.map(p => p.price).filter(p => p > 0)),
    rating: Math.max(...products.map(p => p.rating)),
    reviews: Math.max(...products.map(p => p.reviewCount)),
  };

  const allSpecKeys = new Set<string>();
  products.forEach(p => Object.keys(p.keySpecs || {}).forEach(k => allSpecKeys.add(k)));

  const rows: { label: string; getValue: (p: NormalizedProduct) => string; isBest?: (p: NormalizedProduct) => boolean }[] = [
    { label: 'Brand', getValue: p => p.brand || '—' },
    { label: 'Price', getValue: p => p.price ? `${p.currency}${p.price.toFixed(2)}` : '—', isBest: p => p.price === best.price && p.price > 0 },
    { label: 'Original Price', getValue: p => p.originalPrice ? `${p.currency}${p.originalPrice.toFixed(2)}` : '—' },
    { label: 'Rating', getValue: p => p.rating ? `${p.rating} ⭐` : '—', isBest: p => p.rating === best.rating && p.rating > 0 },
    { label: 'Reviews', getValue: p => p.reviewCount ? p.reviewCount.toLocaleString() : '—', isBest: p => p.reviewCount === best.reviews && p.reviewCount > 0 },
    { label: 'Capacity', getValue: p => p.capacity || '—' },
    { label: 'Material', getValue: p => p.material || '—' },
    ...[...allSpecKeys].map(k => ({ label: k.replace(/_/g, ' '), getValue: (p: NormalizedProduct) => p.keySpecs?.[k] || '—' })),
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>📊</span>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Normalized Comparison</h2>
        <span style={{ fontSize: 12, color: '#00875a', marginLeft: 'auto', fontWeight: 600 }}>● Best in category</span>
      </div>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
          <thead>
            <tr>
              <th style={thStyle}>Factor</th>
              {products.map((p, i) => (
                <th key={i} style={{ ...thStyle, color: i === 0 ? '#e94560' : '#333', background: i === 0 ? 'rgba(233,69,96,0.06)' : '#fafafa', minWidth: 180 }}>
                  {i === 0 ? '🏠 Your Product' : `⚔️ Competitor ${i}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={labelStyle}>Title</td>
              {products.map((p, i) => (
                <td key={i} style={{ ...cellStyle, background: i === 0 ? 'rgba(233,69,96,0.03)' : undefined, fontSize: 12, fontWeight: 600 }}>
                  {p.title?.length > 60 ? p.title.substring(0, 60) + '...' : p.title || '—'}
                </td>
              ))}
            </tr>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td style={labelStyle}>{row.label}</td>
                {products.map((p, i) => {
                  const isBest = row.isBest?.(p);
                  return (
                    <td key={i} style={{ ...cellStyle, background: i === 0 ? 'rgba(233,69,96,0.03)' : undefined, color: isBest ? '#00875a' : '#333', fontWeight: isBest ? 700 : 400 }}>
                      {row.getValue(p)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', background: '#fafafa', fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #eee' };
const labelStyle: React.CSSProperties = { padding: '10px 14px', fontWeight: 600, fontSize: 12, color: '#666', textTransform: 'capitalize', borderBottom: '1px solid #f0f0f0', background: '#fafafa', position: 'sticky' as const, left: 0 };
const cellStyle: React.CSSProperties = { padding: '10px 14px', borderBottom: '1px solid #f0f0f0', fontSize: 13, verticalAlign: 'top' };

/* ── Full Detail Table (raw data) ── */
function FullComparisonTable({ main, competitors }: { main: ProductData; competitors: ProductData[] }) {
  const all = [main, ...competitors];
  const allSpecKeys = new Set<string>();
  all.forEach(p => Object.keys(p.specifications || {}).forEach(k => allSpecKeys.add(k)));

  return (
    <details style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
      <summary style={{ padding: '16px 20px', cursor: 'pointer', fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>
        📋 Full Raw Comparison (all specs)
      </summary>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
          <thead>
            <tr>
              <th style={thStyle}>Factor</th>
              {all.map((p, i) => <th key={i} style={{ ...thStyle, color: i === 0 ? '#e94560' : '#333', minWidth: 180 }}>{i === 0 ? '🏠 Yours' : `⚔️ #${i}`}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Image', render: (p: ProductData) => p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 8 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : '—' },
              { label: 'Title', render: (p: ProductData) => p.title || '—' },
              { label: 'Brand', render: (p: ProductData) => p.brand || '—' },
              { label: 'Price', render: (p: ProductData) => p.price || '—' },
              { label: 'Rating', render: (p: ProductData) => p.rating ? `${p.rating} ⭐` : '—' },
              { label: 'Reviews', render: (p: ProductData) => p.reviewCount?.toLocaleString() || '—' },
              { label: 'Features', render: (p: ProductData) => p.features?.length ? <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11 }}>{p.features.slice(0, 3).map((f, i) => <li key={i}>{f.length > 60 ? f.substring(0, 60) + '...' : f}</li>)}</ul> : '—' },
              ...[...allSpecKeys].map(k => ({ label: k.replace(/_/g, ' '), render: (p: ProductData) => p.specifications?.[k] || '—' })),
            ].map((row, ri) => (
              <tr key={ri}>
                <td style={labelStyle}>{row.label}</td>
                {all.map((p, i) => <td key={i} style={{ ...cellStyle, background: i === 0 ? 'rgba(233,69,96,0.03)' : undefined, fontSize: 12 }}>{row.render(p)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
