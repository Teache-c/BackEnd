import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { MASCOTAS } from './mascotas';
import { USUARIOS } from './usuarios';
import { REGION } from './region';
import { COMUNAS } from './comunas';
import { DIRECCION } from './direccion';
import { COINCIDENCIA } from './coincidencia';
import { CHAT } from './chat';
import { Rol } from './rol';
import { PreguntaRespuesta } from './pregunta-respuesta';
import { AuthServiceService } from './auth-service.service';
import { LIKES } from './likes';
import { MENSAJES } from './mensajes';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  //Variable para la conexion de BD
  public database!: SQLiteObject;
  //Variables de creación de tablas
  /* Region */
  tablaRegion: string = "CREATE TABLE IF NOT EXISTS REGION(ID_REGION INTEGER PRIMARY KEY AUTOINCREMENT, NOMBRE_REGION VARCHAR(50) NOT NULL);";
  /* Direccion */
  tablaDireccion: string = "CREATE TABLE IF NOT EXISTS DIRECCION(ID_DIRECCION INTEGER PRIMARY KEY AUTOINCREMENT, NOMBRE_CALLE VARCHAR (50) NOT NULL, NUMERO_CALLE INTEGER (5) NOT NULL, ID_COMUNA INTEGER REFERENCES COMUNA (ID_COMUNA) NOT NULL);";
  /* Comuna */
  tablaComuna: string = "CREATE TABLE IF NOT EXISTS COMUNAS(ID_COMUNA INTEGER PRIMARY KEY AUTOINCREMENT, NOMBRE_COMUNA VARCHAR(50) NOT NULL, ID_REGION INTEGER REFERENCES REGION (ID_REGION) NOT NULL);";

  /* Rol */
  tablaRol: string = "CREATE TABLE IF NOT EXISTS ROL (ID_ROL INTEGER PRIMARY KEY AUTOINCREMENT, NOMBRE_ROL TEXT (255));";

  /* Usuario */
  tablaUsuario: string = "CREATE TABLE IF NOT EXISTS USUARIO (ID_USUARIO INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, IMG_USUARIO BLOB NOT NULL, NOMBRE_USUARIO   TEXT(255) NOT NULL, APELLIDO_USUARIO TEXT(255) NOT NULL, EDAD INTEGER(3) NOT NULL, DESCRIPCION TEXT(255) NOT NULL, EMAIL TEXT(255) NOT NULL, CLAVE TEXT(255) NOT NULL, NUMERO_TELEFONO TEXT(255) NOT NULL, ID_DIRECCION INTEGER REFERENCES DIRECCION (ID_DIRECCION) NOT NULL, ID_ROL INTEGER NOT NULL REFERENCES ROL(ID_ROL));";
  /* Pregunta y respuesta */
  PreguntaRespuesta: string = "CREATE TABLE IF NOT EXISTS PREGUNTARESPUESTA (ID_PreguntaRespuesta INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, PREGUNTA TEXT(255), RESPUESTA TEXT(255), ID_USUARIO INTEGER NOT NULL REFERENCES USUARIO(ID_USUARIO));";
  /* Mascota */
  tablaMascotas: string = "CREATE TABLE IF NOT EXISTS MASCOTAS(ID_MASCOTA INTEGER PRIMARY KEY AUTOINCREMENT, IMG_MASCOTA BLOB, NOMBRE_MASCOTA VARCHAR(20) NOT NULL, EDAD_MASCOTA   INTEGER (3)  NOT NULL, NUMERO_CHIP INTEGER (20) NOT NULL, TRATAMIENTO TEXT (255) NOT NULL, DESCRIPCION TEXT (255) NOT NULL, ESPECIE VARCHAR (30) NOT NULL, VACUNA VARCHAR (10) NOT NULL, TAMANIO  VARCHAR(20)  NOT NULL, ID_USUARIO INTEGER REFERENCES USUARIO (ID_USUARIO) NOT NULL);";
  /* likes */
  tablaLikes: string = "CREATE TABLE IF NOT EXISTS LIKES(ID_LIKE INTEGER PRIMARY KEY AUTOINCREMENT, USUARIO_INTERESADO INTEGER NOT NULL REFERENCES USUARIO(ID_USUARIO), USUARIO_DESTINATARIO INTEGER NOT NULL REFERENCES USUARIO(ID_USUARIO));";
  /* Chat */
  tablaChat: string = "CREATE TABLE IF NOT EXISTS CHAT (ID_CHAT INTEGER PRIMARY KEY AUTOINCREMENT, ID_REMITENTE INTEGER NOT NULL REFERENCES USUARIO (ID_USUARIO), ID_DESTINATARIO INTEGER NOT NULL REFERENCES USUARIO (ID_USUARIO));";
  /* Mensajes */
  tablaMensajes: string = "CREATE TABLE IF NOT EXISTS MENSAJES (ID_MENSAJE INTEGER PRIMARY KEY AUTOINCREMENT, MENSAJE VARCHAR (255) NOT NULL, ID_USUARIO INTEGER NOT NULL REFERENCES USUARIO(ID_USUARIO), ID_CHAT INTEGER NOT NULL REFERENCES CHAT(ID_CHAT));";
  //Variables para los insert iniciales
  /* Rol */
  registroRol1: string = "INSERT or IGNORE INTO ROL (ID_ROL, NOMBRE_ROL) VALUES (1,'Adoptar');  ";
  registroRol2: string = "INSERT or IGNORE INTO ROL (ID_ROL, NOMBRE_ROL) VALUES (2,'Adopción');";

  /* Region */
  registroRegion: string = "INSERT or IGNORE INTO REGION(ID_REGION, NOMBRE_REGION) VALUES(1, 'Región Metropolitana');";
  registroCerrillos: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (1, 'Cerrillos' ,1)";
  registroCerroNavia: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (2, 'Cerro Navia' ,1)";
  registroConchali: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (3, 'Conchalí' ,1)";
  registroElBosque: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (4, 'El Bosque' ,1)";
  registroEstacionCentral: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (5, 'Estación Central' ,1)";
  registroHuechuraba: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (6, 'Huechuraba' ,1)";
  registroIndependencia: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (7, 'Independencia' ,1)";
  registroLaCisterna: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (8, 'La Cisterna' ,1)";
  registroLaFlorida: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (9, 'La Florida' ,1)";
  registroLaGranja: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (10, 'La Granja' ,1)";
  registroLaPintana: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (11, 'La Pintana' ,1)";
  registroLaReina: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (12, 'La Reina' ,1)";
  registroLasCondes: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (13, 'LasCondes' ,1)";
  registroLoBarnechea: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (14, 'LoBarnechea' ,1)";
  registroLoEspejo: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (15, 'Lo Espejo' ,1)";
  registroLoPrado: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (16, 'LoPrado' ,1)";
  registroMacul: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (17, 'Macul' ,1)";
  registroMaipu: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (18, 'Maipú' ,1)";
  registroNunoa: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (19, 'Ñuñoa' ,1)";
  registroLaPac: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (20, 'Pedro Aguirre Cerda' ,1)";
  registroPenalolen: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (21, 'Peñalolén' ,1)";
  registroProvidencia: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (22, 'Providencia' ,1)";
  registroPudahuel: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (23, 'Pudahuel' ,1)";
  registroQuilicura: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (24, 'Quilicura' ,1)";
  registroQuintaNormal: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (25, 'Quinta Normal' ,1)";
  registroRecoleta: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (26, 'Recoleta' ,1)";
  registroRenca: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (27, 'Renca' ,1)";
  registroSanJoaquin: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (28, 'San Joaquín' ,1)";
  registroSanMiguel: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (29, 'San Miguel' ,1)";
  registroSanRamon: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (30, 'San Ramón' ,1)";
  registroSantiago: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (31, 'Santiago' ,1)";
  registroVitacura: string = "INSERT or IGNORE INTO COMUNAS(ID_COMUNA, NOMBRE_COMUNA, ID_REGION) VALUES (32, 'Vitacura' ,1)";

  // creacion observables para las tablas que se consultaran
  /* Direccion */
  listaDireccion = new BehaviorSubject([]);

  /* REGION */
  listaRegiones = new BehaviorSubject([]);

  /* COMUNAS */
  listaComunas = new BehaviorSubject([]);

  /* Rol */
  listaRol = new BehaviorSubject([]);

  /* Usuario */
  listaUsuarios = new BehaviorSubject([]);
  listaPreguntaRespuesta = new BehaviorSubject([]);

  /* Mascota */
  listaMascotas = new BehaviorSubject([]);
  /* Likes */
  listaLikes = new BehaviorSubject([]);
  /* Chat */
  listaChat = new BehaviorSubject([]);
  /* Mensajes */
  listaMensajes = new BehaviorSubject([]);
  //observable para manipular el status de la BD
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private alertController: AlertController, public sqlite: SQLite, private platform: Platform, authService: AuthServiceService) {
    this.crearBD();
  }
  /* obserbale del status de la DB */
  dbState() {
    return this.isDBReady.asObservable();
  }
  /* Direccion */
  fetchDireccion(): Observable<DIRECCION[]> {
    return this.listaDireccion.asObservable();
  }

  buscarDireccion() {
    return this.database.executeSql('SELECT * FROM Direccion', []).then(res => {
      //creamos una variable para almacenar los registros del select
      let items: DIRECCION[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id_direccion: res.rows.item(i).ID_DIRECCION,
            nombre_calle: res.rows.item(i).NOMBRE_CALLE,
            numero_calle: res.rows.item(i).NUMERO_CALLE,
            id_comuna: res.rows.item(i).ID_COMUNA
          })
        }
      }
      this.listaDireccion.next(items as any);
    })
  }
  eliminarDirecion(id_direccion: any) {
    return this.database.executeSql('DELETE FROM DIRECCION WHERE id_direccion = ?', [id_direccion]).then(res => {
      //llamar funcion creada anteriormente
      this.buscarDireccion();
    })
  }
  agregarDireccion(nombre_calle: any, numero_calle: any, id_comuna: any) {
    return this.database.executeSql('INSERT INTO DIRECCION (NOMBRE_CALLE, NUMERO_CALLE, ID_COMUNA) VALUES (?,?,?)', [nombre_calle, numero_calle, id_comuna]).then(res => {
      // Verificar si la inserción tuvo éxito
      if (res.rowsAffected > 0) {
        // La inserción tuvo éxito, devuelve el ID de la dirección recién creada
        const id_direccion = res.insertId;
        this.buscarDireccion();
        return id_direccion;
      } else {
        // La inserción no tuvo éxito, devuelve un valor nulo
        return null;
      }
    })
      .catch(error => {
        console.error('Error al insertar dirección:', error);
        return null;
      });
  }
  modificarDireccion(id_direccion: any, nombre_calle: any, numero_calle: any, id_comuna: any) {
    return this.database.executeSql('UPDATE DIRECCION SET NOMBRE_CALLE = ?, NUMERO_CALLE = ?, ID_COMUNA = ? WHERE ID_DIRECCION = ?', [nombre_calle, numero_calle, id_comuna, id_direccion]).then(res => {
      this.buscarDireccion();
    })
  }
  /* Region */
  fetchRegion(): Observable<REGION[]> {
    return this.listaRegiones.asObservable();
  }
  buscarRegion() {
    return this.database.executeSql('SELECT * FROM REGION', []).then(res => {
      //creamos una variable para almacenar los registros del select
      let items: REGION[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id_region: res.rows.item(i).ID_REGION,
            nombre_region: res.rows.item(i).NOMBRE_REGION
          })
        }
      }
      this.listaRegiones.next(items as any);
    })
  }
  /* Comuna */
  fetchComunas(): Observable<COMUNAS[]> {
    return this.listaComunas.asObservable();
  }
  buscarComuna() {
    return this.database.executeSql('SELECT * FROM COMUNAS', []).then(res => {
      let items: COMUNAS[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id_comuna: res.rows.item(i).ID_COMUNA,
            nombre_comuna: res.rows.item(i).NOMBRE_COMUNA,
            id_region: res.rows.item(i).ID_DIRECCION
          })
        }
        this.listaComunas.next(items as any);
      }
    })
  }
  /* Usuario */
  fetchUsuario(): Observable<USUARIOS[]> {
    return this.listaUsuarios.asObservable();
  }
  buscarUsuario() {
    //retorno el resultado de la consulta
    return this.database.executeSql('SELECT * FROM USUARIO', []).then(res => {
      //la consulta se realizó correctamente
      //creamos una variable para almacenar los registros del select
      let items: USUARIOS[] = [];
      //validar cuantos registros vienen en el select
      if (res.rows.length > 0) {
        //recorro la consulta dentro del res
        for (var i = 0; i < res.rows.length; i++) {
          //alamaceno los registros en items
          items.push({
            id_usuario: res.rows.item(i).ID_USUARIO,
            img_usuario: res.rows.item(i).IMG_USUARIO,
            nombre_usuario: res.rows.item(i).NOMBRE_USUARIO,
            apellido_usuario: res.rows.item(i).APELLIDO_USUARIO,
            edad: res.rows.item(i).EDAD,
            descripcion: res.rows.item(i).DESCRIPCION,
            email: res.rows.item(i).EMAIL,
            clave: res.rows.item(i).CLAVE,
            numero_telefono: res.rows.item(i).NUMERO_TELEFONO,
            id_direccion: res.rows.item(i).ID_DIRECCION,
            id_rol: res.rows.item(i).ID_ROL,
            id_coincidencia: res.rows.item(i).ID_COINCIDENCIA
          })
        }
      }
      this.listaUsuarios.next(items as any);
    })
  }
  eliminarUsuario(id_usuario: any) {
    return this.database.executeSql('DELETE FROM USUARIO WHERE ID_USUARIO = ?', [id_usuario]).then(res => {
      //se llama a la funcion ya creada previamente
      this.buscarUsuario();
    })
  }
  agregarUsuarios(img_usuario: any, nombre_usuario: any, apellido_usuario: any, edad: any, descripcion: any, email: any, clave: any, numero_telefono: any, id_direccion: any, id_rol: any) {
    return this.database.executeSql('INSERT INTO USUARIO (IMG_USUARIO, NOMBRE_USUARIO, APELLIDO_USUARIO, EDAD, DESCRIPCION, EMAIL, CLAVE, NUMERO_TELEFONO, ID_DIRECCION, ID_ROL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [img_usuario, nombre_usuario, apellido_usuario, edad, descripcion, email, clave, numero_telefono, id_direccion, id_rol]).then(res => {
      // Verificar si la inserción tuvo éxito
      if (res.rowsAffected > 0) {
        // La inserción tuvo éxito, devuelve el ID del usuario recién creada
        const id_usuario = res.insertId;
        this.buscarUsuario();
        return id_usuario;
      } else {
        // La inserción no tuvo éxito, devuelve un valor nulo
        return null;
      }
    })
      .catch(error => {
        console.error('Error al insertar dirección:', error);
        return null;
      });
  }
  modificarUsuario(id_usuario: any, img_usuario: any, nombre_usuario: any, apellido_usuario: any, email: any, descripcion: any, numero_telefono: any, id_rol: any) {
    return this.database.executeSql('UPDATE USUARIO SET IMG_USUARIO=?, NOMBRE_USUARIO=?, APELLIDO_USUARIO=?, EMAIL=?, DESCRIPCION=?, NUMERO_TELEFONO=?, ID_ROL=? WHERE ID_USUARIO=?', [img_usuario, nombre_usuario, apellido_usuario, email, descripcion, numero_telefono, id_rol, id_usuario]).then(res => {
      this.buscarUsuario();
    })
  }
  getUsuarioActual(id_usuario: any) {
    return this.database.executeSql(`
      SELECT U.IMG_USUARIO, U.NOMBRE_USUARIO, U.APELLIDO_USUARIO, U.EDAD, U.DESCRIPCION, U.EMAIL, U.NUMERO_TELEFONO, U.ID_ROL, C.NOMBRE_COMUNA
      FROM USUARIO U
      JOIN DIRECCION D ON U.ID_DIRECCION = D.ID_DIRECCION
      JOIN COMUNAS C ON D.ID_COMUNA = C.ID_COMUNA
      WHERE U.ID_USUARIO = ?;
    `, [id_usuario])
      .then(user => {
        if (user.rows.length > 0) {
          const usuario = {
            IMG_USUARIO: user.rows.item(0).IMG_USUARIO,
            NOMBRE_USUARIO: user.rows.item(0).NOMBRE_USUARIO,
            APELLIDO_USUARIO: user.rows.item(0).APELLIDO_USUARIO,
            EDAD: user.rows.item(0).EDAD,
            DESCRIPCION: user.rows.item(0).DESCRIPCION,
            EMAIL: user.rows.item(0).EMAIL,
            NUMERO_TELEFONO: user.rows.item(0).NUMERO_TELEFONO,
            ID_ROL: user.rows.item(0).ID_ROL,
            NOMBRE_COMUNA: user.rows.item(0).NOMBRE_COMUNA,
          };
          return usuario;
        } else {
          return null;
        }
      });
  }
  getDireccionUsuario(user_id: any) {
    return this.database.executeSql('SELECT u.ID_DIRECCION, d.NOMBRE_CALLE, d.NUMERO_CALLE, d.ID_COMUNA FROM USUARIO u JOIN DIRECCION d ON u.ID_DIRECCION = d.ID_DIRECCION WHERE u.ID_USUARIO = ?'
      , [user_id]).then(res => {
        if (res.rows.length > 0) {
          const direccion = {
            ID_DIRECCION: res.rows.item(0).ID_DIRECCION,
            NOMBRE_CALLE: res.rows.item(0).NOMBRE_CALLE,
            NUMERO_CALLE: res.rows.item(0).NUMERO_CALLE,
            ID_COMUNA: res.rows.item(0).ID_COMUNA,
          }
          return direccion;
        } else {
          return null;
        }
      });
  }
  verificarCredenciales(email: any, clave: any) {
    return this.database.executeSql('SELECT ID_USUARIO, ID_ROL, EMAIL, CLAVE FROM USUARIO WHERE EMAIL = ? AND CLAVE = ?', [email, clave]).then(res => {
      if (res.rows.length > 0) {
        // Las credenciales son válidas, devolver información del usuario (ID_USUARIO, EMAIL, CLAVE)
        const usuario = res.rows.item(0);
        return usuario;
      } else {
        // No se encontraron resultados, lo que significa que las credenciales son incorrectas
        return null;
      }
    })
  }
  obtenerDireccionUsuario(user_id: any) {
    return this.database.executeSql('SELECT ID_DIRECCION FROM USUARIO WHERE ID_USUARIO = ?', [user_id]).then(res => {
      if (res.rows.length > 0) {
        const id_direccion = res.rows.item(0).ID_DIRECCION;
        return id_direccion;
      } else {
        return null;
      }
    });
  }
  verificarEmail(email: any) {
    return this.database.executeSql('SELECT ID_USUARIO FROM USUARIO WHERE EMAIL = ?', [email]).then(res => {
      if (res.rows.length > 0) {
        // Las credenciales son válidas, devolver información del usuario (ID_USUARIO, EMAIL, CLAVE)
        const id_usuario = res.rows.item(0).ID_USUARIO;
        return id_usuario;
      } else {
        // No se encontraron resultados, lo que significa que las credenciales son incorrectas
        return null;
      }
    })
  }
  obtenerPreguntaRespuesta(id_usuario: any) {
    console.log("ID de usuario: " + id_usuario);
    return this.database
      .executeSql('SELECT PREGUNTA, RESPUESTA FROM PREGUNTARESPUESTA WHERE ID_USUARIO = ?', [id_usuario])
      .then(res => {
        if (res.rows.length > 0) {
          const preguntaRespuesta = {
            PREGUNTA: res.rows.item(0).PREGUNTA,
            RESPUESTA: res.rows.item(0).RESPUESTA,
          };
          console.log("Pregunta y respuesta:" + preguntaRespuesta);
          return preguntaRespuesta;
        } else {
          return null;
        }
      });
  }
  modificarContrasena(id_usuario: any, clave: any) {
    return this.database.executeSql('UPDATE USUARIO SET CLAVE = ? WHERE ID_USUARIO = ?', [clave, id_usuario])
      .then(() => {
        return true;
      })
      .catch(error => {
        console.error('Error al actualizar la contraseña:', error);
        return false;
      });
  }
  /* Rol Observable */
  fetchRol(): Observable<Rol[]> {
    return this.listaRol.asObservable();
  }
  buscarRol() {
    //retorno el resultado de la consulta
    return this.database.executeSql('SELECT * FROM ROL', []).then(res => {
      //la consulta se realizó correctamente
      //creamos una variable para almacenar los registros del select
      let items: Rol[] = [];
      //validar cuantos registros vienen en el select
      if (res.rows.length > 0) {
        //recorro la consulta dentro del res
        for (var i = 0; i < res.rows.length; i++) {
          //alamaceno los registros en items
          items.push({
            id_rol: res.rows.item(i).ID_ROL,
            nombre_rol: res.rows.item(i).NOMBRE_ROL,
          })
        }
      }
      this.listaRol.next(items as any);
    })
  }
  /* Pregunta y Respuesta */
  fetchPreguntaRespuesta(): Observable<PreguntaRespuesta[]> {
    return this.listaPreguntaRespuesta.asObservable();
  }
  buscarPreguntaRespuesta() {
    //retorno el resultado de la consulta
    return this.database.executeSql('SELECT * FROM PREGUNTARESPUESTA', []).then(res => {
      //la consulta se realizó correctamente
      //creamos una variable para almacenar los registros del select
      let items: PreguntaRespuesta[] = [];
      //validar cuantos registros vienen en el select
      if (res.rows.length > 0) {
        //recorro la consulta dentro del res
        for (var i = 0; i < res.rows.length; i++) {
          //alamaceno los registros en items
          items.push({
            id_preguntaRespuesta: res.rows.item(i).ID_PREGUNTARESPUESTA,
            pregunta: res.rows.item(i).PREGUNTA,
            respuesta: res.rows.item(i).RESPUESTA,
            id_usuario: res.rows.item(i).ID_USUARIO
          })
        }
      }
      this.listaPreguntaRespuesta.next(items as any);
    })
  }
  agregarPreguntaRespuesta(pregunta: any, respuesta: any, id_usuario: any) {
    console.log('Intentando agregar pregunta y respuesta para ID de usuario:', id_usuario);
    return this.database.executeSql('INSERT INTO PREGUNTARESPUESTA (PREGUNTA, RESPUESTA, ID_USUARIO) VALUES (?, ?, ?)', [pregunta, respuesta, id_usuario]).then(res => {
      this.buscarPreguntaRespuesta();
    })
  }
  modificarPreguntaRespuesta(pregunta: any, respuesta: any, id_usuario: any) {
    return this.database.executeSql('UPDATE PREGUNTARESPUESTA SET PREGUNTA=?, RESPUESTA=? WHERE ID_USUARIO=?', [pregunta, respuesta, id_usuario]).then(res => {
      this.buscarPreguntaRespuesta();
    })
  }
  /* -------------------------------------------------------------------------------------------- */
  /* Mascotas */
  //funcion que refrescara la informacion en la interfaz utilizando la lista ya creada
  fetchMascota(): Observable<MASCOTAS[]> {
    return this.listaMascotas.asObservable();
  }
  buscarMascota() {
    //retorno el resultado de la consulta
    return this.database.executeSql('SELECT * FROM MASCOTAS', []).then(res => {
      //la consulta se realizó correctamente
      //creamos una variable para almacenar los registros del select
      let items: MASCOTAS[] = [];
      //validar cuantos registros vienen en el select
      if (res.rows.length > 0) {
        //recorro la consulta dentro del res
        for (var i = 0; i < res.rows.length; i++) {
          //alamaceno los registros en items
          items.push({
            id_mascota: res.rows.item(i).ID_MASCOTA,
            mascota_img: res.rows.item(i).IMG_MASCOTA,
            nombre_mascota: res.rows.item(i).NOMBRE_MASCOTA,
            edad_mascota: res.rows.item(i).EDAD_MASCOTA,
            nro_chip: res.rows.item(i).NUMERO_CHIP,
            tratamiento: res.rows.item(i).TRATAMIENTO,
            descripcion: res.rows.item(i).DESCRIPCION,
            especie: res.rows.item(i).ESPECIE,
            vacuna: res.rows.item(i).VACUNA,
            tamanio: res.rows.item(i).TAMANIO,
            id_usuario: res.rows.item(i).ID_USUARIO
          })
        }
      }
      this.listaMascotas.next(items as any);
    })
  }
  eliminarMascota(id_mascota: any) {
    return this.database.executeSql('DELETE FROM MASCOTAS WHERE ID_MASCOTA = ?', [id_mascota]).then(res => {
      //se llama a la funcion ya creada previamente
      this.buscarMascota();
    })
  }
  agregarMascota(mascota_img: any, nombre_mascota: any, edad_mascota: any, nro_chip: any, tratamiento: any, descripcion: any, especie: any, vacuna: any, tamanio: any, id_usuario: any) {
    return this.database.executeSql('INSERT INTO MASCOTAS (IMG_MASCOTA , NOMBRE_MASCOTA , EDAD_MASCOTA, NUMERO_CHIP, TRATAMIENTO, DESCRIPCION, ESPECIE, VACUNA,TAMANIO, ID_USUARIO) VALUES (?,?,?,?,?,?,?,?,?,?)', [mascota_img, nombre_mascota, edad_mascota, nro_chip, tratamiento, descripcion, especie, vacuna, tamanio, id_usuario]).then(res => {
      this.buscarMascota();
    })
  }
  modificarMascota(mascota_img: any, nombre_mascota: any, edad_mascota: any, tratamiento: any, descripcion: any, especie: any, vacuna: any, tamanio: any, id_mascota: any,) {
    return this.database.executeSql('UPDATE MASCOTAS SET IMG_MASCOTA = ?, NOMBRE_MASCOTA = ?, EDAD_MASCOTA = ?,  TRATAMIENTO = ?, DESCRIPCION = ?, ESPECIE = ?, VACUNA = ?, TAMANIO = ? WHERE ID_MASCOTA = ?', [mascota_img, nombre_mascota, edad_mascota, tratamiento, descripcion, especie, vacuna, tamanio, id_mascota])
      .then(res => {
        this.buscarMascota();
      })
      .catch(error => {
        console.error('Error al modificar la mascota:', error);
      });
  }
  obtenerIdMascotaPorUsuario(user_id: any) {
    return this.database.executeSql('SELECT ID_MASCOTA FROM MASCOTAS WHERE ID_USUARIO = ?', [user_id]).then(res => {
      if (res.rows.length > 0) {
        const id_mascota = res.rows.item(0).ID_MASCOTA;
        return id_mascota;
      } else {
        return null;
      }
    });
  }
  obtenerMascotaUserActual(id_usuario: any) {
    return this.database.executeSql('SELECT IMG_MASCOTA, NOMBRE_MASCOTA, EDAD_MASCOTA, NUMERO_CHIP, TRATAMIENTO, DESCRIPCION, ESPECIE, VACUNA, TAMANIO FROM MASCOTAS WHERE ID_USUARIO=?;', [id_usuario]).then(pet => {
      if (pet.rows.length > 0) {
        const mascota = {
          IMG_MASCOTA: pet.rows.item(0).IMG_MASCOTA,
          NOMBRE_MASCOTA: pet.rows.item(0).NOMBRE_MASCOTA,
          EDAD_MASCOTA: pet.rows.item(0).EDAD_MASCOTA,
          NUMERO_CHIP: pet.rows.item(0).NUMERO_CHIP,
          TRATAMIENTO: pet.rows.item(0).TRATAMIENTO,
          DESCRIPCION: pet.rows.item(0).DESCRIPCION,
          ESPECIE: pet.rows.item(0).ESPECIE,
          VACUNA: pet.rows.item(0).VACUNA,
          TAMANIO: pet.rows.item(0).TAMANIO,
        };
        return mascota;
      } else {
        return null;
      }
    });
  }
  /* Likes */
  fetchLikes(): Observable<LIKES[]> {
    return this.listaLikes.asObservable();
  }
  buscarLikes() {
    return this.database.executeSql('SELECT * FROM LIKES', []).then(res => {
      let items: LIKES[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id_like: res.rows.item(i).ID_LIKE,
            user_inter: res.rows.item(i).USUARIO_DESTINATARIO,
            user_dest: res.rows.item(i).USUARIO_DESTINATARIO,
            id_usuario: res.rows.item(i).ID_USUARIO
          })
        }
      }
      this.listaLikes.next(items as any);
    })
  }
  likePorUsuario(user_id: any) {
    return this.database.executeSql('SELECT * FROM LIKES WHERE USUARIO_INTERESADO = ?', [user_id]).then(res => {
      const likes = [];
      if (res.rows.length > 0) {
        for (let i = 0; i < res.rows.length; i++) {
          likes.push({
            id_like: res.rows.item(i).ID_LIKE,
            usuario_dest: res.rows.item(i).USUARIO_DESTINATARIO
          });
        }
      }
      return likes;
    });
  }    
  agregarLikes(id_user_inter: any, id_user_dest: any) {
    return this.database.executeSql('INSERT OR IGNORE INTO LIKES (USUARIO_INTERESADO, USUARIO_DESTINATARIO) VALUES (?,?)', [id_user_inter, id_user_dest]).then(res => {
      this.buscarLikes();
    });
  }
  /* Coincidencia */
  verificarLiked(id_user_dest: any, id_user_inter: any) {
    return this.database.executeSql(
      'SELECT USUARIO_DESTINATARIO  FROM LIKES WHERE  USUARIO_INTERESADO = ? AND USUARIO_DESTINATARIO = ?',
      [id_user_dest, id_user_inter]
    )
      .then(res => {
        if (res.rows.length > 0) {
          const id_dest = res.rows.item(0).USUARIO_DESTINATARIO;
          console.log('Coincidencia encontrada:', id_dest);
          return id_dest;
        } else {
          return null;
        }
      })
  }
  /* Chat */
  fetchChat(): Observable<CHAT[]> {
    return this.listaChat.asObservable();
  }
  buscarChat() {
    return this.database.executeSql('SELECT * FROM CHAT', []).then(res => {
      let items: CHAT[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id_chat: res.rows.item(i).ID_CHAT,
            id_remitente: res.rows.item(i).ID_REMITENTE,
            id_destinatario: res.rows.item(i).ID_DESTINATARIO,
          })
        }
      }
      this.listaChat.next(items as any);
    })
  }
  obtenerUsuariosParaChat(user_id: any) {
    return this.database.executeSql(`
      SELECT U.ID_USUARIO, C.ID_CHAT, U.IMG_USUARIO, U.NOMBRE_USUARIO
      FROM CHAT C
      JOIN USUARIO U ON (C.ID_REMITENTE = U.ID_USUARIO OR C.ID_DESTINATARIO = U.ID_USUARIO)
      WHERE (C.ID_REMITENTE = ? OR C.ID_DESTINATARIO = ?) AND U.ID_USUARIO != ?
    `, [user_id, user_id, user_id])
    .then(data => {
      const usuarios = [];
      for (let i = 0; i < data.rows.length; i++) {
        usuarios.push({
          id_usuario: data.rows.item(i).ID_USUARIO,
          id_chat: data.rows.item(i).ID_CHAT,
          img_usuario: data.rows.item(i).IMG_USUARIO,
          nombre_usuario: data.rows.item(i).NOMBRE_USUARIO,
        });
      }
      console.log('Usuarios para chat:', usuarios);
      return usuarios;
    });
  }         
  eliminarChat(id_chat: any) {
    return this.database.executeSql('DELETE FROM CHAT WHERE id_chat = ?', [id_chat]).then(res => {
      //llamar funcion creada anteriormente
      this.buscarChat();
    })
  }
  agregarChat(id_remitente: any, id_destinatario: any) {
    return this.database.executeSql('INSERT INTO CHAT (ID_REMITENTE, ID_DESTINATARIO) VALUES (?, ?)', [id_remitente, id_destinatario]).then(res => {
      this.buscarChat();
    })
  }
  /* MENSAJES */
  fetchMensajes(): Observable<MENSAJES[]> {
    return this.listaLikes.asObservable();
  }
  buscarMensajes() {
    return this.database.executeSql('SELECT * FROM MENSAJES', []).then(res => {
      let items: MENSAJES[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id_mensaje: res.rows.item(i).ID_CHAT,
            mensaje: res.rows.item(i).IMG_CHAT,
            id_usuario: res.rows.item(i).ID_USUARIO,
            id_chat: res.rows.item(i).ID_CHAT
          })
        }
      }
      this.listaMensajes.next(items as any);
    })
  }
  agregarMensaje(mensaje: string, id_usuario: any, id_chat: any) {
    return this.database.executeSql('INSERT INTO MENSAJES (MENSAJE, ID_USUARIO, ID_CHAT) VALUES (?, ?, ?)', [mensaje, id_usuario, id_chat]);
  }
  obtenerMensajesPorChat(idChat: any) {
    return this.database.executeSql('SELECT * FROM MENSAJES WHERE ID_CHAT = ?', [idChat]).then(data => {
      const mensajes = [];
      for (let i = 0; i < data.rows.length; i++) {
        mensajes.push({
          id_mensaje: data.rows.item(i).ID_MENSAJE,
          mensaje: data.rows.item(i).MENSAJE,
          id_usuario: data.rows.item(i).ID_USUARIO,
          id_chat: data.rows.item(i).ID_CHAT,
        });
      }
      return mensajes;
    });
  }
  obtenerUsuarioPorIdChat(idChat: any, idUsuario: any) {
    return this.database.executeSql(`
      SELECT U.ID_USUARIO, U.IMG_USUARIO, U.NOMBRE_USUARIO
      FROM CHAT C
      JOIN USUARIO U ON (C.ID_REMITENTE = U.ID_USUARIO OR C.ID_DESTINATARIO = U.ID_USUARIO)
      WHERE (C.ID_CHAT = ?) AND (U.ID_USUARIO = ?)
    `, [idChat, idUsuario])
    .then(data => {
      if (data.rows.length > 0) {
        const usuario = {
          id_usuario: data.rows.item(0).ID_USUARIO,
          img_usuario: data.rows.item(0).IMG_USUARIO,
          nombre_usuario: data.rows.item(0).NOMBRE_USUARIO,
        };
        console.log('Usuario por ID de Chat:', usuario);
        return usuario;
      } else {
        console.log('No se encontró usuario para el ID de Chat y Usuario:', idChat, idUsuario);
        return null;
      }
    });
  }
  /* -------------------------------------------------------------------------------------------- */
  /*                                          CONFIG.BASE DE DATOS                                */
  crearBD() {
    //verifico si la plataforma está lista
    this.platform.ready().then(() => {
      //crear la BD
      this.sqlite.create({
        name: 'bdadoptame.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        //guardo la conexión a BD en mi variable
        this.database = db;
        //llamo a la creación de las tablas
        this.crearTablas();
        /* this.presentAlert("Bd Creada con exito"); */
      }).catch(e => {
        /* this.presentAlert("Error en crear BD: " + e); */
      })
    })
  }

  async crearTablas() {
    try {
      //creamos las tablas
      /* DIRECCION */
      await this.database.executeSql(this.tablaDireccion, []);
      /* REGION */
      await this.database.executeSql(this.tablaRegion, []);
      /* COMUNA */
      await this.database.executeSql(this.tablaComuna, []);
      /* ROL */
      await this.database.executeSql(this.tablaRol, []);
      /* USUARIOS */
      await this.database.executeSql(this.tablaUsuario, []);
      /* RespuestaPregunta */
      await this.database.executeSql(this.PreguntaRespuesta, []);
      /* MASCOTAS */
      await this.database.executeSql(this.tablaMascotas, []);
      /* LIKES */
      await this.database.executeSql(this.tablaLikes, []);
      /* CHAT */
      await this.database.executeSql(this.tablaChat, []);
      /* MENSAJES */
      await this.database.executeSql(this.tablaMensajes, []);
      //Creamos los registros iniciales
      /* REGION */
      await this.database.executeSql(this.registroRegion, []);
      /* COMUNAS */
      await this.database.executeSql(this.registroCerrillos, []);
      await this.database.executeSql(this.registroCerroNavia, []);
      await this.database.executeSql(this.registroConchali, []);
      await this.database.executeSql(this.registroElBosque, []);
      await this.database.executeSql(this.registroEstacionCentral, []);
      await this.database.executeSql(this.registroHuechuraba, []);
      await this.database.executeSql(this.registroIndependencia, []);
      await this.database.executeSql(this.registroLaCisterna, []);
      await this.database.executeSql(this.registroLaFlorida, []);
      await this.database.executeSql(this.registroLaGranja, []);
      await this.database.executeSql(this.registroLaPintana, []);
      await this.database.executeSql(this.registroLaReina, []);
      await this.database.executeSql(this.registroLasCondes, []);
      await this.database.executeSql(this.registroLoBarnechea, []);
      await this.database.executeSql(this.registroLoEspejo, []);
      await this.database.executeSql(this.registroLoPrado, []);
      await this.database.executeSql(this.registroMacul, []);
      await this.database.executeSql(this.registroMaipu, []);
      await this.database.executeSql(this.registroNunoa, []);
      await this.database.executeSql(this.registroLaPac, []);
      await this.database.executeSql(this.registroPenalolen, []);
      await this.database.executeSql(this.registroProvidencia, []);
      await this.database.executeSql(this.registroPudahuel, []);
      await this.database.executeSql(this.registroQuilicura, []);
      await this.database.executeSql(this.registroQuintaNormal, []);
      await this.database.executeSql(this.registroRecoleta, []);
      await this.database.executeSql(this.registroRenca, []);
      await this.database.executeSql(this.registroSanJoaquin, []);
      await this.database.executeSql(this.registroSanMiguel, []);
      await this.database.executeSql(this.registroSanRamon, []);
      await this.database.executeSql(this.registroSantiago, []);
      await this.database.executeSql(this.registroVitacura, []);
      /* ROL */
      await this.database.executeSql(this.registroRol1, []);
      await this.database.executeSql(this.registroRol2, []);
      //actualizamos el observable de la BD
      this.isDBReady.next(true);
      //llamamos al buscar mascota
      this.buscarMascota();
      this.buscarRegion();
      this.buscarComuna();
      this.buscarRol();
      this.buscarDireccion();
      this.buscarUsuario();
      this.buscarPreguntaRespuesta();
      this.buscarLikes();
      this.buscarChat();
      this.buscarMensajes();

    } catch (e) {
      this.presentAlert("Error en crear Tabla: " + e);
    }
  }
  async presentAlert(msj: string) {
    const alert = await this.alertController.create({
      header: 'Usuarios, saluden a Backend',
      message: msj,
      buttons: ['OK'],
    });
    await alert.present();
  }
}