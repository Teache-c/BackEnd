import { Router } from '@angular/router';
import { OnInit, Component } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-adoptar',
  templateUrl: './adoptar.page.html',
  styleUrls: ['./adoptar.page.scss'],
})
export class AdoptarPage implements OnInit {
  isModalOpen = false;
  alertButtons = ['✌ Cerrar 🐾'];
  arregloUsuarios: any = [
    {
      id_usuario: '',
      img_usuario: '',
      nombre_usuario: '',
      apellido_usuario: '',
      edad: '',
    }
  ]

  arregloMascotas: any = [
    {
      id_mascota: '',
      mascota_img: '',
      nombre_mascota: '',
      edad_mascota: '',
      id_usuario: '',
    }
  ]
  /* Molde usuario */
  img_chat = "";
  nombre_chat = "";

  coincidencia: any = {};
  rol_id: any;

  startX: number = 0;
  endX: number = 0;
  interak: any;

  /* Interaccion */
  id_inter: any;
  id_dest: any;
  constructor(private router: Router, private db: DbService, private modalController: ModalController) {
    this.coincidencia = {};
  }

  ngOnInit() {
    this.rol_id = localStorage.getItem('rol_id');

    this.db.dbState().subscribe(res => {
      if (res) {
        const usuarioIniciadoId = localStorage.getItem('user_id');

        // Obtener la lista de likes del usuario iniciado
        this.db.likePorUsuario(usuarioIniciadoId).then(likes => {
          const usuariosConLikes = likes.map(like => like.usuario_dest);

          // Obtener la lista completa de usuarios
          this.db.fetchUsuario().subscribe(
            (usuarios) => {
              // Filtrar la lista de usuarios excluyendo al usuario iniciado y a aquellos con likes
              this.arregloUsuarios = usuarios
                .filter(usuario => usuario.id_usuario !== usuarioIniciadoId && !usuariosConLikes.includes(usuario.id_usuario))
                .map(usuario => ({
                  ...usuario,
                  edad: this.calcularEdad(usuario.edad),
                }));
            },
            (error) => {
              console.error('Error al obtener datos de usuarios:', error);
            }
          );

          // Obtener la lista de mascotas
          this.db.fetchMascota().subscribe(
            (mascotas) => {
              // Filtrar la lista de mascotas excluyendo aquellas que pertenecen a usuarios que tienen likes
              this.arregloMascotas = mascotas
                .filter(mascota => !usuariosConLikes.includes(mascota.id_usuario));
            },
            (error) => {
              console.error('Error al obtener datos de mascotas:', error);
            }
          );
        });
      }
    });
  }

  goTo(page: string) {
    this.router.navigateByUrl(page);
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
  touchStart(evt: any) {
    this.startX = evt.touches[0].pageX;
  }

  touchMove(evt: any, index: number) {
    let deltaX = this.startX - evt.touches[0].pageX;
    let deg = deltaX / 10;
    this.endX = evt.touches[0].pageX;

    // Gesto de Swipe
    (<HTMLStyleElement>document.getElementById("card-" + index)).style.transform = "translateX(" + -deltaX + "px) rotate(" + -deg + "deg)";

    // Funciones de interacción
    if ((this.endX - this.startX) < 0) {
      (<HTMLStyleElement>document.getElementById("reject-icon")).style.opacity = String(deltaX / 100);
      console.log('DontLike');
    } else {
      (<HTMLStyleElement>document.getElementById("accept-icon")).style.opacity = String(-deltaX / 100);
      console.log('Like');
    }
  }

  touchEnd(index: number, id_usuario: string) {
    if (this.endX > 0) {
      let finalX = this.endX - this.startX;

      if (finalX > -100 && finalX < 100) {
        (<HTMLScriptElement>document.getElementById("card-" + index)).style.transition = ".3s";
        (<HTMLScriptElement>document.getElementById("card-" + index)).style.transform = "translateX(0px) rotate(0deg)";
        this.interak = 'None';
        // Transición
        setTimeout(() => {
          (<HTMLStyleElement>document.getElementById("card-" + index)).style.transition = "0s";
        }, 350);
      } else if (finalX <= -100) {
        (<HTMLScriptElement>document.getElementById("card-" + index)).style.transition = ".3s";
        (<HTMLScriptElement>document.getElementById("card-" + index)).style.transform = "translateX(-1000px) rotate(-30deg)";
        this.interak = 'DontLike';
        // Remover usuario
        setTimeout(() => {
          console.log('like');
          this.arregloUsuarios.splice(index, 1);
        }, 100);
      } else if (finalX >= 100) {
        (<HTMLScriptElement>document.getElementById("card-" + index)).style.transition = ".3s";
        (<HTMLScriptElement>document.getElementById("card-" + index)).style.transform = "translateX(1000px) rotate(30deg)";
        this.interak = 'like';
        this.id_dest = id_usuario;
        // Remover usuario
        setTimeout(() => {
          this.arregloUsuarios.splice(index, 1);
        }, 100);
      }
      if (this.interak === 'like') {
        const id_user_inter = localStorage.getItem('user_id');
        const id_user_dest = this.id_dest;
        this.db.dbState().subscribe(res => {
          if (res) {
            this.db.agregarLikes(id_user_inter, id_user_dest).then(() => {
              console.log('Like agregado con éxito');
              this.db.verificarLiked(id_user_dest, id_user_inter)
                .then(async id_dest => {
                  if (id_dest) {
                    this.setOpen(true);
                    this.db.agregarChat(id_user_inter, id_user_dest);
                    console.log('Resultado de verificarLiked:', id_dest);
                  }
                })
                .catch(error => {
                  console.error('Error al verificar likes:', error);
                });
            })
              .catch(error => {
                console.error('Error al agregar like:', error);
              });
          }
        })
      }
      console.log("coincide o no:" + this.interak);
      // Reset
      this.startX = 0;
      this.endX = 0;
      (<HTMLStyleElement>document.getElementById("reject-icon")).style.opacity = "0";
      (<HTMLStyleElement>document.getElementById("accept-icon")).style.opacity = "0";
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
}
