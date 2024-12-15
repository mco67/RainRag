/* eslint-disable @typescript-eslint/no-explicit-any */

import { RainbowService } from "./rainbow.js";
import { LLMService } from './llm.js';
import { HistoryContext } from "./historyContext.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { splitMarkdown } from './tools.js'


export class SDKBot {

	private rainbowService?: RainbowService;
	private llmService?: LLMService;
	private historyContext: Record<string, HistoryContext> = {};
	private parser = new StringOutputParser();
	private debugMode: boolean = false;

	public async start(): Promise<void> {

		console.info("===========================================================");
		console.info("== SDK RAINBOT STARTING                                  ==");
		console.info("===========================================================");
		console.info("");

		this.llmService = new LLMService();
		await this.llmService.start();

		this.rainbowService = new RainbowService();
		await this.rainbowService.start();

		console.info("");
		console.info("===========================================================");
		console.info("== SDK RAINBOT READY                                     ==");
		console.info("===========================================================");
		console.info("");

		this.rainbowService.onMessage(async (text: string, convId: string) => {
			console.info("===========================================================");
			console.info(`== Message : ${text}`);
			console.info(`== From : ${convId}`);

			try {
				// Handle commands
				if (await this.handleActions(text, convId)) return;

				// Handle message
				this.rainbowService?.sendIsTyping(convId, true);

				const historyContext = await this.getHistoryContext(convId);
				const aiResponse = await this.llmService?.invokeLLM(text, historyContext);
				historyContext.addMessage(text, 'R');
				historyContext.addAIMessage(aiResponse);

				let response = await this.parser.invoke(aiResponse);
				if (response) {
					response = response.replace(/\n\s*\n/g, '\n').trim();
					const messages = splitMarkdown(response, 8192);
					messages.forEach(message => this.rainbowService?.sendMessage(convId, message));
				}
				this.rainbowService?.sendIsTyping(convId, false);
			}
			catch (error) {
				const errorMessage = `[RainBot] onMessage() - failure\n${(error as Error).message}`;
				console.error(errorMessage);
				if (this.debugMode) this.rainbowService?.sendMessage(convId, errorMessage);
				this.rainbowService?.sendIsTyping(convId, false);
			}
			console.info("===========================================================");
			console.info('');
		})
	}

	public async getHistoryContext(convId: string): Promise<HistoryContext> {
		if (!this.historyContext[convId]) {
			// Get history messages for this conversation
			const historyMessages = await this.rainbowService?.getHistoryMessages(convId);
			// Create and store the new historyContext
			this.historyContext[convId] = HistoryContext.create(historyMessages);
		}
		return this.historyContext[convId];
	}

	private async handleActions(message: string, convId: string): Promise<boolean> {
		if (!message.startsWith('#')) return false;
		console.info(`== HandleActions : ${message}`);
		switch (message) {
			case "#obliviate":
				this.rainbowService?.clearHistory(convId);
				break;
			case "#debug":
				this.debugMode = !this.debugMode;
				this.rainbowService?.sendMessage(convId, `**Debug mode is ${this.debugMode ? 'activated' : 'disabled'}**`);
				break;
			case "#help":
				this.rainbowService?.sendMessage(convId, this.getCommandList());
				break;
			default:
				console.error(`-- handleActions ${message} -- Unknown action`);
				this.rainbowService?.sendMessage(convId, `Sorry ${message} is not a command\n\n ${this.getCommandList()}`);
				break;
		}
		console.info("===========================================================");
		console.info('');
		return true;
	}

	private getCommandList(): string {
		return `**List of available commands:**\n\
			 - **#obliviate** : clean conversation history\n\
			 - **#debug** : toggle debug mode\n\
			 - **#help** : display this message\n\
			**Information:**\n\
			 - Debug mode is ${this.debugMode ? 'activated' : 'disabled'}`;
	}



}

const sdkBot = new SDKBot();
sdkBot.start();