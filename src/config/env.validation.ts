import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  MONGO_URI: Joi.string().uri({ scheme: ['mongodb', 'mongodb+srv'] }).required(),
  CORS_ORIGINS: Joi.string().required(),
});
