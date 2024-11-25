// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitRadio, KitSpace, KitTag} from 'aristid-ds';
import {RadioGroupProps} from 'aristid-ds/dist/Kit/DataEntry/Radio';
import {FunctionComponent} from 'react';

interface ISelectViewTypeProps {
    value: string;
    onChange: RadioGroupProps['onChange'];
}

export const SelectViewType: FunctionComponent<ISelectViewTypeProps> = ({value, onChange}) => {
    const {t} = useSharedTranslation();

    const comingSoonTag = <KitTag type="secondary" idCardProps={{description: String(t('explorer.coming-soon'))}} />;

    return (
        <KitRadio.Group value={value} onChange={onChange}>
            <KitSpace direction="vertical" size={0}>
                <KitRadio value="list" disabled>
                    <KitSpace>
                        {t('explorer.view-type-list')} {comingSoonTag}
                    </KitSpace>
                </KitRadio>
                <KitRadio value="table">{t('explorer.view-type-table')}</KitRadio>
                <KitRadio value="mosaic" disabled>
                    <KitSpace>
                        {t('explorer.view-type-mosaic')} {comingSoonTag}
                    </KitSpace>
                </KitRadio>
                <KitRadio value="planning" disabled>
                    <KitSpace>
                        {t('explorer.view-type-planning')} {comingSoonTag}
                    </KitSpace>
                </KitRadio>
            </KitSpace>
        </KitRadio.Group>
    );
};
