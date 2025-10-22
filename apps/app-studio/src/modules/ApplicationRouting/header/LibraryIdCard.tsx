// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useContext} from 'react';
import {KitIdCard} from 'aristid-ds';
import {LangContext} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useGetLibraryNameQuery} from '../../../__generated__';
import {PanelIdCardSkeleton} from './PanelIdCardSkeleton';

interface ILibraryIdCardProps {
    title: string | null;
    libraryId: string | null;
    avatarSize: 'l' | 'm';
}

export const LibraryIdCard: FunctionComponent<ILibraryIdCardProps> = ({title, libraryId, avatarSize}) => {
    const {lang} = useContext(LangContext);

    const {data, loading} = useGetLibraryNameQuery({
        variables: {
            libraryId
        },
        skip: libraryId === null
    });

    const libraryLabel = localizedTranslation(data?.libraries?.list?.[0]?.label, lang);

    if (title) {
        return <KitIdCard size="s" title={title} />;
    }

    if (libraryId === null) {
        // PanelCustom case
        return null;
    }

    if (loading) {
        return <PanelIdCardSkeleton />;
    }

    return (
        <KitIdCard
            size="s"
            title={libraryLabel}
            avatarProps={{
                shape: 'square',
                label: libraryLabel,
                size: avatarSize
            }}
        />
    );
};
