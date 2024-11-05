// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {mockAttrSimple} from '../../../../../../../../../../../__mocks__/attributes';
import ReserveAttribute from './ReserveAttribute';

jest.mock('../../../../../../../../../../../hooks/useLang');
jest.mock('../../../formBuilderReducer/hook/useFormBuilderReducer');

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useLayoutEffect: jest.requireActual('react').useEffect
}));

describe('ReserveAttribute', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <ReserveAttribute attribute={mockAttrSimple} />
            </DndProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
