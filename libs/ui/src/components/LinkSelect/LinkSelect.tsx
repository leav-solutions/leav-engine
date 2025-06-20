// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass, faPlus} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitDivider, KitLoader, KitSelect, KitSpace} from 'aristid-ds';
import styled from 'styled-components';
import {ComponentProps, useEffect, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useDebouncedValue} from '_ui/hooks/useDebouncedValue';
import {IKitOption} from 'aristid-ds/dist/Kit/DataEntry/Select/types';
import {FaChevronDown} from 'react-icons/fa';

interface ILinkSelectProps {
    tagDisplay: boolean;
    options: IKitOption[];
    defaultValues: string[];
    hideAdvancedSearch?: boolean;
    onUpdateSelection?: (value: string[]) => void;
    onClickCreateButton?: (value: string) => void;
    onBlur?: (itemsToLink: Set<string>, itemsToDelete: Set<string>) => void;
    onParentDeselect?: (itemId: string) => any;
    onAdvanceSearch?: () => void;
    onSearch?: (searchValue: string) => Promise<void>;
}

const StyledDivider = styled(KitDivider)`
    margin: calc(var(--general-spacing-xs) * 1px);
`;

const StyledContainer = styled.div`
    display: flex;
    justify-content: center;
`;

const StyledKitSelect = styled(KitSelect)`
    &.select-without-tags {
        .ant-select-selection-overflow-item:not(.ant-select-selection-overflow-item-suffix) {
            display: none;
        }
    }
`;

function LinkSelect({
    tagDisplay,
    options,
    defaultValues,
    hideAdvancedSearch = false,
    onUpdateSelection,
    onClickCreateButton,
    onBlur,
    onAdvanceSearch,
    onSearch
}: ILinkSelectProps): JSX.Element {
    const {t} = useSharedTranslation();

    const [itemsToLink, setItemToLink] = useState(new Set<string>());
    const [itemsToDelete, setItemToDelete] = useState(new Set<string>());

    const [isOpen, setIsOpen] = useState(false);
    const [currentSearch, setCurrentSearch] = useState('');
    const debouncedSearch = useDebouncedValue(currentSearch, 500);
    const [emptyResults, setEmptyResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!tagDisplay) {
            setIsOpen(true);
        }
    }, [tagDisplay]);

    useEffect(() => {
        // Call API search when debounced search value changes
        onSearch?.(debouncedSearch).then(() => {
            setIsLoading(false);
        });
    }, [debouncedSearch]);

    useEffect(() => {
        if (debouncedSearch === '') {
            setEmptyResults(false);
        } else {
            const optionsFiltered = options.filter(option =>
                option.label?.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
            setEmptyResults(optionsFiltered.length === 0);
        }
    }, [options, debouncedSearch]);

    const _handleChange: ComponentProps<typeof KitSelect>['onChange'] = (selection: string[]) => {
        onUpdateSelection?.(selection);
    };

    const _handleSearch: ComponentProps<typeof KitSelect>['onSearch'] = (value: string) => {
        setIsLoading(true);
        setCurrentSearch(value);
    };

    const _onClickCreateButton: ComponentProps<typeof KitButton>['onClick'] = () => {
        onClickCreateButton?.(debouncedSearch);
    };

    const _onBlur: ComponentProps<typeof KitSelect>['onBlur'] = () => {
        onBlur?.(itemsToLink, itemsToDelete);
        setIsOpen(false);
    };

    const _onSelect: ComponentProps<typeof KitSelect>['onSelect'] = (itemId: string) => {
        // remove itemToDelete if exists
        itemsToDelete.delete(itemId);
        itemsToLink.add(itemId);
    };

    const _onDeselect: ComponentProps<typeof KitSelect>['onDeselect'] = (itemId: any) => {
        if (itemsToLink.has(itemId)) {
            // Remove item to link if exists
            itemsToLink.delete(itemId);
            return;
        }

        itemsToDelete.add(itemId);
    };

    const dropdownButtons: ComponentProps<typeof KitSelect>['dropdownRender'] = menu => (
        <div className="dropdown-custom">
            {menu}
            {(emptyResults || !hideAdvancedSearch) && (
                <>
                    <StyledDivider />
                    <StyledContainer>
                        {isLoading ? (
                            <KitLoader />
                        ) : (
                            <KitSpace align="center" direction="vertical" size="xs">
                                {emptyResults && (
                                    <KitButton
                                        type="secondary"
                                        icon={<FontAwesomeIcon icon={faPlus} />}
                                        onClick={_onClickCreateButton}
                                        // @ts-ignore: required to avoid the click propagation that will automatically close the dropdown modal - https://aristid.atlassian.net/browse/DS-339
                                        onMouseDown={e => e.preventDefault()}
                                    >
                                        {`${t('record_edition.new_record')} "${debouncedSearch}"`}
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
                        )}
                    </StyledContainer>
                </>
            )}
        </div>
    );

    return (
        <StyledKitSelect
            className={tagDisplay ? undefined : 'select-without-tags'}
            placeholder={t('record_edition.select')}
            mode="multiple"
            open={isOpen}
            defaultValue={defaultValues}
            options={options}
            optionFilterProp="label"
            filterOption={(input, option) => option?.rawLabel?.toLowerCase().includes(input?.toLowerCase())}
            showSearch
            onChange={_handleChange}
            onSearch={_handleSearch}
            onBlur={_onBlur}
            onFocus={() => setIsOpen(true)}
            onDeselect={_onDeselect}
            onSelect={_onSelect}
            dropdownRender={dropdownButtons}
            autoFocus={!tagDisplay}
            allowClear={tagDisplay}
            suffixIcon={tagDisplay ? <FaChevronDown /> : <div />}
        />
    );
}

export default LinkSelect;
