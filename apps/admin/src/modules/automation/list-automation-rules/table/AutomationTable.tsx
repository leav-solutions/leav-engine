import {KitIdCard, KitTable, KitTag} from 'aristid-ds';
import {type ComponentProps} from 'react';
import {useTranslation} from 'react-i18next';
import {automationTableContainer} from './automationTable.module.css';
import {useTableScrollableHeight} from '../../../utils/useTableScrollableHeight';
import {type AutomationRulesData} from '../get-automation-rules-data/useGetAutomationRulesData';
import {AutomationCell} from './cell/AutomationCell';
import {DeleteAutomationRuleButton} from '../../delete-automation-rule/DeleteAutomationRuleButton';

const ColumnWidth = {
    XS: '10ch',
    S: '15ch',
    M: '20ch',
};

type AutomationTableProps = {
    data: AutomationRulesData[];
    total: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (page: number, size: number) => void;
    onRowClick: (record: AutomationRulesData) => void;
    onDelete: (ruleId: string) => void;
};

export const AutomationTable = ({
    data,
    total,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onRowClick,
    onDelete,
}: AutomationTableProps) => {
    const {t} = useTranslation();
    const {containerRef, scrollHeight} = useTableScrollableHeight(true);

    const tableColumns: ComponentProps<typeof KitTable>['columns'] = [
        {
            title: t('automation.table.column.name'),
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: AutomationRulesData) => (
                <AutomationCell hoverAction={<DeleteAutomationRuleButton onClick={() => onDelete(record.id)} />}>
                    {name}
                </AutomationCell>
            ),
        },
        {
            title: t('automation.table.column.trigger'),
            dataIndex: 'trigger',
            key: 'trigger',
            width: ColumnWidth.M,
            render: (trigger: string) => <AutomationCell>{trigger}</AutomationCell>,
        },
        {
            title: t('automation.table.column.target'),
            dataIndex: 'target',
            key: 'target',
            render: (target: string) => <AutomationCell>{target}</AutomationCell>,
        },
        {
            title: t('automation.table.column.nb_actions'),
            dataIndex: 'nb_actions',
            key: 'nb_actions',
            width: ColumnWidth.S,
            render: (nbActions: number) => <KitTag style={{width: 'fit-content'}}>{String(nbActions)}</KitTag>,
        },
        {
            title: t('automation.table.column.status'),
            dataIndex: 'active',
            key: 'active',
            width: ColumnWidth.XS,
            render: (active: boolean) => (
                <KitTag type={active ? 'primary' : 'secondary'} style={{width: 'fit-content'}}>
                    <KitIdCard description={active ? t('admin.active') : t('admin.inactive')} />
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
                tableLayout="fixed"
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
