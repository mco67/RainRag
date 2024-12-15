# Calls plugin

## Calls, the heart of P2P audio and/or video communication
The Rainbow environment offers two ways of making an audio and/or video call between two parties (P2P communication):
- By making a WebRTC call.<br/>
A WebRTC call is a real-time audio and/or video communication established directly between two Rainbow Web Clients connected on browsers (Firefox, Chrome, etc.) or applications (Desktop, Mobile) using only their native capabilities. These are based on the WebRTC (Web Real-Time Communication) protocol which enables telephony to be carried out directly via the Internet network. It is not necessary to have an intermediate server such as a PBX.<br/>
That's why, in this case, a Rainbow user does not need a number to be reachable for an audio conversation.<br/>
- By making a telephone call.<br/>
A telephone call or PBX (Private Branch Exchange) system call refers to a call made via a private telephone switching system such as Rainbow Hub or Rainbow Hybrid (OXO or OXE). Such PBX system must be available in your company or organization.<br/>
In this case, a Rainbow user has a telephone number (managed by the PBX) and can be reached in this additional way.<br/>

Using the Rainbow SDK for Web, both P2P audio and/or video communications are available and fully managed through the `CallService`.

Please note that the `CallService` is not part of the Rainbow core service and is available via the `CallsPlugin`. \
The first thing to do is to add this plugin to our project.

## Add the CallsPlugin in our project

``` ts
import { CallsPlugin } from 'rainbow-web-sdk/lib';
...
this.rainbowSDK = RainbowSDK.create({
    host: { server, apiClientKey, appModuleKey },
    plugins: [ CallsPlugin ], 
    autoLogin: true
})
```

The ```CallService``` is the entry point for all call manipulations.

``` ts
import { CallService } from 'rainbow-web-sdk';
...
constructor() {
	this.rainbowSDK = RainbowSDK.getInstance();
    // get the CallService service
    this.callService: CallService = this.rainbowSDK.CallService;
}
```

Before discovering the possibilities of `CallService`, it is very important to note that P2P calls are closely linked to conversations, since they only exist through them.
For a reminder of what a conversation is, please refer to [Conversations](/doc/page/guides/plugins/conversations)<br/>

As said, a P2P call is part of a conversation. In fact, as soon as a P2P call is established, a ***call*** property is associated with it in a conversation.<br/>

***What does this mean?***<br/>
That you have to identify any new call in a conversation and know when it has ended.<br/>
To do this, we need the `ConversationService` to listen to the following associated events: ON_NEW_CALL_IN_CONVERSATION and ON_REMOVE_CALL_IN_CONVERSATION. Refer to [Listening to ConversationService events](#subscribeConversation) for more details.<br/>
Detecting these events will then  allow us to focus on the calls.

> 💡 **Note**  
> The list of all conversations involving a call, regardless of the type of call (Telephone or WebRTC) can be retrieved using the *getCallConversations()* API of `ConversationService`.

***And why do we need to do this?***<br/>
Mainly to be able to retrieve each call instance and then manage them individually for each of their specific aspects.<br/>
These include general information about a call (type, status, duration, remote party...), the telephone features available during a call and the medias used (audio/video).

At this stage we have understood that we can and must interact at the level of each call instance.<br/>
The entry point for this is listening for events on each call. We'll be looking at this in detail from Chapter [Call events](#subscribeCall) onwards.

### <a id="subscribeConversation" name="subscribeConversation"></a>Listening ConversationService events
To be informed of conversations update you can subscribe to ConversationService events:

```ts
const conversationCallSubscription = this.rainbowSDK.conversationService?.subscribe((event: RBEvent<ConversationServiceEvents>) => {
        try {
            const conversation: Conversation = event.data.conversation;

            switch (event.name) {
                case ConversationServiceEvents.ON_NEW_CALL_IN_CONVERSATION:
                    this.onCallConversationCreated(conversation);
                    break;

                case ConversationServiceEvents.ON_REMOVE_CALL_IN_CONVERSATION:
                    this.onCallConversationRemoved(conversation);
                    break;

                default: 
                    break;
            }
        }
        catch (error) {
            ...
        }
    }, [ConversationServiceEvents.ON_NEW_CALL_IN_CONVERSATION, 
        ConversationServiceEvents.ON_REMOVE_CALL_IN_CONVERSATION]);
```


## <a id="subscribeCall" name="subscribeCall"></a>Call events
Each call sends events to notify significant changes in its most relevant properties, so that it can be managed accordingly.<br/>

These events are mainly linked to
- The status of the call (ringing, in conversation...)
- The way a call can evolve (put on hold, redirection,...) also known as the call capabilities 
- The use of different media (audio, video and sharing)

**Managing these events is the cornerstone of every call.**

To be notified of these modifications you must subscribe to Call events and this, **independently for each call**.

```ts
    // Get all call present in the conversations, regardless of type (phone or WebRTC)
    const callConversations: Conversation[] = this.rainbowSDK.conversationService?.getCallConversations();

    if (callConversations) {
        // For each call found, subscribe to the events 
        callConversations.forEach(async (conv: any) => {
            if (conv.call) {
                this.addCallEventsListeners(conv.call)
            }
        }); 
    }

    // Subscribe to the events sent by a call
    private addCallEventsListeners(call: Call): void {
        let callSubscription: Subscription =  call.subscribe((event: RBEvent<CallEvents>) => {
            switch (event.name) {
                case CallEvents.ON_CALL_STATUS_CHANGE: ... break;        
                case CallEvents.ON_CALL_CAPABILITIES_UPDATED: ... break; 
                case CallEvents.ON_CALL_MEDIA_UPDATED: ... break;
                case CallEvents.ON_CALL_MUTE_CHANGE: ... break;        
                case CallEvents.ON_CALL_NETWORK_QUALITY_CHANGE:
                    console.info(`Network quality: ${event.data}`);
                    break;   
                default: ...  break;                        
            }
        }
    }
});
```

Here are some details of the most important events.

### Call event: ON_CALL_STATUS_CHANGE
This event is sent every time the status of the call (from a telephone point of view) changes.<br>
For example, when a call is answered, it moves from state *RINGING_INCOMMING* to state *ANSWERING* and finally *ACTIVE*.<br>
The new call status can be retrieved via the **callStatus** property of the call.

### Call event: ON_CALL_CAPABILITIES_UPDATED
This event is the heart of call management and sent when the call capabilities have been updated.<br>
One or more capabilities can be updated at the same time.<br>
Each reception of this event must be processed to establish the new actions that can be carried out with the call.<br>
The new call capabilities can be retrieved via the **capabilities** property of the call.

### Call event: ON_CALL_MEDIA_UPDATED
This event is sent when there have been changes in the media used by the local or the remote user.<br>
By change we mean the addition or removal of a media (Audio/Video/Sharing) for the current call.
Each reception of this event must be processed to take into account the medias in use or not during the call.<br>
The updated medias can be retrieved via the **localMedias** (medias used by the local party, so the connected user) and the **remoteMedias** (medias used by the remote party) properties of the call.

### Call event: ON_CALL_MUTE_CHANGE
This event is sent when the mute status of the call (On or Off) has been changed by the connected user.<br>
The new mute status can be retrieved via the **isMuted** property of the call.<br>
In addition, the new possible actions associated with the mute function are also specified by the *mute*/*unmute* capabilities.

### Call event: ON_CALL_NETWORK_QUALITY_CHANGE
This event is only relevant for a WebRTC call. It is sent when a change in the network quality has been detected.<br>
It is mainly used to detect problems with the quality of the WebRTC connection.<br>
The current network quality for the call is provided as event data. It can also be retrieved at any time via the **networkQuality** call property.

---

### There are 2 entry points for accessing the call management APIs:

- The [CallService](#callserviceapi) APIs.<br>
These apis are dedicated to functions that are outside the context of an existing call. In particular, they allow calls to be set up.

- The [Call](#callapi) APIs.<br>
These APIs apply to a call instance and enable it to be managed and evolved.


## <a id="callserviceapi" name="callserviceapi"></a>CallService API
+ [makeWebCall](#makewebcall)
+ [makePhoneCall](#makephonecall)

### <a id="makewebcall" name="makewebcall"></a>Make a WebRTC call
The ***makeWebCall*** method allows to make a standard WebRTC call to a Rainbow user.<br>
Following this action, a new **conversation** with this user will be managed by the `ConversationService` (It can be created if it does not exist). This service will add a new call instance in the conversation and send an *ON_NEW_CALL_IN_CONVERSATION* event.<br>
This new call instance can then be managed directly using [Call](#callapi) API.

The media(s) that the connected user wants to use can be specified. If no media is specified, by default only the audio media will be added to the new call.<br>
> 💡 **Note**  
> The fact that the connected user has specified media does not mean that it will automatically be used when the conversation is established.
> For example, if the user makes an audio and video call, the remote user can refuse the video and then, only an audio conversation will be established initially.

A personal message can also be sent to the remote party to notify about the reason of the call.

```ts
let medias: MediaType[] = [MediaType.AUDIO, MediaType.VIDEO];
const userA: User = ...;
const userB: User = ...;

// Rainbow audio call to UserA
await this.callService?.makeWebCall(userA);

// Rainbow audio+video call to UserB with a personal message
await this.callService?.makeWebCall(userB, medias, "Quick question about the next meeting");
```

### <a id="makephonecall" name="makephonecall"></a>Make a PBX Phone call
The ***makePhoneCall*** method allows to make a PBX Phone call to a number.<br>
This type of call requires a PBX (Rainbow Hub or Rainbow Hybrid (OXO/OXE) telephone system) to be available in your company or organisation.

The number to call can be the one associated with another Rainbow user (such as its work phone) or an external number on the public network.<br>
In the case of a Rainbow user, the user instance (as User model) can be added in the request. This information can be used to optimise the routing of the call.

It should be noted that the format of the number to be dialled is not imposed; it will subsequently be transformed into E164 format.

Following this action, a new **conversation** with the remote party (a Rainbow user or the external number) will be managed by the `ConversationService` (It can be created if it does not exist). This service will add a new call instance in the conversation and send an *ON_NEW_CALL_IN_CONVERSATION* event.<br>
This new call instance can then be managed directly using [Call](#callapi) API.

When setting up the call, it is possible to provide proprietary data which will be transmitted transparently. These data will not be managed by the CallService but used by the lower layers (in particular the CSTA used by the PBX) between the caller and the called party. These additional data can be in editable or non-editable format.

```ts
// Phone call to an external number on the public network.
await this.callService?.makePhoneCall("0102030405");

// Phone call to the work phone of a Rainbow user
const userA: User = ...;
await this.callService?.makePhoneCall(userA.phonePro, userA);
```

## <a id="callapi" name="callapi"></a>Call API
A call can be managed and evolved using the APIs listed below provided by the `Call` model interface.<br/>
Most of these APIs are strongly linked to what are known as call capabilities.<br/>
In other words, this means that a call feature is available when the `CallService` has determined that it has the capability to do so.<br/>
**For this reason, it is imperative to subscribe to event *ON_CALL_CAPABILITIES_UPDATED* and to detect any changes in the new capabilities received.**

> 💡 **Note**  
> It is important to understand that the use of some APIs is only recommended if the associated capability is set to true.<br/>
> Otherwise, the request may be ignored (no action taken afterwards) or rejected with an error.

The way in which a call has a capability depends on several factors, which may be static or dynamic, such as
- The type of call (Phone or WebRTC).
- For a phone call, the PBX managing the phone call: Rainbow Hub or Rainbow Hybrid (OXO or OXE) telephone system.
- The telephone status of the call.
- The profile of the connected user, in particular the telephone numbers associated with them.

As a result, the way in which an API will work can also depend on these factors and the different behaviors will be explained.

These APIs can be classified as follows:

**APIS for call features.**
+ [answer](#answer)
+ [release](#release)
+ [hold](#hold)
+ [retrieve](#retrieve)
+ [sendDTMF](#senddtmf)
+ [addParticipantsToCall](#addparticipantstocall)
+ [activateConference](#activateconf)
+ [blindTransfer](#blindtransfer)
+ [deflectToVoicemail](#deflecttovoicemail)
+ [deflectToPhoneNumber](#deflecttophonenumber)
+ [transferToOtherCall](#transfertoothercall)

**APIs for managing the medias of a call.**
+ [mute](#mute)
+ [unmute](#unmute)
+ [addAudio](#addaudio)
+ [addVideo](#addvideo)
+ [addSharing](#addsharing)
+ [removeVideo](#removevideo)
+ [removeSharing](#removesharing)
+ [attachLocalVideoStream](#attachlocalvideostream)
+ [attachLocalSharingStream](#attachlocalsharingstream)
+ [attachRemoteVideoStream](#attachremotevideostream)
+ [attachRemoteSharingStream](#attachremotesharingstream)


### <a id="answer" name="answer"></a>Answer the call
The ***answer*** method allows to answer the current incoming call.<br/>
A call can be answered with audio (default mode) and video if the incoming call contains video. This information can be checked in the call property *remoteMedias.video*.

🔒 Required capability: *capabilities.answer*

```ts
// Answer a call with audio only
const call: Call = ... ;
await call.answer();

// Answer a call with audio and video
const call: Call = ... ;
await call.answer(true);
```

### <a id="release" name="release"></a>Release the call
The ***release*** method allows to end a call in various situations:
- Decline an incoming call.

In this case, the impact on the caller side differs according to the type of call made:
| Type of call |    Caller side   |
| :------------------ | :-------------- |
| WebRTC  | The call is released |
| Rainbow Hub  | The call may be redirected to the called party's voicemail |
| Rainbow Hybrid  | <span style="color: red">TODO: To be completed</span> |
- Stop an outgoing call.
- End the conversation in progress.

🔒 Required capability: *capabilities.release*
```ts
const call: Call = ... ;
await call.release(); 
```

### <a id="hold" name="hold"></a>Put the call on hold
The ***hold*** method allows to put on hold the call.

> 💡 **Important Note**  
> For the call on hold, the hold-on tone is managed differently depending on the type of call:<br/>
> - For a WebRTC call, no hold hone is played, **it must be managed on the user interface side.**.<br/>
> - For a phone call, it is managed (so played) by the telephone system (Rainbow Hub or Rainbow Hybrid) associated with the connected user.

🔒 Required capability: *capabilities.hold*
```ts
const call: Call = ... ;
await call.hold(); 
```

### <a id="retrieve" name="retrieve"></a>Retrieve from hold the call
The ***retrieve*** method allows to retrieve from hold the call.

🔒 Required capability: *capabilities.retrieve*
```ts
const call: Call = ... ;
await call.retrieve(); 
```

### <a id="senddtmf" name="senddtmf"></a>Send DTMF signal to the call
The ***sendDTMF*** method allows to send DTMF signal to the call.<br/>
The allowed DTMF characters are the ten single digits (0..9), the letters (a,b,c,d), the asterisk (*) and the pound sign (#).

🔒 Required capability: *capabilities.dtmf*
```ts
// Send some DTMF characters to navigate through an automated telephone menu.
const call: Call = ... ;
call.sendDTMF('123456789ABCD*#'); 
```

### <a id="addparticipantstocall" name="addparticipantstocall"></a>Add participants to the call
The ***addParticipantsToCall*** method allows to add participants to the current call.<br/>
A participant can be another Rainbow user or a telephone number (if supported by the PBX system associated with the connected user).<br/>
This will result in the creation of a new conversation containing a conference.<br/>

If the initial call was WebRTC or a phone call managed by a Rainbow Hub telephone system, a conference bubble will be created.<br/>
If the initial call was a phone call managed by a Rainbow Hybrid telephone system, a conference call will be set up depending on the PBX's capabilities.<br/>

🔒 Required capability: *capabilities.addParticipantsToCall*
```ts
// Add user A and an external number to the current call
const call: Call = ... ;
const userA: User = ...;
const participant1: CallDestination = {user: userA};
const participant2: CallDestination = {phoneNumber: "+33601020304"};

const confCall: Conversation = await call.addParticipantsToCall([participant1, participant2]); 
```

### <a id="activateconf" name="activateconf"></a>Activate a conference from 2 calls
The ***activateConference*** method allows to set up a conference from 2 calls, including the current call.<br>
The conference mode to be set up will depend on the type of the two calls taken into account (WebRTC and/or telephony).<br>
This feature is only available if there are exactly two calls on the connected user side. The telephone status of these calls must be *active* for one and *on hold* for the other.

This action lead to launch either a web conference (managed via a Rainbow bubble) or a pure telephone conference (managed by a Rainbow Hybrid (OXO/OXE) telephone system).<br>
In the first case, a new conversation is created with the web conference inside. The two calls will be "transferred" to the bubble conference.<br>
In the second case, a new 'conference' type conversation is created. This applies only with a Rainbow Hybrid (OXO or OXE) telephone system.

🔒 Required capability: *capabilities.mergeCalls*
```ts
const confCall: Conversation | undefined;
confCall = await call.activateConference(); 
```

### <a id="blindtransfer" name="blindtransfer"></a>Blind transfer the call to another destination
The ***blindTransfer*** method allows to transfer the current **active** call to another destination which could be any rainbow user or an external destination.<br/>

In both cases, a destination number must be specified:
- A telephone number defined in the profile of the Rainbow user to whom the call is to be transferred.<br/>
- A public PSTN number in the case of an external transfer.

This feature is available only if the connected user is behind a Rainbow Hub telephone system.

🔒 Required capability: *capabilities.blindTransfer*
```ts
// The user receiving the blind transfer
const call: Call = ... ;
const userA: User = ...;
const transferDestination: CallDestination;

transferDestination.user = userA;
transferDestination.phoneNumber = userA.phoneInternalNumber;

await call.blindTransfer(transferDestination);  
```

### <a id="deflecttovoicemail" name="deflecttovoicemail"></a>Redirect the incoming call to the voice mail
The ***deflectToVoicemail*** method allows to redirect the current incoming call to the voice mail.<br/>
This feature is available only for a phone call and if the connected user is behind a Rainbow Hybrid telephone system.

🔒 Required capability: *capabilities.deflectToVoicemail*
```ts
const call: Call = ... ;
await call.deflectToVoicemail(); 
```

### <a id="deflecttophonenumber" name="deflecttophonenumber"></a>Redirect the incoming call to a specified phone number
The ***deflectToPhoneNumber*** method allows to redirect the incoming call from a Rainbow user to a phone number defined in its profile.<br/>
The list of phone numbers to which the incoming call can be redirected is provided by the call capabilities, more precisely in the *capabilities.deflectPhoneNumberDestinations* call property. This list of numbers comes from the telephone numbers defined in the remote Rainbow user's profile (for example its personal phone or mobile). No other number can be specified.

🔒 Required capability: *capabilities.deflectToPhoneNumber*
```ts
const call: Call = ... ;

// Redirect the call to the first available number
if (call.capabilities.deflectPhoneNumberDestinations.length > 0) {
    await call.deflectToPhoneNumber(call.capabilities.deflectPhoneNumberDestinations[0].number);
}
```

### <a id="transfertoothercall" name="transfertoothercall"></a>Transfer the call to another call
The ***transferToOtherCall*** method allows to transfer the current call to another call.<br/>
If the destination call is not specified, then the transfer will be done towards the current active call.<br/>
The list of destination calls to which we can transfer the call current is provided by the call capabilities, more precisely in the *capabilities.transferCallDestinations* call property.

🔒 Required capability: *capabilities.transferToOtherCall*
```ts
const call: Call = ... ;

// Redirect the call to the first other available call
if (call.capabilities.transferCallDestinations.length > 0) {
    await call.transferToOtherCall(call.capabilities.transferCallDestinations[0]);
}
```

### <a id="mute" name="mute"></a>Mute the call
The ***mute*** method allows to mute the call on the connected user side.<br/>
The current value of the mute status can be retrieved in the *isMuted* call property.

🔒 Required capability: *capabilities.mute*
```ts
const call: Call = ... ;
call.mute(); 
```

### <a id="unmute" name="unmute"></a>Unmute the call
The ***unmute*** method allows to unmute the call on the connected user side.<br/>
The current value of the mute status can be retrieved in the *isMuted* call property.

🔒 Required capability: *capabilities.unmute*
```ts
const call: Call = ... ;
call.unmute(); 
```

### <a id="addaudio" name="addaudio"></a>Add the audio media to the call
The ***addAudio*** method allows to add the audio media to the call.<br/>
This feature is available only for WebRTC calls.
At any time, the audio media usage status on the connected user side can be retrieved in the *localMedias.audio* call property.

🔒 Required capability: *capabilities.addAudio*
```ts
const call: Call = ... ;
await call.addAudio(); 
```

### <a id="addvideo" name="addvideo"></a>Add the video media to the call
The ***addVideo*** method allows the connected user to add the video media to the call by using a camera.<br/>
This feature is available only for WebRTC calls.<br/>
At any time, the video media usage status on the connected user side can be retrieved in the *localMedias.video* call property.

🔒 Required capability: *capabilities.addVideo*
```ts
const call: Call = ... ;
await call.addVideo(); 
```

### <a id="addsharing" name="addsharing"></a>Add the sharing media to the call
The ***addSharing*** method allows the connected user to add the sharing media to the call for sharing a browser tab, a window or the entire screen.<br/>
This feature is available only for WebRTC calls.<br/>
At any time, the sharing media usage status on the connected user side can be retrieved in the *localMedias.sharing* call property.

🔒 Required capability: *capabilities.addSharing*
```ts
const call: Call = ... ;
await call.addSharing(); 
```

### <a id="removevideo" name="removevideo"></a>Remove the video media to the call
The ***removeVideo*** method allows the connected user to remove the video media from the call.<br/>
This feature is available only for WebRTC calls.<br/>
At any time, the video media usage status on the connected user side can be retrieved in the *localMedias.video* call property.

🔒 Required capability: *capabilities.removeVideo*
```ts
const call: Call = ... ;
await call.removeVideo(); 
```

### <a id="removesharing" name="removesharing"></a>Remove the sharing media to the call
The ***removeSharing*** method allows the connected user to remove the sharing media from the call.<br/>
This feature is available only for WebRTC calls.<br/>
At any time, the sharing media usage status on the connected user side can be retrieved in the *localMedias.sharing* call property.

🔒 Required capability: *capabilities.removeSharing*
```ts
const call: Call = ... ;
await call.removeSharing(); 
```

### <a id="attachlocalvideostream" name="attachlocalvideostream"></a>Attach the local video stream to a HTML element
If the video media is in use on the connected user side (*localMedias.video* call property must be *true*), it is possible to retrieve the associated video stream and, for example, display it. The operation simply involves attaching the local video stream to a given HTML \<video\> tag element.<br/>

The attach operation has to be done only once.<br/>
However, if the connected user decides to remove the video media from the call by using the *call.removeVideo()* API, no detach operation is required (and in any case not offered).  The 'pipe' remains always opened without an active stream. The management (use or not) of this stream must therefore be done accordingly in the user interface.

> 💡 **Note** 
>  When an ON_CALL_MEDIA_UPDATED event is received, the data *localMedias.video* can be checked to detect any change in the local stream associated with the video. This detection can be done in addition to the correct completion of the *addVideo()* or *removeVideo()* API.


```html
<video id='localVideoMedia' autoplay muted width='...' height='...'></video>
```
```ts
const call: Call = ... ;

if (call.localMedias.video) { 
    call.attachLocalVideoStream('localVideoMedia');                  
} 
```

### <a id="attachlocalsharingstream" name="attachlocalsharingstream"></a>Attach the local sharing stream to a HTML element
If the sharing media is in use on the connected user side (*localMedias.sharing* call property must be *true*), it is possible to retrieve the associated sharing stream and, for example, display it. The operation simply involves attaching the local sharing stream to a given HTML \<video\> tag element.<br/>

The attach operation has to be done only once.<br/>
However, if the connected user decides to remove the sharing media from the call by using the *call.removeSharing()* API, no detach operation is required (and in any case not offered).  The 'pipe' remains always opened without an active stream. The management (use or not) of this stream must therefore be done accordingly in the user interface.

> 💡 **Note** 
>  When an ON_CALL_MEDIA_UPDATED event is received, the data *localMedias.sharing* can be checked to detect any change in the local stream associated with the sharing. This detection can be done in addition to the correct completion of the *addSharing()* *removeSharing()* API.

```html
<video id='localSharingMedia' autoplay muted width='...' height='...'></video>
```
```ts
const call: Call = ... ;

if (call.localMedias.sharing) { 
    call.attachLocalSharingStream('localSharingMedia');                  
} 
```

### <a id="attachremotevideostream" name="attachremotevideostream"></a>Attach the remote video stream to a HTML element
If the remote user of the call has activated his camera (*RemoteMedias.video* call property must be *true*), it is possible to retrieve the associated video stream and, for example, display it. The operation simply involves attaching the remote video stream to a given HTML \<video\> tag element.<br/>

The attach operation has to be done only once.<br/>
However, if the remote user decides to stop using his camera, no detach operation is required (and in any case not offered). The 'pipe' remains always opened without an active stream. The management (use or not) of this stream must therefore be done accordingly in the user interface.

> 💡 **Note** 
>  When an ON_CALL_MEDIA_UPDATED event is received, the data *RemoteMedias.video* must be checked to detect any change in the remote stream associated with the video. This is the only way for the connected user to be informed that the remote user has stopped using the camera.

```html
<video id='remoteVideoMedia' autoplay muted width='...' height='...'></video>
```
```ts
const call: Call = ... ;

if (call.remoteMedias.video) { 
    call.attachRemoteVideoStream('remoteVideoMedia');                  
} 
```

### <a id="attachremotesharingstream" name="attachremotesharingstream"></a>Attach the remote video stream to a HTML element
If the remote user of the call has activated screen sharing (*RemoteMedias.sharing* call property must be *true*), it is possible to retrieve the associated sharing stream and, for example, display it. The operation simply involves attaching the remote sharing stream to a given HTML \<video\> tag element.<br/>

The attach operation has to be done only once.<br/>
However, if the remote user decides to stop the screen sharing, no detach operation is required (and in any case not offered). The 'pipe' remains always opened without an active stream. The management (use or not) of this stream must therefore be done accordingly in the user interface.

> 💡 **Note** 
>  When an ON_CALL_MEDIA_UPDATED event is received, the data *RemoteMedias.sharing* must be checked to detect any change in the remote stream associated with the sharing. This is the only way for the connected user to be informed that the remote user has stopped sharing his screen.

```html
<video id='remoteSharingMedia' autoplay muted width='...' height='...'></video>
```
```ts
const call: Call = ... ;

if (call.remoteMedias.sharing) { 
    call.attachRemoteSharingStream('remoteSharingMedia');                  
} 
```
