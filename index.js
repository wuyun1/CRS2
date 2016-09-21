var browserSync = require( 'browser-sync');

browserSync({
    port: 8080,
    open: "external",
    online:true,
    server: {
      baseDir: ['dist']
     },
    logSnippet: false,
    notify: false,
    codeSync: true,
    ui: false,
    ghostMode: false,
    reloadOnRestart: false,
    scrollProportionally: false,
    socket: {
	    namespace: function (namespace) {
	        return namespace;
	    }
	}
  },require('./serverapi/server.js'));
