import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

interface Employee {
  id: number;
  nama: string;
  nik: string;
  nohp: string;
  email: string;
  alamat: string;
  jabatan: string;
  stasiun: string;
}

interface Attendance {
  [employeeId: number]: 'hadir' | 'tidak';
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  todayDate: string = '';
  employees: Employee[] = [];
  attendance: Attendance = {};
  stats = {
    total: 0,
    hadir: 0,
    tidak: 0,
  };

  stations: string[] = [
    'Stasiun Gilingan',
    'Stasiun Pemurnian',
    'Stasiun Boiler',
    'Stasiun Listrik',
    'Stasiun Putaran Rendah',
    'Stasiun Sugarbeen',
    'Stasiun Instrument',
    'Stasiun Work Shop',
    'Stasiun Putaran Tinggi',
    'Stasiun Evaporator',
    'Stasiun Masakan',
    'Stasiun P.L.T (cane yard)',
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.setTodayDate();
    this.loadEmployees();
    this.loadAttendance();
  }

  ionViewWillEnter() {
    this.loadAttendance(); // 🔥 INI KUNCINYA
  }

  setTodayDate() {
    this.todayDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // ✅ AMBIL KARYAWAN VIA SERVICE
  loadEmployees() {
    this.api.ambilKaryawan().subscribe({
      next: (res: Employee[]) => {
        this.employees = res;
        this.calculateStats();
      },
      error: () => {
        console.error('Gagal mengambil data karyawan');
      },
    });
  }

  // ✅ AMBIL ABSENSI HARI INI VIA SERVICE
  loadAttendance() {
    this.api.ambilAbsensiHariIni().subscribe({
      next: (res: any) => {
        const map: Attendance = {};

        (res.data || []).forEach((item: any) => {
          map[item.id_karyawan] = item.status;
        });

        this.attendance = map;
        this.calculateStats();
      },
      error: () => {
        console.error('Gagal mengambil data absensi');
      },
    });
  }

  calculateStats() {
    this.stats = {
      total: this.employees.length,
      hadir: Object.values(this.attendance).filter((v) => v === 'hadir').length,
      tidak: Object.values(this.attendance).filter((v) => v === 'tidak').length,
    };
  }

  getStationAttendance(station: string) {
    const stationEmployees = this.employees.filter(
      (e) => e.stasiun === station,
    );

    const hadir = stationEmployees.filter(
      (e) => this.attendance[e.id] === 'hadir',
    ).length;

    return {
      hadir,
      total: stationEmployees.length,
    };
  }

  getStationPercentage(station: string): number {
    const s = this.getStationAttendance(station);
    if (s.total === 0) return 0;
    return Math.round((s.hadir / s.total) * 100);
  }

  getProgressColor(station: string): string {
    const persen = this.getStationPercentage(station);

    if (persen >= 75) return 'progress-success';
    if (persen >= 40) return 'progress-warning';
    return 'progress-danger';
  }
} //⬅⬅⬅ SATU-SATUNYA PENUTUP CLASS
