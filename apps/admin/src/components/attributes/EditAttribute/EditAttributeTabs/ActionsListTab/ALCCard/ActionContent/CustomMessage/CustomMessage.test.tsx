import CustomMessage from './CustomMessage';
import {render, screen} from '../../../../../../../../_tests/testUtils';

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
                key={lang}
                actionId={0}
                setBlockCard={vi.fn()}
            />,
        );
        const InputCustomMessageElem = screen.getByRole('textbox');
        expect(InputCustomMessageElem).toHaveValue(customMessage);
        const LabelCustomMessageElem = screen.getByText(/fr :/i);
        expect(LabelCustomMessageElem).toHaveTextContent(lang.toUpperCase() + ' :');
    });
});
