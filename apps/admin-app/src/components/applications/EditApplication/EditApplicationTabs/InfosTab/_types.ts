// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';

export type ApplicationInfosFormValues = Override<
    Omit<GET_APPLICATION_BY_ID_applications_list, 'permissions'>,
    {libraries: string[]; trees: string[]}
>;
