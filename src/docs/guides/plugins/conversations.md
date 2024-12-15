# Conversations 

## At the heart of Rainbow : the conversations
The notion of conversation is central to the Rainbow environment. Almost everything revolves around 'conversations'. 

**But what is really a conversation for Rainbow ?** 

Here is a tentative of definition :

> 🧭 **DEFINITION**  
> A conversation modelize an interaction between one or more Rainbow users.<br/>
> By interaction, we mean chat, audio or video and much more.

In the Rainbow ecosystem we'll come across two types of conversations:
+ The "peer-to-peer" (P2P) conversations : where two Rainbow users interact with each other.
+ The "bubble" conversations : where several users interact all together (see the [BubblesPlugin](/doc/page/guides/plugins/bubbles) for more information about bubbles).

**A conversation can be considered as a virtual meeting room.** 

But a virtual room with ears👂, eyes 👀, and memory 🧠
. The conversation entity is responsible for managing the history of your exchanges: text or voice messages, documents, recordings of audio or video conversations.

## ConversationService API

Now let's look at how to create and to access to the existing conversations.<br/>
To manage the conversations, we will use the `ConversationService` service that offers the following APIs: 

+ [subscribe](#subscribe)
+ [getConversations](#getConversations)
+ [getCallConversations](#getCallConversations)
+ [getConversation](#getConversation)
+ [removeConversation](#removeConversation)
+ [setConversationBookmark](#removeConversation)

### <a id="subscribe" name="subscribe"></a> Subscribe to conversationService events

To be informed of the creation or deletion of a conversation with a user or a bubble, you need to `subscribe` to `ConversationServiceEvents`.

Handle these events is necessary to be notified that another user has created a conversation with us, but also to manage the multi-client issue.

``` ts
this.conversationService.subscribe((event: RBEvent<ConversationServiceEvents>) => {
    const conversation: Conversation = event.data.conversation;
    switch (event.name) {
        case ConversationServiceEvents.ON_SERVICE_STARTED: ... break;
        case ConversationServiceEvents.ON_CONVERSATION_CREATED: ... break;
        case ConversationServiceEvents.ON_CONVERSATION_REMOVED: ... break;
        case ConversationServiceEvents.ON_MESSAGE_ADDED_IN_CONVERSATION: ... break;
        case ConversationServiceEvents.ON_MESSAGE_MODIFIED_IN_CONVERSATION: ... break;
        default: break;
    }
})
```

### <a id="getConversations" name="getConversations"></a> Get all conversations
It is sometimes necessary to know all my current conversions. This time we're going to use `ConversationService` `getConversations` method:
     * Get the array of all current call conversations, regardless of type (phone or webrtc)

``` ts
const conversations = this.conversationService.getConversations();
```

### <a id="getCallConversations" name="getCallConversations"></a>Get all conversations including a call
The `getCallConversations` method allows to get all conversations involving a call, regardless of the type of call (telephone or WebRTC).<br/>
This API is particularly useful for the service `CallService` managing the P2P audio and/or video communication to retrieve the list of calls in progress.
``` ts
const conversations = this.conversationService.getCallConversations();
```

### <a id="getConversation" name="getConversation"></a> Get or create a P2P conversation

Create or getting an existing conversation is really simple with the Rainbow SDK, and requires a single `conversationService` method: `getConversation`.
This method will create the conversation if it not already exists, else it'll return the existing conversation. 

This is an async method cause it can invoke server remote methods (conversation creation or fetch existing conversation). As Rainbow environnement is multiClient a modification on conversation on a client will be automatically reported to conversation on other client (ressource).

``` ts
// Fetch the user
const user = ...;

// Get the conversation associate to the user
const conversation = await this.conversationService.getConversation(user);
```

### Get or create a Bubble conversation
Get a `bubble` conversation is just as easy : 
``` ts
// Fetch Bubble 
const bubble = ...;

// Get the conversation associate to the bubble
const conversation = await this.conversationService.getConversation(bubble);
```

### <a id="removeConversation" name="removeConversation"></a> Remove a conversation

Removing a conversation is just as simple, we will use the `conversationService` `removeConversation` method.

``` ts
// Remove a conversation
await this.conversationService?.removeConversation(conversation);
```
<br/>

## Conversation API

### Preamble
The most common action (and also the simplest) in a conversation is exchanging text messages or documents. 

In the rest of this article, we'll look at how to use the Rainbow SDK to implement this functionality.
We will then look at how to send, modify and delete messages.
We'll also look at the different types of message and sending methods.

> 💡 **NOTE**  
> The following methods are working both for **peer2peer** or **bubble** conversations.<br/>In the following example we're going to use a **peerToPeer** conversation, but the use is identical with a **bubble** conversation.

Here are the main `Conversation` methods: 

+ [getHistoryPage](#getHistoryPage)
+ [getMessages](#getHistoryPage)
+ [sendMessage](#sendMessage)
+ [modifyMessage](#modifyMessage)
+ [deleteMessage](#deleteMessage)
+ [deleteAllMessages](#deleteAllMessages)
+ [forwardMessage](#forwardMessage)

### <a id="getHistoryPage" name="getHistoryPage"></a> Load messages history pages and reach the messages array

A rainbow conversation, whether P2P or bubble, is an exchange of text messages between two or more people. Of course, Rainbow will manage the history of these messages, i.e. it's possible to retrieve messages already exchanged.
The `getHistoryPage` method lets us load the history of our messages in paginated form. Simply call it and specify the number of messages you wish to retrieve. 

Then the `getMessages` methods allows us to handle message as an array.

``` ts
/// Fetch the user "A"
const user = ...

// Get the conversation associate to the user "A"
const conversation = await this.conversationService.getConversation(user);

// Retrieve the first 10 messages exchanged with "A" in the history (i.e. the ten most recent).
await conversation.getHistoryPage(10);
const messages = conversation.getMessages();
// In this case message.length === 10 

//A  new call to the var method retrieves the next 30, etc...
await conversation.getHistoryPage(30);
// Now message.length === 40
```
### <a id="sendMessage" name="sendMessage"></a> Sending a message to a conversation

Sender side (connected user side) we will use the `sendMessage` method of the `conversation` to send a message to user "A".

``` ts
// Fetch the user "A"
const user = ...

// Get the conversation associate to the user "A"
const conversation = await this.conversationService.getConversation(user);

// Send a text message
const text = "A text to send";
const message = conversation.sendMessage(text);
```

### Sending a message with urgency information

Rainbow lets you indicate the urgency level of a message. Here's how to specify it using metaData.

``` ts
const text = "No more toilet roll";
const messageData: SendMessageData = { urgency : 'high' };
const message = conversation.sendMessage(text, messageData);
```

### Sending a message with Markdown content

You can choose to send your message in Markdown.
``` ts
const text = "No more toilet roll";
const markdown = "no more ***Toilet roll***";
const additionalContent = MessageAdditionalContent.create('text/markdown', this.markdown);
const messageData: SendMessageData = { additionalContent };
const message = conversation.sendMessage(text, messageData);
```

### <a id="modifyMessage" name="modifyMessage"></a> Modifying an existing message

It is perfectly possible to modify a message after it has been sent.
Simply use the `conversation` `modifyMessage` method.

``` ts
// The message to modify
const message = ... ;
// The new text of the message
const newText = "The new text";
// The new metaData of the message
const messageData = ... ;

await conversation.modifyMessage(message, text, messageData);
```

### <a id="deleteMessage" name="deleteMessage"></a>  Removing an existing message

Simply use the ```deleteMessage``` method of conversation:

``` ts
const message: Message = ...
await this.conversation?.deleteMessage(message);
```

### <a id="deleteAllMessage" name="deleteAllMessage"></a> Removing all messages of the conversation

The ```deleteAllMessages``` method of conversation allows us to remove all conversation messages (including history messages)

This action is irreversible !!

``` ts
await this.conversation?.deleteMessage();
```

### <a id="forwardMessage" name="forwardMessage"></a> Forward a message to another conversation

The ```forwardMessage``` method of conversation allows us to forward a message from a conversation to another conversation.

``` ts
const anotherConversation: Conversation = ...
const messageFromThisConversation: Message = ...
await this.conversation?.forwardMessage(anotherConversation, messageFromThisConversation);
```

======

### <a id="subscribe" name="subscribe"></a> Receive a message 

On client "A" side we have to be informed that a message is arrived. 
To do this, we're going to listen for new conversationService events. To do this, we'll use the event handler we defined earlier.

``` ts
this.conversationService?.subscribe((event: RBEvent) => {
    const conversation: Conversation = event.data.conversation;
    switch (event.name) {
        ...
        case ConversationServiceEvents.ON_MESSAGE_ADDED_IN_CONVERSATION:
            const message: Message = event.data.message;
            ...
            break;
    }
})
```

If it is possible to modify a message, you obviously need a way of listening to the changes that are applied to this message.
To do this, simply add an event handler to the message itself: ////// FIXME /////////

``` ts
this.sdk.conversationService.subscribe((event: RBEvent<ConversationEvent>) => {
    const message = event.message;
}, ConversationServiceEvents.ON_MESSAGE_MODIFIED_IN_CONVERSATION);
```

And there you have it... It's really not that complicated...


(TODO) Need more explanation about the received event

And extends the existing ConversationService event listener :

``` ts
this.conversationService?.subscribe((event: RBEvent) => {
    const conversation: Conversation = event.data.conversation;
    switch (event.name) {
        ...
        case ConversationServiceEvents.ON_MESSAGE_MODIFIED_IN_CONVERSATION:
            const message: Message = event.data.message;
            // Do what you want with this information
            break;
    }
})
```
