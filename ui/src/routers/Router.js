import { lazy } from "react";

const Download = lazy(() => import("../pages/Download"));
// const Login = lazy(() => import("../pages/auth/Login"));

const Router = [
  {
    path: "/",
    element: <Download />,
  },
  // {
  //   path: "/login",
  //   element: <Login />,
  // },
];

export default Router;
