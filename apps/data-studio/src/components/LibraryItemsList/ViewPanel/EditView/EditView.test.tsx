// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {render, screen} from '_tests/testUtils';
import mocksGetViewsListQuery from '../../../../__mocks__/mockQuery/mockGetViewListQuery';
import EditView from './EditView';

describe('EditView', () => {
    const mocks = mocksGetViewsListQuery('');

    test('should show two input', async () => {
        render(
            <EditView
                libraryId="lib_id"
                visible={true}
                onClose={jest.fn()}
                view={{
                    id: 'id',
                    label: {fr: 'label', en: 'label'},
                    display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
                    shared: false,
                    owner: true
                }}
            />,
            {apolloMocks: mocks}
        );

        expect(screen.getByTestId('viewName-input-fr')).toBeInTheDocument();

        const nameElement = screen.getByTestId('viewName-input-fr');
        const descriptionElement = screen.getByTestId('description-input-fr');
        const typeElement = screen.getByTestId('input-type');
        const sharedElement = screen.getByTestId('input-shared');

        expect(nameElement).toBeInTheDocument();
        expect(descriptionElement).toBeInTheDocument();
        expect(typeElement).toBeInTheDocument();
        expect(sharedElement).toBeInTheDocument();
    });
});
