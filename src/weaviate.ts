/* eslint-disable @typescript-eslint/no-explicit-any */
import weaviate, { ApiKey } from 'weaviate-ts-client'
import { WeaviateStore } from '@langchain/weaviate'
import { MistralAIEmbeddings } from '@langchain/mistralai'
import { Embeddings } from '@langchain/core/embeddings'
import { Document } from '@langchain/core/documents'
import { VectorStoreRetriever } from '@langchain/core/vectorstores'
import { MISTRAL_API_KEY, WEAVIATE_END_POINT, WEAVIATE_API_KEY } from './secret.js'
export class WeaviateService {
  private client: any
  private embeddings: Embeddings

  constructor() {
    this.initialize()
  }

  public initialize(): void {
    // Create weaviate client connection
    this.client = (weaviate as any).client({
      scheme: 'https',
      host: WEAVIATE_END_POINT,
      apiKey: new ApiKey(WEAVIATE_API_KEY),
    })

    // Create embeddings
    this.embeddings = new MistralAIEmbeddings({ apiKey: MISTRAL_API_KEY })
    console.info('== WeaviateService -- started')
  }

  public async getStore(indexName: string): Promise<WeaviateStore> {
    try {
      return await WeaviateStore.fromExistingIndex(this.embeddings, { client: this.client, indexName })
    }
    catch (error) {
      console.error(`[WeaviateService] createStore(${indexName}) - failure - ${error?.message}`)
    }
  }

  public async fromDocuments(indexName: string, docs: Document[]): Promise<WeaviateStore> {
    try {
      return await WeaviateStore.fromDocuments(docs, this.embeddings, { client: this.client, indexName })
    }
    catch (error) {
      console.error(`[WeaviateService] fromDocuments(${indexName}) - failure - ${error?.message}`)
    }
  }

  public async retreiver(indexName: string): Promise<VectorStoreRetriever> {
    const store = await this.getStore(indexName)
    const verbose = false
    return store.asRetriever(5, undefined, undefined, undefined, undefined, verbose)
  }

  public async close(): Promise<void> {
    this.client?.close()
  }
}
