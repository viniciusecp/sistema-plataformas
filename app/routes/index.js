module.exports = function(application) {
    application.get('/', function(req, res){
        application.app.controllers.index.index(application, req, res);
    });

    application.get('/index', function(req, res){
        application.app.controllers.index.index(application, req, res);
    });

    application.get('/calendar', function(req, res){
        application.app.controllers.index.calendar(application, req, res);
    });

    application.post('/horario/pesquisar', function(req, res){
        application.app.controllers.index.horario_pesquisar(application, req, res);
    });

    application.post('/autenticar', function(req, res){
		application.app.controllers.index.autenticar(application, req, res);
	});

    application.get('/sair', function(req, res){
		application.app.controllers.index.sair(application, req, res);
	});
}
