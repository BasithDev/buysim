/** Read an SSE stream, yielding each parsed JSON event. */
export async function* readSseEvents(res: Response): AsyncGenerator<unknown, void, undefined> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6);
      try {
        yield JSON.parse(raw);
      } catch { /* skip malformed */ }
    }
  }
}
