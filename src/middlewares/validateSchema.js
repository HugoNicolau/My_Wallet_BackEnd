export default function validateSchema(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.send(errors).status(422);
      return;
    }
    next();
  };
}
