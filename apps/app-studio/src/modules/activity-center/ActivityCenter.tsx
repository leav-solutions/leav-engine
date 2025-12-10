// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitEmpty} from 'aristid-ds';
import {useTranslation} from 'react-i18next';

export const ActivityCenter = () => {
    const {t} = useTranslation();

    // TODO: User task long should be put here (and temporary translation should be removed)
    return <KitEmpty image={KitEmpty.ASSET_LIST} title={t('temporary.upcoming')} />;
};
