import ApplicationContext from '../../context/ApplicationContext';
import {renderHook} from '../../_tests/testUtils';
import {mockApplicationDetails} from '../../__mocks__/common/applications';
import useMustShowTransparency from './useMustShowTransparency';

describe('useMustShowTransparency', () => {
    test('Return defined settings', async () => {
        const app = {
            ...mockApplicationDetails,
            settings: {
                showTransparency: true,
            },
        };

        const {result} = renderHook(() => useMustShowTransparency(), {
            wrapper: ({children}) => (
                <ApplicationContext.Provider value={{currentApp: app, globalSettings: null}}>
                    {children as JSX.Element}
                </ApplicationContext.Provider>
            ),
        });
        expect(result.current).toBe(true);
    });

    test('If nothing defined in settings, return default value', async () => {
        const app = {
            ...mockApplicationDetails,
            settings: {},
        };

        const {result} = renderHook(() => useMustShowTransparency(), {
            wrapper: ({children}) => (
                <ApplicationContext.Provider value={{currentApp: app, globalSettings: null}}>
                    {children as JSX.Element}
                </ApplicationContext.Provider>
            ),
        });
        expect(result.current).toBe(false);
    });
});
