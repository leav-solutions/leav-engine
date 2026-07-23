import {MockedProvider} from '@apollo/client/testing';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {mockAttrSimple} from '../../../../../__mocks__/attributes';
import ActionsListTab from './ActionsListTab';
import {AVAILABLE_ACTIONS_MOCK, NO_AVAILABLE_ACTION_MOCK} from './mocks/ALCMocks';
import {render, screen} from '../../../../../_tests/testUtils';

// adds the availableActions
// check that it don't crash when there's no actionList or no available actions
// feu

vi.mock('./ALCContainer', () => ({
    default: function ALCContainer() {
        return <>ALCContainer</>;
    },
}));

describe('ActionsListTab', () => {
    test('adds the available actions ', async () => {
        render(
            <DndProvider backend={TestBackend}>
                <MockedProvider mocks={AVAILABLE_ACTIONS_MOCK}>
                    <ActionsListTab attribute={mockAttrSimple} />
                </MockedProvider>
            </DndProvider>,
        );

        expect(await screen.findByText('ALCContainer'));
    });

    test("renders even when there's no action", async () => {
        render(
            <DndProvider backend={TestBackend}>
                <MockedProvider mocks={NO_AVAILABLE_ACTION_MOCK}>
                    <ActionsListTab attribute={mockAttrSimple} />
                </MockedProvider>
            </DndProvider>,
        );

        expect(await screen.findByText('ALCContainer'));
    });
});
