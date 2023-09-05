# Webpack documentation

## History

### Immediately Invoked Function Expression IIFE
Before bundeling, IIFE were used to maintain scope of each js file.
``` javascript
(function () {
    var userName = "Steve";
    
    function display(name)
    {
        alert("MyScript2.js: " + name);
    }

    display(userName);
  })();
```
**Cons:**
1.	Slowness
2.	Dead code and unused code
3.	No way to break or lazy load

### Common.js

CommonJS is a module formatting system. It is a standard for structuring and organizing JavaScript code. CJS assists in the server-side development of apps and it’s format has heavily influenced NodeJS’s module management.

Without module systems like CommonJS, dependancies had to be loaded in <script> tags in the header of an HTML file, OR all code had to be lumped together which is incredibly slow and inefficient for file loading.

CommonJS wraps each module in a function called ```require```, and includes an object called ```module.exports```, which exports code for availability to be required by other modules

All you have to do is add whatever you want accessible to other files onto the ‘exports’ object and require the module in the dependent file.

```javascript
// In circle.is
const PI = Math.PI;
exports.area = (r) => PI * r * r;
exports.circumference = (r) => 2 * PI * r;
// In some file
const circle = require('./circle.js');
console.log( The area of a circle of radius 4 is ${circle.area(4)}");
```
**Cons:**
1. There is no browser support for commonjs
2. Problems with circular dependencies 
3. Either use a server to translate CJS modules to something usable in the browser.
4. Or use XMLHttpRequest (XHR) to load the text of modules and do text transforms/parsing in browser.

### ESM (Eschma Script Module)
A module in JavaScript is just a file containing related code.
It is a function or group of similar functions. They are grouped together within a file and contain the code to execute a specific task when called into a larger application.

**Pros:**
1.	Independent/Self-contained: A module has to be as detached from other dependencies as possible.
2.	Specific: A module needs to be able to perform a single or a related group of tasks. The core essence of creating them in the first place is to create separate functionalities. One module, one (kind of) task.
3.	Reusable: A module has to be easy to integrate into various kinds of programs to perform its task.

In JavaScript, we use the ```import``` and ```export``` keywords to share and receive functionalities respectively across different modules.

- The ```export``` keyword is used to make a variable, function, class or object  accessible to other modules. In other words, it becomes a public code.
- The ```import``` keyword is used to bring in public code from another module.

**examples:**
``` javascript
//default imports
Import anything from ‘./file’

//named imports
Import { abc } from ‘./file’

//invalid imports
if(...) {
  import ...; // Error, not allowed!
}
{
  import ...; // Error, we can't put import in any block
}

import ... from getModuleName(); // Error, only from "string" is allowed

//dynamic imports
let modulePath = prompt("Which module to load?");

import(modulePath)
  .then(obj => <module object>)
  .catch(err => <loading error, e.g. if no such module>)
```
**Cons:**
- Modules are very slow in the browser because the browser at runtime needs to resolve the modules and get the exports and so on.
- Modules are loaded synchronously, so modules that are dependent on other modules must be read further down in the code.


## Webpack
- It is a module bundler
- Write any module format, require or use any format
- Allows you to use in the browser
- Supports static async bundling to use lazy loading

### How the bundling process works:
1. Each file is a module (js, ts, css, html ..)
2. When we import files into each other we create a dependency graph
![image](https://res.cloudinary.com/practicaldev/image/fetch/s--rmvC6VCz--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/i/9ldv44awmyjlww4bqsti.png)
3. During the bundling process, modules are combined into chunks.
4. Chunks combine into chunk groups and form a graph (ChunkGraph) interconnected through modules. When you describe an entry point - under the hood, you create a chunk group with one chunk.
![image](http://img.zhufengpeixun.cn/buildChunkGraph2.jpg)

- When we have one entry point -> it creates one chunk group containing one chunk
- When we have more than one entry point for example
``` javascript
module.exports {
    entry: {
        home: './home.js',
        about: './about.js',
    }
}
```
Two chunk groups with names home and about are created. Each of them has a chunk with a module 
./home.js for home and ./about.js for about

- When we use dynamic imports a non-initial chunk is created for that module
```javascript
import React from 'react';
import ReactDOM from'react-dom';

import(' ./app.jsx').then((App) => {
ReactDOM.render(<App />, root) ;
});
```
an initial chunk with name main is created. It contains:

    ./src/index.jsx
    react
    react-dom

and all their dependencies, except ./app.jsx
Non-initial chunk for ./app.jsx is created as this module is imported dynamically.
By default, there is no name for non-initial chunks so that a unique ID is used instead of a name. When using dynamic import we may specify a chunk name explicitly by using a "magic" comment:
```javascript
import(
/* webpackChunkName: "app" * /
'./app.jsx'
).then ((App) => {
ReactDOM.render(<App />, root) ;
});
```

### Loaders:
Out of the box, webpack only understands JavaScript and JSON files. Loaders allow webpack to process other types of files and convert them into valid modules that can be consumed by your application and added to the dependency graph.<br />
loaders have two properties in your webpack configuration:

- The ```test``` property identifies which file or files should be transformed.
- The ```use``` property indicates which loader should be used to do the transforming.
``` javascript
const path = require('path');

module.exports = {
  output: {
    filename: 'my-first-webpack.bundle.js',
  },
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
};
```
when it comes across a path that resolves to a '.txt' file inside of a ```require()/import``` statement, use the raw-loader to transform it before you add it to the bundle.

**Inline loaders:**
<br />
another way to use loaders is by using import statements:
```javascript
import Styles from 'style-loader!css-loader?modules!./styles.css';
```
**Order of loaders execution:**
<br />
Loaders are evaluated/executed from right to left (or from bottom to top). <br />
A chain is executed in reverse order, the first loader passes its result (resource with applied transformations) to the next one, and so forth. Finally, webpack expects JavaScript to be returned by the last loader in the chain.<br />
In the example below execution starts with sass-loader, continues with css-loader and finally ends with style-loader.
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
};
```
### Plugins:
Plugins are the backbone of webpack. They also serve the purpose of doing anything else that a loader cannot do.
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
...,
  plugins: [
    new webpack.ProgressPlugin(), //customizes how progress should be reported during compilation
    new HtmlWebpackPlugin({ template: './src/index.html' }), // will generate a HTML file including the bundeled js file
  ],
};
```

### Entry Point:
The starting point/s which webpack uses to begin building the dependency graph.<br />
**Single entry:**
```javascript
module.exports = {
  entry: './path/to/my/entry/file.js',
};
```
**multi-main entry:**
```javascript
module.exports = {
  entry: {
    main: './src/app.js',
    vendor: './src/vendor.js',
  },
};
```
This is useful when you would like to inject multiple dependent files together and graph their dependencies into one "chunk".<br />
With this, you can import required libraries or files that aren't modified (e.g. Bootstrap, jQuery, images, etc) inside vendor.js and they will be bundled together into their own chunk
```javascript
module.exports = {
  entry: {
    pageOne: './src/pageOne/index.js',
    pageTwo: './src/pageTwo/index.js',
    pageThree: './src/pageThree/index.js',
  },
};
```
We are telling webpack that we would like 3 separate dependency graphs (like the above example).
<br />
this will  create bundles of shared application code between each page. Multi-page applications that reuse a lot of code/modules between entry points can greatly benefit from these techniques, as the number of entry points increases.

### Output: 
The output property tells webpack where to emit the bundles it creates and how to name these files.<br />
TBD

### Runtime and Manifest:

**Runtime:**
The runtime is the code that runs in the browser to load and connect webpack modules/chunks.<br />
It contains the loading and resolving logic needed to connect your modules as they interact.<br />
**Manifest:**
Once your application hits the browser in the form of index.html file, some bundles and a variety of other assets required by your application must be loaded and linked somehow. <br />
So how does webpack manage the interaction between all of your required modules? <br />
As the compiler enters, resolves, and maps out your application, it keeps detailed notes on all your modules. <br />
This collection of data is called the "Manifest" and it's what the runtime will use to resolve and load modules once they've been bundled and shipped to the browser. <br />

### Hot Module Replacement:
used in dev environment to add/remove modules while the application is running without need for full reload, to speed up development.
1. The application asks the HMR runtime to check for updates.
2. the compiler needs to emit an "update" to allow updating from the previous version to the new version. The "update" consists of two parts:
 - The updated manifest (JSON)
 - One or more updated chunks (JavaScript)
3. The runtime asynchronously downloads the updates and notifies the application.
4. The application then asks the runtime to apply the updates.
5. The runtime synchronously applies the updates.
<br />

### Modules
Webpack supports the following module types natively without loaders:
- An ES2015 import statement
- A CommonJS require() statement
- An AMD define and require statement
- An @import statement inside of a css/sass/less file.
- An image url in a stylesheet url(...) or HTML ```<img src=...>``` file.
<br />
**Resolver:**
A resolver is a library which helps in locating a module by its absolute path.

### Module Federation:
TBD


### Source maps
if you bundle three source files (a.js, b.js, and c.js) into one bundle (bundle.js) and one of the source files contains an error, the stack trace will point to bundle.js <br />
This isn't always helpful as you probably want to know exactly which source file the error came from.<br/>
JavaScript offers source maps, which map your compiled code back to your original source code. <br/>If an error originates from b.js, the source map will tell you exactly that.

To configure it we add it to the config file
```javascript
 module.exports = {
   mode: 'development',
    ...
  devtool: 'inline-source-map',
    ...
 };
```

### Development tools
**watch mode** <br>
You can instruct webpack to "watch" all files within your dependency graph for changes. If one of these files is updated, the code will be recompiled so you don't have to run the full build manually.<br>

```javascript
   "scripts": {
    "watch": "webpack --watch",
   }
```
**webpack-dev-server**<br>
```
npm install --save-dev webpack-dev-server
```
webpack-dev-server serves bundled files from the directory defined in output.path
```javascript
module.exports = {
   mode: 'development',

   devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  }
}
```
```javascript
   "scripts": {
    "start": "webpack serve --open",
   }
```

**wepack-dev-middleware**
webpack-dev-middleware is a wrapper that will emit files processed by webpack to a server. This is used in webpack-dev-server internally, however it's available as a separate package to allow more custom setups if desired.
```javascript
// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
);
```
### Code Splitting:
This feature allows you to split your code into various bundles which can then be loaded on demand or in parallel.<br>
It can be used to achieve smaller bundles and control resource load prioritization which, if used correctly, can have a major impact on load time.
#### Entry Points: 
for each entry point we get a new bundle<br>
***cons***
- if there are same modules imported in both files, they will be duplicated between both bundles.
- we cant dynamically split code according to logic.

#### Prevent Duplication
##### dependOn
it allows us to share modules between chunks
```javascript
  entry: {
    index: {
      import: './src/index.js',
      dependOn: 'shared',
    },
    another: {
      import: './src/another-module.js',
      dependOn: 'shared',
    },
    shared: 'lodash',
   },
```
##### SplitChunksPlugin
allows us to extract common dependencies into an existing entry chunk or an entirely new chunk.
```javascript
  module.exports = {
    mode: 'development',
    entry: {
      index: './src/index.js',
      another: './src/another-module.js',
    },
   optimization: {
     splitChunks: {
       chunks: 'all',
     },
   },
  };
```
#### Dynamic imports:
using dynamic imports autimatically allows webpack to split bundles
```javascript
async function getComponent() {
  const element = document.createElement('div');
  const { default: _ } = await import('lodash');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
 }

 getComponent().then((component) => {
   document.body.appendChild(component);
 });
```
### Prefetching and Preloading
| Prefetching  | Preloading |
| ------------- | ------------- |
| will start loading after parent chunk finishes loading  | will start loading in parallel with the parent chunk  |
| downloaded when browser is idle  | instantly downloaded with medium priority  |

```javascript
import(/* webpackPrefetch: true */ './path/to/LoginModal.js');
import(/* webpackPreload: true */ 'ChartingLibrary');
```
### Caching optimizations
**Filenames**<br>
Webpack provides a method of templating the filenames using bracketed strings called substitutions. The [contenthash] substitution will add a unique hash based on the content of an asset. so when the asset's content changes, [contenthash] will change as well
```javascript
  module.exports = {
    output: {
     filename: '[name].[contenthash].js',
    },
  };
```
**Single runtime chunk**<br>
Creates a single runtime bundle for all chunks:

```javascript
  optimization: {
     runtimeChunk: 'single',
   },
```

**Group libraries into a single bundle**<br>
It's also good practice to extract third-party libraries, such as lodash or react, to a separate vendor chunk as they are less likely to change than our local source code.
```javascript
module.exports = {
    entry: './src/index.js',
    optimization: {
      runtimeChunk: 'single',
     splitChunks: {
       cacheGroups: {
         vendor: {
           test: /[\\/]node_modules[\\/]/,
           name: 'vendors',
           chunks: 'all',
         },
       },
     },
    },
  };
```
this will decrease the size of main bundle

**Keeping same hash for vendor modules**<br>
when our main module changes, we want to preserve the hash for vendor module because its unchanged.
```javascript
  module.exports = {
    optimization: {
     moduleIds: 'deterministic',
    }
}
```

### Analysis tools:
https://github.com/webpack/analyse
https://webpack.jakoblind.no/optimize/
https://github.com/relative-ci/bundle-stats 
## Resources
* [Slides](https://docs.google.com/presentation/d/1RuTDSvfaEFBFQ-3OiyxtuPTaGhv-xv7OG4jt5mpIdUw/edit?usp=sharing)
https://frontendmasters.com/courses/webpack-fundamentals/ 
https://blog.ag-grid.com/webpack-tutorial-understanding-how-it-works/
https://medium.com/@cgcrutch18/commonjs-what-why-and-how-64ed9f31aa46
https://nodejs.org/docs/latest/api/modules.html
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
https://requirejs.org/docs/whyamd.html
https://stackoverflow.com/questions/24581873/what-exactly-is-hot-module-replacement-in-webpack
https://javascript.info/modules-dynamic-imports
https://github.com/ronami/minipack/blob/master/src/minipack.js
https://github.com/TheLarkInn/compare-webpack-target-bundles
https://createapp.dev/webpack
https://stackoverflow.com/questions/42523436/what-are-module-chunk-and-bundle-in-webpack
https://webpack.js.org/glossary/
https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
https://stackoverflow.com/questions/42523436/what-are-module-chunk-and-bundle-in-webpack
https://www.toptal.com/javascript/hot-module-replacement-in-redux
