/* eslint-disable @typescript-eslint/no-explicit-any */
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts'
import { Runnable, RunnableSequence } from '@langchain/core/runnables'
import { ChatMistralAI } from '@langchain/mistralai'
import { ChatOpenAI } from '@langchain/openai'
import { formatDocumentsAsString } from 'langchain/util/document'
import { WeaviateService } from './weaviate.js'
import { HistoryContext } from './historyContext.js'
import { AIMessage } from '@langchain/core/messages'
import { VectorStoreRetriever } from '@langchain/core/vectorstores'
import { MISTRAL_API_KEY, INHOUSE_API_KEY } from './secret.js'
export class LLMService {
  private weaviateService: WeaviateService
  private retreiver: VectorStoreRetriever
  public questionAnswerChain?: Runnable
  private questionChain: Runnable
  private questionAnswerPrompt: ChatPromptTemplate
  private currentModelName: string
  private llm: any

  private createMistralLLM(): any {
    try {
      this.currentModelName = 'mistral-large-latest'
      return new ChatMistralAI({
        model: this.currentModelName,
        temperature: 0,
        apiKey: MISTRAL_API_KEY,
      })
    }
    catch (error) {
      throw new Error(`[RainBot] createMistralLLM() -- failure -- ${error.message}`)
    }
  }

  private createInHouseLLM(): any {
    try {
      // this.currentModelName = 'meta-llama/Llama-3.1-8B-Instruct';
      // const baseURL = 'https://dev-llm.openrainbow.io/openai/chat/completions'
      this.currentModelName = '0.llama3.2:3b'
      const baseURL = 'https://dev-llm.openrainbow.io/ollama/v1'

      return new ChatOpenAI({
        model: this.currentModelName,
        apiKey: INHOUSE_API_KEY,
        temperature: 0,
        maxRetries: 2,
        verbose: false,
        configuration: {
          baseURL,
          defaultHeaders: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INHOUSE_API_KEY}`,
          },
        },
      })
    }
    catch (error) {
      throw new Error(`[RainBot] createInHouseLLM() -- failure -- ${error.message}`)
    }
  }

  public async start(): Promise<LLMService> {
    try {
      this.llm = this.createInHouseLLM()
      this.questionChain = this.createQuestionChain()
      this.questionAnswerPrompt = this.createQuestionAnswerPrompt()
      this.weaviateService = new WeaviateService()
      this.retreiver = await this.weaviateService.retreiver('RainbowDoc')
      console.info(`== LLMService -- ${this.currentModelName} -- started`)
      return this
    }
    catch (error) {
      console.error(`== LLMService -- ${this.currentModelName} -- start failure`)
      throw new Error(`[LLMService] start() -- failure\n${error.message}`)
    }
  }

  public async invokeLLM(question: string, historyContext: HistoryContext): Promise<AIMessage> {
    try {
      const input = { question, chat_history: historyContext.messages, context: undefined }

      // Create the history contextualized prompt
      // const contextualizedQuestionPrompt = await this.questionChain.invoke(input);
      // console.info(`-- contextualizedQuestionPrompt : ${contextualizedQuestionPrompt}`);

      // Get the context
      const documents = await this.retreiver.invoke(question)

      // documents.forEach(doc => console.dir(doc.metadata))
      input.context = formatDocumentsAsString(documents)

      // Call the LLM
      return RunnableSequence.from([this.questionAnswerPrompt, this.llm]).invoke(input)
    }
    catch (error) {
      throw new Error(`[LLMService] invokeLLM() -- failure -- ${error.message}`)
    }
  }

  private createQuestionAnswerPrompt(): ChatPromptTemplate {
    const questionAnswerSystemPrompt = `You are an assistant named RainBot for question-answering tasks specialized in OpenRainbow Web SDK.
            Use the following pieces of retrieved context to answer the question.
            If you don't know the answer, just say that you don't know.
            Keep the answer concise.
            {context}`

    return ChatPromptTemplate.fromMessages([
      ['system', questionAnswerSystemPrompt],
      ['placeholder', '{chat_history}'],
      ['human', '{question}'],
    ])
  }

  private createQuestionChain(): Runnable {
    const contextualizeQuestionSystemPrompt = `
        Given a chat history and the latest user questions which might reference context in the chat history, 
        formulate a standalone question which can be understood without the chat history. 
        Never never answer the question, just reformulate it if needed and otherwise return it as is.
        The subject of the message is always in link with Rainbow a webrtc communication platform, 
        when you believe that the subject of the message is not relevant, return the message as is.
        Only returns the reformulate question`

    const contextualizeQuestionPrompt = ChatPromptTemplate.fromMessages([
      ['system', contextualizeQuestionSystemPrompt],
      ['placeholder', '{chat_history}'],
      ['human', '{question}'],
    ])

    return contextualizeQuestionPrompt
      .pipe(this.llm)
      .pipe(new StringOutputParser())
  }

  private createQuestionChainNewPourri(): Runnable {
    const promptTemplate = new PromptTemplate({
      template: `
                You are an assistant helping with an ongoing conversation.  
                Here is the recent chat history and the user's original question.
          
                ### Chat History:
                {chat_history}
          
                ### User's Original Question:
                {question}
          
                ### Instruction:
                Based on the original question and the recent chat history, generate a **new question** that could logically follow the current conversation.  
                The question should build upon the context provided and deepen the conversation without repeating information.
                Never answer the original question, just reformulate it if needed and otherwise return it as is.
                Just return this new question without comments.

                ### New Question:
            `,
      inputVariables: ['chat_history', 'question'],
    })

    return promptTemplate
      .pipe(this.llm)
      .pipe(new StringOutputParser())
  }
}

/*
### Task:
Respond to the user query using the provided context, incorporating inline citations in the format [source_id] **only when the <source_id> tag is explicitly provided** in the context.

### Guidelines:
- If you don't know the answer, clearly state that.
- If uncertain, ask the user for clarification.
- Respond in the same language as the user's query.
- If the context is unreadable or of poor quality, inform the user and provide the best possible answer.
- If the answer isn't present in the context but you possess the knowledge, explain this to the user and provide the answer using your own understanding.
- **Only include inline citations using [source_id] when a <source_id> tag is explicitly provided in the context.**
- Do not cite if the <source_id> tag is not provided in the context.
- Do not use XML tags in your response.
- Ensure citations are concise and directly related to the information provided.

### Example of Citation:
If the user asks about a specific topic and the information is found in "whitepaper.pdf" with a provided <source_id>, the response should include the citation like so:
* "According to the study, the proposed method increases efficiency by 20% [whitepaper.pdf]."
If no <source_id> is present, the response should omit the citation.

### Output:
Provide a clear and direct response to the user's query, including inline citations in the format [source_id] only when the <source_id> tag is present in the context.

<context>
{{CONTEXT}}
</context>

<user_query>
{{QUERY}}
</user_query>
*/
