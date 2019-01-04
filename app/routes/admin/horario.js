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
}
