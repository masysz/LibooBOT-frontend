import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Ref from "./pages/Ref";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";
import ErrorCom from "./Components/ErrorCom";
import Tasks from "./pages/Tasks";
import Boost from "./pages/Boost";
import Stats from "./pages/Stats";
import Connect from "./pages/ConnectWallet";
// import DeviceCheck from "./Components/DeviceCheck";
import Plutos from "./pages/Plutos";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const manifestUrl =
  "https://raw.githubusercontent.com/vshaltd/kdf/main/public/tonconnect-manifest.json";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorCom />,
    children:[
      {
        path:"/",
        element: <Plutos />,
      },
      {
        path:"/ref",
        element: <Ref />,
      },
      {
        path:"/tasks",
        element: <Tasks />,
      },
      {
        path:"/boost",
        element: <Boost />,
      },
      {
        path:"/connect",
        element: <Connect />,
      },
    ]

  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(



  // <DeviceCheck>
  <TonConnectUIProvider manifestUrl={manifestUrl}>
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
  </TonConnectUIProvider>
// </DeviceCheck>

);
