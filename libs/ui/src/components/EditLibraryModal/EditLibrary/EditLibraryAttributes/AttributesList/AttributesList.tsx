// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation, Override} from '@leav/utils';
import {Input, Table, TableColumnsType, Tag, TagProps} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useLang} from '../../../../../hooks';
import {AttributeFormat, AttributeType, LibraryAttributesFragment} from '../../../../../_gqlTypes';
import {DeleteButton} from './DeleteButton';

interface IAttributesListProps {
    readOnly: boolean;
    attributes: LibraryAttributesFragment[];
    onDeleteAttribute: (attribute: LibraryAttributesFragment) => Promise<void>;
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

type AttributeListType = Override<LibraryAttributesFragment, {label: string}> & {key: string};

const tagColorByType: {[key in AttributeType]: TagProps['color']} = {
    [AttributeType.simple]: 'purple',
    [AttributeType.simple_link]: 'blue',
    [AttributeType.advanced]: 'orange',
    [AttributeType.advanced_link]: 'volcano',
    [AttributeType.tree]: 'green'
};

const tagColorByFormat: {[key in AttributeFormat]: TagProps['color']} = {
    [AttributeFormat.boolean]: 'gold',
    [AttributeFormat.date]: 'blue',
    [AttributeFormat.date_range]: 'geekblue',
    [AttributeFormat.encrypted]: 'red',
    [AttributeFormat.extended]: 'magenta',
    [AttributeFormat.numeric]: 'orange',
    [AttributeFormat.text]: 'green'
};

function AttributesList({attributes = [], readOnly, onDeleteAttribute}: IAttributesListProps): JSX.Element {
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const [search, setSearch] = useState('');

    const _handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const _handleDeleteAttribute = (attribute: LibraryAttributesFragment) => async () => {
        return onDeleteAttribute(attribute);
    };

    const columns: TableColumnsType<AttributeListType> = [
        {
            title: t('attributes.list_label'),
            dataIndex: 'label',
            key: 'label'
        },
        {
            title: t('attributes.type'),
            dataIndex: 'type',
            key: 'type',
            width: '150px',
            render: (type: AttributeType) => <Tag color={tagColorByType[type]}>{t(`attributes.type_${type}`)}</Tag>
        },
        {
            title: t('attributes.format'),
            dataIndex: 'format',
            key: 'format',
            width: '150px',
            render: (format: AttributeFormat) =>
                format ? <Tag color={tagColorByFormat[format]}>{t(`attributes.format_${format}`)}</Tag> : null
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
        </HeaderWrapper>
    );

    return (
        <Table
            size="middle"
            columns={columns}
            dataSource={tableData}
            bordered
            pagination={false}
            scroll={{y: 'calc(95vh - 20rem)'}}
            title={() => tableHeader}
        />
    );
}

export default AttributesList;
