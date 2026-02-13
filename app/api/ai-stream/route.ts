import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    console.log("Received prompt. API Key Present:", !!apiKey);

    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please check your .env file and restart the server.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    let modelName = "gemini-2.5-flash";
    let result;

    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      result = await model.generateContentStream(prompt);
    } catch (firstError: any) {
      console.warn(`Primary model ${modelName} failed, trying fallback...`, firstError.message);
      modelName = "gemini-2.5-flash-lite";
      const model = genAI.getGenerativeModel({ model: modelName });
      result = await model.generateContentStream(prompt);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          console.log(`Stream started using ${modelName}`);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            console.log("Chunk:", text);

            const data = JSON.stringify({ text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          console.log("Stream completed");
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error("Stream error:", error);

          // If we hit an error mid-stream, we can't easily restart the whole Response
          // but we can send an error signal
          const errorData = JSON.stringify({ error: error.message });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("API error details:", error);
    const errorMessage = error.message || "Failed to generate response";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}