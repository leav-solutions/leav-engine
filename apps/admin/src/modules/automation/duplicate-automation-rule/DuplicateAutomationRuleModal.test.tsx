import userEvent from '@testing-library/user-event';
import {render, screen} from '../../../_tests/testUtils';
import * as gqlTypes from '../../../_gqlTypes';
import {DuplicateAutomationRuleModal} from './DuplicateAutomationRuleModal';

describe('DuplicateAutomationRuleModal', () => {
    const rule = {id: 'rule-1', label: 'Ma règle'};

    const mockMutation = (response: unknown) => {
        const mutate = vi.fn().mockResolvedValue(response);
        vi.spyOn(gqlTypes, 'useDuplicateAutomationRuleMutation').mockReturnValue([
            mutate,
            {loading: false},
        ] as unknown as ReturnType<typeof gqlTypes.useDuplicateAutomationRuleMutation>);
        return mutate;
    };

    test('prefills the name with the default copy label', () => {
        mockMutation({data: {duplicateAutomationRule: {id: 'rule-2'}}});
        render(<DuplicateAutomationRuleModal rule={rule} onClose={vi.fn()} onDuplicated={vi.fn()} />);

        // The i18n mock returns `key|interpolated values`, see src/__mocks__/react-i18next.js
        expect(screen.getByRole('textbox')).toHaveValue('automation.duplicate.default_name|Ma règle');
    });

    test('sends the edited name and reports the new rule id', async () => {
        const user = userEvent.setup();
        const mutate = mockMutation({data: {duplicateAutomationRule: {id: 'rule-2'}}});
        const onDuplicated = vi.fn();
        render(<DuplicateAutomationRuleModal rule={rule} onClose={vi.fn()} onDuplicated={onDuplicated} />);

        const input = screen.getByRole('textbox');
        await user.clear(input);
        await user.type(input, 'Ma règle v2');
        await user.click(screen.getByRole('button', {name: 'admin.confirm'}));

        expect(mutate).toHaveBeenCalledWith({variables: {ruleId: 'rule-1', label: 'Ma règle v2'}});
        expect(onDuplicated).toHaveBeenCalledWith('rule-2');
    });

    test('does not submit an empty name', async () => {
        const user = userEvent.setup();
        const mutate = mockMutation({data: {duplicateAutomationRule: {id: 'rule-2'}}});
        render(<DuplicateAutomationRuleModal rule={rule} onClose={vi.fn()} onDuplicated={vi.fn()} />);

        await user.clear(screen.getByRole('textbox'));

        expect(screen.getByRole('button', {name: 'admin.confirm'})).toBeDisabled();
        expect(mutate).not.toHaveBeenCalled();
    });
});
