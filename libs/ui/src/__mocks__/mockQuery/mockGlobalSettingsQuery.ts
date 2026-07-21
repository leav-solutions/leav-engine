import {type MockedResponse} from '@apollo/client/testing';
import {GlobalSettingsDocument} from '_ui/_gqlTypes';

// FilterDropdownContent (rendered by every standard filter, so by CommonFilterItem, FilterDropDown
// and the Explorer) fires the GlobalSettings query on mount. Without a matching mock, Apollo's
// MockedProvider floods stderr with "No more mocked responses for the query: GlobalSettings".
// This mock is injected by default in TestProviders so no individual test has to declare it.
export const mockGlobalSettingsQuery: MockedResponse = {
    request: {
        query: GlobalSettingsDocument,
        variables: {},
    },
    result: {
        data: {
            globalSettings: {
                settings: {featureToggles: {enableDateFilterV2: false}},
            },
        },
    },
};
