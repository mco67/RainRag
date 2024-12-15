# DataChannel Plugin

The WebRTC (Web Real-Time Communications) is primarily known for its support for audio and video communications, however, it also offers peer-to-peer data channels. 

This article explains more about this, how to use it via the Rainbow SDK and how this peer-to-peer commmunication mechanism can also be used in rainbow conferences for broadcasting arbitrary content to conference participants

**But first, what is a data channel?**

> A WebRTC data channel lets you send text or binary data over an active connection to a peer. Rainbow uses **reliable channels** which guarantee that messages you send arrive at the other peer and in the same order in which they're sent. This is analogous to a web socket.

**DataChannel in Rainbow!**

Rainbow platform offers DataChannel capabilities for peer-to-peer conversations but also for bubble conversations. 

> ⚠️ **WARNING**  
>It should be noted, however, that the services offered will differ in both cases.

### Peer-to-peer conversation dataChannels

#### Some explanation

The main idea is to establish a bidirectional data exchange pipe between two Rainbow users.

Rainbow is a "multi-device" communication system, meaning that a user can be connected simultaneously to several devices (resources). But a dataChannel offers a peer-to-peer connection, which means you'll need to identify which user's resource you're going to connect to.

**But don't worry, the Rainbow SDK takes care of this part of the job:**

When a Rainbow user "A" creates a dataChannel to another Rainbow user "B", an invitation to join the dataChannel is sent to all the devices (resources) of "B". 

User "B" can then accept (or refuse) the invitation to join the dataChannel on the device of his choice. The peer-to-peer connection will then be established between "A"'s device having created the DataChannel and the device chosen by "B".

Once established, "A" and "B" can exchange data bidirectionally.

This connection can be interrupted by any protagonist. Both users will be informed of the end of the connection by an event.

#### How to start dataChannel with Rainbow SDK?

##### Add the dataChannel Plugin in your project

``` ts
import { DataChannelPlugin } from 'rainbow-web-sdk/lib';
...

this.rainbowSDK = RainbowSDK.create({
    host: { server, apiClientKey, appModuleKey },
    plugins: [
        ConversationPlugin,
        ..., 
        DataChannelPlugin
    ], 
    autoLogin: true
})
```
##### Import the dataChannelService in your code

``` ts
import { DataChannelService, DataChannelStatus, DataChannelServiceEvent, DATA_CHANNEL_SVC } from 'rainbow-web-sdk';
...
constructor() {
	this.rainbowSDK = RainbowSDK.getInstance();
    this.dataChannelService = this.rainbowSDK.get<DataChannelService>(DATA_CHANNEL_SVC);
}
```

##### Consider the dataChannel creator side

User "A" will create a dataChannel with user "B"

``` ts
// Fetch user "B" contact
const contact = ...

// Create the dataChannel
const dataChannel = await this.dataChannelService?.createDataChannel(contact, 'DataChannel Description');
```

The status of this new dataChannel is "proposed" ```dataChannel.status = 'proposed```.

The invitation is sent to "userB" (see later how B receives this invitation), to be inform of the dataChannel status change (ie: when user "B" accept or refuse this invitation) just add a listener on this dataChannel status:

``` ts
// Listen dataChannel status events
dataChannel?.onStatusChanged((status: DataChannelStatus) => {
    if (status === 'connected') {
        // Attach a listener on  dataChannel messages events
        dataChannel?.onMessageReceived((data: any) => {
	        // Enjoy your dataChannel messages
        });
    }
    if (status === 'refused') {
        // Handle your deception
        // For example you can call your psy or start to drink !!
    }
}
```

##### Consider the dataChannel receiver side

Now change your point of view and have a look on receiver side.

To be informed of an eventual dataChannel invitation, user "B" have to listen event from dataChannelService. Also listen 

``` ts
// Listen dataChannelService events (to receive the dataChannel object)
this.dataChannelService?.subscribe((event: RBEvent) => {
	if (event.name === DataChannelServiceEvents.RAINBOW_ON_DATACHANNEL_AVAILABLE) {
        dataChannel: DataChannel = event.data;

        // Listen dataChannel status events
        dataChannel?.onStatusChanged((status: DataChannelStatus) => {
            if (status === 'connected') {
                // Attach a listener on  dataChannel messages events
                dataChannel?.onMessageReceived((data: any) => {
	                // Enjoy your dataChannel messages
                });
        }
    }
}
```

The status of the received dataChannel is "invited":```dataChannel.status = 'invited'```.
The user "B" can either accept or refuse this dataChannel invitation.

``` ts
await this.dataChannelService?.acceptDataChannel(dataChannel);
```
or
``` ts
await this.dataChannelService?.refuseDataChannel(dataChannel);
```

We now suppose that user "B" has accepted the dataChannel invitation, both user are informed that the connection is established by a change status event. It is now time to exchange data !

``` ts
await this.dataChannelService?.sendMessage("Some data");
```

The other user will received the data via the **onMessageReceived** event handler.

Note that the pipe is bidirectional, both users can send data.

To close the connection, just use : 

``` ts
await this.dataChannelService?.deleteDataChannel(dataChannel); 
```


### Bubble conversation dataChannels

Using dataChannels in a bubble is fundamentally different. 

The user first establishes a peer-to-peer dataChannel with Rainbow's WebRTC server (this server acts as a second peer). 
The server is then responsible for notifying bubble member of the availability of this dataChannel. 
It then establishes an individual dataChannel with each member of the bubble who has accepted the invitation.

**Some special features:**
 + Before establishing a dataChannel with the WebRTC Server, the user must first enter the conference associated with the bubble (WebRTC audio or video conference). ***This means that you can only use dataChannel in a bubble if a conference is already in progress in that bubble***.
 + In bubble, dataChannels are unidirectional, only the initiator of the dataChannel can send messages; bubble members can only receive messages.
 + Bubble members can accept or ignore the invitation (the refuseDataChannell method is inoperative for bubble members).
 + Bubble members can leave and rejoin the dataChannel at any time without jeopardizing the initiator's connection to the server.
 + On the other hand, if the initiator breaks the connection with the server, all dataChannels between the server and bubble members are closed, and bubble members are warned of the state change.

Let's take a look at the implementation

> 💡 **ASSERTION**  
>We suppose that users "A", "B" and "C" are members of the bubble "Soap" and that audio/video conference already exists in this "Soap" bubble.

##### Consider the dataChannel initiator side

User "A" will create a dataChannel with the "Soap" bubble

``` ts
// Fetch user "Soap" bubble
const bubble = ...

// Create the dataChannel
const dataChannel = await this.dataChannelService?.createDataChannel(bubble, 'A bubble DataChannel');
```
The dataChannel between user "A" and the "Soap" bubble will be established immediatly, and soon the status of the dataChannel will be "connected" : ```dataChannel.status = 'connected```.

The event handler to fetch the status of the dataChannel between "A" and "Soap" status is to configure as for the Peer-to-pper case.

``` ts
// Listen dataChannel status events
dataChannel?.onStatusChanged((status: DataChannelStatus) => {
    if (status === 'connected') {
        ...
    }
}
```

##### Consider the dataChannel receiver side

Users "A" and "B" have to register to the DataChannelService events.

``` ts
// Listen dataChannelService events (to receive the dataChannel object)
this.dataChannelService?.subscribe((event: RBEvent) => {
	if (event.name === DataChannelServiceEvents.RAINBOW_ON_DATACHANNEL_AVAILABLE) {
        dataChannel: DataChannel = event.data;

        // Listen dataChannel status events
        dataChannel?.onStatusChanged((status: DataChannelStatus) => {
            if (status === 'connected') {
                // Attach a listener on  dataChannel messages events
                dataChannel?.onMessageReceived((data: any) => {
	                // Enjoy your dataChannel messages
                });
        }
    }
}
```

Assume that user "B" is already connected in the "Soap" conference.
He'll receive an event from the dataChannelService with a dataChannel object whose state is "invited". 

If user "C" is not already in the "Soap" conference, he will receive this event at the moment he will be connected in the "Soap" conference.

It is now time for users "B" and "C" to accept the invitation (same as peer-to-peer).
``` ts
await this.dataChannelService?.acceptDataChannel(dataChannel);
```

> ⚠️ **WARNING**  
>The ```dataChannelService?.refuseDataChannel()``` method is useless in dataChannel with bubble. To refuse an invitation just ignore it.

Once connected users "B" and "C" can received the message from "A" user.

Note that if user "B" or "C" leave their dataChannels with the WebRTC server the dataChannel between "A" and the server stay untouched. But if "A" terminate its dataChannel connection, all bubble members dataChannel connection will be closed.  
