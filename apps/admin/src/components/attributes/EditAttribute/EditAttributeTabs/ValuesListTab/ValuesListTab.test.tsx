// import {mount} from 'enzyme';
// import {wait} from '../../../../../utils/testUtils';
// import {getAttributeValuesListQuery} from '../../../../../queries/attributes/getAttributeValuesListQuery';
// import {mockAttrSimple} from '../../../../../__mocks__/attributes';
// import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
// import ValuesListTab from './ValuesListTab';
// import {GetAttributesValuesListDocument} from '../../../../../_gqlTypes';

// vi.mock(
// './ValuesListForm',
// () =>
// function ValuesListForm() {
// return <div>ValuesListForm</div>;
// },
// );

// describe('ValuesListTab', () => {
// test('Loading and success state', async () => {
// const mocks = [
// {
// request: {
// query: GetAttributesValuesListDocument,
// variables: {attrId: 'test_attr'},
// },
// result: {
// data: {
// attributes: {
// __typename: 'AttributesList',
// totalCount: 1,
// list: [
// {
// ...mockAttrSimple,
// id: 'simple_attribute_with_values_list',
// values_list: {
// __typename: 'ValuesListConf',
// enable: true,
// allowFreeEntry: false,
// allowListUpdate: false,
// values: ['value 1', 'value 2'],
// },
// __typename: 'Attribute',
// },
// ],
// },
// },
// },
// },
// ];

// let comp;

// await act(async () => {
// comp = mount(
// <MockedProviderWithFragments mocks={mocks}>
// <ValuesListTab attributeId="test_attr" />
// </MockedProviderWithFragments>,
// );
// });

// expect(comp.find('Loading')).toHaveLength(1);

// await act(async () => {
// await wait(0);
// comp.update();
// });

// expect(comp.find('ValuesListForm')).toHaveLength(1);
// });

// test('Error state', async () => {
// const mocks = [
// {
// request: {
// query: GetAttributesValuesListDocument,
// variables: {attrId: 'test_attr'},
// },
// error: new Error('boom!'),
// },
// ];

// let comp;

// await act(async () => {
// comp = mount(
// <MockedProviderWithFragments mocks={mocks}>
// <ValuesListTab attributeId="test_attr" />
// </MockedProviderWithFragments>,
// );
// });

// expect(comp.find('Loading')).toHaveLength(1);

// await act(async () => {
// await wait(0);
// comp.update();
// });

// expect(comp.find('div.error')).toHaveLength(1);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
