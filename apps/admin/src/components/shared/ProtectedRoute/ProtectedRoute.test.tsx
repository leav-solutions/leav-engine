// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import {BrowserRouter as Router} from 'react-router-dom-v5';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import UserContext from '../UserContext';
import {IUserContext} from '../UserContext/UserContext';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
    const TestComp = () => <div>Test</div>;
    const defaultContext: IUserContext = {
        id: '1',
        whoAmI: {
            id: '1',
            label: 'Test User',
            library: {
                id: 'my_lib',
                label: {fr: 'My lib'}
            },
            color: null,
            preview: null
        },
        permissions: {
            [PermissionsActions.admin_access_attributes]: true,
            [PermissionsActions.admin_edit_attribute]: true
        }
    };

    test('Render normally if no permissions specified', async () => {
        const comp = mount(
            <UserContext.Provider value={defaultContext}>
                <Router>
                    <ProtectedRoute path="/" component={TestComp} />
                </Router>
            </UserContext.Provider>
        );

        expect(comp.find('TestComp')).toHaveLength(1);
    });

    test('Render normally if permission granted', async () => {
        const comp = mount(
            <UserContext.Provider value={defaultContext}>
                <Router>
                    <ProtectedRoute
                        permissions={[PermissionsActions.admin_access_attributes]}
                        path="/"
                        component={TestComp}
                    />{' '}
                </Router>
            </UserContext.Provider>
        );
        expect(comp.find('TestComp')).toHaveLength(1);
    });

    test('Render forbidden if not allowed', async () => {
        const comp = mount(
            <UserContext.Provider
                value={{...defaultContext, permissions: {[PermissionsActions.admin_access_attributes]: false}}}
            >
                <Router>
                    <ProtectedRoute
                        permissions={[PermissionsActions.admin_access_attributes]}
                        path="/"
                        component={TestComp}
                    />{' '}
                </Router>
            </UserContext.Provider>
        );
        expect(comp.find('TestComp')).toHaveLength(0);
    });

    test('Works with multiple permissions', async () => {
        const comp = mount(
            <UserContext.Provider
                value={{
                    ...defaultContext,
                    permissions: {
                        [PermissionsActions.admin_access_attributes]: false,
                        [PermissionsActions.admin_edit_attribute]: true
                    }
                }}
            >
                <Router>
                    <ProtectedRoute
                        permissions={[
                            PermissionsActions.admin_access_attributes,
                            PermissionsActions.admin_edit_attribute
                        ]}
                        path="/"
                        component={TestComp}
                    />{' '}
                </Router>
            </UserContext.Provider>
        );
        expect(comp.find('TestComp')).toHaveLength(0);
    });
});
