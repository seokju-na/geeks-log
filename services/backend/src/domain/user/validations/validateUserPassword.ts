import * as Joi from '@hapi/joi';

const schema = Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/);

export default function validateUserPassword(password: string): boolean {
  const { error } = Joi.validate(password, schema);

  return error === null;
}
