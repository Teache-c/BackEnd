import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { DbService } from 'src/app/services/db.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-registro-usuario',
  templateUrl: './registro-usuario.page.html',
  styleUrls: ['./registro-usuario.page.scss'],
})
export class RegistroUsuarioPage implements OnInit {

  /* Obtener formulario */
  profileForm = this.formBuilder.group({
    imagen: ['', [Validators.required]],
    nombre: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑ\u00C0-\u017F]*')]],
    apellido: ['', [Validators.required, Validators.pattern('[a-zA-Z\u00C0-\u017F]*')]],
    edad: ['', [Validators.required, this.edadMayor.bind(this)]],
    rol: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9,._\u00C0-\u017F]+( [a-zA-Z0-9,._\u00C0-\u017F]+)*$')]],
    contrasenia: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>/?]).*$')
    ]],
    repetirContrasenia: ['', [
      Validators.required,
    ]],
    pregunta: ['', [Validators.required]],
    respuesta: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9,._\u00C0-\u017F]+( [a-zA-Z0-9,._\u00C0-\u017F]+)*$')]],
    
  });

  /* Arreglos para almacenar datos y mostrar */
  arregloRol: any = [
    {
      id_rol: '',
      nombre_rol: ''
    }
  ]

  compareWith: any;

  constructor(private router: Router, private formBuilder: FormBuilder, private db: DbService) { }

  enviar() {
    const img_usuario = this.profileForm.value.imagen;
    const nombre_usuario = this.profileForm.value.nombre;
    const apellido_usuario = this.profileForm.value.apellido;
    const edad = this.profileForm.value.edad;
    const descripcion = this.profileForm.value.descripcion;
    const id_rol = this.profileForm.value.rol;
    const clave = this.profileForm.value.contrasenia;
    const pregunta = this.profileForm.value.pregunta;
    const respuesta = this.profileForm.value.respuesta;

    let navigationExtras: NavigationExtras = {
      state: {
        img_usuario: img_usuario,
        nombre_usuario: nombre_usuario,
        apellido_usuario: apellido_usuario,
        edad: edad,
        descripcion: descripcion,
        id_rol: id_rol,
        clave: clave,
        pregunta: pregunta,
        respuesta: respuesta
      }
    }
    this.router.navigate(['/registro-contactos'], navigationExtras);
  }

  ngOnInit() {
    this.db.dbState().subscribe(res => {
      if (res) {
        this.db.fetchRol().subscribe(item => {
          this.arregloRol = item;
        })
      }
    })
  }

  /* Camara */
  takePicture = async () => {
    const image2 = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt
    });
    console.log('Imagen capturada:', image2.dataUrl);
    this.profileForm.patchValue({ imagen: image2.dataUrl });
  };

  /* Validar IMG */
  getImagenMessage() {
    const imagenControl = this.profileForm.controls.imagen;

    if (imagenControl.hasError('required')) {
      return 'La selección de imagen es obligatoria*';
    }

    return '';
  }
  /* Validar Nombre Apellido */
  getNombreMessage() {
    const nombreControl = this.profileForm.controls.nombre;

    if (nombreControl.hasError('required')) {
      return 'Este campo es requerido*';
    }

    if (nombreControl.hasError('pattern')) {
      return 'Ingrese un nombre válido';
    }
    return '';
  }

  getApellidoMessage() {
    const apellidoControl = this.profileForm.controls.apellido;

    if (apellidoControl.hasError('required')) {
      return 'Este campo es requerido*';
    }

    if (apellidoControl.hasError('pattern')) {
      return 'Ingrese un apellido válido';
    }
    return '';
  }
  /* Validacion edad */
  edadMayor(control: any) {
    const fechaNacimiento = control.value;

    if (!fechaNacimiento) {
      return null;
    }

    const partesFecha = fechaNacimiento.split('-');
    const dia = parseInt(partesFecha[2], 10); // Día
    const mes = parseInt(partesFecha[1], 10); // Mes
    const anio = parseInt(partesFecha[0], 10); // Año

    const fechaNacimientoDate = new Date(anio, mes - 1, dia);

    const hoy = new Date();
    const edadMilisegundos = hoy.getTime() - fechaNacimientoDate.getTime();
    const edad = Math.floor(edadMilisegundos / (365.25 * 24 * 60 * 60 * 1000)); 

    if (edad < 18) {
      return { edadMenor: true };
    }

    return null;
  }

  getEdadMessage() {
    const edadControl = this.profileForm.controls.edad;

    if (edadControl.hasError('required')) {
      return 'Este campo es requerido*';
    }

    if (edadControl.hasError('edadMenor')) {
      return 'Debes tener al menos 18 años';
    }

    return '';
  }
  /* validacion para selecion de rol */
  getRolMessage() {
    const rolControl = this.profileForm.controls.rol;

    if (rolControl.hasError('required')) {
      return 'La selección es obligatoria*';
    }

    return '';
  }
  /* Validacion descripcion */
  getDescripcionMessage() {
    const descripcionControl = this.profileForm.controls.descripcion;
    if (descripcionControl.hasError('required')) {
      return 'Este campo es requerido*'
    }
    if (descripcionControl.hasError('pattern')) {
      return 'Ingrese una descripción válida';
    }
    return '';
  }
  /* Validar contrasenia */
  getContraseniaMessage() {
    const contraseniaControl = this.profileForm.controls.contrasenia;

    if (contraseniaControl.hasError('required')) {
      return 'Este campo es requerido*';
    }

    if (contraseniaControl.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    if (contraseniaControl.hasError('maxlength')) {
      return 'La contraseña debe tener máximo 20 caracteres';
    }

    if (contraseniaControl.hasError('pattern')) {
      return 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial';
    }

    return '';
  }
  
  getRepetirContraseniaMessage() {
    const repetirContraseniaControl = this.profileForm.controls.repetirContrasenia;
    if (repetirContraseniaControl.hasError('required')) {
      return 'Este campo es requerido*';
    }
    const contrasenia = this.profileForm.get('contrasenia')?.value;
    const contraseniaRep = this.profileForm.get('repetirContrasenia')?.value;
    if (contrasenia !== contraseniaRep) {
      repetirContraseniaControl.setErrors({ 'noCoincide': true });
      return 'Las contraseñas no coinciden';
    }else{
      repetirContraseniaControl.setErrors(null);
    }
    return '';
  }
  getPreguntaMessage() {
    const preguntaControl = this.profileForm.controls.pregunta;
    if (preguntaControl.hasError('required')) {
      return 'Este campo es requerido*';
    }
    return '';
  }
  getRespuestaMessage() {
    const respuestaControl = this.profileForm.controls.respuesta;
    if (respuestaControl.hasError('required')) {
      return 'Este campo es requerido*'
    }
    return '';
  }

}
