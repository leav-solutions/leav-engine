// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {localizedTranslation, Override} from '@leav/utils';
import {Button, Input, Table, TableColumnsType, Tag} from 'antd';
import {useState} from 'react';
import styled from 'styled-components';
import {AttributeFormat, AttributeType, LibraryAttributesFragment} from '../../../../../_gqlTypes';
import {tagColorByAttributeFormat, tagColorByAttributeType} from '../../../../../constants';
import {useLang} from '../../../../../hooks';
import {useSharedTranslation} from '../../../../../hooks/useSharedTranslation';
import {AttributePicker} from '../../../../AttributePicker';
import {AttributeCell} from './AttributeCell';
import {DeleteButton} from './DeleteButton';

interface IAttributesListProps {
    readOnly: boolean;
    attributes: LibraryAttributesFragment[];
    onDeleteAttribute: (attribute: LibraryAttributesFragment) => Promise<void>;
    onAddAttributes: (attributes: string[]) => Promise<void>;
}

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;

    > input {
        flex-grow: 1;
    }
`;

// To fix a cosmetic issue with the table header (see https://github.com/ant-design/ant-design/issues/41975)
const Wrapper = styled.div`
    && .ant-table-header {
        border-radius: 0;
    }
`;

export type AttributeListType = Override<LibraryAttributesFragment, {label: string}> & {key: string};

function AttributesList({
    attributes = [],
    readOnly,
    onDeleteAttribute,
    onAddAttributes
}: IAttributesListProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const [search, setSearch] = useState('');
    const [isAddAttributeModalOpen, setIsAddAttributeModalOpen] = useState(false);

    const _handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const _handleSubmitAddAttribute = async (selectedAttributes: string[]) => {
        return onAddAttributes(selectedAttributes);
    };

    const _handleDeleteAttribute = (attribute: LibraryAttributesFragment) => async () => {
        return onDeleteAttribute(attribute);
    };

    const _handleClickNewAttribute = () => {
        setIsAddAttributeModalOpen(true);
    };

    const _handleCloseAddAttributeModal = () => setIsAddAttributeModalOpen(false);

    const columns: TableColumnsType<AttributeListType> = [
        {
            title: t('attributes.attribute'),
            key: 'label',
            render: (_, attribute) => <AttributeCell attribute={attribute} />
        },
        {
            title: t('attributes.type'),
            dataIndex: 'type',
            key: 'type',
            width: '150px',
            render: (type: AttributeType) => (
                <Tag color={tagColorByAttributeType[type]}>{t(`attributes.type_${type}`)}</Tag>
            ),
            filters: Object.values(AttributeType).map(type => ({
                text: t(`attributes.type_${type}`),
                value: type
            })),
            onFilter: (value, record) => record.type === value,
            sorter: (a, b) => {
                const aTypeLabel = t(`attributes.type_${a.type}`);
                const bTypeLabel = t(`attributes.type_${b.type}`);

                return aTypeLabel.localeCompare(bTypeLabel);
            }
        },
        {
            title: t('attributes.format'),
            dataIndex: 'format',
            key: 'format',
            width: '150px',
            render: (format: AttributeFormat) =>
                format ? <Tag color={tagColorByAttributeFormat[format]}>{t(`attributes.format_${format}`)}</Tag> : null,
            filters: Object.values(AttributeFormat).map(format => ({
                text: t(`attributes.format_${format}`),
                value: format
            })),
            onFilter: (value, record) => record.format === value,
            sorter: (a, b) => {
                const aFormatLabel = t(`attributes.format_${a.format}`);
                const bFormatLabel = t(`attributes.format_${b.format}`);

                return aFormatLabel.localeCompare(bFormatLabel);
            }
        },
        {
            key: 'delete',
            title: <span></span>,
            dataIndex: 'id',
            width: '50px',
            align: 'center',
            render: (_, attribute) => (
                <DeleteButton readOnly={readOnly} attribute={attribute} onDelete={_handleDeleteAttribute(attribute)} />
            )
        }
    ];

    const tableData: AttributeListType[] = attributes
        .filter(attribute => {
            // Filter based on search
            const label = localizedTranslation(attribute.label, lang);
            const searchStr = search.toLowerCase();

            // Search on id or label
            return attribute.id.toLowerCase().includes(searchStr) || label.toLowerCase().includes(searchStr);
        })
        .map(lib => ({
            ...lib,
            key: lib.id,
            label: localizedTranslation(lib.label, lang)
        }));

    const tableHeader = (
        <HeaderWrapper>
            <Input.Search onChange={_handleSearchChange} placeholder={t('global.search') + '...'} allowClear />
            {!readOnly && (
                <Button type="primary" icon={<PlusOutlined />} onClick={_handleClickNewAttribute}>
                    {t('attributes.add_attribute')}
                </Button>
            )}
        </HeaderWrapper>
    );

    return (
        <Wrapper>
            <Table
                size="middle"
                columns={columns}
                dataSource={tableData}
                bordered
                pagination={false}
                scroll={{y: 'calc(95vh - 22rem)'}}
                title={() => tableHeader}
            />
            {isAddAttributeModalOpen && (
                <AttributePicker
                    multiple
                    onClose={_handleCloseAddAttributeModal}
                    onSubmit={_handleSubmitAddAttribute}
                    open={isAddAttributeModalOpen}
                    canCreate
                    selected={attributes.map(a => a.id)}
                />
            )}
        </Wrapper>
    );
}

export default AttributesList;
