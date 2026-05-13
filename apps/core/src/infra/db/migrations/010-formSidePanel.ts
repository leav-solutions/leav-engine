import {type IMigration} from '../../../_types/migration';
import {type IFormRepo} from '../../form/formRepo';
import {type IFormStrict} from '../../../_types/forms';

interface IDeps {
    'core.infra.form'?: IFormRepo;
    config?: any;
}

export default function ({'core.infra.form': formRepo}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const forms = await formRepo.getForms({ctx});
            await Promise.all(
                forms.list.map(form => {
                    form.sidePanel = form.sidePanel ?? {
                        enable: true,
                        isOpenByDefault: true,
                    };
                    return formRepo.updateForm({formData: form as IFormStrict, ctx});
                }),
            );
        },
    };
}
