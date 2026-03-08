import { AuthStorage } from "../../../src/shared/app/services/auth-storage";
import { createAuthService, } from "../../../src/shared/app/services/auth.service";
import type { IAuthService } from "../../../src/shared/app/services/auth.service";
import type { IAuthResponse, TLoginPayload } from "../../../src/shared/auth/auth.types";

interface IFieldRefs {
  field: HTMLElement;
  input: HTMLInputElement;
  error: HTMLElement;
}

interface ISignInElements {
  signinButton: HTMLButtonElement;
  formErrorElement: HTMLElement;
  login: IFieldRefs;
  password: IFieldRefs;
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

function getSignInElements(): ISignInElements | null {
  const signinButton: HTMLElement | null = document.getElementById('signin-button');

  if (!(signinButton instanceof HTMLButtonElement)) {
    return null;
  }

  const formErrorElement: HTMLElement | null = document.getElementById('form-error');

  if (!(formErrorElement instanceof HTMLElement)) {
    return null;
  }
  
  const login: IFieldRefs | null = getFieldRefs('login-field', 'login-input', 'login-error');
  const password: IFieldRefs | null = getFieldRefs('password-field', 'password-input', 'password-error');

  if (login === null || password === null) {
    return null;
  }

  return {
    signinButton,
    formErrorElement,
    login,
    password,
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

function validateFieldByName(
  fieldName: 'login' | 'password',
  elements: ISignInElements
): IValidationResult {
  switch (fieldName) {
    case 'login':
      return validateLogin(elements.login.input.value);
    case 'password':
      return validatePassword(elements.password.input.value);
  }
}

function showFieldValidation(
  fieldName: 'login' | 'password',
  elements: ISignInElements
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

function isFormValid(elements: ISignInElements): boolean {
  const loginResult: IValidationResult = validateLogin(elements.login.input.value);
  const passwordResult: IValidationResult = validatePassword(elements.password.input.value);

  return (
    loginResult.isValid &&
    passwordResult.isValid
  );
}

function updateSignInButtonState(elements: ISignInElements): void {
  elements.signinButton.disabled = !isFormValid(elements);
}

function bindFieldValidation(
  fieldName: 'login' | 'password',
  elements: ISignInElements
): void {
  const fieldRefs: IFieldRefs = elements[fieldName];

  fieldRefs.input.addEventListener('blur', (): void => {
    showFieldValidation(fieldName, elements);

    updateSignInButtonState(elements);
  });

  fieldRefs.input.addEventListener('focus', (): void => {
    clearFieldError(fieldRefs);
  });

  fieldRefs.input.addEventListener('input', (): void => {
    updateSignInButtonState(elements);
  });
}

function getSignInPayload(elements: ISignInElements): TLoginPayload {
  return {
    login: elements.login.input.value.trim(),
    password: elements.password.input.value,
  };
}

async function handleSignIn(
  elements: ISignInElements,
  authService: IAuthService,
  authStorage: AuthStorage
): Promise<void> {
  const loginValid: boolean = showFieldValidation('login', elements);
  const passwordValid: boolean = showFieldValidation('password', elements);

  updateSignInButtonState(elements);

  elements.formErrorElement.hidden = true;
  elements.formErrorElement.textContent = '';

  if (!loginValid || !passwordValid) {
    return;
  }

  try {
    const payload: TLoginPayload = getSignInPayload(elements);

    elements.signinButton.disabled = true;
    elements.signinButton.textContent = 'Signing In...';

    const response: IAuthResponse = await authService.login(payload);

    authStorage.setSession(response.data.access_token, response.data.user);
    window.location.href = '/online-zoo/pages/landing/index.html';
  } catch (error: unknown) {
    elements.formErrorElement.hidden = false;
    elements.formErrorElement.textContent = error instanceof Error ? error.message : String(error);
  }
  elements.signinButton.disabled = false;
  elements.signinButton.textContent = 'Sign In';
}

function initSignInPage(): void {
  const elements: ISignInElements | null = getSignInElements();

  if (elements === null) {
    return;
  }

  const authService: IAuthService = createAuthService();
  const authStorage: AuthStorage = new AuthStorage();

  bindFieldValidation('login', elements);
  bindFieldValidation('password', elements);

  updateSignInButtonState(elements);

  elements.signinButton.addEventListener('click', (): void => {
    void handleSignIn(elements, authService, authStorage);
  });
}

document.addEventListener('DOMContentLoaded', (): void => {
  initSignInPage();
});
