// import {shallow} from 'enzyme';
// import React from 'react';
// import {mockTreeWithPermConf} from '../../../../../../__mocks__/trees';
// import PermissionsContent from './PermissionsContent';

// vi.mock('../../../../../../hooks/useLang');

// vi.mock(
// '../../../../../permissions/DefinePermByUserGroupView',
// () =>
// function DefinePermByUserGroupView() {
// return <div>DefinePermByUserGroupView</div>;
// },
// );

// vi.mock(
// '../../../../../permissions/DefineTreePermissionsView',
// () =>
// function DefineTreePermissionsView() {
// return <div>DefineTreePermissionsView</div>;
// },
// );

// describe('PermissionsContent', () => {
// const onSubmit = vi.fn();

// test('Display 1 tab per library + "tree" tab', async () => {
// const comp = shallow(
// <PermissionsContent tree={{...mockTreeWithPermConf}} readonly={false} onSubmitSettings={onSubmit} />,
// );

// expect(comp.find('Tab').prop('panes')).toHaveLength(3);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
