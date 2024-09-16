// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useContext} from 'react';
import {EditRecordModalContext} from '_ui/components/LibraryItemsList/LibraryItemsListTable/EditRecordModalContext';
export const useEditRecordModalContext = () => useContext(EditRecordModalContext);
