import { defineApp } from "rwsdk/worker";
import { index, layout, route } from "rwsdk/router";
import { Document } from "./app/Document";
import { Home } from "./app/routes/Home";

// Define your app routes
const app = defineApp([
  layout(Document, [
    index([Home]),
    // Add more routes:
    // route("dashboard", [Dashboard]),
    // route("settings", [Settings]),
  ]),
]);

export default app;
