import express from "express";

const app = express();

app.get("/", (req, res) => {
   res.send("Bot está rodando!");
});

export const startServer = () => {
   app.listen(3000, () => {
      console.log("Servidor web iniciado na porta 3000");
   });
};
