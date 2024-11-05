// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import CustomMessage from './CustomMessage';
import {render, screen} from '_tests/testUtils';

function placeholder() {
    return undefined;
}

describe('Custom Message', () => {
    test('Snapshot test', async () => {
        const customMessage = 'display custom message';
        const lang = 'fr';
        render(
            <CustomMessage
                customMessage={customMessage}
                lang={lang}
                onChangeCustomMessage={placeholder}
                index={0}
                key={lang}
                actionId={0}
                setBlockCard={jest.fn()}
            />
        );
        const InputCustomMessageElem = screen.getByRole('textbox');
        expect(InputCustomMessageElem).toHaveValue(customMessage);
        const LabelCustomMessageElem = screen.getByText(/fr :/i);
        expect(LabelCustomMessageElem).toHaveTextContent(lang.toUpperCase() + ' :');
    });
});
