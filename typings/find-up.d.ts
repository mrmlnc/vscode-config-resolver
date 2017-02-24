declare module "find-up" {

	interface IOptions {
		/**
		 * Directory to start from.
		 */
		cwd?: string;
	}

	function findUp(filename: string | string[], options?: IOptions): Promise<string>;

	namespace findUp {
		function sync(filename: string | string[], options?: IOptions): string;
	}

	export = findUp;

}
