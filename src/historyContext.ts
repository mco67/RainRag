/* eslint-disable @typescript-eslint/no-explicit-any */
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { Message } from 'rainbow-node-sdk/lib/common/models/Message.js'


export class HistoryContext {

    public messages: AIMessage|HumanMessage[] = [];
    private maxSize = 10;

    public static create(historyMessages?: Message[]): HistoryContext { 
        const historyContext = new HistoryContext(); 
        historyMessages?.forEach(historyMessage => historyContext.addMessage(historyMessage.content, historyMessage.side));
        return historyContext
    }

    public addMessage(message: string, side: string): void {
        const messageClass = side === 'L' ? HumanMessage : AIMessage;
        if (this.messages.length === this.maxSize) this.messages.shift();
        this.messages.push(new messageClass(message));
    }

    public addAIMessage(aiMessage: AIMessage): void {
        if (this.messages.length === this.maxSize) this.messages.shift();
        this.messages.push(aiMessage);
    }
}