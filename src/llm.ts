/* eslint-disable @typescript-eslint/no-explicit-any */
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable, RunnableSequence } from "@langchain/core/runnables";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import { WeaviateService } from "./weaviate.js";
import { HistoryContext } from "./historyContext.js";
import { AIMessage } from "@langchain/core/messages";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { MISTRAL_API_KEY, INHOUSE_API_KEY }  from "./secret.js";  
// Activer le mode débogage
export class LLMService {

    private weaviateService: WeaviateService;
    private retreiver: VectorStoreRetriever;
    public questionAnswerChain?: Runnable;
    private questionChain: Runnable;
    private questionAnswerPrompt: ChatPromptTemplate;
    private currentModelName: string;
    private llm: any;

    private createMistralLLM(): any {
        try {
            this.currentModelName = "mistral-large-latest"
            return new ChatMistralAI({
                model: this.currentModelName,
                temperature: 0,
                apiKey: MISTRAL_API_KEY
            });
        }
        catch (error) {
            throw new Error(`[RainBot] createMistralLLM() -- failure -- ${error.message}`)
        }
    }

    private createInHouseLLM(): any {
        try {
            //this.currentModelName = 'ibnzterrell/Meta-Llama-3.3-70B-Instruct-AWQ-INT4'; 
            this.currentModelName = '0.llama3.2:3b';

            return new ChatOpenAI({
                model: this.currentModelName,
                apiKey: INHOUSE_API_KEY,
                temperature: 0,
                maxRetries: 2,
                verbose: false,
                configuration: {
                    baseURL: "https://dev-llm.openrainbow.io/ollama/v1",
                    defaultHeaders: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${INHOUSE_API_KEY}` 
                    }
                }
            });
        }
        catch (error) {
            throw new Error(`[RainBot] createInHouseLLM() -- failure -- ${error.message}`)
        }
    }

    public async start(): Promise<LLMService> {
        try {
            this.llm = this.createInHouseLLM();
            this.questionChain = this.createQuestionChain();
            this.questionAnswerPrompt = this.createQuestionAnswerPrompt();
            this.weaviateService = new WeaviateService();
            this.retreiver = await this.weaviateService.retreiver('RainbowDoc');          
            console.info(`== LLMService -- ${this.currentModelName} -- started`);
            return this;
        }
        catch (error) {
            console.error(`== LLMService -- ${this.currentModelName} -- start failure`);
            throw new Error(`[LLMService] start() -- failure\n${error.message}`);
        }
    }

    public async invokeLLM(question: string, historyContext: HistoryContext): Promise<AIMessage> {
        try {
            const input = { question, chat_history: historyContext?.messages, context: undefined };
           
            // Create the history contextualized prompt
            const contextualizedQuestionPrompt = await this.questionChain.invoke(input);
            console.info(`-- contextualizedQuestionPrompt : ${contextualizedQuestionPrompt}`);
            
            // Get the context 
            const documents = await this.retreiver.invoke(contextualizedQuestionPrompt);
            input.context = formatDocumentsAsString(documents);
            
            // Call the LLM
            return RunnableSequence.from([this.questionAnswerPrompt, this.llm]).invoke(input);
        }
        catch (error) {
            throw new Error(`[LLMService] invokeLLM() -- failure -- ${error.message}`);
        }
    }

    private createQuestionAnswerPrompt(): ChatPromptTemplate {

        const questionAnswerSystemPrompt = `You are an assistant named RainBot for question-answering tasks specialized in OpenRainbow Web SDK.
            Use the following pieces of retrieved context to answer the question.
            If you don't know the answer, just say that you don't know.
            Keep the answer concise.
            {context}`;

        return ChatPromptTemplate.fromMessages([
            ["system", questionAnswerSystemPrompt],
            ["placeholder", "{chat_history}"],
            ["human", "{question}"],
        ]);
    }
    
    private createQuestionChain(): Runnable {

        const contextualizeQuestionSystemPrompt = `
        Given a chat history and the latest user questions which might reference context in the chat history, 
        formulate a standalone question which can be understood without the chat history. 
        Never never answer the question, just reformulate it if needed and otherwise return it as is.
        The subject of the message is always in link with Rainbow a webrtc communication platform, 
        when you believe that the subject of the message is not relevant, return the message as is.
        Only returns the reformulate question`;

        const contextualizeQuestionPrompt = ChatPromptTemplate.fromMessages([
            ["system", contextualizeQuestionSystemPrompt],
            ["placeholder", "{chat_history}"],
            ["human", "{question}"]
        ]);

        return contextualizeQuestionPrompt
            .pipe(this.llm)
            .pipe(new StringOutputParser());
    }

}