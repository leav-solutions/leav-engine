// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass, faPlus} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitDivider, KitSelect, KitSpace} from 'aristid-ds';
import styled from 'styled-components';
import {useEffect, useRef, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IKitOption} from 'aristid-ds/dist/Kit/DataEntry/Select/types';

interface ILinkSelectProps {
    tagDisplay: boolean;
    options: IKitOption[];
    defaultValues: string[];
    hideAdvancedSearch?: boolean;
    onUpdateSelection?: (value: string[]) => void;
    onCreate?: (value: string) => void;
    onBlur?: (itemsToLink: Set<string>, itemsToDelete: Set<string>) => void;
    onParentDeselect?: (itemId: string) => any;
    onAdvanceSearch?: () => void;
}

const StyledDivider = styled(KitDivider)`
    margin: calc(var(--general-spacing-xs) * 1px);
`;

const StyledContainer = styled.div`
    display: flex;
    justify-content: center;
`;

const StyledLinkSelect = styled(KitSelect)`
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
    onUpdateSelection = () => null,
    onCreate = () => null,
    onBlur = (itemsToLink: Set<string>, itemsToDelete: Set<string>) => null,
    onAdvanceSearch = () => null
}: ILinkSelectProps): JSX.Element {
    const {t} = useSharedTranslation();

    const [itemsToLink, setItemToLink] = useState(new Set<string>());
    const [itemsToDelete, setItemToDelete] = useState(new Set<string>());

    const dropdownRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentSearch, setCurrentSearch] = useState('');
    const [emptyResults, setEmptyResults] = useState(false);

    useEffect(() => {
        if (!tagDisplay) {
            setIsOpen(true);
        }
    }, [tagDisplay]);

    const _handleChange = (selection: string[]) => {
        onUpdateSelection(selection);
    };

    const _handleSearch = (value: string) => {
        setCurrentSearch(value);
        const optionsFiltered = options.filter(option => option.label.toLowerCase().includes(value.toLowerCase()));
        const isEmptyResults = optionsFiltered.length === 0 && value !== '';
        setEmptyResults(isEmptyResults);
    };

    const onCreateClicked = () => {
        onCreate(currentSearch);
    };

    const _onBlur = () => {
        onBlur(itemsToLink, itemsToDelete);
        setIsOpen(false);
    };

    const _onSelect = (itemId: string) => {
        // remove itemToDelete if exists
        itemsToDelete.delete(itemId);
        itemsToLink.add(itemId);
    };

    const _onDeselect = (itemId: any) => {
        // if we had an item in select, we don't need to delete it
        // because the link has not been created yet
        if (itemsToLink.has(itemId)) {
            // Remove item to link if exists
            itemsToLink.delete(itemId);
            return;
        }

        itemsToDelete.add(itemId);
    };

    const dropdownButtons = (menu: React.ReactNode) => (
        <div className="dropdown-custom" ref={dropdownRef}>
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
                                    onClick={onCreateClicked}
                                    // @ts-ignore: required to avoid the click propagation that will automatically close the dropdown modal
                                    onMouseDown={e => e.preventDefault()}
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
        </div>
    );

    return (
        <StyledLinkSelect
            className={tagDisplay ? '' : 'select-without-tags'}
            placeholder={t('record_edition.select')}
            mode="multiple"
            open={isOpen}
            defaultValue={defaultValues}
            options={options}
            optionFilterProp="label"
            filterOption={(input, option) => option?.value?.toString().toLowerCase().includes(input.toLowerCase())}
            showSearch
            onChange={value => _handleChange(value)}
            onSearch={value => _handleSearch(value)}
            onBlur={_onBlur}
            onFocus={() => setIsOpen(true)}
            onDeselect={_onDeselect}
            onSelect={_onSelect}
            dropdownRender={dropdownButtons}
            autoFocus={!tagDisplay}
            suffixIcon={tagDisplay ? '' : <div />}
            allowClear={tagDisplay}
        />
    );
}

export default LinkSelect;
