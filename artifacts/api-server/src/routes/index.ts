import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import playersRouter from "./players";
import teamsRouter from "./teams";
import programsRouter from "./programs";
import trialsRouter from "./trials";
import trialBookingsRouter from "./trialBookings";
import newsRouter from "./news";
import galleryRouter from "./gallery";
import sponsorsRouter from "./sponsors";
import schedulesRouter from "./schedules";
import contactRouter from "./contact";
import scoutingRouter from "./scouting";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/players", playersRouter);
router.use("/teams", teamsRouter);
router.use("/programs", programsRouter);
router.use("/trials", trialsRouter);
router.use("/trial-bookings", trialBookingsRouter);
router.use("/news", newsRouter);
router.use("/gallery", galleryRouter);
router.use("/sponsors", sponsorsRouter);
router.use("/schedules", schedulesRouter);
router.use("/contact", contactRouter);
router.use("/scouting", scoutingRouter);
router.use("/dashboard", dashboardRouter);

export default router;
