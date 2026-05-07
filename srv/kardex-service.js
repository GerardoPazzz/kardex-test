'use strict';

const cds = require('@sap/cds');

const ENTIDAD_ALUMNOS = 'Alumnos';
const ENTIDAD_CURSOS = 'Cursos';
const ENTIDAD_CALIFICACIONES = 'Calificaciones';

module.exports = async (srv) => {

  const AlumnoIDPattern = /^[A-Z0-9]{8,20}$/;
  const CursoIDPattern = /^[A-Z]{2,4}[0-9]{2,4}$/;
  const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  srv.before('CREATE', ENTIDAD_ALUMNOS, async (req) => {
    await validarAlumno(req);
  });

  srv.before('UPDATE', ENTIDAD_ALUMNOS, async (req) => {
    const { ID } = req.data;
    const alumno = await SELECT.one.from(ENTIDAD_ALUMNOS).where({ ID });
    if (!alumno) {
      return req.error(404, 'El alumno no existe', { '@common.error.code': 'ALUMNO_NOT_FOUND' });
    }
    if (alumno.actividad === 'Inactivo') {
      return req.error(400, 'No se puede modificar un alumno inactivo', { '@common.error.code': 'ALUMNO_INACTIVE' });
    }
    await validarAlumno(req);
  });

  srv.before('DELETE', ENTIDAD_ALUMNOS, async (req) => {
    const { ID } = req.data;
    const alumno = await SELECT.one.from(ENTIDAD_ALUMNOS).where({ ID });
    if (!alumno) {
      return req.error(404, 'El alumno no existe', { '@common.error.code': 'ALUMNO_NOT_FOUND' });
    }
    if (alumno.actividad === 'Inactivo') {
      return req.error(400, 'El alumno ya está inactivo', { '@common.error.code': 'ALUMNO_ALREADY_INACTIVE' });
    }
    await UPDATE(ENTIDAD_ALUMNOS, ID).set({ actividad: 'Inactivo' });
    return req.reply({ mensaje: 'Alumno inactivado correctamente' });
  });

  srv.before('CREATE', ENTIDAD_CURSOS, async (req) => {
    await validarCurso(req);
  });

  srv.before('UPDATE', ENTIDAD_CURSOS, async (req) => {
    const { ID } = req.data;
    const curso = await SELECT.one.from(ENTIDAD_CURSOS).where({ ID });
    if (!curso) {
      return req.error(404, 'El curso no existe', { '@common.error.code': 'CURSO_NOT_FOUND' });
    }
    if (curso.actividad === 'Inactivo') {
      return req.error(400, 'No se puede modificar un curso inactivo', { '@common.error.code': 'CURSO_INACTIVE' });
    }
    await validarCurso(req);
  });

  srv.before('DELETE', ENTIDAD_CURSOS, async (req) => {
    const { ID } = req.data;
    const curso = await SELECT.one.from(ENTIDAD_CURSOS).where({ ID });
    if (!curso) {
      return req.error(404, 'El curso no existe', { '@common.error.code': 'CURSO_NOT_FOUND' });
    }
    if (curso.actividad === 'Inactivo') {
      return req.error(400, 'El curso ya está inactivo', { '@common.error.code': 'CURSO_ALREADY_INACTIVE' });
    }
    await UPDATE(ENTIDAD_CURSOS, ID).set({ actividad: 'Inactivo' });
    return req.reply({ mensaje: 'Curso inactivado correctamente' });
  });

  srv.before('CREATE', ENTIDAD_CALIFICACIONES, async (req) => {
    await validarCalificacion(req);
    await validarEntidadesActivas(req);
  });

  srv.before('UPDATE', ENTIDAD_CALIFICACIONES, async (req) => {
    const { ID } = req.data;
    const calificacion = await SELECT.one.from(ENTIDAD_CALIFICACIONES).where({ ID });
    if (!calificacion) {
      return req.error(404, 'La calificación no existe', { '@common.error.code': 'CALIFICACION_NOT_FOUND' });
    }
    await validarCalificacion(req);
    await validarEntidadesActivas(req);
  });

  async function validarAlumno(req) {
    const { nombre, apellido, carrera, email, fechaIngreso, actividad } = req.data;

    if (!nombre || nombre.trim() === '') {
      return req.error(400, 'El nombre es obligatorio', { '@common.error.code': 'NOMBRE_REQUIRED' });
    }
    if (!apellido || apellido.trim() === '') {
      return req.error(400, 'El apellido es obligatorio', { '@common.error.code': 'APELLIDO_REQUIRED' });
    }
    if (!carrera || carrera.trim() === '') {
      return req.error(400, 'La carrera es obligatoria', { '@common.error.code': 'CARRERA_REQUIRED' });
    }
    if (email && !EmailPattern.test(email)) {
      return req.error(400, 'El email no tiene un formato válido', { '@common.error.code': 'EMAIL_INVALID' });
    }
    if (actividad && !['Activo', 'Inactivo'].includes(actividad)) {
      return req.error(400, 'La actividad debe ser Activo o Inactivo', { '@common.error.code': 'ACTIVIDAD_INVALID' });
    }
  }

  async function validarCurso(req) {
    const { nombre, creditos, descripcion, actividad } = req.data;

    if (!nombre || nombre.trim() === '') {
      return req.error(400, 'El nombre del curso es obligatorio', { '@common.error.code': 'NOMBRE_CURSO_REQUIRED' });
    }
    if (creditos !== undefined && (typeof creditos !== 'number' || creditos < 1 || !Number.isInteger(creditos))) {
      return req.error(400, 'Los créditos deben ser un número entero positivo', { '@common.error.code': 'CREDITOS_INVALID' });
    }
    if (descripcion && descripcion.length > 500) {
      return req.error(400, 'La descripción no puede exceder 500 caracteres', { '@common.error.code': 'DESCRIPCION_TOO_LONG' });
    }
    if (actividad && !['Activo', 'Inactivo'].includes(actividad)) {
      return req.error(400, 'La actividad debe ser Activo o Inactivo', { '@common.error.code': 'ACTIVIDAD_INVALID' });
    }
  }

  async function validarCalificacion(req) {
    const { nota, semestre, alumno_ID, curso_ID } = req.data;

    if (nota === undefined || nota === null) {
      return req.error(400, 'La nota es obligatoria', { '@common.error.code': 'NOTE_REQUIRED' });
    }

    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
      return req.error(400, 'La nota debe estar entre 0 y 20', { '@common.error.code': 'NOTE_OUT_OF_RANGE' });
    }

    const estado = notaNum >= 10.5 ? 'Aprobado' : 'Desaprobado';
    req.data.estado = estado;

    if (!AlumnoIDPattern.test(alumno_ID)) {
      return req.error(400, 'El ID del alumno debe ser alfanumérico (8-20 caracteres)', { '@common.error.code': 'ALUMNO_ID_INVALID' });
    }

    if (!CursoIDPattern.test(curso_ID)) {
      return req.error(400, 'El código del curso debe seguir el formato: 2-4 letras seguidas de 2-4 números', { '@common.error.code': 'CURSO_ID_INVALID' });
    }

    if (!semestre || !/^\d{4}-[A-Z]{1,2}$/i.test(semestre)) {
      return req.error(400, 'El semestre debe tener formato: YYYY-T (ej. 2026-I)', { '@common.error.code': 'SEMESTRE_INVALID' });
    }
  }

  async function validarEntidadesActivas(req) {
    const { alumno_ID, curso_ID } = req.data;

    const alumno = await SELECT.one.from(ENTIDAD_ALUMNOS).where({ ID: alumno_ID });
    if (!alumno) {
      return req.error(400, 'El alumno no existe', { '@common.error.code': 'ALUMNO_NOT_FOUND' });
    }
    if (alumno.actividad !== 'Activo') {
      return req.error(400, 'No se puede registrar una calificación para un alumno inactivo', { '@common.error.code': 'ALUMNO_INACTIVE' });
    }

    const curso = await SELECT.one.from(ENTIDAD_CURSOS).where({ ID: curso_ID });
    if (!curso) {
      return req.error(400, 'El curso no existe', { '@common.error.code': 'CURSO_NOT_FOUND' });
    }
    if (curso.actividad !== 'Activo') {
      return req.error(400, 'No se puede registrar una calificación para un curso inactivo', { '@common.error.code': 'CURSO_INACTIVE' });
    }
  }

  srv.after('READ', ENTIDAD_CALIFICACIONES, (each) => {
    if (each.nota !== undefined) {
      each.nota = parseFloat(each.nota);
    }
  });

};
