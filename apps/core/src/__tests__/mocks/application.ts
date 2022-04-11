// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IApplication} from '../../_types/application';

export const mockApplication: IApplication = {
    id: 'test_application',
    system: true,
    label: {fr: 'Test'},
    endpoint: 'my-application',
    description: {fr: 'Super application'},
    libraries: ['products', 'categories'],
    color: 'orange',
    icon: 'some-icon',
    component: 'explorer'
};
