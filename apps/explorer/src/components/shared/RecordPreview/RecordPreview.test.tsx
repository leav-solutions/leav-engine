// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import 'jest-styled-components';
import React from 'react';
import {act, fireEvent, render, screen} from '_tests/testUtils';
import RecordPreview from './RecordPreview';

jest.mock('../../../utils/utils', () => ({
    getInvertColor: jest.fn().mockImplementation(() => '#FFFFFF'),
    stringToColor: jest.fn().mockImplementation(() => '#000000')
}));

describe('RecordPreview', () => {
    test('Show an image, first placeholder then image when its loaded', async () => {
        await act(async () => {
            render(<RecordPreview image="http://fake-image-url.com" label="TestLabel" tile />);
        });

        const imageElem = screen.getByAltText('record preview');
        expect(imageElem).toBeInTheDocument();
        expect(imageElem).not.toBeVisible();
        expect(screen.getByTestId('image-loading')).toBeVisible();

        await act(async () => {
            fireEvent.load(imageElem);
        });

        expect(imageElem).toBeVisible();
        expect(screen.queryByTestId('image-loading')).not.toBeInTheDocument();
    });

    test('Show initial with color if no image', async () => {
        await act(async () => {
            render(<RecordPreview color="#FF0000" label="TestLabel" />);
        });

        expect(screen.queryByRole('image')).not.toBeInTheDocument();
        expect(screen.getByTestId('generated-preview')).toBeInTheDocument();
        expect(screen.getByTestId('generated-preview')).toHaveTextContent('T');
        expect(screen.getByTestId('generated-preview')).toHaveStyleRule('background-color', '#FF0000');
    });

    test('Show initial with random color if no color', async () => {
        await act(async () => {
            render(<RecordPreview label="TestLabel" />);
        });

        expect(screen.getByTestId('generated-preview')).toHaveStyleRule('background-color', /.*/);
    });
});
