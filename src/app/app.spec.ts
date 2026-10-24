import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { App } from './app';
import { Dashboard } from './Dashboard/Dashboard';

describe('App & Router Navigation', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, Dashboard],
      providers: [provideRouter(routes)]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should navigate to dashboard and render without error', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await router.navigate(['/dashboard']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/dashboard');
  });

  it('should navigate to all routes without error', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    for (const path of ['/transactions', '/analytics', '/budgets', '/categories', '/settings', '/dashboard']) {
      await router.navigate([path]);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(router.url).toBe(path);
    }
  });
});


