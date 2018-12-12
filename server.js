import express from 'express';

const app = express();

/**
 *  Create basic html template.
 */
const TEMPLATE = `
<html>
  <body>
    <div id="root"></div>
  </body>
  <script src='bundle.js'></script>
</html>
`;

/**
 *  Give access to static assets.
 */
app.use(express.static('dist'));

/**
 *  Serve the html on every route.
 */
app.get('*', (_request, response) => response.status(200).send(TEMPLATE));

/**
 *  Start the server at port 3000.
 */
app.listen(3000, () => console.log('Server started!'));
