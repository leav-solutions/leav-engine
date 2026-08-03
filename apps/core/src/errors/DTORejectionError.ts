import {type IDTOErrorDetail} from '../_types/dto';
import {type ErrorFieldDetail, ErrorTypes} from '../_types/errors';
import LeavError from './LeavError';

/**
 * Functional rejection of a DTO import operation: the message was understood but the operation cannot
 * be applied (missing mandatory attribute, unknown payload type, invalid document…).
 *
 * Such a rejection is a *processed* message, not a failure of the consumer: it is acked and answered
 * with an `ERROR` statement, whose `details` array is exactly what `details` holds here (see the
 * SDO/DTO RabbitMQ contract §4). Any other error is a technical failure and must keep bubbling up so
 * the message gets nacked.
 */
export default class DTORejectionError extends LeavError<unknown> {
    public details: IDTOErrorDetail[];

    public constructor(details: IDTOErrorDetail[], message?: string) {
        super(ErrorTypes.VALIDATION_ERROR, message ?? DTORejectionError.buildMessage(details), {
            // Mirrored into `fields` to stay consistent with the error shape of the other LEAV errors
            // reported in the DTO error log.
            fields: details.reduce((acc: ErrorFieldDetail<unknown>, detail) => {
                acc[detail.attribute ?? detail.code] = detail.message;
                return acc;
            }, {} as ErrorFieldDetail<unknown>),
        });

        this.details = details;
    }

    private static buildMessage(details: IDTOErrorDetail[]): string {
        return `[dtoImport]: operation rejected (${details
            .map(({code, attribute}) => (attribute ? `${code} on ${attribute}` : code))
            .join(', ')})`;
    }
}
