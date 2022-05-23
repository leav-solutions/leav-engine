// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Switch} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ImportType} from '_gqlTypes/globalTypes';
import {ISheet} from '../../_types';

interface IImportKeysSelectorProps {
    sheet: ISheet;
    columnIndex: number;
    onChange: (keyType: 'key' | 'keyTo', value: boolean) => void;
}

const Wrapper = styled.div<{hasKeyTo: boolean}>`
    display: grid;
    grid-template-columns: repeat(${props => (props.hasKeyTo ? 2 : 1)}, 1fr);
    grid-column-gap: 1em;
`;

function ImportKeysSelector({columnIndex, sheet, onChange}: IImportKeysSelectorProps): JSX.Element {
    const {t} = useTranslation();
    const isLinkImport = sheet.type === ImportType.LINK;

    const _handleKeyChange = (value: boolean) => {
        onChange('key', value);
    };

    const _handleKeyToChange = (value: boolean) => {
        onChange('keyTo', value);
    };

    return (
        <Wrapper hasKeyTo={isLinkImport}>
            <Switch
                checkedChildren={t('import.import_key')}
                unCheckedChildren={t('import.import_key')}
                checked={sheet.keyColumnIndex === columnIndex}
                onChange={_handleKeyChange}
            />
            {isLinkImport && (
                <Switch
                    checkedChildren={t('import.link_key')}
                    unCheckedChildren={t('import.link_key')}
                    checked={sheet.keyToColumnIndex === columnIndex}
                    onChange={_handleKeyToChange}
                />
            )}
        </Wrapper>
    );
}

export default ImportKeysSelector;
