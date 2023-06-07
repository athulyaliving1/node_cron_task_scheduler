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



// Convert the cron schedule to GMT
// const gmtCronSchedule = '52 15 * * *'; 

// cron.schedule(gmtCronSchedule, (res) => {
//   let fromid = 'noreply@athulyaseniorcare.com';

//   // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;
  
//   const currentDate = new Date();

//   // Format the current date as 'YYYY-MM-DD'
//   const formattedDates = currentDate.toISOString().slice(0, 10);
  
//   // Replace the placeholder in the SQL query with the current date
//   let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}%'`;
    
//   console.log(sql);


//   let query = conn.query(sql, (err, result) => {


//     if (result.length === 0) {
//       // Return JSON response indicating no data
//       res.send(JSON.stringify({ status: 200, message: "No data available" }));

//   const mail = {
//     from: `${fromid}`,
//     to: 'muthukumar@athulyaliving.com',
//     subject: `Daily update 3.00 Cron job "${formattedDates}"`,
//     html: `<p> ,</p>
//     <p> No data available "${formattedDates}" </p>`,
//   };
//   contactEmail.sendMail(mail, (error) => {
//     if (error) {
//       res.json({ status: "ERROR" });

//     } else {
//       res.json({ status: "Message Sent" });
//     }
//   });

//       return;
//     } 
//     else{
//        // Pass the fetched data to the HTML template
//     const mailOptions = {
//       from: `${fromid}`,
//       to: 'muthukumar@athulyaliving.com',
//       subject: "Daily report:",
//       html: `
//         <html>
//           <head>
//             <style>
//               table {
//                 border: 1px solid #333;
//                 border-collapse: collapse;
//                 width: 100%;
//               }
//               th, td {
//                 border: 1px solid #333;
//                 padding: 8px;
//                 text-align: left;
//               }
//               th {
//                 background-color: #f2f2f2;
//               }
//             </style>
//           </head>
//           <body>
//             <h1>Daily Report </h1>
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Name</th>
//                   <th>Date</th>
//                   <th>Department</th>
//                   <th>Details</th>
//                   <th>Pending</th>
//                   <th>current time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${result
//                   .map(
//                     row => {
//                       const date = new Date(row.date);
//                       const formattedDate = date.toISOString().slice(0, 10);
//                       return `
//                         <tr>
//                           <td>${row.id}</td>
//                           <td>${row.name}</td>
//                           <td>${formattedDate}</td>
//                           <td>${row.department}</td>
//                           <td>${row.details}</td>
//                           <td>${row.pending}</td>
//                           <td>${row.pending}</td>

//                         </tr>
//                       `;
//                     }
//                   )
//                   .join('')}
//               </tbody>
//             </table>
//           </body>
//         </html>
//       `,
//     };

//     // Send the email with the HTML template
//     contactEmail.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//         res.status(500).json({ status: "ERROR" });
//       } else {
//         console.log("Message sent: %s", info.messageId);
//         console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

//         // res.send(JSON.stringify({ status: 200, error: null, response: result }));
//         res.status(200).json({ status: "SUCCESS" });

//       }
//     });
//     }
    
   
//   });
  
// });




const gmtCronSchedule = '41 17 * * *'; // GMT time


cron.schedule(gmtCronSchedule, (res) => {


  var tomaillist = [
    "sysadmin@athulyaliving.com",
    "muthukumar@athulyaliving.com",
    "harish@athulyaliving.com"
  
  ];


  const nowIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
  console.log(`Cron job ran at ${formattedDate}`);
  
  console.log('IST cron schedule:', gmtCronSchedule);
  let fromid = 'noreply@athulyaseniorcare.com';

  // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;
  
  const currentDate = new Date();

  // Format the current date as 'YYYY-MM-DD'
  const formattedDates = currentDate.toISOString().slice(0, 10);
  
  // Replace the placeholder in the SQL query with the current date
  let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}%'`;
    
  console.log(sql);

  let query = conn.query(sql, (err, result) => {


    if (result.length === 0) {
      // Return JSON response indicating no data
      res.send(JSON.stringify({ status: 200, message: "No data available" }));

  const mail = {
    from: `${fromid}`,
    to: 'muthukumar@athulyaliving.com',
    subject: `Daily update 3.00 Cron job "${formattedDates}"`,
    html: `<p> ,</p>
    <p> No data available "${formattedDates}" </p>`,
  };
  contactEmail.sendMail(mail, (error) => {
    if (error) {
      res.json({ status: "ERROR" });

    } else {
      res.json({ status: "Message Sent" });
    }
  });

      return;
    } 
    else{
       // Pass the fetched data to the HTML template
    const mailOptions = {
      from: `${fromid}`,
      to: tomaillist,
      subject: `Daily update 9.00pm Cron job "${formattedDates}"`,
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
            <h1>Daily Report </h1>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Details</th>
                  <th>Pending</th>
                  <th>current time</th>
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
    }
    
   
  });

}, {
  timezone: "Asia/Kolkata"
});













// cron.schedule('*/30 * * * *', () => {

//   let fromid = 'noreply@athulyaseniorcare.com';

//   // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;
  
//   const currentDate = new Date();

//   // Format the current date as 'YYYY-MM-DD'
//   const formattedDates = currentDate.toISOString().slice(0, 10);
  
//   // Replace the placeholder in the SQL query with the current date
//   let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}%'`;
    
//   console.log(sql);


//   let query = conn.query(sql, (err, result) => {


//     if (result.length === 0) {
//       // Return JSON response indicating no data
//       res.send(JSON.stringify({ status: 200, message: "No data available" }));

//   const mail = {
//     from: `${fromid}`,
//     to: 'muthukumar@athulyaliving.com',
//     subject: `Daily update 30 Cron job "${formattedDates}"`,
//     html: `<p> ,</p>
//     <p> No data available "${formattedDates}" </p>`,
//   };
//   contactEmail.sendMail(mail, (error) => {
//     if (error) {
//       res.json({ status: "ERROR" });

//     } else {
//       res.json({ status: "Message Sent" });
//     }
//   });

//       return;
//     } 
//     else{
//        // Pass the fetched data to the HTML template
//     const mailOptions = {
//       from: `${fromid}`,
//       to: 'muthukumar@athulyaliving.com',
//       subject: "Daily report:",
//       html: `
//         <html>
//           <head>
//             <style>
//               table {
//                 border: 1px solid #333;
//                 border-collapse: collapse;
//                 width: 100%;
//               }
//               th, td {
//                 border: 1px solid #333;
//                 padding: 8px;
//                 text-align: left;
//               }
//               th {
//                 background-color: #f2f2f2;
//               }
//             </style>
//           </head>
//           <body>
//             <h1>Daily Report </h1>
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Name</th>
//                   <th>Date</th>
//                   <th>Department</th>
//                   <th>Details</th>
//                   <th>Pending</th>
//                   <th>current time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${result
//                   .map(
//                     row => {
//                       const date = new Date(row.date);
//                       const formattedDate = date.toISOString().slice(0, 10);
//                       return `
//                         <tr>
//                           <td>${row.id}</td>
//                           <td>${row.name}</td>
//                           <td>${formattedDate}</td>
//                           <td>${row.department}</td>
//                           <td>${row.details}</td>
//                           <td>${row.pending}</td>
//                           <td>${row.pending}</td>

//                         </tr>
//                       `;
//                     }
//                   )
//                   .join('')}
//               </tbody>
//             </table>
//           </body>
//         </html>
//       `,
//     };

//     // Send the email with the HTML template
//     contactEmail.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//         res.status(500).json({ status: "ERROR" });
//       } else {
//         console.log("Message sent: %s", info.messageId);
//         console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

//         // res.send(JSON.stringify({ status: 200, error: null, response: result }));
//         res.status(200).json({ status: "SUCCESS" });

//       }
//     });
//     }
   
//   });
// });

// cron.schedule('*/5 * * * *', () => {
//   let fromid = 'noreply@athulyaseniorcare.com';
//   const currentDate = new Date();
//   const formattedDates = currentDate.toISOString().slice(0, 10);

//   let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}%'`;

//   console.log(sql);
//   let query = conn.query(sql, (err, result) => {
//     if (err) throw err;

//     // Remove HTML tags from the data
//     result.forEach(row => {
//       row.details = row.details.replace(/<\/?[^>]+(>|$)/g, "");
//       row.pending = row.pending.replace(/<\/?[^>]+(>|$)/g, "");
//     });

//     // Pass the fetched data to the HTML template
//     const mailOptions = {
//       from: `${fromid}`,
//       to: 'muthukumar@athulyaliving.com',
//       subject: "OTP for registration is:",
//       html: `
//         <html>
//           <head>
//             <style>
//               table {
//                 border: 1px solid #333;
//                 border-collapse: collapse;
//                 width: 100%;
//               }
//               th, td {
//                 border: 1px solid #333;
//                 padding: 8px;
//                 text-align: left;
//               }
//               th {
//                 background-color: #f2f2f2;
//               }
//             </style>
//           </head>
//           <body>
//             <h1>Daily Report</h1>
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Name</th>
//                   <th>Date</th>
//                   <th>Department</th>
//                   <th>Details</th>
//                   <th>Pending</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${result
//                   .map(
//                     row => {
//                       const date = new Date(row.date);
//                       const formattedDate = date.toISOString().slice(0, 10);
//                       const formattedDetails = row.details.replace(/<\/?[^>]+(>|$)/g, "");
//                       const formattedPending = row.pending.replace(/<\/?[^>]+(>|$)/g, "");
//                       return `
//                         <tr>
//                           <td>${row.id}</td>
//                           <td>${row.name}</td>
//                           <td>${formattedDate}</td>
//                           <td>${row.department}</td>
//                           <td>${formattedDetails}</td>
//                           <td>${formattedPending}</td>
//                         </tr>
//                       `;
//                     }
//                   )
//                   .join('')}
//               </tbody>
//             </table>
//           </body>
//         </html>
//       `,
//     };

//     // Send the email with the HTML template
//     contactEmail.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//         res.status(500).json({ status: "ERROR" });
//       } else {
//         console.log("Message sent: %s", info.messageId);
//         console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

//         res.send(JSON.stringify({ status: 200, error: null, response: result }));
//       }
//     });
//   });
// });


app.get("/leads", (req, res) => {

  let fromid = 'noreply@athulyaseniorcare.com';

  // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;
  
  const currentDate = new Date();

  // Format the current date as 'YYYY-MM-DD'
  const formattedDates = currentDate.toISOString().slice(0, 10);
  
  // Replace the placeholder in the SQL query with the current date
  let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}%'`;
    
  console.log(sql);


  let query = conn.query(sql, (err, result) => {


    if (result.length === 0) {
      // Return JSON response indicating no data
      res.send(JSON.stringify({ status: 200, message: "No data available" }));

  const mail = {
    from: `${fromid}`,
    to: 'muthukumar@athulyaliving.com',
    subject: `Daily update 30 Cron job "${formattedDates}"`,
    html: `<p> ,</p>
    <p> No data available "${formattedDates}" </p>`,
  };
  contactEmail.sendMail(mail, (error) => {
    if (error) {
      res.json({ status: "ERROR" });

    } else {
      res.json({ status: "Message Sent" });
    }
  });

      return;
    } 
    else{
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
            <h1>Daily Report </h1>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Details</th>
                  <th>Pending</th>
                  <th>current time</th>
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
    }
   
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

  var datetime = new Date();
  console.log(datetime.toISOString().slice(0,10));
  console.log(`Server is running on port ${PORT}.`);
});



module.exports = app;
