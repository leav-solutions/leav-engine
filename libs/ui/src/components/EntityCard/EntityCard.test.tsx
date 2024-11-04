// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import 'jest-styled-components';
import {render, screen} from '../../_tests/testUtils';
import EntityCard from './EntityCard';

describe('EntityCard', () => {
    const mockEntity = {
        label: 'Some entity',
        subLabel: 'Some sub label',
        color: 'orange',
        preview: 'https://some.url'
    };

    test('Display full entity card', async () => {
        render(<EntityCard entity={mockEntity} />);

        expect(screen.getByText(mockEntity.label)).toBeInTheDocument();
        expect(screen.getByText(mockEntity.subLabel)).toBeInTheDocument();
        expect(screen.getByRole('img', {hidden: true})).toHaveAttribute('src', mockEntity.preview);
        expect(screen.getByTestId('entity-card')).toHaveStyleRule('border-left', `5px solid ${mockEntity.color}`);
    });

    test('Can hide sub-label', async () => {
        render(<EntityCard entity={mockEntity} withSubLabel={false} />);

        expect(screen.queryByText(mockEntity.subLabel)).not.toBeInTheDocument();
    });

    test('Can hide preview', async () => {
        render(<EntityCard entity={mockEntity} withPreview={false} />);

        expect(screen.queryByRole('img', {hidden: true})).not.toBeInTheDocument();
    });

    test('Can hide color', async () => {
        render(<EntityCard entity={mockEntity} withColor={false} />);

        expect(screen.getByTestId('entity-card')).not.toHaveStyle({
            borderLeft: `5px solid ${mockEntity.color}`
        });
    });

    test('Display initials if no preview supplied', async () => {
        render(<EntityCard entity={{...mockEntity, preview: null}} />);

        expect(screen.getByText('SE')).toBeInTheDocument();
    });
});
