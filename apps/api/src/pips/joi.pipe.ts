import {
  Optional,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'

import { AnySchema } from 'joi'
import { joi } from 'joiful'
import { Constructor, getJoiSchema } from 'joiful/core'

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  schema?: AnySchema | null

  constructor(@Optional() schema?: AnySchema | Constructor<any>) {
    this.schema = this.toSchema(schema)
  }

  transform(data: any, metadata: ArgumentMetadata) {
    const schema = this.toSchema(this.schema || (metadata.metatype as Constructor<any>))
    if (schema) {
      const result = schema.validate(data, {
        debug: true,
      })
      const error = result.error
      if (error) {
        throw new BadRequestException(error.message, 'Validation Failed')
      }
      return result.value
    }

    return data
  }

  toSchema(schema?: AnySchema | Constructor<any>): undefined | AnySchema {
    if (!schema) return void 0
    return joi.isSchema(schema)
      ? (schema as AnySchema)
      : getJoiSchema(schema as Constructor<any>, joi)
  }
}
