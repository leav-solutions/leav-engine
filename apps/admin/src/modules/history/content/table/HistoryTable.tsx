// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTable} from 'aristid-ds';
import {type ComponentProps} from 'react';
import {HistoryCell} from './cell/HistoryCell';
import {CopyCell} from './cell/CopyCell';
import {type HistoryData} from '../get-history-data/useGetHistoryData';
import {useTranslation} from 'react-i18next';
import {useTableScrollableHeight} from './useTableScrollableHeight';
import {historyTableContainer} from './historyTable.module.css';

type HistoryTableProps = {
    data: HistoryData[];
    total: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (page: number, size: number) => void;
    onRowClick: (record: HistoryData) => void;
};

export const HistoryTable = ({
    data,
    total,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onRowClick,
}: HistoryTableProps) => {
    const {t} = useTranslation();
    const {containerRef, scrollHeight} = useTableScrollableHeight(true);

    // We are using HistoryCell component for columns when we want a max width and ellipsis. Others columns are not truncated.
    const tableColumns: ComponentProps<typeof KitTable>['columns'] = [
        {
            title: t('logs.table.column.date'),
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: t('logs.table.column.user'),
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: t('logs.table.column.action'),
            dataIndex: 'action',
            key: 'action',
            render: (action: string) => <HistoryCell value={action} />,
        },
        {
            title: t('logs.table.column.object'),
            dataIndex: 'object',
            key: 'object',
            render: (object: string) => <HistoryCell value={object} />,
        },
        {
            title: t('logs.table.column.entity'),
            dataIndex: 'entity',
            key: 'entity',
            render: (entity: string) => <HistoryCell value={entity} />,
        },
        {
            title: t('logs.table.column.details'),
            dataIndex: 'details',
            key: 'details',
            render: (details: string) => <HistoryCell value={details} />,
        },
        {
            title: t('logs.table.column.before'),
            dataIndex: 'before',
            key: 'before',
            render: (before: string) => <HistoryCell value={before} />,
        },
        {
            title: t('logs.table.column.after'),
            dataIndex: 'after',
            key: 'after',
            render: (after: string) => <HistoryCell value={after} />,
        },
        {
            title: t('logs.table.column.query_id'),
            dataIndex: 'queryId',
            key: 'queryId',
            render: (queryId: string) => <CopyCell cellName={t('logs.table.column.query_id')} value={queryId} />,
        },
    ];

    return (
        <div className={historyTableContainer} ref={containerRef}>
            <KitTable
                dataSource={data}
                columns={tableColumns}
                onRow={record => ({
                    onClick: () => onRowClick(record),
                    style: {cursor: 'pointer'},
                })}
                headerLineSize="s"
                lineSize="s" //TODO: Replace by "xs" when it will be available
                scroll={{
                    x: 'max-content',
                    y: scrollHeight,
                }}
                tableLayout="auto"
                pagination={{
                    position: ['bottomCenter'],
                    current: currentPage,
                    pageSize,
                    total,
                    onChange: onPageChange,
                    showSizeChanger: true,
                    onShowSizeChange: onPageSizeChange,
                }}
            />
        </div>
    );
};
