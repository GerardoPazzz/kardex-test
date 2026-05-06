using { sap.ui.kardex.schema as db } from '../db/schema';

@path: 'kardex'
service KardexService {
  @readonly entity Alumnos as projection on db.Alumnos {
    *,
    calificaciones
  };

  @readonly entity Cursos as projection on db.Cursos {
    *,
    calificaciones
  };

  entity Calificaciones as projection on db.Calificaciones;
}