// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import RecordSummary from './RecordSummary';
import {IUseGetRecordColumnsValuesQueryHook} from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';

jest.mock('_ui/components/RecordEdition/EditRecordSidebar/RecordSummary/RecordInformations/RecordInformations', () => ({
    RecordInformations: () => <div>Informations</div>
}));

jest.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: (): Partial<IUseGetRecordColumnsValuesQueryHook> => ({
        loading: false,
        data: {},
        refetch: jest.fn()
    })
}));

describe('RecordSummary', () => {
    it('Should display three tabs: informations, chat and history', async () => {
        render(<RecordSummary record={mockRecord} />);

        expect(screen.getByText('record_summary.informations')).toBeInTheDocument();
        expect(screen.getByText('record_summary.chat')).toBeInTheDocument();
        expect(screen.getByText('record_summary.history')).toBeInTheDocument();
    });

    //TODO: In XSTREAM-1134, we will have to handle the loading state
    it.todo('Should display loading state');

    //TODO: In XSTREAM-1134, we will have to handle the error state
    it.todo('Should display error state');
});
