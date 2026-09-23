import { Component } from '@angular/core';
import { AuthService } from '../../Auth/Services/auth.service';
import { NavItem } from '../Models/layout';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  isCollapsed = false;
  userData = this.authService.getUserData();
  userName: string = this.userData?.fullName || 'المستخدم';
  constructor(private authService: AuthService) { }


  navItems: NavItem[] = [
    { label: 'المعالم السياحية', icon: 'place', route: '/dashboard/attractions' },
    { label: 'الفنادق', icon: 'hotel', route: '/dashboard/hotels' },
    { label: 'احصائيات', icon: 'query_stats', route: '/dashboard/statistics' },
    { label: 'تقارير', icon: 'summarize', route: '/dashboard/reports' },
    { label: 'الإعدادات والمستخدمين', icon: 'settings', route: '/dashboard/register' }
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
      }
    });
  }
}
