// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';
import TextBlock from './TextBlock';

describe('TextBlock', () => {
    test('Convert markdown to plain text', async () => {
        render(<TextBlock settings={{content: '**test_content**'}} />);

        expect(screen.getByTestId('text-block-content')).toHaveTextContent('test_content');
        expect(screen.getByText('test_content')).toHaveStyle({fontWeight: 'bold'});
    });
});
