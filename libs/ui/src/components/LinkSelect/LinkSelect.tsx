// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass, faPlus} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitDivider, KitLoader, KitSelect, KitSpace} from 'aristid-ds';
import styled from 'styled-components';
import {ComponentProps, useEffect, useRef, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useDebouncedValue} from '_ui/hooks/useDebouncedValue';
import {IKitOption} from 'aristid-ds/dist/Kit/DataEntry/Select/types';
import {FaChevronDown} from 'react-icons/fa';

interface IValuesListConf {
    enable: boolean;
    values?: object[];
    allowFreeEntry?: boolean;
    allowListUpdate?: boolean;
}

interface ILinkSelectProps {
    tagDisplay: boolean;
    options: IKitOption[];
    linkedIds: string[];
    hideAdvancedSearch?: boolean;
    onUpdateSelection?: (value: string[]) => void;
    onClickCreateButton?: (value: string) => void;
    onItemsToUpdate?: (itemsToLink: Set<string>, itemsToDelete: Set<string>) => void;
    onParentDeselect?: (itemId: string) => any;
    onAdvanceSearch?: () => void;
    onSearch?: (searchValue: string) => Promise<void>;
    onClose?: () => void;
    canSelectMultipleValues: boolean;
    valueListConf: IValuesListConf;
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
    linkedIds,
    hideAdvancedSearch = false,
    onClickCreateButton,
    onItemsToUpdate,
    onAdvanceSearch,
    onSearch,
    onClose,
    canSelectMultipleValues,
    valueListConf
}: ILinkSelectProps): JSX.Element {
    const {t} = useSharedTranslation();

    const itemsToLink = useRef(new Set<string>());
    const itemsToDelete = useRef(new Set<string>());

    const [defaultValues, setDefaultValues] = useState([]);

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
            setEmptyResults(options.length === 0);
        }
    }, [options, debouncedSearch]);

    useEffect(() => {
        setDefaultValues(linkedIds);
    }, [linkedIds]);

    const _handleSearch: ComponentProps<typeof KitSelect>['onSearch'] = (value: string) => {
        setIsLoading(true);
        setCurrentSearch(value);
    };

    const _onClickCreateButton: ComponentProps<typeof KitButton>['onClick'] = () => {
        onClickCreateButton?.(debouncedSearch);
    };

    const _onBlur: ComponentProps<typeof KitSelect>['onBlur'] = async () => {
        await onItemsToUpdate?.(itemsToLink.current, itemsToDelete.current);
        itemsToLink.current.clear();
        itemsToDelete.current.clear();
        setIsOpen(false);
        onClose();
    };

    const _onSelect: ComponentProps<typeof KitSelect>['onSelect'] = async (itemId: string) => {
        // Add item to defaultValues
        setDefaultValues(prev => [...prev, itemId]);

        itemsToLink.current.add(itemId);
        itemsToDelete.current.delete(itemId);

        if (!canSelectMultipleValues) {
            setDefaultValues([itemId]);
            setIsOpen(false);
            await onItemsToUpdate(itemsToLink.current, itemsToDelete.current);
            itemsToLink.current.clear();
            itemsToDelete.current.clear();
        }
    };

    const _onDeselect: ComponentProps<typeof KitSelect>['onDeselect'] = async (itemId: any) => {
        // Always remove item from defaultValues
        setDefaultValues(prev => prev.filter(v => v !== itemId));

        // Always remove from itemsToLink if it exists there
        itemsToLink.current.delete(itemId);

        // Always add to itemsToDelete
        itemsToDelete.current.add(itemId);

        // For single selection or tag display with single selection, update immediately
        if (!canSelectMultipleValues) {
            if (tagDisplay) {
                setIsOpen(false);
            }

            await onItemsToUpdate(itemsToLink.current, itemsToDelete.current);
            itemsToLink.current.clear();
            itemsToDelete.current.clear();
        } else {
            if (tagDisplay) {
                // For tags we can deselect with tags, we need to send the udpate before the onBlur
                await onItemsToUpdate(itemsToLink.current, itemsToDelete.current);
                itemsToLink.current.clear();
                itemsToDelete.current.clear();
            }
        }
    };

    const _onClear: ComponentProps<typeof KitSelect>['onClear'] = async () => {
        itemsToLink.current.clear();
        defaultValues.map(v => itemsToDelete.current.add(v));
        await onItemsToUpdate(itemsToLink.current, itemsToDelete.current);
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
                                {!hideAdvancedSearch && !valueListConf?.enable && (
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
            placeholder={t('record_edition.select')}
            mode={canSelectMultipleValues ? 'multiple' : undefined}
            open={isOpen}
            defaultValue={defaultValues}
            value={defaultValues}
            options={options}
            optionFilterProp="label"
            filterOption={false}
            showSearch
            onSearch={_handleSearch}
            onBlur={_onBlur}
            onFocus={() => setIsOpen(true)}
            onDeselect={_onDeselect}
            onSelect={_onSelect}
            onClear={_onClear}
            dropdownRender={dropdownButtons}
            autoFocus={!tagDisplay}
            allowClear={tagDisplay}
            suffixIcon={tagDisplay ? <FaChevronDown /> : <div />}
        />
    );
}

export default LinkSelect;
