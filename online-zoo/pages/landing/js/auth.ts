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

      elements.profileInfo.textContent = `Profile information (${user.name}, ${user.email})`;
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

// import { AuthStorage } from "../../../src/shared/app/services/auth-storage";
// import type { IUser } from "../../../src/shared/auth/auth.types";

// function renderHeaderUser(): void {
//   const userNameElement: HTMLElement | null = document.getElementById('header-user-name');
//   const userButton: HTMLElement | null = document.getElementById('open-login-modal');
//   const userDropdown: HTMLElement | null = document.getElementById('user-dropdown');

//   if (!(userNameElement instanceof HTMLElement)) {
//     return;
//   }

//   const authStorage: AuthStorage = new AuthStorage();
//   const user: IUser | null = authStorage.getUser();

//   if (user !== null) {
//     userNameElement.textContent = user.name;
//     userNameElement.hidden = false;

//     if (userButton instanceof HTMLButtonElement) {
//       userButton.setAttribute('aria-label', 'Open user menu');
//     }

//     if (userButton instanceof HTMLButtonElement) {
//         userButton.setAttribute('aria-label', 'Open unauth user menu');
//         userButton.setAttribute('aria-expanded', 'false');
//     }

//     if (userDropdown instanceof HTMLElement) {
//         userDropdown.hidden = true;
//     }

//     return;
//   }

//   userNameElement.textContent = '';
//   userNameElement.hidden = true;

// }

// // function initLoginModal(): void {
// //     const openButton: HTMLElement | null = document.getElementById('open-login-modal');
// //     const modal: HTMLElement | null = document.getElementById('login-modal');

// //     if (!(openButton instanceof HTMLElement) || !(modal instanceof HTMLElement)) {
// //         return;
// //     }

// //     const closeButtons: NodeListOf<HTMLElement> = modal.querySelectorAll('[data-close-modal]');
// //     const modalContent: HTMLElement | null = modal.querySelector('.modal__content');

// //     function openModal(): void {
// //         modal.hidden = false;
// //     }

// //     const authStorage: AuthStorage = new AuthStorage();
    

// //     openButton.addEventListener('click', (): void => {
// //         if (authStorage.isAuthenticated) {
// //             return;
// //         }
// //         openModal();
// //     });

// //     function closeModal(): void {
// //         modal.hidden = true;
// //     }

// //     closeButtons.forEach((button: HTMLElement): void => {
// //         button.addEventListener('click', (): void => {
// //             closeModal();
// //         });
// //     });

// //     document.addEventListener('keydown', (event: KeyboardEvent): void => {
// //         if (event.key === 'Escape' && !modal.hidden) {
// //             closeModal();
// //         }
// //     });

// //     if (modalContent instanceof HTMLElement) {
// //         modalContent.addEventListener('click', (event: MouseEvent): void => {
// //             event.stopPropagation();
// //         });
// //     }
// // }

// function initLoginModal(): ILoginModalController | null {
//   const modal: HTMLElement | null = document.getElementById('login-modal');

//   if (!(modal instanceof HTMLElement)) {
//     return null;
//   }

//   const closeButtons: NodeListOf<HTMLElement> = modal.querySelectorAll('[data-close-modal]');

//   function open(): void {
//     modal.hidden = false;
//     document.body.style.overflow = 'hidden';
//   }

//   function close(): void {
//     modal.hidden = true;
//     document.body.style.overflow = '';
//   }

//   closeButtons.forEach((button: HTMLElement): void => {
//     button.addEventListener('click', (): void => {
//       close();
//     });
//   });

//   document.addEventListener('keydown', (event: KeyboardEvent): void => {
//     if (event.key === 'Escape' && !modal.hidden) {
//       close();
//     }
//   });

//   return {
//     open,
//     close
//   };
// }

// function initHeaderUserActions(loginModalController: ILoginModalController | null): void {
//   const userInfoElement: HTMLElement | null = document.getElementById('user-info');
//   const userButton: HTMLElement | null = document.getElementById('open-login-modal');
//   const userDropdown: HTMLElement | null = document.getElementById('user-dropdown');
//   const unauthUserDropdown: HTMLElement | null = document.getElementById('unauth-user-dropdown');
//   const profileInfoElement: HTMLElement | null = document.getElementById('profile-info');
//   const logoutButton: HTMLElement | null = document.getElementById('logout-button');

//   if (!(userInfoElement instanceof HTMLElement)) {
//     return;
//   }

//   if (!(userButton instanceof HTMLButtonElement)) {
//     return;
//   }

//   const authStorage: AuthStorage = new AuthStorage();

//   function openUserDropdown(): void {
//     if (!(userDropdown instanceof HTMLElement)) {
//       return;
//     }

//     userDropdown.hidden = false;
//     userButton.setAttribute('aria-expanded', 'true');

//     if ((profileInfoElement instanceof HTMLElement)) {
//         const user: IUser | null = authStorage.getUser();
//         if (user !== null) {
//             profileInfoElement.textContent = `Profile information (${user.name}, ${user.email})`;
//         }
//     }
//   }

//   function closeUserDropdown(): void {
//     if (!(userDropdown instanceof HTMLElement)) {
//       return;
//     }

//     userDropdown.hidden = true;
//     userButton.setAttribute('aria-expanded', 'false');

//     if ((profileInfoElement instanceof HTMLElement)) {
//         profileInfoElement.textContent = `Profile information`;
//     }
//   }

//   function toggleUserAction(): void {
//     const user: IUser | null = authStorage.getUser();

//     if (user === null) {
//       closeUserDropdown();
//       loginModalController?.open();
//       return;
//     }

//     if (!(userDropdown instanceof HTMLElement)) {
//       return;
//     }

//     if (userDropdown.hidden) {
//       openUserDropdown();
//       return;
//     }

//     closeUserDropdown();
//   }

//   userButton.addEventListener('click', (event: MouseEvent): void => {
//     event.stopPropagation();
//     toggleUserAction();
//   });

//   if (logoutButton instanceof HTMLButtonElement) {
//     logoutButton.addEventListener('click', (): void => {
//       authStorage.clearSession();
//       closeUserDropdown();
//       renderHeaderUser();
//       window.location.href = '/online-zoo/pages/landing/index.html';
//     });
//   }

//   document.addEventListener('click', (event: MouseEvent): void => {
//     if (!(event.target instanceof Node)) {
//       return;
//     }

//     if (!userInfoElement.contains(event.target)) {
//       closeUserDropdown();
//     }
//   });

//   document.addEventListener('keydown', (event: KeyboardEvent): void => {
//     if (event.key === 'Escape') {
//       closeUserDropdown();
//     }
//   });
// }

// document.addEventListener('DOMContentLoaded', (): void => {
//   renderHeaderUser();

//   const loginModalController: ILoginModalController | null = initLoginModal();
//   initHeaderUserActions(loginModalController);
// });
