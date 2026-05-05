import { simulateBuying } from '@/lib/gemini';

const BUYER_NAMES = ['Kevin', 'Sarah', 'Marcus', 'Priya', 'Alex', 'Elena', 'David', 'Aisha', 'Tom', 'Mia', 'James', 'Lena'];

function getRandomNames() {
  const shuffled = [...BUYER_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { mainProduct, competitors, comparison } = body;

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
        send({ type: 'progress', step: 1, total: 3, message: 'Loading product data...' });

        await new Promise((r) => setTimeout(r, 500));
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
      } catch (err: any) {
        send({ type: 'error', message: err.message || 'Simulation failed' });
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
