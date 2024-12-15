# Create and connect user
Now that Rainbow is alive in our application we have to try to authenticate a user.

We already have a user on the SandBox platform: **you**!<br/>
But let's see how to quickly create test users.

**Two important pieces of information:**
+ When you have created your developer account on sandbox, the user that has been created has administrative rights.<br/> That is to say that it has the possibility of creating Rainbow users manually.
+ Moreover, in Rainbow, users are attached to a company. When your user was created, a company was also created.<br/>
We are going to create our test users in this company!

> 😱 **Another tedious step**  
>But as previously, just do do once ! 

### Step 1: Access the Rainbow administration interface

First, connect to the SandBox platform (step 4 of the previous guide).

**Remember**, you have to use the login/password you have received via e-mail<br/>
And reach the following site:
[Connect to the SandBox platform](https://web-sandbox.openrainbow.com/rb/2.126.20/index.html#/login)

Once connected click on this icon on the Rainbow left action bar:<br/>
![admin icon](/assets/doc/images/adminIcon.png)<br/> (It's not obvious but it is the administration icon 😁).<br/> 
This will open the Rainbow administration interface: specifically, your company dashboard!<br/>
Click on the ![company icon](/assets/doc/images/companyIcon.png) to access the administration of your company and its users. Finally click on the members icon ![members icon](/assets/doc/images/membersIcon.png)

You now see the list of members of your company appear, which at this stage should only contain one member: **you**!

The button at the top right of this list allows you to create users.<br/>
To save time, we invite you to immediately create 3 users who will be useful to us later: `Alice`, `Bob` and `Carole`.

> 💡 **NOTE**  
> When creating a user you will be asked for an email address. It is not necessary for these three users to have "real" email addresses, so you can invent one (no confirmation email sent).<br/>Likewise, no matter what names you give them, just know that in the rest of this guide, we will identify them by Alice, Bob and Carole

### Step 2: Connect SDK with Alice
**How to proceed ?**

The rainbowSDK object carries the connection object which handles all Rainbow connection stuff (it manages connection/disconnection, network loss/retrival, ...)  
First, we will add a listener to this connection object

``` js   
// Subscribe to connection object events (only RAINBOW_ON_CONNECTION_STATE_CHANGE events)
this.rainbowSDK.connection.subscribe((event: RBEvent) => {
        this.connectionStateChangeHandler(event);
    }, ConnectionServiceEvents.RAINBOW_ON_CONNECTION_STATE_CHANGE);

// Declare a simple event handler (just log events in the console)
private connectionStateChangeHandler(event: RBEvent): void {
    const connectionState: ConnectionState = event.data;
    console.info(`[testAppli] onConnectionStateChange ${connectionState.state} ${connectionState.reason}`);
}
```

With this code, we can now be informed of the rainbow connection status.

Now we will try to authenticate on the Rainbow platform.  
To do this, we're going to use the ```this.rainbowSDK.start``` method.  
This return the connected user when connection success.
If the connection fails, then call the ```this.rainbowSDK.connectionService.logon``` with the previous credentials.

Suppose that Alice has as for login (her email address) and password the following information:

    login: 'alice.test@drabedroc.fr'
    password: 'AlicePassword'

``` js   
let userConnected: ConnectedUser = await this.rainbowSDK.start();
if (!userConnected) {
    try { userConnected = await this.rainbowSDK.connectionService.logon('alice.test@drabedroc.fr', 'AlicePassword', true); }
    catch (error: any) { this.rainbowSDK.logger.error(`[testAppli] ${error.message}`); return; }
}
console.info(`[testAppli] connected with user ${userConnected.displayName}`);
```

**All together now:**

``` js
import { ConnectionServiceEvents, ConnectionState, ConnectedUser, RBEvent, RainbowSDK } from 'rainbow-sdk';
class TestRainbowSDK {
    protected rainbowSDK: RainbowSDK;

    public async init(): Promise<void> {
        
        this.rainbowSDK = RainbowSDK.create({
            appConfig: { 
                server: 'sandbox.openrainbow.com', 
                applicationId: 'yourApplicationId',
                secretKey: 'yourSecretKey'
            },
            plugins: [],
            autoLogin: true,
            logLevel: LogLevelEnum.WARNING
        });

        this.rainbowSDK.connectionService.subscribe((event: RBEvent) => 
            this.connectionStateChangeHandler(event), ConnectionServiceEvents.RAINBOW_ON_CONNECTION_STATE_CHANGE);

        let userConnected: ConnectedUser = await this.rainbowSDK.start();
        if (!userConnected) {
            try { userConnected = await this.rainbowSDK.connectionService.logon('alice.test@drabedroc.fr', 'AlicePassword!', true); }
            catch (error: any) { console.error(`[testAppli] ${error.message}`); return; }
        }
        console.info(`[testAppli] connected with user ${userConnected.displayName}`);
    }

    private connectionStateChangeHandler(event: RBEvent): void {
        const connectionState: ConnectionState = event.data;
        console.info(`[testAppli] onConnectionStateChange ${connectionState.state}`);
    }
}
const testRainbowSDK = new TestRainbowSDK();
testRainbowSDK.init(); 
```

**And now check the results**

Congratulation, your application is now connected to Rainbow with the user 'alice.test@drabedroc.fr'!!

![ItWorks](/assets/doc/images/test-app-screen3.png)

### Some information about the connection 
The connection object is in charge of keeping your Rainbow connection up.  

**Unplug and plug the network cable**:  If you have a look in your app console, you should see something like:

![Reconnect](/assets/doc/images/test-app-screen4.png)

The connection with Rainbow backend is re-established as soon as the network is available.

**Try to refresh your browser** :  the app will reconnect to Rainbow automatically!

> The third parameter of ```this.rainbowSDK.connectionService.logon('alice.test@drabedroc.fr', 'AlicePassword!', true)``` is explicitly set to ***true***, which means that once the connection is established the rainbow SDK will store the authentication token in the localStorage and will use it for future calls to the ```this.rainbowSDK.start()``` method.


## Congratulation
This is the end of our "getting started", you now have a minimal but connected Rainbow application. 
In the following page you will learn how to manage users in Rainbow.

[Rainbow users](/doc/page/guides/users/users)

