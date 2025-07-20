import React from "react";

interface FormattedDescriptionProps {
  description: string;
  maxLines?: number;
  className?: string;
}

export function FormattedDescription({ 
  description, 
  maxLines = 3, 
  className = "" 
}: FormattedDescriptionProps) {
  if (!description || description.trim() === '') {
    return null;
  }

  // Additional client-side cleaning for any remaining artifacts
  const cleanText = description
    // Remove any remaining HTML-like patterns
    .replace(/<[^>]*>/g, '')
    // Remove common metadata patterns that might have been missed
    .replace(/^(instructor|max|limit|capacity|register)[:\s]*[^\n]*/gmi, '')
    // Remove standalone URLs
    .replace(/^https?:\/\/[^\s]+$/gm, '')
    // Remove lines that are just metadata
    .replace(/^[a-zA-Z\s]*:\s*\d+$/gm, '')
    // Clean up multiple spaces and line breaks
    .replace(/\n\s*\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    return null;
  }

  // Split into sentences for better truncation
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // If we have sentences, show first few complete sentences
  let displayText = cleanText;
  if (sentences.length > 1 && maxLines <= 3) {
    // For cards, show first 1-2 sentences
    const sentenceLimit = maxLines <= 2 ? 1 : 2;
    displayText = sentences.slice(0, sentenceLimit).join('. ').trim();
    if (displayText && !displayText.match(/[.!?]$/)) {
      displayText += '.';
    }
  }

  const lineClampClass = `line-clamp-${maxLines}`;

  return (
    <p className={`text-muted-foreground text-sm ${lineClampClass} ${className}`}>
      {displayText}
    </p>
  );
}

export default FormattedDescription;
