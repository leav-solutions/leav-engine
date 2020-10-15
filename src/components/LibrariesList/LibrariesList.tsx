import {useQuery} from '@apollo/client';
import {Divider, PageHeader, Row} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import {ILibrary} from '../../_types/types';
import LibraryCard from './LibraryCard';
import LibraryDetail from './LibraryDetail';

function LibrariesList(): JSX.Element {
    const {t} = useTranslation();
    const {libId, libQueryName, filterName} = useParams<{libId: string; libQueryName: string; filterName: string}>();

    const [libraries, setLibraries] = useState<ILibrary[]>([]);
    const [activeLibrary, setActiveLibrary] = useState<string>(libId);

    const {loading, data, error} = useQuery(getLibrariesListQuery);

    useEffect(() => {
        if (!loading) {
            setLibraries(data?.libraries?.list ?? []);
        }
        setActiveLibrary(libId);
    }, [loading, data, error, libId, setActiveLibrary]);

    if (error) {
        return <div>error</div>;
    }

    return (
        <div className="wrapper-page">
            <PageHeader title={t('lib_list.header')} />
            <Row gutter={[16, 16]}>
                {libraries.map(lib => (
                    <LibraryCard active={lib.id === activeLibrary} key={lib.id} lib={lib} />
                ))}
            </Row>

            {libId && libQueryName && (
                <>
                    <Divider />
                    <LibraryDetail libId={libId} libQueryName={libQueryName} filterName={filterName} />
                </>
            )}
        </div>
    );
}

export default LibrariesList;
