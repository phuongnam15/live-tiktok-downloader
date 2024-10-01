import { lazy } from "react";

const Download = lazy(() => import("../pages/Download"));
const UpLive = lazy(() => import("../pages/UpLive"));

const Router = [
  {
    path: "/",
    element: <Download />,
  },
  {
    path: "/up-live",
    element: <UpLive />,
  },
];

export default Router;
