// import {MockedProvider} from '@apollo/client/testing';
// import {mount} from 'enzyme';
// import {getPluginsQuery} from '../../../queries/plugins/getPluginsQuery';
// import {BrowserRouter as Router} from 'react-router-dom-v5';
// import MockedLangContextProvider from '../../../__mocks__/MockedLangContextProvider';
// import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
// import PluginsExplorer from './PluginsExplorer';

// const wait = () =>
// new Promise((res, rej) => {
// setTimeout(res, 0);
// });

// vi.mock(
// './PluginsList',
// () =>
// function PluginsList(props) {
// return <div>MOCK PluginsList</div>;
// },
// );

// const pluginData = {
// author: '',
// description: '',
// name: 'plugin',
// version: '0.0.1',
// __typename: 'Plugin',
// };

// const mocks = [
// {
// request: {
// query: getPluginsQuery,
// },
// result: {
// data: {
// plugins: [pluginData],
// },
// },
// },
// ];

// describe('PluginsExplorer', () => {
// test('Renders without crashing', async () => {
// let comp;

// await act(async () => {
// comp = mount(
// <MockedProvider mocks={mocks}>
// <MockedLangContextProvider>
// <MockedUserContextProvider>
// <Router>
// <PluginsExplorer />
// </Router>
// </MockedUserContextProvider>
// </MockedLangContextProvider>
// </MockedProvider>,
// );
// });

// await act(async () => {
// await wait();
// });

// comp.update();
// const pluginsList = comp.find('PluginsList');
// expect(pluginsList.length).toBe(1);
// });

// test('renders a plugin from query', async () => {
// let comp;

// await act(async () => {
// comp = mount(
// <MockedProvider mocks={mocks}>
// <MockedLangContextProvider>
// <MockedUserContextProvider>
// <Router>
// <PluginsExplorer />
// </Router>
// </MockedUserContextProvider>
// </MockedLangContextProvider>
// </MockedProvider>,
// );
// });

// await act(async () => {
// await wait();
// });

// comp.update();

// const pluginsList = comp.find('PluginsList');
// const pluginsProps = pluginsList.prop('plugins');
// expect(pluginsProps[0]).toEqual(pluginData);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
