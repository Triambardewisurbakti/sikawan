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
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {
  // ================= TANGGAL =================
  selectedDate: string = '';
  todayDate: string = '';

  employees: Employee[] = [];
  attendance: Attendance = {};
  selectedStation: string = 'Semua';

  stations: string[] = [
    'Semua',
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

  // ================= LIFECYCLE =================
  ngOnInit() {
    this.setToday();
    this.loadData();
  }

  ionViewWillEnter() {
    this.setToday();
    this.loadData();
  }

  // ================= KALENDER =================
  setToday() {
    const today = new Date();
    this.selectedDate = today.toISOString().slice(0, 10);
    this.todayDate = this.formatDate(today);
  }

  onDateChange(event: any) {
    const raw = event.detail.value;
    if (!raw) return;

    this.selectedDate = raw.split('T')[0];
    this.todayDate = this.formatDate(new Date(this.selectedDate));

    // backend belum support filter tanggal → tetap ambil absensi hari ini
    this.loadAbsensiHariIni();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // ================= LOAD DATA =================
  loadData() {
    // ambil karyawan
    this.api.ambilKaryawan().subscribe({
      next: (res: Employee[]) => {
        this.employees = res;
      },
      error: () => {
        console.error('Gagal mengambil data karyawan');
      },
    });

    // ambil absensi (hari ini)
    this.loadAbsensiHariIni();
  }

  loadAbsensiHariIni() {
    this.api.ambilAbsensiHariIni().subscribe({
      next: (res: any) => {
        this.attendance = res?.data ?? {};
      },
      error: () => {
        console.error('Gagal mengambil absensi');
        this.attendance = {};
      },
    });
  }

  // ================= FILTER =================
  getStationEmployees(station: string): Employee[] {
    if (station === 'Semua') return this.employees;
    return this.employees.filter((e) => e.stasiun === station);
  }

  // ================= ABSENSI =================
  getAttendanceStatus(employeeId: number): 'hadir' | 'tidak' | null {
    return this.attendance[employeeId] || null;
  }

  handleAttendance(employeeId: number, status: 'hadir' | 'tidak') {
    const payload = {
      tanggal: this.selectedDate, // tanggal dari kalender
      karyawan_id: employeeId,
      status: status,
    };

    this.api.simpanAbsensi(payload).subscribe({
      next: () => {
        this.attendance[employeeId] = status;
      },
      error: (err: any) => {
        console.error('Gagal menyimpan absensi', err);
      },
    });
  }

  // ================= UI STATUS =================
  getStatusColor(employeeId: number): string {
    const status = this.getAttendanceStatus(employeeId);
    if (status === 'hadir') return 'success';
    if (status === 'tidak') return 'danger';
    return 'medium';
  }

  getStatusText(employeeId: number): string {
    const status = this.getAttendanceStatus(employeeId);
    if (status === 'hadir') return 'Hadir';
    if (status === 'tidak') return 'Tidak Hadir';
    return 'Belum Absen';
  }

  getStatusIcon(employeeId: number): string {
    const status = this.getAttendanceStatus(employeeId);
    if (status === 'hadir') return 'checkmark-circle';
    if (status === 'tidak') return 'close-circle';
    return 'help-circle';
  }
}
