var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
const nodemailer = require("nodemailer");
var cron = require('node-cron');
const moment = require('moment-timezone');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
/** @type {*} */
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// const port = 8080;

/** @type {*} */
var conn = mysql.createConnection({
  host: "162.241.123.158",
  user: "theatgg6_cms",
  password: "Health@123",
  database: "theatgg6_cms"
});


conn.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + conn.threadId);
});

const contactEmail = nodemailer.createTransport({
  host: "mail.athulyahomecare.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "noreply@athulyaseniorcare.com", // generated ethereal user
    pass: "Athulya@123", // generated ethereal password
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});



// conn.connect((err) => {
//   if (err) throw err;
//   console.log("MySQL connected");
// });





cron.schedule('0 6 * * *', () => {


 // Get the current date and time in IST
//  const nowIST = moment.tz('Asia/Kolkata');

//  // Convert the date and time to GMT
//  const nowGMT = nowIST.clone().tz('GMT');

//  // Format the GMT date and time
//  const gmtDateTime = nowGMT.format('YYYY-MM-DD HH:mm:ss');

//  console.log('IST:', nowIST.format('YYYY-MM-DD HH:mm:ss'));
//  console.log('GMT:', gmtDateTime);

  let fromid = 'noreply@athulyaseniorcare.com';

  // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;
  
  const currentDate = new Date();

  // Format the current date as 'YYYY-MM-DD'
  const formattedDates = currentDate.toISOString().slice(0, 10);
  
  // Replace the placeholder in the SQL query with the current date
  // let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}'`;
  let sql = `SELECT * FROM daily_update WHERE department='IT' AND date >= '2023-06-02%'`;
    
  console.log(sql);
  let query = conn.query(sql, (err, result) => {

    if (err) throw err;

    // Pass the fetched data to the HTML template
    const mailOptions = {
      from: `${fromid}`,
      to: 'muthukumar@athulyaliving.com',
      subject: "OTP for registration is:",
      html: `
        <html>
          <head>
            <style>
              table {
                border: 1px solid #333;
                border-collapse: collapse;
                width: 100%;
              }
              th, td {
                border: 1px solid #333;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Daily Report</h1>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Details</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                ${result
                  .map(
                    row => {
                      const date = new Date(row.date);
                      const formattedDate = date.toISOString().slice(0, 10);
                      return `
                        <tr>
                          <td>${row.id}</td>
                          <td>${row.name}</td>
                          <td>${formattedDate}</td>
                          <td>${row.department}</td>
                          <td>${row.details}</td>
                          <td>${row.pending}</td>
                        </tr>
                      `;
                    }
                  )
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `,
    };

    // Send the email with the HTML template
    contactEmail.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json({ status: "ERROR" });
      } else {
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.send(JSON.stringify({ status: 200, error: null, response: result }));
      }
    });
  });
});



app.get("/leads", (req, res) => {

  const CURRENT_DATE = new Date();

  console.log(CURRENT_DATE);

const currentDate = new Date();
const targetDate = new Date(currentDate.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000);
const formattedDate = targetDate.toISOString().slice(0, 10);

console.log(formattedDate);
let fromid = 'noreply@athulyaseniorcare.com';

  // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;
  
  let sql = `SELECT * FROM daily_update WHERE department='IT' AND date >= '2023-06-02%'`;
    
  console.log(sql);
  let query = conn.query(sql, (err, result) => {

    if (err) throw err;

    // Pass the fetched data to the HTML template
    const mailOptions = {
      from: `${fromid}`,
      to: 'muthukumar@athulyaliving.com',
      subject: "Daily report:",
      html: `
        <html>
          <head>
            <style>
              table {
                border: 1px solid #333;
                border-collapse: collapse;
                width: 100%;
              }
              th, td {
                border: 1px solid #333;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Daily Report</h1>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Details</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                ${result
                  .map(
                    row => {
                      const date = new Date(row.date);
                      const formattedDate = date.toISOString().slice(0, 10);
                      return `
                        <tr>
                          <td>${row.id}</td>
                          <td>${row.name}</td>
                          <td>${formattedDate}</td>
                          <td>${row.department}</td>
                          <td>${row.details}</td>
                          <td>${row.pending}</td>
                        </tr>
                      `;
                    }
                  )
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `,
    };

    // Send the email with the HTML template
    contactEmail.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json({ status: "ERROR" });
      } else {
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        // res.send(JSON.stringify({ status: 200, error: null, response: result }));
        res.status(200).json({ status: "SUCCESS" });

      }
    });
  });
});




// app.listen(port, () => console.log(`Listening on port ${port}..`));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});



module.exports = app;
