import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  formData = {
    nama: '',
    nik: '',
    nohp: '',
    email: '',
    alamat: '',
    jabatan: '',
    stasiun: '',
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

  positions: string[] = ['Anggota', 'Staf', 'Mandor'];

  constructor(
    private alertController: AlertController,
    private api: ApiService,
  ) {}

  handleSubmit() {
    // ❌ jika kosong → tidak tampil apa pun
    if (
      !this.formData.nama ||
      !this.formData.nik ||
      !this.formData.alamat ||
      !this.formData.jabatan ||
      !this.formData.stasiun
    ) {
      return;
    }

    this.api.simpanKaryawan(this.formData).subscribe({
      next: async (res) => {
        if (res.status === 'berhasil') {
          await this.showSuccessAlert();

          // reset form
          this.formData = {
            nama: '',
            nik: '',
            nohp: '',
            email: '',
            alamat: '',
            jabatan: '',
            stasiun: '',
          };
        }
      },
      error: () => {
        // ❌ gagal → diam (sesuai permintaan)
      },
    });
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Berhasil',
      message: 'Data karyawan berhasil disimpan',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
