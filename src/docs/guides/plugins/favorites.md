# Favorites plugin

## What are favorites?
Favorites are Rainbow items that you specifically mark so that it's more convenient to use them afterwards, a bit like bookmarks in a browser.

Only certain types of Rainbow items can be tagged as favorites:
- Rainbow users
- Rainbow bubbles
- Rainbow Business contacts
- Rainbow Personal contacts 
- Microsoft Azure AD users/Microsoft O365 contacts

> 💡 **Note**  
> PBX Users contacts cannot be marked as favorite.

Favorites allows you to set up quickly a conversation with a Rainbow user or bubble.\
And for all items, a quick access to their detailed information card (Profile, phone numbers, location, etc.).

Please note that the `FavoritesService` is not part of the Rainbow core service and is available via the `FavoritesPlugin`. The first thing to do is to add this plugin to our project.

## Add the FavoritesPlugin in our project

``` ts
import { FavoritesPlugin } from 'rainbow-web-sdk/lib';
...
this.rainbowSDK = RainbowSDK.create({
    host: { server, apiClientKey, appModuleKey },
    plugins: [ FavoritesPlugin ], 
    autoLogin: true
})
```

The ```FavoritesService``` is the entry point for all favorites manipulations.

``` ts
import { FavoritesService } from 'rainbow-web-sdk';
...
constructor() {
	this.rainbowSDK = RainbowSDK.getInstance();
    // get the FavoritesService service
    this.favoritesService: FavoritesService = this.rainbowSDK.FavoritesService;
}
```

## FavoritesService API

To manage the favorites, we will use the `FavoritesService` that offers the following APIs:

+ [subscribe](#subscribe)
+ [getFavorites](#get-allfavs)
+ [addToFavorites](#add-fav)
+ [deleteFavorite](#del-fav)
+ [deleteFromFavorites](#delfrom-fav)
+ [moveFavoritePosition](#move-fav)

FavoritesService also emits events on each operation it deems relevant, in our case each time an add/delete/move operation is successfully completed.

### <a id="subscribe" name="subscribe"></a>Listening FavoritesService events
To be informed of FavoritesService modification you can subscribe to FavoritesService events:

```ts
const favoritesServiceSubscription = this.favoritesService?.subscribe((event: RBEvent) => {
    switch(event.name) {
        case FavoritesServiceEvents.ON_FAVORITE_CREATED: 
            const newFavorite Favorite = event.data.favorite;
            ... 
            break;
        case FavoritesServiceEvents.ON_FAVORITE_DELETED: ... break;
        case FavoritesServiceEvents.ON_FAVORITES_ORDER_CHANGED: ... break;
        default: break;
    }
});
```

### <a id="get-allfavs" name="get-allfavs"></a>Get all your favorites
The ***getFavorites*** method returns all the Rainbow items you've marked as favorites.
```ts
// Get all my favorites 
const myFavorites: Favorite[] = this.favoritesService?.getFavorites();
```
 Favorites are returned as an **ordered** table. 
 > 💡 **Important note**  
 > The index in the array corresponds to the position of the favorite in the list, starting from 0.


### <a id="add-fav" name="add-fav"></a>Add an Rainbow item as a favorite
The ***addToFavorites*** method allows to add a Rainbow item specified by its object instance to your favorites list.
> 💡 **Note**  
> According to the Rainbow items managed, this object instance must be either of ***User*** or ***Bubble*** type.

```ts
// The user to mark as favorite
const userToAdd: User = ...;

// Add this user to favorites list
await this.favoritesService?.addToFavorites(userToAdd);
```
A favorite is **always** added to the end of the favorites list.

A ON_FAVORITE_CREATED event is sent afterwards at the completion of the operation to notify about the favorite creation.\
The new created favorite is also provided through this event.

> 💡 **Tips**  
> It is also possible to search users to add in your favorites list by using the `directorySearchService`. 

```ts
// Search for the user "Alicia Stones" to add it in the favorites list
// We'll assume that the search will return just one result
const searchResults: DirectorySearchResults= await this.rainbowSDK.directorySearchService?.searchByName("Alicia Stones", DirectoryType.RAINBOW_USERS);
const userFound: User = searchResults.users[0];
await this.favoritesService?.addToFavorites(userFound);
```

### <a id="del-fav" name="del-fav"></a>Delete a favorite by its identifier
The ***deleteFavorite*** method allows to delete a favorite specified by its identifier. 
```ts
// The favorite to delete
const favoriteA: Favorite = ...;

// Delete a favorite by its identifier
await this.favoritesService?.deleteFavorite(favoriteA.id);
```
A ON_FAVORITE_DELETED event is sent afterwards at the completion of the operation to notify about the favorite deletion.\
The *id* of the just deleted favorite is also provided through this event.


### <a id="delfrom-fav" name="delfrom-fav"></a>Remove an Rainbow item from the favorites list
The ***deleteFromFavorites*** method allows to remove a Rainbow items specified by its object instance from your favorites list.
> 💡 **Note**  
> According to the Rainbow items managed, this object instance must be either of ***User*** or ***Bubble*** type.
```ts
// The user to unmark as favorite
const favoriteB: Favorite = ...;

// Remove this user from the favorites list
await this.favoritesService?.deleteFromFavorites(favoriteB);
```
A ON_FAVORITE_DELETED event is sent afterwards at the completion of the operation to notify about the favorite deletion.\
The *id* of the just deleted favorite is also provided through this event.

### <a id="move-fav" name="move-fav"></a>Move a favorite in the favorites list
The ***moveFavoritePosition*** method allows to move a favorite specified by its object instance to a specific position inside your favorites list.\
This will allow you to organize your favorites, for example, by putting the most important ones at the top of the list.\
In addition, all existing favorites from this position onwards will also be moved, and their position automatically shifted by 1.
```ts
// Move favoriteA at the top of the list 
const favoriteA: Favorite = ...;

// Delete a favorite by its identifier
await this.favoritesService?.moveFavoritePosition(favoriteA, 0);
```
A ON_FAVORITES_ORDER_CHANGED event is sent afterwards at the completion of the operation to notify about the favorite's move.\
The updated favorite and its new position in the favorites list are also provided through this event.

