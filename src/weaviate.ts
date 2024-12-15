/* eslint-disable @typescript-eslint/no-explicit-any */
import weaviate, { ApiKey } from 'weaviate-ts-client';
import { WeaviateStore } from "@langchain/weaviate";
import { MistralAIEmbeddings } from '@langchain/mistralai';
import { Embeddings } from '@langchain/core/embeddings';
import { Document } from '@langchain/core/documents';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';

export class WeaviateService {

    private MISTRAL_API_KEY = 'EBTBmkHrJg5Ym0B9kINvYHNj1VpPOvkd';
    private WEAVIATE_END_POINT = '7gcqwfxsqrilsgxh9k0ojw.c0.europe-west3.gcp.weaviate.cloud';
    private WEAVIATE_API_KEY = 'DtSG4D4iOSErBHflQwE84TqylxqWAPUFMesi';

    private client: any;
    private embeddings: Embeddings;

    constructor() {
        this.initialize();
    }

    public initialize(): void {
        // Create weaviate client connection
        this.client = (weaviate as any).client({
            scheme: 'https',
            host: this.WEAVIATE_END_POINT,
            apiKey: new ApiKey(this.WEAVIATE_API_KEY)
        });

        // Create embeddings
        this.embeddings = new MistralAIEmbeddings({ apiKey: this.MISTRAL_API_KEY });
        console.info("== WeaviateService -- started");
    }

    public async getStore(indexName: string): Promise<WeaviateStore> {
        try {
            return await WeaviateStore.fromExistingIndex(this.embeddings, { client: this.client, indexName });
        }
        catch (error) {
            console.error(`[WeaviateService] createStore(${indexName}) - failure - ${error?.message}`);
        }
    }

    public async fromDocuments(indexName: string, docs: Document[]): Promise<WeaviateStore> {
        try {
            return await WeaviateStore.fromDocuments(docs, this.embeddings, { client: this.client, indexName });
        }
        catch (error) {
            console.error(`[WeaviateService] fromDocuments(${indexName}) - failure - ${error?.message}`);
        }
    }

    public async retreiver(indexName: string): Promise<VectorStoreRetriever> {
        const store = await this.getStore(indexName)
        return store.asRetriever(5);
    }

    public async close(): Promise<void> {
        this.client?.close();
    }

}