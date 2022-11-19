const express = require('express');
const pg = require('pg');
// const axios = require('axios').default; //fetch api kullanılabilir
// const mysql = require('mysql')

const PORT = process.env.PORT || 5000;

const app = express();

//! MySQL bağlantısı, sürüm 8 için çalışmadı
/* const database = mysql.createConnection({
    port: 3306,
    host: 'localhost',
    user: 'arif',
    password: '123',
    database: 'takvim_api',
    socketPath: '/var/run/mysqls/mysqld.sock'
})
database.connect(err => {
    if (err)
        throw err;
    console.log('bağlandı');
}); */

/* const pool = new pg.Pool({ connectionString });
//pgsql illeri teker teker kopyalama 
const sonuc = () => {
    for (let i = 0; i <= 81; i++) {
        setTimeout(() => {
            pool.query(`SELECT * FROM iller WHERE plaka = '${i > 9 ? i : '0' + i}'`)
                .then(res => {
                    let text = "INSERT INTO iller VALUES($1, $2, $3) RETURNING *";
                    let values = [res.rows[0].plaka, res.rows[0].il, res.rows[0].id];
                    pool.query(text, values)
                        .then(res => console.log(res.rows[0]))
                        .catch(err => { return });
                })
                .catch(err => { return })
        }, 600);
    }
}

sonuc() */

const connectionString = 'pgsql://postgres:sifre25@localhost/takvim_api';
const client = new pg.Client({ connectionString });

(async function () {
    try {
        await client.connect()
        console.log('bağlandı')
    } catch (ex) {
        throw (ex);
    }

})();

app.get('/iller', async (req, res) => {
    const result = await client.query("SELECT * FROM iller")
    res.send(result.rows);
})

app.get('/ilce/:il', async (req, res) => {
    const result = await client.query(`SELECT * FROM ilceler WHERE il = '${req.params.il}'`)
    res.send(result.rows);
})

app.get('/vakit/:il', async (req, res) => {
    client.query(`SELECT id FROM iller WHERE il = '${req.params.il}'`)
        .then(sonuc => {
            const id = sonuc.rows[0].id;
            fetch(`https://turktakvim.com/XMLservis.php?tip=vakit&cityID=${id}&tarih=2022-05-13&format=json`)
                .then(result => result.json())
                .then(result => res.status(200).send(result.cityinfo))
                .catch(err => console.log(err))
        })
})

app.listen(PORT, () => console.log(`host:${PORT} dinleniyor...`));
