### What is TelephonyConfig Routing Mode?

A device is a landline or mobile telephone or even the Rainbow application in VOIP(computer mode).

With this device, the user can send or receive calls.

The Routing Mode allows to configure a device to a user.

This routing mode is very usefull, when the user regularly changes device.

Whatever the device configured by the rainbow user, during an outgoing call, the remote user will always see the same professional number (configured in the user profile) of the rainbow user and conversely this rainbow user will always be able to be contacted by this unique number.

Please note that the `TelephonyConfigService` is not part of the Rainbow core service and is available via the `TelephonyConfigPlugin`. The first thing to do is to add this plugin to our project.

## Add the TelephonyConfigPlugin in our project

``` ts
import { TelephonyConfigPlugin } from 'rainbow-web-sdk/lib';
...
this.rainbowSDK = RainbowSDK.create({
    host: { server, apiClientKey, appModuleKey },
    plugins: [ TelephonyConfigPlugin ], 
    autoLogin: true
})
```

The ```TelephonyConfigService``` is the entry point for all TelephonyConfig manipulations.

``` ts
import { TelephonyConfigService } from 'rainbow-web-sdk';
...
constructor() {
	this.sdk = RainbowSDK.getInstance();
    // get the TelephonyConfigService service
    this.telephonyConfigService: TelephonyConfigService = this.sdk.TelephonyConfigService;
}
```

## TelephonyConfigService API

To manage the telephonyConfig, we will use the `TelephonyConfigService` that offers the following APIs:

+ [subscribe](#subscribe)
+ [setRoutingDeviceMode](#set-rout)
+ [getRoutingMode](#get-rout)
+ [getRoutingDevicesList](#get-devlist)
+ [setOfficePhoneRingingOption](#set-phonering)

TelephonyConfigService also emits events on each operation it deems relevant.
The event ON_ROUTING_LIST_CHANGE is emitted when the list of devices changes for this user (for example the user modifies the devices list of this user profile)
the event ON_ROUTING_MODE_CHANGE is emitted when the routing mode changes

### <a id="subscribe" name="subscribe"></a>Listening TelephonyConfigService events
To be informed of TelephonyConfigService modification you can subscribe to TelephonyConfigService events:

```ts
const telephonyConfigServiceSubscription = this.telephonyConfigService?.subscribe((event: RBEvent) => {
    switch(event.name) {
        case TelephonyConfigServiceEvents.ON_ROUTING_LIST_CHANGE: ... break;
        case TelephonyConfigServiceEvents.ON_ROUTING_MODE_CHANGE: ... break;
        default: break;
    }
});
```

### <a id="set-rout" name="set-rout"></a>Change the telephony Config mode
The ***setRoutingDeviceMode*** method allows to change the principal device of the user

```ts
// The device which will be configured like principal for the user
const newDevice: TelephonyRoutingDeviceTypes = ...;

// change the principal device of the user
this.telephonyConfigService?.setRoutingDeviceMode(newDevice);

//if the new device is not defined in user profile, the device is defined like other_phone
// if this case the phone number must be specified in destination

const newDevice: TelephonyRoutingDeviceTypes = TelephonyRoutingDeviceTypes.OTHER_PHONE;
const destination: string = "+33311223344";

// change the principal device of the user with other_phone
this.telephonyConfigService?.setRoutingDeviceMode(newDevice, destination);

```

> 💡 **Note**  
> if a user has either work mobile or personal mobile in this user profile, when he selects this office phone like principal phone, > the work mobile or personal mobile are automaticaly selected like secondary device.
> In this case the both device, office phone and the mobile ring together
> To manage the ringing about this case see [setOfficePhoneRingingOption](#set-phonering)

A ON_ROUTING_MODE_CHANGE event is sent but after that the PBX has taken into account the modification.\
The new telephony config mode is also provided through this event.


### <a id="get-rout" name="get-rout"></a>Get the telephony config mode of the user
The ***getRoutingMode*** method returns the telephony config mode of the user.

```ts
// Get the telephony Config Routing Mode of the user
const routingMode: TelephonyRoutingMode = this.telephonyConfigService?.getRoutingMode();
```


### <a id="get-devlist" name="get-devlist"></a>Get all the routing devices of the user
The ***getRoutingDevicesList*** method returns all the devices that the user can use for the routing mode, and returns also the state of the devices.

```ts
// Get all devices of the user
const routingDevicesList: TelephonyRoutingDevice[] = this.telephonyConfigService?.getRoutingDevicesList();
```


### <a id="set-phonering" name="set-phonering"></a>Configure if the mobile phone associated rings when the principal device is officePhone
The ***setOfficePhoneRingingOption*** method allows to change the mobile phone ringing configuration

```ts
//The boolean defines if the office phone only rings 
const isOnlyOfficePhoneRinging: boolean = FALSE|TRUE;

// Get all devices of the user
this.telephonyConfigService?.setOfficePhoneRingingOption(isOnlyOfficePhoneRinging);
```

A ON_ROUTING_MODE_CHANGE event is sent but after that the PBX has taken into account the modification.
The new telephony config mode is also provided through this event.