# Rainbow SDK: Plugins

The Rainbow platform offers a wide variety of services, from simple text chat to webinar services and file storage.
Obviously, you won't be using all of Rainbow's services in your application.

You may only need to manage webRTC communications, in which case it would be a shame to have to embed the entire Rainbow library in your project if you only use a small part of it.
With the Rainbow SDK V1, you had no choice, it was all or nothing, and that was really problematic.

So we chose to break our new SDK down into smaller functional parts called 'plugins'.

In the previous examples we learned how to start a minimal Rainbow project, able to connect to a server, manage contacts but nothing more.
To use some of Rainbown's more interesting features, you'll need to specify which plugins you want to use.

Remember that part of our code that created the Rainbow SDK object:

``` ts
this.rainbowSDK = RainbowSDK.create({
    appConfig: { server: 'demo.openrainbow.org' },
    plugins: [],
    autoLogin: true
});
```
We're now going to take a closer look at the plugins table, which we've left empty for the moment.

Here is the list of currently available plugins
+ [Admin plugin](/doc/page/guides/plugins/admin)
+ [Bubbles plugin](/doc/page/guides/plugins/bubbles)
+ [CallLog plugin](/doc/page/guides/plugins/CallLog)
+ [Calls plugin](/doc/page/guides/plugins/calls)
+ [DataChannels plugin](/doc/page/guides/plugins/datachannels/datachannels)
+ [Favorites plugin](/doc/page/guides/plugins/favorites)
+ [Polls plugin](/doc/page/guides/plugins/polls)
+ [TelephonyConfig plugin](/doc/page/guides/plugins/telephonyConfig)

To use a plugin in Rainbow, simply add it to the plugins table. In the folowing example, we will add two plugins ConversationPlugin and DataChannelPlugin :

``` ts
import { ConversationPlugin, TelephonyPlugin } from 'rainbow-web-sdk';

this.rainbowSDK = RainbowSDK.create({
    host: { server: 'demo.openrainbow.org' },
    plugins: [
        TelephonyPlugin, 
        DataChannelPlugin
    ], 
    autoLogin: true
})
```

> 💡 **NOTE**  
>Even if some plugins are dependent on each other (for example the dataChannelPlugin requires the conversationPlugin). Each plugin can be declared on its own in Rainbow's configuration. Missing plugins will be automatically added. So no need to worry about that 😄

Please consult the plugin documentation pages to understand their specific roles. 

We have decided to break down the alphabetical classification and present them in order of increasing importance.
