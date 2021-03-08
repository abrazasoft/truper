const express = require('express'); 
const path = require('path');
const formidable = require('express-form-data');
const bodyParser = require('body-parser');
const xlsx = require("xlsx");
const fs = require('fs-extra');
const {createConnection, getConnection} = require('./database');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(formidable.parse({ keepExtensions: true }))





app.get('/',   async (req, res) => {

  res.sendFile(path.join(__dirname+'/vistas/index.html'));

});



app.get('/pos',   async (req, res) => {

  res.sendFile(path.join(__dirname+'/vistas/pos.html'));

});

app.get('/actualizar',   async (req, res) => {

  res.sendFile(path.join(__dirname+'/vistas/actualizar.html'));

});


app.post('/guardar',   async (req, res, ) => {

    //console.log(req.files.file);
    var ruta = "src/public/catalogo.xlsx";

    fs.access(ruta , fs.constants.F_OK, (err) => { 
      if (err) {
        // console.error('No Read access');
        move();
        fs.unlinkSync(path.join(__dirname+"/db.json"));
       }else{
         //console.log('File can be read'); 
         
         fs.unlinkSync(ruta);
         
          move();
         
       }
    });

   async function move(){
      fs.move(req.files.file.path, ruta , async function (err) {



          res.redirect("/addjson")
        
     
      });
    }

});


app.get('/addjson',   async (req, res) => {
      
      var ruta = "src/public/catalogo.xlsx";
      
      const workbook = await xlsx.readFile(ruta);
      const workbookSheets =await workbook.SheetNames;
      const sheet = workbookSheets[0];
      dataExcel = await xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

      const json = await JSON.stringify(dataExcel, null, 2)
      

         getConnection().unset('catalogo[0]').write();
         
         getConnection().get('catalogo').push(dataExcel).write();

          res.redirect('/')
    

});

app.get('/search/:id',   async (req, res) => {

  const { id } = req.params;

  //console.log('hola');
    
    const result =  getConnection()
       .get('catalogo')
       .find({ ean: Number(id)})
       .value();

   if(result == null){
    res.json("descripcion: error")
   }else{
    res.json(result);
   }
  


});







createConnection();
app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
    //console.log(path.join(__dirname))
  });
 