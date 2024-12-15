# The user's Network

The user's network is the set of users, bots and connected things that have a privileged relation with you (the connected user).

By privileged relation, you have to understand that these contacts have access to your personal information as well as your availability such as your connection presence and activity and your phone presence.

That is why when someone or something wants to have a privileged relation with you, it sends you an invitation that you need to accept let it enter your network. This action is mutual. When you join the network of someone, this person or entity enters your network. Keep this in mind!

The only shortcut is that when both entities are in the same company, an auto-acceptation is done. So the invite is automatically accepted and you have nothing to do on your side.

Each entity of your network can be removed at any time.

> 💡 **NOTE**  
> In case of being removed from one's network by a user who is part of your network, you will still see him as a member of your network but without having access to his availability status.

To manage the connected user network we will use a the `UserNetworkService`.
Here is the list of available apis : 

+ [getUsers](#getUsers)
+ [removeUser](#removeUser)
+ [sendInvitation](#sendInvitation)
+ [sendInvitationByEmail](#sendInvitation)
+ [sendBulkInvitations](#sendInvitation)
+ [getSentInvitations](#answeringInvitation)
+ [getReceivedInvitations](#answeringInvitation)
+ [acceptInvitation](#answeringInvitation)
+ [declineInvitation](#answeringInvitation)
+ [subscribe](#answeringInvitation)

How to get this userNetwork service :

```ts
// get the userNetwork service
const userNetwork: UserNetworkservice = this.sdk.userNetwork;
```

## <a id="getUsers" name="getUsers"></a> Get all the userNetwork users
The *"getUsers"*  method returns all the users conatined in the userConected network.  

```ts
// Get all the userNetwork service
const networkUsers: User[] = this.sdk.userNetwork.getUsers();
```
> 💡 **NOTE**  
> It is also possible to search users in the userNetwork by using the `directorySearchService`. 

## <a id="removeUser" name="removeUser"></a> Remove a user from your network

The *"removeUser"* methods permits to remove a user from your network. As already explain, the "removed" user will not be informed that you have removed it from your network. From his point of view, you are still present in his network, only he will no longer be able to consult all your information (presence, etc...).

```ts
// The user to remove
const userToRemove: User = ...;
// remove the user from my network
await this.sdk.userNetwork.removeUser(userToRemove);
```

## <a id="sendInvitation" name="sendInvitation"></a> Invite a user to join your network

 The *"sendInvitation"* method is used to invite a Rainbow user to join our network. In the case of same company, the invitation will be auto-accepted by the distant.<br/> 
 In case of different companies, this will send an invitation and email to the distant user.
 You can also specified a custom message in the invitation.

 ```ts
// The user to invite
const userToInvite: User = ...;

// A impartial custom message
const customMessage: string = 'Hello Rainbow is top, join us!!!';

// Send the invitation 
await this.sdk.userNetwork.sendInvitation(userToInvite, customMessage);
```
You can also invite a user by it's email (Whether he's already a rainbow user or not. If the email address does not correspond to a Rainbow user, the person will receive an email inviting them to create an account).
```ts
// Send invitation by Email
await this.sdk.userNetwork.sendInvitationByEmail('gold@orak.com', 'Message from vega');
```

And finally, you can invite a group of people to join your network by providing a list of e-mail addresses.  
```ts
// Send invitation by Email
await this.sdk.userNetwork.sendBulkInvitations(['captain@flam.com', 'al@bator.com');
```

A list of sent invitations can be retrieved by using the method `getSentInvitations`.

 ```ts
 // Get the sent invitation list
const sentInvitations: NetworkInvitation[] = this.sdk.userNetwork.getSentInvitations();
```

## <a id="answeringInvitation" name="answeringInvitation"></a> Answering to network's requests

Two possibilities are available to be aware of invitations received from others users or entities:

+ Either you can retrieve the list of invitations received by calling the method `getReceivedInvitation`.
 ```ts
// Get the received invitation list
const recvInvitations: NetworkInvitation[] = this.sdk.userNetwork.getReceivedInvitation();
```

+ Or you can listen subscribe to UserNetworkService events to know in real time when someone wants to enter your network. 
```ts
this.sdk.userNetwork.subscribe((event: RBEvent<UserNetworkServiceEvents>) => {
    switch (event.name) {
        case UserNetworkServiceEvents.RAINBOW_ON_INVITATIONS_LIST_UPDATED: ... break;
        case UserNetworkServiceEvents.RAINBOW_ON_INVITATION_RECEIVED: ... break;
        case UserNetworkServiceEvents.RAINBOW_ON_INVITATION_ACCEPTED: ... break;
    } 
});
```
In both cases, you get an `NetworkInvitation` object that you can accept or decline using `acceptInvitation` or `declineInvitation` methods. 

```ts
// The received invitation
const recvInvitation: NetworkInvitation = ...;
// Accept the invitation
this.sdk.userNetwork.acceptInvitation(recvInvitation);
// Or decline  the invitation
this.sdk.userNetwork.declineInvitation(recvInvitation);
```

+ [Go to User's list](/doc/page/guides/users/usersList)
