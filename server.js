import express from 'express';

const app = express();

/**
 *  Create basic html template.
 */
const template = `
<html>
  <body>
    <div id="root"></div>
    <button>click me</button>
  </body>
  <script src='bundle.js'></script>
</html>
`;

/**
 *  Give access to static assets.
 */
app.use(express.static('dist'));

/**
 *  Serve the html on evert route.
 */
app.get('*', (_req, res) => {
  res.status(200).send(template);
});

/**
 *  Start the server at port 3000.
 */
app.listen(3000, () => console.log('Server started!'));
