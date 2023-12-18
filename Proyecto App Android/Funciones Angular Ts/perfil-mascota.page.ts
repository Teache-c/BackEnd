import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { DbService } from 'src/app/services/db.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfil-mascota',
  templateUrl: './perfil-mascota.page.html',
  styleUrls: ['./perfil-mascota.page.scss'],
})
export class PerfilMascotaPage implements OnInit {
  /* Variable DatosMascota */
  mascotaActual: any = {};
  private mascotaSubscription: Subscription;

  constructor(private router: Router, private formBuilder: FormBuilder, private authService: AuthServiceService, private db: DbService) {
    this.mascotaActual = {};
    this.mascotaSubscription = new Subscription();
  }
  
  ngOnInit() {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      console.log('el token es:' + user_id);
      this.db.dbState().subscribe(res => {
        if (res) {
          // Obtener los datos de la mascota al iniciar la página
          this.db.obtenerMascotaUserActual(user_id).then(mascota => {
            if (mascota) {
              console.log('Datos de la mascota:' + mascota);
              this.mascotaActual = mascota;
            }
          });

          // Suscribirse al observable de cambios en los datos de la mascota
          this.mascotaSubscription = this.db.fetchMascota().subscribe(nuevaListaMascotas => {
            // Actualizar la información de la mascota en la interfaz
            this.actualizarInformacionMascota();
          });
        }
      });
    }
  }

  // Función para actualizar la información de la mascota en la interfaz
  private actualizarInformacionMascota() {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      this.db.obtenerMascotaUserActual(user_id).then(mascota => {
        if (mascota) {
          this.mascotaActual = mascota;
        }
      });
    }
  }

  ngOnDestroy() {
    // Desuscribirse para evitar posibles pérdidas de memoria
    this.mascotaSubscription.unsubscribe();
  }

}
