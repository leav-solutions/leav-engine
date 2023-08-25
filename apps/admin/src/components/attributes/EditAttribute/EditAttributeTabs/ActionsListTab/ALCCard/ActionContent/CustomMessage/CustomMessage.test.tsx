// Copyright LEAV Solutions 2017
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
                custom_message={customMessage}
                lang={lang}
                changeCustomMessage={placeholder}
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
