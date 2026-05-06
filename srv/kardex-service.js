'use strict';

const cds = require('@sap/cds');

module.exports = async (srv) => {

  const { Alumnos, Cursos, Calificaciones } = srv.entities('sap.ui.kardex');

  const AlumnoIDPattern = /^[A-Z0-9]{8,20}$/;
  const CursoIDPattern = /^[A-Z]{2,4}[0-9]{2,4}$/;

  srv.before('CREATE', Calificaciones, async (req) => {
    await validarCalificacion(req);
  });

  srv.before('UPDATE', Calificaciones, async (req) => {
    await validarCalificacion(req);
  });

  async function validarCalificacion(req) {
    const { nota, semestre, alumno_ID, curso_ID } = req.data;

    if (nota === undefined || nota === null) {
      return req.error(400, 'La nota es obligatoria', { '@common.error.code': 'NOTE_REQUIRED' });
    }

    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
      return req.error(400, 'La nota debe estar entre 0 y 20', { '@common.error.code': 'NOTE_OUT_OF_RANGE' });
    }

    if (!AlumnoIDPattern.test(alumno_ID)) {
      return req.error(400, 'El ID del alumno debe ser alfanumérico (8-20 caracteres)', { '@common.error.code': 'ALUMNO_ID_INVALID' });
    }

    if (!CursoIDPattern.test(curso_ID)) {
      return req.error(400, 'El código del curso debe seguir el formato: 2-4 letras seguidas de 2-4 números', { '@common.error.code': 'CURSO_ID_INVALID' });
    }

    if (!semestre || !/^\d{4}-[A-Z]{1,2}$/i.test(semestre)) {
      return req.error(400, 'El semestre debe tener formato: YYYY-T (ej. 2026-I)', { '@common.error.code': 'SEMESTRE_INVALID' });
    }

    const estado = notaNum >= 10.5 ? 'Aprobado' : 'Desaprobado';
    req.data.estado = estado;
  }

  srv.after('READ', Calificaciones, (each) => {
    if (each.nota !== undefined) {
      each.nota = parseFloat(each.nota);
    }
  });

};