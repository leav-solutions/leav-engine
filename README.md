
# Installation

## Installing the dependencies

This app is based on Node.js. The version shall be 8.0 or above.

Be sure to have Node and npm installed on your machine.

In terminal:

```
npm install
```
### Create and set the local environment.

Configuration files can be found in the `config` folder.
It's hierarchical, it means you can easily overwrite values for specific environment or your local settings:
- default values are defined in `default.js`
- defaults are overwritten by file matching environment (`development`, `test`, `production`...)
- then you can locally overwrite these files with `local.js`. This one is not supposed to be versioned at it matches your own local environment.

Every value overwrites herited value if any, or add a new value. You don't have to specify all values in environment or local file. Only set what you need to overwrite.

In the code, this config can be retrieved by importing the file `config.ts`:

    import {config} from './config';
    const conf = await config;

## Troubleshooting

If you're stuck in the migration / installation phase, try to remove the `package-lock.json` file, and type in Terminal: `npm i`.


# Running

## Start Development process and watch

```
npm run start:watch
```

# Testing

## Unit testing

All unit test files must end with `.spec.ts`. By convention, it must be located in the same folder as the file it's testing.

Run test:
```
npm run test
```

## Integration testing
All integration test files must end with `.test.ts`. These files must be located in a dedicated folder: `src/__tests__/integration`.


# Building

Build will be located in the `build` folder at the root of the app

```
npm run build
```
