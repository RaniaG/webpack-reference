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

<br>The whole concept behind webpack is to allow more modular front-end development. <br>
This means writing isolated modules that are well contained and do not rely on hidden dependencies (e.g. globals).

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

#### Output Library/Package:
when packaging a library we want it to be available when imported by different methods.
by adding type: 'umd' it is available in CommonJs, AMD, and script tag
```javascript
 module.exports = {
   entry: './src/index.js',
   output: {
     path: path.resolve(__dirname, 'dist'),
     filename: 'library-name.js',
     globalObject: 'this',
     library: {
      name: 'webpackNumbers',
      type: 'umd',
     },
   },
 };
```

### Asset modules:
Loaders are usually used for asset management: <br>
Prior to webpack 5 it was common to use:

- `raw-loader` to import a file as a string
- `url-loader` to inline a file into the bundle as a data URI
- `file-loader` to emit a file into the output directory

Asset Modules types replace all of these loaders by adding 4 new module types:<br>

- `asset/resource` emits a separate file and exports the URL. Previously achievable by using file-loader.
- `asset/inline` exports a data URI of the asset. Previously achievable by using url-loader.
- `asset/source` exports the source code of the asset. Previously achievable by using raw-loader.
- `asset` automatically chooses between exporting a data URI and emitting a separate file. Previously achievable by using url-loader with asset size limit.

When using the old assets loaders (i.e. file-loader/url-loader/raw-loader) along with Asset Modules in webpack 5, you might want to stop Asset Modules from processing your assets again as that would result in asset duplication. This can be done by setting the asset's module type to 'javascript/auto'. <br>

#### asset/resource:
Files will be emitted to the output directory and their paths will be injected into the bundles
```javascript
 module: {
   rules: [
     {
       test: /\.png/,
       type: 'asset/resource'
     }
   ]
 },
```
```javascript
import mainImage from './images/main.png';
img.src = mainImage;
```
the mainImage above will be bundled as ` /dist/151cfcfa1bd74779aadb.png`
<br><br>
if we want to customize the output path for the assets we can use `publicPath` which allows us to specify base path for all assets.
```javascript
export default {
  output: {
    publicPath: process.env.ASSET_PATH,
  },
};
```
we can also define the name for the asset module output filename, or we can define specific output filename for a specific resource type
```javascript
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
   assetModuleFilename: 'images/[hash][ext][query]'
  },
  module: {
    rules: [
      {
        test: /\.png/,
        type: 'asset/resource'
     },
     {
       test: /\.html/,
       type: 'asset/resource',
       generator: {
         filename: 'static/[hash][ext][query]'
       }
     }
    ]
  },
```
#### asset/inline:
Files will be injected into the bundles as data URI.
```javascript
  module: {
    rules: [
      {
       test: /\.svg/,
       type: 'asset/inline'
     }
    ]
}
```
```javascript
import metroMap from './images/metro.svg';
block.style.background = `url(${metroMap})`;
```
metroMap will be replaced by `url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDo...vc3ZnPgo=)`
<br>
we can also change the base64 encoding into any other encoding:
```javascript
const svgToMiniDataURI = require('mini-svg-data-uri');

module.exports = {
...
  module: {
    rules: [
      {
        test: /\.svg/,
        type: 'asset/inline',
       generator: {
         dataUrl: content => {
           content = content.toString();
           return svgToMiniDataURI(content);
         }
       }
      }
    ]
  },
};
```
#### assets/source:
Files will be injected into the bundles as is.
```javascript
module: {
    rules: [
      {
       test: /\.txt/,
       type: 'asset/source',
      }
    ]
  }
```
```javascript
 import exampleText from './example.txt';
 block.textContent = exampleText; 
```
exampleText will be bundled as 'Hello world' (the content of example.txt)

#### asset:
This will allow webpack to automatically choose between `resource` and `inline` by following a default condition: a file with size less than 8kb will be treated as a inline module type and resource module type otherwise.<br>

We can change this condition by setting a Rule.parser.dataUrlCondition.maxSize option on the module rule level of your webpack configuration:
```javascript
module: {
    rules: [
      {
        test: /\.txt/,
        type: 'asset',
       parser: {
         dataUrlCondition: {
           maxSize: 4 * 1024 // 4kb
         }
       }
      }
    ]
  },
```
#### disable emitting assets:
For use cases like Server side rendering, you might want to disable emitting assets
```javascript
module: {
    rules: [
      {
        test: /\.png$/i,
        type: 'asset/resource',
        generator: {
          emit: false,
        },
      },
    ],
  },
```

### Tree shaking
You can imagine your application as a tree. The source code and libraries you actually use represent the green, living leaves of the tree. Dead code represents the brown, dead leaves of the tree that are consumed by autumn. In order to get rid of the dead leaves, you have to shake the tree, causing them to fall.
#### Problem with CommonJS modules
CommonJS has a require() function that fetches an external module based on the path provided, and it adds it to the scope during runtime.<br>
That require is a function like any other in a program makes it hard enough to evaluate its call outcome at compile-time. On top of that is the fact that adding require calls anywhere in the code is possible — wrapped in another function call, within if/else statements, in switch statements, etc.<br>
For example, the statement `let firstName = getName()` has side effects, because the call to `getName()` can not be removed without changing the meaning of the code, even if nothing needs firstName. ⁣⁣

#### ES6 Solution
the ESM specification has settled on this new architecture, in which modules are imported and exported by the respective keywords import and export. <br>
Therefore, no more functional calls. <br>
ESMs are also allowed only as top-level declarations — nesting them in any other structure is not possible, being as they are static: ESMs do not depend on runtime execution.<br>
For example, the statement `let firstName = 'Jane'` has no side effects because the statement can be removed without any observed difference if nothing needs firstName.<br>
Only modules defined with the ES2015 module syntax `(import and export)` can be tree-shaken.<br>
Tree shaking starts by visiting all parts of the entry point file with side effects, and proceeds to traverse the edges of the graph until new sections are reached. Once the traversal is completed, the JavaScript bundle includes only the parts that were reached during the traversal. The other pieces are left out.<br>
In the following case only the read function is added to the bundle and the nap function is excluded.
```javascript
export function read(props) {⁣⁣
    return props.book⁣⁣
}⁣⁣
⁣⁣
export function nap(props) {⁣⁣
   return props.winks⁣⁣
}⁣⁣
```
```javascript
import { read } from 'utilities';⁣⁣
⁣⁣
eventHandler = (e) => {⁣⁣
  read({ book: e.target.value })⁣⁣
}⁣⁣
```

#### usedExports:
usedExports relies on terser to detect side effects in statements. It is a difficult task in JavaScript and not as effective as straightforward sideEffects flag. It also can't skip subtree/dependencies since the spec says that side effects need to be evaluated.

```javascript
//inside webpack config
 optimization: {
   usedExports: true,
 }
```
This options marks unused exports but doesn't actually remove it from the output bundle.<br>
For example:<br>
The following square function was exported but wasn't imported anywhere, but its still generated in the output bundle.
```javascript
/* 1 */
/***/ (function (module, __webpack_exports__, __webpack_require__) {
  'use strict';
  /* unused harmony export square */
  /* harmony export (immutable) */ __webpack_exports__['a'] = cube;
  function square(x) {
    return x * x;
  }

  function cube(x) {
    return x * x * x;
  }
});
```
**Problem with Higher order components:** 
While exporting function works fine, React's Higher Order Components (HOC) are problematic in this regard.
```javascript
var Button$1 = withAppProvider()(Button);

export {
  // ...,
  Button$1,
};
```
When Button is unused you can effectively remove the export { Button$1 }; which leaves all the remaining code. So the question is "Does this code have any side effects or can it be safely removed?". Difficult to say, especially because of this line withAppProvider()(Button).
<br/>
<br/>
Are there any side effects when calling withAppProvider? Terser actually tries to figure it out, but it doesn't know for sure in many cases.
<br/>
<br/>
But we can help terser by using the `/*#__PURE__*/` annotation. It flags a statement as side effect free. So a small change would make it possible to tree-shake the code:
```javascript
var Button$1 = /*#__PURE__*/ withAppProvider()(Button);
```
This would allow to remove this piece of code. But there are still questions with the imports which need to be included/evaluated because they could contain side effects.
<br><br>
To tackle this, we use the "sideEffects" property in package.json.

#### Side Effects 
Bundlers serve their purpose by evaluating the code provided as much as possible in order to determine whether a module is pure. But code evaluation during compiling time or bundling time can only go so far. <br>
Therefore, it’s assumed that packages with side effects cannot be properly eliminated, even when completely unreachable.
<br> <br>
Because of this, bundlers now accept a key inside the module’s package.json file that allows the developer to declare whether a module has no side effects. This way, the developer can opt out of code evaluation and hint the bundler; the code within a particular package can be eliminated if there’s no reachable import or require statement linking to it. 
<br>
This can speedup up compile time.
Example package.json:
```javascript
{
  "name": "your-project",
  "sideEffects": false
}
```
It's similar to `/*#__PURE__*/` but on a module level instead of a statement level. It says ("sideEffects" property): "If no direct export from a module flagged with no-sideEffects is used, the bundler can skip evaluating the module for side effects.".
<br><br>
we can indicate that some of the files have side effects by listing them in an array:
```javascript
{
  "name": "your-project",
  "sideEffects": ["./src/some-side-effectful-file.js"]
}
```

#### production mode:
When setting `mode: production` it will enable the terser plugin which will remove dead code, it will also enable `ModuleConcatenationPlugin` which is needed for tree shaking to work.


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
The following utilities improve performance by compiling and serving assets in memory rather than writing to disk:
- webpack-dev-server
- webpack-hot-middleware
- webpack-dev-middleware
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

### Peer dependency:
When we dont want external libraries to increase our package bundle size.<br>
In this case, we'd prefer to treat lodash as a peer dependency. Meaning that the consumer should already have lodash installed.
```javascript
  externals: {
    // Everything that starts with "library/"
    /^library\/.+$/,
     lodash: {
       commonjs: 'lodash',
       commonjs2: 'lodash',
       amd: 'lodash',
       root: '_',
     },
   }
```

### Performance enhancement:
1. Use loaders only to needed modules. our regex should match only needed files inside our src directory
```javascript
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader',
      },
    ],
```
2. Resolving:<br>
- Minimize the number of items in resolve.modules, resolve.extensions, resolve.mainFiles, resolve.descriptionFiles, as they increase the number of filesystem calls.
- Set resolve.symlinks: false if you don't use symlinks (e.g. npm link or yarn link).
- Set resolve.cacheWithContext: false if you use custom resolving plugins, that are not context specific
3. The DllPlugin and DllReferencePlugin provide means to split bundles in a way that can drastically improve build time performance. 
4. Keep chunks small<br>
- Use fewer/smaller libraries.
- Use the SplitChunksPlugin in Multi-Page Applications.
- Use the SplitChunksPlugin in async mode in Multi-Page Applications.
- Remove unused code.
- Only compile the part of the code you are currently developing on.

5. Avoid Production Specific Tooling<br>
Certain utilities, plugins, and loaders only make sense when building for production. For example, it usually doesn't make sense to minify and mangle your code with the TerserPlugin while in development.<br> These tools should typically be excluded in development:

- TerserPlugin
- AggressiveSplittingPlugin
- AggressiveMergingPlugin
- ModuleConcatenationPlugin

6. Avoid Extra Optimization Steps<br>
Webpack does extra algorithmic work to optimize the output for size and load performance. These optimizations are performant for smaller codebases, but can be costly in larger ones:
```javascript
module.exports = {
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
};
```
7. Output Without Path Info:
```javascript
   module.exports = {
      output: {
        pathinfo: false,
      },
    };
```
<br>
8. TypeScript Loader:<br>
To improve the build time when using ts-loader, use the transpileOnly loader option. On its own, this option turns off type checking. To gain type checking again, use the ForkTsCheckerWebpackPlugin. This speeds up TypeScript type checking and ESLint linting by moving each to a separate process.<br>

```javascript
module.exports = {
  test: /\.tsx?$/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  ],
};
```
<br>

refer to: https://github.com/TypeStrong/ts-loader/tree/main/examples/fork-ts-checker-webpack-plugin <br>

9. Some tools cause performance degradation in production:
- Babel: Minimize the number of preset/plugins
- TypeScript:
  - Use the fork-ts-checker-webpack-plugin for typechecking in a separate process.
  - Configure loaders to skip typechecking.
  - Use the ts-loader in happyPackMode: true / transpileOnly: true.
- node-sass: has a bug which blocks threads from the Node.js thread pool. When using it with the thread-loader set workerParallelJobs: 2
 
### Production vs Development:
| Development  | Production |
| ------------- | ------------- |
| strong source mapping    | lighter weight source maps  |
| a localhost server with live reloading or hot module replacement  | minified bundles and optimized assets to improve load time  |
<br>
its better to keep two separate configuration for each environment and to merge them using `webpack-merge` package<br>

```javascript
 |- webpack.common.js
 |- webpack.dev.js
 |- webpack.prod.js
```

```javascript
 const { merge } = require('webpack-merge');
 const common = require('./webpack.common.js');

 module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
 });
```

the use of merge() calls in the environment-specific configurations to include our common configuration in webpack.dev.js and webpack.prod.js<br>
afterwards we can use these configuration with different scripts:
```javascript
    "scripts": {
     "start": "webpack serve --open --config webpack.dev.js",
     "build": "webpack --config webpack.prod.js"
    },
```
> Avoid inline-*** and eval-*** use in production as they can increase bundle size and reduce the overall performance.

### Ployfills: 
A script that updates/adds new functions is called “polyfill”. It “fills in” the gap and adds missing implementations.<br>
New language features may include not only syntax constructs and operators, but also built-in functions.<br>
For example, Math.trunc(n) is a function that “cuts off” the decimal part of a number.<br>
In some (very outdated) JavaScript engines, there’s no Math.trunc, so such code will fail.<br>
As we’re talking about new functions, not syntax changes, there’s no need to transpile anything here. We just need to declare the missing function.

### Shimming:
Making some variables available globally or adding extra functionality for browser support.
Why does webpack need shimming concept:
- some third party libraries may expect global dependencies (e.g. $ for jQuery). The libraries might also create globals which need to be exported.
- when you want to polyfill browser functionality to support more users. In this case, you may only want to deliver those polyfills to the browsers that need patching (i.e. load them on demand).

***1. Shimming globals:***
The `ProvidePlugin` makes a package available as a variable in every module compiled through webpack. <br>
If webpack sees that variable used, it will include the given package in the final bundle.<br>
Instead of importing lodash in every file, we can use ProviderPlugin and use lodash directly as `_`

```javascript
const path = require('path');
const webpack = require('webpack');

 module.exports = {
   entry: './src/index.js',
   output: {
     filename: 'main.js',
     path: path.resolve(__dirname, 'dist'),
   },
  plugins: [
    new webpack.ProvidePlugin({
      _: 'lodash',
    }),
  ],
 };
```
***2. Provide window for a package or script:***
if we want this variable to correspond to window object for a specific script, we can use `imports-loader`
```javascript
  module: {
    rules: [
      {
        test: require.resolve('./src/index.js'),
        use: 'imports-loader?wrapper=window',
      },
    ],
  },
```
***3. Global variables:***
If we want some variables exported from a script or a package to be available globally, we can use `exports-loader`
```javascript
      {
        test: require.resolve('./src/globals.js'),
        use:
          'exports-loader?type=commonjs&exports=file,multiple|helpers.parse|parse',
      },
```
***4. Polyfills:***
We can create a polyfills file and add it as an entry point, and include all the used polyfills.
```javascript
//polyfills.js
import 'babel-polyfill';
import 'whatwg-fetch';
```
```javascript
  entry: {
    polyfills: './src/polyfills',
    index: './src/index.js',
  },
```

### Analysis tools:
https://github.com/webpack/analyse
https://webpack.jakoblind.no/optimize/
https://github.com/relative-ci/bundle-stats 
## Resources
* [Slides](https://docs.google.com/presentation/d/1RuTDSvfaEFBFQ-3OiyxtuPTaGhv-xv7OG4jt5mpIdUw/edit?usp=sharing)
- https://frontendmasters.com/courses/webpack-fundamentals/ 
- https://blog.ag-grid.com/webpack-tutorial-understanding-how-it-works/
- https://medium.com/@cgcrutch18/commonjs-what-why-and-how-64ed9f31aa46
- https://nodejs.org/docs/latest/api/modules.html
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- https://requirejs.org/docs/whyamd.html
- https://stackoverflow.com/questions/24581873/what-exactly-is-hot-module-replacement-in-webpack
- https://javascript.info/modules-dynamic-imports
- https://github.com/ronami/minipack/blob/master/src/minipack.js
- https://github.com/TheLarkInn/compare-webpack-target-bundles
- https://createapp.dev/webpack
- https://stackoverflow.com/questions/42523436/what-are-module-chunk-and-bundle-in-webpack
- https://webpack.js.org/glossary/
- https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
- https://stackoverflow.com/questions/42523436/what-are-module-chunk-and-bundle-in-webpack
- https://www.toptal.com/javascript/hot-module-replacement-in-redux
- https://www.smashingmagazine.com/2021/05/tree-shaking-reference-guide/
- https://www.patterns.dev/posts/introduction
- https://javascript.info/polyfills
