import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfToken = getCookie('XSRF-TOKEN');
  
  if (csrfToken) {
    const clonedRequest = req.clone({
      setHeaders: {
        'X-XSRF-TOKEN': csrfToken, 
      },
    });
    return next(clonedRequest);
  }
  
  return next(req);
};

function getCookie(name: string): string | null {
  const matches = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return matches ? decodeURIComponent(matches[1]) : null;
}