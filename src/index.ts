import type { $UI } from "reverui";

type normal_route = (t?: any) => HTMLElement;
type lazy_route = () => Promise<normal_route>;
type route = (() => normal_route) | lazy_route;

type Routes = {
	"/": route;
	"404"?: route;
	[a: string]: route | undefined;
};
class $RouterController {
	static routes: Routes;
	static parent: HTMLElement;
	static config: $RouterConfig

	static renderer: typeof $UI;
}

const fallBackComponent = () => () => document.createElement("div");

type $lazy_route_module = {
	default: normal_route;
};

export function $lazy<T extends Promise<P>, P extends $lazy_route_module>(
	importComponent: () => T
) {
	return async () => {
		const modulePromise = await importComponent();

		return modulePromise.default;
	};
}

export function $Link({
	href,
	className,
}: {
	href: string;
	className?: string;
	children?:
		| JSX.IntrinsicElements[keyof JSX.IntrinsicElements]
		| string
		| number;
}) {
	const link = document.createElement("a");

	link.href = href;
	if (className) link.className = className;

	return link;
}

interface $RouterConfig {
	/** Default: false, This property makes the router only handle known routes defined in the {@link Routes} object */
	handleOnlyKnownRoutes: boolean;
}

export function $Router(
	renderer: typeof $UI,
	routes: Routes,
	config?: $RouterConfig,
	parent?: HTMLElement
) {
	$RouterController.routes = routes;
	$RouterController.parent = parent ?? document.body;
	$RouterController.renderer = renderer;
	$RouterController.config = config ?? {} as $RouterConfig;

	const component =
		routes[window.location.pathname] ?? routes[404] ?? fallBackComponent;

	const routePaths = Object.keys(routes);

	// Handles all <a> elements navigation
	document.body.addEventListener(
		"click",
		(ev) => {
			const target = ev.target;

			if (target instanceof HTMLAnchorElement) {
				const url = new URL(target.href);

				// Decides if the route should be handled or not
				if (config?.handleOnlyKnownRoutes) {
					if (!routePaths.includes(url.pathname)) return;
				} else if (url.host !== window.location.host) return;

				ev.preventDefault();
				$goto(target.href);
			}
		},
		false
	);

	// Handles forward / backward browser buttons
	window.addEventListener("popstate", (ev) => {
		history.replaceState(null, "", window.location.href);

		const component =
			routes[window.location.pathname] ??
			routes[404] ??
			fallBackComponent;

		// This avoid to check if the component is a Promise or not
		Promise.resolve(component()).then((c) => renderer(c, parent, true));
	});

	// This avoid to check if the component is a Promise or not
	Promise.resolve(component()).then((c) => {
		renderer(c, parent, true);
	});
}

export function $goback() {
	history.back();
}

export function $goforward() {
	history.forward();
}

export function $goto(path: string, data?: any) {
	history.pushState({ props: data }, "", path);

	const component =
		$RouterController.routes[window.location.pathname] ??
		$RouterController.routes[404] ??
		fallBackComponent;

	// This avoid to check if the component is a Promise or not
	Promise.resolve(component()).then((c) => {
		$RouterController.renderer(c, $RouterController.parent, true);
	});
}
