// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormUIElementTypes,IFormTabsSettings,localizedTranslation,TabsDirection} from '@leav/utils';
import {Tabs} from 'antd';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {useLang} from '_ui/hooks';
import {FormElementTypes} from '_ui/_gqlTypes';
import {formComponents} from '..';
import {FormElement,IFormElementProps} from '../../_types';

const StyledTabs = styled(Tabs)`
    && {
        padding: 1rem;
        border: 1px solid ${themeVars.borderLightColor};
        margin: 1rem 0;
        border-radius: 3px;
        overflow: visible;
    }
`;

function FormTabs({element, ...elementProps}: IFormElementProps<IFormTabsSettings>): JSX.Element {
    const {lang} = useLang();
    const tabPosition = element.settings.direction === TabsDirection.VERTICAL ? 'left' : 'top';

    const tabItems = element.settings.tabs.map(tab => {
        const tabContainer: FormElement<{}> = {
            id: `${element.id}/${tab.id}`,
            containerId: element.id,
            settings: {},
            attribute: null,
            type: FormElementTypes.layout,
            uiElement: formComponents[FormUIElementTypes.FIELDS_CONTAINER],
            uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
            valueError: null,
            values: null
        };

        return {
            label: localizedTranslation(tab.label, lang),
            key: tab.id,
            children: <tabContainer.uiElement {...elementProps} element={tabContainer} />
        };
    });

    return <StyledTabs tabPosition={tabPosition} data-testid="form-tabs" items={tabItems} />;
}

export default FormTabs;
