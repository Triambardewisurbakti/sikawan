import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private URL_API = 'http://localhost/pabrik_api';

  private jsonHeaders = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /* ================= KARYAWAN ================= */

  ambilKaryawan(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL_API}/data_karyawan.php`);
  }

  simpanKaryawan(data: any): Observable<any> {
    return this.http.post(
      `${this.URL_API}/simpan_karyawan.php`,
      data,
      this.jsonHeaders,
    );
  }

  hapusKaryawan(id: number): Observable<any> {
    return this.http.delete(`${this.URL_API}/hapus_karyawan.php?id=${id}`);
  }

  /* ================= ABSENSI ================= */

  ambilAbsensiHariIni(): Observable<any> {
    return this.http.get(`${this.URL_API}/absensi_hari_ini.php`);
  }

  ambilSemuaAbsensi(): Observable<any> {
    return this.http.get<any>(`${this.URL_API}/absensi_semua.php`);
  }

  simpanAbsensi(data: any): Observable<any> {
    return this.http.post(
      `${this.URL_API}/simpan_absensi.php`,
      data,
      this.jsonHeaders,
    );
  }

  // ================= HAPUS ABSENSI PER KARYAWAN =================
  hapusAbsensi(date: string, employeeId: string) {
    return this.http.post<any>(
      'http://localhost/pabrik_api/hapus_absensi.php',
      {
        date: date,
        employee_id: employeeId,
      },
    );
  }
}
