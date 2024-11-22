// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {useExplorerLibraryDataQuery} from '_ui/_gqlTypes';
import useLang from '_ui/hooks/useLang';
import {AntSkeleton} from 'aristid-ds';
import {FunctionComponent} from 'react';

interface IExplorerTitleProps {
    title?: string;
    library: string;
}

// TODO: use <h1 /> tag
export const ExplorerTitle: FunctionComponent<IExplorerTitleProps> = ({title, library}) => {
    const {data, loading, error} = useExplorerLibraryDataQuery({variables: {libraryId: library}, skip: !!title});
    const {lang} = useLang();

    if (title) {
        return <span>{title}</span>;
    }

    if (loading) {
        return <AntSkeleton.Input style={{width: 400}} active />;
    }

    // TODO: handle error and bad library ID
    if (error) {
        return <span>{error.message}</span>;
    }

    const libraryData = data?.libraries?.list[0];

    if (!libraryData) {
        // TODO: make it i18n
        return <span>Unknown library</span>;
    }

    return <span>{localizedTranslation(libraryData.label, lang)}</span>;
};
