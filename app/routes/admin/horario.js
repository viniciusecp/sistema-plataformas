module.exports = function(application) {
    application.get('/form_add_horario', function(req, res){
        application.app.controllers.admin.horario.formulario_adicionar_horario(application, req, res);
    });

    application.post('/horario/salvar', function(req, res){
        application.app.controllers.admin.horario.horario_salvar(application, req, res);
    });

    application.post('/horario/deletar', function(req, res){
        application.app.controllers.admin.horario.horario_deletar(application, req, res);
    });

    application.get('/horarios_lote', function(req, res){
        application.app.controllers.admin.horario.getHorariosLote(application, req, res);
    });

    application.post('/horario_lote/deletar', function(req, res){
        application.app.controllers.admin.horario.horario_lote_deletar(application, req, res);
    });
}
