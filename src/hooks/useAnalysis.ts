import { useState, useRef, useEffect } from 'react';
import { AnalysisResponse, StreamingPhase } from '../types/legal';
import { createCase } from '../lib/caseStorage';
import { auth } from '../lib/firebase';
import { getGuestUser } from '../lib/guestUser';

export const useAnalysis = () => {
  const [result, setResult]                     = useState<AnalysisResponse | null>(null);
  const [savedCaseId, setSavedCaseId]           = useState<string | null>(null);
  const [streamingPhase, setStreamingPhase]     = useState<StreamingPhase>('idle');
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [error, setError]                       = useState<string | null>(null);

  const abortRef    = useRef<AbortController | null>(null);
  const caseTextRef = useRef<string>('');

  const analyze = async (text: string, language: 'en' | 'hi' = 'en') => {
    cancelAnalysis();
    caseTextRef.current = text;
    abortRef.current    = new AbortController();

    setStreamingPhase('thinking');
    setStreamingMessage('Connecting to legal analysis engine…');
    setResult(null);
    setSavedCaseId(null);
    setError(null);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/analyze/stream`,
        {
          method:  'POST',
          headers,
          body:    JSON.stringify({ case_text: text, language }),
          signal:  abortRef.current.signal,
        }
      );

      if (!response.ok) {
        const status = response.status;
        if (status === 429) throw new Error('Rate limit reached. Please wait a moment before retrying.');
        if (status === 503) throw new Error('Analysis service unavailable. Please try again shortly.');
        throw new Error(`Server error (${status}). Please try again.`);
      }

      if (!response.body) throw new Error('No response stream returned.');

      const reader  = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let partial   = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });
        const parts = partial.split('\n\n');
        partial = parts.pop() || '';

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(part.slice(6));

            if (parsed.type === 'thinking') {
              const msg = parsed.message || '';
              setStreamingMessage(msg);
              if (msg.toLowerCase().includes('match') || msg.toLowerCase().includes('section')) {
                setStreamingPhase('matching');
              }
            } else if (parsed.type === 'complete') {
              const data: AnalysisResponse = parsed.data;
              setResult(data);

              // ── Save to Firestore ──────────────────────────
              let userId = auth.currentUser?.uid;
              let userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Anonymous System User';

              if (!userId) {
                const guest = getGuestUser();
                userId = guest.id;
                userName = guest.name;
              }

              if (userId) {
                try {
                  const saved = await createCase(userId, userName, caseTextRef.current, data);
                  setSavedCaseId(saved.id);
                } catch (saveErr) {
                  console.error('Case save failed:', saveErr);
                  setError('Failed to secure encrypted case to ledger. (Firebase Permissions Error)');
                  setStreamingPhase('error');
                  return; // Abort completion
                }
              }
              setStreamingPhase('complete');
            } else if (parsed.type === 'error') {
              setError(parsed.message || 'An error occurred during analysis.');
              setStreamingPhase('error');
            }
          } catch {
            // malformed SSE chunk — skip
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Network connection failed. Is the backend running?');
        setStreamingPhase('error');
      } else {
        setStreamingPhase('idle');
      }
    }
  };

  const cancelAnalysis = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  useEffect(() => () => cancelAnalysis(), []);

  return {
    analyze,
    cancelAnalysis,
    result,
    savedCaseId,
    streamingPhase,
    streamingMessage,
    isStreaming: streamingPhase === 'thinking' || streamingPhase === 'matching',
    error,
  };
};
