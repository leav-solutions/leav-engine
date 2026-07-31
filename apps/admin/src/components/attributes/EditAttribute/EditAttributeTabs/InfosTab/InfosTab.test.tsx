// import {MockedProvider, type MockedResponse} from '@apollo/client/testing';
// import {mount} from 'enzyme';
// import {wait} from '../../../../../utils/testUtils';
// import {act, render, screen} from '../../../../../_tests/testUtils';
// import {mockAttrAdv} from '../../../../../__mocks__/attributes';
// import {getMockCacheWithFragments} from '../../../../../__mocks__/MockedProviderWithFragments/getMockCacheWithFragments';
// import InfosTab from './InfosTab';
// import {GetAttributesDocument, SaveAttributeDocument} from '../../../../../_gqlTypes';

// vi.mock('../../../../../hooks/useLang');

// vi.mock(
// './InfosForm',
// () =>
// function InfosForm() {
// return <div>InfosForm</div>;
// },
// );
// describe('InfosTab', () => {
// const variables = {
// attrData: {
// id: mockAttrAdv.id,
// label: {
// fr: mockAttrAdv.label?.fr ?? '',
// en: mockAttrAdv.label?.en ?? '',
// },
// description: {
// fr: mockAttrAdv.description?.fr ?? '',
// en: mockAttrAdv.description?.en ?? '',
// },
// readonly: false,
// required: false,
// type: mockAttrAdv.type,
// format: mockAttrAdv.format,
// multiple_values: mockAttrAdv.multiple_values,
// multi_tree_display_option: mockAttrAdv.multi_tree_display_option,
// linked_library: null,
// linked_tree: null,
// reverse_link: null,
// versions_conf: {
// versionable: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.versionable : false,
// mode: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.mode : null,
// profile: mockAttrAdv.versions_conf ? mockAttrAdv.versions_conf.profile : null,
// },
// character_limit: null,
// smart_filter: null,
// },
// };

// test('Render form', async () => {
// await act(async () => {
// render(<InfosTab />);
// });

// expect(screen.getByText('InfosForm')).toBeInTheDocument();
// });

// test('Save data on submit and run onPostSave', async () => {
// const onPostSave = vi.fn();

// let saveQueryCalled = false;
// const mocks = [
// {
// request: {
// query: SaveAttributeDocument,
// variables,
// },
// result: () => {
// saveQueryCalled = true;
// return {
// data: {
// saveAttribute: {
// ...mockAttrAdv,
// __typename: 'Attribute',
// versions_conf: null,
// },
// },
// };
// },
// },
// ];

// const mockCache = getMockCacheWithFragments();

// mockCache.writeQuery({
// query: GetAttributesDocument,
// variables: {id: 'advanced_attribute'},
// data: {
// attributes: {
// __typename: 'AttributesList',
// totalCount: 1,
// list: [
// {
// ...mockAttrAdv,
// __typename: 'Attribute',
// versions_conf: null,
// },
// ],
// },
// },
// });

// const comp = mount(
// <MockedProvider mocks={mocks} addTypename>
// <InfosTab onPostSave={onPostSave} />
// </MockedProvider>,
// );
// const submitFunc: any = comp.find('InfosForm').prop('onSubmitInfos');

// if (!!submitFunc) {
// await act(async () => {
// await submitFunc({...mockAttrAdv});
// await wait(0);
// });
// }

// expect(saveQueryCalled).toBe(true);
// expect(onPostSave).toHaveBeenCalled();
// });

// test('Pass saving errors to form', async () => {
// const mocksError = [
// {
// request: {
// query: SaveAttributeDocument,
// variables,
// },
// result: {
// errors: [
// {
// message: 'Error',
// extensions: {
// code: 'VALIDATION_ERROR',
// fields: {id: 'invalid id'},
// },
// },
// ],
// },
// },
// ];

// const mockCache = getMockCacheWithFragments();

// mockCache.writeQuery({
// query: GetAttributesDocument,
// variables: {id: 'advanced_attribute'},
// data: {
// attributes: {
// __typename: 'AttributesList',
// totalCount: 1,
// list: [
// {
// ...mockAttrAdv,
// __typename: 'Attribute',
// versions_conf: null,
// },
// ],
// },
// },
// });

// let comp;
// await act(async () => {
// comp = mount(
// <MockedProvider mocks={mocksError as unknown as MockedResponse[]} cache={mockCache} addTypename>
// <InfosTab />
// </MockedProvider>,
// );
// });
// const submitFunc: any = comp.find('InfosForm').prop('onSubmitInfos');

// if (!!submitFunc) {
// await act(async () => {
// await submitFunc({...mockAttrAdv});
// await wait(0);
// });

// await act(async () => {
// comp.update();
// });
// }

// expect(comp.find('InfosForm').prop('errors')).not.toBe(null);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
