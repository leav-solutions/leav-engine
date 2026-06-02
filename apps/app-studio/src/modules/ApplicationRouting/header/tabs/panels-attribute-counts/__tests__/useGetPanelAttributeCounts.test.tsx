import {MockedProvider} from '@apollo/client/testing';
import {renderHook, waitFor} from '@testing-library/react';
import {type AttributeExplorerPanel} from '_ui/hooks/usePanelMessenger/types';
import {PanelAttributeCountDocument, RecordFilterCondition} from '../../../../../../__generated__';
import {useGetPanelsAttributeCounts} from '../useGetPanelsAttributeCounts';

describe('useGetPanelsAttributeCounts', () => {
    const mockPanel1: AttributeExplorerPanel = {
        id: 'panel1',
        type: 'explorer',
        isViewSettingsActive: false,
        attributeSource: 'campaigns_link',
        libraryId: 'campaigns',
        actions: [],
    };

    const mockPanel2: AttributeExplorerPanel = {
        id: 'panel2',
        type: 'explorer',
        isViewSettingsActive: false,
        attributeSource: 'products_link',
        libraryId: 'products',
        actions: [],
    };

    it('should return {} when recordId is undefined', async () => {
        const {result} = renderHook(() => useGetPanelsAttributeCounts({panels: [mockPanel1], recordId: undefined}), {
            wrapper: ({children}) => <MockedProvider mocks={[]}>{children as JSX.Element}</MockedProvider>,
        });

        await waitFor(() => {
            expect(result.current.panelsCounts).toEqual({});
        });
    });

    it('should return {} when panels is empty', async () => {
        const {result} = renderHook(() => useGetPanelsAttributeCounts({panels: [], recordId: '123'}), {
            wrapper: ({children}) => <MockedProvider mocks={[]}>{children as JSX.Element}</MockedProvider>,
        });

        await waitFor(() => {
            expect(result.current.panelsCounts).toEqual({});
        });
    });

    it('should return the counts for all panels', async () => {
        const mocks = [
            {
                request: {
                    query: PanelAttributeCountDocument,
                    variables: {
                        library: 'campaigns',
                        filters: [
                            {
                                field: 'campaigns_link.id',
                                condition: RecordFilterCondition.EQUAL,
                                value: '123',
                            },
                        ],
                    },
                },
                result: {
                    data: {
                        records: {
                            totalCount: 5,
                        },
                    },
                },
            },
            {
                request: {
                    query: PanelAttributeCountDocument,
                    variables: {
                        library: 'products',
                        filters: [
                            {
                                field: 'products_link.id',
                                condition: RecordFilterCondition.EQUAL,
                                value: '123',
                            },
                        ],
                    },
                },
                result: {
                    data: {
                        records: {
                            totalCount: 3,
                        },
                    },
                },
            },
        ];

        const {result} = renderHook(
            () => useGetPanelsAttributeCounts({panels: [mockPanel1, mockPanel2], recordId: '123'}),
            {
                wrapper: ({children}) => <MockedProvider mocks={mocks}>{children as JSX.Element}</MockedProvider>,
            },
        );

        await waitFor(() => {
            expect(result.current.panelsCounts).toEqual({
                panel1: 5,
                panel2: 3,
            });
        });
    });
});
