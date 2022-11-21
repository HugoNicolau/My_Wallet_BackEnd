import joi from "joi";

const balanceSchema = joi.object({
  description: joi.string().required().min(2).max(30),
  value: joi.number().required(),
  type: joi.string().valid('income','outcome').required(),
  date: joi.string().required()
});
export default balanceSchema;
