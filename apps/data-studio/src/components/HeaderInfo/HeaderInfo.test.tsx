// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {act} from 'react-dom/test-utils';
import {infosInitialState} from 'reduxStore/infos';
import {render, screen, waitFor} from '_tests/testUtils';
import {IBaseInfo, IInfo, InfoChannel, InfoPriority, InfoType} from '_types/types';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import HeaderInfo from './HeaderInfo';

describe('HeaderInfo', () => {
    test('should display base message', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <HeaderInfo />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByTestId('info-message-wrapper')).toBeInTheDocument();
    });

    test('should display passive message given', async () => {
        // Add custom merge infosStack and baseInfo to avoid warning from apollo

        const mockBaseInfo: IBaseInfo = {
            content: 'base info',
            type: InfoType.basic
        };

        const mockState = {
            info: {...infosInitialState, base: mockBaseInfo}
        };

        await act(async () => {
            render(
                <MockedProvider>
                    <MockStore state={mockState}>
                        <HeaderInfo />
                    </MockStore>
                </MockedProvider>
            );
        });

        expect(await waitFor(() => screen.getByText(mockBaseInfo.content))).toBeInTheDocument();
    });

    test('should display trigger message given', async () => {
        // Add custom merge infosStack and baseInfo to avoid warning from apollo

        const mockInfo: IInfo = {
            content: 'this is a test',
            type: InfoType.basic,
            time: 1234567890,
            priority: InfoPriority.low,
            channel: InfoChannel.passive
        };

        const mockState = {
            info: {...infosInitialState, stack: [mockInfo]}
        };

        await act(async () => {
            render(
                <MockedProvider>
                    <MockStore state={mockState}>
                        <HeaderInfo />
                    </MockStore>
                </MockedProvider>
            );
        });

        expect(await waitFor(() => screen.getByText(mockInfo.content))).toBeInTheDocument();
    });
});
