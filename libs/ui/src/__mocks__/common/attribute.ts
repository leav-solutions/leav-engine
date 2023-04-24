// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, AttributeType, GetAttributesQuery, LibraryAttributesFragment} from '../../_gqlTypes';

export const mockLibraryAttribute: LibraryAttributesFragment = {
    id: 'my_attribute',
    type: AttributeType.simple,
    format: AttributeFormat.text,
    label: {
        fr: 'Mon attribut',
        en: 'My attribute'
    },
    system: false
};

export const mockAttributeSimple: GetAttributesQuery['attributes']['list'][0] = {
    id: 'my_attribute',
    label: {
        fr: 'Mon attribut',
        en: 'My attribute'
    }
};
