

# UsersLists plugin

### What is a user's list?
The user lists feature makes it easier to organize and find Rainbow users you communicate with.\
A user's list is simply a set of Rainbow users that you have chosen to group together in a list according to your own criteria, for example users from the same department.\
User lists enable you to quickly establish a conversation with a Rainbow user and easily access their detailed information card (Profile, phone numbers, location, etc.).\
A Rainbow user can be a member of several lists.

> 💡 **Important note**  
> Only Rainbow users can be added in a user's list.\
> Other Rainbow items such as the Rainbow bubbles, the Rainbow Business contacts, and the Rainbow Personal contacts cannot.

A name must be associated with a user's list, and this name must be unique.\
It is also possible but optional to give to a user's list a description (to indicate what the list is about) and to mark it as favorite.\
These information about the list itself are called the "list profile". 

A user's list can only be managed and used by you, and cannot be shared.

This tutorial will explain how to create a new user's list, add, and remove users in this list and update the list profile.

Please note that the `UsersListsService` is not part of the Rainbow core service and is available via the `UsersListsPlugin`. The first thing to do is to add this plugin to our project.

## Add the UsersListsPlugin in our project

``` ts
import { UsersListsPlugin } from 'rainbow-web-sdk/lib';
...
this.rainbowSDK = RainbowSDK.create({
    host: { server, apiClientKey, appModuleKey },
    plugins: [ UsersListsPlugin ], 
    autoLogin: true
})
```

The ```UsersListsService``` is the entry point for all user's lists manipulations.

``` ts
import { UsersListsService } from 'rainbow-web-sdk';
...
constructor() {
	this.sdk = RainbowSDK.getInstance();
    // get the UsersListsService
    this.usersListsService: UsersListsService = this.sdk.UsersListsService;
}
```

## UsersListsService API

To manage the user's lists, we will use the `UsersListsService` that offers the following APIs:

+ [subscribe](#subscribe)
+ [getUsersLists](#get-alllists)
+ [getUsersListById](#get-listbyid)
+ [createUsersList](#create-list)
+ [deleteUsersList](#del-list)

UsersListsService also emits events on each operation it deems relevant, in our case each time an add/delete/move operation is successfully completed.

### <a id="subscribe" name="subscribe"></a>Listening UsersListsService events
To be informed of UsersListsService modification you can subscribe to UsersListsService events:

```ts
const usersListsServiceSubscription = this.usersListsService?.subscribe((event: RBEvent) => {
    switch (event.name) {
        case UsersListsServiceEvents.ON_USERS_LIST_CREATED:
            // event.data contains a UsersList object
            console.info(`New user's list: id: ${(event.data.id)} - name: ${(event.data.name)}`);
            break;
        case UsersListsServiceEvents.ON_USERS_LIST_PROFILE_UPDATED:
            // event.data contains a UsersList object
            console.info(`Updated user's list: id: ${(event.data.id)} - name: ${(event.data.name)}`);
            break;
        case UsersListsServiceEvents.ON_USERS_LIST_DELETED:
            // event.data contains just the id of the deleted list
            console.info(`Deleted user's list: id: ${(event.data)}`);
            break;
        case UsersListsServiceEvents.ON_USER_ADDED_TO_LIST:
            // event.data contains a UsersList object (updated list) and a User object (added user)
            console.info(`User added in list ${(event.data.list.name)}: user name: ${(event.data.user.name)}`);
            break;
        case UsersListsServiceEvents.ON_USER_REMOVED_FROM_LIST:
            // event.data contains a UsersList object (updated list) and a User Id (removed user)
            console.info(`User removed from list ${(event.data.list.name)}: user id: ${(event.data.userId)}`);
            break;
        default: break;
    }    
});
```

### <a id="get-alllists" name="get-alllists"></a>Get all user's lists
The ***getUsersLists*** method returns all the user's lists you've defined with their properties.
```ts
// Get all my user's lists
const myUsersLists: UsersList[] = this.usersListsService?.getUsersLists();
```
 Users lists are returned as an unordered table. 


### <a id="get-listbyid" name="get-listbyid"></a>Get a user's list by id
The ***getUsersListById*** method returns one user's list specified by its id with their properties.
```ts
// Get one user's lists data 
const listId: string = ...;
const listA: UsersList = this.usersListsService?.getUsersListById(listId);
```

### <a id="create-list" name="create-list"></a>Create a user's list
The ***createUsersList*** method allows to create a user's list.\
Only the name of the user's list is mandatory for creation.\
The other information (description and favorite status) are optional and can be set afterwards using the ***updateProfile*** API .

```ts
// Create a new list of people in the marketing department 
const newList: UsersListProfile = {
    name: "Marketing",
    description: "a few details about this list...",
    isFavorite: false
};

await this.usersListsService?.createUsersList(newList);
```
A ON_USERS_LIST_CREATED event is sent afterwards at the completion of the operation to notify about the user's list creation.\
The new created user's list is also provided through this event.\
At this step, a unique identifier has been assigned to the user's list, but it contains no members.


### <a id="del-list" name="del-list"></a>Delete a user's list
The ***deleteUsersList*** method allows to delete a user's list specified by its object instance or by its unique identifier.
```ts
// Delete unnecessary lists
const listA: UsersList = ...
const listB: UsersList = ...

await this.usersListsService.deleteUsersList(listA);
await this.usersListsService.deleteUsersList(listB.id);
```
A ON_USERS_LIST_DELETED event is sent afterwards at the completion of the operation to notify about the user's list deletion.\
The *id* of the just deleted user's list is also provided through this event.

## UsersList API

The following UsersList APIs can be used to manage a user's list

+ [addUser](#add-user)
+ [removeUser](#remove-user)
+ [updateProfile](#update-prof)

### <a id="add-user" name="add-user"></a>Add a user in the list
The ***addUser*** method allows to add a Rainbow user, specified by its object instance, to the current list.
> 💡 **Note**  
> As only Rainbow users can be added, this object instance must be of type ***User***.
```ts
// The list to update
const listA: UsersList = ...;
// The user to add in the list
const userB: User = ...;

await listA.addUser(userB);
```
A ON_USER_ADDED_TO_LIST event is sent afterwards at the completion of the operation to notify about adding the user to the list.\
The added user and the list concerned are also provided through this event.

> 💡 **Tips**  
> It is also possible to search users to add in your list by using the `directorySearchService`. 

```ts
// Search for the user "Alicia Stones" to add it in the listA list
// We'll assume that the search will return just one result
const searchResults: DirectorySearchResults= await this.sdk.directorySearchService?.searchByName("Alicia Stones", DirectoryType.RAINBOW_USERS);
const userFound: User = searchResults.users[0];
await listA.addUser(userFound);
```
### <a id="remove-user" name="remove-user"></a>Remove a user from the list
The ***removeUser*** method allows to remove a Rainbow user, specified by its object instance, from the current list.
```ts
// The list to update
const listA: UsersList = ...;
// The user to remove from the list
const userB: User = ...;

await listA.removeUser(userB);
```
A ON_USER_REMOVED_FROM_LIST event is sent afterwards at the completion of the operation to notify about removing a user from the list.\
The id of the removed user and the list concerned are also provided through this event.

### <a id="update-prof" name="update-prof"></a>Update the profile of the list
The ***updateProfile*** method allows to update the list profile, in other words, its general information.\
In other words, the name, the description and the favorite status can be updated using this method.\
It is possible to modify the profile in whole or in part. In the latter case, only the information supplied as a parameter will be updated.
> 💡 **Important note**  
> When specified as parameter, the name of the list **must not** be empty or null.

```ts
// The list to update
const listA: UsersList = ...;
// Update only the description of the list
const profile: UsersListProfile = {
    description: "Some new deciption ..."
};

await listA.updateProfile(profile);
```
A ON_USERS_LIST_PROFILE_UPDATED event is sent afterwards at the completion of the operation to notify about the list's profile update.\
The updated list is also provided through this event.
