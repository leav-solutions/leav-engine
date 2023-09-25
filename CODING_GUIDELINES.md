This document establishes coding standards that should be applied across all projects. All "cosmetic" conventions (tabs vs spaces, brackets position, etc.) are managed by eslint and Prettier and won't be discussed in this document.

Current code might not respect all of this conventions. New code should.

Apply the boy-scout rule:
>Always leave the code better than you found it.


# Generalities
- Keep the code [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) but don't overinterpret it and avoid bad abstractions.
```ts
/** Good application of the DRY principle */
// Define a base Shape class with a common area calculation method
abstract class Shape {
  abstract calculateArea(): number;
}

// Create specific shape classes (Circle and Rectangle) that inherit from Shape
class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  calculateArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  calculateArea(): number {
    return this.width * this.height;
  }
}

/** Overabstraction */
function performOperation(operationType: string, value1: number, value2: number): number {
  if (operationType === 'add') {
    return value1 + value2;
  } else if (operationType === 'subtract') {
    return value1 - value2;
  } else if (operationType === 'multiply') {
    return value1 * value2;
  } else if (operationType === 'divide') {
    return value1 / value2;
  } else {
    throw new Error('Invalid operation type');
  }
}
```
- Respect the Separation of Concern principle
```ts
    // Bad
    function calculateSumAndAverage(numbers: number[]): [number, number] {
      let sum = 0;
      for (const num of numbers) {
        sum += num;
      }
      const average = sum / numbers.length;
      return [sum, average];
    }

    // Good
    function calculateSum(numbers: number[]): number {
      let sum = 0;
      for (const num of numbers) {
        sum += num;
      }
      return sum;
    }
    
    function calculateAverage(numbers: number[]): number {
      const sum = calculateSum(numbers);
      return sum / numbers.length;
    }
```
- Prefer clean and explicit code over comments. If necessary, explain the why, not the how.
- [https://en.wikipedia.org/wiki/Functional_programming](Functional programming) is preferred. Classes are allowed only for specific situations (like a custom `Error` class)
- Use pure functions as much as possible. Avoid mutating params.

## Naming
- Always use camelCase to name your functions, variables and files. Database fields can use snake_case.
- Prefer long names over short but hard to read or understand names. Too much abbreviation might actually make reading more difficult. Rule of thumbs: if you cannot pronounce it out loud, it's probably not a good name.
- Types names must use PascalCase
- All types interfaces must start with a `I` (enforced by eslint).
- Enum names must be uppercase
- Internal (= not exported) functions are prefixed by a _

## Tests
- Test Driven Development is encouraged.
- A test coverage of 100% is not mandatory. Tests must make sense and give confidence in the code.
- Snapshot tests must only be used in very specific situation. They're very sensitive and subject to a lot of false-positive. Prefer testing the logic and business rules of your code.

## Types
- Global types must be placed in a folder named `_types` at the root of `src`. Types that are more specific to a little part of your code and are not used globally could have their own `_types.ts` file, placed where it makes more sense.
- When a file starts to have a lot of types definitions in it, consider moving it into its own `_types.ts`
- Types used across multiple apps should go to the `@leav/utils` package.

# Frontend apps
Following rules apply to frontend development only, specifically on a React app.

## Generalities
- Seperate logic from UI as much as possible. It will make your component easier to read and the logic will be easier to test and reason about.

## Custom Hooks
- Hooks name always start by `use` (eg. `useLang` )
- Each custom hook must have its own folder, containing these files:
	- `useMyHook.ts`
	- `useMyHook.test.ts`
	- `index.ts` exporting `useMyHook`
- Folder is named after hook's name
- Each hook must be unit-tested
- All reusable hooks are in the hooks folder, at projet root

## Props
- Props are named in camelCase
- If prop is a function called on an event (click, submit...), name must start with `on` (eg. `onSubmit`). Function passed to this prop must start with `_handle` (eg. `_handleSubmit`)
- Don't pass function directly when calling a component. Use a variable instead. It improves readability.

```jsx
// Bad
<MyComp onSubmit={() => {/* Handle submit... */}}>

// Good
const _handleSubmit = () => { /* Handle submit... */ };
<MyComp onSubmit={_handleSubmit} />
```

## Testing
- Use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) through the wrapper available in `_tests/testUtils.tsx`. It includes automatically all global providers (like Apollo or Redux)
- Prefer using `getByRole` : it encourages to use accessibility best practices
- Use `getByTestId` only on last resort
- Don't use non-standard roles (eg. `<div role="myOwnRole">...</div>`)
- Small integration tests, testing a whole feature, might make more sense than testing all presentational components individually

## Folder structure
- One component per file, one folder per component, same name as the component. Containing at least these files
	- `Component.tsx`
	- `Component.test.tsx`
	- `index.ts` exporting `Component`. It allows to directly import the component by its folder name.
- Folders structure must look similar to components tree at runtime. For example:

**Components**: Parent > Child > Grandchild

**Folders**:
```
Parent/
├─ Parent.tsx
├─ Parent.test.tsx
├─ index.ts
├─ Child/
│  ├─ Child.tsx
│  ├─ index.tsx
│  ├─ GrandChild/
│  │  ├─ GrandChild.tsx
│  │  ├─ index.ts
```

## Sharing components
- If a component is used in different, unrelated branches within one app it must go to the `shared` folder (eg. `shared/MySharedComponent`)
- If a component might be used across multiple apps, it belongs to `@leav/ui`
- If a component is very generic and might be used across multiple unrelated projects, we'll consider adding it to the design system

## Styles
- Avoid inline styles. Prefer using `styled-components` with a clear and meaningful name.
