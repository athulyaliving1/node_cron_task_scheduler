var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
const nodemailer = require("nodemailer");
var cron = require('node-cron');
const moment = require('moment-timezone');
const he = require('he');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { error } = require('console');
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
  port: 3306,
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




//Daily Task Update


const gmtCronSchedule1 = '00 21 * * *'; // GMT time
console.log(`IST cron schedule:', ${gmtCronSchedule1}`);

cron.schedule(gmtCronSchedule1, (res) => {


  var tomaillist = [
    "sysadmin@athulyaliving.com",
    "prabhagaran@athulyaliving.com",
    "itteam@athulyaliving.com"

  ];


  const nowIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
  console.log(`Cron job ran at ${formattedDate}`);


  let fromid = 'noreply@athulyaseniorcare.com';

  // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;

  const currentDate = new Date();

  // Format the current date as 'YYYY-MM-DD'
  const formattedDates = currentDate.toISOString().slice(0, 10);

  // Replace the placeholder in the SQL query with the current date
  let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}%'`;

  console.log(sql);

  let query = conn.query(sql, (err, result, res) => {


    if (result.length === 0) {
      // Return JSON response indicating no data
      // res.send(JSON.stringify({ status: 200, message: "No data available" }));

      const mail = {
        from: `${fromid}`,
        to: tomaillist,
        subject: `Daily update 9.00 Cron job "${formattedDates}"`,
        html: `<p> Daily Update </p>
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
    else {
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
                </tr>
              </thead>
              <tbody>
              ${result
            .map(row => {
              const date = new Date(row.date);
              const formattedDate = date.toISOString().slice(0, 10);
              const detailsWithoutTags = he.decode(row.details.replace(/<[^>]+>/g, ''));
              const pendingWithoutTags = he.decode(row.pending.replace(/<[^>]+>/g, ''));
              return `
                    <tr>
                      <td>${row.id}</td>
                      <td>${row.name}</td>
                      <td>${formattedDate}</td>
                      <td>${row.department}</td>
                      <td>${detailsWithoutTags}</td>
                      <td>${pendingWithoutTags}</td>
                    </tr>
                  `;
            })
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


//---------------------------------------------------------------- NEW  Complaint List --------------------------------------------------------------------------------


const gmtCronSchedule2 = '54 20 * * *';

console.log(`New complaint running cron:', ${gmtCronSchedule2}`);

cron.schedule(gmtCronSchedule2, () => {
  const tomaillist2 = ["muthukumar@athulyaliving.com"];
  const nowIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
  console.log(`Cron job ran at ${gmtCronSchedule2}`);

  const fromid = 'noreply@athulyaseniorcare.com';
  const currentDate = new Date();
  const formattedDates = currentDate.toISOString().slice(0, 10);

  const sql = `SELECT tblcomplaints.userId, tblcomplaints.complaintNumber, tblcomplaints.complaintType, tblcomplaints.complaintDetails, tblcomplaints.status, tblcomplaints.regDate, tblcomplaints.fromdepartment, tblcomplaints.location, tblcomplaints.place,tblcomplaints.todepartment users.fullName, users.emp_id FROM users INNER JOIN tblcomplaints ON tblcomplaints.userId = users.id WHERE tblcomplaints.status = 'notprocessyet' AND tblcomplaints.todepartment = 'IT' AND tblcomplaints.regDate='${formattedDate}%'`;


  // check here
  // console.log(sql);

  conn.query(sql, (res, err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ status: "ERROR" });
      return;
    }

    if (!result || result.length === 0) {
      const mail = {
        from: `${fromid}`,
        to: tomaillist2,
        subject: `IT New Complaint List Date "${formattedDates}"`,
        html: `
          <p>IT New Complaint List</p>
          <p>No data available "${formattedDates}"</p>`,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: "ERROR" });
        } else {
          res.json({ status: "Message Sent" });
        }
      });

      return;
    } else {
      const mailOptions = {
        from: fromid,
        to: tomaillist2,
        subject: `IT New Complaint List Date "${formattedDates}"`,
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
                    <th>C.NO</th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Complaint Type</th>
                    <th>Department</th>
                    <th>Complaint Details</th>
                    <th>Location</th>
                    <th>Place</th>
                    <th>Complaint Date</th>              
                  </tr>
                </thead>
                <tbody>
                  ${result
            .map(row => {
              const date = new Date(row.regDate);
              const formattedDate = date.toISOString().slice(0, 10);
              const detailsWithoutTags = he.decode(row.complaintDetails.replace(/<[^>]+>/g, ''));
              return `
                        <tr>
                          <td>${row.complaintNumber}</td>
                          <td>${row.emp_id}</td>
                          <td>${row.fullName}</td>
                          <td>${row.complaintType}</td>
                          <td>${row.fromdepartment}</td>
                          <td>${detailsWithoutTags}</td>
                          <td>${row.location}</td>
                          <td>${row.place}</td>
                          <td>${formattedDate}</td>
                        </tr>
                      `;
            })
            .join('')}
                </tbody>
              </table>
            </body>
          </html>
        `,
      };

      contactEmail.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: "ERROR" });
        } else {
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          res.status(200).json({ status: "SUCCESS" });
        }
      });
    }
  });
}, {
  timezone: "Asia/Kolkata"
});




//---------------------------------------------------------------- IT INPROCESS COMPLAINT ----------------------------------------------------------------------------



const gmtCronSchedule3 = '57 20 * * *';

console.log(`In process running complaint cron:', ${gmtCronSchedule3}`);

cron.schedule(gmtCronSchedule3, () => {
  const tomaillist3 = ["muthukumar@athulyaliving.com"];
  const nowIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
  console.log(`Cron job ran at ${gmtCronSchedule3}`);

  const fromid = 'noreply@athulyaseniorcare.com';
  const currentDate = new Date();
  const formattedDates = currentDate.toISOString().slice(0, 10);

  const sql = `SELECT tblcomplaints.userId, tblcomplaints.complaintNumber, tblcomplaints.complaintType, tblcomplaints.complaintDetails, tblcomplaints.todepartment, tblcomplaints.status, tblcomplaints.fromdepartment, tblcomplaints.location, tblcomplaints.place, tblcomplaints.regDate, users.fullName, users.emp_id FROM users INNER JOIN tblcomplaints ON tblcomplaints.userId = users.id WHERE tblcomplaints.status = 'inprocess' AND tblcomplaints.todepartment = 'IT'`;

  console.log(sql);

  conn.query(sql, (err, result) => {



    if (!result || result.length === 0) {
      const mail = {
        from: fromid,
        to: tomaillist3,
        subject: `IT Inprocess Complaint List Date "${formattedDates}"`,
        html: `
          <p>IT Inprocess Complaint List</p>
          <p>No data available "${formattedDates}"</p>`,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: "ERROR" });
        } else {
          res.json({ status: "Message Sent" });
        }
      });

      return;
    } else {
      const mailOptions = {
        from: fromid,
        to: tomaillist3,
        subject: `IT Inprocess Complaint List "${formattedDates}"`,
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
              <h1>IT Inprocess Complaint List</h1>
              <table>
                <thead>
                  <tr>
                    <th>C.NO</th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Complaint Type</th>
                    <th>Department</th>
                    <th style='white-space: nowrap'>Complaint Details</th>
                    <th>Location</th>
                    <th>Place</th>
                    <th>Complaint Date</th> 
                    <th>Status</th>                
                  </tr>
                </thead>
                <tbody>
                  ${result
            .map(row => {
              const date = new Date(row.regDate);
              const formattedDate = date.toISOString().slice(0, 10);
              const detailsWithoutTags = he.decode(row.complaintDetails.replace(/<[^>]+>/g, ''));
              return `
                        <tr>
                          <td>${row.complaintNumber}</td>
                          <td>${row.emp_id}</td>
                          <td>${row.fullName}</td>
                          <td>${row.complaintType}</td>
                          <td>${row.fromdepartment}</td>
                          <td>${detailsWithoutTags}</td>
                          <td>${row.location}</td>
                          <td>${row.place}</td>
                          <td>${formattedDate}</td>
                          <td>IN Process</td>
                         
                        </tr>
                      `;
            })
            .join('')}
                </tbody>
              </table>
            </body>
          </html>
        `,
      };

      contactEmail.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: "ERROR" });
        } else {
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          res.status(200).json({ status: "SUCCESS" });
        }
      });
    }
  });
},
  {
    timezone: "Asia/Kolkata"
  });



//---------------------------------------------------------------- IT INPROCESS COMPLAINT ----------------------------------------------------------------------------












// -------------------------------- ------------------------------------- CLOSED COMPLAINT  CRON JOBS  --------------------------------------------------------------------

const gmtCronSchedule4 = '45 20 * * *';

console.log(`Closed complaint running complaint cron:', ${gmtCronSchedule4}`);


cron.schedule(gmtCronSchedule4, () => {
  const tomaillist4 = ["muthukumar@athulyaliving.com"];
  const nowIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
  console.log(`Cron job ran at ${gmtCronSchedule4}`);

  const fromid = 'noreply@athulyaseniorcare.com';
  const currentDate = new Date();
  const formattedDates = currentDate.toISOString().slice(0, 10);

  const sql = `SELECT tblcomplaints.userId, tblcomplaints.complaintNumber, tblcomplaints.complaintType, tblcomplaints.complaintDetails, tblcomplaints.todepartment, tblcomplaints.status, tblcomplaints.fromdepartment, tblcomplaints.location, tblcomplaints.place, tblcomplaints.regDate, users.fullName, users.emp_id FROM users INNER JOIN tblcomplaints ON tblcomplaints.userId = users.id WHERE tblcomplaints.status = 'closed' AND tblcomplaints.todepartment = 'IT' AND tblcomplaints.regDate LIKE '${formattedDate}%'`;

  console.log(sql);

  conn.query(sql, (err, result) => {


    if (!result || result.length === 0) {
      const mail = {
        from: fromid,
        to: tomaillist4,
        subject: `IT Closed Complaint List Date "${formattedDates}"`,
        html: `
          <p>IT Closed Complaint List</p>
          <p>No data available "${formattedDates}"</p>`,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: "ERROR" });
        } else {
          res.json({ status: "Message Sent" });
        }
      });

      return;
    } else {
      const mailOptions = {
        from: fromid,
        to: tomaillist4,
        subject: `IT New Complaint List Date "${formattedDates}"`,
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
              <h1>IT Closed Complaint List</h1>
              <table>
                <thead>
                  <tr>
                    <th>C.NO</th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Complaint Type</th>
                    <th>Department</th>
                    <th style='white-space: nowrap'>Complaint Details</th>
                    <th>Location</th>
                    <th>Place</th>
                    <th>Complaint Date</th> 
                    <th>Status</th>                
                  </tr>
                </thead>
                <tbody>
                  ${result
            .map(row => {
              const date = new Date(row.regDate);
              const formattedDate = date.toISOString().slice(0, 10);
              const detailsWithoutTags = he.decode(row.complaintDetails.replace(/<[^>]+>/g, ''));
              return `
                        <tr>
                          <td>${row.complaintNumber}</td>
                          <td>${row.emp_id}</td>
                          <td>${row.fullName}</td>
                          <td>${row.complaintType}</td>
                          <td>${row.fromdepartment}</td>
                          <td>${detailsWithoutTags}</td>
                          <td>${row.location}</td>
                          <td>${row.place}</td>
                          <td>${formattedDate}</td>
                          <td>Closed</td>
                         
                        </tr>
                      `;
            })
            .join('')}
                </tbody>
              </table>
            </body>
          </html>
        `,
      };

      contactEmail.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: "ERROR" });
        } else {
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          res.status(200).json({ status: "SUCCESS" });
        }
      });
    }
  });
},
  {
    timezone: "Asia/Kolkata"
  });

// -------------------------------- CLOSED COMPLAINT  CRON JOBS  -------------------------------------------------------------------------------------



  //---------------------------------------------------------------- API testing ------------------------------------------------------------------------------------

app.get("/leads", (req, res) => {
  const fromid = 'noreply@athulyaseniorcare.com';
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10);

  const sql = `SELECT * FROM daily_update WHERE department='IT' AND date = '${formattedDate}'`;

  console.log(sql);

  conn.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ status: "ERROR" });
      return;
    }

    if (result.length === 0) {
      const mail = {
        from: fromid,
        to: 'muthukumar@athulyaliving.com',
        subject: `Daily update 30 Cron job "${formattedDate}"`,
        html: `<p>Daily Update</p>
          <p>No data available "${formattedDate}"</p>`,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: "ERROR" });
        } else {
          res.json({ status: "Message Sent" });
        }
      });
    } else {
      const mailOptions = {
        from: fromid,
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
            .map(row => {
              const date = new Date(row.date);
              const formattedDate = date.toISOString().slice(0, 10);
              const detailsWithoutTags = he.decode(row.details.replace(/<[^>]+>/g, ''));
              const pendingWithoutTags = he.decode(row.pending.replace(/<[^>]+>/g, ''));
              return `
                        <tr>
                          <td>${row.id}</td>
                          <td>${row.name}</td>
                          <td>${formattedDate}</td>
                          <td>${row.department}</td>
                          <td>${detailsWithoutTags}</td>
                          <td>${pendingWithoutTags}</td>
                        </tr>
                      `;
            })
            .join('')}
                </tbody>
              </table>
            </body>
          </html>
        `,
      };

      contactEmail.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: "ERROR" });
        } else {
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          res.status(200).json({ status: "SUCCESS" });
        }
      });
    }
  });
});







// const gmtCronSchedule = '15 09 * * *'; // GMT time
// console.log(`IST cron schedule:', ${gmtCronSchedule}`);

// cron.schedule(gmtCronSchedule, (res) => {


//   var tomaillist = [
//     // "sysadmin@athulyaliving.com",
//     // "prabhagaran@athulyaliving.com",
//     // "itteam@athulyaliving.com"
//     "muthukumar@athulyaliving.com"

//   ];


//   const nowIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//   const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
//   console.log(`Cron job ran at ${formattedDate}`);


//   let fromid = 'noreply@athulyaseniorcare.com';

//   // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;

//   const currentDate = new Date();

//   // Format the current date as 'YYYY-MM-DD'
//   const formattedDates = currentDate.toISOString().slice(0, 10);

//   // Replace the placeholder in the SQL query with the current date
//   let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}%'`;

//   console.log(sql);

//   let query = conn.query(sql, (err, result, res) => {


//     if (result.length === 0) {
//       // Return JSON response indicating no data
//       // res.send(JSON.stringify({ status: 200, message: "No data available" }));

//       const mail = {
//         from: `${fromid}`,
//         to: 'muthukumar@athulyaliving.com',
//         subject: `Daily update 9.00 Cron job "${formattedDates}"`,
//         html: `<p> Daily Update </p>
//     <p> No data available "${formattedDates}" </p>`,
//       };
//       contactEmail.sendMail(mail, (error) => {
//         if (error) {
//           res.json({ status: "ERROR" });

//         } else {
//           res.json({ status: "Message Sent" });
//         }
//       });

//       return;
//     }
//     else {
//       // Pass the fetched data to the HTML template
//       const mailOptions = {
//         from: `${fromid}`,
//         to: tomaillist,
//         subject: `Daily update 9.00pm Cron job "${formattedDates}"`,
//         html: `
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
//                 </tr>
//               </thead>
//               <tbody>
//               ${result
//             .map(row => {
//               const date = new Date(row.date);
//               const formattedDate = date.toISOString().slice(0, 10);
//               const detailsWithoutTags = he.decode(row.details.replace(/<[^>]+>/g, ''));
//               const pendingWithoutTags = he.decode(row.pending.replace(/<[^>]+>/g, ''));
//               return `
//                     <tr>
//                       <td>${row.id}</td>
//                       <td>${row.name}</td>
//                       <td>${formattedDate}</td>
//                       <td>${row.department}</td>
//                       <td>${detailsWithoutTags}</td>
//                       <td>${pendingWithoutTags}</td>
//                     </tr>
//                   `;
//             })
//             .join('')}
//             </tbody>
//             </table>
//           </body>
//         </html>
//       `,
//       };

//       // Send the email with the HTML template
//       contactEmail.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log(error);
//           res.status(500).json({ status: "ERROR" });
//         } else {
//           console.log("Message sent: %s", info.messageId);
//           console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

//           // res.send(JSON.stringify({ status: 200, error: null, response: result }));
//           res.status(200).json({ status: "SUCCESS" });

//         }
//       });
//     }


//   });

// }, {
//   timezone: "Asia/Kolkata"
// });



// const gmtCronSchedules = '11 50 * * *'; // GMT time
// console.log(`IST cron schedule:', ${gmtCronSchedules}`);

// cron.schedule(gmtCronSchedule, (res) => {


//   var tomaillist = [
//     // "sysadmin@athulyaliving.com",
//     // "prabhagaran@athulyaliving.com",
//     // "itteam@athulyaliving.com"
//     "muthukumar@athulyaliving.com"

//   ];


//   const nowIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//   const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
//   console.log(`Cron job ran at ${formattedDate}`);


//   let fromid = 'noreply@athulyaseniorcare.com';

//   // let sql = `SELECT * FROM daily_update WHERE department='IT' AND date LIKE '2023-06-02%'`;

//   const currentDate = new Date();

//   // Format the current date as 'YYYY-MM-DD'
//   const formattedDates = currentDate.toISOString().slice(0, 10);

//   // Replace the placeholder in the SQL query with the current date
//   let sql = `SELECT * FROM daily_update WHERE date >= '${formattedDates}%'`;

//   console.log(sql);

//   let query = conn.query(sql, (err, result, res) => {


//     if (result.length === 0) {
//       // Return JSON response indicating no data
//       // res.send(JSON.stringify({ status: 200, message: "No data available" }));

//       const mail = {
//         from: `${fromid}`,
//         to: 'muthukumar@athulyaliving.com',
//         subject: `Daily update 9.00 Cron job "${formattedDates}"`,
//         html: `<p> Daily Update </p>
//     <p> No data available "${formattedDates}" </p>`,
//       };
//       contactEmail.sendMail(mail, (error) => {
//         if (error) {
//           res.json({ status: "ERROR" });

//         } else {
//           res.json({ status: "Message Sent" });
//         }
//       });

//       return;
//     }
//     else {
//       // Pass the fetched data to the HTML template
//       const mailOptions = {
//         from: `${fromid}`,
//         to: tomaillist,
//         subject: `Daily update 9.00pm Cron job "${formattedDates}"`,
//         html: `
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
//                 </tr>
//               </thead>
//               <tbody>
//               ${result
//             .map(row => {
//               const date = new Date(row.date);
//               const formattedDate = date.toISOString().slice(0, 10);
//               const detailsWithoutTags = he.decode(row.details.replace(/<[^>]+>/g, ''));
//               const pendingWithoutTags = he.decode(row.pending.replace(/<[^>]+>/g, ''));
//               return `
//                     <tr>
//                       <td>${row.id}</td>
//                       <td>${row.name}</td>
//                       <td>${formattedDate}</td>
//                       <td>${row.department}</td>
//                       <td>${detailsWithoutTags}</td>
//                       <td>${pendingWithoutTags}</td>
//                     </tr>
//                   `;
//             })
//             .join('')}
//             </tbody>
//             </table>
//           </body>
//         </html>
//       `,
//       };

//       // Send the email with the HTML template
//       contactEmail.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log(error);
//           res.status(500).json({ status: "ERROR" });
//         } else {
//           console.log("Message sent: %s", info.messageId);
//           console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

//           // res.send(JSON.stringify({ status: 200, error: null, response: result }));
//           res.status(200).json({ status: "SUCCESS" });

//         }
//       });
//     }


//   });

// }, {
//   timezone: "Asia/Kolkata"
// });














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
  console.log(datetime.toISOString().slice(0, 10));
  console.log(`Server is running on port ${PORT}.`);
});



module.exports = app;
