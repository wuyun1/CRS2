var browserSync = require( 'browser-sync');

browserSync({
    port: 9504,
    open: "external",
    online:false,
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
