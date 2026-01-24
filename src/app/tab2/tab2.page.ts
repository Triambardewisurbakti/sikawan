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
  status: 'hadir' | 'tidak' | 'belum';
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
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

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    this.api.ambilAbsensiHariIni().subscribe({
      next: (res: any) => {
        console.log('DATA ABSENSI:', res.data); // 👈 LIHAT DI CONSOLE
        this.employees = res.data;
        this.filterEmployees();
      },
      error: () => {
        console.error('Gagal mengambil data absensi hari ini');
      },
    });
  }

  filterEmployees() {
    if (this.selectedStation === 'Semua') {
      this.filteredEmployees = this.employees;
    } else {
      this.filteredEmployees = this.employees.filter(
        (e) => e.stasiun === this.selectedStation,
      );
    }
  }

  getStationEmployees(station: string): Employee[] {
    if (station === 'Semua') return this.filteredEmployees;
    return this.filteredEmployees.filter((e) => e.stasiun === station);
  }

  getStatusColor(employeeId: number): string {
    const emp = this.employees.find((e) => e.id === employeeId);
    if (!emp) return 'medium';
    if (emp.status === 'hadir') return 'success';
    if (emp.status === 'tidak') return 'danger';
    return 'medium';
  }

  getStatusText(employeeId: number): string {
    const emp = this.employees.find((e) => e.id === employeeId);
    if (!emp) return 'Belum Absen';
    if (emp.status === 'hadir') return 'Hadir';
    if (emp.status === 'tidak') return 'Tidak Hadir';
    return 'Belum Absen';
  }

  // ✅ FUNGSI HARUS DI DALAM CLASS
  deleteEmployee(id: number) {
    if (!confirm('Yakin ingin menghapus karyawan ini?')) return;

    this.api.hapusKaryawan(id).subscribe({
      next: () => {
        this.employees = this.employees.filter((e: Employee) => e.id !== id);
        this.filterEmployees();
      },
      error: () => {
        alert('Gagal menghapus data karyawan');
      },
    });
  }
}
