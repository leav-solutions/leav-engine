// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitIdCard, KitTable, KitTag} from 'aristid-ds';
import {type ComponentProps} from 'react';
import {useTranslation} from 'react-i18next';
import {automationTableContainer} from './automationTable.module.css';
import {useTableScrollableHeight} from '../../../utils/useTableScrollableHeight';
import {type AutomationRulesData} from '../get-automation-rules-data/useGetAutomationRulesData';

type AutomationTableProps = {
    data: AutomationRulesData[];
    total: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (page: number, size: number) => void;
    onRowClick: (record: AutomationRulesData) => void;
};

export const AutomationTable = ({
    data,
    total,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onRowClick,
}: AutomationTableProps) => {
    const {t} = useTranslation();
    const {containerRef, scrollHeight} = useTableScrollableHeight(true);

    // We are using HistoryCell component for columns when we want a max width and ellipsis. Others columns are not truncated.
    const tableColumns: ComponentProps<typeof KitTable>['columns'] = [
        {
            title: t('automation.table.column.name'),
            dataIndex: 'name',
            key: 'name',
            width: '25%',
        },
        {
            title: t('automation.table.column.trigger'),
            dataIndex: 'trigger',
            key: 'trigger',
            width: '25%',
        },
        {
            title: t('automation.table.column.target'),
            dataIndex: 'target',
            key: 'target',
            width: '25%',
        },
        {
            title: t('automation.table.column.nb_actions'),
            dataIndex: 'nb_actions',
            key: 'nb_actions',
            width: '15%',
        },
        {
            title: t('automation.table.column.status'),
            dataIndex: 'active',
            key: 'active',
            width: '15%',
            render: (active: boolean) =>
                active ? (
                    <KitTag type="success">
                        <KitIdCard description={t('admin.active')} />
                    </KitTag>
                ) : (
                    <KitTag>
                        <KitIdCard description={t('admin.inactive')} />
                    </KitTag>
                ),
        },
    ];

    return (
        <div className={automationTableContainer} ref={containerRef}>
            <KitTable
                dataSource={data}
                rowKey="id"
                columns={tableColumns}
                onRow={record => ({
                    onClick: () => onRowClick(record),
                    style: {cursor: 'pointer'},
                })}
                headerLineSize="s"
                lineSize="s" //TODO: Replace by "xs" when it will be available
                scroll={{
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
