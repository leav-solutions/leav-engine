import {render, screen} from '_ui/_tests/testUtils';
import {ColumnSplitValueHeader} from './ColumnSplitValueHeader';

const _colorBars = (container: HTMLElement) => container.querySelectorAll('.card-color');

describe('ColumnSplitValueHeader', () => {
    it('renders the option label', () => {
        render(
            <ColumnSplitValueHeader
                option={{key: 'draft', label: 'Brouillon', rawValue: 'draft'}}
                hasColoredOption={false}
            />,
        );

        expect(screen.getByText('Brouillon')).toBeInTheDocument();
    });

    it('draws the color bar with the option color', () => {
        const {container} = render(
            <ColumnSplitValueHeader
                option={{key: 'draft', label: 'Brouillon', color: '#ffd966', rawValue: 'draft'}}
                hasColoredOption
            />,
        );

        expect(_colorBars(container)[0]).toHaveStyle({backgroundColor: '#ffd966'});
    });

    it('draws no bar at all when NO option of the group carries a color', () => {
        // The DS only reserves the grid's color column when `color` is set: with an all-colorless group
        // there is nothing to align on, so the labels start flush against the cell.
        const {container} = render(
            <ColumnSplitValueHeader
                option={{key: 'draft', label: 'Brouillon', rawValue: 'draft'}}
                hasColoredOption={false}
            />,
        );

        expect(_colorBars(container)).toHaveLength(0);
    });

    it('keeps a transparent bar for a colorless option when its group has colored ones', () => {
        // Without it the label would start 3px + gap to the left of its colored neighbours.
        const {container} = render(
            <ColumnSplitValueHeader
                option={{key: 'draft', label: 'Brouillon', color: null, rawValue: 'draft'}}
                hasColoredOption
            />,
        );

        expect(_colorBars(container)[0]).toHaveStyle({backgroundColor: 'transparent'});
    });
});
