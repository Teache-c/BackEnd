import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { FormBuilder, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService } from 'src/app/services/db.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-modificar-mascota',
  templateUrl: './modificar-mascota.page.html',
  styleUrls: ['./modificar-mascota.page.scss'],
})
export class ModificarMascotaPage implements OnInit {

  @ViewChild('modalEspecie') modalEspecie!: IonModal;
  @ViewChild('modalVacuna') modalVacuna!: IonModal;

  modalCerradoSinSeleccion: boolean = false;
  modalCerradoSinSeleccionVacuna: boolean = false;

  especies = ['Felino', 'Canino', 'Ave', 'Roedor'];

  formMascota = this.formBuilder.group({
    img: ['', [Validators.required]],
    nombreMascota: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_\u00C0-\u017F]+( [a-zA-Z0-9_\u00C0-\u017F]+)*$')]],
    edad: ['', [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
      ModificarMascotaPage.edadMaximaValidator(),
    ]],
    tiempo: ['', [Validators.required]],
    nroChip: ['', [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
      Validators.minLength(10),
      Validators.maxLength(15)
    ]],
    tratamiento: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_\u00C0-\u017F]+( [a-zA-Z0-9_\u00C0-\u017F]+)*$')]],
    descripcion: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_\u00C0-\u017F]+( [a-zA-Z0-9_\u00C0-\u017F]+)*$')]],
    tamanio: ['', [Validators.required]],
    especie: ['', [Validators.required]],
    vacuna: ['', [Validators.required
    ]]
  });

  image: string | undefined;

  /*Molde mascota*/
  id_mascota = "";
  mascota_img = "";
  nombre_mascota = "";
  edad_mascota = "";
  tiempo = "";
  tratamiento = "";
  descripcion = "";
  especie2 = "";
  vacuna = "";
  tamanio = "";
  id_usuario = "";

  constructor(private router: Router, private formBuilder: FormBuilder, private db: DbService) { }

  /* Enviar formulario */
  enviar() {
    if (this.formMascota.valid) {
      
      const user_id = localStorage.getItem('user_id'); 

      this.db.obtenerIdMascotaPorUsuario(user_id)
        .then((id_mascota) => {
          // Modificar Mascota
          const mascota_img = this.formMascota.value.img;
          const nombre_mascota = this.formMascota.value.nombreMascota;
          const edad_mascota = this.formMascota.value.edad;
          const tratamiento = this.formMascota.value.tratamiento;
          const descripcion = this.formMascota.value.descripcion;
          const especie2 = this.formMascota.value.especie;
          const vacuna = this.formMascota.value.vacuna;
          const tamanio = this.formMascota.value.tamanio;
          this.db.modificarMascota(mascota_img, nombre_mascota, edad_mascota, tratamiento, descripcion, especie2, vacuna, tamanio, id_mascota)
          /* this.db.presentAlert('Modificacion Realizada'); */
          this.router.navigate(['/perfil-mascota']);                                  
        })
        .catch((error) => {
          console.error('Error al obtener el ID de la mascota:', error);
        });
    } else {
      console.log('Error al almacenar los datos')
    }
  }

  ngOnInit() {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      console.log('el token es:' + user_id)
      this.db.dbState().subscribe(res => {
        if (res) {
          this.db.obtenerMascotaUserActual(user_id).then(mascota => {
            if (mascota) {
              this.formMascota.patchValue({
                img: mascota.IMG_MASCOTA,
                nombreMascota: mascota.NOMBRE_MASCOTA,
                edad: mascota.EDAD_MASCOTA,
                tiempo: 'Años',
                nroChip: mascota.NUMERO_CHIP,
                tratamiento: mascota.TRATAMIENTO,
                descripcion: mascota.DESCRIPCION,
                tamanio: mascota.TAMANIO,
                especie: mascota.ESPECIE,
                vacuna: mascota.VACUNA,
              });
            }
          });
        }
      });
    }
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
    this.formMascota.patchValue({ img: image2.dataUrl });
  };
  /* Validar IMG */
  getImagenMessage() {
    const imagenControl = this.formMascota.controls.img;
  
    if (imagenControl.hasError('required')) {
      return 'La selección de imagen es obligatoria*';
    }
  
    return '';
  }

  /* Modal de especie */
  especie(event: any) {
    const especieControl = this.formMascota.controls.especie;
    if (event && event.detail && event.detail.role === 'backdrop') {
      this.modalCerradoSinSeleccion = true;
      especieControl.markAsTouched();
    } else {
      this.modalCerradoSinSeleccion = false;
    }
  }

  /* Validacion nombre mascota */
  getNombreMascotaMessage() {
    const nombreMascotaControl = this.formMascota.controls.nombreMascota;
    if (nombreMascotaControl.hasError('required')) {
      return 'Este campo es requerido*'
    }
    if (nombreMascotaControl.hasError('pattern')) {
      return 'Ingrese un nombre válido';
    }
    return '';
  }

  /* Validacion edad */
  static edadMaximaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const edad = control.value;
      if (edad !== null && (isNaN(edad) || edad < 0 || edad > 30)) {
        return { 'edadMaxima': true };
      }
      return null;
    };
  }

  getTiempoMessage() {
    const tiempoValidate = this.formMascota.controls.tiempo;
    if (tiempoValidate.hasError('required')) {
      return 'Este campo es requerido*'
    }
    return '';
  }

  getEdadMessage() {
    const edadControl = this.formMascota.controls.edad;

    if (edadControl.hasError('required')) {
      return 'Este campo es requerido*';
    }
    if (edadControl.hasError('pattern') || edadControl.hasError('edadMaxima')) {
      return 'Ingrese una edad válida';
    }

    return '';
  }

  getNroChipMessage() {
    const nroChipControl = this.formMascota.controls.nroChip;

    if (nroChipControl.hasError('required')) {
      return 'Este campo es requerido*';
    }

    if (nroChipControl.hasError('pattern')) {
      return 'Ingrese un número de chip válido';
    }

    if (nroChipControl.hasError('minlength')) {
      return 'El número de chip debe tener al menos 10 caracteres';
    }

    if (nroChipControl.hasError('maxlength')) {
      return 'El número de chip no puede tener más de 15 caracteres';
    }

    return '';
  }

  getTratamientoMessage() {
    const tratamientoControl = this.formMascota.controls.tratamiento;

    if (tratamientoControl.hasError('required')) {
      return 'Este campo es requerido*';
    }

    if (tratamientoControl.hasError('pattern')) {
      return 'Ingrese un tratamiento válido';
    }

    return '';
  }

  /* Validacion descripcion */
  getDescripcionMessage() {
    const descripcionControl = this.formMascota.controls.descripcion;
    if (descripcionControl.hasError('required')) {
      return 'Este campo es requerido*'
    }
    if (descripcionControl.hasError('pattern')) {
      return 'Ingrese una descripción válida';
    }
    return '';
  }

  /* Validacion photo */
  getPhotoMessage() {
    const photoControl = this.formMascota.controls.img;

    if (photoControl.hasError('required')) {
      return 'la seleccion de foto es obligatoria'
    }
    return '';
  }
  /* Validacion especie */
  getEspecieMessage() {
    const especialControl = this.formMascota.controls.vacuna;

    if (especialControl.hasError('required')) {
      return 'La selección de especie es obligatoria';
    }

    return '';
  }

  /* Validacion vacunas */
  getVacunaMessage() {
    const vacunaControl = this.formMascota.controls.vacuna;

    if (vacunaControl.hasError('required')) {
      return 'La selección de vacuna es obligatoria*';
    }

    return '';
  }
  getTamanioMessage() {
    const tamanioControl = this.formMascota.controls.tamanio;
    if (tamanioControl.hasError('required')) {
      return 'La selección del tamaño es obligatoria*'
    }
    return '';
  }

}
