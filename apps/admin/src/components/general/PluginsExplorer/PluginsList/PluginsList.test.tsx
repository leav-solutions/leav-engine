// import React from 'react';
// import {mount} from 'enzyme';
// import PluginsList from './PluginsList';

// const wait = () =>
// new Promise((res, rej) => {
// setTimeout(res, 0);
// });

// const pluginsProp = [
// {
// author: '',
// description: '',
// name: 'plugin',
// version: '0.0.1',
// __typename: 'Plugin',
// },
// ];

// describe('PluginsList', () => {
// test('Renders without crashing', async () => {
// let comp;
// await act(async () => {
// comp = mount(<PluginsList />);
// });

// await act(async () => {
// await wait();
// });

// comp.update();
// const table = comp.find('Table');
// expect(table.length).toBe(1);
// });

// test('renders the plugin in the table', async () => {
// let comp;
// await act(async () => {
// comp = mount(<PluginsList plugins={pluginsProp} />);
// });

// await act(async () => {
// await wait();
// });

// comp.update();
// const rows = comp.find('Table').find('tr');
// expect(rows.at(1).contains('plugin')).toBe(true);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
