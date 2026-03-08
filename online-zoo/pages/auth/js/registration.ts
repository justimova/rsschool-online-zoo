import { AuthStorage } from "../../../src/shared/app/services/auth-storage";
import { createAuthService, } from "../../../src/shared/app/services/auth.service";
import type { IAuthService } from "../../../src/shared/app/services/auth.service";
import type { IAuthResponse, TRegisterPayload } from "../../../src/shared/auth/auth.types";

interface IFieldRefs {
  field: HTMLElement;
  input: HTMLInputElement;
  error: HTMLElement;
}

interface IRegistrationElements {
  registerButton: HTMLButtonElement;
  formErrorElement: HTMLElement;
  login: IFieldRefs;
  password: IFieldRefs;
  confirmPassword: IFieldRefs;
  name: IFieldRefs;
  email: IFieldRefs;
}

interface IValidationResult {
  isValid: boolean;
  message: string;
}

function getFieldRefs(
  fieldId: string,
  inputId: string,
  errorId: string
): IFieldRefs | null {
  const field: HTMLElement | null = document.getElementById(fieldId);
  const input: HTMLElement | null = document.getElementById(inputId);
  const error: HTMLElement | null = document.getElementById(errorId);

  if (!(field instanceof HTMLElement)) {
    return null;
  }

  if (!(input instanceof HTMLInputElement)) {
    return null;
  }

  if (!(error instanceof HTMLElement)) {
    return null;
  }

  return { field, input, error };
}

function getRegistrationElements(): IRegistrationElements | null {
  const registerButton: HTMLElement | null = document.getElementById('register-button');

  if (!(registerButton instanceof HTMLButtonElement)) {
    return null;
  }

  const formErrorElement: HTMLElement | null = document.getElementById('form-error');

  if (!(formErrorElement instanceof HTMLElement)) {
    return null;
  }
  
  const login: IFieldRefs | null = getFieldRefs('login-field', 'login-input', 'login-error');
  const password: IFieldRefs | null = getFieldRefs('password-field', 'password-input', 'password-error');
  const confirmPassword: IFieldRefs | null = getFieldRefs(
    'confirm-password-field',
    'confirm-password-input',
    'confirm-password-error'
  );
  const name: IFieldRefs | null = getFieldRefs('name-field', 'name-input', 'name-error');
  const email: IFieldRefs | null = getFieldRefs('email-field', 'email-input', 'email-error');

  if (login === null || password === null || confirmPassword === null || name === null || email === null) {
    return null;
  }

  return {
    registerButton,
    formErrorElement,
    login,
    password,
    confirmPassword,
    name,
    email
  };
}

function clearFieldError(fieldRefs: IFieldRefs): void {
  fieldRefs.field.classList.remove('error');
  fieldRefs.error.textContent = '';
}

function setFieldError(fieldRefs: IFieldRefs, message: string): void {
  fieldRefs.field.classList.add('error');
  fieldRefs.error.textContent = message;
}

function isEmailValid(email: string): boolean {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function hasSpecialCharacter(password: string): boolean {
  const specialCharacterRegex: RegExp = /[^A-Za-z0-9]/;
  return specialCharacterRegex.test(password);
}

function validateLogin(value: string): IValidationResult {
  const trimmedValue: string = value.trim();

  if (trimmedValue.length === 0) {
    return { isValid: false, message: 'Login is required.' };
  }

  if (!/^[A-Za-z][A-Za-z]{2,}$/.test(trimmedValue)) {
    return {
      isValid: false,
      message: 'Login must start with a letter, contain only English letters, and be at least 3 characters long.'
    };
  }

  return { isValid: true, message: '' };
}

function validatePassword(value: string): IValidationResult {
  if (value.length === 0) {
    return { isValid: false, message: 'Password is required.' };
  }

  if (value.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
  }

  if (!hasSpecialCharacter(value)) {
    return { isValid: false, message: 'Password must contain at least 1 special character.' };
  }

  return { isValid: true, message: '' };
}

function validateConfirmPassword(password: string, confirmPassword: string): IValidationResult {
  if (confirmPassword.length === 0) {
    return { isValid: false, message: 'Confirm Password is required.' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match.' };
  }

  return { isValid: true, message: '' };
}

function validateName(value: string): IValidationResult {
  const trimmedValue: string = value.trim();

  if (trimmedValue.length === 0) {
    return { isValid: false, message: 'Name is required.' };
  }

  if (!/^[A-Za-z]{3,}$/.test(trimmedValue)) {
    return {
      isValid: false,
      message: 'Name must contain only English letters and be at least 3 characters long.'
    };
  }

  return { isValid: true, message: '' };
}

function validateEmail(value: string): IValidationResult {
  const trimmedValue: string = value.trim();

  if (trimmedValue.length === 0) {
    return { isValid: false, message: 'Email is required.' };
  }

  if (!isEmailValid(trimmedValue)) {
    return { isValid: false, message: 'Email is invalid.' };
  }

  return { isValid: true, message: '' };
}

function validateFieldByName(
  fieldName: 'login' | 'password' | 'confirmPassword' | 'name' | 'email',
  elements: IRegistrationElements
): IValidationResult {
  switch (fieldName) {
    case 'login':
      return validateLogin(elements.login.input.value);
    case 'password':
      return validatePassword(elements.password.input.value);
    case 'confirmPassword':
      return validateConfirmPassword(
        elements.password.input.value,
        elements.confirmPassword.input.value
      );
    case 'name':
      return validateName(elements.name.input.value);
    case 'email':
      return validateEmail(elements.email.input.value);
  }
}

function showFieldValidation(
  fieldName: 'login' | 'password' | 'confirmPassword' | 'name' | 'email',
  elements: IRegistrationElements
): boolean {
  const result: IValidationResult = validateFieldByName(fieldName, elements);
  const fieldRefs: IFieldRefs = elements[fieldName];

  if (result.isValid) {
    clearFieldError(fieldRefs);
    return true;
  }

  setFieldError(fieldRefs, result.message);
  return false;
}

function isFormValid(elements: IRegistrationElements): boolean {
  const loginResult: IValidationResult = validateLogin(elements.login.input.value);
  const passwordResult: IValidationResult = validatePassword(elements.password.input.value);
  const confirmPasswordResult: IValidationResult = validateConfirmPassword(
    elements.password.input.value,
    elements.confirmPassword.input.value
  );
  const nameResult: IValidationResult = validateName(elements.name.input.value);
  const emailResult: IValidationResult = validateEmail(elements.email.input.value);

  return (
    loginResult.isValid &&
    passwordResult.isValid &&
    confirmPasswordResult.isValid &&
    nameResult.isValid &&
    emailResult.isValid
  );
}

function updateRegisterButtonState(elements: IRegistrationElements): void {
  elements.registerButton.disabled = !isFormValid(elements);
}

function bindFieldValidation(
  fieldName: 'login' | 'password' | 'confirmPassword' | 'name' | 'email',
  elements: IRegistrationElements
): void {
  const fieldRefs: IFieldRefs = elements[fieldName];

  fieldRefs.input.addEventListener('blur', (): void => {
    showFieldValidation(fieldName, elements);

    if (fieldName === 'password' && elements.confirmPassword.input.value.length > 0) {
      showFieldValidation('confirmPassword', elements);
    }

    updateRegisterButtonState(elements);
  });

  fieldRefs.input.addEventListener('focus', (): void => {
    clearFieldError(fieldRefs);
  });

  fieldRefs.input.addEventListener('input', (): void => {
    if (fieldName === 'password' && elements.confirmPassword.input.value.length > 0) {
      clearFieldError(elements.confirmPassword);
    }

    updateRegisterButtonState(elements);
  });
}

function getRegisterPayload(elements: IRegistrationElements): TRegisterPayload {
  return {
    login: elements.login.input.value.trim(),
    password: elements.password.input.value,
    name: elements.name.input.value.trim(),
    email: elements.email.input.value.trim()
  };
}

async function handleRegister(
  elements: IRegistrationElements,
  authService: IAuthService,
  authStorage: AuthStorage
): Promise<void> {
  const loginValid: boolean = showFieldValidation('login', elements);
  const passwordValid: boolean = showFieldValidation('password', elements);
  const confirmPasswordValid: boolean = showFieldValidation('confirmPassword', elements);
  const nameValid: boolean = showFieldValidation('name', elements);
  const emailValid: boolean = showFieldValidation('email', elements);

  updateRegisterButtonState(elements);

  elements.formErrorElement.hidden = true;
  elements.formErrorElement.textContent = '';

  if (!loginValid || !passwordValid || !confirmPasswordValid || !nameValid || !emailValid) {
    return;
  }

  try {
    const payload: TRegisterPayload = getRegisterPayload(elements);

    elements.registerButton.disabled = true;
    elements.registerButton.textContent = 'Registering...';

    const response: IAuthResponse = await authService.register(payload);

    authStorage.setSession(response.data.access_token, response.data.user);
    window.location.href = '/online-zoo/pages/landing/index.html';

  } catch (error: unknown) {
    elements.formErrorElement.hidden = false;
    elements.formErrorElement.textContent = error instanceof Error ? error.message : String(error);
  }
  elements.registerButton.disabled = false;
  elements.registerButton.textContent = 'Register';
}

function initRegistrationPage(): void {
  const elements: IRegistrationElements | null = getRegistrationElements();

  if (elements === null) {
    return;
  }

  const authService: IAuthService = createAuthService();
  const authStorage: AuthStorage = new AuthStorage();

  bindFieldValidation('login', elements);
  bindFieldValidation('password', elements);
  bindFieldValidation('confirmPassword', elements);
  bindFieldValidation('name', elements);
  bindFieldValidation('email', elements);

  updateRegisterButtonState(elements);

  elements.registerButton.addEventListener('click', (): void => {
    void handleRegister(elements, authService, authStorage);
  });
}

document.addEventListener('DOMContentLoaded', (): void => {
  initRegistrationPage();
});


// interface IRegisterPayload {
//   login: string;
//   password: string;
//   name: string;
//   email: string;
// }

// interface IRegistrationElements {
//   registerButton: HTMLAnchorElement;
//   loginInput: HTMLInputElement;
//   passwordInput: HTMLInputElement;
//   confirmPasswordInput: HTMLInputElement;
//   nameInput: HTMLInputElement;
//   emailInput: HTMLInputElement;
//   loginField: HTMLElement;
//   passwordField: HTMLElement;
//   confirmPasswordField: HTMLElement;
//   nameField: HTMLElement;
//   emailField: HTMLElement;
//   loginError: HTMLElement;
//   passwordError: HTMLElement;
//   confirmPasswordError: HTMLElement;
//   nameError: HTMLElement;
//   emailError: HTMLElement;
// }

// function getRegistrationElements(): IRegistrationElements | null {
//   const registerButton: HTMLElement | null = document.getElementById('register-button');
//   const loginInput: HTMLElement | null = document.getElementById('login-input');
//   const passwordInput: HTMLElement | null = document.getElementById('password-input');
//   const confirmPasswordInput: HTMLElement | null = document.getElementById('confirm-password-input');
//   const nameInput: HTMLElement | null = document.getElementById('name-input');
//   const emailInput: HTMLElement | null = document.getElementById('email-input');

//   const loginField: HTMLElement | null = document.getElementById('login-field');
//   const passwordField: HTMLElement | null = document.getElementById('password-field');
//   const confirmPasswordField: HTMLElement | null = document.getElementById('confirm-password-field');
//   const nameField: HTMLElement | null = document.getElementById('name-field');
//   const emailField: HTMLElement | null = document.getElementById('email-field');

//   const loginError: HTMLElement | null = document.getElementById('login-error');
//   const passwordError: HTMLElement | null = document.getElementById('password-error');
//   const confirmPasswordError: HTMLElement | null = document.getElementById('confirm-password-error');
//   const nameError: HTMLElement | null = document.getElementById('name-error');
//   const emailError: HTMLElement | null = document.getElementById('email-error');

//   if (!(registerButton instanceof HTMLAnchorElement)) {
//     return null;
//   }

//   if (!(loginInput instanceof HTMLInputElement)) {
//     return null;
//   }

//   if (!(passwordInput instanceof HTMLInputElement)) {
//     return null;
//   }

//   if (!(confirmPasswordInput instanceof HTMLInputElement)) {
//     return null;
//   }

//   if (!(nameInput instanceof HTMLInputElement)) {
//     return null;
//   }

//   if (!(emailInput instanceof HTMLInputElement)) {
//     return null;
//   }

//   if (!(loginField instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(passwordField instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(confirmPasswordField instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(nameField instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(emailField instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(loginError instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(passwordError instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(confirmPasswordError instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(nameError instanceof HTMLElement)) {
//     return null;
//   }

//   if (!(emailError instanceof HTMLElement)) {
//     return null;
//   }

//   return {
//     registerButton,
//     loginInput,
//     passwordInput,
//     confirmPasswordInput,
//     nameInput,
//     emailInput,
//     loginField,
//     passwordField,
//     confirmPasswordField,
//     nameField,
//     emailField,
//     loginError,
//     passwordError,
//     confirmPasswordError,
//     nameError,
//     emailError
//   };
// }

// function clearFieldError(field: HTMLElement, errorElement: HTMLElement): void {
//   field.classList.remove('error');
//   errorElement.textContent = '';
// }

// function setFieldError(field: HTMLElement, errorElement: HTMLElement, message: string): void {
//   field.classList.add('error');
//   errorElement.textContent = message;
// }

// function clearAllErrors(elements: IRegistrationElements): void {
//   clearFieldError(elements.loginField, elements.loginError);
//   clearFieldError(elements.passwordField, elements.passwordError);
//   clearFieldError(elements.confirmPasswordField, elements.confirmPasswordError);
//   clearFieldError(elements.nameField, elements.nameError);
//   clearFieldError(elements.emailField, elements.emailError);
// }

// function isEmailValid(email: string): boolean {
//   const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// }

// function isLoginValid(login: string): boolean {
//   const loginRegex: RegExp = /^[A-Za-z][A-Za-z]{2,}$/;
//   return loginRegex.test(login);
// }

// function isNameValid(name: string): boolean {
//   const nameRegex: RegExp = /^[A-Za-z]{3,}$/;
//   return nameRegex.test(name);
// }

// function hasSpecialCharacter(password: string): boolean {
//   const specialCharacterRegex: RegExp = /[^A-Za-z0-9]/;
//   return specialCharacterRegex.test(password);
// }

// function validateRegistrationForm(elements: IRegistrationElements): boolean {
//   let isValid: boolean = true;

//   const login: string = elements.loginInput.value.trim();
//   const password: string = elements.passwordInput.value;
//   const confirmPassword: string = elements.confirmPasswordInput.value;
//   const name: string = elements.nameInput.value.trim();
//   const email: string = elements.emailInput.value.trim();

//   clearAllErrors(elements);

//   if (login.length === 0) {
//     setFieldError(elements.loginField, elements.loginError, 'Login is required.');
//     isValid = false;
//   } else if (!isLoginValid(login)) {
//     setFieldError(
//       elements.loginField,
//       elements.loginError,
//       'Login must contain only English letters, start with a letter, and be at least 3 characters long.'
//     );
//     isValid = false;
//   }

//   if (password.length === 0) {
//     setFieldError(elements.passwordField, elements.passwordError, 'Password is required.');
//     isValid = false;
//   } else if (password.length < 6) {
//     setFieldError(elements.passwordField, elements.passwordError, 'Password must be at least 6 characters long.');
//     isValid = false;
//   } else if (!hasSpecialCharacter(password)) {
//     setFieldError(
//       elements.passwordField,
//       elements.passwordError,
//       'Password must contain at least 1 special character.'
//     );
//     isValid = false;
//   }

//   if (confirmPassword.length === 0) {
//     setFieldError(
//       elements.confirmPasswordField,
//       elements.confirmPasswordError,
//       'Confirm Password is required.'
//     );
//     isValid = false;
//   } else if (confirmPassword !== password) {
//     setFieldError(
//       elements.confirmPasswordField,
//       elements.confirmPasswordError,
//       'Passwords do not match.'
//     );
//     isValid = false;
//   }

//   if (name.length === 0) {
//     setFieldError(elements.nameField, elements.nameError, 'Name is required.');
//     isValid = false;
//   } else if (!isNameValid(name)) {
//     setFieldError(
//       elements.nameField,
//       elements.nameError,
//       'Name must contain only English letters and be at least 3 characters long.'
//     );
//     isValid = false;
//   }

//   if (email.length === 0) {
//     setFieldError(elements.emailField, elements.emailError, 'Email is required.');
//     isValid = false;
//   } else if (!isEmailValid(email)) {
//     setFieldError(elements.emailField, elements.emailError, 'Email is invalid.');
//     isValid = false;
//   }

//   return isValid;
// }

// function getRegisterPayload(elements: IRegistrationElements): IRegisterPayload {
//   return {
//     login: elements.loginInput.value.trim(),
//     password: elements.passwordInput.value,
//     name: elements.nameInput.value.trim(),
//     email: elements.emailInput.value.trim()
//   };
// }

// async function handleRegisterClick(
//   event: MouseEvent,
//   elements: IRegistrationElements,
//   authService: IAuthService,
//   authStorage: AuthStorage
// ): Promise<void> {
//   event.preventDefault();

//   const isFormValid: boolean = validateRegistrationForm(elements);

//   if (!isFormValid) {
//     return;
//   }

//   const payload: IRegisterPayload = getRegisterPayload(elements);

//   try {
//     const response: IAuthResponse = await authService.register(payload);

//     authStorage.setSession(response.data.accessToken, response.data.user);
//     window.location.href = '/online-zoo/pages/landing/index.html';
//   } catch (error: unknown) {
//     console.info(error);
//   }
// }

// function initRegistrationPage(): void {
//   const elements: IRegistrationElements | null = getRegistrationElements();

//   if (elements === null) {
//     return;
//   }

//   const authService: IAuthService = createAuthService();
//   const authStorage: AuthStorage = new AuthStorage();

//   elements.registerButton.addEventListener('click', (event: MouseEvent): void => {
//     void handleRegisterClick(event, elements, authService, authStorage);
//   });
// }

// document.addEventListener('DOMContentLoaded', (): void => {
//   initRegistrationPage();
// });
