import { simulateBuying, type ProductData, type ComparisonResult } from '@/lib/gemini';

export const maxDuration = 60; // Set Vercel timeout to max (60 seconds)

const BUYER_NAMES = ['Kevin', 'Sarah', 'Marcus', 'Priya', 'Alex', 'Elena', 'David', 'Aisha', 'Tom', 'Mia', 'James', 'Lena'];

function getRandomNames() {
  const shuffled = [...BUYER_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (typeof body !== 'object' || body === null) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { mainProduct, competitors, comparison } = body as {
    mainProduct: ProductData;
    competitors: ProductData[];
    comparison: ComparisonResult;
  };

  if (!mainProduct || !competitors || !comparison) {
    return new Response(JSON.stringify({ error: 'Missing product data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        // Send initial loading state
        send({ type: 'progress', step: 1, total: 3, message: 'Loading product data...', done: true });
        send({ type: 'progress', step: 2, total: 3, message: 'Running buyer simulations...' });

        // This is where Gemini actually processes
        const result = await simulateBuying(mainProduct, competitors, comparison);

        send({ type: 'progress', step: 2, total: 3, message: 'Running buyer simulations...', done: true });
        send({ type: 'progress', step: 3, total: 3, message: 'Compiling results...', done: true });

        // Send random names alongside results
        const names = getRandomNames();
        const data = {
          ...result,
          personaNames: names,
        };

        send({ type: 'complete', data });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Simulation failed';
        send({ type: 'error', message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
