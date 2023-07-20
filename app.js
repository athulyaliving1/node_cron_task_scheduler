var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mysql = require("mysql");
const nodemailer = require("nodemailer");
var cron = require("node-cron");
const moment = require("moment-timezone");
const he = require("he");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const { error } = require("console");
/** @type {*} */
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// const port = 8080;

/** @type {*} */
var conn = mysql.createConnection({
  host: "162.241.123.158",
  user: "theatgg6_cms",
  password: "Health@123",
  port: 3306,
  database: "theatgg6_cms",
});

conn.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }
  console.log("Connected to MySQL as id " + conn.threadId);
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

const gmtCronSchedule1 = "00 21 * * *"; // GMT time
console.log(`IST cron schedule:', ${gmtCronSchedule1}`);

cron.schedule(
  gmtCronSchedule1,
  (res) => {
    var tomaillist = [
      "sysadmin@athulyaliving.com",
      "prabhagaran@athulyaliving.com",
      "itteam@athulyaliving.com",
    ];

    const nowIST = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
    console.log(`Cron job ran at ${formattedDate}`);

    let fromid = "noreply@athulyaseniorcare.com";

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
      } else {
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
              .map((row) => {
                const date = new Date(row.date);
                const formattedDate = date.toISOString().slice(0, 10);
                const detailsWithoutTags = he.decode(
                  row.details.replace(/<[^>]+>/g, "")
                );
                const pendingWithoutTags = he.decode(
                  row.pending.replace(/<[^>]+>/g, "")
                );
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
              .join("")}
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
  },
  {
    timezone: "Asia/Kolkata",
  }
);

//---------------------------------------------------------------- NEW  Complaint List --------------------------------------------------------------------------------

const gmtCronSchedule2 = "54 20 * * *";

console.log(`New complaint running cron:', ${gmtCronSchedule2}`);

cron.schedule(
  gmtCronSchedule2,
  () => {
    // const tomaillist2 = ["muthukumar@athulyaliving.com"];
    const tomaillist2 = [
      "muthukumar@athulyaliving.com",
      "itteam@athulyaliving.com",
    ];
    const nowIST = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
    console.log(`Cron job ran at ${gmtCronSchedule2}`);

    const fromid = "noreply@athulyaseniorcare.com";
    const currentDate = new Date();
    const formattedDates = currentDate.toISOString().slice(0, 10);

    const sql = `SELECT tblcomplaints.userId, tblcomplaints.complaintNumber, tblcomplaints.complaintType, tblcomplaints.complaintDetails, tblcomplaints.status, tblcomplaints.regDate, tblcomplaints.fromdepartment, tblcomplaints.location, tblcomplaints.place, tblcomplaints.todepartment, users.fullName, users.emp_id FROM users INNER JOIN tblcomplaints ON tblcomplaints.userId = users.id WHERE tblcomplaints.status = 'notprocessyet' AND tblcomplaints.todepartment = 'IT'`;

    // check here
    console.log(sql);

    conn.query(sql, (err, result) => {
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
                  background-color: #176291;
                  color: #fff;
                }
                tr:nth-child(even) {background-color: #f2f2f2;}
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
              .map((row) => {
                const date = new Date(row.regDate);
                const formattedDate = date.toISOString().slice(0, 10);
                const detailsWithoutTags = he.decode(
                  row.complaintDetails.replace(/<[^>]+>/g, "")
                );
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
              .join("")}
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
    timezone: "Asia/Kolkata",
  }
);

//---------------------------------------------------------------- IT INPROCESS COMPLAINT ----------------------------------------------------------------------------

const gmtCronSchedule3 = "57 20 * * *";

console.log(`In process running complaint cron:', ${gmtCronSchedule3}`);

cron.schedule(
  gmtCronSchedule3,
  () => {
    const tomaillist3 = [
      "muthukumar@athulyaliving.com",
      "itteam@athulyaliving.com",
    ];
    const nowIST = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
    console.log(`Cron job ran at ${gmtCronSchedule3}`);

    const fromid = "noreply@athulyaseniorcare.com";
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
                  background-color: #176291;
                  color: #fff;
                }
                tr:nth-child(even) {background-color: #f2f2f2;}
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
              .map((row) => {
                const date = new Date(row.regDate);
                const formattedDate = date.toISOString().slice(0, 10);
                const detailsWithoutTags = he.decode(
                  row.complaintDetails.replace(/<[^>]+>/g, "")
                );
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
              .join("")}
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
    timezone: "Asia/Kolkata",
  }
);

//---------------------------------------------------------------- IT INPROCESS COMPLAINT ----------------------------------------------------------------------------

// -------------------------------- ------------------------------------- CLOSED COMPLAINT  CRON JOBS  --------------------------------------------------------------------

const gmtCronSchedule4 = "55 20 * * *";

console.log(`Closed complaint running complaint cron:', ${gmtCronSchedule4}`);

cron.schedule(
  gmtCronSchedule4,
  () => {
    const tomaillist4 = [
      "muthukumar@athulyaliving.com",
      "itteam@athulyaliving.com",
    ];
    // const tomaillist4 = ["muthukumar@athulyaliving.com"];
    const nowIST = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
    console.log(`Cron job ran at ${gmtCronSchedule4}`);

    const fromid = "noreply@athulyaseniorcare.com";
    const currentDate = new Date();
    const formattedDates = currentDate.toISOString().slice(0, 10);

    const sql = `SELECT tblcomplaints.userId, tblcomplaints.complaintNumber, tblcomplaints.complaintType, tblcomplaints.complaintDetails, tblcomplaints.todepartment, tblcomplaints.status, tblcomplaints.fromdepartment, tblcomplaints.location, tblcomplaints.place, tblcomplaints.regDate, users.fullName, users.emp_id FROM users INNER JOIN tblcomplaints ON tblcomplaints.userId = users.id WHERE tblcomplaints.status = 'closed' AND tblcomplaints.todepartment = 'IT' AND  DATE(tblcomplaints.regDate)='${formattedDates}'`;

    console.log(sql);

    conn.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ status: "ERROR" });
        return;
      }

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
          subject: `IT Closed Complaints List Date "${formattedDates}"`,
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
                  background-color: #176291;
                  color: #fff;
                }
                tr:nth-child(even) {background-color: #f2f2f2;}
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
              .map((row) => {
                const date = new Date(row.regDate);
                const formattedDate = date.toISOString().slice(0, 10);
                const detailsWithoutTags = he.decode(
                  row.complaintDetails.replace(/<[^>]+>/g, "")
                );
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
              .join("")}
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
    timezone: "Asia/Kolkata",
  }
);

// -------------------------------- CLOSED COMPLAINT  CRON JOBS  ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------IT New Requirement List ----------------------------------------------------------------

const gmtCronSchedule6 = "00 09 * * *";

console.log(`New Requirement running cron:', ${gmtCronSchedule6}`);

cron.schedule(
  gmtCronSchedule6,
  () => {
    const tomaillist2 = ["muthukumar@athulyaliving.com"];
    // const tomaillist2 = [
    //   "muthukumar@athulyaliving.com",
    //   "itteam@athulyaliving.com",
    // ];
    const nowIST = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
    console.log(`Cron job ran at ${gmtCronSchedule6}`);



    const fromid = "noreply@athulyaseniorcare.com";
    const currentDate = new Date();
    const formattedDates = currentDate.toISOString().slice(0, 10);

    const sql = `SELECT requirements.*, users.fullName AS name, users.emp_id FROM requirements JOIN users ON users.id = requirements.userId WHERE requirements.status = 'approved' AND requirements.tlstatus IS NULL AND requirements.todepartment = 'IT';`;

    // check here
    console.log(sql);

    conn.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ status: "ERROR" });
        return;
      }

      if (!result || result.length === 0) {
        const mail = {
          from: `${fromid}`,
          to: tomaillist2,
          subject: `IT New Requirement List Date "${formattedDate}"`,
          html: `
          <p>IT New Requirement List</p>
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
        const signatureImageBase64 = "data:image/jpeg;base64,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FPwnjP8ALCZfuhj5B9i/t6h71PyqfOU6ifV6b7mT82nvF/UU79vZXGfv279v4YzLv2+7v/rQ+7vj5B9i+fLUMf6VPyqh85bqHy4cNM54zjwnzjyzjxfLNPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VR+cp1E+r033Mn5tPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VPnKdRPq9N9zJ+bT3i/qKfhPGf5YTL90MfIPsX9vUPep+VT5ynUT6vTfcyfm094v6in4Txn+WEy/dDHyD7F/b1D3qflU+cp1E+r033Mn5tPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VPnKdRPq9N9zJ+bT3i/qKfhPGf5YTL90MfIPsX9vUPep+VT5ynUT6vTfcyfm094v6in4Txn+WEy/dDHyD7F/b1D3qflU+cp1E+r033Mn5tPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VPnKdRPq9N9zJ+bT3i/qKfhPGf5YTL90MfIPsX9vUPep+VT5ynUT6vTfcyfm094v6in4Txn+WEy/dDHyD7F/b1D3qflU+cp1E+r033Mn5tPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VPnKdRPq9N9zJ+bT3i/qKfhPGf5YTL90MfIPsX9vUPep+VT5ynUT6vTfcyfm094v6in4Txn+WEy/dDHyD7F/b1D3qflU+cp1E+r033Mn5tPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VPnKdRPq9N9zJ+bT3i/qKfhPGf5YTL90MfIPsX9vUPep+VT5ynUT6vTfcyfm094v6in4Txn+WEy/dDHyD7F/b1D3qflU+cp1E+r033Mn5tPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VPnKdRPq9N9zJ+bT3i/qKfhPGf5YTL90MfIPsX9vUPep+VT5ynUT6vTfcyfm094v6in4Txn+WEy/dDHyD7F/b1D3qflU+cp1E+r033Mn5tPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VPnKdRPq9N9zJ+bT3i/qKfhPGf5YTL90MfIPsX9vUPep+VT5ynUT6vTfcyfm094v6in4Txn+WEy/dDHyD7F/b1D3qflU+cp1E+r033Mn5tPeL+op+E8Z/lhMv3Qx8g+xf29Q96n5VPnKdRPq9N9zJ+bT3i/qKfhPGf5YTL90MfIPsX9vUPep+VT5ynUT6vT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V7dvqdb/AG79/wDXhPfv/v8A/aGPlv395+NbZ/0CVH5v3TfHHwLjjnOPFPn7fLzrx7vJ01fybb/zwnv6hj5b9/fXW/uEqHzfem/7vP70/wANPd5Omr+Tbf8AnhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/wDPCe/qGPlv399db+4Snzfem/7vP70/w093k6av5Nt/54T39Qx8t+/vrrf3CU+b703/AHef3p/hp7vJ01fybb/zwnv6hj5b9/fXW/uEp833pv8Au8/vT/DT3eTpq/k23/nhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/88J7+oY+W/f311v7hKfN96b/u8/vT/DT3eTpq/k23/nhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/8APCe/qGPlv399db+4Snzfem/7vP70/wANPd5Omr+Tbf8AnhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/wDPCe/qGPlv399db+4Snzfem/7vP70/w093k6av5Nt/54T39Qx8t+/vrrf3CU+b703/AHef3p/hp7vJ01fybb/zwnv6hj5b9/fXW/uEp833pv8Au8/vT/DT3eTpq/k23/nhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/88J7+oY+W/f311v7hKfN96b/u8/vT/DT3eTpq/k23/nhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/8APCe/qGPlv399db+4Snzfem/7vP70/wANPd5Omr+Tbf8AnhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/wDPCe/qGPlv399db+4Snzfem/7vP70/w093k6av5Nt/54T39Qx8t+/vrrf3CU+b703/AHef3p/hp7vJ01fybb/zwnv6hj5b9/fXW/uEp833pv8Au8/vT/DT3eTpq/k23/nhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/88J7+oY+W/f311v7hKfN96b/u8/vT/DT3eTpq/k23/nhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/8APCe/qGPlv399db+4Snzfem/7vP70/wANPd5Omr+Tbf8AnhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/wDPCe/qGPlv399db+4Snzfem/7vP70/w093k6av5Nt/54T39Qx8t+/vrrf3CU+b703/AHef3p/hp7vJ01fybb/zwnv6hj5b9/fXW/uEp833pv8Au8/vT/DT3eTpq/k23/nhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/88J7+oY+W/f311v7hKfN96b/u8/vT/DT3eTpq/k23/nhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/8APCe/qGPlv399db+4Snzfem/7vP70/wANPd5Omr+Tbf8AnhPf1DHy37++ut/cJT5vvTf93n96f4ae7ydNX8m2/wDPCe/qGPlv399db+4Snzfem/7vP70/w093k6av5Nt/54T39Qx8t+/vrrf3CU+b703/AHef3p/hrKdxp45VjxNpaG0FTiJ5b66ggXsMeSSB9cJK7E6kEhdZQ5eqenQw1cs8bs8niB4xb8svYQB7BDrWtda9ruobk1WXWdUKtfTceRVQo9FVQYUdh6Kj7z3raO3NvabtbR4tD0hWTT4S5UMckc3aRu/btyY4AAAHYdhU7ZZ6vlMUr//X3+MUpilMUrX8+kU8nwVBw0a6FZXLSSX8ppUGKLwFmeWemqWFbRSiyluzAmaMIIdDfZbKPew+Ewl2N13+Hbe7Ohe3Tqu621iZc2mnR8x2yDNJlIh+A5uPYUWtA/CH3X+gtmro1u/G/wBSk49jhhFEVaQr2OTzMSlT2ZGcervZh07eg1x15BcQahvTku4XS12TbjSrnqVkhc3JiDQzQJ9XnnV2nMazo+5mGuLjEApXE8/Y9eIa3w+HWga3vLN9dZ9d0XdF1o+gC1awtWEZaSMszSKP1ncOOyvlAP8Aq59fbCunXQTbWtbQtNZ3CbpdQulMgEbx8BGTiMjlExIdAJB38nA9WTez7t309Pxzkt84Un/+OzEPl53x+zYe5b8ys3+bj0+/av8A3kX5FYHOsZ024t04Jlx9nHG17n5cDnWnYKF8mkj1JZBELwrlzb5dHVqZ6TtjT6VC5s+wKkpGwCEE9nUC0LsPQdbn6Wb+ud+2l9Y6+sHxyLHoopVXgkBVgVLNniwIY5HZ1H21obrF03tOmt/p+r7be5+IyA5ZihaOWNhkhwiBS6uoQcScq5z2AG59wv5Gs/LbixR/IZn8ooVlQNpdH9vJ1oIWSaoNGMs8j/g0MwQPYMybFyTXi332EnQu2u/bOUN2aFLtncd5ocucW8xCk+bRn0o2/wDajKn7zXZ2zdxQ7r2vZa/CVJuIQX491Eq5SVQfWFkVgD6wAfXWp/1ndd+tVxq1rXffp+G3w18d/wCvl9zpTpR/NJqH33v+Atco9ZP57tK/7Fp/jNW69nJVdq1pY/SN/wCsE4k/7HYB/wCYl5zrHoT/AMiNS/1uT/Z0rjD4RH84Gl/6hH/jXFbp2cnV2fWCr6RT/VvPP+3KkP8AisWbi6Gf8vE/1Sb/AMIrR/wg/wCbmX/WY/8AwvUodBf+q447/wDzG4P+c09yg60fzjX/AP2YP8COqr4P/wDNTpv/AGrj/aZawY81jyGj6SRTS90OKQIh3Hw0MCrUj0Sn8C2KNTIkEI0fhAHSh27Jw73vt5m9azb+0gZeg11HGOTi0vuw8+zux/s71pXerLB8IqzlmIWNr6wAJ9fo2w/vrdTzk2u0K1P/AKUFZUaHHeJtMJ3FKommpLYVtOjQWPQljXEEUa3CmpzWl/5xCd9fnlQUl3v/AEwm9R2/0Qu3SnweNPuPjOpasVItOEcIPqZyxdgPaVUKT7Oa+2uUPhRararp2naLkG8ZpJSAe6r6KqWHnhyJAp8so32Zzw9NH+r34W/7tFP/APBLRmmuoH/LjVv+8J/8Rq3r0w/m60T/ALst/wDDWtYCuP8ArNj7/vF2b/5X1+dD3n/N8H+pQ/7Utcxwf85yH/XLj/Z563Xs5JrtatQ7r/VLKONXLfil1H6oRemdDZPEWGVKSSxhTDtGnVu5bX5rqoF3J0Ge14Q6MRuhfZGmagA3rfi+PTvRTUrfcG2tS2HqRzH4bsnrPgzjhJxHq8OQq+fPlJn1duR+vul3O2N06Z1H0tcP4qLJ34qZoSGiLkDk5dFUce44QNkdzmn+JC1B1UeuZMeVaUlxcqE44MEZnEF07olSHyyIsylxWm2xSiO80Tc7LbEdJBKRECFrWjW3fbfbw95+50k6cdIIttvxXWr92jk4nOebF5jnyKiMJDn2MKkbQmh6rdaZd2Rc32/p6rJFzQDBjCrCvf0lYy4uAD61lGcdjuI5y3XX9aNXKVVZ3Vt6xzhw5mlkOkQpeA2xYlZRGPJTPVMcTiNKsLo6WLL2eNKgjZXa07BXx5UWncV6dQJEScmBrW06TZY+wNuxaf0z6WDddrbpNq09tFK7Ed3edlESM3mIo+a5VSM4Yj0mJriHc15qfVfrB/Iue6kt9Gt7uaJVU/QFusnisoyMvKsbkNgnk4V+UaIF2Oqx6JHTKrBsbkRXGGMT5wQFAAZIrXdpHYbw4mA122etJfnU5hAMfbvsCZCnJ1/2Qa1rWtaH1Hq31A1GQu2oSQofJYVWMD7iq8vxLE/bXRuldGOnGkxhItOSVvW0rO/I+0qWEf4KgH2Vro/SPI9SdbW3xtpml4pX8BTQWk7EfpDB66jUfi7YxFzaVR4mOKnNujqJEnLXvRcTXGF6OD5oiytm/cb4hb26Dz6vqGm6hq2rSzztNcxqskrs5bgjFgCxJwOYHbtnt6sDnH4RtvoWl6lpei6LDbW4hhLNFDGkYUO+BkIoGTxyQe+CpP0gTutV9/7gwj/9IRr/APpkWcl33/rs3+lf/wARrtPTv+L4P9Cn/hFVflLVZTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpX//0N/jFKYpTFK1F+prwP539QnqRR8R1GSdh4oRdfX1KMtmLpNX5Dcgq7bqRI7lsYpjLlw5EM19WOK1MjB6PSw8pAi7gDrtoPTXT7eezdkbCkAu433JKsk7RBJCTLx4wxcuHHAAXPfAZnP2nk7qVsTfW/uo0L/FJY9rQtFEs3iIAsYb9ZLw5E8wzSOvb04winDeiNtRjZGmNMrPHGFAmamJga29kZWtGDykja0tSQpC3IEpXx0WmRo04CwB/sCHWs5pmmluJmnmYtM7FmJ8yxOST9pJzXVkEENrAltbqEt40Cqo8lVRhQPsAAArtMl1NrGh1cOIz5zN4PWdWcGZQP1tRZSyWnTrbtYibxr59B1Q1BbGUucTkyFMZLIyscmgIzjiSQiX6EMYQ63vM/6Zbni2pu631C7fhpsgaGc9ziNx9IgAnCOEc4BOF7CtbdWNoPvTZdxpdsgfUoys0HYE+ImQQuSByaNpEXJADMCT2qyroMU5zQ4w19dPH/lBRsnrSDalSG06hfnZ/g74h9oSpPpssWIdoxKXxahGFyaEbsnCMoJAxrle9C0LXYWW9ZtV2nuG/tdb27eR3F34ZimUK6nCnlG/pIoPZmVjnOAnq8sL6D6NvTbOlXWg7qs5Le1EglhZnR+5AWRfRY8VwIyg9okJwSOUG9bLpg8rORHIWr+WXElmSTSQRyER2KSeLI5ayQ6bx2SV7L3SYQOfxBZJ1TaxunknPIijk+1RShOejIMAA8Bhmi7x0k6h7b0PRLjbO52MVvJMzq5RnRlkRUeNwgLD6OQcEEMQSMDNh619MN1bh1633ftAGW/hgSMxh0jdWjd2Eis7KDkOB2bIKdgeWVuk6W0r6xz3dE7beorHz2un0dSgMgy5VHaPalKuyS5WxEBCoW1e4KHhQeZFxLBjCeUBJsWvF8DNB1vHOott0sh0uKTYrhtTNz6YDXBxFwfPaYccc+OMd/vHllXS266vz6nLH1EjZNOFs3AlbYZlDw8e8ADd1MuQcjt6iBys263/AAS5e8n+Z3HCyKAo98suCwysYaySiRNsjg7OmaHZuut1k65Cclk0nZXA8xMxHFqNiKJML2EfbQtj1sOsq6Rby2xt7al9p+tXaQXkty7IpWQkqYUUHKow7sCO5z2+6sP61bE3XufeNhqeh2b3FjDZojMGQYYSTsRhmU+TJ6sekO/Y42ljTySA+M84okH/AOc0wBYfh9/2h71r4ZzpXUiRyStxjUs3sAJP9lYfOtfTdj8oeETrUtBMjXYtjnWtVckKiyeZwiOKRMcckAlz24bXzCRR9pCW3pftiDs/Rgtf5oRdt9tmdJdc0nb+711HWZlgshbyrzIYjkwGBhQx7/dWtOtOyt3bj2LJY6Hpt7c3bToQscMjE4Vx6l9ZIH3mqm6SMUdeL3AWmKZv9ZEq0tCJr7JHIok6WDAnVS1gf7Ol8gZtmuMckjwzHbXsrmnUB0UoHsITNBFoI9bDql6o6vpuvb2u9U0iUT6fIsPFwGAPGFFbswB7MCO49Xsq8dEumvUHR+nFhpmoaJqkd6jTkr8VmJwbiVgeyHsQQfxrHH1senet5cTWFcn+Kc+rF/uOORlDB53WxloRGJPM1ZGB2VvkJlsEkrg9IGpFPIcucVJXkq1SQCtKMkRKgo9KAB+b9I+pOm7atpdu7jymlSyF45eJdUZgFdJFAJ8NwAQQDhuWQQ2Vwrrf8HPqTueaPdm2tH1U6vbQ8ZI/i06l1TkyvHlAC/fiwPdlVAuSCr2lwnnr9IHZGFvqYmnGaUyNCmIZElhT2BV6OWaAnKLSp1r1Jy7aj1bui4AAaEavUJ/CcLuYb4xbFveV3e1ehE0zaidRjjiJ5GKO59H2kBODSgexVIx5ADsK19ZX3wr4YF047W1uTC8fHk0a/BJ8gfFNuIT6vSdWJPdmJyaiXkD0n+a1rUor5AWRK2/k/wA/rdt2PlzKLMt0VVtpqaj2uHyoIm5Y4u8iicRcZAfKvZqcpIyb20tCH+SkLNENQpFc9vdVdkWGsfoPTTHp+zLa2bg7RycppzIncABnChOZy+HdjlsYANn358HbrDNt1Nya/p2r3297q6QOohkKQwCOQt2CBOTMIx6DNGirhMBgqbY3BGPudV8NuL1WT/bVHrAr+jK1iExjW5DH3ZQxyRiizc3uzWatY3Nya1ZiNYnGDZic84kWw9wjFr45zbvK+tdS3XqOoWLiSzmvJXRgCAys5IOCARkH1gGuoNibZ3Bo2x9J0/U7K6hu4NPgR1eJ1Kssagg5HqNYIYNwJ5gtnXkdeWa6kHYjjkruudStNaepVAD2w6PPFArIm2uYWRPKzZVotVITQptA2h0aEYvEIOga2LW6brem136MDbSXaHXfisaeFxkzyW4VyOXHh2UE/S9Vc7Q7D3YvXpN1PZyroKXMzGU8QMNFMg7Z5dyy98ev7DjakznGup6wffSEJzWcX6c0wjU6bUzxKbIsOuYxUKYakBCxpsJufQS0UwTb77O0misSjzmcp8IdgNKH6YewhUd8290Qs9Qud9xT2bFbeCCV5jjIMZXhw9mWdkx6xjkM8a0l8IC/02z6dTw36h555o0hGSCJAeRbIBKjw1dM4xlwhI5Zrrfo+3GIVHcGkFsPrdtHOeVMiNtlbtQQaQuT14jJFH6mbDgGBD/IOjac16K7d9d3wfx/s1M627i/TO8G06Fs2enJ4Ix5GQ+lMfvDYjP+jqT8H/a38n9jpqM64vtSfxTnGREuViXI7Mp9OVD39GUfcM6eadredagvUq6UPM+s+ZD/AM6OBCN7mI5bN/4vDbYI8MzfbVT2upTATStW1sclUJGieweanmHKDExQzztaWrEalGal2AwfT+wOpW1L/aybO3qVjSOHwcyBjDNEPoAsuTG6DAycDKq6vyOF5H6ldJ94WG7m3zsDk08kxmIjIEkUjZZ24nvIrOScKG5B/DeMKhaTy0cwfpJdlok9ex/jApiD8tBpuHYr3QbHAVBBhuvJ24qHqxp5/D5vGX32PZwG84oG/iErfwDkJdr9BdPb49PqAlhHfwluGkB+zjEnin//AC/GvUO7fhFaoh0+304wTEcRK1t4TAnty5TgQdvP6KirUeZfRH5zxio4tfz6vmPLzkpakukK3ky0QhxHLX+JIHFqbiYObHDnUptfrBUNo056V3UpCSU6HQkpTegCiIGcLJdp9Xtnz6jJocSRaZoFvEotWcBFcgt4nLGVjzkFATlvTZ25kKMS3v0O3rFYx7keWXVdxTyu10q8pCnZfCCDBeTycORkLiONQygynZt6Ulj83bL46O7pzprQ2rbAY5wOKQNlWQ0MFdnWt2KIxQhvkT0wbfXtQS5Ob+Nw0YMYUWheX/LTgL0HYufepFjtGw11Y9nz/GLJ4ucjB/EAlZ3yqtgDAXjjz8+5z5dM9Lb/AHnqG3Wk3tb/ABe/SUJGvAxs0SxR+kyHBDF+YPYDt6PbFZOs19WyqYpTFKYpTFKxJ1r1FpdNuopMuNK+GxZJxmWvlkURTVuJNun1rlvK7j9EYfYV7QJ3Cc5jaCY60xiVq07eYWkLNNcY24F6MN2EYCdk3+xrez2RFr6yuddCQ3E0JxxS0uXkjgkXtkszIpYcjhZFJA7FtW6d1Clvt9ybc8AfoQzXNtFOAxLXVrHBJNG3fChfElXLKoJRODOWcJUl29RVbS/PGG8WFdP2rLII7UbIZ8+P0Ao607AmSqZ6lsFaoyOGhi5Cpsfa0bGV/X6krqSkUFsrmBInPOKEdsOSNJ2Ouq7Pk3Cl1bR3S3axqslxDEgTi5bnzwVlLKPDUsCyZYKQM1U6z1AGjbxTbclpey25tTIWhtJpmLZHdWQ48NVOGYIw55UspXBjKKdSndeXxztri4U9p28fTnINjYayrXjzQUvtWdQOkz6RrSUucxnKauWBeJNFdzZ7dAFOLqoCrUnAMTpizQkb0GuuNhte6PpOoaabe2S5s2aSW5uEhjknE0iiOPxGGX4Kp4ouACC2CwzSQ9Q7ey1vU9L1AXV1cW92ESK3t3meOIqrGSQxoFSIclBeRz3DEHAIS+Bo5w8aZLGOMU1iVgal8R5gTAcEomRRxjfHBvkUlJjUqlSxuedbQEq4ge2N8KciVhboUlNRr0w0p4C1Gtl6xKXaeu29xf2lzD4VzpsfiTqzKCq8lUFe5Dg81KlSQykMCQQTmFvu3Qby0sr60m8W01CThCyg+k2SCpBwVKsCrKQGUhuQHFsShIr6riLXhWnHh4cXImz7bh1hTuFNpLK5KWtZHavOjCeXqFr4SQNsbFCQ2XodEknmAMUeMXl634BdrfBpF9caVPrMSqbC2kjRzkAhpeXDC+ZzxOSPKrjPq9lb6pBo8rEX1wjsgx2IQZbJ9WB+HkPMjNg3T254italOH8f5FS4xfyN5QtXJl7iDmhhA49EpmVQltyxke2RCqZUv1aaZKxwMlCq0hGMs9YkTKFIND2WdvWa752cNM1nVJNCixoWntahwX5NH8YhjZWPI8irSFhnyBIHsrXvTjfDaztrSDuKdW3FqXxvhhFQSm3nmDBFXAykUalsDAGOR5MOV6cl5WUdDrWntPyiYFsUjqqjCuRloPToiVooHXVVqn14YW93mc7UFlxlgcXQ+NualOgPUBWGIG5Qq8vRINDFiUG3dWutOh1O3j5wXF38WiUEGSSXiGISP6TKOSgsBxDMFznsM3uNyaVaanLpdwzLLBZm5kcq3hRxhuOHkxxEh+kIyeZQcgMdzZyb1juGTdEHGx5Tu+oDWRrKfIK8suxOONwwaC3i2ECJF/6k3+SxVvTzt0VIzwq0jcDRDkvR+M9KQcUWaIGUjpfumS5FlbfE578NxliiuYZJLc//AK6q5MYz6JbuobAJBIziT9WNow2xvrs3dvp5UNFNLbyxxXAIz+okZQshC+kwyCqhiQOLYymEHFqSCVBW97KPKLOL3vWw72WaDQwb2HfbYd7CLXw/szXhBUlT5g1spWDKGHkRmsUHMXqGzXjlynqCq4nCInIqRjRNYyTm7ZT4sVluNKwjkZaWqIoFyYNJHVIlAsW2OnWLXkCpMsEUxJfOAAsIvNzY22Nk2uubeudQuJpE1aQypYxKM+O9tD484I4kkeHxVCGUcyQScYrWm6t83egbht7CGBW0WNY3vp24hYEnmWCL0zKgUqeTuvCRmUoFC5JN8HIjk5VfGKPRt5sZRJnJ5nclKhVa11XkSfbCtGzpiagWu31bgUDi6Nc+Pq5K0NqhYqN0AtIhSEjOUnFF68W8S0TQNQ1+d4bLw1jiTnLLK6xRRJkDlJI5CqMkADuSfIH1Zjruv2G37YXF4JZJHPGOKFGlmlYDPGONASx/qGSATllBiOI9RLirJ6Yt+8XacO9aR3j076jd9xO1YdKINalPypQU2Hs8VmlYuTYKXlP8qJe0O2MhEmWe3RLSQN4lJg9A1crjZO4YdVttHhiS4uLwcoHhdJIplGeTJKDw4pglyxXgBl+K4JtsW99vnRZtdu5JLW1tgDMk8bxzRFjxVWiI5Fnf0FChuUgaMZdWVeHV3PCnL6ebFqVj/jBRF2xqsHKzU0DvulpXWFimVycNSyo7gh8LnLclKnMSapAEJB+iBGiTrNATrCiBHFhH71HZ+p6MkGoTfFbzSpLgReJbzpLH4nZjC8kZPhuV79/UcqTjtI03eem678ZsbcXljqcVu0nG5t3ikEZyFmSOQemnIHH7RUjHY4iWqOdNZ1bxN4kyGeXJavMSyr7gI3atHWuuOj0hvDkSlZ0YXmQzhDx+gyBQKEtUdY1qcbocqElQItCK0af555YDLhfbRv8AUtw6hDZ21vpljaSgSiW5XwLct2VDcSEc2dgeIALE5AXAOKOLeGn6PodnNez3OpXt14nhCC2ZppwrEsVgj5kLEpALFiCq8yxJJNGcluq7Aodw3U8nONzK+WY8J7qi9HvcVk1Y2MmUVVPU1hxiPWhBb2jaYljlFUTePR9yVEtyV00Rpe/HtqYnSgC9Ps2t2/05vLzdI2/rbxwRG1edXWaLEsfhu0Ulu55JMjMAWK54oHJ4lTi17o6m2embQfcmixzTzLcLAUaCUmKXxEV47hAUaJgrejyPdmTiHDAG6OW896NgVVQW0Jsz3RFV9pyx2gtW0s90jZKPkbY8vZjHH1bHD6J2wisR0HpC1mrdqdoy0JLfsCk44okwAxY9b7O1a71KXTrV7SRLeNXlnWeI2saNjDPccvDHc4xyLZBABIOMll3rpMGkx6rcRXsbTlhHbtbyrdyFDghLYr4p7kYJUDLIM5dQajoDmrRfIjVht0cXy6vpxUCZAvtuqrxhEjpu0K2aHZIscGeQyqIzpE1KSYo8IEB5yZ3TDUtZoSTA6UeMowAKfWdq6vohhaYRT2tySIZbeRZ4pSCAVR4ycsCcFDhvsxjNTou7dI1uGaSPxraa3XM0VzG0EsQxyy6yAYHHDE5IUEcsZGbFLz6v9EKeO99TOjni02BWmqG3D+O3JCa0BYrRxmsi349C5EthbHBrXlkXT19KFjvJGwJbYBYanbX04GiEhygRpYDMv0bpnq51qyttUW2kRrmH4zbJcRNdRws6B2khR/EVQjZYrlkHpEKASMM3F1S0e00a/msfjcM0drP8XuJLaVbaS4SNykaSvG0fiF04hJFGXwmCzKrZPePErkM8oCjZzLlRS6VzOnqylcnWkoiW0lZIZFCmR3elRLcn0EhAUoclhowkg1oBWt+HXw1rMC122gstbvLO1BFtFdSogJzhVkZVGT3OAB39dZ/tu8udQ29YX94Q13PZQSOQAuXeJWY4HYZYnsOw8qhHgfyJm3J+j3uyp+1Rhmfm29uRdYkI4kQ6JmobBUd1zauI2sNLd3J0V7dlzHGyDVotG6KGqGMRYCwbCANz3dotroGqrY2bSNC1pby5cgnlLCkjDsFGAWOO2QPMk9zQ7R1u51/SWvrsIsouJY8KCBiNyo7FmOe3nnv54GcCHuI/LWC7jNGV/PuTUo5GTzkhaHLFjqaznyjBU8jeF9DTuT/WuqnBoZEfsNhdoCytapK1HLRknSRAznrCPH22HVz3Htu7+MXl5Z2EdjZ2MFq00Qn8YqLhF4ShmPJg5ILBc+GWAPtq17c3JZi3sbK8v3vrzUJLgQy+B4QYwd5FZV5CMjBI5FQSeICnilSFy35S17CmLkDSTfdj/SNyw3h7Y/J1wtBhqxRaZdK1rH1C6OJrIUx9Wm3HJLIdPaJWNpjppvrHf2co8svwF7FlDt3b97dSWerPapdaXLqUdqIjKIjNKwDeHyHpKvEjlJjivIfdVw17cFlbm60ZLprbVI9Pa6Mnhl1jiDFefcqrHII4BgwGCeOVJp5/6glD0YTT1UWHMrOtm65zx4h1uxBtgNGzN/nd6tan0rCreonAYOyOBSaVPLkQc5LGUrygM6MQzThEpi/Hqrh2TrOrtdajYxW9tpMN9JC5kuI1jtyPS4vJIwJRQQgkOebYAyxxVol3/omiJZ6XqEt3eaxNp0U6eFays9yGGMpHEpUSyFHkMIIKKGPZVJEu0vza47XhVlj24wzFXC4/Sq1+a7zZbeYXeqJpSDrGGguQPiC14lNkrS7Q4SJgNAu0eeD0h6QXmkmmA1verTqm1da0rUINNljEs10FMDQssqThjxUxOhIfLdsDuD5gZGcg03dWjanps2qI7QwW4JmWZTE8PEEt4iN3GMEHGRyVlzyVgLXzesdwxboe5WRKBXzA6vGxqpFXtn2HxxuGDwK8WxL5Zmw0nIZJFW5POnVYiNCqRtwNEOLgk0I5KQcWWYIGRL0v3TJcrZW3xObUA/GSKK5hkkgPl+vRWJjGfRLd1DYBIJGcXfqxtGG3N7dm7t9OKgxTTW8scNwCOX6iR1CuQvpMMgqASQOLYymJlBatOQqJ3vZKkkpQVsQdhFss4ATC97CLsIO9hFr4b+Os14ylWKnzBxWyVYOodfokZ/rrAvXnNvqRyfhs/wDUD9i8MZLTsMbbusCS0eRH7hg9nLqzoeeT6PS9OxWqtsGXQ1LNlMdr5UsRbVMAkBygYCTPKCLZodyajtLYlpuhdl8tVTVpGgjSfnA8IluI43TlF4SPwDSBWxICMEjPlWjdE3n1C1Xav8u8aOdDRbh3g8K5Wfw7aSWOTjKJZFLExMy/qmJUgcC3asrtB8rKg5Huc8j9dObtuUVi31S6ziOPrIvZnFobLqrZltWunVONUVpG8M7/ABd57Fq0hpxGliNUn2LRqcwOtb6ztzVNCSKa+Vfi87TLG6kEMYJTFKPaCrjuCB2Kn11tTQ9z6RuFpItPkzcwxQSSIezItzH4sJYd8c0yQPPAzjBBNh3I7qwRCvVVGnUjCZxbEemfNGRcXbHkDfUFmyJrEkrTUkZrTRVMvjickmY2QlmbeQjYkZIVhT2UjdTEpZ4UJowZjoHTe51BbwarNBbTRaULuJTPEpzJxMRmDZ4RcSTITxMZaMMRzAOCbo6pW+jtZfoy2uriObV/ikjC2mdSqAmTwChHOQ5Bg4hxLh+KkKSt+lk3iuaOJtlci4ZHHhsdI9Qk9tyLxW04rIIe8pnOOwR4lTOzTuHuWmiTsJ3rEBZS5Eb6dWUHYgdwD7b1h2n6Qk25bfQrqRWjkvY4XeF1dSGkVGaNxyRuxJVhlT9orN9V1yS22ld7js42WaKwmuESdGRgyRM6rKh4uvcAMvZseyo1Q8o5A39PmJ8wZHE1LzL3Xi1A7tdojXsVk0rIFLJdXLFJlCBnjLUcvk6iLt748eI/fnDOSNZRhxputFDM1cJNuwPveXa8EoS1XUZLcPI6IeCSsmWY4TmVXt2AZyAB3Aq2RbpuV6ewbwuIud7JpUNyY4kdx4kkKPgICX8MO3pHkSsYLM2ATUMceOpvV8x4XsvK7kUik9EoGKvqqd7JeZNV1jRSASKcWIxoDgNXHpQ9oXN2uphcpKp2hZjGIToe4bNT6BoQzg6y5a3sHULTdDbd0Zort3mlWJUmikkVI287jiVELBe7eIEAw3sqj0DqFpmo7YG4tUS4tIkhjZ2lt5YVdnBP6hW5mVfRJ9BnwuGLce9QpcnVATSWVcQ4HSZNq0tYlmczqGhU+rbkbQMrq6bznjbNtS5DK5JA2iy2VvC7sZzynbSD3RnOPXsxgwaVFp9Hl+ZedJ6fGG21O91Y211Y2+k3EkcttcJKkd1HwKJIYmPFuJchHAVwDxyVOMa1/qYZLvSNP0QXVpqNzrdrFNFdWzRPJZyGRZXjEq4ZCwRfEjbKFkJwGHLNVmp63RTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpX/9Hf4xSmKUxSvAhBCHYhb0EIdbEIQt60EIda773ve/hrWtYqIBJwO5NWvWjzZ4j0uZtPZvIqpYuv0MRfsc2YtTm/+YH7y9R9lOcnvY+/3B9P33v7sAE+Vbo2V8HLrx1EXxdm7S129tcZ8UWkscGPb48wjhx9vOrR3zq+8dDDj0NU15yLvJwCLYEgq9pqT+x1ovjoIinh+KadeUYLXwEEkff+7++OO2a3xpvwB+raRrc741baW2rXGW+PatbeKn3xQGXuPWCwqhnLqEc3ZaWAVQ9NC2iyTtdyHKzng1hJMCLt4Ddo/YzUWAPh333r1m+/9/8AdHA9tZLZ/BT+DfoTkb+6x6EZF849OiExHtHPxZD+PhD7vbTy6zetpOy9HRyh6IqggztoIXh1Y3BWTrfb4j9oT98MEPWvv36TWv8ADX3ZHEftNXa22b/k49sN4er7n3Prko+qimRT93CxhGP/AHuftrqTKR61c81r6w8lKprsBnwECPGsqfyQ9vv17EqVYfveu/x/pG9/4/24JQeVVydSP8nTtj/inZ+uasw+vEzZ99qaL/8AJj7PVUPWtxf5i1izInvkr1YY5VkdeV2mtCqkM6mMcROTiIPjGhbfG/wYpeeWVvxiCUX4gF/aF4Q/HQMPUAaz/Y/Wj4P28tQk03o90Mu9b1W3i8R1gsrS4eNAcB5MQXhRSewLNgnsMnsa3ZOkbYVgtLbI3XqE2JLWZ8Qp3JteYybK5AzO6BYWE9KvbXNXbq9AuQqiTNDLOL0MAw71vW963jmPYKxvUfh47U2pfTaRY9KNJsNQtpWjkiuBbQSxOhwySRrpaOjqRhlPEqRggEV3JPQ2iSjetv3Ku5njf/xP+iY+Hx6/u7uh70PX/wB95HxPsFW+T/KVa7EMaXsfb1uPV+tn7e7WEf2V23/oPuMzd6Tcnui2VO1qxO3pNrFddNfrXFV4tJ0STZ8POGcsU+DeiygbEMXbfbW/jkDJ9gqh/wDxJesl34g0bbuhJ4cZkbgt/JwjX6Tti6ACLkcmIAHrNVin6GnDYGv6Y9XMuF8O+xSuKJQ77ff3ClghQtd9fD/O+GeeRrH5f8pV8IMn/g9tt6If6tcsf/mvT/dXYg6HnB4OteYnto/eta+I58QXve9ffvek0eT6+Ov8O2R5fdVI3+Ul+EkfotoS/dZMf/FO1dmDomcGAh2AbHZhxfw8JZljuegA7fHuEJaUvXff+PfIZ75wM1Sv/lH/AITTAAXejqB7LCP/AM2NQdOOnv0f6olSeDWVabLCJks2n2VGZfyNTR97KCpAEaYxS3rHREoQlKSzNCLGoCAIw77h32yJJNbH238Kv4fW+NDbcuz9EuNS29HyzcWugNPCeJIYLIkbq5UghghJB7EZqd0PRt4IOKBI4MjfY5revTkLEDkzXBJjUitGoL0anUolSZWalPSqCjNCAMG9hEHfcO+2/jDJFaxuf8oN8Ju0upLXUZdIW6idkeOXSrcMjqcMrqyhlZSMEHBBGCK7MHRw4gEB1pE4X6271vW9Dbr3naMWu39mvKWaDrW+/wDZrvkeR+yqNv8AKB9fJTm4i2tMPZJotk4/tSrDeol0x71rOoojLOnJKOSkosptsVtDN4gu5Fv6xWqr5SyvZRq2OpJhJWVoNVNkk0gEeVpR6gaUY/AAWgi7bB6cNsdtWnh30q/o+S2KxsfEAWTkvri9IEry4t5D7yK0D1++GR8KDdm27FOn8G07HVrTUVnla22/o4luEVHAhn+NW00cttyP6yAIGdjG3IKjZxjVR0n+qHzhtaCNHN42ya/oeGuJyiQPdrWS0Sp/RMa4KcMhYqliCGRy0RErlqVIWlMdVoSEaMjXmD2p2UWlM3S29+mPTzRbiPYvG41ecdsCVsuM8GlklA/Vx5JEadyfUORccF7zXr18I/e9luHrSunWem2PFVjsLGw0qARcleZI7bTo4uU0xRQ08odsFfT4xLGdn9i4LSuGtjYxwXm/y+jTExN6FpYmMyQVM/tTO0NaYpE2NSFI91KrCUgQIk4Ciy+/YIAa1nLE08txM9xcMXnkcszHuWZiSST7STk19KYOv2zI7KLT5elvToWcEKRIsFtqdsFRFCKB4OqLjCgCq0T8euS7YHRbVzts1UAO9b0GV05QcgELtrtrRhyGCx5TvX9/hGHe8l9qoJeq/R29blfdMtGRv/5bVdbg/qD3s6/1qaqtqrflY1b0JRyfhUlCHXwKf+OyFNs3ff8A+IfG7OY9B76/tCXr/u/uhVjvt39D74Yi2ZqNmT64Nedsfctxp039rVU5ablEmGHRrxQjyVr/ADhhjlhRs0f/ANO5RKQF73/3i1/hirK83RaZSUt90W7+w3FjcAfj8Wtif7KrVA4WwQVr2zF4KuN3v47YZc9J9a1rXx35LtEwh34t/drzfh/+6scurXY0sn/o+91KKP8A/WtYW/tiuv8A/mqrbnB5UCCFxYBN3fe9CGBzRLiwa/sFvy/JM3re/wC4OKsd3a6fECbS6E32GN0J/ryP7a73FW2mKUxSmKVAXKe7i+N/HO57z2xPEqWVpX8gkbHFI+zuj+9SuUlIxJojFm1pZUytyVKpJJ1KREHyy96L8/xj2EARCDeNvaUdc1u10nksaTzKrMSAETzdskgeigZsevGB3IBsu4tV/QmiXOqKA0sURKKc4aRvRjViAeKtIyhm8lBLHABI1+JTxQ6kNE8FajWrYLxdkz9w4nTXzoNcYVK7qd+SE3tRkkEgte8ke2xRESYlIZfazTMpSxrkOlhyVQS5eQl1vYE2g7pg3HsPVt2XKpNqKR6nCbDDx24tUiZVihI9PmixlInVuIYEZbzbOipNtdSdM2taePDpbR6bOt8D8ZuzdGRWaVxK3hCOXAdlkQko6oFUdkxepeV6weuOoDwx5gTYifsvHKy+FNpV/HLGR1dZMob0k8tGw6SnUIiEvaYfGH9+hTtIY0iOUFe00qYrRiQ0sYwjJHoOKaTo17fbO1TbFp4L65b6rHI8ZmiQlIo5o3dC7qsgVu3oE+YPrGcy1XXtPsN36Zuy8M6aDc6SypIIZn9KR1kVXVEZozwIOHAOc9vRcrN/A1jWtvKDqsOa5gcWvb5zDhh6B1cGRc2hkDSk4yUsQnPbHJYkILe2pGtEpLAYnGcQUfs0PfQ/HrLPu+ZJNA2/GjhuGmuCAwPFjcSk5APYkY88EgD2VkW07eSLXdcmkTj4l6pU47lQmB388A8iAfbyAwwJxZRlkltYUvTfIBVWdiOda8WetLzFs+1mOJQSSOcsidNTGYX/AAXdkx6BomwT9IYVGXado3JdppSqTNtYzlScs0BY962FNLa6hqlzo6Twrfahte0iiZ3UK86LC/htITxWRwjKvMgcgAT3GdbRRXmm6Zb6tNBM9lY7lmeQIuTFbt2EgXz8OMEZCAlScFRhyt5rNyKgvKnqlcMrApJmsiTVFFuM/L1p3c7lWM+iNbSGTvTzSuzovGXmYR1iOdHFgIZfGtO0UFHoxUUSSaccBQAjGJtCvdubA1Sy1doI9TkvbQ+AJY3lVVEuHdUZgobl6IzywpJAGCcjtdx6duvf2mahoi3MmlxWtyvjtBLHE7MvpKjSKhYx8RzIXhl1UNyBAtqqSp5mLox8Xbxi8cemq7uENt2Fy1hLM9Ny2Kv7gz13yIuMy24KuSvaVudUqCyqFe5AgCnM0UBWapSj+IdAFmRavqNo3VfUNInkRtJ1a3is3ZcSKGktYBDIuCVJjnCHl34jlWH7dsL626KabrUMciarpE096qEmIskV5cPLHJleXB4SWMeBzZUU4HlU7vx4tLmD01+bPJCKRBS/3T1CJlD+RsJrZ/CQwvEm4zU3LIUu45ce3kYlR7emUTqi4IM00HmBTCd5iqCaPZYzBbpItc07bO+tJ0O4k46TosL2zyL6SrdTxuLm4XIBAS4kA7gkJCMDIFXabbuqbo2JrGuQoF1zW7iO4QEYf4rbTIbWJjC7CRvARmjaNh4hkUZFdT1J+edH8uenleVQUZVl5T62XCJxF0llXO3H2z4vIeNwYxOYo6u79Z/1hire0sMigylvESgb2lS5ODm5BLChLOSecqKnbD2fq22t62eq6xcWkGmCRwkwuInW65RuAsQVizK+eRZ1QKueRD8VNJ1G3ppG6ti3ug6FbXVxrJWISQeBInxXEiMfGdgsagY8P0HcFmAP6vkw2MUBpaZlRHqBeSUna05p4h6EHyiykgBmiGHt4teAId99du+u2aNcFpSF7ksf766BjISBWbsAgz/VWuBX9C8z+aVSc3LSY684yIax6lsomhCZRyIcr3hd5Rei4M2KqV4/ECiTBCFbKxjj0fjO5izaGMpVte/DOP3oQtaBvS71naW19Q0nT559RN9oUSHFsLd7d55SJ7nDtIGPNm8F/UFTiPI557ttD3zuey1fU7G20ZbTXZnHK7+MpcLDAWhtOUSxNETCF8SNskOSGyUK4reX2u0Wvw24I3byiiPKqsLao2yZNV1qcnqQbVKexeIt1wOOSunLAsidRZXGJOolVL3O7MZiFxMLYXpmGgfUpqjQCRaOBQ21hJp26dX0rbz6fc6ZeRLLFazn9VdwSMs0ccbc04zQBsp6aPyQlc4NXue8S+2hpWq7oGoWOqWIKS3cODPayoFR2cLHMpS4UB5Rx4hcwsRKwibqWCbvfIHit1DDLZrCzOb9ExuU0k4VfyJpGmyuNHJjkshjBkekUgk0TZyEkJ+uc04iSBqTqmN/a0iNI/ibhJG9KcYUIs+fc2cWi7h0UadPBpOruk4ltZ5jdWtoWyqqzEycEvFLB42YtFyDMw7EUOm302vbd1xtQhn1fRkMBivYYVtLm+493wgSME2fFVVyvhzLywDGxUSBxhvOS2ZyCksTq64JTzo4+tPF2z1TnyFtjjoCt7c47y0amOExWo928krur0doqbYQiVqnNk0xlPLaexEqFZu9D0Vqi3DpEOn6THPqNpHo+stfxYt4bnxYblPS5TeCZZTEIjgLJ4hRg5Cj11WbY1htUv500u/l1vSEspQZ57Twp7c8RxiM4hh8Qt/SjaMOSc5/VuDbbXhFdVrws6RVjW7rlNxoksT44PUNauZlNsIlKWhV74xxZYoqbkPWr/DpuJfALcWshA04naNqUCR3ZiNGKEJhpZor1ctfahurcVjpY0/UIJrtXNlO2DcBS3623lV4yskQJzwkVirHs2AKoJEsNK2tol9q82oabPbxyILy39JYSSw4zxmOWOSNzgLyRvpFlIj8R1quwZBfN/8AS05cvayDL7MIY+U9XS2BXPBqAdKenvLOl6zt+hJxJr8eKPRISntbIWdrYHVDtWmSEhfkEcLVI0pZYiwbk2MWkaL1D02LxRblrCZJIJLgTx2c0kNxGtus5JAUllPEsSjSEFjnt41M6rrvTHUWiQ3TG9hkSeO2+LvdxpNA7XDQgLliqlmcKoCrxYAxsTJnLKyWmxb34idQur7cu+JcUmyrOQNDSa9qpotbLJLSMuksxhS5JK5lVVtVTJZUx1vMjYIrY3CQJI0M5ArToNGnFoFgzd0G29PlsNK1LZWo2tnLuNri3nW3muOCzoEYcElgmRGkTmsixtLggthSy9q7c2pQ6rfafvjSr++t9sLBNE1xDbBmgcMcu8NzA8irJ3j5rD/RwWHJA9FpqZ3zoZub01o62uU98z9+4H2dw9rjkhdVfVbR1Cz/AHZ7kCZG13AkDDWdUWHMF8ZkTJohZJVKMcfQFPaghOccZs3wVMuq/wAk5dLsNWtdPsbNNXivJbaCWae4jMa+H4khaaaNAVYERgiRigJAwRVPp+kJuqLUdc0i+1HVbuXSZbOOe4ht7eGRTIsnhRgW8DsXcMhdsxgHLgqYmbseQ3O+lbc6aF0cXohx6uRXyNDxImNbSfh6uoOxmt0o50jFbKGV0dZU8Loenr1vg1VqkBa9rc0LgeF19MjLagHrDiSNeNF2fq2n75tdxXV5ajQjqKypefGIiLgPLkIqq5kMk2SjqVwvJi5CAsZ2t720W42Xc7VtLe6O4YtP8N7aO2mJteEQ/XcnjSMJb4EseWDllVOKy5Rc2vFUo8ni/wAbyVRa0pUVQlPlKSnJGpb3Es8uvY6E4tegWFEq0K0Bmt6NJNAAwoethEHQtb1rVW5Cp3FflcFTez4wQRjxW8iOxHsI7GtrbSDLtXTFcMHGn2+eQIOfBTOQcEH2g9wexrFH0vOWlEVnCFnGGeSWURe85NzC5apmeDO1S3An2oMmvJO0pFFDRybcC3Dk6F8YVJSslUY4AS+UaHxGBFvw62Hv7bOs39wNw2cccmjpptrmQTQ/9Hbxq/oeJ4hKsCMBc9uwI71rvYW7dA06P+S95M6a499NiPwZyP1khKZkERiGQwzl/RJ4thgQIWq6lrDkvScbZ7BIo+E8gOKPMbkRy3plhdWh6Znp5f6n5d3JIHqJgalCEh4WJLYqNye2IkkJfgWgeChB8Ydh73a+1Wxh6kNZ3kifoXUdNt7OdgVYKs1pCgfOeIMUwRy2fRCHyq0W+kakel6XtlEx1zTL2W+gjJdebQzvJwYJ6Tc4iwERyDJxV1yCBUBjDIbt6fvVv51OsPmaKU82afukmnog+RZ+bp+zcZabqOUVxQsbVwRUjMf2SSS5d7blChuLLGYYokQOwRC1re6b4xbaVvDbe1IZYmtdLngaZ1KlGuZ5UluGDjAZUHCJS3ccCO3kLhDY6hqe2NzbkvIHi1DU/jEcUbMSVt7ZXt4MqWMaPJxZ3MbGNwUcMwwxn6gWJ011I+Ozssjj4UibOjFEWkL0ujrsnbGx7U3rBDFjCJ3VIS0CCQmpUmhnIBGgW+SVoQi9AD31bdbmi/kHfRq6GRt2SNgMpYr8Xk9LAOSmT2b6OfI5qO3YLkdSNOlZJBbrsqJSSrBRJ8aj9HuAOYUHI+koPfAbvbXyuoG0L1sjrh1vVsDWv0onNSdOGURtiXI1rCxXEsqoUxmkqrpFIFadKzO6+cReLajZ4tHjLK0rJJVCAV8NXvbut6do9htG91CULbw3GqI5BDGETcI0kK9yoR28TyzhSwGcZs+4tvapreqb0s9NQrcXEWkMjekOZtwZXVShV2JReC8SAWPHOQ2Ol6mfUE4+8oOnDyArCqK+tx/scyCxp5nVeTSkp9XavjAniszirq8yO3nWbR5ji8UeYCqb9kt6JuWr1zq6gJLbyz02zVJU3YGy9a0DfVlqOpT20dh4ziOVJ45PjXNHVVhVGZ3Dg8mLqoRMliGwpk9St9aHuDYN/pGlW9zNqYjj8WAwSILUK6MfGdlWNccfDURs/J2VQChYjY7Y/wD2Iz//ACpv/wD4hOaLm/zz/wDaP99dBW/+YT/sD+6tfzps9PKqrz4TVa+8gnTko+scim94Okk42Sy57hiVAq/ZXJK0Bs6R34/lO7BHzWFfpuTuJrcrTDQOJpwjjiTgHj0PdW/976hpW7Lm30VbBZEigC3SwQvc97WLli5Ks2RkqGByoAAI4jGg+l2wbLU9m2d9rkmpHxJbhmtDczx2o43cxQ/FVZUUkKrsCAS5ZmHJiKl7qHO9lcL7xYeYHH+upRNHK9OPEv4VPMPgUWUyAgi80xiyX8IZo/MLKToSaMtE1cpBHnZ0P1pM2trsRoW9BCDWrRsqPT90aQ+29bnjiS0vo71XkbiTASI76NXOfSKeHIqgZZlY+2sk3wdX2xrMe4tvwTTG70+ezZI+BWOdI2mtJvCJQO2UaInmDxCRorM6iqV5KUAl4WcRel3GEiCUSavuHPL3j/Pr+mkQisomq9G3kw+1kto3Q8xyMtzzKVzc+2hOjF7gYnSqDiBOohiBsOhb1V6BrTbp3NuGdmRL3VNLuIrZJHRMkvD4MAZiqBlijCjJAPDzFWzc+gDam1dtwRoTYaRq9tcXTRI7Kqqk7XEwQcn4GWRiFHJvTVFBJAN43IPk3W10UNyIqqtG+yZM9Tvp52byFhr2XVVgtsQkUEm0VmERjjYif3iPt5JVirnQnQtxg8BL6WnGE0aYId77YvoWg32la5Y6hftBHFBrcNtIvixl1kR0diQGOYwP+lBKZ7cu4zl25tfsdX2vqNjpwmlkudAubiIiNwGRomRRggOsjFhxjdVZvS4glHCwFxE5TUpdXBqvuKFaSORPPIRj4DssWc68cqztSHqkUli9IMMMe2Y2QTGFMEW04IJQsLSeWFcIQx72IvQgBEIN83Nt7VdK3hNua/jRNCk1ppFlEsT5R7hpFbgjs+Cg5d1GPI4Pasb2nuXR9V2PDs3T5HfcsGgrC8JimXEsdssTp4jRrESJPRyrkHzUle9WQxOZgm/BDpqSaEQC1bSfOlrZvF+RcxOPAqksVhsuNCitLyqtpE4RmGzKNMYrGmdHv7xp/TI2Ua7zQNhgiDNHaI0LJrm0ay3brsF5NBbRbgt7pbO4E0TRvzmSRVd0dvDjnUcCXx3YDB74s9rdxaltXQ3sopLqbQLm1e7haKZHj4RuvONZI1LyRspC8SFAZjI8aBqmTlty5p7mJavTeDxxhtkWqwV51DKIksyvYqmbIjUUq/S1nmjVuCGO01h8eeTn6VBcAGOxKQkaJnQotGOhqcwSMBlBtnbGqbX0/XTrslvbzzaHcqluZ4meTBQ+KFR2XCY4pkhnLkRhgHxDdm8NI3bqG3xtwXc9vFuC1MlwttMsa+l/6u7SIjDnkSuQDGngL4hVilZsqovGIXG8W8yRZrnTcrpS0HWpJabMoJJ4Ygc5MztLO8ql8JXyFvQpZtEzEr4SEl2bhHojjQjCAe/D33qXUNKudMjt5LhomW5gWZODq5CsSAHCk8G7d1PceR7ggbu0/VLfUmmWBZAYJnibkpXLIxUkZ74ypKk4LKVkAMbozTHlsq5UxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSv/0t/jFKYpXWuyRcuQHpW51OZVZug6Lck6VGsPTa8WtjESQ4EqEYjNh761swsYdb+Ph392Kq7Ge2trpZruBbmBfONmdFb2ZZCrgZ8+LAn2jzq2KScNKgsMZorfX2bcxBigSkDTYdozJRFiBD33GWVB405xmECIHrtrYDG4eth1rX3YBx5VufR/hCb+2oqjYMWjbekCcTLYadaLcsB5E3lxHcXgI88rcL3OareD8WuNVaEFp4BQVOxEJW/EE1jrmJoVex9ta8Zi4pq0tNH8P84Rgt9/j9+992SaxvcvWvrDvGQy7p3TuC/Leqa/unXHsCGXgB9gUCpzIIISlATpiSk5BQfCWSQWAkosP3+EBZeggAHvv7taxWtJZZZpDLMzPK3mWJJP3k9zX1xXimKUxSsf/KumLLOtiA8oKeh8DuuV1fAJTAJTQFi7RJQzGAy54a35e5VXKHEha2wW1S1kd0nKNXJxtzuiENIeYR4AGajntiupuiHUPZ0extU6L7/1DU9uaJrWq219ba5Yc2Npe2sUkCR6lbRskl5phSfmywuJ7WYLPEkvJkqFl3KtRIo/xrrbhmwiqiI2VUs2tk9emopxsV4rGLQaVsULV18zUtGH2NIkT4msCQmIXU8xV7OaAJBllANMUpxgYrYtt0Pi0nVd4bw+ELdDXNe0fXbPTAjazHYRajc3ltNdrfS6vcQ3DvC1jAs1six+PdGVXdkSGVWq0fIXlpJdcTq81H4ZStpXe5cg4zYTlOoJIXdI0pajajlTDYkEh25e1OCcMvREkuiJqd1g/IJW+nUmCGRsRoVYV6UdCtHO+t2G71HcWyttw6HcWEdlewRNK2qShZrC9u/isqN8VcvbS3NrEObw+LCgWUBOgL5BzyTVzThVqRCoJ1YMN6jDJxlkr+4Qs5bHVS6Hy6QsSa4a9YXJ2VqYDPzW0olQlN0qV6a1hqgJWxl7BrTAq6N0q2xo27twPsnUNf0zauo9JJtw28Ed2EnVLq1gmbSr6eOJVvbESF45VMcXxmJYi4Vw2aidrs5Z2Cz8gbvp+Q05Fa24/wA4tSGRyppvE3Z5ebf1Ryxc1WE4zCx0spaP4WGPr0zLiGMtM1LwpCCyFS3zgnCJLYHl66tNh056F7V1DavTbf8Aabgvt37q03TbufU7O6iii0r9MoktjHa6e1tL+khDDNC940lzAZXaWC28NoxI/cLuQV93dZcLr/j4919WjJZXDWEcmmmV2NC3WavcYd5TLwpmtiPjzdKY2heEbu0nFpVniOIG37AYcWI8YyygiO1UFt0r6X9N9najunqrbarrGpaP1CvNvS21hdxWcNxFbWvKWYTyW1w8TxShpIsI4nysbiNVdzeXaTvPIzR1iv0bISu9nR+qZc7sKZsRGiROc8aog4LGslvblJis/aVbIE4AlEGDMHsAtBFsW++9wrnvZVhtjWOpOkaXq7PBsy61y1inaRxzjspbpEkLyKFHJIGYs6hRkFgAOwtT4L0hx4U8UKplLBGodZii4oEwWDZtjyhoZ5dJ7Un0vaiHGdvs5fHZKtXOrsZJFCpOckUi2Fu8r0gSywk+WGJzW8PhL9SerEPXLXNE1S81DRodv6pPY6dYW0strb6bZWsjR2UNnDEyJHELdYnSWMAz8vHLOZOZpjlfYkw4vxNkbKBnlLVhGq7qmZSuG0IXUEjn8lsYyt0ql3XxZAhh0jZCKvqhsaEoEip6LRmltilUDZgyiywFGh3q8dDdp6B1o125vOqWl7i1rWNW1y0trvWzqtvY29gNQZYkuXe7t5jqOpySsZYrRpVa5jjYKruzPH3sxu3kHYFvVXUdKu9cV0VanE98vRVLZpGXKeK4Y/pZJBmxqIbWdDIY0jlKVR9a/TmlGmpQllhEo0YIQQEDeXnVt2/046VbV2Fre/OosGr6s+ib5h0ZbW0uI7JbuBre9klaSV4Lh7Zl+Lc1ZVkLMViKgFpFiSx+TXLRRPbai9TtrW6ufGlrhjM9xdhoqaT9FyCthxrlpsKURzcsRTFuJo2LqyXtCgZDDy3VXo9UNYqMGlKCWN2rO9odGuhUW19C1rfU00FlvGe7lhuZ9ZtLF9D0yO/lsbe4+KvaSHWblTDNPeKjW0RSNbeBVncuuU+POap6YGN4XNC6PrXZnbHNYwOmyduTIqXoiFShocdpxmp9rm003ZJ3gEIHmA34d7123uFcTatZwadqlzp9tcRXdtBcSRpPHnw5lRyqyx8gG4SAB15AHiRkA13GKt9MUpilMUpilMUpilMUpilMUpilMUpilMUpilMUq1jmhx/lPKfjvNuPcbsINYtlrHx2K2PKCGtS6PJ1QKZC2n2pFI2FO5tYG99nsJTrGMtYcI0pGU4GG+UYIINZkG19Zt9va1FrM8Hxh7cM0aE4XxuJETt2JKxuQ+BgkqO+M5x7dOi3G4dFl0aC4a2ScqskigFvDyC6qGBX0wODBlKlGZexIIuUZWZpjjO0x5hbkjQxsLYgZmZpbyAJkDW0taUpC3NyJMVoJadIiRkAKLAHWggAHWtfDWWOaWW4laeZi8zsWZicksTkkn1kk5Jq+QQQ2sCW1sqpbxoFVVGAqqMKoHqAAAA9Qrs8l1NpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilUBakALtStpzW5ssnEDDNou8RsM3rSSK4fYUQOdUZqVPJYXKEOhqGOTMh4wqUajQTAgPLD4wDB4gCrNOvP0ffQ33hxTeFIreHKoeN8HurqfpKw7Edux7EHuKHUrL9JafNYeLLAZYyokibhIhI7OjeplPcZBHbBBGQcYUq4Pc3L8hjLxy5X8wKusPi6idooosRRX9DOkC5Aci4xDHxrkDbB7NlqqyH+DwtrkLmypRSBXGWhMrdE4DkxXoylJmw5/bbt2po102ubc024g3CVfw/EuFkt7Z3UqZIkESu5VWYIsrFVJDdyozry92duvXbYaBuTUbafbIZPEEcDpc3CoQwSSTxSsfpqrc4hz9HDFuRrL2EIQBCAAdBCHWghCHWtBCHWu2gh1rtrWta18NZrTz7nzraPl2HlXnFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpX//T3+MUpilMUpilMUpilMUpilMUq2O8uKFd3zIGSYPMmtuvpoxsDhES5fTdqS6sX1yhzqsLcF8UfDY6uJRvDMauL0cX5xIlCYzYhEGlbGPxRBxW5emvXLdnTHSrnQNPstB1XbtzdJdG11bTbXUYY7uJCiXMInQvFKEPBuDhJFCiVHCrjp5Nwro95hVSQyMpJdU4qISLW+ophUsxeYZPIS2u6MCGRtiSTkmrFTw2ywgsInYhzCtKcFAQqDgiUAAaGAOKuGjfCK6k6fuLXtw6zJYa6NzukmqWuqWkV3ZXkkTl7eRrchFiktWJFs9uYWgQtFGViZkNXRvjLXUcc6efzHKwZRJaSPsNZEpPNrAk0rf3BwtJBttmS+VuDuuPFIjliXfhTgN1ohBrQQpiygBCHUc1YdY6ybt1az1/S0h0qy0fci2CXVtZ2NvbQJHpr+JaJbJEiiAI3eQqecxJMzuxJPE1xRp7SYlLpvkHkkckT+VxevrS8+LVwqXVS8muGxep77j+1yse9Nf/AOC0HsHwdtayGannrjv8zNP4tp4jbQG2T/waL/ipYliEeOP+f4KB8Z/zue/LNULYHBSkLElUxkDiutCPsFnryXa4athVmSeJ1PcLqWlSt6lysGFNKolKvVvTYgISuu0ZiILynJCBfpTrxeKOayba3wmepG09D0/SrSLRbrVNFiMWlaleadb3Wp6VEWaRY7G7lUsiwyO8lsJVmNpI5a1MJxieUNNwJstQm4m5sPQTFNVqGm0gEa5QmjyOBNsjOlKFsRxskQGhKemdD96AeAoJgSNBK1vQA61pntitYXPUHc97slun93MsugPrb6sxdFad72S3Fs8j3BzKytGoyhYqXJc+kSalLIVhVWKPfTzoxZIZO9w+TXtTrZOHZa/TWC0peE/rOvJM9Ohoz3h0URCPOhLazrXk80Q1Y2vSDZ5ghDF3HvYth27DFdM6d8K/qXb6VZadr9ntncF5psCQWd7q+j2OoX9vDGAIo1up4jJKkQAWIXPjhFAVfRAAqWS8FqGfUjM2s6aZwBqaqRfOOSltgcxdGgiQ0w/HDVqIXIVC/wBrOK4tM4HnKSVwDynPzlJ2zFI9GjDuOas+j/CY6n6ZPcXl++napez7kh19ZL20ilMGrQgKt3AqeFGhZFSN4SjW/COMLCpRSJPhfHaAwiVQGcI1UqeZdXFPqqOYX2QyFQvPUQNY9ML8cS7o05SJqcHj10aSeFZtOA4JQNg1vWhC7wrC9xdWd0bk0TVNt3CWNvoOr6+uszwwQKirepDPCDE7F5Ui4XEuYuZQsQx7qMUTaHD6t7MsBys5PLbiqyZSZhbIvPXOlrRkVa6shgY/VAYkM2IZTPLcFjGnXHkI3FPpK6pkxwiQKtFhAEEc9sVkey+v279m7Vh2ZLYbf1vb1ndSXNlHq+nQah+j55uJmezaYZjSZkR5bd/EtpJEEjQlyxa59sb0rQ2t7Si0cFE2IUjek0oVKVqjSVEQWmT6PWrTVCxWdoorXiNNMGaYLuIQti3ve4Vpi8u5r+8lvrnj8YmkaRuKqi8nYs3FECooyThVUKo7KAAAOdiqamKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSv//U3+MUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUq1DmrzArHg1x9ll/2kFc4t7MchYorEWYScMgn88fRGkxmFMIlQgpiVjoeQYYcoM35SJCnUKjNbASLW8j2ptjUN3a1HounYEjAs7n6Mca45O2PUMgAetiq9s5GL7w3Zpmy9Ck1zVT+qU8UQHDSSEEqi/grM2ASEVmCsRg6m6/rU9Ym5tSe4KQptG0UtF1bj7X/AIecbJtcMBiKZkRlOjmimtqqPOAY4NTOaBS5GgE1AIKH5nkkl7D26WTpJ0w0rw9L1i85avIBx8S6SGRyxwDHFkdmYEKMOSRjJNcmS9cuq2rmXWNC06X9BQs3IxWryxIqgMRLKUkwVUhnIdRg8sKD2za9JTrBNvP019p+2IuwVzyQiMd+tpSeLLVR8BtaGEK0qBxk0ILdD1LqzO0fVr0wHNnUHqxFlKSlSdQeSI4KbUfUzpfJsrhqemyPPoMr8MuB4kTnJCvgAMGAPFwB3BVgDxLbu6TdXoeoCvpepRJb7hhjDMFyI5AMBigYsUZSfoMxLL6Sk8ZFjzgCEEARDGIIQBDsQhC3oIQhDruIQhb7a0HWtfHf9mairdtUnOp/B6xhEosuxJbHoRXsJjznLJfNZO7ImWMxuMsyI1xdX15eVxxKFA1oEJIjTDjBhAEGu/fIqpYhVGWNQJAGT5VarAuoxwqsmuLYtmNX1HE0DopoaZHcDpMmSZVs4V5Fn9CY5R+XyaMWNG4rKkENkCJOcNA8bRbbF2kyjRB5m052i5jwSxkBh55x6/Lz8q8LLG4yp8qu2jkui8vibDPIvIGh+hUojrXLo7KmtenVsL1F3ptIeWiQNzmUYJIpaHFpUlqSTwi2WMkeh634d98lkEHifpCvYIIyPKrXqC5/cPeUM1c68oe8o3YMtb2NwlSNvRNkpZ0kuiLQ9hjjrM6zfJIwszBbEKbHs4lOoeYyqd2wkSpNsZ+gqU+zJskE0S8nUgf7+fsP314WWNzhTk1TNM9S3g/yGn8crGlb5aLDmMuG/AjKRiiVibZ3zUZRuC96ObpasiCWIqUqRI1KBBO0u8o7y+xQhi2HW4vbTxrydcAfdUFmic8VOTVQrOoLw0b77BxlXX5EEtyjmiKs/YB6WQlx4u0nNlLkTbU59k7ZdVintlxZjiz08WMeAv52jSwgSCGYAIoeBMY/E4nhjP4e3Hnj7fKo+LHy4ZHL/wA/Z7M/Z517Wf1A+G9M3Cmoaz76iUQs4xTC0Lk0uCSRHMMRcrIU7SV40WLPkDIrr6snqeKNlhZkUhdGxW5+oT7TFmaUEbMgsEzp4iqSv+/kPM/hUTIgbgT6X+/9VTddd7U5xxgKy0r3smI1RXre6MLGqls1eEzKzgeZQ8I2CPNJahQLW1Di8PC8oggkvQzBiF37eEIt68KrOeKjJr0zBRlvKojvznZxC4uTKKV9f9+wKsJjMkBL01MkgWLBHt0bUPJUdTzGYqG1CvRV7BVL8ZtGW+v5razmKSjiwqdiIO0D3HBNKpaNSQP9/wAT9g714eWNDhyAa9eQvPDh5xQe4jHORPIWuapfJw1qZDH2ySOpu1IoohWpW1dOHoLamXhitfoHBaWSfIHXaJlINF4Rqg7CLWkcEsoJjUkD/f8Ar+zzqLSIhAY4JqtHblbxyZJtNK1X3DCv4hV7TB/IiXQdE5bdZW2Ugn2MJtmksDWUsc3eKeaDRYVCIpR4zRgLDrYzCwi8iKQgMAeJOPx9lRLqPX3xn8Kt1inVa6f81WOTdHORTOqc2qvp1aZzUthFosrqsgdZtKR9nz8xtb5B21fJNRVncCFCtM3lqlhZRoN+Vvxa7zTa3C+a+vHmPM+XrrwJ4j5H++q/o7qE8OuSFhlVPTN1tUvsdRGXuZJIebGJ3F3lbFo2tZG6QPiAiYRaPgXt7MukjeUpGSIfkjWE6F28Ye/iSCWMZcYH3iopKjnCHJ/GrzclVMpilMUpilMUpilMUpilMUpilMUpilRjdNwQLj/U1h3XaDvpir+sIm8TGVOei/PPKamZKNSYQhS6EAa50XmBCnSJwb8alSaWUH7QtZcNK0y81rUoNK09ed5cSBEHkMk+ZPqA82PqAJ9VW3WNVs9D0ufV9QYrZ28ZdsdyQPJVHrZjhVX+kxA9daU949aXqicgEdk3ZQqF2oHjFXEjYWd1VQavYxNFEHDKVKhPCy7YsSWM8g3t6fjAaKUCbkiNmSqxlphj2YIsZvWWi9J+neitb6TrrLebhuI2ZRJKyc+GC/hRoy9lByAxZ8AsOwOOLNx9aOp2vx3Os7WV7PbNrKqs8cSSYD8ghkkkRiCWUjI4KcoOALAG9fpZddm3J/dEJ4181VMak5NpPKWJ1rerGxIYg7Ns7cvCRHohY8fZ9ExtY1y1YEKNA7IE6IxO5nFEqiTCj9KE+J9R+jenWGlTa/tQSRi3UvLbsxcGMd2eNmywKD0mViwKglSCOLZl0o686hq2qwbb3iY3kuGCR3ACo3isQEV1UKhDsQo4qGViC3JCzR7Z+c011nWO+VdS2kIlY8piSyCXm4VrX1wx/j9ZfJ1ogCJVxzrq4pGtZGZNDpPLjZKmlPp2eTyVuZnh6RMiyPsjutClXLiBkq/TMUrsLf6g0NqicW1H0VJ31aEG44Exs7k5clcRiMuEBpD6zMCGYaSr075L2GYWG5Q+COyKRSdLFGt7PYGJaQoPCI4zSbSlfC4OoPG66mdpRev6LuzkO08fIRGLF5EzSnksCUR+rozMI8qmjEjbipjOIo8WnNDoCm1IDGWLJnRWW0qUo++1CtMmNYpXcznnawJ5DGIrQNKXDyzen2kInyWctUyTBGpnjlHT9S7pa7kquQWxNa6Z3KUWaZHHTccjyQ050cC2pWYYBMWUEZilSog5eUS4cWWvmQVKzyqMea/arDbnhU0OCZ/VIXz0yVnjBEUMJ0+H2A6yFYSypWMsobipfDQICixqBgAJSoQL6itdyOqOMVgVdUV52bN+XrU/PVN0O3RmORW0yWmFtoHGxHWzBzaWMEErBrrkxQlQu5zo8g8DqvSIk4VChQWDalXNcfL7iHI6uw2BEmqVRg1BJZVBZlBJ61pWSfV1YMGe1cdmEGmjQgcXhuRvrG6oxa2NIsWIVaYwlUkUHpTyThqVH958zaX4/W5x/o+Zmyt2sTkZNkELibTC46bJCIiU67WI2ia2mtIUkEQGBvUkSgZW9wV73txeDwpkpR2ylIiFKj4nnYmfbJsyvK74s8qrUS1HbQKWm1hwmN1AXAUUzKa4k9PO0aqX3VFJM4s8ba5mkNWqCmve9eA0JIDhg8ImKVx7t5+xOobAs+CMNI3xdpHH6HR6f8k5bUkeibhH6TjEpbV780FORMpmcVfp/L9RNvG+qWGKo3t2TMoilAyfMUpCFCletu9RGpq0egMkNra++SZqCmmLkJN13GyvEdiNtb03Lvag4RMJWrcJLGNLFk7Rx50VsrEzadpI5ImpUeQ3iLCXs1ildnZXP+pYgdUbXWUIuHlFKLsqc6/IREOOERaJY9iospOymp7Xez5hKIEwMUZelMhRI2olQuC5u647ZKNKdshTshilXKUjc9fch6mgd2VW8GvkAsePppFHF6tvXM7kAg4ZqdY2PTI6EJXVikLG5JzkTigVFFKkK5OaQcAJhYg6UqU8UpilMUpilMUpilMUpilMUpilMUpilMUpilMUr//V3+MUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUrWP8ApOsclq2gOLksQEqzYLGLzfW+XGE7GJGifZVAnNBCFjgWHuEIDDka9ISaPXhCerAXrehGh1voL4Pc9qmu39vIQLyS0UpnzKq45gf1oSB6hn1duZvhOW15LtmxuIgxskuXDgAn0mVWQnHkAqS+kcAeWe4BwhcR675uSem6fmlC/wAbBcaYbJeSwb9PgdnHRWs0CghMW6vG7DiZc0Y07yPcRPIMOEegVaUohAKDsztovW3d0X20bfWLm11kWv6fljtvi3iRB5Tk8V8N+DEemCBhhhsnt5nSe0NP3tdbagvNCa6/k7C83xkRylY+yBn5qHA7RFS/IDkmFHLHEdd0JI5LJF1KuMSmGFqQkRKL2VLZmsSlG7TN9fhrB4ja72l4AbCQidJDI2tGV5mgh2pOK7faDrtN6yXNpB0+vkuscpXiSMHzMniqwx9oVWY/YDVJ0Ls9RuOqVlLa8uEBneY58k8GRCWHrBZgmfIM6+sit23ntBeQ1g8b7NYePE6i0TelNc2kmkzA/wBRudsu1kMrjXUkb00GhZDXYkAMi8qd3VQSFMvGF1D4t6L9IPYu+uIYGjWQGQEjI9eMd/M9j/5V9DJQ5Q8D3wfVnNY+TuPdrHdG14rTmbcwIsxsnHDjzKmhbCeK0rdZnxwbqUjtZz1O0WnUqac2S/X6fBJdBijJOiRpWY1zaky1KFMSIfmAqPEX45yhXJ5Ed2885HY4GPPtUng3xfjKe3Eeryx/Xn7atyrK1LI5D8meVN1Sm5OKl2t0O6SVhQGUSbhI4PUxoeJu0mnzvMYK2yy0ZC6uql9seVM7K+OaePdytxdnK80zzvawFJ8xlWONEAZczA+l2P2/h5d/b91eAxd2bKnEZ8vL/fzrKPxQhUdtbpF8aq6fj33cTsnpxU5CnpTC/EfJ9x2Y8ZY4xOJ8T9OSrEc++zXEYkHgLN2JR4OwRfDW6aUlbtmHmJD5/wDaqfGA1uoPkUH91YlOItkSq3OUHSshbFyO4scjILxfgHIEhkT8Xq/mEYthtp5k43qacZZty3gUucVCrirIjZGrjzMfXw06cxTLVBugbABlGlT1Uq8IpWKspYjzPbOc+j+16+/s++pCNyeMAqQAfL2Yx39nq7e37q+fE6y2aizenRAOK3UbsPlzNZNbTdxrtriDK4jCIMjh/H6LtVkhsGSP3GTUYT3lxXmfGUEfbtqniRvBm3JQi9nLtKzHhDotKpkEjSxhVAyG7nv2x6XkwP2ff6jRDw4LG/I5wR9ntx5jFR3CrPldEV4BiScwWmUctYr1KZNAHLpivMHp5yR2qlsLna4zY1weobIIW4X092W6VrJk9qtduN7wnZWsCMhWEr2YmVBHEpzbJT9V4eefft6Pb14wPokev7/KAbiuFP6zn9Ht37/dn7c+r8K827PHijSOqCc+cxGas+QkV5nWHZ1IcCJLAKnmrVzDQWc01UfUEVn9aTKJSG4uRbbyFQt6SGx9ziLg2kQsKUBRX9IZVOgxRefh+hmMoAW7jjjOcEdhjzOfPP21Bjx5+lh+RIXt6Xs7eZz5dvKqy6x8pvJ/beZc1uzi/eyiiaEo8UG4nSVhLpZ9pJHPLBbI0bcHLKxT3m0GqbN0xZy3LcGg+iWNQrjqAp6cQeEx/DpF5sgmVVGHMt388kDyAxnt6znGT9gyY3PLDFgeIXt7M+sn7fUMZ7ff2uN508luNidwtTjZWyGn6D5p9Q/j/D2/lnPOSkprmHIeL3G5TEXmvkMy5FKXOdLIpKbDh8YnLy3QWAMziv09v6o1UpGSxhcnTUmFJCQxy0cbdgM9zn1ds4JHnj1Y8/KdIy8SvZWYd8+r1fdnv/v6+JCLT4dcLOTPNpk5FWrXkcpObcFOFRfG2SWrKmR7QXvxUp+prSg8lilcPi7Z6O33BJKXZQpXsTRpavcDZUkUARmhciBG+2WaaJDGDzDtywPJiR3Ps7ev7K8AxxuwYjiVXGfWAPV7f/v9tcngTHJnBeQHSegdmpF7JYMb6Jtlt7zGJASYhk0d9BZvClKVH3ptVhLXo3WMofTN60owPiIUkCAL7XfunKmKVl+iZx/c1IgQ0Yb6Xhn+9avN4sPG+V/MXkly/wBqhudPUSqfODvFMYT1ZrG7r4W+pHXmLczISb5zUqFLboa0ECTuCQf20tanbDvy1YvHIkxHCsQ+kfSb+4D8B3I9p+ypqZeQufojsP8AzP4+X4V6cGnsHKm9uTPPva0DxW7s/OPEfh6qJPIVtB9CUPKnJvtq1Y4qQrj0KtNf/JBI7iAr0XrbhGodHTgjEX4O0Zx4SLB/Sxyb7z5D8B/aTUIvTZpfV5D7h5n8T/YBWUjKWp9MUpilMUpilMUpilMUpilMUpilMUrFV1soBNLH6ZXJ1mgqZwcXVmYYpO3NnbCjT1bxEq9nsYmkwSgIJ7mHhTRtjUqxF60Lx6TeHtve9ZsfpJfWmn9QdPnvSBEzvGCfU8kbxp/WzBfxrVXWvTL7VummpWun/wCeCxyEZx6EU0ckhJ9QVFLn7FrVG4h2dUHInhJMOnXY19s/FCxg2E7WZx8vGTuChspu1WWaKUbxLuPN7OaE5GEmJvEnSEupHqTwp1JqdAoK8alsCmV9Ibq07VdB3bFvnTrJtSsDAI7iBQGmiZMhLm3U59MKSh4jIUuOwkLJyxsrVNC3PsyTp/rl9+idRiufEhnLGKORCFD21w3qXkqyqXyvjJGWX9WqS2zP/GmNs/OOjuOPGK3B327vlkUsh3IGxCkAZD7LSy5I4zyOakcdGoiEyY4MgYDX4EhZTTWzTQaAJpmlKdT2yGLcFzNs281zcVt8TjSGYhWJ/WRcP1bcWAdGfl4fhOA/Mdhhlzin8l7S339ZaFtS6N9I7RBmQZEUxPCRealldEb0/GjJjCMCSCrAfpT5wPX0nrXYtOPXJ/k/8vOnQl473q7WzffLm1nesbQb68fHOhXSnuQnIIq7DLskt5JUwoNFiqpislWpnlqcFJEgE9NJaZGiU6WIzTYmldzz7rebDsDmNW9ZRrn/ABUzlrWCBoPiVCQ+HTnj5ynsKS1P/CFrdj7ZPisleOHEkjJba3tU/XL3GNpniJtSNekGcoCaYF6qVDnJej2GOWDychHIE/mvE3Z+4x0RSnG9PwugtsG19yrj0JpspI6ME6TVQ3vMVse0UdznPjIay2Gc0N6aErkKbRgmxe4GhUqQLphbibZFYvXOVr5R8eiR9PWoasjkp6ecetpqbnm5JQB9N5IURLpNxoZJfKtq4g+IWM2smRdoqPpE6h1Utp5qs5VopSpOrzjl1AZzUXTpcnSuOLrHFuOFVt8xcON9qOs4qI5FyBZ1wmalJrMGGpoVZcNAdUVVFhVlRwnYUTbPXM1eAQjWZqGU7UqEamru+IDwZ6fk5s6seSNLXHTjpbMdZ7Q4tQ1bbtlUVXFjplhi9Lf/ABnsWDPD5Y0VspWzJS3tC0sbyfHnVCzuhBxRJR55Ee2aVkx6YNVTWtqStR+nDbZzWsvDk9d97MhF3lpkl1q4tOXhuSsb9arKibmdDEpVKiGHboBhJRpNMDatSNoyCDUphIIE0rG3dHGjqOxWfwizHyv+OFx2NbXUToiyJRPoPM74VKY3XNYO87TUXB5LGf4Tmt9f0LTEDchhXrCFa3zJQ6L3cwkal2UDC7YpXvypoWu9TTmMhifDnmnrnDYdq7nvEi8Ia9WFJK7LsqSQ6AsMEt+tbcjDmgqPjjBIbLY0QpnjHJdt65QlRLNqSnlGuRkmqVJfOCEz2L2tfQYdHed8akXJHjtGYzM1HFCv4vZdSctbBaoXKa/bY2fJHKHzV84fWfGkStIhVylWpjzUviwkx2lhh7SMxI9VK7SqCrI6cc4sAic8erxudHafDvhtGa7U8bazkFuMiu3+M1SP1RzOkHxY0+YbAVLwsMbHJid3/SGOq0S1WI9wIMRHh3ClcOkobaXTymHF6W25TVw2VFjOmjUHGSZufH2u5LfLzXV8U1M5HO1UKd43XqF4kQo1NSLKUN7K9kJhtQ1jHopUal9Ql2ZHzpWRLp011YNX8QKxj9qRU+Bz19e7etF/gStYiXuEEFdd1WJcbdCXZS2GqG0T5Emmdp29eFMacnAtTmhKMML0EYoedKvcxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSv/W3+MUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUpilMUqL7ppisuQ1WzSmLjibdN63n7OYySeNufnAJVpdmlKUylKrSmkLmx2a16cpUiWJjClSJWSWeSMBpYBauGlarqGiajFqulyNFfwtyRh6j5EEHsVIJVlIIZSQQQSKtms6Pp2v6ZNpGrRCbT514up+8EEEYKsrAMrAgqwDAggGtZKdfRhG8+XKh1VzNlcZrdwWiFuPzeuC5bKWts83flohvzBNoSzSk8hN2Bo9Y2kmGdv5mx/He+g7L4Q0y2oGpaXHLfqPpJLwUn28WjkZO/qDGuZNT+C/bTXzPpGrPb6a7d43g5sBnv6SyxqxI7dlQD1Cs1/T96alA9PGHvrbWe3mZ2POAoP4i3DNNITJfKCmzzRt7GgTNydM1xWHNihQaambEQNA80zZigxQd2M1qPeu/da3xdrLqHGKyiz4cKZ4LnzYk93c+tj/wCyFBIO8NhdOdA6f2LW2lBpLuT/ADkz45t3zxGPooD5DuxAXmzcVIyHZhFZ9TFKphhhUNirWuY4vEoxG2RzWODg5M7CwtTO1uC927adFy5vb0qdIrWOWta9QaYAQzv+3veRJJ7k96gAB2A7V3yJEjbkaRvb0iZA3oExCJChREFJUaJGlKAQmSJExACyU6ZOSWEBZYAhCAIda1rWta1kKjXTtERicfc5A9sMYjzI8yxWnXyl3aGVtbXOSrkhZhKVbIF6NMQqeVaYk0QCzFIzBgCLetb1re+8SSRgnsKgAB3HnXojh0RbpI8TJvisbQS+QpUaJ/laNjbEskfEbcWWS3pHh8ISlujmlQlEgCSWcaMBQQa0HWta12cmI4knFMDOfXQyHRE2UkTk2KxsybJmkbCmmBjG2DlKdiMOGpGykSASXbsU0jUGCM2mCdonYxbF4e+972yccc+jTAzn10Xw6IOkiZZe5xWNuMsjRK1PHZQvY2xXImBO5FDIcSGV7UJTHJqJXkGCAcEg0sJoBb0LW9b3rAYgYBODTAzn112zm1tj0gUtbw3IXZsWF+UsbnNInXoFZWhBHotSkVFmpzy9DBrfYQd6761vIA47jzqPnVNP1c17KVI1kngkMkas3QNGKn6LsjupM0UV5BWhnuCFQaPRZH2A99/AHw18PhnoMw8iagVU+YFctwg8Kdi40U6xCLuZULXIHOHlOEfaVpcTcmssJLY4RoClIYFiXNxINAINS6KMJDrWgb1rIZI8j50wD+Fd0JsbRuJLwNvQjd0yNQ3J3USQgTkQ3qzk6hUhJXbL2pKRqVCQowwoItAGMoAt63sOt6hk4x6qjXo0s7QwoCWpja25ma02zxJ21pQpm5AnEqUGq1IiUaMolOVtQqPGaPYQ68ZgxC333ve9iSe586V5amlrYm5Ezsja3s7Q2py0jc1tSNO3tyBKVrwlJkSFIUSmSpyw/AIABCEOvu1gkk5PnTy8q7DFKYpTFKYpTFKYpTFKYpTFKYpTFKYpXoYWWaWMo0ADSjQCLMLMCEZZhYw7CMAwC1sIwDDvet63rtvWRBIOR51AgEYPcGtePkf9HD4m29N3eaU/Yc+42JpGtUuL3X8UaY5Ma1JWLDBHrBxONyMolbD0ipSYMzaFKt22kiF4U6YgvWga3foPXfc2l2a2mpQw3xQYWRyySkeQ5suQ+B6yoY+bMxOa5+3J8HXaGtXxv9NllsC3nGqh4h3J9BeSMvn5cmVQAqKqgAXncBOkPxb4AOaidQsMks251zOewm21Y42o91Y2VYIO3BngUfZm9tj8IbnTRQNKhpyjF6oIfAaqGVvy9YpvTqbuLeqC0vDHBpaty8GLIDEeRkYks5HqBwo8wuRms02J0n2vsFmudPV59UYHM0uCwznIQAeiCCRklnwWXnxYg5Uc11WzqYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFK//9ff4xSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKV//9Df4xSmKUxSmKUxSteLrRdSyyePzm1cYOOMi3D7GfIuTLbRs1ESlVP0GjDycrRxyMQ4KwpSkbpdJgIlCo5wMKGNtQgKEQHz1ADSPoL8Dn4Nm3d+6dP1S6iW/wAb29BdG3sbNiwiuZowrTT3HEhnt4SyIsQIE0pcSHhGUk5P+EF1n1Tauow7H2nJ4OrSxLLc3A7tFG5wkUWQQJJACzP2aNChT0myuuyppK3gcQHjqPTbqDWHUEhcJxOYfR8SNm93vNl3BaUDA9HBjyebtk3To4q8ylfHFoW8ShIpRALKCYoMCAzwB6517du1x1NHQnRtl2OoWUVnbz30y29hHa2VpccP1nxdoC0qQrLH4nF0cklUUlcnFNj6TrD7ZTfWo6zLHJLK6QoXmeWaRM5Bk5+izMrAZBHb0j3wM5fQH6u9m8t3aacOeVD+nll41zDgT+q7YNSoGt5tur2xe3sMjaZujQEomxVZVeuDqg2cvRkl6e2xaBScSWqTKjVHCnwr+gmh9P5IN97GhNvtm8uDDcWoJZLW5YM6NCWLMLedVfCOT4MilFYo6KnVmz9ZudTsAl6eVwo7N62H2/aO3f15Ge+SdnjOLKy+oN5HXc0ceael9puqTTmcyJSkzEyedpOJ9krocBCxtXnfHZKc5adoagwOhCKSlmmaCLYdB3n/AEv2Fe9S972W0LN/CS4ctLLjPhQRjnLJj1kKCEU4DSFFJAORpnr/ANY9K6D9KdU6k6pGJ5bSNUtoM8fjF3MwjgiJ8wnM85mUFkgSV1VioU6p94WZy9vmQwd9lz5Zzlq43s1qqVqYVrxHIM+um382M/V+Ct7atRsfqW96K2kN0cMS3Ww6MUGC1vzN/YPYG0+inTvTNQ0/RbfSYjoduJNRkmWOe7ij8ET+Ndu6tLxeI+IvECLvxjUY4j4Jbj6i/Cb6yaxpW4tyXOsy225Lkx6XHGZIbCV/jTWvg2calbcNHOPAbGZc8DO7Mwdpir7kvza6YdsQeNcotSh0pGXLQEPURlMva7CMRxokxAW8TKs35I8vTi2qoj7YLOUIBHAQr9BNT+WA/wACgrCNy9Kegnwstnahq3SL4pDv6yjzFc29tJZBpyHMVrfQtFEjrc+GVSYKZYcpJyaPlG/ZvTzqT8IP4Le7dP231lF3Ns6+fBhnuI7srEOAeSzeOWbg0XMERIwilblG6hz4kW1siWpHJGkcUCklYhXpiFqJWmMCanVJFRQD0ykg0G9gNJPJMCIItb3oQd63rPjzPBNbTPbXKNHcRuVZWGCrKcMpB7ggggj1GvsDDNDcwpcW7K8EihlYHIZWGQQR2IIOQfWK5WSqm1rfcgOoRZl7XxckJqW0I/SfGDjPtSTZ1quipyIIkKxDIy4MpXq1sZSOUpckr5OzjGWOsTSEBroYmOVqTdFeWAqb1c6J7h1LZsWlX1zeafJqdvyAgeSKTi8fiBS8ZWTHhEO4VlxyAz27/WzoL8HjpXtHpjou4t06Tcbs627rl4WGmQrExtx4LXXGNLh47WMwWiC6v766LLbh0ghj58me7miJvKT0BrjEbQen52bGJBJjWx/gFvVoY/Ma4Cs9vWMiW2WZtSyTbqS2qRpyiQmBUaIHoJmheHQvlPc9Hes/RPVLzV9k7pubtLOJrj4vJ+kFeSOMPK0SyXYeyu5DHFIyW7EPKsbqrBuOdUdVds6DFdLZ6/oVta6dPdPbCWC/0nUhBMhRXSZtKmka38IyRrIzlTGXUlCM4ydVNY6GzoknfU+yQLCDPRupBIu5QFYSizgHka3vY9JliY4BpehfEPi2He97Dve+5+gfWCx60bCi3LEI01aF/BukQ+gJQquskeSWEU0bpKgbuvIoSxQk8Q7/ANmXWyNwPpU3I27LziZvMpkqVb1ckYFWx2OAe2cCTs3ZWEVhr6x3UYknBuo4zF6fCgMv24dvgIs5uCNM6pK/iEcKS/WScjZlXjSuz3tW5JkLOlUgEjMVnDPO0YUlGnO6G+Dx0jsupu5JLncHL+S9hwMqqSpnkcnhDyGCqYVmlZSHChVXiXDrzp8IfrFP0w0S20/RCg3PqTMsbsAVgjXAaUghgXLMBGHHHCyv6RjEb6eHLJ35BxC12I1+5iSrkhM5ZC4TYILBqi3LOkidodJqWpUoYMYakVN3sqXM+0wf6EiIJL0UeT5RRYtiJL+qPR+z2Xqe35Ug21b6NplvdTW5gvLO1jLpBgNPhgweF8nLuScq3JmGGbh/c+q70tNdgm/lBHqt7cwQzeJb3DTCN5hyEXORVZWU+SDIRSvcfRXNH0RurvdL7ejBwn5XzV5sdssAt3a6VsqbDEZYcWnzAiWOx9YTp4WBIcpI2yBrb1fs1U4aMdkTimCjNGeWpJ9Nof4YXwUNoWuwZ+s/S60isLnTzG+o2luMWs1rKyxi8to1ykLxO6eMkWIZIXMqqjRv4nVPQXrDrupamuzN3SPNOw4xSuSzqyjsGc5Lq5HHkzM3isgXKMRHuAZ8oK7CpilMUpilMUpilMUpilMUpilYu+rX1AxdPTi+dYEYb2p7uGw34Nf1C0PgDj2RG+nNi54e5pIUaY0hUuj8HYG85WYmKGEaxWJMm8QAniMBsLprsr+W+4RYzsyaZAniTMv0iuQFRT5BnY4yfJQzdyADrTqnvz+QW2zf26iTVZ38KBT5BiMl2/6q9h5Ec2QN6JJGo3bsX6srjYG5FefKF1iVoKEjHLEzRJ+eNV1E8NTdLtAXxlZHa3ZbSizYwtDwJRoLenQt4ShG/wAgOhHAGDXT2lzdMo7HwNI09ZtPUshZNOmmUlOzhpDC5Yr/AEizE47nsQTx9rK9YJdQ+MazqXxbUnVHCPqVtCyhwChjj8deAfzAjUDOQACMDPN0nue3K9k5JyjpodQvSpwvhgiQJnWk0eXBhd5iqRkx5tl66AT56ipqhikzmOEuhT02OYdgWbTkq067Zh5ZQs0t1J2XtuTQo9/bHIGiyScJUUMqA8jGJI1cBkHiDgy/RyVKADOegulW/wDdC6/J056gKV3DFHyjZmVnPoCURsys3MmE+IGJLLxYOzF1VNhCa2NXtatm3uxp3DYAzBJXKBO81k7JFWzRDYkMXuR+176uQJdEt6EoRx4vH4Sig7GLsHW960SqsxwoJP2V0SWVRliAKpprvmjXt9gsXZbnqh3ktoRnU1rOOtdixBe+2JDdplS3UtgrQkeDnCXRnaNCeb69vLUJfKJGLx+EAt6iUcZJBwPPt5ffUOS5xkZNVfqbwsSUS7Uvi+0QJRqEDWaf2naUE028BjuogJRpX5QZRuQDCh9n736v1m9E+X5m/DkOLew+WfwqORVl53Uu4imkqVEcsUmbEMvKhv4fzY2Kba1YK4tJeskqDTxPhODs1hYK1IWRFwL2/wC9mIzxJjNJ/O2WZoE74tL6xj0OQ+0fZ9v2VL8aP1HPpY/H/wCn21dtG7cqiZxqLTOH2dXsrh84dBMcKlcbmkbfY1MHsBjkSNniz61uSprkDoA1nWB2nSGnHaElO14e5Q/DKKsDgg5FTOSkZBGKo2dch66gU9qGuVyhxfJFctrO9MsuosUgekkXnDLUcuu1UinphbkSfGSjIHDjjy9CKNPENUl3srRJ3nBisbMpb1AZ/tx2/E1AuAQPWTj+zNV9GLLribaRChlgQmXacmU2SN24xKmJ/wBL48Q6qmI5+Rbal6vSplJfEJyMSoHiICrJGTsXmBEHUCrL9IEVEMp8iKpeRcgqEiCSPr5Zd1QxdDLQMZkVWyKyoYyJJMXJ1KhHGjI+pcnpMS8gkKxIaUh2mEZpWaUMJXjEHetAjnOATj7KgWUeZFd/G7Xq2ZSyYQOIWTAJVOa8NSET+GRuYx18lkGPX+dpCTMI62OKp4jJq3aYzyQrSSNmeWLw9/DvsKMAGIIU+R9tRDKSQCMiuoi170fOXRzY4TctUzF6ZX50izyzxaw4jIHRpk7GkVOD1HHNvaXhWrQPzOgQnnqkZoAKE5JIxmACEAt6GN17sCBj2VAMp8iKj20OYHHaqKvkNtu9lsMqjTBKo7XZLbWCkq0JfKbVmhzMkglQQqIQcx6fZTas6WyNuKaWJKSNcq9cSb4AkC2aH0sUjtwA74z37dh5n7hUDIgXlnt5du/f2VZcf1TDoyvnr7ZPF+bRSpKm0nX3XKYpc3Hu57U46xNSqEUbOuRHHmorEltjV9FI4iIPWvxiD26rZUSRSeen2UmUDLnfFcgcWHM+XYgH7ASMH+ypfjYJ5D0R59wSPvA71kUfL1pCMOsOYZJclVR58sRqPfa/Znywoi0us6ZEyTS9S8Q5uXvCdXJmpOhFo4ahEA8kBO/HsWg/HKcI5BIBwPPt5VNLKMAkZNQXY/Pni3WkitmEONms0hsWnuOCrlQ+1xD17S+TSRVOnYJxJyVMDa/aaUiXyFcw1+tVlt6Y7zQJDkak7ZSZYnOMmLBKwDY9Etxz9vbz/rryZUBIz6QXOPsqYYByJpCzYu9S6H2pXrq1xFoa3ewAJZxEVqqsy3Zl0/kI7IA2Pa8iFuBDX4zTS1xhWghKGLW9gDsWeGjdW4kHP9/3V6DqRkEYrjXryGrXj3V9lWpNnI5xbatqyVXI+xaKDa3educDhyX1Lw7RyMqHNvNdSQjGWQA3ZhSbag4ssRodj13JG0jBV9Zx9maM6opY+QGaroiyq/Ojy6VjmcWSR9pcwsT47LZCzpUEfkW1yRqMjb+sMXaSM8hTu68lGYiPGBQBWaEnYfMFoO/PFs4wc1HkMZz2rpVN4UsjnDrWKu36uS2UxJGpe916pn8TInDOhfTm5MxrXWJmuwX5vSPKh4SFpDDk4AKBqiQl7FswGhR4Pjlg8fbioclzjIzUIxTmbX8zeCSWiKTNFD2+zOTtVzyyZQtrmJRCtX3ivJFERmLvKS5BP0MlWROVPyM4tmcGpvcQBLAE1yC3AML2KYYWUdyORCkDvk8vw8/v/DNeRID5A4yfwxUu3HcrPUcYeXYpmWWBLGtqQvyOrYrJK8Zp8/sKiVx6JOD40EWPM4LHQtDEtkhA1ahU4Jita7EliMVGkEG+EQsceQ9vfH9gNembiM+Z9ldoG7KZHOW6rw25WIrLdzntM014GexXc5dFEZJMUSQhuiWnbb+tOj5BQhrglJxCSADvZug61veocHxywePtxUeS5xkZr4O160gwTNwrh9uSqmWw2llTSR0gbtYURbpm2x1YenTJH9wi6x4JfEbKqUqyiy1RhASBjNAEIt7FrWwRyOQB4+3FQLqDgkZrv7AsuuamjZ8ytSfwms4glUpUSmVWBKmKGRtOsXGeUiSHvkjXtrYSpWG/ZKLEboRgvgHW94VWc4QEn7KiWVRliAK6mXXTTlfwlqsqeWzWcJrl9007ZJ/Lp5Fo3CXjT8jE4se2qVPLqiYnDT03gEek8k8fqSdbGX4g63vAR2bioJb2Y71AsoHIkBfbXEml80bW7OkkNiXNVECYF7WgfEL5NLEiEWZ1rK6qCEjW8JHN8eEKJQ1uStSUUnUAGIo4wwIQC3sWtbisbscKpJ+wULKPMgV3bbadYPU8farZ7HgbtZ8XaEUgk1cNsvjy6eR1hcwITG57fYglcTZC0NDgW5phEKVCcsk0KgrYRb0MHfzxYLyIPH2+qo8hnjkZqgeUPIWGcUePls8iZ+UrVRaqIgvkyxsb9g05Pq8IyUDBGmwRgRFFucmkC1K3pxD15YDlIRD7B1verxt7RLrcetW2iWWBcXEgUE+SjzZz68IoZiB3IHbvVj3Lr9ptfQbrXr7vb20fLGQOTEhUQE9gXdlQE9gWye2a0+GOW9TzqU+bf9icznDh5TMsdHr+FkRhS6z0EbEjZnVczCMaIlT+kkqcIq1OqNag3LJKvFtzVNq8aUr0yM7ZXUElt0/2F/6FsdKXVNWiVfGeQRFssA2C8/ohypU+FEvohk5YLjlyL8d6idSCNev9Zk0jQpnY26RPMmVB4g8LcMeHISenKSQVcB38N+FyXDzn3zU4G8rqn4qc6rLHffH6/l6VlrK6nZyUyB4jzg6SIcHZn5DL3lG1y0bGgmxJLNJ43Jy9u8fErTLyDRJDA+tsG6dl7U3jty53Hs+3+Ja1ZAtLAAFVgF8RlKKSmSh5wyRejJgofSzwyXZ+/d5bJ3NabX3tcfHtCvSFhuSWdgS5jVjIwEnoupE0c3EooMihQFE23fnMtdZVD71fNWRy01FMv8l20T5PUD7fAm9e1PBDYOrYtIkMWlEkJkYkP1fO3HHl2RAWpAqdrE5a0g0RXlGhHtSreDOpFw81S9Tcg0loq3ap7tq2d3bXklZ4JYDkc5VPVzS2vljztzYk0YG/xxjg7a7phuW3BKmOTiOCDwbH3DpSpWfOXfHSN2tZNKPdmtCCyKgoJHyfshiMRvBhMWo1c6SRoJnS54IbjWUxMFXE1uxpCVBi8skBZwidFHkjGpUaOnUU4hsNOXDfUgtIbDWlBtNYv1surtDpsldIkzXLDoRPaycVEZ3HhSRcnlsZsRqNI2lSn7AcaanN0WoTKCylKuKY7mrmTWpKqZj7/p4n0IgcGsiVoG9CvUtjLFLLcpY2QVSrkJSYTD6+SGwZ0NTowKBK/SpvPEWEkwoY1KtVsvqb8OakklrMc0sKRp2WilC5oue0GarrNk1KVfM0DGlkZtcTW449E3KumSxvY64gYmcxx9WSoPKSnBKVnEkDUrkt3PGKPvLh34mMVbWWsXAoGvrvjtpfUqaCr5y/iCGfrUTQ9ugYsBqibEjaYcn2F7Wry0Sp1WGtQNAXIzSxMYpUacNup3T/ACOhnGBBNlSiF3FyKrpC9MoEUDtBFRsptBsjauQWPU9U3RKIuhg84mEEJalxihuTuRysxOiUGEaPCmUbKjilXSLuYPH1upR75DrJucVUsdshXUjvJvq1KBmJZ6huwHHhSy6ZS2cT4cEu2zNNnqS04k2w79Tozab+dkKVDVLc42OW2fZVWWuUzwh+BzTtvifRQmhHJ3BtnyisKSh117Jkj6ahNY45N3SOOD4oTpDT05K1O0CCl8w4IwbjilSPPOc/GOtma236V2GMhBS1rxShZYBqi8rkTk8XnN2KKyKM05XLMwMrk72lZTg3TZr0JpjxDkqTnKdlHBLGQp0TClUUydSfh86IbTVOtkO8DX0ZBY7YN0Rey66sav5rVzPLpAtisWbZdDJPFm+SJZXKJAgElaWkhMoXvBhpPoSlIVBGzGDSqijvPvjA811c1lvs1eaxa+OqpnRXpGbfgc4rOxqwWShvbnaEpZFXMqYEExPUWG2vCIyOAQo1gn41WWmQ6PV7EnCpXXNPUM4wK4fdsvksjmtXD45Qcuz7nhlxVTZVV2VCayVFuxzdYyivJrF2iVO8HdCmFb5Dm3plaTZyQ4gYwKSTSQKV1KDqB0JYCC3I/XUzXRaxYPRcsveKbumobihUXl9ZMrWb6e54cmd4xHXi3KhaXw5OU5qIwYpVlgNKBrRYlaIZyleDeetQQOvePRlgSRws+3Lqo6L3Mlh/GanLksp1f4ccxRlRKrcY6vZWCUWXC6dA8SIoKJRIiyVOtHlo9iPXANL0pXcPfUU4htDXx/d0NpHzVNyoaHJ64+kVpB59ZLnZyRkdYwzyAplaIVGHt0QrYutlib2wQvKSGMwClQl+k+kanZSlcWcdRribXdiSGvZROn9MRCJzHKusq0UNc2C7UNVFny8xgJjNd2jejZG1VXQSWuZ8qbChpnB0J0gOXpy1okxhxYRRxSuXaPUN4rU/P51Xszmsm9XUTcgdLzl0aq+zJnWFApnliDJY8Vd9nxSJvEGrVwkDEYBWnSOK4pUBIcQoPLJTqE5psKV2e+e3GIU4ous0czkLtYHJGt4Lb9OxJhrWyZA7SWsJ+5pGpsnbh7Fii5HEIwynLyDHlY8mt5LOScAaoRfjBoSldWn6h3FZVZSWtyZpJdlL7NPo5vtUVZWQXQDheid1UsZtLob7HFg1SqsbT2jNbwowOuyzHcsTYA0TnraPTFKme+eR1UcbmGOPVnPDuWtnEnTweu4XEIrJZ/Y1lTdW3OLwniNfwCFtb3KpS9eyGdUsOCmSiJRokxypUYSmKMNApUQk9QXimdTay7t2E4kR5vtIFDL4aqgs7T3Mk5AmKkyEugjKRNjobUFchqhWUMDCBpEsMRDCvBoTfvSvbFK4xHUQ4ngp60rukVgusCiVFyqKwm8mWxIHO4TY1OSibOMXbYu2WLWL9HUc7j4HwUybT0aoSAaNYjUaUJzTSQjGFilUqPqbcWtL5PGSh3cps+LnEnjo5Pxtvgd7yCKKgKVCOzIjUAq/BOZNU6tCjON1JUqMbOWMvaY08C0QEwlKu/qO3K2vmtIXcVQS9pntaWExppFD5ayjP2gd2tTsZfi8lWSmXt65GpKMTq0aokhYiVlGJ1BRRxZhYVKkbFKYpX//0d/jFKYpTFKYpTFK0k+uxXMjifO6Wy17RHgjdx1pAX6GuO9D9IvKhzERBpS1EqNfy9ODMvbiTzydC8wBLiSZvXhM1vf2r+BFuPTdX+D/AGmkWLqdS0bUruK4TtyU3EpuoJCPPhIjsqt5FoXXOVIHzW+EjoV9p3WKfVblW+I6laW7xNg8SIo1gkUN5c1ZOTKO4VlY9mBPx5Hcr79M6CFBNf1yaQN9kXbOeKk0IKh8SLNdKGiTJYrKwxAgZTaA5qc0zfEEATXlPoDqeIvZhpwhnDGPXWj9N9lw/DK1+dLWTxrLSYNXhJnmITUJ5LaSWY5ch0LTyEQNmFQQqoFUAb80LcusT9HdIV5F4S3L2jDhH3giWRUTsowQI19L6Z/pMxJJtE+jbU5MrA6pI7WY0qrUJ480PYymwHkJZvs4h2tzTXEoHFTlIAiJ07PYG5zciiB70LaZpGZ93h7yPhna9YaZ0lGi3JX9I6pqUIhX+kVtuUk0gH7Kco4yR/SkA9uNy7BQtBzH0VjwfvJGP7j/AFV+hbnygrZFY7+qDDnuWcU3payJzleoRLY3NXlOnCMw3bCgLc2hyU+UDQhDJbAvYVZ2+3YsggZm+wQb3rpj4Jeuafo3WG3gv2VP0hZT2sTN2HjOUkRcnyMnhGNf2ndVHdgK4H/ykezdb3b8Gi4udFjeX9Dava6hOiAljbolxbSNxHcrEbpZpD5JFG8jYVCRY/0/+YlJ0xRTpDb8n9esbdF5Y5SiBoRJX52mwNrxjWrCD48giKkk1UldNmnIVqdaoUGFq/K2AvROti378JDohvzfXUKHXenOm6ncXV3ZJBdvyhjtfQAVSJnuVIVo+KyxPEiAx8wzFyBzp8Bb4RnTnYHRWTa/VTVdIt7TT7+S5skEdzNeLzPJ1eBLNl5LLykhmSeSQiYxlY1iUnDL1EORa/nHyNMf4LGnbTWoa2GnKfjJyUI5O+kqnhd7ONWIUoztAeJXKpGaItMEQxJ04iSxb2MA953T8GXphbfB+6XjTtw3cPxtZptT1KcN+ohKxJzCs2MxW9vAoMhADuHYAKyitK9berj/AAhutUOsbZtZzpkYgsrGLGZpY45XZSyqSPFmmmkKKpPZ0iyxUM26VU0VXQSq60hDooArc4bX8NiriqKFsZaldHo42tCtQWMXYQwHKEYha3v471vPhJvHWLfcO7tV1+0UpaX2pXVwinsVSad5FBHtAYCvubtPSp9C2tpmiXTB7mz0+3gdh3BaGFI2I+wlSakDMcrIK0bqKZJhTFwc2+ObmxRJ9vditSlpbBausV/Z4mxXOqoHlMmul6hSOQypS2x4bhY9XuSdybSVBxYHZKabonYxg2Df1e6r7Y0HfWzdp9QbTxV2bd2E4uLqCF5zaC6074tDLJFCrycLa+jeCZlVjC4UuApBruLaPWf48ujy3l7d2dha2uqWc09vyaezXVNLfT/jCKnp/qSc8l+geJ7DuMlDTKp1VD+gndjNd0MFbMto3hyQmFicqLZo+SSWKus0puaQKM8fKWYa0s+dvcq1IJVKUYjhlEogLjUSYYEKQJBg9/NbfnTLTNSIiga2vp4lZY/AhuuI5wvDJLyuYIvCDRu2V7qM45N2rpTRdR2r1U0GTbO2v0AN73mhaLt6003b+n38MN1HaaxZ39xrerz3NpbwW5trW2lVOTymJZZla5naVUGRbpKSSWTvj+9TyQpDU7c7SJIwMKozxbA8biDUU2PzkiHvWgqUBb8acjCcHewmGozNa3vw98496BdCfkPvNx2tvIf0VqV7bvDEfKNYYSjED+jyLYx5egMVzv8AD/0jb22OrVrtfRZFe6gsmnnUYzD8blaSCJx/RkMASYocFVmQkelWVPOja4RrUa+ksVhLATzj9cJSFUqhjxXExqTS0gswadumqF2Uy5ubVRuteQmVSVncFAkuhC1s/wBmHa138Gd6fA01mxNrqegFlGoJdR3OCe7RMojLAeZEbKA3s8RfbXz9+GVoV9HuPQ91EN+iPDWB2weEbxSvIeR8gXWbKjzKxyHGEJFJ2/1C4FVNRcxpRxi5FwljvV+459N+LU+sjqRtd3xzlVdny5kuxsjbc/sC9nNfIvG5CdpeYcT3TEqd7AMJ+geHYmyOimqbp3TtXTt+6JdT7Ni1vcst6sjMkaxXCwvYtK0ciuI5ZY18MK3pMuGBTObiepukaJp+uahtzUoI9Wk0jbkcLKpyWh8ZLoLyjIDIjnkSBgN6J5YxBCoEU5l/SHqXnvGN8jFgwpJIqTu+aTqAJzgRfSeo66blVmPzif6NJtOpWSJIjZjDDwAGeuXkEi2I0W9Zu6xm1HpD8ADXNF6jw3Fjq8lrqGm21tckeMWv7p1tIkHJshYme4AUkLHE7jCgGr7AtpvDr1Dqe3XSa1EltNJJGrBf1UVtK5bKgqGMUgyQAZCAfScct4jPizXalMUpilMUpilMUpilMUpilMUrWz+kxcf5zZfFKqrliCBS7s/H+eSRTYSRISaeazwyyY2XHBzVUAoIxBZoxIG5ABeZrW/TJFo1AuxRJow746Ba3Z6fuO50u6YJJewr4ZPkXiYtw+9lZiPaVx5kA87/AAjNv32qbatNWskaRbGdvEVe5CScPTx5nDRqmBk8pF/ogkYh7B51cdp3NJpP2nkVOWh3c3dLLOPL5YvA1ot20uED26RNkYpqVxzslXe7ajTt8iWN5yxMQtb1LayuJoXVpSoXHxnD2bZ7J121to7SaxidVUpcCK/aGK9UMxT4xF8WY5UHBIYNIuY5WePCjU9z1L2/cXD3VpfPGj8XiE1gJpbVuzN4Uvx5OxOAF4hYuKywLDPykaeemPGA8vOr3F+QtSrLFldL8YaMr5sm9q2IzqWCUSicMnHpFR7dqSkHvUpMKk9iSMxzfPTKHNWrNbkZh5w/EMPitPUG6/kx0xk0HUlgj1XULyRkhibkiRtcm4IT0U9CNOKZCqAzKAMVX9MdN/lb1Zg3RpjXMuj6ZZxK08q8WmdLMWpZvTkw8koZxl2LKsnpEqwGyzys44uN68i+AkqcK5ith1lRdw3HPLIBLdR1egjYX7jVadfwh9TRx+80UgX6mkpSEFBTEnGIxG+q3oOidGA5WjdUjceTkDH9ff7u2f7q7NdSzL+zk5/q/wDrVhDR035FFahvdFFOOlYstnqOqzEOTtFOTWqgqN7i9KMfJqnZwZJ4VJ9HeZXIUtatsnCBgSnIxbSrVaEKXs4GlHVBuAzrljx8IqfPz4kfj3x3/wDpUnwSFOAOXiZH3ZH/AJZr4u/HDlg3GyLju1cZEr/ElfVxhvOAm/0tm1s2V2bRz/yzjvJx/cyIu5OieyBXLBhErGdUzCaQJFJyQDilcztHlpcCWL/OFu/glcYOc8eP3YNCjj0AO3ics/ZnP9ddQZwOuNzdpnXznxuhu4iLrIQbmU5SvT1V/wBTLY42uUik0xLMUsxC1NJlkhqZ7NKEvYntuBo5YeE5uGtLGZsEfHQANyOfBK479j/9/aKh4TZIx28TP3iqttbhZdUKsa0rLpWhos7wCvupVxr5r1tS0PkEDhptkRhk4osNJ347Vw1LVLTDYZaJsxfHN59O8HMxMkVtZojFZRrjpWKCzoVCux5GMqT3OPSyM+0f14qLRMGJUdg4YD29sH8ai64eD/M7kwwWgsaIURxfkls9R6R8iEwnGyWB2cCqIS9Ohq4/Es1nPlWPxMkj5F8zCPGQeTBiDidJY0xPpq1uVnem0cOKzQx8fSLBYwOw9fPPrBHYd+47/YfKBjkfJxglyfP1ccd8f+X/AO89xusL5qC9KJ5J1pwHIYIw+8BEfEZ84x1vYlGxtXxhnEJs5RO4tHRvu3hggUgol0KdliEl3jmlC1uLQplO2QelgyUvktG8bRNJ3EnLJB9IYx9+fsP9ft9YcOJOPmuMZHY5z/V9v9nsjjjp03pg1w5ob73461Q+PjX0deOPEJMU9nQObImq5Ie+cinayK0ZDVWlIEsYTHzZiGF2AWQiX6EDeh+JOMJfqS5BOVY/54t6x27YNQWEjzAP6sD++vOum9bbfWvBGL1TCInRNlxLpwcjOLV/XBFXxnQSeEWZaHG+rorD1kgf424ESy2wNV2R5U8CcClK40Dkk9o+fo4/Rw3xhCzlyWUyBgPsBP8AV27U8FuKgdm4EE/aQP6+9dBUPEm31t49OOUtPTpr3iU2cO6u5B1lassZZ5Ty8JzjNOPP8P44xVOXBnVY+WBUkglxJKzTzIiWx+IPCV57YSI1wMCeVOEg8QuXII7H25759f3dv7KLG3JCF4hc+z2YqIrI44SHhpxN6WMfcm6F8UGmpKtuGtrPsxo01fwv45837s4iOVKUbyQt56iiVa2HtbRY7q6sSiaKRmJkjnIkg1CoBSjRoPYkWaWU92yQQPWVDZIGfs74+yvBQxxoPo4BH3MRgE//AF+2unQcWuSDrEOIb3xz6f0Gqk+r+I/IHjE+v7dd9DvCKxLFv+rYTEiLAsGZQaTuh9rcT2WTsbrK3t4WHrrBkUl03qAR0tSatP3EyxhmEkhILhvI9sHyAx2OO3sA9fsCNioKqAQpHmO+R559nr9p/vk6wen7Z1YxTl1QrTwvhXM1HyB4gVHQtEX3JZfXbCGCJ6j4mtPH0uorcJsJ6KmdcQtNOIwtnDO4wsh40odJitAcWjWEBVnS/HV+L8uJViSvfBy2fUD9xz6h6/KvYiZMrjOQAD27YGPX/WMVXck4T383M0zY2vj2ySeSWl0Uorw8b7JbZHVDU6wDktXla3exq4zKXFe6tsnStU8LsFqakL4xHOCAsSIYFu06YpMduAnTkDy9ETFvX5ZH/wBzQxNgjHcx4/HBqu7V6cMhf21yiFSU9VVbIrB6P/IXhjL3pB9XGCPiuKUip0FOxybtUdINc5VGo0NDKDCHMKVcFsKVrNFC8S7YDYLcAd3JOJg34d84/sqLQk9lAGYyPx7YqM7poPmZypXXNM1HEJRSq146R13cSoyxzW46cf5G98gJ5O4U8fUlAvhsjd2lHXhIIeIaCQrFCQDiAwJp6NBsIAGekkhiAUPyHjBvI+QB79/X9leXSSTJ44zGR5jzNVc+cfnSSdTU7jsj23LuPk7BTfVE5LRlIelTJ2PkHT5KWkaxibmxtzXtuXtV82DA2GfmHqTfEodqpcBiAMSzZmQEmLfxP6YygP2Huf6gSPxFRKZm4/0ezEfaO39+D+H9cLL+DV9lVw0cd13B+D2HakN6iUA5SOvO91nFSNwbKgqfmnGuQTncIVKhy1cqu/SayJOjTjGHREWykFNmikjkobdNqIfvx4+XiByFMeOOD29HGPZjPfP/AJ5qHhNjjx9Llnl2798/fn1f7gGa2/p72hO7dgiG5KsZnOk3i8essO2fMl0XVnDpbm0/Kk1a+WiTrDnJTuw4usH6pKQAR7WLQdKwFiDrWvBuFCHgfT4x4+9fP+qo+ExYBh6OXz9xqJ3Tp+8vrP4rcmjrvgcZmHKpTCeNPDamC1czhryXMeOXE26ozLTblMmi40gqOOvJp404Td3Y3EQFyE1E2oj/ABqExeg+xcQrKvAkRZZj28iwxj/2fKvJhkaNuWC+AB9wPn+PnUz66f04TVzydkBFAVydfkv6tEX5e1ZLvXQUuanVux8kqJkYrAQz/ZvtCKveqXiT2iE3iUkrTW4RzcMoYVgyjfHjryUcjw8Lifv4n1evvj/cV7MTFT29LnkfdkH8PX/uax98togyMnHLmFXKvjjSlpydy6mzLJT+Zkasiopg6uUzmvNerbCiVdv0fC5G8hWnltV8Se2uCIYMFn9jqWZmRGkLwtCnSIM6P05EbJC8B6JBHkvn7MZHLPnn7e9Sn9FGAAzy+kMes+Xtzjtj2Vl05KwW6p/e/HvkTIOHiy46/wCOMt5QVyqopTOKhfZa9N8/QwNBVvL2smOUSlorRxdCGuHuzGJkfXRrkTUzy5WaTrRgVCZTSxsio0YfDMFOcH1Zyp9frzkdsj+qe4YuH45AyMdvwPs//eoZN412PA5ZxJvIfT7gshrSA03yQrl04KVdLKakqXi/PLvtdlshktGsw2GOuKfkbnJGBrUxyWgalKH6uhdBlMg1zQJf50zxFYOniHkWB5HPpADGDjJ+0e3198V44EFX4DiARxGO2TnI9X2V1/ETp1yuI27Rr5yA46UyKuopxO5aRIiGicYvaEQotz5H8zW69IZxhiaCQNZB7zF6mp44Eb05pG4pm8prElR6KRDIJ3CWdWUlCfE5Dv5EgLgnP2kA4qMcTAgOBwwe3q7nIH4DtX04q9Pmd0nXfScN/gdB4ba3Gme2oLkBJ2h6iauXsFfTWk70iO2dTOU61S8WIyvsod4mWpby1a0PjRo1Aga03FjJjLcK7S9zwYDH3gg+Xq9f+5qEcRVY+wDKe/3YP/2q6jq+0ROORnTw5F1zWraufZ0nYWCeRyNNwdmrpSprWXMU7WRpCmDoRi1yeWtgPJRkA1sZ6wRQA63sWtbzHpfrVpoG+bHUL8hbTm0bMewXxUaMMT5ABmBYnsFya191f29d7n6eahpViCbvgkigAsW8GRJGUKMlmKK3FQCS3EAEmtW/iTYPG7kDTNTRiSWZRNa2hV9eRysJFHbzj1PsCN2YYDDLrruPTiOT21FSIqZNbvFLhErcGYJpLgxujSuQaTmEu2jw9DbjsNb0XVbi5t7e8uLCedpke3adiGkeCRkaOEExlXh4q+CrrIrFgYyp5k23q+i69pEVpdXdjaahFAsE0VytuiYVZ1V1lmbjKrrIHKZDAwHClZlZaCsZmiXLnlpxL4e8V1jBPxtt4GWPOrDgETYmSHMxXo6cjkpWNTjFUydtlMbgNbUiS5ukgCAJCt5dCWxKI/aMow6tsprnbO2tS3PuMPBytBFHFI7M7YMzrkOSUaSW4Max+aovNscyFoLqytt07q0ram2mS4MV20kskSIkcYkSGJsFAFcRxW4mZxgvl1UMERn3+c4trvWsb/UN4q2xyLQVE60W5xxjnbQ8y2mrCd5O6rGxMm4rckGxrhnJIxiLRNzgJ0nbVHmRudGBMbsggbo3FeM0v4DCpUf01wFkDTdPKRstlNEVvFxzgVpU3xbh8YW7TLWepeWT2ltPk7HZFHC2dI1xQKKxEidoYQojlIBsSMvY9Fb7FBUq0JN0zuXjlTESSSeSVdu8bEsWRcf+S8ian50CkcOnw/QeD8fz0zK8qY+NykdnBqSlGJ+KbFIU6AElkLuLR5e9+MbtSr1r04PSOyuZFdzdsZa7VcVp5CY8j5WwpxGc3vr9K+PCWfg42FMTMlbT2t9j7p/GR1TvxZ5qbZCaOtWivH4daLUrg8L+N/JvivTMxdpHGKps7khOrXrWIvJhdgP0ajmuM9NhiFD1o5Gyc+ISFcsm7DQUWOlSht9CWQ4St1VpNqiCzvUlv7qVAVh8Wedca47c0OCdRVlx8nlXcix8uZDVnI6e2I4Mp0SauVbxOp5JIHcNPAhrq7TaxI7MrAdUDS/InX2SubBtypeAk5KpSKFKukjtCcgIHyug9itsUh8nq2e8J6v4xWY8DsJQ2SunZbUDra0vSyNJHVUZPS2hHJkusUluBtMtbFiA1KYoMLMLN1oClRtHuF93tvEjpW00qRQUM44hXHxkm9wlESQ/2IhYapryaxeXjhLmFgKMf14Fz+QWlKGQh0pIGZsQwa1sIo5pUFWHxJ53qKQtzhVDa1o15qp55YpeQ8Q5CvVuu7K5vNXyDmhHeU8irp0q5PB3JwbLgjZZ7k1p3D1wo6tSo06jYi1B5iUtnvmldjyeo+Q0DxE6hV3WEvhUemMU5uqOf3FF49W4SApRYEHbqOKpGIPSNKlal6R6uaeQ5TBVrakEpNObZMMoowZijQAs0qWlPCi8Yfx/4mzmuU1fSnlpQF/ynmRZkKnzmYxwS7rZvqM2u18j4duaszQ+CikgITXc7J4PIjUDiQ1mtDanUlehGcMuH91KoaY8V+X/ACBnnLe4rUoLie2/x24cUvR1e0JYs5lc+ju36q7fs6wnBnvGcQVhjTic6OgZsFQxv0c0P6prApjU4Fh6Y0w+OceVKpoHCPmjb1EXPHJy/uEBEhurjJePE6mbU5GSq5pXCJBx4miKfSyLT3lLFmBDZSOC2m7NpCdh9Oqf3aFnAE6EqTjDtNidnBpXwk3BnkBddO8xHeQUbH60ui0eJkp4xU0O1+YdvcnLEWo5g7GyaXt8ym0kAsrqC1k4vrazibkbU2OLqI1MpUqzywnFoi4ZpV3vMXi5bd3WPT0qgieJmoIVxX501E/HPj+e0rQzHkHXVWxuvE6EkhnX6Vsal6h6rbkfsZe0gCyTAlHb3rQFKhqvePXL3iW/VPa9UVVWXIN2e+DnFvitdlXuds/wykEHsDjail6iPTOurFeYfIGOQVi9KLJeUb22nI0TgWemQOCMCnZipMBSqo42cKLup+3eL8+nLlWj+pisf6h83vNwhCl5bI6yXFzevuqLx+qNRR18bzHNRWkYUx1zQFrVZyJap9MUrPTBOWGlkxpXyhdS85uPyq2aBp6ruPE/q62ORlrXbGeRNmTZ4TooHC75s9wtazYda9FtzHqTWdYccc5C9N8eVNr6lanZKc1jcTkG06sBjzpVNOvHfmjUrjzZpaj65oyy6n5ozu4Lhitz2XYbhG1FKzK566b47NoncFYooW+OlsRlDI2YJsfUM64k01rVlti4CUpCBWoDHrpUicSuIlu0vdHHuay9NEwRmselnQnER/ObpANzei7drmVku0jTIU2mRESrifs8nWynAJpW1Boda2mBrWt6ZpVn9X9OO8oY0w/iRMqtbrR46xS3QytxuCVc0b9aq5klWN13Krqi5afiJEFDO3tl6sC4LeQEna7UQE7IBPIjTPM9lYzSr075q3ljLrWpLlLFKsqp3sHijavIiMRKmFVrqkyS7OOlxxRkiyWaorAcICShqy7kayOoFxbSpRuDV6LS5vG5h2rAqIhSqbsCoObVkIaN5Nule0Az8iuPnJCZXBD+OTXOZEGJSempvScjol2gM4uUxhPRKuRSOMSpU4t0lTMpceSHlFM+yzEQz3QcaVFdg8PeVXIFl5P3JOofVlaWxyClPAGPQ+kG6cGSZvhFQ8OeSKC5Xd/sm0EkZRtUutWVilEkOTpW9tE2tqBI1oC1h5o1SnQdjSr4R0VOhdRBPyZ0ljn8MyuF6yihLfaIvrd9ej7wQz8tLpp9m+Dcc9gJxD2p9Z39T2B5P/b1CldpwZpic0Bx3bq1sYliTypPbHJKZHlxtyG7NPsi0+SFsWlFzC1hje1i9adGJkjGrK8nWiFYjStCM0DRglKu8xSmKV//0t/jFKYpTFKYpTFKti5XcQaM5n1qKsLyjR7q2pVvtaMyRjXbZJrB33yRpvbkQkRRR5rYtGnHss4sYD0isrflqCTQdg62X0t6t736O7i/lJsm5WK4dPDmhkXxLa5iznw7iIkB1BHJSCsiN6Ubqe9YhvTYu3N/aV+idxQl4lblHIp4yxP+1G+Dg+WQQyNgclOBjAK7/RhoG9yDzFnNe3C4VtXo0UfTVpCAv+kex72MhO/qHRTG0y0ZW/D6oLB4++978Px7b7EuP8oHrE9iUXaemLqxX/O/GpzHy9pj4CUrn+gbgj1ZrVGi/B/stGuhImq3ElmD2QxIDj/tciufXngO/qx2rPPw44Ucd+B9REUzxyhe4xHDnI6Qyh9dVxz7OLClqtOnSrphPpUsDpfIpAqTJCitCF5adKnKLTpiSE5ZZQOLOovUrd3VPcLbl3hc+Ne8AkaIoSGCIElYoIh6McYJJx3ZmJd2ZyWO99N0200m0Wzs1xEvt7kn1kn1k/gPYAO1XYZgdV9cdUlSrkqlCuTELESxOclVpFRJahKqSqCxFKEylOaEZR5B5Q9hGAWthEHe9b1vW8mRSy28qzwMyTowZWUlWVlOQykYIIIBBHcEZFSLq1tr22ksr2OOazmjZJI3UOjo4KsjqwKsrKSrKwIIJBBBrD3dHRtp6wH9W91tYslqJK4HGqFMZCyIZrG0ZpwxCGBhIWOTI6tSP7X2SBq1BRf3F6ADsAPbWxPhxb423pqafurTLTW5olCrP4r2s7ADt4xVJY5G9riNGbzbk2WPzk35/k1eluv65JrOx9UvNvwzOXe28EXluhJJIgDTW8sad+yvLNx8l4rhVljiZ0sqE4uS1JZqhwe7ZtVsCeBhlkvToEbXE9qiRJ1KqJxVvCNE3Op6cwZYlqg5YrLKGIBRhQRD0PDesvwu+o3VzRn2pHHb6Ns+UgzW9sztJccTyVbi4fDPGCA3hIsUZYAurkLx3l0O+CD046K3qa9FJNq26kHoXE6qiREjBaCBSwRz+3JJKy5PhlMnOTTOU66wpilY2Oc/S345c6jUspmQHqv7bbWopjQ2nCANe3NxZUxxh6JjmrA8olzBNmduNPNGlCrKCqRiMF6dQUEQwi6K6LfCZ6gdFYH0fTBBqO0ZZTI1lc8+CSMAGktpY2WW2kcBRJwYpIAPEjYgEXDS9UvtHvFvtPkaOdT6iQD9+P7/ADrH7Uv0dikIbLUT3Yt7zawI4jN8w6JReERmq/bJYd99I3eTNK5+kJaE/WvCeFvObzTCxCDo0HfvrYPUP4YOpb20t7Gy2/ZWd24x40txLdlPaURkiTPsMgkAODg10ftz4WHUraVgbfQDHHe4wssjPMEPqdYWIiLL5r4gdQQCVPlWwLD4fFq+isfhEIYGuLRGKtKJijkdZUhSFqZ2huJAnRoUKUnQQFEklA1r+3Yt9973ve973xzPPLczNcTsWmdizE+ZJ7k1ztr2va1unWrrce47qe9129naaeeZy8ssrnLO7tkkkn8PIYAAFSZKq01El5UXVfJCsZNT9zxBum0AlaYslzZ1+ziTSVKYwKhvd2hxSGEOLK+tKsATki1KaUoTmh0IAtfHvf8AbO59c2drcG4duXD22q27ZV1wQQezKynKujDsyMCrDzHssW5NtaJu7R5dB3BAtxpswwynsQfUyMMFXHqZSD5jyJB13Jr9GUqx4kqpVDOWtmxeHHKhDTx5/ruJzKQoUYh99IypcU8RdOpGWD7ITj2s0e+3cfj3379u7c+HpuHR7FY9S25Y3WpKv+cS5lgjJ9pi8OUj2kLKPsxXLNx8D3bA1Dx9O1OaLT+WfCeESNjPl4iTQqPYMRDHsrMNwT6b/Gzp9RV6aaXZXV2mkxLQasC2ZurTPFgTHTd4xo245clRN7cxRlvUHmGJmpuTpkhYx7MGE07Yjhc5dafhA9Q+umowT7umji0azLfFbK3Ux2sHLAZwpZmkmYAB5pWdyBxUqmEHQ+xenO2un1h8T0KNjKww8r4MjeXbIACjIBIABbALliARfxmkKzymKUxSmKUxSmKUxSmKUxSmKVxHBvQOyBa1OqJI5tjmkUt7i3OCYlYgcECwkadYiWo1ADE6tIrTmCLMLMCIBgBbCLW9b3rPSO8TiSMlZFIIIOCCO4II7gg+RFeJI45o2ilVWiZSCpAIIIwQQexBHYg9iKw6TnoHdM6bzBRLy6dk0HCtWCXLolXFmzeGwZQoNM81RpNF2529EyJTxb33IbfREA1vsWAHw7bRs+s2/wCztRa/G0l4jAeSJHkH3sR6R+1+RPrJrUl/0L6b394149kYy5yyJIwQ+Q7A5KDAxiMoB6gKyZ0Tx9pXjJXjdVNB1vGaugDYoUriI9GUYiQKnJb5frXh4cFRql2kD4tCSAJy5eoUqzQlgCMzYQB1rANY1rVdfvW1HWZ5Li9YY5MfIDyVQMKqjJwqgKCT27mtkaLoekbdsV03RYI7eyX+iue5wBlmJLO2AByYlsADOAMTHlrq7UxSmKUxSmKUxSmKUxSmKUxSuC6NbY+NjiyvTcheGZ4Qq2t2aXRIncGx0bHBOYkXtzigVlnJVqFalOGUcSaARZhYthFret71t5dx50qmK+rau6mi6OEVXAoXWkLbj16puiFfxdkhsXQKXRYc4uahEwR1C3NKQ5xcFJh54iyQiNOMEMXcQt73FmZzyYkt9veoBQowoAFVrkKjTFKYpTFKptuh0SZ5HJZi1RiPtsumZLEml0oQs6BLIZOli6dYljSR/eSU4HF3SR5O4qQISjzBlpNKTvK0HzTPFEkkAE9hUMAHPrNVJkKjTFKYpTFKghfxc42ulxJOQjlQlQOF6INJ9orcW15FVNhpVCNCFqROBMrOaxvAHZA0B9EQs0b6ohFsScswJIhA378WQJ4YY8PZntXjghbngcvbU754r3TFKYpTFKYpWJPkr0R+nzygnbxZssrF+gM4ky812lrzT0ucIAmlruePRil5f44mKXRVS9rTPENQuLQlLFRoxGHGmGb2PNlaD1a3tt6zWwtrhJrSMYRZkEhQeQCtkPxA7BSxAAwAB2rVW5OjGwdzXrajd2rQ3rnLNCwTkcliSjK6AksxYqqliSWJPernuInT94o8HGp2R8eKwSRt8kiYhHK58+OTlLLElKRKds9KheJe/qVrnpqTm+EQEKbaZAEYAj0T5nce8f3NvTce7pVfW7gyRIcpGoCRofLIRcDP/WbLY7Zx2rJtqbF2xsuFotAtlikcenISWkbvnBY+QJAJVAq5APHPerzsxWsvpilMUpilMUpilMUpilMUpildHIYxGpahJa5VH2STNiZ1Zn1O3SBqQvKAl7jjqkfY88FI3EhQnA6ML43p1qI/QfNSqyCzihBMAAWlK7zFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpTFKYpX/9Pf4xSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKV//9Tf4xSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKV//9Xf4xSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKUxSmKV//9k="; // Replace this with the public URL of your image
        const mailOptions = {
          from: fromid,
          to: tomaillist2,
          subject: `IT New Requirement List Date "${formattedDates}"`,
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
                  background-color: #176291;
                  color: #fff;
                }
                tr:nth-child(even) {background-color: #f2f2f2;}
              </style>
            </head>
            <body>
              <h1>IT New Requirement List</h1>
              <table>
                <thead>
                  <tr>
                    <th>Req.NO</th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Req Type</th>
                    <th>Department</th>
                    <th>State</th>
                    <th>Location</th>                 
                    <th>Req Details</th>
                    <th>Reg Date</th>                              
                  </tr>
                </thead>
                <tbody>
                  ${result
              .map((row) => {
                const date = new Date(row.regDate);
                const formattedDate = date.toISOString().slice(0, 10);
                const detailsWithoutTags = he.decode(
                  row.reqDetails.replace(/<[^>]+>/g, "")
                );
                return `
                        <tr>
                          <td>${row.reqNumber}</td>
                          <td>${row.emp_id}</td>
                          <td>${row.name}</td>
                          <td>${row.reqType}</td>
                          <td>${row.department}</td>
                          <td>${row.state}</td>
                          <td>${row.location}</td>
                          <td>${detailsWithoutTags}</td>                                                
                          <td>${formattedDate}</td>
                        </tr>
                      `;
              })
              .join("")}                      
                </tbody>
              </table>
              <p>
              <img src="${signatureImageBase64}" alt="Signature" style="max-width: 700px;">
              </p> 
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
    timezone: "Asia/Kolkata",
  }
);








//---------------------------------------------------------------- API testing ------------------------------------------------------------------------------------

app.get("/leads", (req, res) => {
  const fromid = "noreply@athulyaseniorcare.com";
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
        to: "muthukumar@athulyaliving.com",
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
        to: "muthukumar@athulyaliving.com",
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
            .map((row) => {
              const date = new Date(row.date);
              const formattedDate = date.toISOString().slice(0, 10);
              const detailsWithoutTags = he.decode(
                row.details.replace(/<[^>]+>/g, "")
              );
              const pendingWithoutTags = he.decode(
                row.pending.replace(/<[^>]+>/g, "")
              );
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
            .join("")}
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

//----------------------------------------------------------------API Running check ---------------------------------------------

const gmtCronSchedule5 = "45 17 * * *";

console.log(`Checking Schedule: ${gmtCronSchedule5}`);

cron.schedule(gmtCronSchedule5, () => {
  const tomaillist5 = ["muthukumar@athulyaliving.com"];
  const nowIST = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const formattedDate = new Date(nowIST).toISOString().slice(0, 10);
  console.log(`Cron job ran at ${gmtCronSchedule5}`);

  const fromid = "noreply@athulyaseniorcare.com";
  const currentDate = new Date();
  const formattedDates = currentDate.toISOString().slice(0, 10);

  const mail = {
    from: `${fromid}`,
    to: `${tomaillist5}`,
    subject: `cron job running at ${gmtCronSchedule5}`,
    html: `
    <p>Today cron job is running </p>
    `,
  };
  contactEmail.sendMail(mail, (error) => {
    if (error) {
      res.json({ status: "ERROR" });
    } else {
      res.json({ status: "Message Sent" });
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
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  var datetime = new Date();
  console.log(datetime.toISOString().slice(0, 10));
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;
