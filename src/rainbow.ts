/* eslint-disable @typescript-eslint/no-explicit-any */


import { NodeSDK, DataStoreType } from 'rainbow-node-sdk'
import type { Message } from 'rainbow-node-sdk/lib/common/models/Message.js'

export class RainbowService {

	private sdk?: NodeSDK;
	private messageHandler?: any;

	constructor() {
		this.sdk = new NodeSDK({
			rainbow: {
				host: 'demo.openrainbow.org',
				mode: 'xmpp',
			},
			credentials: {
				login: 'bot.test@drabedroc.fr',
				password: 'Alcatel_123!',
			},
			application: {
				appID: '37033b1001bd11e8843d6f00134e519a',
				appSecret: 'FyZjGPsk7FXzWeyPz0vSfT1ar6XjZRz3DCoTxQ6mSpTvcOoND2CtcEWxcmkqGDJW',
			},
			logs: {
				enableConsoleLogs: false,
				color: true,
				level: 'info',
			},
			im: {
				sendReadReceipt: true, // If it is setted to true (default value), the 'read' receipt is sent automatically to the sender when the message is received so that the sender knows that the message as been read.
				messageMaxLength: 8192, // the maximum size of IM messages sent. Note that this value must be under 1024.
				sendMessageToConnectedUser: false, // When it is setted to false it forbid to send message to the connected user. This avoid a bot to auto send messages.
				conversationsRetrievedFormat: 'small', // It allows to set the quantity of datas retrieved when SDK get conversations from server. Value can be "small" of "full"
				storeMessages: true, // Define a server side behaviour with the messages sent. When true, the messages are stored, else messages are only available on the fly. They can not be retrieved later.
				nbMaxConversations: 15, // parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are removed from XMPP server. They are not destroyed. The can be activated again with a send to the conversation again.
				rateLimitPerHour: 1000, // Set the maximum count of stanza messages of type `message` sent during one hour. The counter is started at startup, and reseted every hour.
				messagesDataStore: DataStoreType.StoreTwinSide, // Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour)<br>
				// DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
				// DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).<br>
				// DataStoreType.StoreTwinSide The messages are fully stored.<br>
				// DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.

				autoInitialGetBubbles: true, // to allow automatic opening of the bubbles the user is in. Default value is true.
				autoInitialBubblePresence: true, // Define if the presence should be sent automatically to bubbles. This allows to receive the messages from the bubbles.
				autoInitialBubbleFormat: 'small', // to allow modify format of data received at getting the bubbles. Default value is true.
				autoInitialBubbleUnsubscribed: true, // to allow get the bubbles when the user is unsubscribed from it. Default value is true.
				autoLoadConversations: true, // Define if the existing conversations on server side should be downloaded at startup. On bot with lot of contacts exchange it can slower the startup.
				autoLoadContacts: true, // Define if the contacts from the network (the roster) should be loaded at startup.
			},
			servicesToStart: {
				bubbles: { start_up: false },
				telephony: { start_up: false },
				channels: { start_up: false },
				admin: { start_up: false },
				fileServer: { start_up: false },
				fileStorage: { start_up: false },
				calllog: { start_up: false },
				favorites: { start_up: false }
			},
		});

	}

	public async start(): Promise<RainbowService> {
		return new Promise<RainbowService>((resolve) => {
			this.sdk.events.on('rainbow_onready', () => { resolve(this); });
			this.sdk.events.on('rainbow_onmessagereceived', (message: Message) => {
				if (message.type === "chat") {
					if (this.messageHandler) {
						this.messageHandler(message.content, message.fromJid);
					}
				}
			});
			this.sdk.start();
			console.info("== RainbowService -- started");
		})
	}

	public onMessage(handler: any): void {
		this.messageHandler = handler;
	}

	public sendIsTyping(convId: string, isTyping: boolean): void {
		const conversation = this.sdk.conversations.getConversationById(convId);
		this.sdk.im.sendIsTypingStateInConversation(conversation, isTyping);
	}

	public sendMessage(jid: string, text: string): void {
		const content = { type:'text/markdown', message: text };
		this.sdk.im.sendMessageToJid(text, jid, 'en', content);
	}

	public sendPartialMessage(jid: string, text: string): void {
		this.sdk.im.sendApplicationMessageContactJid(jid, )
	}

	public async getHistoryMessages(convId: string): Promise<Message[]> {
		const conversation = this.sdk.conversations.getConversationById(convId);
		await this.sdk.im.getMessagesFromConversation(conversation, 10);
		return conversation._messages;
	}

	public async clearHistory(convId: string): Promise<void> {
		const conversation = this.sdk.conversations.getConversationById(convId);
		this.sdk.conversations.removeAllMessages(conversation);
	}

}