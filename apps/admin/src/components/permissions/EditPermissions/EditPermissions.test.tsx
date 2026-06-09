// import {act, fireEvent, render, screen, waitFor} from '../../../_tests/testUtils';
// import {type GET_PERMISSIONSVariables} from '../../../_gqlTypes/GET_PERMISSIONS';
// import {
//     PermissionsActions,
//     PermissionTypes,
//     GetPermissionsActionsDocument,
//     GetPermissionsDocument,
//     SavePermissionDocument,
// } from '../../../_gqlTypes';
// import EditPermissions from './EditPermissions';

// vi.mock('../../../hooks/useLang');
// describe('EditPermissions', () => {
//     const permParams: GET_PERMISSIONSVariables = {
//         type: PermissionTypes.admin,
//         actions: [PermissionsActions.admin_create_library, PermissionsActions.admin_edit_library],
//         usersGroup: '1234567',
//     };
//     test('Display and edit permissions', async () => {
//         let saveCalled = false;
//         const mocks = [
//             {
//                 // Get actions by type
//                 request: {
//                     query: GetPermissionsActionsDocument,
//                     variables: {type: permParams.type},
//                 },
//                 result: {
//                     data: {
//                         permissionsActionsByType: [
//                             {
//                                 __typename: 'LabeledPermissionsActions',
//                                 name: PermissionsActions.admin_create_library,
//                                 label: {
//                                     fr: 'Crea Lib',
//                                 },
//                             },
//                             {
//                                 __typename: 'LabeledPermissionsActions',
//                                 name: PermissionsActions.admin_edit_library,
//                                 label: {
//                                     fr: 'Edit Lib',
//                                 },
//                             },
//                             {
//                                 __typename: 'LabeledPermissionsActions',
//                                 name: PermissionsActions.admin_access_libraries,
//                                 label: {
//                                     fr: 'Access Lib',
//                                 },
//                             },
//                             {
//                                 __typename: 'LabeledPermissionsActions',
//                                 name: PermissionsActions.admin_delete_library,
//                                 label: {
//                                     fr: 'Delete Lib',
//                                 },
//                             },
//                         ],
//                     },
//                 },
//             },
//             {
//                 // Get defined permissions
//                 request: {
//                     query: GetPermissionsDocument,
//                     variables: permParams,
//                 },
//                 result: {
//                     data: {
//                         perm: [
//                             {
//                                 __typename: 'PermissionAction',
//                                 name: PermissionsActions.admin_create_library,
//                                 allowed: true,
//                             },
//                             {
//                                 __typename: 'PermissionAction',
//                                 name: PermissionsActions.admin_edit_library,
//                                 allowed: null,
//                             },
//                         ],
//                         inheritPerm: [
//                             {
//                                 __typename: 'HeritedPermissionAction',
//                                 name: PermissionsActions.admin_create_library,
//                                 allowed: true,
//                             },
//                             {
//                                 __typename: 'HeritedPermissionAction',
//                                 name: PermissionsActions.admin_edit_library,
//                                 allowed: true,
//                             },
//                         ],
//                     },
//                 },
//             },
//             {
//                 // Save permissions
//                 request: {
//                     query: SavePermissionDocument,
//                     variables: {
//                         permData: {
//                             type: 'admin',
//                             actions: [{name: 'admin_create_library', allowed: false}],
//                             usersGroup: '1234567',
//                         },
//                     },
//                 },
//                 result: () => {
//                     saveCalled = true;

//                     return {};
//                 },
//             },
//             {
//                 // Refetch permissions after save
//                 request: {
//                     query: GetPermissionsDocument,
//                     variables: permParams,
//                 },
//                 result: {
//                     data: {
//                         perm: [
//                             {
//                                 __typename: 'PermissionAction',
//                                 name: PermissionsActions.admin_create_library,
//                                 allowed: false,
//                             },
//                             {
//                                 __typename: 'PermissionAction',
//                                 name: PermissionsActions.admin_edit_library,
//                                 allowed: null,
//                             },
//                         ],
//                         inheritPerm: [
//                             {
//                                 __typename: 'HeritedPermissionAction',
//                                 name: PermissionsActions.admin_create_library,
//                                 allowed: true,
//                             },
//                             {
//                                 __typename: 'HeritedPermissionAction',
//                                 name: PermissionsActions.admin_edit_library,
//                                 allowed: true,
//                             },
//                         ],
//                     },
//                 },
//             },
//         ];

//         render(<EditPermissions permParams={permParams} />, {apolloMocks: mocks});

//         expect(screen.getByText(/loading/)).toBeInTheDocument();

//         await waitFor(() => screen.getByText('Crea Lib'));

//         expect(screen.getByText('Crea Lib')).toBeInTheDocument();
//         expect(screen.getByText('Edit Lib')).toBeInTheDocument();
//         expect(screen.queryByText('Access Lib')).not.toBeInTheDocument();
//         expect(screen.queryByText('Delete Lib')).not.toBeInTheDocument();

//         const permSelectors = screen.getAllByRole('slider', {name: 'permission-selector'});

//         expect(permSelectors[0]).toHaveValue('2');
//         expect(permSelectors[1]).toHaveValue('1');

//         await act(async () => {
//             fireEvent.change(permSelectors[0], {target: {value: 0}});
//         });

//         expect(saveCalled).toBe(true);
//     });

//     test('Error state', async () => {
//         const mocks = [
//             {
//                 request: {
//                     query: GetPermissionsActionsDocument,
//                     variables: {type: permParams.type},
//                 },
//                 error: new Error('Boom!'),
//             },
//         ];

//         render(<EditPermissions permParams={permParams} />, {apolloMocks: mocks});

//         expect(await screen.findByText(/Boom!/)).toBeInTheDocument();
//     });
// });

it.todo('Tests commented - migrate to react-testing-library');
