// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitDivider, KitSelect, KitSpace} from 'aristid-ds';
import styled from 'styled-components';
import {ReactNode, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IKitOption} from 'aristid-ds/dist/Kit/DataEntry/Select/types';

interface ILinkSelectProps {
    tagDisplay: boolean;
    options: IKitOption[];
    defaultValues: string[];
    hideAdvancedSearch?: boolean;
    onUpdateSelection: (value: string[]) => void;
    onCreate: (value: string) => void;
    onAdvanceSearch: () => void;
}

const StyledDivider = styled(KitDivider)`
    margin: calc(var(--general-spacing-xs) * 1px);
`;

const StyledContainer = styled.div`
    display: flex;
    justify-content: center;
`;

const StyledKitSelect = styled(KitSelect)`
    .ant-select-selection-overflow-item:not(.ant-select-selection-overflow-item-suffix) {
        display: none;
    }
`;

function LinkSelect({
    tagDisplay,
    options,
    defaultValues,
    hideAdvancedSearch = false,
    onUpdateSelection,
    onCreate,
    onAdvanceSearch
}: ILinkSelectProps): JSX.Element {
    const {t} = useSharedTranslation();

    const [openSelect, setOpenSelect] = useState(tagDisplay);
    const [currentSearch, setCurrentSearch] = useState('');
    const [emptyResults, setEmptyResults] = useState(false);

    const _handleChange = (selection: string[]) => {
        onUpdateSelection(selection);
    };

    const _handleSearch = (value: string) => {
        setCurrentSearch(value);
        const optionsFiltered = options.filter(option => option.label.toLowerCase().includes(value.toLowerCase()));
        setEmptyResults(optionsFiltered.length === 0 && value !== '');
    };

    const dropdownButtons = (menu: ReactNode) => (
        <>
            {menu}
            {(emptyResults || !hideAdvancedSearch) && (
                <>
                    <StyledDivider />
                    <StyledContainer>
                        <KitSpace align="center" direction="vertical" size="xs">
                            {emptyResults && (
                                <KitButton
                                    type="secondary"
                                    icon={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={() => onCreate(currentSearch)}
                                >
                                    {`${t('record_edition.new_record')} "${currentSearch}"`}
                                </KitButton>
                            )}
                            {!hideAdvancedSearch && (
                                <KitButton
                                    type="tertiary"
                                    icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                                    onClick={() => onAdvanceSearch()}
                                >
                                    {t('record_edition.advanced_search')}
                                </KitButton>
                            )}
                        </KitSpace>
                    </StyledContainer>
                </>
            )}
        </>
    );

    return (
        <>
            {tagDisplay ? (
                <KitSelect
                    placeholder={t('record_edition.select')}
                    mode="multiple"
                    defaultValue={defaultValues}
                    options={options}
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                        option?.value?.toString().toLowerCase().includes(input.toLowerCase())
                    }
                    showSearch
                    onChange={value => _handleChange(value)}
                    onSearch={value => _handleSearch(value)}
                    dropdownRender={dropdownButtons}
                />
            ) : (
                <StyledKitSelect
                    open={openSelect}
                    placeholder={t('record_edition.select')}
                    mode="multiple"
                    defaultValue={defaultValues}
                    options={options}
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                        option?.value?.toString().toLowerCase().includes(input.toLowerCase())
                    }
                    showSearch
                    suffixIcon={<div />}
                    allowClear={false}
                    onBlur={() => {
                        setOpenSelect(false);
                    }}
                    onFocus={() => {
                        setOpenSelect(true);
                    }}
                    onChange={value => _handleChange(value)}
                    onSearch={value => _handleSearch(value)}
                    dropdownRender={dropdownButtons}
                />
            )}
        </>
    );
}

export default LinkSelect;
