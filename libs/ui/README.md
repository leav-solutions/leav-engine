# LEAV Engine - Shared utils for frontend apps
## Prerequisites
`UserContext` and `LangContext` providers are required for most components of `@leav/ui`. They both are exported by `@leav/ui`. You can use them as follows:
```tsx
import { UserContext, LangContext } from '@leav/ui';

const App = () => {

    const userContextData = {
        userId: '123',
        userWhoAmI: {
            id: '123',
            label: 'John Doe',
            sublabel: null,
            preview: null,
            color: null
        }
    };

    const langContextData = {
        lang: ['en'],
        availableLangs: ['en', 'fr'],
        defaultLang: ['en'],
        setLang: _handleLanguageChange
    };


    return (
    <UserContext.Provider value={userContextData}>
        <LangContext.Provider value={langContextData}>
            <YourComponent />
        </LangContext.Provider>
    </UserContext.Provider>
    );
};
```
Real-world implementation can be seen on [Data Studio](https://github.com/leav-solutions/leav-engine/blob/master/apps/data-studio/src/components/app/AppHandler/AppHandler.tsx])