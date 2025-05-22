// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitDivider, KitSelect} from 'aristid-ds';
import styled from 'styled-components';
import {useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface ILinkSelectProps {
    tagDisplay: boolean;
}

const StyledDivider = styled(KitDivider)`
    margin: calc(var(--general-spacing-xs) * 1px);
`;

const StyledContainer = styled.div`
    display: grid;
    justify-content: center;
`;

const StyledButton = styled(KitButton)`
    justify-content: center;
`;

const StyledKitSelect = styled(KitSelect)`
    .ant-select-selection-overflow-item:not(.ant-select-selection-overflow-item-suffix) {
        display: none;
    }
`;

function LinkSelect({tagDisplay = false}: ILinkSelectProps): JSX.Element {
    const {t} = useSharedTranslation();

    const [openSelect, setOpenSelect] = useState(false);
    const [currentSearch, setCurrentSearch] = useState('');
    const items = [
        {
            value: 'chartreuse jaune',
            label: 'Chartreuse Jaune'
        },
        {
            value: 'chartreuse vep',
            label: 'Chartreuse VEP'
        },
        {
            value: 'chartreuse verte',
            label: 'Chartreuse Verte'
        }
    ];
    const [options, setOptions] = useState(items);
    const [values, setValues] = useState([items[0], items[1]]);

    const _handleChange = (selection: any) => {
        setValues(selection);
        console.log({selection});
    };

    const _handleSearch = (value: string) => {
        setCurrentSearch(value);
        console.log({value});
        if (value === '') {
            setOptions(items);
        } else {
            setOptions(options.filter(item => item.label.toLowerCase().includes(value.toLowerCase())));
        }
        console.log({options});
    };

    const dropdownButtons = (menu: React.ReactNode) => (
        <>
            {menu}
            <StyledDivider />
            <StyledContainer>
                <StyledButton
                    type="secondary"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => console.log(`Creation for ${currentSearch}`)}
                >
                    {`${t('Créer')} "${currentSearch}"`}
                </StyledButton>
                <KitButton type="tertiary" block icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}>
                    {t('Recherche avancée')}
                </KitButton>
            </StyledContainer>
        </>
    );

    return (
        <>
            {tagDisplay ? (
                <StyledKitSelect
                    open={openSelect}
                    placeholder="Select"
                    mode="multiple"
                    defaultValue={values}
                    options={options}
                    optionFilterProp="label"
                    value={values}
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
            ) : (
                <KitSelect
                    open={true}
                    placeholder="Select"
                    mode="multiple"
                    defaultValue={values}
                    options={options}
                    optionFilterProp="label"
                    value={values}
                    showSearch
                    onSearch={value => _handleSearch(value)}
                    onChange={value => _handleChange(value)}
                    dropdownRender={dropdownButtons}
                />
            )}
        </>
    );
}

export default LinkSelect;
