# Install SDK

## Requirements

Before you start using Rainbow Web SDK, you need to make sure you have installed the required software tools.

**- Node.js and NPM:**
Make sure you have installed Node.js version 18.18.2 or above.

```
$ node --version
  v18.18.2
```

> 💡 **Tips**  
> You can use [nvm](https://github.com/nvm-sh/nvm) for managing multiple Node versions on a single machine installed.

**- A big browser:**
We will be use Chrome browser to develop (best debug tools), but you can use any of the browsers supported by Rainbow Web SDK.

**- A clever text editor:**
Rainbow Web SDK is a JavaScript library, therefore you can use any text editor or IDE to develop your first project (but our favorite editor is [Microsoft Visual Studio Code](https://code.visualstudio.com/)).

## Create your web application

As mentioned above, the project is going to use the structure of a simple JavaScript application.  
We will need a basic HTML structure that would load all the necessary libraries.

Go on and create a new folder. We recommend using command line tools.

Open a shell console and execute the following commands:

    $ mkdir myFirstRainbowProject
    $ cd myFirstRainbowProject
    $ npm init -y

Once finished, you should have your JSON file `package.json` filled with the information.  
This step is required to install the mandatory NPM libraries.

**Patch your package.json**  
To allow your project to load ES modules you have to patch the newly created package.json  
Just add the line `"type": "module",`

```js
{
  "name": "myfirstrainbowproject",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

## Install and configure a module bundler : Rollup

Our SDK is delivered as an EcmaScript Module (ESM), to unleash the full power of ESM module you have to use a module bundler to bundle your application.

> In this example we will use the Rollup module bundler, but you are free to use any modern module bundler (webpack is also a good candidate for example).

Rollup is easy to use and configure!

> 🤔 **According to their authors:**  
> <br/> > **_Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application.  
> It uses the new standardized format for code modules included in the ES6 revision of JavaScript, instead of previous idiosyncratic solutions such as CommonJS and AMD.  
> ES modules let you freely and seamlessly combine the most useful individual functions from your favorite libraries._**

**So, it's easy! Let's install Rollup:**

```
$ npm install rollup --global
$ npm install rollup-plugin-typescript2 --save-dev
$ npm install @rollup/plugin-node-resolve --save-dev
$ npm install serve --save-dev
$ npm install rollup-plugin-copy --save-dev
```

With the previous commands we have installed:

- The Rollup bundler
- The typescript Rollup plugin (Because we are in 2024 and that we refuse to code in JS 😅)
- The node Rollup plugin (To permit bundle to access the libraries stored in the node_modules directory)
- The mini HTTP server (serve) that we'll use to serve our application
- The Rollup copy plugin to copy static files in dist directory

**Now add the Rollup config file at the root of the project**

**rollup.config.js:**

```js
import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import nodeResolve from "@rollup/plugin-node-resolve";

const config = [
  {
    input: "./src/index.ts",
    output: {
      file: "./dist/index.js",
      format: "esm",
      sourcemap: "true",
    },
    plugins: [
      nodeResolve(),
      typescript({ useTsconfigDeclarationDir: false }),
      copy({ targets: [{ src: ["./src/index.html"], dest: "./dist" }] }),
    ],
  },
];

export default config;
```

Open your package.json file and add the "build" and "serve" line in you script entry

```js
"scripts": {
    "build": "rollup -c rollup.config.js",
    "serve": "serve ./dist",
}
```

The "build" command will execute the Rollup bundler.  
The "serve" command will start a local HTTP server on your computer to serve our test application.

\*\* Finally add a minimal tsconfig.json configuration file

```js
{
    "compilerOptions": {
        "module": "ESNext",
        "target": "es2019",
        "moduleResolution": "node"
    }
}
```

## Install the Rainbow Web SDK

Now, it's time to install the Rainbow Web SDK library.  
The SDK for Web is available as an NPM package to make the installation and updates easier.

To install it, execute the following command at the root of your project (please check for the latest version on npmjs site)

```sh
$ npm install rainbow-web-sdk@5.0.1-sts
```

The Rainbow Web SDK has been added to your folder node_modules. This folder contains all the packages installed from NPM.

## Create the index.html and index.ts root files

First create the src directory (make sure you navigate to your project folder first):

```sh
$ mkdir src
```

And then put these two files in the newly created src directory:

**index.html:**

```html
<html>
  <head>
    <!-- 🤔 Note: in the next line .js extension is not a typo  -->
    <script type="module" src="./index.js"></script>
  </head>
  <body>
    It works !!
  </body>
</html>
```

**index.ts:**

```ts
import { RainbowSDK } from "rainbow-web-sdk";
class TestApplication {
  constructor() {
    console.log("It works !!");
  }
}
const testApplication = new TestApplication();
```

## Project structure

```.
├── node_modules
│   ├── rainbow-web-sdk
│   │   └── ...
│   └── ...
├── package.json
├── package-lock.json
├── rollup.config.js
├── tsconfig.json
└── src
    └── index.html
    └── index.ts
```

## First run of our test application

Firstly, build the index.js bundle (the Rollup bundler will transpile the .ts file into a .js ESM file) and push it in the /dist directory.

    $ npm run build

Then launch the HTTP server to serve our application:

    $ npm run serve

You can now open you "big browser" with the following url :

[http://localhost:3000](http://localhost:3000)

And here is the result you should obtains on your screen (if you have like us open the debug tool console of your browser) : a double "It works !!"

![ItWorks](/assets/doc/images/test-app-screen1.png)

[Continue to Configuration](/doc/page/guides/gettingStarted/config)
