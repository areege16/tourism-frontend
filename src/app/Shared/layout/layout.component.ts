import { Component } from '@angular/core';
import { AuthService } from '../../Auth/Services/auth.service';
import { NavItem } from '../Models/layout';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  isCollapsed = false;
  userData = this.authService.getUserData();
  userName: string = this.userData?.fullName || 'المستخدم';
  constructor(private authService: AuthService) { }

  navItems: NavItem[] = [
    {
      label: 'المعالم السياحية',
      icon: 'place',
      route: '/dashboard/attractions',
    },
    { label: 'الفنادق', icon: 'hotel', route: '/dashboard/hotels' },
    { label: 'المدونات', icon: 'article', route: '/dashboard/blogposts' },
    { label: 'المرشدون السياحيون', icon: 'person_pin', route: '/dashboard/tourguides' },
    { label: 'الخدمات', icon: 'build', route: '/dashboard/services' },
    { label: 'معلومات السياحة', icon: 'travel_explore', route: '/dashboard/tourisminfo' },
    { label: 'الفعاليات', icon: 'event', route: '/dashboard/events' },
    {
      label: 'المصورون',
      icon: 'camera_alt',
      route: '/dashboard/photographers',
    },
    {
      label: 'المطاعم',
      icon: 'restaurant',
      route: '/dashboard/restaurants',
    },
    {
      label: 'الهدايا التذكارية',
      icon: 'storefront',
      route: '/dashboard/souvenirs',
    },
  ];
  toggleDrawer(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  logout(): void {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log(res.message);
      },
      error: (err) => {
        console.error('Logout error:', err);
      },
    });
  }
}
