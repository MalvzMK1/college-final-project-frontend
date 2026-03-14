// just because using cookie-next lib may return a promise
export function getCookie(key: string): string | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [cookieKey, value] = cookie.split('=');

    if (cookieKey === key) {
      return value;
    }
  }

  return null;
}
