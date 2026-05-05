'use client';

import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { type AnalysisResult } from '@/lib/types';

interface ExportReportProps {
  result: AnalysisResult;
}

export default function ExportReport({ result }: ExportReportProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const generateText = () => {
    const { mainProduct, competitors, comparison } = result;
    const lines = [
      `BuySim Analysis Report`,
      `Product: ${mainProduct.title}`,
      `ASIN: ${mainProduct.asin}`,
      `Brand: ${mainProduct.brand}`,
      `Price: ${mainProduct.price}`,
      `Rating: ${mainProduct.rating} (${mainProduct.reviewCount?.toLocaleString()} reviews)`,
      ``,
      `Listing Grade: ${comparison.grade || 'N/A'}`,
      `Listing Score: ${comparison.listingScore?.overall || 'N/A'}/100`,
      `- Visual Clarity: ${comparison.listingScore?.visualClarity || 'N/A'}/100`,
      `- Information Hierarchy: ${comparison.listingScore?.informationHierarchy || 'N/A'}/100`,
      `- Compelling CTA: ${comparison.listingScore?.compellingCta || 'N/A'}/100`,
      ``,
      `Strengths:`,
      ...comparison.insights?.strengths?.map((s) => `  ✓ ${s}`) || [],
      ``,
      `Weaknesses:`,
      ...comparison.insights?.weaknesses?.map((w) => `  ✗ ${w}`) || [],
      ``,
      `Improvements:`,
      ...comparison.insights?.improvements?.map((i) => `  → ${i}`) || [],
      ``,
    ];

    if (comparison.titleSuggestion) {
      lines.push(`Suggested Title: ${comparison.titleSuggestion}`);
      lines.push('');
    }

    if (comparison.featureBulletSuggestions?.length) {
      lines.push('Suggested Feature Bullets:');
      comparison.featureBulletSuggestions.forEach((b, i) => lines.push(`  ${i + 1}. ${b}`));
      lines.push('');
    }

    if (comparison.keywordGaps?.missingKeywords?.length) {
      lines.push(`Missing Keywords: ${comparison.keywordGaps.missingKeywords.join(', ')}`);
      lines.push('');
    }

    if (comparison.reviewGaps?.competitorPainPoints?.length) {
      lines.push('Customer Pain Points:');
      comparison.reviewGaps.competitorPainPoints.forEach((p) => lines.push(`  • ${p}`));
      lines.push('');
    }

    lines.push(`Summary: ${comparison.insights?.summary || ''}`);
    lines.push(``);
    lines.push(`Competitors Analyzed: ${competitors.length}`);
    competitors.forEach((c, i) => {
      lines.push(`  ${i + 1}. ${c.brand} - ${c.title?.substring(0, 60)}... | ${c.price} | ${c.rating}⭐ (${c.reviewCount?.toLocaleString()})`);
    });

    return lines.filter((l) => l !== null).join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    const text = generateText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buysim-report-${result.mainProduct.asin}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs font-semibold bg-surface-container text-on-surface px-4 py-2 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high hover:border-outline-variant transition-all"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy Report'}
      </button>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 text-xs font-semibold bg-primary-container text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm shadow-primary-container/20"
      >
        <Download size={14} />
        Download
      </button>
    </div>
  );
}
