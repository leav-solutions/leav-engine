import {useQuery} from '@apollo/client';
import {Card, Divider} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import {ILibrary} from '../../_types/types';
import LibraryCard from './LibraryCard';
import LibraryDetail from './LibraryDetail';

function LibrariesList(): JSX.Element {
    const {t} = useTranslation();
    const [libraries, setLibraries] = useState<ILibrary[]>([]);

    const {libId, libQueryName, filterName} = useParams();

    const {loading, data, error} = useQuery(getLibrariesListQuery);

    useEffect(() => {
        if (!loading) {
            setLibraries(data?.libraries?.list ?? []);
        }
    }, [loading, data, error]);

    if (error) {
        return <div>error</div>;
    }

    return (
        <div className="wrapper-page">
            <h1>{t('lib_list.header')}</h1>
            <Card>
                {libraries.map(lib => (
                    <LibraryCard key={lib.id} lib={lib} />
                ))}
            </Card>

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
