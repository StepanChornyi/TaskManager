const app = require('./app.js');
const database = require('./database.js');
const config = require('./config.js');


database.mongo()
  	.then(info => {
    	console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
    	app.listen(config.PORT, () =>
      	console.log(`Example app listening on port ${config.PORT}!`)
	);
})
.catch(() => {
	console.error('Unable to connect to database');
    process.exit(1);
});
