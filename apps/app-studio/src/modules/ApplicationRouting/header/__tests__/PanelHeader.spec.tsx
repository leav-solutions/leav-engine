// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from '_ui/_tests/testUtils';
import {render as renderRTL} from '@testing-library/react';
import * as ReactRouter from 'react-router-dom';
import * as Utils from '../../utils/retrievePanelDetails';
import * as LibraryIdCardComponent from '../LibraryIdCard';
import * as RecordIdCardComponent from '../RecordIdCard';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {type Application} from '../../types';
import {PanelHeader} from '../PanelHeader';
import {MockedLangContextProvider} from '@leav/ui';

jest.mock('../../../../config/application-instance/application-settings/ApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn()
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn()
}));

jest.mock('../LibraryIdCard', () => ({
    LibraryIdCard: jest.fn()
}));

jest.mock('../RecordIdCard', () => ({
    RecordIdCard: jest.fn()
}));

describe('PanelHeader', () => {
    const spyUseParams = jest.spyOn(ReactRouter, 'useParams');
    const spyLibraryIdCard = jest.spyOn(LibraryIdCardComponent, 'LibraryIdCard');
    const spyRecordIdCard = jest.spyOn(RecordIdCardComponent, 'RecordIdCard');
    const spyRetrievePanelDetails = jest.spyOn(Utils, 'retrievePanelDetails');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    const emptyApplication: Application = {
        workspaces: [],
        libraries: {}
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display RecordIdCard component when panel is type record', async () => {
        spyUseParams.mockReturnValue({recordId: '1234567890'});
        spyRetrievePanelDetails.mockReturnValue({libraryId: 'test', panelType: 'recordPanels', currentPanel: null});
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader enabled />);

        expect(spyRetrievePanelDetails).toHaveBeenCalledTimes(1);
        expect(spyRecordIdCard).toHaveBeenCalledTimes(1);
        expect(spyRecordIdCard).toHaveBeenCalledWith(
            {
                libraryId: 'test',
                currentRecordId: '1234567890',
                avatarSize: 'm'
            },
            {}
        );
    });

    it('should display RecordIdCard component when panel is type record and recordId is providing by parent', async () => {
        spyRetrievePanelDetails.mockReturnValue({libraryId: 'test', panelType: 'recordPanels', currentPanel: null});
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader enabled currentRecordId="1234567890" />);

        expect(spyRetrievePanelDetails).toHaveBeenCalledTimes(1);
        expect(spyRecordIdCard).toHaveBeenCalledTimes(1);
        expect(spyRecordIdCard).toHaveBeenCalledWith(
            {
                libraryId: 'test',
                currentRecordId: '1234567890',
                avatarSize: 'm'
            },
            {}
        );
    });

    it('should display LibraryIdCard component when panel is type library', async () => {
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: 'test',
            panelType: 'libraryPanels',
            currentPanel: {
                id: '1',
                name: {
                    fr: 'un'
                },
                type: 'explorer',
                actions: []
            }
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader enabled />);

        expect(spyRetrievePanelDetails).toHaveBeenCalledTimes(1);
        expect(spyLibraryIdCard).toHaveBeenCalledTimes(1);
        expect(spyLibraryIdCard).toHaveBeenCalledWith(
            {
                libraryId: 'test',
                title: 'un',
                avatarSize: 'm'
            },
            {}
        );
    });

    it('should render nothing if component is not enabled', async () => {
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: 'test',
            panelType: 'libraryPanels',
            currentPanel: {
                id: '1',
                name: {
                    fr: 'un'
                },
                type: 'explorer',
                actions: []
            }
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        /**
         * Use render from React Testing Library directly to avoid LEAV injections as ANTD.
         * Useful to test that component render `null`
         * https://ploegert.gitbook.io/til/programmy/react-testing-library/check-that-a-component-renders-as-null
         */
        const {container} = renderRTL(
            <MockedLangContextProvider>
                <PanelHeader enabled={false} />
            </MockedLangContextProvider>
        );

        expect(container.firstChild).toBeNull();
    });
});
