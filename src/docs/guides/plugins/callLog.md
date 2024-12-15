# CallLog plugin

## What are call logs ?
Rainbow automatic collects and stored details of incoming and outgoing audio/video calls and conference calls.\
This feature is referred to as Call Logs and available via the `CallLogService`.

> 💡 **Note**  
> The `CallLogService` does not cover voice messages retrieval and management.

**What Data are present in Call Logs?**

Some of the call details recorded in call logs reports are:
- Call date
- Calling or Called party's number
- Call duration
- Call direction (incoming or outgoing)
- Call state (answered, missed or forwarded)
- Call type (webrtc, telephone, conference)
- Call subject 

All this information may not be available at the same time for a given call log.\
For example, the call subject is optional and only concerns Rainbow audio/video calls. And for a missed call, the call duration is not relevant.	

In addition to the information linked to a call itself, each call log contains additional information enabling it to be managed such as marking it as read or deleting it:
- A unique identifier
- A read status 
- The User reference object instance associated to the calling/called party's number (To access its contact card for example)

**How retrieving Call Logs?**

Unlike other services, for performance reasons, the `CallLogService` does not automatically make available the call logs associated with the connected user.

Consequently, the `CallLogService` must first be explicitly initialized (***initCallLogs***) to enable retrieval of the first most recent call logs.\
This initialization step is mandatory, but only needs to be performed once. If not done, no call logs will be available and some APIs offered by the `CallLogService` to retrieve and manage call logs will not be functional (an error will be thrown).

Then, additional older call logs can be retrieved on explicit request (***getNextCallLogs***).\
The number of call logs to be retrieved can be specified for each operation.
In both cases, the recovered call logs will automatically be stored in what we'll call the **call logs history**.

In addition to call logs retrieved on demand (service initialization, additional requests), the call logs history can evolve with the addition of new call logs resulting from calls made or received after the service initialization step. In this case, the event ON_CALLLOG_UPDATED is sent to notify about the call logs history update.

The contents of the current call logs history can be retrieved at any time, using the ***getCallLogs*** API.

Counters are also available for tracking call logs:
- The total number of call logs associated with the logged-in user (***getCallLogsCounter***).\
The event ON_CALLLOG_TOTAL_NUMBER_UPDATED is sent to each time this counter is updated.\
It is important to point out that this counter differs from the number of call logs already present in the call logs history.
- The number of missed calls  (***getMissedCallsCounter***).\
The event ON_CALLLOG_MISSEDCALLS_COUNTER_UPDATED is sent to each time this counter is updated.

**How managing Call Logs?**

Features are available to manage call logs individually or globally.
- Mark call log(s) as read\
The 'mark as read' operation **only** concerns call logs already present in the call logs history.\
This operation can be performed on one specific call log or on all call logs.
- Deletion of call log(s).\
A call log can be individually deleted if its is present in the call logs history.\
It is also possible to delete all the call logs associated with a user reference (Representing the calling and called party) , or even all the call logs of the connected user.\
In the latter two cases, all the call logs concerned will be deleted, whether or not they are present in the call logs history. 

Please note that the `CallLogService` is not part of the Rainbow core service and is available via the `CallLogPlugin`. \
The first thing to do is to add this plugin to our project.

## Add the CallLogPlugin in our project

``` ts
import { CallLogPlugin } from 'rainbow-web-sdk/lib';
...
this.rainbowSDK = RainbowSDK.create({
    host: { server, apiClientKey, appModuleKey },
    plugins: [ CallLogPlugin ], 
    autoLogin: true
})
```

The ```CallLogService``` is the entry point for all call logs manipulations.

``` ts
import { CallLogService } from 'rainbow-web-sdk';
...
constructor() {
	this.rainbowSDK = RainbowSDK.getInstance();
    // get the UsersListsService service
    this.callLogService: CallLogService = this.rainbowSDK.CallLogService;
}
```

## CallLogService API

To manage the call logs, we will use the `CallLogService` which offers one of several APIs that can be classified as follows:

**APIs for retrieving call logs**
+ [initCallLogs](#initcalllogs)
+ [isInitialized](#isinit)
+ [getCallLogs](#getcalllogs)
+ [getNextCallLogs](#getnextcalllogs)

**APIs for data counters**
+ [getCallLogsCounter](#gettotalcounter)
+ [getMissedCallsCounter](#getmissedcounter)

**APIs for deleting call logs**
+ [deleteCallLogsForUser](#deleteall-foruser)
+ [deleteCallLog](#deleteone)
+ [deleteAllCallLogs](#deleteall)

**APIS for marking call logs**
+ [markCallLogAsRead](#markone-asread)
+ [markAllCallsLogsAsRead](#markall-asread)

CallLogService also emits events when the data counters (total number of available call logs, number of missed calls) and when the current call logs history have been updated.

### <a id="subscribe" name="subscribe"></a>Listening CallLogService events
To be informed of CallLogService modification you can subscribe to CallLogService events:

```ts
const callLogServiceSubscription = this.callLogService?.subscribe((event: RBEvent) => {
    switch(event.name) {
        case CallLogServiceEvents.ON_CALLLOG_UPDATED: 
            console.info(`Call logs history updated - 'getcalllogs' can be used to retrieve updated history`);
            break;
        case CallLogServiceEvents.ON_CALLLOG_TOTAL_NUMBER_UPDATED: 
            console.info(`Total number of call logs: ${event.data}`);
            break;
        case CallLogServiceEvents.ON_CALLLOG_MISSEDCALLS_COUNTER_UPDATED: 
            console.info(`Number of missed calls: ${event.data}`);
            break;
        default: 
            reak;
    }
});
```

### <a id="initcalllogs" name="initcalllogs"></a>Initialization of the call logs service
The ***initCallLogs*** method allows to initialize the `CallLogService` for the connected user by returning the most recent call logs.\
The number of call logs to be returned can be optionally specified in the request and set by default to 100.\
The maximum value allowed is 250. If the value supplied is greater, the maximum value will be used.\
Then, additional call logs have to be retrieved furthermore via the ***getNextCallLogs*** API.
```ts
// Initializes the service by retrieving the first 100 most recent call logs
const callLogs: CallLog[] = await this.callLogsService.initCallLogs(100);
```     
> 💡 **Note**  
> No ON_CALLLOG_UPDATED event is sent once the initialization step is completed as the initial content of the call logs history is sent as result of the request.

### <a id="isinit" name="isinit"></a>Check Call Log service initialization status
Check if the Call Log service has been initialized or not.\
If this is not the case, no call log has yet been retrieved by this service.

### <a id="getcalllogs" name="getcalllogs"></a>Get the content of the call logs history
The ***getCallLogs*** method allows to get the content of the call logs history already retrieved by the Call Log service.\
This request can be made at any time, but it is especially recommended when an "ON_CALLLOG_UPDATED" event has been received.\
This event notifies that the call logs history have been updated following the reception of a new call log, the modification (e.g., marking as read) or the deletion of existing call log(s).
```ts
// Get current content of the call logs history
const callLogs: CallLog[] = await this.CallLogService?.getCallLogs();
```            

### <a id="getnextcalllogs" name="getnextcalllogs"></a>Get additional call logs
The ***getNextCallLogs*** method allows to get additional call logs in the history.\
The number of additional call logs to be returned can be optionally specified in the query parameter.\
The allowed range of values of this parameter is [1..250]. By default this parameter is set to 100.
> 💡 **Note**  
> If the value specified for the parameter is greater than 250, the maximum value will be used.\
> If the value specified for the parameter is 0 or less, the request will be rejected and an error thrown.
This API returns all the call logs present in the Call Log service history including the additional one.
```ts
// Get 50 additional call logs
const callLogs: CallLog[] = await this.callLogService?.getNextCallLogs(50);
```
> 💡 **Note**  
> No ON_CALLLOG_UPDATED event is sent once the additional call logs have been retrieved as the new content of the call logs history is sent as result of the request.

### <a id="gettotalcounter" name="gettotalcounter"></a>Get the total number of call logs available for the connected user
The ***getCallLogsCounter*** method returns the total number of call logs available for the connected user.
```ts
// Get missed calls counter
const callLogsNb: number = this.callLogService?.getCallLogsCounter();
```

### <a id="getmissedcounter" name="getmissedcounter"></a>Get the total number of missed calls
The ***getMissedCallsCounter*** method returns the total number of missed calls available for the connected user.\
A missed call is a call with the following properties: state is *missed*, direction is *incoming* and read status is *false*.
```ts
// Get missed calls counter
const missedCallsNb: number = this.callLogService?.getMissedCallsCounter();
```
> 💡 **Note**  
> This API can be called before the first call logs are retrieved, i.e. before the initialization step.

### <a id="deleteall-foruser" name="deleteall-foruser"></a>Delete all call logs associated with a specified user
The ***deleteCallLogsForUser*** method allows to delete all call logs associated with a user reference (representing the calling and called party), whether a Rainbow user or an external contact.\
All call logs associated with the specified user will be deleted, not just those already retrieved or known to the CallLog service.\
```ts
// Delete all call logs of a user
const callLog: CallLog = ...;
await this.callLogService?.deleteCallLogsForUser(callLog.user);
```
A ON_CALLLOG_UPDATED event is sent afterwards at the completion of the operation to notify about the call logs history update.

### <a id="deleteone" name="deleteone"></a>Delete one call log
The ***deleteCallLog*** method allows to delete one call log specified by its object instance
```ts
// Delete one call log 
const callLog: CallLog = ...;
await this.callLogService?.deleteCallLog(callLog);
``` 
A ON_CALLLOG_UPDATED event is sent afterwards at the completion of the operation to notify about the call logs history update.

### <a id="deleteall" name="deleteall"></a>Delete all the call logs of the connected user
The ***deleteAllCallLogs*** method allows to delete the **complete** call logs history of the connected user.\
All call logs will be deleted, not just those already retrieved or known to the CallLog service.\
```ts
// Delete the complete call logs history 
await this.callLogService?.deleteAllCallLogs();
```
A ON_CALLLOG_UPDATED event is sent afterwards at the completion of the operation to notify about the call logs history update.

### <a id="markone" name="markone"></a>Mark one call log as read
The ***markCallLogAsRead*** method allows to mark as read one call log specified by its object instance.
```ts
// The call log to mark as read
const callLog: CallLog = ...;

// Mark call log as read
await this.callLogService?.markCallLogAsRead(callLog);
```
A ON_CALLLOG_MISSEDCALLS_COUNTER_UPDATED event may be received afterwards if the missed calls counter has been updated as a result of this operation.\
The new value of this counter is also provided through this event.

### <a id="markall" name="markall"></a>Mark all call logs present in the history as read
The ***markAllCallsLogsAsRead*** method allows to mark as read all call logs already present in the Call Log service history.\
This does not apply to call logs that have not yet been retrieved from the server.
```ts
// Mark as read all call logs present in the current call logs history
await this.callLogService?.markAllCallsLogsAsRead();
```
A ON_CALLLOG_MISSEDCALLS_COUNTER_UPDATED event may be received afterwards if the missed calls counter has been updated as a result of this operation.\
The new value of this counter is also provided through this event.
