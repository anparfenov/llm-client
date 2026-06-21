import { spawnSync } from "node:child_process";

const gitRepository = spawnSync("git", ["rev-parse", "--git-dir"], {
	stdio: "ignore",
});

if (gitRepository.status === 0) {
	const hookConfig = spawnSync(
		"git",
		["config", "core.hooksPath", ".githooks"],
		{ stdio: "inherit" },
	);

	if (hookConfig.status !== 0) {
		process.exit(hookConfig.status ?? 1);
	}
}
