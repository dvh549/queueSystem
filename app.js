const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const axios = require('axios').default;
const dotenv = require('dotenv');
dotenv.config();
const app = express();
// const fetch = (...args) =>
//   import('node-fetch').then(({ default: fetch }) => fetch(...args));
const port = 5000;
const host = "0.0.0.0";

function connectToDB(){
    let con = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        multipleStatements: true
    });
    con.connect((err) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
    });
    return con;
}

app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}), express.json());

app.get("/getAllCustomers", (req, res) => {
    let con = connectToDB();
    let query = "SELECT * FROM customers";
    con.query(query, (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: result
        });
    });
    con.end();
});

app.get("/getCustomerByID/:phoneNum", (req, res) => {
    let phoneNum = req.params.phoneNum;
    let con = connectToDB();
    let query = `SELECT * FROM customers WHERE phone_num = ${phoneNum}`;
    con.query(query, (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: result
        });
    });
    con.end();
});

app.post("/createCustomer", (req, res) => {
    let reqBody = req.body;
    let con = connectToDB();
    let query = `INSERT INTO customers (name, phone_num) VALUES ('${reqBody.name}', '${reqBody.phone}')`;
    con.query(query, (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: `${result.affectedRows} row(s) affected.`
        });
    });
    con.end();
});

app.put("/updateCustomer", (req, res) => {
    let reqBody = req.body;
    let con = connectToDB();
    let query = `UPDATE customers SET name = ? WHERE phone_num = ?`;
    con.query(query, [reqBody.name, reqBody.phone], (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: `${result.affectedRows} row(s) affected.`
        });
    });
    con.end();
});

app.delete("/deleteCustomer", (req, res) => {
    let reqBody = req.body;
    let con = connectToDB();
    let query = `DELETE FROM customers WHERE phone_num = ?`;
    con.query(query, [reqBody.phone], (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: `${result.affectedRows} row(s) affected.`
        });
    });
    con.end();
});

app.post("/enqueue", (req, res) => {
    let reqBody = req.body;
    let con = connectToDB();
    axios.post("http://localhost:5000/createCustomer", {
        name: reqBody.name,
        phone: reqBody.phone
    })
    .then(response => {
        if (response.status === 200) {
            let query = `INSERT INTO queue_test (queueing, phone_num) VALUES (1, '${reqBody.phone}')`;
            con.query(query, (err, result, fields) => {
                if (err) {
                    console.error(`Error: ${err.message}`);
                }
                axios.get(`http://localhost:5000/getQueueNo/${reqBody.phone}`).then(response => {
                    // if required, can dequeue the person here instead of doing so at the FE when they click to create / retrieve qNo
                    res.send({
                        code: 200,
                        queueNo: response.data.message, 
                        message: `${result.affectedRows} row(s) affected.`
                    });
                });
            });
            con.end();
        }
    });
});

app.put("/dequeue", (req, res) => {
    let reqBody = req.body;
    let con = connectToDB();
    let query = `UPDATE queue_test set queueing = 0 where queue_no = ?`;
    con.query(query, [reqBody.queueNum], (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: `${result.affectedRows} row(s) affected.`
        });
    });
    con.end();
});

app.get("/getQueueStatusAll", (req, res) => {
    let con = connectToDB();
    let query = "SELECT COUNT(*) as count FROM queue_test WHERE queueing = 1";
    con.query(query, (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: `${result[0].count}`
        });
    });
    con.end();
});

app.get("/getQueueNo/:phoneNum", (req, res) => {
    let phoneNum = req.params.phoneNum;
    let con = connectToDB();
    let query = "SELECT queue_no FROM queue_test WHERE phone_num = ?";
    con.query(query, [phoneNum], (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: `${result[0].queue_no}`
        });
    });
    con.end();
});

app.get("/getQueueStatus/:queueNum", (req, res) => {
    let queueNum = req.params.queueNum;
    let con = connectToDB();
    let query = "SELECT count(*) as count FROM queue_test WHERE queueing = 1 and queue_no < ?";
    con.query(query, [queueNum], (err, result, fields) => {
        if (err) {
            console.error(`Error: ${err.message}`);
        }
        res.send({
            code: 200, 
            message: `${result[0].count}`
        });
    });
    con.end();
});

app.get("/fetchData", (req, res) => {
    let endpoints = ["https://api.coindesk.com/v1/bpi/currentprice.json", "https://catfact.ninja/fact", "http://localhost:5000/getAllCustomers"];
    axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
        (data) => {
            let resultsArr = [];
            for (let i=0; i<data.length; i++) {
                resultsArr.push(data[i].data);
            }
            res.send({
                code: 200,
                message: resultsArr
            });
        }
    );
});

app.post("/sendData", (req, res) => {
    let url = "http://localhost:5000/createCustomer";
    axios.post(url, {
        name: "Test",
        phone: "22221111"
    })
    .then((response) => {
        res.send({
            code: response.status,
            message: "Data Sent."
        });
    });
});

app.listen(port, host, () => console.log(`Now listening on port ${port}`));

// Archived (ref) code

// Ref for mysql codes: https://www.w3schools.com/nodejs/nodejs_mysql.asp

// Insert multiple rows
// con.connect((err) => {
//     if (err) {
//       console.error('error: ' + err.message);
//     }
//     console.log('Connected to the MySQL server.');
//     let query = "INSERT INTO customers (name, phone_num) VALUES ?";
//     let values = [];
//     values.push(['Company Inc', '12345678'], ['John', '12345679'], ['Peter', '12345671']);
//     con.query(query, [values], (err, result) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log("Number of records inserted: " + result.affectedRows);
//         con.end();
//         console.log("Closed the database connection.");
//     });
// });

// app.get("/fetchData", (req, res) => {
//     let url = "https://api.coindesk.com/v1/bpi/currentprice.json";
//     fetch(url)
//     .then(res => res.json())
//     .then(data => {
//         res.send({
//             code: 200,
//             message: data
//         })
//     })
//     .catch(err => {
//         console.error(`Error: ${err}`);
//     });
// });