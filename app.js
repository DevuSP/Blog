require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const username = process.env.USER_ID;
const password = process.env.PASSWORD;  

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

console.log(username)
console.log(password)
const url = `mongodb+srv://${username}:${password}@cluster0.k5zj2ee.mongodb.net/blogDB`;

main().catch(error => console.log(error));

async function main() {
  await mongoose.connect(url);

  const blogSchema = new mongoose.Schema({
    title: String,
    content: String
  });

  const BLOGS = mongoose.model("blog", blogSchema);

  app.get("/", async (req, res) => {
    let post = await BLOGS.find({});

    res.render("home.ejs", {
      postsContent: post
    })
  })

  app.get("/contact", (req, res) => {
    res.render("contact.ejs", {})
  })

  app.get("/about", (req, res) => {
    res.render("about.ejs", {})
  })

  app.get("/post", (req, res) => {
    res.render("post.ejs")
  })

  app.get("/compose", (req, res) => {
    res.render("compose.ejs")
  })

  app.get("/search", (req, res) => {
    res.render("search.ejs")
  })

  app.get("/edit/:id", async (req, res) => {
    const edit = req.params.id;
    const data = await BLOGS.findById(edit);
    console.log("edit:" + data);
    res.render("edit.ejs", {post: data})
  });


  app.get("/posts/:find", async (req, res) => {
    // ".lowerCase" is from lodash to remove sp characters and lowercase all alphabet
    const requestedTitle = req.params.find;

    try {
      const data = await BLOGS.findById({_id: requestedTitle});
      // if no data send to home page. 
      if (!data) {
        res.redirect("/");
        res.status(404);
      } else {
        res.render("post.ejs", { post: data });
      }
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  })

  app.post("/compose", async (req, res) => {
    const title = req.body.textInput;
    const content = req.body.postInput;
    if (title === "" || content === "") { return };
    const post = new BLOGS({
      title: title,
      content: content
    });
    await post.save();
    res.redirect("/");
  })

  app.post("/search", async (req, res) => {
    const requestedTitle = req.body.title;
    const data = await BLOGS.findOne({ title: { $regex: requestedTitle, $options: "i" } });
    const id = data._id;
    res.redirect("/posts/" + id);
  });

  app.post("/update", async (req, res) => {
    const edit = (req.body.edit);
    const deletePost = (req.body.delete);
    // if deletePost is empty. 
    if (!deletePost) {
      console.log(edit)
      res.redirect("/edit/" + edit)
    } else {
      try {
        const data = await BLOGS.findByIdAndDelete({ _id: deletePost });
        console.log(`Document with ${deletePost} deleted successfuly.`);
        res.redirect("/");
      } catch (error) {
        console.log(error)
        res.status(404);
      }
    }
  });

  app.post("/edit",async (req, res)=>{
    const title = req.body.textInput;
    const content = req.body.postInput;
    const id = req.body.id;
    try {
      const data = await BLOGS.findOneAndUpdate({_id: id}, {
        title: title,
        content: content
      });
      console.log(`Blog with title ${data.title} updated successfully.`)
      res.redirect("/posts/" + id)
    } catch (error) {
      console.log(error)
      res.status(500)
    }
  });

  //Database curly braces.
}

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
