import { body } from "express-validator";

function buildValidators(rules = []) {
  return rules.map((rule) => {
    let validator = body(rule.field);
    let message;

    switch (rule.type) {
      case "isArray":
        validator = validator
          .customSanitizer((value) => {
            if (Array.isArray(value)) {
              return value.filter(
                (item) =>
                  item !== undefined &&
                  item !== null &&
                  String(item).trim() !== "",
              );
            }
            return value;
          })
          .notEmpty()
          .withMessage(
            rule.message ||
              `${rule.field.charAt(0).toUpperCase() + rule.field.slice(1)} is required`,
          )
          .isArray()
          .withMessage(
            rule.message ||
              `${rule.field.charAt(0).toUpperCase() + rule.field.slice(1)} must be an array`,
          )
          .custom((value) => {
            const errors = [];
            value.forEach((item, index) => {
              rule.requiredFields?.forEach((field) => {
                if (
                  item[field] === undefined ||
                  item[field] === null ||
                  item[field] === ""
                ) {
                  errors.push(
                    `${field} is required at ${rule.field}[${index}]`,
                  );
                }
              });
            });
            if (errors.length > 0) {
              throw new Error(errors.join(", "));
            }
            return true;
          });

        break;
      case "status":
        validator = validator
          .optional()
          .customSanitizer((value) => value?.toUpperCase())
          .isIn(["ACTIVE", "INACTIVE"])
          .withMessage("Status must be ACTIVE or INACTIVE");
        break;
      case "gender":
        validator = validator
          .notEmpty()
          .withMessage("Gender is required")
          .bail()
          .isIn(["male", "female", "other"])
          .withMessage("Gender must be 'male', 'female' or 'other'");
        break;
      case "fileRequired":
        validator = validator.custom((value, { req }) => {
          if (!req.file) {
            throw new Error(
              rule.message ||
                `${rule.field.charAt(0).toUpperCase() + rule.field.slice(1)} is required`,
            );
          }
          return true;
        });
        break;
      case "notEmpty":
        message =
          rule.message ||
          `${
            rule.field
              ? rule.field.charAt(0).toUpperCase() + rule.field.slice(1)
              : "Field"
          } is required`;

        validator = validator.trim().notEmpty().withMessage(message);
        break;

      case "length":
        message =
          rule.message ||
          (rule.min == rule.max
            ? `${
                rule.field
                  ? rule.field.charAt(0).toUpperCase() + rule.field.slice(1)
                  : "Field"
              } must be ${rule.min} characters`
            : `${
                rule.field
                  ? rule.field.charAt(0).toUpperCase() + rule.field.slice(1)
                  : "Field"
              } must be between ${rule.min} and ${rule.max} characters`);

        validator = validator
          .isLength({ min: rule.min, max: rule.max })
          .withMessage(message);
        break;

      case "phone":
        validator = validator
          .notEmpty()
          .withMessage("Phone number is required")
          .bail()
          .isMobilePhone("en-IN")
          .withMessage("Invalid phone number");
        break;

      case "email":
        validator = validator
          .notEmpty()
          .withMessage("Email is required")
          .bail()
          .isEmail()
          .withMessage("Invalid email");
        break;

      case "date":
        message = rule.message || "Date must be in yyyy-mm-dd format";

        validator = validator
          .notEmpty()
          .withMessage("Date is required")
          .bail()
          .matches(/^\d{4}-\d{2}-\d{2}$/)
          .withMessage(message);
        break;

      default:
        throw new Error(`Unknown validation type: ${rule.type}`);
    }

    return validator;
  });
}

export default buildValidators;
