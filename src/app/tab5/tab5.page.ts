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

interface AttendanceByDate {
  [employeeId: string]: 'hadir' | 'tidak';
}

interface Attendance {
  [date: string]: AttendanceByDate;
}

interface DateStats {
  hadir: number;
  tidak: number;
  total: number;
}

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: false,
})
export class Tab5Page implements OnInit {
  employees: Employee[] = [];
  attendance: Attendance = {};

  // ================= FILTER TANGGAL =================
  selectedDate: string | null = null;
  filteredDates: string[] = [];

  // ================= FILTER STASIUN =================
  selectedStation: string = 'Semua';
  stations: string[] = [];

  positions: string[] = ['Anggota', 'Staf', 'Mandor'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  // ================= LOAD DATA =================
  loadData() {
    // ambil karyawan
    this.api.ambilKaryawan().subscribe({
      next: (res) => {
        this.employees = res;

        // generate stasiun setelah karyawan tersedia
        this.generateStations();
      },
      error: () => console.error('Gagal mengambil data karyawan'),
    });

    // ambil seluruh absensi
    this.api.ambilSemuaAbsensi().subscribe({
      next: (res) => {
        this.attendance = res?.data ?? res ?? {};
        this.filteredDates = this.getAttendanceDates();
      },
      error: () => console.error('Gagal mengambil data absensi'),
    });
  }

  // ================= GENERATE STASIUN =================
  generateStations() {
    const uniqueStations = new Set<string>();

    this.employees.forEach((emp) => {
      if (emp.stasiun) {
        const st = emp.stasiun.trim();
        if (st.toLowerCase() !== 'semua') {
          uniqueStations.add(st);
        }
      }
    });

    const defaultStations = [
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
    defaultStations.forEach((s) => uniqueStations.add(s));

    // 🔥 "Semua" dijamin cuma 1
    this.stations = Array.from(
      new Set(['Semua', ...Array.from(uniqueStations).sort()]),
    );
  }

  // ================= FILTER TANGGAL =================
  onDateChange(event: any) {
    const raw = event.detail.value;
    if (!raw) return this.resetFilter();

    const selected = raw.split('T')[0];
    this.selectedDate = selected;

    const foundDate = this.getAttendanceDates().find(
      (d) => this.formatLocalDate(this.parseDate(d)) === selected,
    );

    this.filteredDates = foundDate ? [foundDate] : [];
  }

  resetFilter() {
    this.selectedDate = null;
    this.filteredDates = this.getAttendanceDates();
  }

  // ================= FILTER STASIUN =================
  applyFilter() {
    // trigger change detection
  }

  getAttendanceByStation(date: string): AttendanceByDate {
    const result: AttendanceByDate = {};

    // ambil semua karyawan yang sesuai stasiun
    this.employees.forEach((emp) => {
      if (
        this.selectedStation === 'Semua' ||
        (emp.stasiun &&
          emp.stasiun.trim().toLowerCase() ===
            this.selectedStation.trim().toLowerCase())
      ) {
        // ambil status dari attendance, default 'tidak' jika belum ada
        const status = this.attendance[date]?.[emp.id] ?? 'tidak';
        result[emp.id] = status;
      }
    });

    return result;
  }

  // ================= RIWAYAT =================
  getAttendanceDates(): string[] {
    return Object.keys(this.attendance).sort(
      (a, b) => this.parseDate(b).getTime() - this.parseDate(a).getTime(),
    );
  }

  parseDate(dateStr: string): Date {
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      return new Date(+y, +m - 1, +d);
    }
    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      return new Date(+y, +m - 1, +d);
    }
    return new Date(dateStr);
  }

  formatLocalDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ================= STATISTIK =================
  getDateStats(date: string): DateStats {
    const dateAttendance = this.getAttendanceByStation(date);
    let hadir = 0;
    let tidak = 0;

    Object.values(dateAttendance).forEach((status) => {
      status === 'hadir' ? hadir++ : tidak++;
    });

    return { hadir, tidak, total: hadir + tidak };
  }

  getDatePercentage(date: string): number {
    const stats = this.getDateStats(date);
    if (this.employees.length === 0) return 0;
    return Math.round((stats.hadir / this.employees.length) * 100);
  }

  // ================= UTIL =================
  getEmployeeName(key: string): string {
    let emp = this.employees.find((e) => e.id.toString() === key);
    if (!emp) emp = this.employees.find((e) => e.nik === key);
    if (!emp && !isNaN(+key)) emp = this.employees.find((e) => e.id === +key);
    return emp ? emp.nama : 'Tidak diketahui';
  }

  deleteAttendance(date: string, employeeId: string) {
    if (!confirm('Yakin ingin menghapus absensi karyawan ini?')) return;

    this.api.hapusAbsensi(date, employeeId).subscribe({
      next: () => {
        if (this.attendance[date]) {
          delete this.attendance[date][employeeId];
          if (Object.keys(this.attendance[date]).length === 0) {
            delete this.attendance[date];
            this.filteredDates = this.filteredDates.filter((d) => d !== date);
          }
        }
      },
      error: () => alert('Gagal menghapus data absensi'),
    });
  }
}
