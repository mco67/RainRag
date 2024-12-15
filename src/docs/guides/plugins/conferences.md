# Web conferences plugin

## The webConferences, the heart of bubble audio and/or video communication

A conference is always attached to a bubble. The conference is the audio counterpart to text messages exchanged in the bubble. When a conference is started in a bubble, all members of the bubble are authorized to join it, so they can hear and/or see each other, as well as share a view of their screen or applications.


### Conferences Roles
But, before we dive into how to manage a conference, let's start by understanding the different roles that conference members can have.

A conference is attached to a bubble, the members of a conference are the members of the bubble, the roles of the participants in a conference are therefore the same as in the bubble.

- **Owner** : The owner of the bubble is the one who created it, he therefore has the right of life and death over this bubble and therefore over the conferences attached to this bubble. He can start and end a conference.

- **Moderator** : The owner of the bubble can decide to delegate some of his power, he can assign the role of "**Moderator**" to some or all of the members of the bubble. A Moderator has the right to start and end a conference.

- **User** : The member has no control over the conferences, he can simply join them when invited and leave them at any time.


Now that the roles are defined, this tutorial will explain in details how to create, join, leave, destroy and manage a conference.

## Add the WebConferencePlugin in our project

Please note that the [`WebConferenceService`](/doc/page/api/WebConferences/interfaces/WebConferenceService) is not part of the Rainbow core service and is available via the `WebConferencePlugin`. The first thing to do is to add the conference plugin to our project.

``` ts
import { WebConferencePlugin } from 'rainbow-web-sdk/lib';
...
this.rainbowSDK = RainbowSDK.create({
    host: { server, apiClientKey, appModuleKey },
    plugins: [ 
        WebConferencePlugin, 
        ... 
    ], 
    autoLogin: true
})
```

Now let's look at how to create a conference and how to access to an existing conference.

## The WebConferenceService object

The [`WebConferenceService`](/doc/page/api/WebConferences/interfaces/WebConferenceService) object is the entry point for managing the web conferences lifecycle in the Rainbow SDK.<br/>

Here are the main [`WebConferenceService`](/doc/page/api/WebConferences/interfaces/WebConferenceService) methods: 

+ [startConference](#startConference)
+ [getConference](#getConference)
+ [subscribe](#subscribe)

### <a id="startConference" name="startConference"></a> Start a webConference
Starting a webConference is a bit like opening a meeting room in real life. As **Owner** or as **Moderator** of the conference, you can open the room door, let your colleagues settle in and start chatting. You don't have to join them immediately.

Starting a new webConference can be done using the API `startConference()`. As already mentioned above, a conference is always attached to a bubble, so it's only natural to have to provide a bubble (only **Owner** and **Moderator** members are allowed to start a conference).

When this API is called, all bubble members will informed by receiving a `WebConferenceServiceEvents.ON_WEBCONFERENCE_STARTED`.

```ts
// The startConference method allows to start a conference in a bubble, it creates and returns a WebConference instance
const bubble: Bubble = ...
// Only room Owner or Moderator are allowed to create a conference 
// So, check if bubble user role is moderator or owner
if (bubble.isOwner || bubble.isModerator) {
    const webConference = await this.rainbowSDK.webConferenceService?.startConference(bubble);
}
```

### <a id="getConference" name="getConference"></a> Get a webConference already associated to a bubble
This method allows you to determine for a bubble whether a conference has already been started.
To find out whether a bubble has an active conference, simply use Bubble's ``isWebConferenceBubble`` method.

```ts
// Fetch the webConference object already available for a bubble (if any)
// This method is available for all bubble members
const bubble: Bubble = ...
if (bubble.isWebConferenceBubble()) {
    const webConference = this.rainbowSDK.webConferenceService?.getConference(bubble);
    if (webConference) {
        ...
    }
}
```

### <a id="subscribe" name="subscribe"></a> Listening WebConferenceService events
In this section we'll first look at how to listen for [`WebConferenceService`](/doc/page/api/WebConferences/interfaces/WebConferenceService) events.
To be informed of WebConferenceService availability or end you can subscribe to WebConferenceService events:

```ts
const webConferenceServiceSubscription = this.webConferenceService?.subscribe((event: RBEvent) => {
    switch(event.name) {
        case WebConferenceServiceEvents.ON_WEBCONFERENCE_STARTED:
            // This event is fired for all bubble when a new conference has been started.
            // You can retrieve the new conference in event data : 
            let conference = event.data.webConference;
            break;
        case WebConferenceServiceEvents.ON_WEBCONFERENCE_END: 
            // This event is fired for all bubble member when a existing conference is ended. 
            // You can retreive the ended conference in event data : 
            let conference = event.data.webConference;
            break;
        default: break;
    }
});
```

> ⚠ **WARNING**  
> To avoid memory leaks  don't forget to unsubscribe from events when you no longer need them !!!
```ts
webConferenceServiceSubscription.unsubscribe();
```

The previous methods return a webConference object. Now let's take a look at this `WebConference` API

## The WebConference object

The `WebConference` object is central to conference management in Rainbow SDKs. In fact, it is the only entry point for manipulating a conference.<br/> We listen to its events to track the progress of a conference, and use its methods to control it.

Here are the main WebConference methods: 

+ [subscribe](#subscribeModel)
+ [join](#joinConference)
+ [leave](#leaveConference)
+ [stop](#stopConference)
+ [mute](#muteConference)
+ [unmute](#muteConference)

### <a id="subscribeModel" name="subscribeModel"></a> Subscribe to webConference events

To be informed of WebConference changes you can subscribe to WebConferencevents:

```ts
const webConference = ...;
const webConferenceSubscription = this.webConference.subscribe((event: RBEvent) => {
    switch(event.name) {
        case WebConferenceEvents.ON_STATUS_CHANGE:
            // This event is fired when the webConference connection status is changed.
            // You can retreive the conference status in event data
            let status: WebConferenceStatus = this.webConference.status;
            break;
        case WebConferenceEvents.ON_PARTICIPANT_MUTE_CHANGE: 
            // This event is triggered when the mute status of a conference participant (including the connectedUser) changes. 
            let participant: WebConferenceParticipant = event.data.participant; 
            let participantMuteStatus = participant.isMuted;
            break;
        default: break;
    }
});
```

> ⚠ **WARNING**  
> To avoid memory leaks  don't forget to unsubscribe from events when you no longer need them !!!
```ts
webConferenceSubscription.unsubscribe();
```

### <a id="joinConference" name="joinConference"></a> Join a webConference
Now that your conference has started (you've opened the door), you and the other members of the bubble can join it.
The current value of `webConference.status` is `WebConferenceStatus.UNJOINED`.

Each member of the bubble has been informed of the start of the conference and has been able to retrieve the associated `WebConference` instance from the event.

To join the conference, just use the `join()` API. 

```ts
// Join a webConference
const webConference = ...; // Get from the startConference method or from the event
await webConference.join();
```
The new `webConference.status` value is now `WebConferenceStatus.CONNECTED"`.

### <a id="leaveConference" name="leaveConference"></a> Leave a webConference
The leave method allows you to leave a conference. As long as the conference is started, 
bubble members (with the exception of the owner) can leave and rejoin the conference at will. 

```ts
// Leave the conference 
const webConference = ...;
await webConference.leave();
```

### <a id="stopConference" name="stopConference"></a> Stop a webConference
The stop method allows you to stop a conference (only available for the conferencer owner/creator)
```ts
// Stop the conference 
const webConference = ...;
await webConference.stop();
```

### <a id="muteConference" name="muteConference"></a> Mute or unmute a webConference
The mute and unmute methods allow to mute and unmute the local participant mic.
```ts
// Mute local participant 
const webConference = ...;
await webConference.mute();

// Unmute local participant 
await webConference.unmute();
```
