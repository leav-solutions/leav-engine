// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSkeleton, KitSpace, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';

type TotalResultProps = {
    loading: boolean;
    total: number;
};

export const TotalResult = ({loading, total}: TotalResultProps) => {
    const {t} = useTranslation();

    return (
        <KitSpace direction="horizontal" size="xxs">
            {loading ? (
                <KitSkeleton.KitCustomSkeleton style={{width: '20px', height: '15px'}} />
            ) : (
                <KitTypography.Text weight="bold" size="fontSize7">
                    {total}
                </KitTypography.Text>
            )}
            <KitTypography.Text weight="medium" size="fontSize7">
                {t('logs.toolbar.elements', {count: total})}
            </KitTypography.Text>
        </KitSpace>
    );
};
