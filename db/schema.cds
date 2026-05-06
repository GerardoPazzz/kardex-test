namespace sap.ui.kardex;

@Title : 'Sistema de Kardex Académico'
context schema {

  @Title : 'Entidad Alumnos'
  entity Alumnos {
    @Title : 'ID del alumno (código universitario)'
    key ID          : String(20);

    @Title : 'Nombre del alumno'
        nombre      : String(100) not null;

    @Title : 'Apellido del alumno'
        apellido    : String(100) not null;

    @Title : 'Carrera profesional'
        carrera     : String(100) not null;

    @Title : 'Correo electrónico institucional'
        email       : String(150);

    @Title : 'Fecha de ingreso a la universidad'
        fechaIngreso: Date not null;

    @Title : 'Calificaciones del alumno'
        calificaciones : Association to many Calificaciones on calificaciones.alumno = $self;
  }

  @Title : 'Entidad Cursos'
  entity Cursos {
    @Title : 'Código del curso'
    key ID          : String(10);

    @Title : 'Nombre del curso'
        nombre      : String(100) not null;

    @Title : 'Descripción del contenido'
        descripcion : String(500);

    @Title : 'Número de créditos'
        creditos    : Integer not null;

    @Title : 'Calificaciones registradas'
        calificaciones : Association to many Calificaciones on calificaciones.curso = $self;
  }

  @Title : 'Entidad Calificaciones'
  entity Calificaciones {
    @Title : 'Identificador único'
    key ID          : UUID;

    @Title : 'Alumno asociado'
        alumno      : Association to Alumnos not null;

    @Title : 'Curso asociado'
        curso       : Association to Cursos not null;

    @Title : 'Nota obtenida (0-20)'
        nota        : Decimal(4,2) not null;

    @Title : 'Período académico (ej. 2026-I)'
        semestre    : String(10) not null;

    @Title : 'Estado de aprobación'
        estado      : String(20) not null;
  }
}