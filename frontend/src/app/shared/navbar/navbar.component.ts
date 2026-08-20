import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar glass-card">
      <div class="nav-brand" routerLink="/">
        <div class="logo-icon">✨</div>
        <span class="logo-text">AstroGPT</span>
      </div>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
        <a routerLink="/chart" routerLinkActive="active">My Chart</a>
      </div>
      <div class="status-indicator">
        <div class="pulsing-dot"></div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      position: sticky;
      top: 0;
      z-index: 100;
      border-radius: 0;
      border-top: none;
      border-left: none;
      border-right: none;
    }
    
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
      
      .logo-icon {
        font-size: 24px;
        color: var(--color-accent);
      }
      
      .logo-text {
        font-family: 'Cinzel', serif;
        font-size: 24px;
        font-weight: 700;
        background: linear-gradient(135deg, #fff, var(--color-primary-light));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: 0.05em;
      }
    }

    .nav-links {
      display: flex;
      gap: 32px;
      
      a {
        color: var(--color-text-muted);
        text-decoration: none;
        font-size: 15px;
        font-weight: 500;
        transition: var(--transition);
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--color-primary-light);
          transition: var(--transition);
        }
        
        &:hover {
          color: var(--color-text);
        }
        
        &.active {
          color: var(--color-primary-light);
          &::after {
            width: 100%;
          }
        }
      }
    }

    .status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      
      .pulsing-dot {
        width: 10px;
        height: 10px;
        background-color: var(--color-success);
        border-radius: 50%;
        box-shadow: 0 0 10px var(--color-success);
        animation: pulse 2s infinite;
      }
    }
  `]
})
export class NavbarComponent {}
