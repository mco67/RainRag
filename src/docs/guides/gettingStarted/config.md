# Configure SDK
We now have a functional buildline and project, we need to configure and start the SDK framework. Before we can use the SDK, we need to create/declare our application in the Rainbow ecosystem.

In this guide, for the moment, we simply want to create a test application. Rainbow offers a working platform dedicated to this kind of application: `the sandbox platform`.

Let's see how to create such an application.

> 😱 **Painful stage**  
>This part is a bit long and tedious but don't worry, we'll guide you through it and you only have to do it once.

### Step 1: Create a user account on rainbow

If you're reading this guide, you probably already have a Rainbow user account.
If not, please create one here: 
[Create a Rainbow account](https://web.openrainbow.com/rb/2.126.20/index.html#/subscribe)

### Step 2: Log-on the developpers site and register as developper

With your Rainbow credentials, log on to the [developers website](https://developers.openrainbow.com)

If this is the first time you've logged on, or if you haven't done so yet, you will be asked to register as a developer. Thank you for completing this process.

Congratulation: 
**You are now register as Rainbow developper, welcome to our familly** 

### Step 3: Create your sandbox environment

It's now time to create your sandbox environment. 
To do this, on the developer site, in the left-hand menu, click on the sandbox entry.

You will receive your sandbox credentials by e-mail, please check your e-mails

+ Sandbox Rainbow URL: https://web-sandbox.openrainbow.com
+ Your developer account : your@email.com
+ Your developper password : xxxxxxxxxx
+ Sandbox APIs address: https://openrainbow.com

### Step 4: Connect to the developper sandbox site

If you go back to the "developpers" site, in the sandbox section, you can now connect by clicking on the small icon at the top right of the right-hand panel

😖 **You need to log in using the password you received in your e-mail!**

![It's a trap](/assets/doc/images/connectSandbox.png)

Once you've done this, you should (finally) see the sandbox application creation menu appear 😥

### Step 5: Create your test application 

Click on the "Create application" button to create your sandBox application

![create sandbox application](/assets/doc/images/createAppli.png)

You will be redirected to your new application settings page.

> 🧭 **INFORMATION**  
> This is where you'll find all the information we need to configure our SDK, in particular the `applicationID` and the `secretKey`.

To use the SDK you need an `applicationID` and a `secretKey`. These information allow you to identify your application and to use the Rainbow platform. 

For more information, see [Applications lifecycle](/doc/hub/application-lifecycle) which explains what is the purpose, how to create an application and how to get the applicationID and the secretKey.

The `serverHostname` is also necessary to know which server is used in our case and for the moment [the sandbox](/doc/hub/developer-sandboxed-platform).

In the sandbox case, the `serverHostname` is 'sandbox.openrainbow.com'


### Step 6: Configure the SDK

First, we have to create an instance of the Rainbow SDK in our test application. 


To do this we will modify the `index.ts` file:
``` ts
import { RainbowSDK } from 'rainbow-web-sdk';
class TestApplication {
    
    protected rainbowSDK: RainbowSDK;

    constructor() {
            this.rainbowSDK = RainbowSDK.create({
            appConfig: { 
                server: 'serverHostname', 
                applicationId: 'applicationId',
                secretKey: 'secretKey'
            },
            plugins: [],
            autoLogin: true,
            logLevel: LogLevelEnum.WARNING
        });
    }
}
const testApplication = new TestApplication();
```

 We pass the following object to the RainbowSDK

``` js
{
    appConfig: {
        server: 'serverHostname', 
        applicationId: 'applicationId',
        secretKey: 'secretKey'
    },
    plugins: [],
    autoLogin: true,
    logLevel: LogLevelEnum.WARNING
}
``` 

This will configure our SDK object with our application information:
+ `appConfig`:
+ + `serverHostname` is the server used, in our case: "sandbox.openrainbow.com".
+ + `applicationId` and `secretKey` are your credentials  created in step 5.
+ `plugins` is an array that will allow you to add features to our SDK through a plugin mechanism. This mechanism will embed and start only the necessary features (and not a whole bunch of useless functionalities).
+ `autologin` specifies if the SDK will try to automatically connect to the server if an existing auth token is found locally.
+ `logLevel` specifies the logLevel. 
  
> 💡 **Tips**  
> The RainbowSDK is the entry point of the SDK and is a singleton object: it will be created only once ! 
<br/>If you need to get this singleton anywhere in your application, just use the static getInstance() method:   
> `this.rainbowSDK = RainbowSDK.getInstance();`

### Step 7: Start your app
It is now time to start your app and check if the RainbowSDK is well loaded and started !

``` sh
$ npm run build
$ npm run serve
```
<span style="color: red"> PMA: LOPACOMPRI </span>
Then reload you browser and this the expected result 

![ItWorks](/assets/doc/images/test-app-screen2.png)



**You can check the state of the Rainbow SDK from the console.**

[Continue to Connection](/doc/page/guides/gettingStarted/connect)
