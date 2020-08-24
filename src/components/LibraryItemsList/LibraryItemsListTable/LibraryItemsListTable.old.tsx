import {useQuery} from '@apollo/client';
import {Card, Menu, Spin, Table} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {localizedLabel} from '../../../utils';
import {AttributeType, IRecordEdition, ITableHeaderOld} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import ChooseTableColumns from './ChooseTableColumns';
import HeaderTableCell from './HeaderTableCell';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';
import LibraryItemsModal from './LibraryItemsListTableRow/LibraryItemsModal';

const TableWrapper = styled.div`
    &&& {
        height: calc(100% - 16rem);
        overflow: auto;
        padding: 0;
        margin-top: 0;

        border: 1px solid rgba(34, 36, 38, 0.15);
    }
`;

const HeaderTable = styled(Card)<any>`
    &&& {
        margin: 0;
        padding: 0;
        border-bottom: 0;
        border-radius: 0;

        display: grid;
        grid-template-columns: repeat(${({columns}) => columns}, 1fr);
    }
`;

const TableStyled = styled(Table)`
    &&& {
        border-radius: 0;
    }
`;

const FooterTable = styled(Card)`
    &&& {
        margin-top: 0;
        border-top: 0;
        border-radius: 0;
    }
`;

interface ILibraryItemsListTableProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const initialColumnsLimit = 5;

function LibraryItemsListTable({stateItems, dispatchItems}: ILibraryItemsListTableProps): JSX.Element {
    const {t} = useTranslation();

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const [tableColumns, setTableColumn] = useState<ITableHeaderOld[]>([]);
    const [openChangeColumns, setOpenChangeColumns] = useState(false);
    const [recordEdition, setRecordEdition] = useState<IRecordEdition>({
        show: false
    });

    useEffect(() => {
        if (stateItems.attributes.length && !stateItems.columns.length) {
            // initialize columns in state
            const initialTableColumns = stateItems.attributes.reduce(
                (acc, attribute, index) =>
                    index < initialColumnsLimit
                        ? [
                              ...acc,
                              {
                                  name: attribute.id,
                                  library: attribute.library,
                                  display:
                                      typeof attribute.label === 'string'
                                          ? attribute.label
                                          : attribute.label.fr || attribute.label.en,
                                  type: attribute.type
                              }
                          ]
                        : acc,
                [
                    {
                        name: 'infos',
                        display: t('items_list.table.infos'),
                        library: stateItems.attributes[0].library,
                        type: AttributeType.simple
                    }
                ]
            );

            setTableColumn(initialTableColumns);

            const columns = initialTableColumns.map(col => ({id: col.name, library: col.library, type: col.type}));
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_COLUMNS,
                columns
            });
        } else if (stateItems.attributes.length && stateItems.columns.length) {
            setTableColumn(
                stateItems.columns.map(col => {
                    const attribute = stateItems.attributes.find(att => att.id === col.id);

                    if (attribute) {
                        const display = col.extendedData?.path
                            ? col.extendedData?.path.split('.').pop() || ''
                            : typeof attribute.label === 'string'
                            ? attribute.label
                            : localizedLabel(attribute.label, lang);

                        return {
                            name: `${attribute.id}_${attribute.library}_${
                                attribute.linkedLibrary ?? attribute.linkedTree
                            }_${col.extendedData?.path ?? col.treeData?.attributeTreeId}`,
                            display,
                            type: attribute.type
                        };
                    }

                    // only the infos columns isn't in attributes
                    return {name: 'infos', display: t('items_list.table.infos'), type: AttributeType.simple};
                })
            );
        }
    }, [t, dispatchItems, stateItems.columns, stateItems.attributes, lang]);

    if (!stateItems.items) {
        return (
            <Card style={{height: '20rem'}}>
                <div>
                    <Spin />
                </div>
            </Card>
        );
    }

    return (
        <>
            <ChooseTableColumns
                stateItems={stateItems}
                dispatchItems={dispatchItems}
                openChangeColumns={openChangeColumns}
                setOpenChangeColumns={setOpenChangeColumns}
            />
            <HeaderTable columns={tableColumns.length}>
                {tableColumns.map(cell => (
                    <HeaderTableCell
                        key={cell.name}
                        cell={cell}
                        stateItems={stateItems}
                        dispatchItems={dispatchItems}
                        setOpenChangeColumns={setOpenChangeColumns}
                    />
                ))}
            </HeaderTable>
            <TableWrapper>
                <TableStyled>
                    <Table.ColumnGroup>
                        {stateItems.items &&
                            stateItems.items?.map(item => {
                                return (
                                    <LibraryItemsListTableRow
                                        key={item.id}
                                        item={item}
                                        stateItems={stateItems}
                                        dispatchItems={dispatchItems}
                                        showRecordEdition={item => setRecordEdition(re => ({show: true, item}))}
                                    />
                                );
                            })}
                    </Table.ColumnGroup>
                </TableStyled>
            </TableWrapper>

            <FooterTable>
                <div>
                    <Menu>
                        <LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />
                    </Menu>
                </div>
            </FooterTable>

            <LibraryItemsModal
                showModal={recordEdition.show}
                closeModal={() => setRecordEdition(re => ({...re, show: false}))}
                values={recordEdition.item}
                updateValues={item => setRecordEdition(re => ({...re, item}))}
            />
        </>
    );
}

export default LibraryItemsListTable;
