import {render, screen} from '_ui/_tests/testUtils';
import * as graphqlClient from '../../../../../../__generated__';
import {CurrentViewSection} from '../CurrentViewSection';

describe('CurrentViewSection', () => {
    const spyOnUseGetViewQuery = jest.spyOn(graphqlClient, 'useGetViewQuery');

    const currentViewId = 'view-1';
    const currentViewLabel = 'Catalogue produits';
    beforeEach(() => {
        spyOnUseGetViewQuery.mockClear();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should display the current view label in the input', () => {
        spyOnUseGetViewQuery.mockReturnValue({
            data: {
                view: {
                    id: currentViewId,
                    label: {fr: currentViewLabel, en: currentViewLabel},
                },
            },
        } as any);

        render(<CurrentViewSection onViewSettingsClose={jest.fn()} currentViewId={currentViewId} />);

        expect(screen.getByDisplayValue(currentViewLabel)).toBeVisible();
    });
});
