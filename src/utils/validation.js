/**
 * Shared frontend validation utilities.
 * Returns an errors object — empty means valid.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;
const USERNAME_REGEX = /^[a-zA-Z0-9_\s]+$/;

/**
 * Validates login form fields.
 * @param {{ email: string, password: string }} values
 * @returns {Record<string, string>} errors
 */
export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};

/**
 * Validates registration form fields.
 * @param {{ username: string, email: string, password: string }} values
 * @returns {Record<string, string>} errors
 */
export const validateRegister = ({ username, email, password }) => {
  const errors = {};

  if (!username?.trim()) {
    errors.username = "Full name is required";
  } else if (username.trim().length < 3) {
    errors.username = "Full name must be at least 3 characters long";
  } else if (!USERNAME_REGEX.test(username)) {
    errors.username = "Full name can only contain letters, numbers, spaces, and underscores";
  }

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (!PASSWORD_SPECIAL.test(password)) {
    errors.password = "Password must contain at least one special character";
  }

  return errors;
};

/**
 * Validates product form fields.
 * @param {{ name: string, price: string|number, category: string, subCategory: string, stock: string|number }} values
 * @returns {Record<string, string>} errors
 */
export const validateProduct = ({ name, price, category, subCategory, stock }) => {
  const errors = {};

  if (!name?.trim()) {
    errors.name = "Product name is required";
  }

  if (price === "" || price === undefined || price === null) {
    errors.price = "Price is required";
  } else if (isNaN(Number(price)) || Number(price) < 0) {
    errors.price = "Price must be a non-negative number";
  }

  if (!category) {
    errors.category = "Category is required";
  }

  if (!subCategory) {
    errors.subCategory = "Sub-category is required";
  }

  if (stock !== "" && stock !== undefined && stock !== null) {
    if (isNaN(Number(stock)) || Number(stock) < 0) {
      errors.stock = "Stock must be a non-negative number";
    }
  }

  return errors;
};

/**
 * Validates a shipping address form.
 * @param {{ street: string, city: string, state: string, zipCode: string, country: string }} values
 * @returns {Record<string, string>} errors
 */
export const validateAddress = ({ street, city, state, zipCode, country }) => {
  const errors = {};

  if (!street?.trim()) errors.street = "Street address is required";
  if (!city?.trim()) errors.city = "City is required";
  if (!state?.trim()) errors.state = "State is required";
  if (!zipCode?.trim()) errors.zipCode = "ZIP code is required";
  if (!country?.trim()) errors.country = "Country is required";

  return errors;
};

/**
 * Returns true if the errors object has no keys (i.e. the form is valid).
 */
export const isValid = (errors) => Object.keys(errors).length === 0;
