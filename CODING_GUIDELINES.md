This document establishes coding standards that should be applied across all projects. All "cosmetic" conventions (tabs vs. spaces, brackets’ position, etc.) are managed by eslint and Prettier and won't be discussed in this document.

The current code might not respect all of these conventions. New code should.

Apply the boy-scout rule:

> Always leave the code better than you found it.

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
    constructor(
        private width: number,
        private height: number,
    ) {
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

- [Functional programming](https://en.wikipedia.org/wiki/Functional_programming) is preferred. Classes are allowed only for specific situations (like a custom `Error` class)
- Use pure functions as much as possible. Avoid mutating params.

## Comments

- Default to no comment. Good naming and a clear structure should make the "what" obvious on their own.
- A comment only earns its place if it captures a non-obvious "why": a hidden constraint, a subtle invariant, a workaround for a specific bug, something that would surprise the reader.
- Never restate what the next line already says.
- Never reference the current task, ticket or MR (`// fix LEAVC-1234`, `// added for the X flow`) — that belongs in the commit/MR description, not in code that outlives it.
- Before writing a comment, check whether renaming or extracting would remove the need for it.
- Comments are written in English, like the rest of the codebase.

```ts
// Bad — restates the code, references the ticket
// Loop through users and keep only the active ones (fix for LEAVC-1234)
const activeUsers = users.filter(u => {
    return u.active; // check active flag
});

// Good — self-descriptive, no comment needed
const activeUsers = users.filter(user => user.active);

// Good — the comment earns its place: a non-obvious constraint
// ArangoDB traversal depth is capped at 5 by the driver; deeper trees are chunked below.
const MAX_TRAVERSAL_DEPTH = 5;
```

## Naming

- Prefer long names over short but hard to read or understand names. Too many abbreviations might actually make reading more difficult. Rule of thumbs: if you cannot pronounce it out loud, it's probably not a good name.
- Internal (= not exported) functions are prefixed by `_`
- Folder name: plural if several modules inside
- Database fields can use snake_case
- **`apps/core`** : ne pas écrire en dur l'id d'une library/attribut/arbre **système** (`'users'`, `'login'`, `'discussion_threads'`…). Utiliser les enums de `apps/core/src/_constants/` (`SystemLibraries`, `SystemTrees`, `CommonAttributes`, `UsersAttributes`, `FilesAttributes`, `DiscussionThreadsAttributes`…). Voir [apps/core/CLAUDE.md](apps/core/CLAUDE.md#constantes-des-entités-système-libraries-attributs-arbres).

### TypeScript

Enforced by ESLint (`eslint.config.mjs`, rule `@typescript-eslint/naming-convention`).

| Element           | Convention                                  | Example                    |
| ----------------- | ------------------------------------------- | -------------------------- |
| Interface         | `PascalCase` prefixed with `I` (mandatory)  | `ILibrary`, `IAmqpService` |
| Class             | `PascalCase`                                | `LoggerCallStack`          |
| Enum              | `PascalCase`                                | `AttributeType`            |
| Enum member       | `UPPER_CASE`                                | `SIMPLE_LINK`              |
| Type alias        | `PascalCase`                                | `ValuesOccurrences`        |
| Exported variable | `PascalCase` \| `camelCase` \| `UPPER_CASE` | —                          |
| Constant          | `UPPER_CASE`                                | `MASS_SELECTION_ALL`       |
| Exported function | `camelCase` \| `PascalCase`                 | —                          |
| Parameter         | `camelCase` (underscore prefix tolerated)   | `_noop`                    |

### Files

| Type                  | Convention                                                     | Example                                    |
| --------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| React component       | `PascalCase.tsx`                                               | `EditTreeAttributeValueLine.tsx`           |
| Hook                  | `useCamelCase.tsx`                                             | `useCountValuesOccurrences.tsx`            |
| Feature folder        | `kebab-case/`                                                  | `edit-attribute/`, `manage-view-settings/` |
| Infra/internal folder | `_kebab-case/` (underscore prefix)                             | `_queries/`, `_gqlTypes/`, `_types/`       |
| GraphQL operation     | `operationNameQuery.graphql` / `operationNameMutation.graphql` | `countValuesOccurrencesQuery.graphql`      |
| Tests                 | Consistent with local context                                  | `.test.tsx` (libs/ui), `.spec.ts` (core)   |

### Styled components

Include the HTML tag + `Styled` suffix:

```tsx
const DivStyled = styled.div`...`;
const KitButtonStyled = styled(KitButton)`...`;
```

### `console`

- Forbidden in `apps/core` and backend apps
- In frontend apps (`libs/ui`, `apps/admin`, `apps/app-studio`…): only `console.warn`, `console.error` and `console.info` are allowed

## Tests

- Test-Driven Development is encouraged.
- A test coverage of 100% is not mandatory. Tests must make sense and give confidence in the code.
- Snapshot tests must only be used in very specific situations. They're very sensitive and subject to a lot of false-positives. Prefer testing the logic and business rules of your code.
- **Assert on the exact expected value.** Avoid loose, truthiness-based matchers like `toBeFalsy()` / `toBeTruthy()`: they pass for a whole range of values and hide regressions (e.g. `toBeFalsy()` accepts `false`, `0`, `''`, `null`, `undefined` and `NaN` alike). Assert precisely what you expect instead — `toBe(false)`, `toBeNull()`, `toBe(0)`, `toBe('')`, `toBeUndefined()`, etc.

```ts
// Bad — passes for false, 0, '', null, undefined, NaN
expect(result.isEnabled).toBeFalsy();
expect(result.error).toBeTruthy();

// Good — asserts the exact expected value
expect(result.isEnabled).toBe(false);
expect(result.error).toBe('Field is required');
```

## Types

- Global types must be placed in a folder named `_types` at the root of `src`. Types that are more specific to a little part of your code and are not used globally could have their own `_types.ts` file, placed where it makes more sense.
- When a file starts to have a lot of types definitions in it, consider moving it into its own `_types.ts`
- Types used across multiple apps should go to the `@leav/utils` package.

# Frontend apps

The following rules apply to frontend development only, specifically on a React app.

## Generalities

- Separate logic from the UI as much as possible. It will make your component easier to read, and the logic will be easier to test and reason about.

## Component declaration

- Declare components as plain arrow functions and type the props inline on the parameter. Do **not** annotate the component with `FunctionComponent` / `FC` — it adds an implicit `children` prop, hides the real signature, and is no longer the recommended React idiom.

```tsx
// ✅ Good — props typed inline on the parameter
export const MyComponent = ({children}: {children: ReactNode}) => {
    /* ... */
};

export const MyComponent = ({id, title}: IMyComponentProps) => {
    /* ... */
};

// ❌ Bad — FunctionComponent / FC annotation
export const MyComponent: FunctionComponent<IMyComponentProps> = ({id, title}) => {
    /* ... */
};
```

- This applies to new code. Don't bulk-migrate existing `FunctionComponent` components, but convert them opportunistically when you touch the file.

## Custom Hooks

- Hooks name always start by `use` (e.g. `useLang` )
- Each custom hook must have its own folder, containing these files:
    - `useMyHook.ts`
    - `useMyHook.test.ts`
    - `index.ts` exporting `useMyHook`
- Folder is named after hook's name
- Each hook must be unit-tested
- All reusable hooks are in the hooks folder, at the project root

## Props

- Props are named in camelCase
- If prop is a function called on an event (click, submit...), name must start with `on` (e.g. `onSubmit`). Function passed to this prop must start with `_handle` (e.g. `_handleSubmit`)
- Don't pass a function directly when calling a component. Use a variable instead. It improves readability.

```jsx
// Bad
<MyComp onSubmit={() => {/* Handle submit... */}}>

// Good
const _handleSubmit = () => { /* Handle submit... */ };
<MyComp onSubmit={_handleSubmit} />
```

## Testing

- Use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) through the wrapper available in `_tests/testUtils.tsx`. It includes automatically all global providers (like Apollo or Redux)
- Simulate user interactions with `userEvent` (`@testing-library/user-event`), not `fireEvent`. Set up the instance once with `const user = userEvent.setup()` and `await` each interaction (`await user.click(...)`, `await user.type(...)`); the surrounding test must be `async`. `fireEvent` dispatches a single raw DOM event, whereas `userEvent` replays the full sequence a real user triggers (focus, keydown/keyup, etc.), so it catches more bugs.
- `await`-ing each `userEvent` interaction is usually enough to keep React state updates inside `act`. A manual `await act(async () => {...})` (`act` is re-exported from `_tests/testUtils`) only helps for updates you trigger directly — it does **not** silence updates coming from Ant Design internals (overlay/motion, see the happy-dom gotchas below). For those, wait on the DOM (e.g. `waitForElementToBeRemoved`), not on an extra `act`.
- Prefer using `getByRole` : it encourages using accessibility best practices (possible roles are available [here](https://www.w3.org/TR/html-aria/#docconformance))
- Use the [Testing Playground](https://testing-playground.com/) to find the best selector for your use case
- Use `getByTestId` only on last resort
- Don't use non-standard roles (e.g. `<div role="myOwnRole">...</div>`)
- Small integration tests, testing a whole feature, might make more sense than testing all presentational components individually
- Mock generated query hooks instead of using Apollo `MockedResponse` inside `render` or `renderHook`
- Use `jest.spyOn` on the `* as gqlTypes` namespace to mock generated hooks
- Do not mock `useSharedTranslation` — the test environment already returns translation keys as-is
- Do not add `jest.clearAllMocks()` in `beforeEach` unless a specific test requires it

```ts
// ✅ Good
import * as gqlTypes from '_ui/_gqlTypes';

jest.spyOn(gqlTypes, 'useMyQuery').mockReturnValue({
    data: {...},
    loading: false,
} as gqlTypes.MyQueryResult);

// ❌ Bad — passing MockedResponse to renderHook/render
const mocks: MockedResponse[] = [{request: {...}, result: {...}}];
renderHook(() => useMyHook(), {mocks});
```

- Destructure `result` directly from `renderHook` to avoid repeating `result.current` in assertions

```ts
// ✅ Good
const {
    result: {current},
} = renderHook(() => useMyHook());
expect(current.value).toBe(42);

// ❌ Verbose
const {result} = renderHook(() => useMyHook());
expect(result.current.value).toBe(42);
```

### happy-dom — known gotchas

Front tests run on **happy-dom**, which does not implement layout or CSS transitions. This produces
misleading warnings/stderr that are test-environment artifacts, not product bugs. Prefer a **scoped**
fix (in the test file) over a global one, and never change correct product code just to silence them.

- **Unmeasured layout → `NaN` sizes.** `scrollHeight` and `getComputedStyle` return unusable values,
  so any auto-sizing widget (e.g. an Ant Design `Input.TextArea` with `autoSize`) computes
  `NaN` and logs `NaN is an invalid value for the height css style property`. Stub the measurement in
  the test (e.g. a numeric `HTMLElement.prototype.scrollHeight` getter) or mock the sizing child.
- **Overlay close animations fire outside `act`.** Popconfirm / Tooltip / Dropdown (`@rc-component/trigger`
  → `Popup` → `CSSMotion`) run their leave transition asynchronously after your assertion, causing
  `An update to CSSMotion inside a test was not wrapped in act(...)`. Wait for the popup to actually
  disappear (`await waitForElementToBeRemoved(() => screen.queryByRole('button', {name: /submit/i}))`),
  not just for the business effect (the mutation call).
- **Apollo mock result key must be the operation's root field.** A mutation selecting `saveUserData`
  needs `result.data.saveUserData`, not `result.data.userData`; a mismatch throws Apollo invariant #13
  ("Missing field 'X' while writing result"), logged as an error on stderr.
- **Circular imports only break at the entry point.** A cycle where module A instantiates JSX from B
  at module-eval time logs `React.jsx: type is invalid ... got: undefined` — but only when the test
  enters the cycle through the not-yet-defined side. Break the cycle (defer the JSX to call time) or,
  in a test, mock the imported module to short-circuit it.

## Folder structure

- One component per file, one folder per component, the same name as the component. Containing at least these files
    - `Component.tsx`
    - `Component.test.tsx`
    - `index.ts` exporting `Component`. It allows directly importing the component by its folder name.
- Folders’ structure must look similar to the component tree at runtime. For example:

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

- If a component is used in different, unrelated branches within one app it must go to the `shared` folder (e.g. `shared/MySharedComponent`)
- If a component might be used across multiple apps, it belongs to `@leav/ui`
- If a component is very generic and might be used across multiple unrelated projects, we'll consider adding it to the design system

## Styles

- **`aristid-ds` is the target design system.** Always prefer its components over creating a custom styled component from scratch.
- Use **CSS modules** for any custom styling — it is the new target approach.
- **Import CSS module classes by destructuring the named exports** (`import {className} from './x.module.css'`). Never import the whole module as a default `styles` object (`import styles from ...` then `styles.className`).
- `styled-components` exists in legacy code — do not add new ones.
- Never use `semantic-ui-react` for new components — migration only.
- Avoid inline styles.
- Always use design system tokens for colors, spacing, typography, etc. No hardcoded values.
- For user feedback, use `KitAlert` only. Do not use `KitNotification` — the sole exception is long-running tasks, where `KitNotification` is allowed.

```tsx
// Bad — styled-components (legacy)
const DivStyled = styled.div`
    color: #ff0000;
    padding: 8px;
`;

// Bad — default import of the whole module
import styles from './styles.module.css';
<div className={styles.container} />;

// Good — CSS module, destructured named import
// styles.module.css
// .container { color: var(--my-token); }
import {container} from './styles.module.css';
<div className={container} />;
```

## Translations (i18n)

- Translation **keys** are written in `snake_case`, not `kebab-case`.

```json
// Bad — kebab-case key
"manage-available": "Manage available attributes"

// Good — snake_case key
"manage_available": "Manage available attributes"
```

- In **French** translation files, apply the following typography rules:
    - Typographic apostrophe `’` (U+2019) instead of the straight quote `’` (U+0027)
    - Non-breaking space (U+00A0) before double punctuation marks ` :`, ` ;`, ` ?`, ` !`
    - French quotation marks `«` / `»` (U+00AB / U+00BB) with a non-breaking space inside
    - Non-breaking space before `%`

```json
// Bad
"confirm": "Etes-vous sûr ?",
"error": "Erreur: champ requis",
"quote": "Cliquez sur \"Valider\"",
"progress": "50% des éléments sélectionnés",
"copy": "Copier l’identifiant"

// Good
"confirm": "Êtes-vous sûr ?",
"error": "Erreur : champ requis",
"quote": "Cliquez sur « Valider »",
"progress": "50 % des éléments sélectionnés",
"copy": "Copier l’identifiant"
```

> For all other French typography rules, refer to the [Lexique des règles typographiques en usage à l'Imprimerie nationale](https://fr.wikipedia.org/wiki/Lexique_des_r%C3%A8gles_typographiques_en_usage_%C3%A0_l%27Imprimerie_nationale).

# GraphQL

## Operations

- Place operations in a `_queries/` folder **close to the usage** (e.g. `src/components/Explorer/_queries/`).
- The global `src/_queries/` folder is legacy — do not add new operations there.
- File naming: `operationNameQuery.graphql` / `operationNameMutation.graphql` (see [Naming](#files)).

## Code generation

- Run `yarn graphql-generate` after adding or modifying an operation to regenerate `_gqlTypes/index.ts`.
- **Never modify `_gqlTypes/index.ts` by hand** — it is fully regenerated on each run.
- Each app/lib requiring codegen has an `apolloApiKey.js.example`. Copy it to `apolloApiKey.js` and fill in a valid token (generate one in the admin API keys panel).
- The schema is obtained by **HTTP introspection of the locally running instance**, which loads the plugins declared in `apps/core/config/local.js`. The regenerated file therefore embeds types and enum values coming from those plugins (xstream…), unrelated to the operation you added — this is expected output, **do not hand-clean the diff**. These files are marked `linguist-generated` in `.gitattributes`, so they are collapsed in GitLab MR diffs.

## Fragments

Fragments are allowed but should not be over-abstracted. GraphQL's value is fetching exactly what each use case needs — an over-shared fragment forces every consumer to fetch fields it doesn't use.

```graphql
# Bad — one fragment shared everywhere fetches too much
fragment FullRecord on Record {
    id
    label
    created_at
    modified_at
    created_by {
        id
        login
    }
    modified_by {
        id
        login
    }
    active
}

# Good — each query requests exactly what it needs
query getRecordLabel($id: ID!) {
    record(id: $id) {
        id
        label
    }
}
```

## `__typename`

Apollo Client adds `__typename` automatically to every query for cache normalization. **Do not add it manually in `.graphql` files.**

The only valid use is as a **union type discriminant** in TypeScript:

```ts
// Value is IStandardValue | ILinkValue | ITreeValue
if (value.__typename === 'StandardValue') {
    // TS narrows to IStandardValue here
}
```

## Error handling

Error handling is centralized in the Apollo error link (`useInitApollo`):

- `401` / `UNAUTHENTICATED` → redirect to login
- `graphQLErrors` → logged as `console.warn`
- `networkError` → message normalized for display

Do not add GraphQL error handling inside individual components — let the error link handle it.
