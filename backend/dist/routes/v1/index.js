import { Router } from "express";
const v1Router = Router();
v1Router.get('/', (req, res) => {
    console.log("you are at v1");
});
export default v1Router;
//# sourceMappingURL=index.js.map