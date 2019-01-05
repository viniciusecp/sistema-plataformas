module.exports = function(application) {
    application.get('/form_add_empresa', function(req, res){
        application.app.controllers.admin.empresa.formulario_adicionar_empresa(application, req, res);
    });

    application.post('/empresa/salvar', function(req, res){
        application.app.controllers.admin.empresa.empresa_salvar(application, req, res);
    });

    application.get('/empresas', function(req, res){
        application.app.controllers.admin.empresa.getEmpresas(application, req, res);
    });

    application.post('/empresa/deletar', function(req, res){
        application.app.controllers.admin.empresa.empresa_deletar(application, req, res);
    });
}
