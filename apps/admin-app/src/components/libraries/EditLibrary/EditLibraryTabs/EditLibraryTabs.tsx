// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import LibraryIcon from 'components/shared/LibraryIcon';
import {Location} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {AiOutlineFileSearch} from 'react-icons/ai';
import {useHistory, useLocation} from 'react-router-dom';
import {Button, Grid, Header, Tab, TabProps} from 'semantic-ui-react';
import styled from 'styled-components';
import {indexRecordsMutation} from '../../../../queries/records/indexRecordsMutation';
import {GET_LIB_BY_ID_libraries_list} from '../../../../_gqlTypes/GET_LIB_BY_ID';
import {INDEX_RECORDS, INDEX_RECORDSVariables} from '../../../../_gqlTypes/INDEX_RECORDS';
import AttributesTab from './AttributesTab';
import FormsTab from './FormsTab';
import InfosTab from './InfosTab';
import PermissionsTab from './PermissionsTab';
import PurgeTab from './PurgeTab';

const Title = styled(Header)`
    display: flex;
    align-items: center;
`;

Title.displayName = 'Title';

interface IEditLibraryTabsProps {
    library: GET_LIB_BY_ID_libraries_list | null;
    readOnly: boolean;
    location?: Location;
}

const EditLibraryTabs = ({library, readOnly}: IEditLibraryTabsProps): JSX.Element => {
    const {t} = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const isCreationMode = library === null;

    const [indexRecords, {loading: indexLoading}] = useMutation<INDEX_RECORDS, INDEX_RECORDSVariables>(
        indexRecordsMutation
    );

    const label = isCreationMode ? t('libraries.new') : library!.label?.fr || library!.label?.en || library!.id;

    const panes = [
        {
            key: 'infos',
            mustBeDisplayed: true,
            menuItem: t('libraries.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <InfosTab library={library} readonly={readOnly} />
                </Tab.Pane>
            )
        },
        {
            key: 'permissions',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('libraries.permissions'),
            render: () => {
                return (
                    <Tab.Pane key="permissions" className="grow flex-col height100">
                        <PermissionsTab library={library as GET_LIB_BY_ID_libraries_list} readonly={readOnly} />
                    </Tab.Pane>
                );
            }
        },
        {
            key: 'attributes',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('libraries.attributes'),
            render: () => {
                return (
                    <Tab.Pane key="attributes" className="grow">
                        <AttributesTab library={library} readonly={readOnly} />
                    </Tab.Pane>
                );
            }
        },
        {
            key: 'forms',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('forms.title'),
            render: () => {
                return (
                    <Tab.Pane key="forms" className="height100" style={{padding: '0', border: '0px none'}}>
                        <FormsTab libraryId={library!.id} readonly={readOnly} />
                    </Tab.Pane>
                );
            }
        },
        {
            key: 'purge',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('libraries.purge.title'),
            render: () => {
                return (
                    <Tab.Pane key="purge" className="height100" style={{padding: '0', border: '0px none'}}>
                        <PurgeTab library={library} readonly={readOnly} />
                    </Tab.Pane>
                );
            }
        }
    ].filter(p => p.mustBeDisplayed);

    const tabName = location ? location.hash.replace('#', '') : undefined;
    const [activeIndex, setActiveIndex] = useState<number | undefined>(
        tabName ? panes.findIndex(p => tabName === p.key) : 0
    );

    const _handleOnTabChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: TabProps) => {
        if (data.panes && data.activeIndex !== undefined) {
            setActiveIndex(Number(data.activeIndex.toString()));
            history?.push(`#${data.panes[data.activeIndex].key}`);
        }
    };

    const _handleIndex = async () => {
        await indexRecords({
            variables: {
                libraryId: library.id
            }
        });
    };

    return (
        <>
            <Grid padded verticalAlign={'middle'}>
                <Grid.Column width={12}>
                    <Title className="no-grow" role="heading" aria-label="title">
                        <LibraryIcon library={library} />
                        {label}
                    </Title>
                </Grid.Column>
                {!isCreationMode && (
                    <Grid.Column width={4} textAlign="right">
                        <Button
                            primary
                            disabled={indexLoading}
                            onClick={_handleIndex}
                            loading={indexLoading}
                            aria-label="index"
                        >
                            <AiOutlineFileSearch /> {t('libraries.index_fulltext_search')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            <Tab
                activeIndex={activeIndex}
                onTabChange={_handleOnTabChange}
                menu={{secondary: true, pointing: true}}
                panes={panes}
                className="grow flex-col height100"
            />
        </>
    );
};

export default EditLibraryTabs;
