// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen, waitFor} from '_tests/testUtils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {IInfo, InfoType} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import DisplayInfo from './DisplayInfo';

describe('DisplayInfo', () => {
    const mockMessage: IInfo = {
        content: 'test message',
        type: InfoType.basic
    };

    const mockActiveTimeouts: {info: any; base: any} = {
        info: 'timeoutInfo',
        base: null
    };

    const mockTriggerInfo: IInfo[] = [];

    test('should display message content', async () => {
        const mockSetTriggerInfo = jest.fn();

        await act(async () => {
            render(
                        <DisplayInfo
                            message={mockMessage}
                            activeTimeouts={mockActiveTimeouts}
                            cancelInfo={jest.fn()}
                            triggerInfos={mockTriggerInfo}
                            setTriggerInfos={mockSetTriggerInfo}
                        />
            );
        });

        expect(await waitFor(() => screen.getByText(mockMessage.content))).toBeInTheDocument();
    });

    test('should display trigger info', async () => {
        const mockInfo: IInfo[] = [
            {
                content: 'test is a text',
                type: InfoType.basic
            }
        ];
        const mockSetTriggerInfo = jest.fn();

        await act(async () => {
            render(
                <DisplayInfo
                    message={mockMessage}
                    activeTimeouts={mockActiveTimeouts}
                    cancelInfo={jest.fn()}
                    triggerInfos={mockInfo}
                    setTriggerInfos={mockSetTriggerInfo}
                />
            );
        });

        expect(mockSetTriggerInfo).toHaveBeenCalled();
    });
});
