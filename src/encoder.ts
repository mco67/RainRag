import { promises as fs } from 'fs'
import { readdir } from 'fs/promises'
import { join, resolve } from 'path'
import { Document } from '@langchain/core/documents'
import { MarkdownTextSplitter, MarkdownTextSplitterParams } from '@langchain/textsplitters'
import { WeaviateService } from './weaviate.js'

export class RainbowDocEncoder {
  private weaviateService: WeaviateService = new WeaviateService()
  private DOC_BASE_URL = '../Rainbow/sdk-v2/build999/'
  public async encode(): Promise<void> {
    try {
      console.info(`[RainbowEncoder] encode()`)

      const filePaths = await this.getDirectoryContent(this.DOC_BASE_URL + 'guides')
      for (const filePath of filePaths) {
        try {
          const documents = await this.loadAndSplitMarkdown(filePath, 'guides')
          await this.weaviateService.fromDocuments('RainbowDoc', documents)
          console.error(`[WeaviateService] encode(${filePath}) - success`)
        }
        catch (error) {
          console.error(`[WeaviateService] encode(${filePath}) - failure - ${error?.message}`)
        }
      }
    }
    catch (error) {
      console.error(`[WeaviateService] encode() - failure - ${error?.message}`)
    }
  }

  private async getDirectoryContent(directoryPath: string): Promise<string[]> {
    try {
      const filePaths: string[] = []
      await this.getDirectoryContentInternal(directoryPath, filePaths)
      return filePaths
    }
    catch (error) {
      console.error(`[WeaviateService] getFiles() - failure - ${error?.message}`)
    }
  }

  private async getDirectoryContentInternal(directoryPath: string, filePaths: string[]): Promise<void> {
    const absolutePath = resolve(directoryPath)
    const entries = await readdir(absolutePath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(absolutePath, entry.name)
      if (entry.isDirectory()) await this.getDirectoryContentInternal(fullPath, filePaths)
      else if (fullPath.endsWith('.md')) filePaths.push(fullPath)
    }
  }

  private async loadAndSplitMarkdown(filePath: string, section: string): Promise<Document[]> {
    try {
      // Read the Markdown file as a string
      const fileContent = await fs.readFile(filePath, 'utf8')

      // Initialize a MarkdownTextSplitter with chunk options
      const markdownTextSplitterParams: MarkdownTextSplitterParams = {
        chunkOverlap: 100, chunkSize: 1000, keepSeparator: true,
      }
      const splitter = new MarkdownTextSplitter(markdownTextSplitterParams)

      // Split the Markdown content into smaller chunks
      const documents = await splitter.createDocuments([fileContent])
      documents.forEach((document) => {
        document.metadata.section = section
        document.metadata.source = filePath.split(section)[1]
      })
      return documents
    }
    catch (error) {
      console.error('Error loading or splitting the Markdown file:', error)
      return []
    }
  }
}

const encoder = new RainbowDocEncoder()
encoder.encode()
