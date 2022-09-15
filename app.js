const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require("mongoose");
const lodash = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect("mongodb+srv://Razills:Ha963214785@cluster0.27ba9d0.mongodb.net/todolistDB");

const itemsSchema = {
    item: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1= new Item({
    item: "Welcome to Your ToDoList!"
});

const item2= new Item({
    item: "Hit the + button to add a new item."
});

const item3= new Item({
    item: "<--- Hit this button to delete a item."
});

const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get('/', function (req, res) {
    

    Item.find({}, function (err, items) {

        if (items.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                }
            });

            res.redirect("/");

        } else {
            res.render("index", {listTitle: "Today", newListItems: items});
        }
        
    });
});

app.post('/', function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.button;

    const item = new Item({
        item: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: lodash.lowerCase(listName)}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + lodash.lowerCase(listName));
        });
    }
});

app.get("/:route", function (req, res) {
    const route = lodash.lowerCase(req.params.route);

    List.findOne({name: route}, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List ({
                    name:  route,
                    items: defaultItems
                });

                list.save();
                res.redirect("/"+ route);

            } else {
                res.render("index", {listTitle: lodash.capitalize(foundList.name), newListItems: foundList.items})          
            }
        }
    });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = lodash.lowerCase(req.body.listName);

    if (lodash.capitalize(listName) === "Today") {
            Item.findByIdAndRemove(checkedItemId, function (err) {
                if (!err) {
                    res.redirect("/");
                }
            });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList) {
            if (err) {
                console.log(err)
            } else {
                res.redirect("/" + listName);
            }
        });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5500;
}

app.listen(port, function () {
    console.log("Server Started Successfuly on Port", port);
});