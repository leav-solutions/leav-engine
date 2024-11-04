// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import FormLayout from './FormLayout';

jest.mock('../uiElements');
jest.mock('../formBuilderReducer/hook/useFormBuilderReducer');

describe('FormLayout', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <FormLayout />
            </DndProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
