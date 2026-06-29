import {act} from 'react-dom/test-utils';
import {render, screen, waitFor} from '../../../_tests/testUtils';
import MockStore from '../../../__mocks__/common/mockRedux/mockStore';
import {type IInfo, InfoType} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import DisplayInfo from './DisplayInfo';

describe('DisplayInfo', () => {
    const mockMessage: IInfo = {
        content: 'test message',
        type: InfoType.BASIC,
    };

    const mockActiveTimeouts: {info: any; base: any} = {
        info: 'timeoutInfo',
        base: null,
    };

    const mockTriggerInfo: IInfo[] = [];

    test('should display message content', async () => {
        const mockSetTriggerInfo = vi.fn();

        await act(async () => {
            render(
                <DisplayInfo
                    message={mockMessage}
                    activeTimeouts={mockActiveTimeouts}
                    cancelInfo={vi.fn()}
                    triggerInfos={mockTriggerInfo}
                    setTriggerInfos={mockSetTriggerInfo}
                />,
            );
        });

        expect(await waitFor(() => screen.getByText(mockMessage.content))).toBeInTheDocument();
    });

    test('should display trigger info', async () => {
        const mockInfo: IInfo[] = [
            {
                content: 'test is a text',
                type: InfoType.BASIC,
            },
        ];
        const mockSetTriggerInfo = vi.fn();

        await act(async () => {
            render(
                <DisplayInfo
                    message={mockMessage}
                    activeTimeouts={mockActiveTimeouts}
                    cancelInfo={vi.fn()}
                    triggerInfos={mockInfo}
                    setTriggerInfos={mockSetTriggerInfo}
                />,
            );
        });

        expect(mockSetTriggerInfo).toHaveBeenCalled();
    });
});
