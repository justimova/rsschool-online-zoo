import type { IAuthStorage } from "../../../src/shared/app/services/auth-storage";
import { createAuthStorage } from "../../../src/shared/app/services/auth-storage";
import type { IUser } from "../../../src/shared/auth/auth.types";

interface IHeaderElements {
  userInfo: HTMLElement;
  userButton: HTMLButtonElement;
  userName: HTMLElement;
  userDropdown: HTMLElement;
  profileInfo: HTMLAnchorElement;
  logoutButton: HTMLButtonElement;
  signInLink: HTMLAnchorElement;
  registrationLink: HTMLAnchorElement;
}

function getHeaderElements(): IHeaderElements | null {
  const userInfo: HTMLElement | null = document.getElementById('user-info');
  const userButton: HTMLElement | null = document.getElementById('open-login-modal');
  const userName: HTMLElement | null = document.getElementById('header-user-name');
  const userDropdown: HTMLElement | null = document.getElementById('user-dropdown');
  const profileInfo: HTMLElement | null = document.getElementById('profile-info');
  const logoutButton: HTMLElement | null = document.getElementById('logout-button');
  const signInLink: HTMLElement | null = document.getElementById('signin-link');
  const registrationLink: HTMLElement | null = document.getElementById('registration-link');

  if (!(userInfo instanceof HTMLElement)) {
    return null;
  }

  if (!(userButton instanceof HTMLButtonElement)) {
    return null;
  }

  if (!(userName instanceof HTMLElement)) {
    return null;
  }

  if (!(userDropdown instanceof HTMLElement)) {
    return null;
  }

  if (!(profileInfo instanceof HTMLAnchorElement)) {
    return null;
  }

  if (!(logoutButton instanceof HTMLButtonElement)) {
    return null;
  }

  if (!(signInLink instanceof HTMLAnchorElement)) {
    return null;
  }

  if (!(registrationLink instanceof HTMLAnchorElement)) {
    return null;
  }

  return {
    userInfo,
    userButton,
    userName,
    userDropdown,
    profileInfo,
    logoutButton,
    signInLink,
    registrationLink
  };
}

function openDropdown(elements: IHeaderElements): void {
  elements.userDropdown.hidden = false;
  elements.userButton.setAttribute('aria-expanded', 'true');
}

function closeDropdown(elements: IHeaderElements): void {
  elements.userDropdown.hidden = true;
  elements.userButton.setAttribute('aria-expanded', 'false');
}

function renderHeaderUser(elements: IHeaderElements, authStorage: IAuthStorage): void {
  if (authStorage.isAuthenticated) {
    const user: IUser | null = authStorage.getUser();
    if (user) {
      elements.userName.textContent = user.name;
      elements.userName.hidden = false;

      elements.profileInfo.textContent = `${user.name} (${user.email})`;
      elements.profileInfo.hidden = false;
      elements.profileInfo.href = '../profile/index.html';

      elements.logoutButton.hidden = false;

      elements.signInLink.hidden = true;
      elements.registrationLink.hidden = true;

      return;
    }
  }

  elements.userName.textContent = '';
  elements.userName.hidden = true;

  elements.profileInfo.hidden = true;
  elements.logoutButton.hidden = true;

  elements.signInLink.hidden = false;
  elements.registrationLink.hidden = false;
}

function initHeaderUserMenu(): void {
  const elements: IHeaderElements | null = getHeaderElements();

  if (elements === null) {
    return;
  }

  const authStorage: IAuthStorage = createAuthStorage();

  renderHeaderUser(elements, authStorage);

  elements.userButton.addEventListener('click', (event: MouseEvent): void => {
    event.stopPropagation();

    renderHeaderUser(elements, authStorage);

    if (elements.userDropdown.hidden) {
      openDropdown(elements);
      return;
    }

    closeDropdown(elements);
  });

  elements.logoutButton.addEventListener('click', (): void => {
    authStorage.clearSession();
    closeDropdown(elements);
    renderHeaderUser(elements, authStorage);
    window.location.href = '../landing/index.html';
  });

  document.addEventListener('click', (event: MouseEvent): void => {
    if (!(event.target instanceof Node)) {
      return;
    }

    if (!elements.userInfo.contains(event.target)) {
      closeDropdown(elements);
    }
  });

  document.addEventListener('keydown', (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      closeDropdown(elements);
    }
  });
}

document.addEventListener('DOMContentLoaded', (): void => {
  initHeaderUserMenu();
});
