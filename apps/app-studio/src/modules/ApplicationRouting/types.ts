import type * as z from 'zod/v4';
import {type ExplorerPropsSchema, type ItemActionsSchema} from '_ui/hooks/useIFrameMessenger/schema';
import {type ApplicationSchema} from './schema';

export type ExplorerProps = z.infer<typeof ExplorerPropsSchema>;

export type ItemActions = z.infer<typeof ItemActionsSchema>;

export type Application = z.infer<typeof ApplicationSchema>;
