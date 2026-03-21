import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import propertiesRouter from "./properties";
import adminRouter from "./admin";
import servicesRouter from "./services";
import favoritesRouter from "./favorites";
import aboutRouter from "./about";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/properties", propertiesRouter);
router.use("/admin", adminRouter);
router.use("/services", servicesRouter);
router.use("/favorites", favoritesRouter);
router.use("/about", aboutRouter);
router.use("/upload", uploadRouter);

export default router;
