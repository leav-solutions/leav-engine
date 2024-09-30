// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApplicationTypes, IApplication} from '../../_types/application';

export const mockApplication: MandatoryId<IApplication> = {
    id: 'test_application',
    type: ApplicationTypes.INTERNAL,
    system: true,
    label: {fr: 'Test'},
    endpoint: 'my-application',
    description: {fr: 'Super application'},
    settings: {libraries: ['products', 'categories'], trees: ['files', 'categories']},
    color: 'orange',
    icon: {
        id: '123456'
    },
    module: 'data-studio'
};

export const mockApplicationExternal: IApplication = {
    id: 'test_application',
    type: ApplicationTypes.EXTERNAL,
    system: true,
    label: {fr: 'Test'},
    endpoint: 'http://example.com',
    description: {fr: 'Super application'},
    color: 'orange',
    icon: {
        id: '123456'
    },
    module: ''
};
