module.exports = function(application) {
    application.get('/form_add_horario', function(req, res){
        application.app.controllers.admin.formulario_adicionar_horario(application, req, res);
    });

    application.post('/horario/salvar', function(req, res){
        application.app.controllers.admin.horario_salvar(application, req, res);
    });
}
