import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInKey = 'isLoggedIn';

  constructor(private router: Router) {}

  setIsLoggedIn(value: boolean) {
    localStorage.setItem(this.isLoggedInKey, value.toString());
  }

  getIsLoggedIn(): boolean {
    const isLoggedIn = localStorage.getItem(this.isLoggedInKey);
    return isLoggedIn ? JSON.parse(isLoggedIn) : false;
  }

  logout() {
    localStorage.removeItem(this.isLoggedInKey);
    this.router.navigateByUrl('/login');
  }
}
