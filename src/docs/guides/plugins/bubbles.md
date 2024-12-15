# Bubbles plugin

Using the Rainbow SDK for Web, you can have discussions and share files with several persons in a "private" area called a Bubble.

A Bubble is a "collaboration space" where you can invite Rainbow users to discuss and share files together.

This tutorial will explain in details how to create a new bubble, invite Rainbow users and discuss together.

Please note that the `BubbleService` is not part of the Rainbow core service and is available via the `BubblePlugin`. The first thing to do is to add the bubble plugin to our project.

## Add the BubblePlugin in our project

``` ts
import { BubblePlugin } from 'rainbow-web-sdk/lib';
...
this.rainbowSDK = RainbowSDK.create({
    host: { server, apiClientKey, appModuleKey },
    plugins: [ BubblesPlugin ], 
    autoLogin: true
})
```

The ```BubbleService``` is the entry point for all bubble manipulations.

``` ts
import { BubbleService } from 'rainbow-web-sdk';
...
constructor() {
	this.sdk = RainbowSDK.getInstance();
    this.bubbleService: BubbleService = this.sdk.bubbleService;
}
```

## BubbleService API

Now let's look at how to create and to access to the existing bubbles.<br/>
Here are the main BubbleService methods: 

+ [subscribe](#subscribe)
+ [createBubble](#createBubble)
+ [getBubbles](#getBubbles)
+ [getMyBubbles](#getBubbles)
+ [getBubbleInvitations](#getBubbleInvitations)
+ [searchBubbles](#searchBubbles)

In this section we'll also look at how to listen for `bubbleService` events.

### <a id="subscribe" name="subscribe"></a> Listening bubbleService events
To be informed of bubbleService modification you can subscribe to bubbleService events:

```ts
const bubbleServiceSubscription = this.bubbleService?.subscribe((event: RBEvent) => {
    switch(event.name) {
        case BubbleServiceEvents.ON_SERVICE_STARTED: ... break;
        case BubbleServiceEvents.ON_NEW_BUBBLE_CREATED: ... break;
        case BubbleServiceEvents.ON_INVITATION_RECEIVED: ... break;
        case BubbleServiceEvents.ON_MY_USER_UPDATE: ... break;
        case BubbleServiceEvents.ON_USER_UPDATE: ... break;
        default: break;
    }
});
```
### <a id="createBubble" name="createBubble"></a> Creating a new bubble

Creating a new bubble can be done using the API createBubble(). You have to provide a name and a bubbleData.

By default, when you create a bubble, newcomers do not see previous messages exchanged in that bubble before they join. Creating a new bubble with history can be done this way:

```ts
// Create the bubble CreateBubbleData object
// Please see API documentation to know all the available parameters
// The following CreateBubbleData will create a bubble with a topic and with history

const bubbleData: CreateBubbleData = { 
    topic: 'My bubble with history',
    noHistory: false
}; 
const bubble: Bubble = await this.bubbleService?.createBubble('MyBubble', bubbleData);
```

### <a id="getBubbles" name="getBubbles"></a> Get existing bubbles
There are two simple ways of finding bubbles you belong to: `getBubbles` and `getMyBubbles`.
Let's see how to use them: 
```ts
// Get all bubbles you belong to (The bubbles you own and the bubbles in which you participate)
const allBubbles: Bubble[] = this.bubbleService?.getBubbles();

// Get all bubbles you own
const myBubbles: Bubble[] = this.sdk.bubbleservice?.getMyBubbles();
```

### <a id="getBubbleInvitations" name="getBubbleInvitations"></a> Get invitations to join a bubble
Invitation to join a bubble is in fact a bubble with the specific status : `BubbleUserStatus.INVITED`.
The API 'getBubbleInvitations' permits to fetch such invitation.
```ts
const bubbleWhereIAmInvited: Bubble[] = this.bubbleService?.getBubbleInvitations();
```
We'll see later how to accept or decline a bubble invitation.

### <a id="searchBubbles" name="searchBubbles"></a> Search for bubbles
The API ***searchBubbles*** allows to search for bubbles that match a search criteria applied on some name properties such as 
- The name of the bubble
- The name of some tag(s) set for the bubble
- The name of bubble participants.

One or more name properties can be optionally specified to be used as scope for the search.\
If no scope is specified, the search is performed by default on the name of the bubble only.\
The search is performed in all bubbles visible to you, i.e. those you own and the bubbles in which you participate.

As a result, it is possible to specify the sorting order of the bubbles found.\
By default, the list of bubbles is sorted by name.

#### What do I receive in response to my search request?
+ An array of bubbles (as Bubble) matching the search criteria.\
If no bubble has been found, an empty array is returned.
+ For each bubble returned, information indicating how it was found (for example, by its name).\
Note that a bubble can be found in more than one way at a time (for example, by its name and the name of a tag).

`BubbleSearchResult` interface implements the list of data provided as the result of a search for bubbles.

```ts
// Search for bubbles with the name 'kate' or with a participant with this name
// Returned list is sorted by date of last activity
const bubbleSearchOptions: SearchBubblesOptions = {
    scope: [SearchBubblesScope.SEARCH_BY_TAG_NAME, SearchBubblesScope.SEARCH_BY_PARTICIPANT_NAME],
    sortBy: SearchBubblesSortBy.SORT_BY_LAST_ACTIVITY
};

const searchBubblesResult: BubbleSearchResult[] = await this.bubbleService.searchBubbles('kate', bubbleSearchOptions);
```

## Bubble API
> Now let's look at how to administer your newly created bubble. Note that, with a few exceptions, the various APIs described below can only be used by the owner and users with `moderator` privilege.<br/><br/>Not all the APIs available on bubbles will be presented here. For more information, please consult the API documentation.

Here are the main Bubble methods: 

+ [subscribe](#subscribeBubble)
+ [setCustomAvatar](#setCustomAvatar)
+ [removeCustomAvatar](#setCustomAvatar)
+ [addUser](#addUser)
+ [inviteUsers](#inviteUsers)
+ [removeUser](#removeUser)
+ [changeOwner](#changeOwner)
+ [updateUserPrivilege](#updateUserPrivilege)
+ [updateSettings](#updateSettings)
+ [leave](#leave)
+ [delete](#delete)
+ [createAccessCode](#accessCode)
+ [resetAccessCode](#accessCode)
+ [deleteAccessCode](#accessCode)
+ [getAccessCode](#accessCode)

### <a id="subscribeBubble" name="subscribeBubble"></a> Listening bubble events
To be informed of bubble modification you can subscribe to bubble events
```ts
const bubble: Bubble = ... ;

// To be informed of bubble modification you can subscribe to bubble events
const bubbleSubscription = bubble.subscribe((event: RBEvent) => {
    switch(event.name) {
        case BubbleEvents.ON_STATUS_UPDATE: ... break;
        case BubbleEvents.ON_AVATAR_UPDATE: ... break;
        case BubbleEvents.ON_DIAL_IN_CODE_UPDATE: ... break; 
        case BubbleEvents.ON_INCLUDE_ALL_PHONENUMBER_UPDATE: ... break;
        case BubbleEvents.ON_DIAL_IN_PHONENUMBER_UPDATE: ... break;
        default: break;
    }
});
```

### <a id="setCustomAvatar" name="setCustomAvatar"></a> Add or remove a custom avatar to Bubble

As with the users, you can replace the default avatar with a bubble.

```ts
// A bubble
const bubble: Bubble = ... ;

// Convert image from url to base64
const base64Avatar = await this.sdk.utils.getBase64Image('assets/images/zerock.jpg');
// Set bubble custom avatar
await bubble.setCustomAvatar(base64Avatar);

// Reset the bubble avatar to default avatar
await bubble.removeCustomAvatar();
```

### Add a user to a bubble
Now it's a matter of adding users to our bubble.<br/> 

#### Bubble user privileges
In a bubble we'll meet differents type of users : `user` and `moderator` users.

Members with `user` privilege can only collaborate in the bubble:
+ Sending and receiving messages
+ Sending and downloading files

Members with `moderator` privilege can collaborate and administrate the bubble. Administrative tasks reserved to moderator are:

+ Changing the description of the bubble
+ Inviting new users
+ Removing existing users

#### <a id="addUser" name="addUser"></a> Add bubble user 
In this first example we will add an existing Rainbow user to a bubble, with `user` privilege and by sending an invitation, ie: this user has to accept the bubble invitation before it can communicate in the bubble. 

```ts
const bubble: Bubble = ... ;
const user: User = ... ;
bubble.addUser(user, BubbleUserPrivilege.USER, 'A custom invitation message');
```

In this second example we will add an existing Rainbow user to a bubble, with `moderator` privilege and without sending an invitation: ie: this user will be immediately add into the bubble (no need to this user to accept the invitation).

```ts
const bubble: Bubble = ... ;
const user: User = ... ;
bubble.addUser(user, BubbleUserPrivilege.MODERATOR, null, true);
```

### <a id="inviteUsers" name="inviteUsers"></a> "Mass-inviting" people in a bubble

It's often useful to be able to invite a list of people to join a bubble, in which case we talk about mass-inviting. 
The `inviteUsers` API offers this service. 
As the owner or moderator of a bubble, you can invite participants to your bubble by passing a list of users or emails directly to the inviteUsers API.

```ts
const bubble: Bubble = ... ;
const user1: User = ... ;
const user2: User = ... ;
const email1: string = 'arka@noid.com';
const email2: string = 'block@out.com';

// Invite your bubble users
await bubble.inviteUsers([user1, user2], [email1, email2]);
```

### <a id="removeUser" name="removeUser"></a> Remove user from a bubble 
As the owner or moderator of a bubble, you can remove a user form the bubble usint the `removeUser` API

```ts
const bubble: Bubble = ... ;
const userAlreadyInTheBubble: User = ... ;
await bubble.removeUser(userAlreadyInTheBubble);
```

### <a id="changeOwner" name="changeOwner"></a> Change bubble owner 
As the owner of a bubble, you can choose to change the owner of a bubble using the `changeOwner` API.

```ts
const bubble: Bubble = ... ;
const newOwnerUser: User = ... ;
await bubble.changeOwner(newOwnerUser);
```

### <a id="changeOwner" name="changeOwner"></a> Update bubble participant privilege
As the owner or moderator of a bubble, you can change the privileges of a user in this bubble at any time.
```ts
const bubble: Bubble = ... ;
const userAlreadyInTheBubble: User = ... ;
// Give the moderator privilege to a user
await bubble.updateUserPrivilege(userAlreadyInTheBubble, BubbleUserPrivilege.MODERATOR);
```

### <a id="updateSettings" name="updateSettings"></a> Update bubble settings
As a bubble owner or moderator, you can easily change the settings for your bubble.
> Available settings parameters are constraints by the `BubbleSettings` type.

```ts
const bubble: Bubble = ... ;
const settings: BubbleSettings = { topic: 'A new topic' };
// Apply the new settings to the bubble
await bubble.updateSettings(settings);
```

### <a id="leave" name="leave"></a> Leave a bubble 
As participant of a bubble, you can leave this bubble using the `leave` API.

If createArchive is TRUE, the bubble will be archived, i.e. the user can only read the content that's already in the bubble, but no further action can be done inside the bubble

The participant will go to UNSUBSCRIBED state (read-only)

```ts
const bubble: Bubble = ... ;
await bubble.leave();
```

### <a id="delete" name="delete"></a> Delete a bubble 
As owner of a bubble, you can delete this bubble using the `delete` API

If createArchive parameter is TRUE, the bubble will be archived, i.e. all users can only read the content that's already in the bubble, but no further action can be done inside the bubble.

All participants in the bubble will go to UNSUBSCRIBED state (read-only)

```ts
const bubble: Bubble = ... ;
// Delete the bubble but create an archive
await bubble.delete(true);
```


### <a id="accessCode" name="accessCode"></a> Generate bubble access code 
As owner of a bubble, you can create a "public" access code for a bubble.
This access code allows you to open your bubble to guest users.
A guest user is a temporary Rainbow user only used to reached a bubble.

#### How to proceed ?

First as room owner create a public access code for this bubble using the bubble `createAccessCode` api.

```ts
const bubble: Bubble = ... ;
// Create a public access code for this bubble
const accessCode = await bubble.createAccessCode();

// Note that you can reset or delete this access code with the following methods

// ResetAccess code (regenarate an access code and invalidate the existing one)
const newAccessCode = await bubble.resetAccessCode();

// Delete the current access code
await bubble.resetAccessCode();

// Finally the following methods permits to get a bubble current access code
const currentAccessCode = await this.bubble.getAccessCode();
```

#### Now let's look at how to use this access code.

A guest user does not have an account on Rainbow. Their account will be created on the fly when they enter the bubble.
Such a user will therefore use a different authentication method to that used by a regular user.

To do this, it will use the `logonInBubbleWithAccessCode` method of the `connectionService`.
As other logon method this method will return a `ConnectedUserInstance`

```ts
try { 
    const accessCode: string = ...;
    const userConnected = await this.rainbowSDK.connectionService.logonInBubbleWithAccessCode(accessCode); 
}
catch (error: any) { console.error(`[testAppli] ${error.message}`);
```
It's up to the developer to modify the user's identity information (name, surname, etc.) using standard `ConnectedUser` methods.

You can then use this guest user as classic user.
<br/>
<br/>

[Continue to conversations](/doc/page/guides/plugins/conversations)
