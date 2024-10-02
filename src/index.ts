import { $UI } from "reverui";

type route = ((t?: any) => HTMLElement) | Promise<(t?: any) => HTMLElement>;

type Routes = {
	"/": route;
	[a: string]: route;
};
class $RouterController {
	static routes: Routes;
	static parent: HTMLElement;
}

const defaultComponent = () => document.createElement("div");

type lazy_route = {
	default: route;
};

export async function $lazy<T extends Promise<P>, P extends lazy_route>(
	importComponent: () => T
) {
	const modulePromise = await importComponent();

	return modulePromise.default;
}

export function $Link({
	href,
	className,
}: {
	href: string;
	className?: string;
	children?: JSX.IntrinsicElements[keyof JSX.IntrinsicElements] | string | number;
}) {
	const link = document.createElement("a");

	link.href = href;
	if (className) link.className = className;

	return link;
}

export function $Router(routes: Routes, parent?: HTMLElement) {
	$RouterController.routes = routes;
	$RouterController.parent = parent ?? document.body;

	const component = routes[window.location.pathname] ?? defaultComponent;

    // Handles all <a> elements navigation
	document.body.addEventListener(
		"click",
		(ev) => {
			const target = ev.target;

			if (target instanceof HTMLAnchorElement) {
				ev.preventDefault();
				$goto(target.href);
			}
		},
		false
	);

    // Handles forward backward browser buttons
	window.addEventListener("popstate", (ev) => {
		history.replaceState(null, "", window.location.href);

		const component = routes[window.location.pathname] ?? defaultComponent;

	    // This avoid to check if the component is a Promise or not
		Promise.resolve(component).then((c) => {
			$UI(c, parent, true);
		});
	});

    // (IDK if it works)
	window.addEventListener("hashchange", () => {

		const component = routes[window.location.pathname] ?? defaultComponent;

	    // This avoid to check if the component is a Promise or not
		Promise.resolve(component).then((c) => {
			$UI(c, parent, true);
		});
	});

	// This avoid to check if the component is a Promise or not
	Promise.resolve(component).then((c) => {
		$UI(c, parent, true);
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
		$RouterController.routes[window.location.pathname] ?? defaultComponent;

	// This avoid to check if the component is a Promise or not
	Promise.resolve(component).then((c) => {
		$UI(c, $RouterController.parent, true);
	});
}
