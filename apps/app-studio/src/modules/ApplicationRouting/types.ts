// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type * as z from 'zod/v4';
import {type ItemActionsSchema, type LibraryExplorerPropsSchema} from '_ui/hooks/useIFrameMessenger/schema';
import {type ApplicationSchema} from './schema';

export type LibraryExplorerProps = z.infer<typeof LibraryExplorerPropsSchema>;

export type ItemActions = z.infer<typeof ItemActionsSchema>;

export type Application = z.infer<typeof ApplicationSchema>;
