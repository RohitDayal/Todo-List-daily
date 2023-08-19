const express= require('express');
const bodyParser=require('body-parser');
const mongoose = require("mongoose");
const _ =require('lodash');

console.clear();
const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://rdxdayal35:RohitDayal@cluster0.f5pky7z.mongodb.net/todolistDB',{useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
let items=["Breakfast","Lunch"];
const worklist=[];

const itemschema={name:String};
const Item=mongoose.model("Item",itemschema);//Item as singular but it create plural in collections
const item1=new Item({name:"Add items with +"});
const item2=new Item({name:"Checkbox to delete"});
// const item3=new Item({name:"Dinner"});
const defaulItems=[item1,item2];
// for custom list name different schema is made
const listSchema={
  name: String,
  items:[itemschema]
};
const List=mongoose.model("List",listSchema);
let day="";
app.get('/',function(req, res){
     var today=new Date();
     var options={
        weekday:"long",
        day:"numeric",
        month:"long"
     };
      day= today.toLocaleDateString("en-US",options);
     //inserting item
     Item.find()
     .then(function (models) {
      if(models.length===0){
         Item.insertMany(defaulItems);
         res.redirect("/");
      }
      else{
         res.render('Todo', {title:day,newlistitem:models});
      }
         
       })
     .catch(function (err) {
       console.log(err);
    });
     
    });
app.get("/:customListName" ,function(req,res){
    customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName}).then(function(exist){
      if(exist){
        res.render('Todo', {title:exist.name,newlistitem:exist.items});
      }
      else{
            const list = new List({
              name:customListName,
              items:defaulItems
            });
            list.save();
            res.redirect("/"+customListName);
          }
    }).catch(function(err){
      console.log(err);
    });
});

app.get("/about",function(req,res){
     res.render('about');
});
app.post("/",function(req,res){
     const itemName=req.body.newItem;
     const listName=req.body.button;
     const item =new Item({
          name:itemName
      });
      if(listName===day){
        item.save();
        res.redirect("/");
      }
      else{
        List.findOne({name:listName}).then(function(FoundList){
             FoundList.items.push(item);
             FoundList.save();
             res.redirect("/"+listName);
        }).catch(function(err){
          console.log(err);
        });
      }
  
    
  });
app.post("/delete",function(req,res){
      const delId=req.body.checkbox;
      const listName=req.body.listName;
      if(listName===day){
      Item.findByIdAndRemove(delId).exec();
      res.redirect("/");
    }else{
      List.findOneAndUpdate({name:listName},{$pull: {items:{_id:delId}}}).then(function(FoundList){
        res.redirect("/"+listName);
      });
    }
});

app.listen(3000,function(){
    console.log("Server is running on port 3000");
});


// atlas
// mongosh "mongodb+srv://cluster0.f5pky7z.mongodb.net/myFirstDatabase" --apiVersion 1 --username rdxdayal35