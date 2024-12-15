# Discovering Rainbow users

## A short introduction

The first thing to do to interact with users is to be able to find them!<br/> 
This step can be done with the integrated search engine. 
The SDK for Web now offers an centralized method to let you find Rainbow users.

We're going to use the `directorySearchService` to do this. To cut a long story short, the directorySearch service allows you to search in the connectedUser network and the various directories accessible by Rainbow in a consistent way.

In the previous step, we created test users. Now it's time to look at how to interact find them.

The `directorySearchService` will enable us to easily search for a Rainbow user.

```ts
// Search for the users who are matching with the "Bob" search criteria 
// in the Rainbow directory
const searchEngine = this.sdk.directorySearchService;
const result: DirectorySearchResults = await searchEngine?.searchByName("Bob", DirectoryType.RAINBOW_USERS);

// The directorySearch engine returns a DirectorySearchResults objevt.
// It contains an array of User instance which match the criteria 
// Note that this array can be empty if no matching entity is found.
// In our case we have already created a "Bob" user in a previous stage, 
// so, this array should not be empty...
const users: Users[] = results.users;
```

At this point of the reading, you are able to find your test users and you can skip the read of this chapter to continue your Rainbow SDK exploration.<br/>
[Skip and continue to User's network](/doc/page/guides/users/usersNetwork)


But you'll find in the following part an exhaustive documentation on Rainbow directories and about the directorySearch engine usage.

## Rainbow Directories

Rainbow manages various directories in which users and contacts can be searched:

### 1. The "User's Network"
This directory type is more of a container than a directory an refers to the network of Rainbow users of the logged-in user.\
This network contains users who have been explicitly invited by the logged-in user to share their online status.

🔒 Availability :
 + *No profile feature is required to use this directory.*
 + *Any Rainbow user, including those belonging to the default company, can use this directory.*
<br/>
<br/>

### 2. The "Rainbow Users directory"
The Rainbow Users directory is composed of all Rainbow users belonging to the 'Rainbow' default company as well as all End Company users created by a company administrator.

The directory scope corresponds to all Rainbow public users and users being in companies visible to the logged-in user (this visibility depends on that defined for the logged-in user and the company he belongs to).
    
**Advanced points on limited visibility:**  
+ If logged-in user has the visibility defined as 'closed' or 'isolated' OR the same as the same the company to which he belongs to and this company has visibility 'closed' or 'isolated', then the directory scope includes only users being in companies visible by the logged-in user's company.
+ If logged-in user has the visibility defined as 'hotspot' OR the same as the company to which he belongs and this company has visibility 'hotspot', then no user is visible.

🔒 **Availability** :
 + *No profile feature is required to use this directory.*
 + *Any Rainbow user, including those belonging to the default company, can use this directory.*
<br/>
<br/>

### 3. The "Rainbow Business Contact Directory"
The business directory is global to an End Company and contains a list of contacts (people and/or companies) shared by company members, i.e. Rainbow users.

There are 2 types of business contacts: `user` and `company`.\
A business contact is of type `user` if a first or last name has been defined for it.\
A business contact is of type `company` if only a company name has been defined for it, but no first or last name.\
The type of business contacts will influence their search process, as we'll see later.

Company members can search contacts, display information on a specific contact, and invite it to join their network.

The business directory can be configured either by a "company administrator", or a "company member" with the "business directory" role.

A user can only search company directory contacts belonging to his company.\
"company_admin" and "directory_admin" users can only search company directory contacts belonging to his company.\
"bp_admin" user can only search company directory contacts belonging to his own company or to his end customer companies.

🔒 **Availability** :
+ *No profile feature is required to use this directory.*
+ *A user of a default company cannot use this directory.*
<br/>
<br/>

### 4. The "Rainbow Personal Contact Directory"
The personal directory is similar to the business directory, but is global to a Rainbow user and available on all Rainbow clients (web/desktop, iOS, Android).\

There are 2 types of personal contacts: `user` and `company`.\
A personal contact is of type `user` if a first or last name has been defined for it.\
A personal contact is of type `company` if only a company name has been defined for it, but no first or last name.\
The type of personal contacts will influence their search process, as we'll see later.

A Rainbow user can create, modify, or delete contacts inside its personal directory.\
A user can only search in his own personal directory.\
He can't search in the personal directory of another user, even if he has administration rights.

🔒 **Availability** :
+ *A user can use the personal directory only if he has the PERSONAL_DIRECTORY feature (Enterprise, Business or Attendant license).*
+ *A user of a default company cannot use this directory.*
<br/>
<br/>

### 5. The "PBX Users directory"
The PBX user directory refers to one OXO/OXE PBX phonebook not managed by Rainbow.

🔒 **Availability** :
+ *A user can use a PBX Phonebook only if he has the TELEPHONY_PHONE_BOOK feature (Enterprise, Business or Attendant license).\
This means he must have a phone number on a PBX and then any search is done only on the associated PBX phonebook.*
+ *A user of a default company cannot use this directory.*
<br/>
<br/>


### 6. Microsoft Azure AD users/contacts Microsoft O365 contacts
The PBX user directory refers to one OXO/OXE PBX phonebook not managed by Rainbow.

🔒 **Availability** :
+ *This directory is available only if the user has the profile feature MSO365_DIRECTORY_SEARCH.*
+ *A user of a default company cannot use this directory.*
<br/>
<br/>

## Searching in directories

The DirectorySearch service lets you search for users/contacts by name in these directories.\
The search is performed on some properties of users/contacts depending on the directory and the search mode specified in the request.

<ins>**Two search modes are available:**</ins>
+ **Basic mode**\
The search is based on basic name properties such as the firstname and the lastname according to directory type.

+ **Extended mode**\
The search is performed on the basic name properties but also on some extended properties of the user/contact.\
The extended search is only available to logged-in users having feature SEARCH_BY_TAGS in their profiles.\
This option is handled differently from one directory to another: the additional fields are not the same depending on the type of directory.\
The extended search is not available for the ***Network of Rainbow users*** and the ***PBX users*** directories.

The table below shows the user/contact properties used depending on the directory and search mode. 

| Rainbow directories |    Basic mode   |    Extended mode   |
| :------------------ | :-------------- |  :---------------- |
| Network of Rainbow users  | firstname<br>lastname | firstname<br>lastname |
| Rainbow Users directory   | firstname<br>lastname    | firstname<br>lastname<br>+ company name<br>+ job title<br>+ department<br>+ tags |
| Rainbow Business Contact Directory    | (`user` type)<br>firstname<br>  lastname<br><br>(`company` type)<br>company name | firstname<br>lastname<br>company name<br>+ job title<br>+ department<br>+ tags |
| Rainbow Personal Contact Directory    | (`user` type)<br>firstname<br>  lastname<br><br>(`company` type)<br>company name | firstname<br>lastname<br>company name<br>+ job title<br>+ department<br>+ tags |
| PBX Users directory (Phonebook OXO/OXE)   | firstname<br>lastname | firstname<br>lastname |
| Microsoft Azure AD users/contacts Microsoft O365 contacts | firstname<br>lastname | firstname<br>lastname<br>+ company name<br>+ job title<br>+ department |

### Which API should I use to search by name?
Users and contacts can be searched using the `searchByName(...)` method.
``` ts
searchByName(searchPattern: string, directory: DirectoryType, options?: DirectorySearchOptions): Promise<DirectorySearchResults>;
```

### What do I need to put in my search request? 
+ A **search pattern** => What you are looking for ?
+ A **directory identifier** => In which directory to search ?
+ Some **options** => How to refine the search if needed ?

#### How does my search pattern work in a search?
The pattern is a string that will be used as search criteria to find users/contacts.

<ins>Notes:</ins>\
Use cases below are based on Rainbow users "John Doe" (firstname 'John' , lastname 'Doe') and "Hervé De Lattès" (firstname 'Hervé' , lastname 'De Lattès')
+ Search pattern can be a single word or composed of several words separated by spaces.
+ Patterns are used in all user properties taken into account for the search (See table above).\
If a property is made up of several words (space separation), then the pattern will be used on each of these words.
+ A search pattern is matched from the beginning (and only from this) of all words in each property.\
➡ Pattern 'John' will find 'John Doe'\
➡ Pattern 'Do' will find 'John Doe'\
➡ Pattern 'att' will not find 'Hervé Lattès'
+ If several patterns are specified, then all patterns must be found in the used properties.\
➡ Pattern 'John Doe' will find 'John Doe'\
➡ Pattern 'Hervé Lattès' will find 'Hervé De Lattès'\
➡ Pattern 'John Don' will not find 'John Doe'
+ The order doesn't matter if several patterns are specified.\
➡ Pattern 'Doe John' will find 'John Doe'
+ Patterns are used both as exact match or partial match.\
➡ Pattern 'John Doe' will find 'John Doe' (exact)\
➡ Pattern 'Jo Do' will find 'John Doe' (partial)
+ Search is Case insensitive.\
➡ Pattern 'john doe' will find 'John Doe'
+ Search is Accents insensitive.\
➡ Pattern 'Herve lattes' will find 'Hervé Lattès'

#### How to specify the directory in which to search?

The list of directories available to a user can be retrieved using the ***getAvailableDirectories()*** method.
``` ts
const availableDirectories: DirectoryType[] = await this.directorySearchService.getAvailableDirectories();
const usableDirectories: string = availableDirectories.toString();
// Output: RAINBOW_USERS_NETWORK,RAINBOW_USERS,RAINBOW_BUSINESS_CONTACTS_DIRECTORY,
//         RAINBOW_PERSONAL_CONTACTS_DIRECTORY,RAINBOW_PBX_USERS,MICROSOFT_O365_USERS
```
The enum `DirectoryType` specifies all possible values for a directory.

If the user performs a search in a directory to which he does not have access, the request will be rejected and an error log will be generated.

#### How can I refine my search?
+ By specifying the number of results to return\
By default, a search will return up to 20 results.\
The number of results to be returned can be specified in a range [1..100].

+ By activating the extended search mode\
By default, a search is performed in basic mode.\
Extended search can be specified by setting `extendedMode` option.\
If the directory in which the search will be performed does not support the extended mode, a basic search will be performed.\
If the user does not have the SEARCH_BY_TAGS feature in their profiles, then a basic search will be performed. A warning log will also be generated.\
\
**Reminder:** This option is available and managed differently depending on the type of directory, as described in the table above.

+ By adding a company filter\
The company filter is used to refine the search to include or exclude users/contacts of a specified company.\
This information indicates how the company specified via its id will be managed in the search.\
When the company scope is set to LIMITED_TO_COMPANY, then the search will be restricted to this company.\
When the company scope is set to COMPANY_EXCLUDED, then the search will exclude users being in this company.\
\
This option is only valid for searches in ***Rainbow Users*** and ***Rainbow Business Contact*** directories.\
The COMPANY_EXCLUDED scope is available only for the ***Rainbow Users*** directory.\
If the option is specified but not managed for the given directory type, it will simply be ignored.

`DirectorySearchOptions` interface implements the list of options for refining the search and specifying the results to be provided.

### What do I receive in response to my search request? 
+ An array of user(s)/contact(s) (as User template) matching the search criteria.\
If no user/contact has been found, an empty array is returned.

+ A Boolean value indicating whether other results are available or not.\
If the value returned is 'true' and the user/contact searched for is not present in the results, it is suggested to modify the query by
    * Requesting more results via the *'limit'* option.
    * Refining the search by providing more characters in the pattern 

`DirectorySearchResults` interface implements the list of data provided as the result of a directory search.

## Search examples
#### Search for the first 20 "Lucy" users among public users, those belonging to my company and companies visible to my company.
``` ts
const result = await directorySearchService.searchByName("Lucy", DirectoryType.RAINBOW_USERS);
```

#### Search for 15 users with the first or last name "Dave" in my company and 5 in other companies
``` ts
const searchOptions1 = {
    limit: 15,
    company: {
        companyId: "123456789012345678901001",
        companyScope: CompanyScopeType.LIMITED_TO_COMPANY
    },
};
results1 = await directorySearchService.searchByName("Dave", DirectoryType.RAINBOW_USERS, searchOptions1);

const searchOptions2 = {
    limit: 5,
    company: {
        companyId: "123456789012345678901001",
        companyScope: CompanyScopeType.COMPANY_EXCLUDED
    },
};
results2 = await directorySearchService.searchByName("Dave", DirectoryType.RAINBOW_USERS, searchOptions2);
```

#### Search the company business directory for contacts with the first or last name "Peter" working in the Sales department.
These users have been tagged with the label 'sales'.
``` ts
const searchOptions: DirectorySearchOptions = {
    extendedTags: true,
    company: {
        companyId: myCompanyId,
        companyScope: CompanyScopeType.LIMITED_TO_COMPANY
    },
};
const results = await directorySearchService.searchByName("Peter sales", DirectoryType.RAINBOW_BUSINESS_CONTACTS_DIRECTORY, searchOptions);
```

#### Search my personal directory for all possible contacts (within the authorized limit, i.e. 100) who work at "StarOne".
This name is specified in their *'company'* property.\
Next, display the first and last names of each contact found.
``` ts
try {
    const searchOptions: DirectorySearchOptions = {
        extendedTags: true,
    };
    const searchDirectory: DirectoryType = DirectoryType.RAINBOW_PERSONAL_CONTACTS_DIRECTORY;
    const searchResults: DirectorySearchResults;

    searchResults = await directorySearchService.searchByName("StarOne", searchDirectory, searchOptions); 
    console.info(`directorySearch success with results:`);
    console.info(`  Found ${searchResults.users.length} item(s)`);
    console.info(`  More item(s) available = ${searchResults.moreResultsAvailable}`);
    searchResults.users.forEach((user: User) => {
        console.info(`  contact: Firstname: ${user.firstname} - Lastname: ${user.lastname}`);
    });

} catch (error) {
    console.error(`directorySearch failure -- error: ${error.message}`);
    return error;
}
```

[Continue to Users Network](/doc/page/guides/users/usersNetwork)
