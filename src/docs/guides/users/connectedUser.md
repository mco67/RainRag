# The connected user
In the previous steps, we have learn how to start the Rainbow SDK and how to logon a user.<br/>
In a very original way, we're going to call this connected user the `connectedUser`

Once connected, this user can be accessed at any time via the RainbowSDK singleton.<br/>
As already say, the RainbowSDK object is a singleton object which can be accessed at any time and everywhere in your application via it's static `getInstance` method.

The `connectedUser` is an instance of `ConnectedUser` class which inherits of `User` class, so our `connectedUser` is a regular user but with some facilities.

## How to fetch this connected user

It's really easy :
``` ts
// Get the Rainbow SDK singleton instance
const sdk: RainbowSDK = RainbowSDK.getInstance();

// Now get the connected user
const connectedUser: ConnectedUser = sdk.connectedUser;
```

## ConnectedUser methods
As already said, the connected User is a regular Rainbow `User` with extended facilities. It represents the user of the application, so it will offer actions for modifying information about the user:.<br/>
Here is the list of available apis : 
+ [setPresenceStatus](#setPresenceStatus)
+ [getAvailablePresenceStatusList](#getAvailablePresenceStatusList)
+ [updateProfile](#updateProfile)
+ [updateCustomData](#updateCustomData)
+ [setCustomAvatar](#setCustomAvatar)
+ [removeCustomAvatar](#removeCustomAvatar)
+ [updatePassword](#updatePassword)
+ [deleteAccount](#deleteAccount)

In the following parts of this document we will describe quickly the usage of these methods. But, for more information please have a look on the API documentation.


### <a id="setPresenceStatus" name="setPresenceStatus"></a> Set the connected user presence status 

The *"setPresenceStatus"* method permits to set the connected user presence status.<br/> This is the presence status which is shared with the other Rainbow users.<br/>

Available values are : 

+ `UserPresenceStatus.ONLINE` : user goes to online (or can 'exit') any manual state; In case of a call in progress, the user will go to busy state;
+ `UserPresenceStatus.AWAY` : a manual Away state
+ `UserPresenceStatus.XA` : 'invisble' or 'appear offline' manual state
+ `UserPresenceStatus.DND` : Do not disturb manual state

Available status are given by the `getAvailablePresenceStatusList` method.

``` ts
// Set the connectedUser presence status to AWAY
await sdk.connectedUser.setPresenceStatus(UserPresenceStatus.AWAY);
```

### <a id="getAvailablePresenceStatusList" name="getAvailablePresenceStatusList"></a> Get the available presence status list for the connected user

The *"getAvailablePresenceStatusList"* method returns a list of status that the user can currently set.<br/> Depending of the user state at a given time, all values are not available (for example when the user is busy on phone, it is not possible to change it's status presence)

``` ts
// Get the current available presence status list
const statuses: string[] = await sdk.connectedUser.getAvailablePresenceStatusList();
```

### <a id="updateProfile" name="updateProfile"></a> Update userConnected profile data

The *"updateProfile"* method allows to update the user's profile data (name, emails, numbers, etc). Updatable user data are described in the *"UserProfile"* interface.

``` ts
// First create the UserProfile object
const userProfile: UserProfile = { title: 'myTitle' };

// Update user profile
await this.sdk.connectedUser?.updateProfile(userProfile);
```

### <a id="updateCustomData" name="updateCustomData"></a> Update userConnected custom data

The *"updateCustomData"* method allows to update the user's custom data.
TODO: MCO WTF ???

``` ts
const userCustomData = { ??? };
await this.sdk.connectedUser?.updateCustomData(userCustomData);
```


### <a id="setCustomAvatar" name="setCustomAvatar"></a> Set custom avatar to connected user
Users have a default avatar generated from the initials of their first and/or last names.<br/>
Ex: User John Do, will have the default avatar : `JD`.<br/>
But this avatar can be overloaded by an image chosen by the user.<br>
The *"setCustomAvatar"* method permits to overload the avatar

``` ts
// Convert image from url to base64
const base64Avatar = await this.sdk.utils.getBase64Image('assets/images/zerock.jpg');
// Set base64 avatar
await this.sdk.connectedUser?.setCustomAvatar(base64Avatar);
```

### <a id="removeCustomAvatar" name="removeCustomAvatar"></a> Remove custom avatar of the connected user
The *"removeCustomAvatar"* Restore default avatar of the connected user

``` ts        
// Remove custom connected user avatar
await this.sdk.connectedUser?.removeCustomAvatar();
```


### <a id="updatePassword" name="updatePassword"></a> Change connected user password

The *"updatePassword"* methods alow to change the current user password.
Depending on user sign-in configuration method, this method may not work.

``` ts
// Update the connectedUser password
await this.sdk.connectedUser?.updatePassword('oldPassword', 'newPassword', true);
```

### <a id="deleteAccount" name="deleteAccount"></a> Delete the connected user account

The *"deleteAccount"* method deletes the connectedUser account and all its associated data. Depending on the configuration of the company hosting the connectedUser, this method may not work.
 
> 😖 **BE CAREFULL: THIS ACTION WILL DESTROY YOUR ACCOUNT AND IS NOT CANCELABLE**

``` ts        
// Delete the connectedUser account (not cancelable)
await this.sdk.connectedUser?.deleteAccount();
```

[It's now time to interact with other users](/doc/page/guides/users/usersNetwork)
