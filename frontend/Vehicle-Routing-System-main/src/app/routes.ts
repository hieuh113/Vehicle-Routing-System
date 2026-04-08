import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { HomePage } from "./components/HomePage";
import { SetupPage } from "./components/SetupPage";
import { VisualizationPage } from "./components/VisualizationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "setup", Component: SetupPage },
      { path: "visualization", Component: VisualizationPage },
    ],
  },
]);
