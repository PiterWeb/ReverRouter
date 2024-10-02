# Rever(r)outer 📦

The router for [ReverUI](https://github.com/PiterWeb/ReverUI/)

### Install it using
    $ npm i reverouter

### Example

```ts
// main.ts

import { $lazy, $Router } from "reverouter";

$Router({
	"/": () => import("./Banner"), // Normal Route
	"/todo": $lazy(() => import("./Todo")), // Lazy Route
	"/counter": $lazy(() => import("./Counter")), // Lazy Route
	"/counter-with-hook": $lazy(() => import("./CounterWithHook")), // Lazy Route
});

```
