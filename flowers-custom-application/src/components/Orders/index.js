import { lazy } from "react";

const Channels = lazy(() =>
  import("./orders" /* webpackChunkName: "channels" */)
);

export default Channels;
