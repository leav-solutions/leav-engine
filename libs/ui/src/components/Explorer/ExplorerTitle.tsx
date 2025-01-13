// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {useExplorerLibraryDetailsQuery, useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import useLang from '_ui/hooks/useLang';
import {AntSkeleton} from 'aristid-ds';
import {FunctionComponent} from 'react';
import {Entrypoint} from './_types';

interface IExplorerTitleProps {
    title?: string;
    library: string;
    entrypoint: Entrypoint;
}

// TODO: use <h1 /> tag
export const ExplorerTitle: FunctionComponent<IExplorerTitleProps> = ({title, library, entrypoint}) => {
    const {data, loading, error} = useExplorerLibraryDetailsQuery({variables: {libraryId: library}, skip: !!title});
    const {
        data: attributeData,
        loading: attributeLoading,
        error: attributeError
    } = useExplorerLinkAttributeQuery({
        skip: !!title || entrypoint.type !== 'link',
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId
        }
    });

    const {lang} = useLang();

    if (title) {
        return <span>{title}</span>;
    }

    if (loading || attributeLoading) {
        return <AntSkeleton.Input style={{width: 400}} active />;
    }

    // TODO: handle error and bad library ID
    if (error || attributeError) {
        return <span>{error?.message ?? attributeError?.message}</span>;
    }

    let label;

    if (entrypoint.type === 'library') {
        const libraryData = data?.libraries?.list[0];

        if (!libraryData) {
            // TODO: make it i18n
            return <span>Unknown library</span>;
        }

        label = libraryData.label;
    } else {
        const linkAttributeData = attributeData?.attributes?.list[0];

        if (!linkAttributeData) {
            return <span>Unknown link attribute</span>;
        }

        label = 'label' in linkAttributeData ? linkAttributeData.label : null;
    }

    return <span>{localizedTranslation(label, lang)}</span>;
};
