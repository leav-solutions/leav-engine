import scan from './scan';
import automate from './automate';

(async function() {
    const fsTree = await scan.filesystem();
    const dbTree = await scan.database();
    automate(fsTree, dbTree);
})().catch(e => console.error(e));
