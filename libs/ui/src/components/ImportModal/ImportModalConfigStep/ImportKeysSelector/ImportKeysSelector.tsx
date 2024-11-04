// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSwitch} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ImportMode, ImportType} from '_ui/_gqlTypes';
import {ISheet} from '../../_types';

interface IImportKeysSelectorProps {
    sheet: ISheet;
    columnIndex: number;
    onChange: (keyType: 'key' | 'keyTo', value: boolean) => void;
}

const Wrapper = styled.div<{$hasKeyTo: boolean}>`
    display: grid;
    grid-template-columns: 7rem 3rem;
    grid-column-gap: 0.5em;
    grid-row-gap: 1em;
`;

function ImportKeysSelector({columnIndex, sheet, onChange}: IImportKeysSelectorProps): JSX.Element {
    const {t} = useSharedTranslation();
    const isLinkImport = sheet.type === ImportType.LINK;

    const _handleKeyChange = (value: boolean) => {
        onChange('key', value);
    };

    const _handleKeyToChange = (value: boolean) => {
        onChange('keyTo', value);
    };

    const displayImportKey = isLinkImport || sheet.mode !== ImportMode.insert;
    const displayLinkKey = isLinkImport;

    if (!displayImportKey && !displayLinkKey) {
        return null;
    }

    return (
        <Wrapper $hasKeyTo={isLinkImport}>
            {displayImportKey && (
                <>
                    <label>{t('import.import_key')}: </label>
                    <KitSwitch checked={sheet.keyColumnIndex === columnIndex} onChange={_handleKeyChange} />
                </>
            )}
            {displayLinkKey && (
                <>
                    <label>{t('import.link_key')}: </label>
                    <KitSwitch checked={sheet.keyToColumnIndex === columnIndex} onChange={_handleKeyToChange} />
                </>
            )}
        </Wrapper>
    );
}

export default ImportKeysSelector;
