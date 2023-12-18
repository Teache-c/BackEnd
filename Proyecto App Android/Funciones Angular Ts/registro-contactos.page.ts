import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-registro-contactos',
  templateUrl: './registro-contactos.page.html',
  styleUrls: ['./registro-contactos.page.scss'],
})

export class RegistroContactosPage implements OnInit {
  isAlertOpen = false;
  alertButtons = ['✌ ¡Entendido! 👍'];

  profileForm = this.formBuilder.group({
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
    ]],
    telefono: ['', [Validators.required, Validators.pattern(/^\+569\d{8}$/)]],
    nombreCalle: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_\u00C0-\u017F]+( [a-zA-Z0-9_\u00C0-\u017F]+)*$')]],
    numeroCalle: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(4), Validators.pattern('^[0-9]+$')]],
    comuna: ['', [Validators.required]],
    region: ['', [Validators.required]]
  });

  /* Regiones */
  arregloRegion: any = [
    {
      id_region: '',
      nombre_region: ''
    }
  ]
  /* Comunas */
  arregloComuna: any = [
    {
      id_comuna: '',
      nombre_comuna: '',
      id_region: ''
    }
  ]

  /* Direccion */
  nombre_calle = "";
  numero_calle = "";
  id_comuna = "";

  /* Usuario */
  img_usuario = "";
  nombre_usuario = "";
  apellido_usuario = "";
  edad = "";
  clave = "";
  id_rol = "";
  descripcion = "";

  /* Pregunta Respuesta */
  pregunta = "";
  respuesta = "";

  constructor(private router: Router, private activedRouter: ActivatedRoute, private formBuilder: FormBuilder, private db: DbService) {
    this.activedRouter.queryParams.subscribe(param => {
      if (this.router.getCurrentNavigation()?.extras.state) {
        this.img_usuario = this.router.getCurrentNavigation()?.extras?.state?.['img_usuario'];
        this.nombre_usuario = this.router.getCurrentNavigation()?.extras?.state?.['nombre_usuario'];
        this.apellido_usuario = this.router.getCurrentNavigation()?.extras?.state?.['apellido_usuario'];
        this.edad = this.router.getCurrentNavigation()?.extras?.state?.['edad'];
        this.descripcion = this.router.getCurrentNavigation()?.extras?.state?.['descripcion'];
        this.id_rol = this.router.getCurrentNavigation()?.extras?.state?.['id_rol'];
        this.clave = this.router.getCurrentNavigation()?.extras?.state?.['clave'];
        this.pregunta = this.router.getCurrentNavigation()?.extras?.state?.['pregunta'];
        this.respuesta = this.router.getCurrentNavigation()?.extras?.state?.['respuesta'];
      }
    })
  }

  enviar() {
    const nombre_calle = this.profileForm.value.nombreCalle;
    const numero_calle = this.profileForm.value.numeroCalle;
    const id_comuna = this.profileForm.value.comuna;
    this.setOpen(true);
    // Primero, agregar dirección y obtener su ID
    this.db.agregarDireccion(nombre_calle, numero_calle, id_comuna)
      .then(id_direccion => {
        console.log('Creacion creada:', id_direccion, nombre_calle, numero_calle, id_comuna);
        const img_usuario = this.img_usuario;
        const nombre_usuario = this.nombre_usuario;
        const apellido_usuario = this.apellido_usuario;
        const edad = this.edad;
        const email = this.profileForm.value.email;
        const clave = this.clave;
        const numero_telefono = this.profileForm.value.telefono;
        const id_rol = this.id_rol;
        const descripcion = this.descripcion;
        this.db.agregarUsuarios(img_usuario, nombre_usuario, apellido_usuario, edad, descripcion, email, clave, numero_telefono, id_direccion, id_rol)
          .then(id_usuario => {
            // Almacenar información del usuario en el Local Storage
            localStorage.setItem('user_id', id_usuario.ID_USUARIO);
            // Finalmente, agregar la respuesta a la pregunta con el ID de usuario obtenido
            console.log('Creacion creada:', 'nombre apellido:', nombre_usuario, apellido_usuario, 'edad:', edad, 'correo:', email, 'pass:', clave, 'numero:', numero_telefono, 'id direccion:', id_direccion, 'rol:', id_rol);
            const pregunta = this.pregunta;
            const respuesta = this.respuesta;
            this.db.agregarPreguntaRespuesta(pregunta, respuesta, id_usuario)
              .then(() => {
                // Proceso completo
                console.log('Creacion creada:', 'nombre apellido:', nombre_usuario, apellido_usuario, 'edad:', edad, 'correo:', email, 'pass:', clave, 'numero:', numero_telefono, 'id direccion:', id_direccion, 'rol:', id_rol, 'Img:', img_usuario);
                /* this.db.presentAlert("Registro Realizado"); */

                this.router.navigate(['/home']);
              })
              .catch(error => {
                /* this.db.presentAlert("Error pregunta respuesta"); */
              });
          })
          .catch(error => {
            /* this.db.presentAlert("Error usuario"); */
          });
      })
      .catch(error => {
        /* this.db.presentAlert("Error direccion"); */
      });
  }

  ngOnInit() {
    this.db.dbState().subscribe(res => {
      if (res) {
        this.db.fetchComunas().subscribe(item => {
          this.arregloComuna = item;
        })
        this.db.fetchRegion().subscribe(item => {
          this.arregloRegion = item;
        })
      }
    });
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }

  /* Validacion de correo */
  getCorreoMessage() {
    const emailControl = this.profileForm.controls.email;

    if (emailControl.hasError('required')) {
      return 'Este campo es requerido*';
    }
    if (emailControl.hasError('email')) {
      return 'El formato del correo electrónico no es válido';
    }
    if (emailControl.hasError('pattern')) {
      return 'El formato del correo electrónico no es válido';
    }
    return '';
  }
  /* Validacion de numero de telefono */
  getTelefonoMessage() {
    const telefonoControl = this.profileForm.controls.telefono;
    if (telefonoControl.hasError('required')) {
      return 'Este campo es requerido*';
    }
    if (telefonoControl.hasError('pattern')) {
      return 'Ingrese un número válido (+569 seguido de 8 dígitos).';
    }

    return '';
  }
  getRegionMessage() {
    const regionControl = this.profileForm.controls.region;
    if (regionControl.hasError('required')) {
      return 'Este campo es requerido'
    }
    return ''
  }
  getNombreCalleMessage() {
    const nombreCalleControl = this.profileForm.controls.nombreCalle;

    if (nombreCalleControl.hasError('required')) {
      return 'Este campo es requerido*';
    }
    if (nombreCalleControl.hasError('pattern')) {
      return 'Ingrese una dirección válida.';
    }
    return '';
  }

  getNumeroCalleMessage() {
    const numeroCalleControl = this.profileForm.controls.numeroCalle;

    if (numeroCalleControl.hasError('required')) {
      return 'Este campo es requerido*';
    }
    if (numeroCalleControl.hasError('minLength')) {
      return 'La contraseña debe tener minimo 2 caracteres';
    }
    if (numeroCalleControl.hasError('maxLength')) {
      return 'La contraseña debe tener máximo 4 caracteres';
    }
    if (numeroCalleControl.hasError('pattern')) {
      return 'Ingrese un número válido';
    }
    return '';
  }

  getComunaMessage() {
    const comunaControl = this.profileForm.controls.comuna;

    if (comunaControl.hasError('required')) {
      return 'Este campo es requerido*';
    }
    return '';
  }
}
