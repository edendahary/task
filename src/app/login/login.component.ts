import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent{
  @ViewChild('VerificationModal') model: ElementRef | undefined;
  @ViewChild('modelError') modelError: ElementRef | undefined;
  // private apiUrl = 'http://localhost:3000';
  private apiUrl: string = '';
  // private apiUrl = `https://192.168.1.112:3000`

  name: string = '';
  email: string = '';
  password: string = '';
  showBuffer: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}


  async login() {
    if (this.email === 'edendahary1@gmail.com' && this.password === '1234') {
      // localStorage.setItem(
      //   'user',
      //   JSON.stringify({ email: this.email, token: 'token' })
      // );
      this.authService.setIsLoggedIn(true); // Set user as logged in

      this.router.navigate(['']);
    } else {
      alert('Invalid credentials');
    }
  }


}
