declare module "locate-path" {

	interface IOptions {
		/**
		 * Number of concurrently pending promises.
		 */
		concurrency?: number;
		/**
		 * Disable this to improve performance if you don't care about the order.
		 */
		preserveOrder?: boolean;
		/**
		 * Directory to start from.
		 */
		cwd?: string;
	}

	function locatePath(files: string[], options?: IOptions): Promise<string>;

	namespace locatePath {
		function sync(files: string[], options?: IOptions): string;
	}

	export = locatePath;
}
