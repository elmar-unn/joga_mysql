const express = require('express')
const app = express()

const path = require('path')

const hbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
}))

app.use(express.static(path.join(__dirname, 'public')));

const mysql = require('mysql2')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwerty',
    database: 'joga_mysql'
})

con.connect((err) => {
    if (err) throw err;
    console.log('Connected to joga_mysql db');
})

app.get('/', (req, res) => {
    const query = "SELECT * FROM article";
    con.query(query, (err, result) => {
        if (err) throw err;
        res.render('index', {
            articles: result
        });
    })
});

app.get('/article/:slug', (req, res) => {
    const query = `
        SELECT article.*, author.name AS author_name
        FROM article
        LEFT JOIN author ON article.author_id = author.id
        WHERE article.slug = ?
    `;

    con.query(query, [req.params.slug], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Andmebaasi viga');
        }

        if (result.length === 0) {
            return res.status(404).send('Article not found');
        }

        res.render('article', {
            article: result[0]
        });
    });
});


app.get('/author/:author_id', (req, res) => {
    const authorId = req.params.author_id;

    // Leiame autori
    const authorQuery = 'SELECT * FROM author WHERE id = ?';

    con.query(authorQuery, [authorId], (err, authorResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Andmebaasi viga');
        }

        if (authorResult.length === 0) {
            return res.status(404).send('Autorit ei leitud');
        }

        // Leiame selle autori artiklid
        const articlesQuery = 'SELECT * FROM article WHERE author_id = ?';

        con.query(articlesQuery, [authorId], (err, articlesResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Andmebaasi viga');
            }

            res.render('author', {
                author: authorResult[0],
                articles: articlesResult
            });
        });
    });
});


app.listen(3003, () => {
    console.log('App is started at http://localhost:3003')
})