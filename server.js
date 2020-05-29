
// *******Insterted Required Pacages**************************/
let express = require('express');
var fs = require("fs");
const JSONStream = require('JSONStream');
var mongoose = require('mongoose');
const path = require("path"); 
var bodyParser = require('body-parser');

const csvFile = require('./ImportDataFromDB')
const taskSchemaTable = require('./userModel');

const app = express();

app.use(express.static(path.join(__dirname, "uploads"))); 

//**************************Database Connection***************************** */
mongoose.connect('mongodb://localhost:27017/gym_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
});

//*************Port Running on 3000******************************************* */
app.listen(3000, () => {
    console.log("Post started and running on 3000");
});


var arrayOfUsers=[];

//********************Post Method API****************************************** */ 

app.post('/uploadJsondata', (req,res) => {
    
    var total = 0;
    var count = 0;

    var readerStream = fs.createReadStream('./uploads/THERM0001.json');
    console.log("File has been read");


//************* Inserting  100 records data from the array to database ************* */
    readerStream.pipe(JSONStream.parse('*')).on('data', async (userData) => {

        arrayOfUsers.push(userData);

        console.log(arrayOfUsers.length,'array la length')

        if (arrayOfUsers.length === 99) {
            readerStream.pause();
          await taskSchemaTable.insertMany(arrayOfUsers);
          arrayOfUsers = [];
          readerStream.resume();
          total = total + 1 ;
          console.log('Its resumed', total);

        }
      });
    // *********************************Inserted rest remaining datas**********/

      readerStream.on('end', async () => {
        await taskSchemaTable.insertMany(arrayOfUsers); // left over data
        // console.log('');
        res.status(200).send('\nImport completed, closing connection... the data');
       
    });

    // res.send('Data is inserting, Please wait for last response!!!');
      
      
});
//***********************End Of Post API***********************************************888 */



//******Fetching data from table to CSV file(API)********** */
app.get('/csvData', csvFile.createCSV);
    


//*****API for creating link of that CSV file which stored in public folder *****/  
app.get('/csvFile', (req,res) =>{
  res.send({link: "http://localhost:3000/userTableData.csv"})
})


 




