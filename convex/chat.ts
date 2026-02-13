'use node';
import { action } from "./_generated/server.js";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api.js";

export const chat = action({
    args: {
        query: v.string(),
        fileId: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Search for context using the existing search action
        const searchResult = await ctx.runAction(api.myAction.search, {
            query: args.query,
            fileId: args.fileId,
        });

        const contextText = searchResult.map((doc: any) => doc.pageContent).join("\n\n");

        // 2. Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

        const prompt = `
            You are a helpful AI assistant. Answer the user's question based on the provided document context.
            If the answer isn't in the context, use your general knowledge but mention it's not in the document.

            DOCUMENT CONTEXT:
            ${contextText}

            USER QUESTION:
            ${args.query}

            ANSWER:
        `;

        let modelName = "gemini-2.5-flash";
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.warn(`Primary model ${modelName} failed in Convex, trying fallback...`, error.message);
            modelName = "gemini-2.5-flash-lite";
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
    },
});
