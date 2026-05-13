import {type useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitSpace, KitTypography} from 'aristid-ds';
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
    <KitSpace direction="horizontal" size="xxs">
        <KitTypography.Text weight="bold" size="fontSize7">
            {isInactive
                ? `${totalCountLibrary} `
                : totalCountFiltered === totalCountLibrary
                  ? `${totalCountLibrary} `
                  : `${totalCountFiltered} / ${totalCountLibrary} `}
        </KitTypography.Text>
        <KitTypography.Text weight="medium" size="fontSize7">
            {t('explorer.massAction.results', {count: totalCountLibrary})}
        </KitTypography.Text>
    </KitSpace>
);
