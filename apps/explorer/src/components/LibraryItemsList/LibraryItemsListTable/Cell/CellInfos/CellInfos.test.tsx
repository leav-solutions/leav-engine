// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {PreviewSize} from '../../../../../_types/types';
import CellInfos from './CellInfos';

jest.mock(
    '../CellRecordCard',
    () =>
        function CellRecordCard() {
            return <div>CellRecordCard</div>;
        }
);

describe('CellInfos', () => {
    test('should display four actions', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<CellInfos record={{} as any} size={PreviewSize.small} index="0" id="id" library="library" />);
        });

        expect(comp.find('Button')).toHaveLength(4);
    });
});
