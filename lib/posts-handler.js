"use strict";
const pug = require("pug");
const Post = require("./post");
const util = require("./handler-util");
async function handle(req, res) {
  switch (req.method) {
    case "GET":
      res.writeHead(200, {
        "Content-Type": "text/html; charsset=utf-8",
      });
      const posts = await Post.findAll({ order: [["id", "DESC"]] });
      res.end(pug.renderFile("./views/posts.pug", { posts, user: req.user }));
      console.info(
        `閲覧されました: user: ${req.user},
        remoteAddress: ${req.socket.remoteAddress}
        userAgent: ${req.headers["user-agent"]}`
      );
      break;
    case "POST":
      let body = "";
      req
        .on("data", (chunk) => {
          body += chunk;
        })
        .on("end", async () => {
          const params = new URLSearchParams(body);
          const content = params.get("content");
          await Post.create({
            content,
            postedBy: req.user,
          });
          handleRedirectPosts(req, res);
        });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    Location: "/posts",
  });
  res.end();
}

module.exports = {
  handle,
  handleRedirectPosts,
};
