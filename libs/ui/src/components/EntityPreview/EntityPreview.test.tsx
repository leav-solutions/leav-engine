// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import {act, fireEvent, render, screen} from '@testing-library/react';
import 'jest-styled-components';
import EntityPreview from './EntityPreview';

describe('RecordPreview', () => {
    test('Show an image, first placeholder then image when its loaded', async () => {
        await act(async () => {
            render(<EntityPreview image="http://fake-image-url.com" label="TestLabel" tile />);
        });

        const imageElem = screen.getByAltText('record preview');
        expect(imageElem).toBeInTheDocument();
        expect(imageElem).not.toBeVisible();

        await act(async () => {
            fireEvent.load(imageElem);
        });

        expect(imageElem).toBeVisible();
    });

    test('Show initial with color if no image', async () => {
        await act(async () => {
            render(<EntityPreview color="#FF0000" label="TestLabel" />);
        });

        expect(screen.queryByRole('image')).not.toBeInTheDocument();
        expect(screen.getByTestId('generated-preview')).toBeInTheDocument();
        expect(screen.getByTestId('generated-preview')).toHaveTextContent('TE');
        expect(screen.getByTestId('generated-preview')).toHaveStyleRule('background-color', '#FF0000');
    });

    test('Show initial with random color if no color', async () => {
        await act(async () => {
            render(<EntityPreview label="TestLabel" />);
        });

        expect(screen.getByTestId('generated-preview')).toHaveStyleRule('background-color', /.*/);
    });

    test('Can show simplistic preview', async () => {
        render(<EntityPreview color="#FF0000" label="TestLabel" simplistic />);

        expect(screen.queryByRole('image')).not.toBeInTheDocument();
        expect(screen.getByTestId('simplistic-preview')).toBeInTheDocument();
        expect(screen.getByTestId('simplistic-preview')).toHaveTextContent('T');
    });
});
