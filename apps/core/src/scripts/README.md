# Core Scripts

This directory contains utility scripts for the core application.

## addCampaignOnStartup.ts

This script adds a demo campaign to the database when the core is starting in SERVER mode and attaches it to a specified
PAC.

### What it does

- Checks if the campaigns collection exists
- Checks if a campaign with the label "Demo Campaign" already exists to avoid duplicates
- Creates a new campaign with basic attributes if it doesn't exist
- Attempts to attach the created campaign to a PAC with ID 5006773
- Handles error cases such as when the PAC collection doesn't exist or the PAC with the specified ID doesn't exist

### How it works

The script is automatically called during the core startup process in SERVER mode, after plugins are initialized and
before the server starts.

### Customization

You can modify the script to change the campaign properties or add more complex logic:

1. Open `/home/steven/Projects/aristid/leav-engine/apps/core/src/scripts/addCampaignOnStartup.ts`
2. Modify the campaign properties in the `campaignData` object
3. Change the PAC ID (currently hardcoded as '5006773') to attach the campaign to a different PAC
4. Add additional logic as needed

### Manual execution

If you need to run the script manually, you can add a CLI command or call it from another part of the codebase by
importing the function:

```typescript
import {addCampaignOnStartup} from './scripts/addCampaignOnStartup';

// Then call it with a database connection
await addCampaignOnStartup(db);
```
