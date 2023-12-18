import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { DbService } from 'src/app/services/db.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  /* Variables DatosUser */
  usuarioActual: any = {};

  rol_id: any;

  private usuarioSubscription: Subscription;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthServiceService,
    private db: DbService
  ) {
    this.usuarioActual = {};
    this.usuarioSubscription = new Subscription();
  }

  ngOnInit() {
    this.rol_id = localStorage.getItem('rol_id');
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      console.log('el token es:' + user_id);
      this.db.dbState().subscribe(res => {
        if (res) {
          // Obtén los datos del usuario al iniciar la página
          this.db.getUsuarioActual(user_id).then(usuario => {
            if (usuario) {
              // Convertir la fecha de nacimiento a edad
              usuario.EDAD = this.calcularEdad(usuario.EDAD);
              console.log('Datos del usuario:' + usuario);
              this.usuarioActual = usuario;
            }
          });
  
          // Suscríbete al observable de cambios en los datos del usuario
          this.usuarioSubscription = this.db.fetchUsuario().subscribe(nuevaListaUsuarios => {
            // Actualizar la información del usuario en la interfaz
            this.actualizarInformacionUsuario();
          });
        }
      });
    }
  }

  ngOnDestroy() {
    // Desuscribirse para evitar posibles pérdidas de memoria
    this.usuarioSubscription.unsubscribe();
  }

  // Función para actualizar la información del usuario en la interfaz
  private actualizarInformacionUsuario() {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      this.db.getUsuarioActual(user_id).then(usuario => {
        if (usuario) {
          // Convertir la fecha de nacimiento a edad
          usuario.EDAD = this.calcularEdad(usuario.EDAD);
          this.usuarioActual = usuario;
        }
      });
    }
  }

  // Función para convertir la fecha de nacimiento a edad
  private calcularEdad(fechaNacimiento: string): number {
    const ahora = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = ahora.getFullYear() - fechaNac.getFullYear();

    // Verificar si ya ha pasado el cumpleaños de este año
    if (
      ahora.getMonth() < fechaNac.getMonth() ||
      (ahora.getMonth() === fechaNac.getMonth() && ahora.getDate() < fechaNac.getDate())
    ) {
      edad--;
    }

    return edad;
  }

  // Funcion para navegar a la página NuevaContraseniaPage
  navegarANuevaContrasenia() {
    // Asegúrate de tener la ID del usuario disponible antes de navegar
    const idUsuario = localStorage.getItem('user_id');
    if (idUsuario) {
      // Navega a la página de nueva-contrasenia y pasa la ID del usuario
      this.router.navigate(['/nueva-contrasenia/', idUsuario]);
    } else {
      console.error('No se pudo obtener la ID del usuario.');
    }
  }

  // Funcion cerrar sesion
  cerrar() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
