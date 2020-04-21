## Installation

### Installing the dependencies

In terminal:

```
npm install
```

## Start Development process and watch

```
npm run start:watch
```

## Setup apollo 

Create a file `apollo.token.js` who export the token 

You can use apollo.token.js.example

# Testing

## Unit testing

All unit test files must end with `.test.ts`. By convention, it must be located in the same folder as the file it's testing.

Run test:

```
npm run test
```

# Building

Build will be located in the `build` folder at the root of the app

```
npm run build
```


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `npm run gen_types`

Generate GraphQl Types using [apollo codegen plugin](https://github.com/leighhalliday/apollo-generating-types)

### `npm run create_comp`

Generate a new component in src/components


