// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitTypography} from 'aristid-ds';
import {type FunctionComponent} from 'react';

interface IResultCountProps {
    t: ReturnType<typeof useSharedTranslation>['t'];
    isInactive: boolean;
    totalCountFiltered: number;
    totalCountLibrary: number;
}

export const ResultsCount: FunctionComponent<IResultCountProps> = ({
    t,
    isInactive,
    totalCountFiltered,
    totalCountLibrary,
}) => (
    <KitTypography.Paragraph>
        <KitTypography.Text weight="bold" size="fontSize5">
            {isInactive
                ? `${totalCountLibrary} `
                : totalCountFiltered === totalCountLibrary
                  ? `${totalCountLibrary} `
                  : `${totalCountFiltered} / ${totalCountLibrary} `}
        </KitTypography.Text>
        <KitTypography.Text weight="medium" size="fontSize5">
            {t('explorer.massAction.results', {count: totalCountLibrary})}
        </KitTypography.Text>
    </KitTypography.Paragraph>
);
