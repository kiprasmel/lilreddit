import { delay } from "./delay";

export const timeDelta = (startTimeUnix: number, endTimeUnix: number = new Date().getTime()): number => {
	if (endTimeUnix < startTimeUnix) {
		throw new Error(
			`mismatched \`startTimeUnix\` and \`endTimeUnix\` argument placement order (endTime is currently earlier than start time)`
		);
	}

	return endTimeUnix - startTimeUnix;
};

export const calcRemainingWaitMs = (
	minimumWaitMs: number,
	startTimeUnix: number,
	endTimeUnix: number = new Date().getTime()
): number => {
	const howMuchAlreadyPassed: number = timeDelta(startTimeUnix, endTimeUnix);
	return Math.max(0, minimumWaitMs - howMuchAlreadyPassed);
};

const delayIfNotEnoughTimePassedFromStartAsync = async (
	minimumWaitFromStartTimeMs: number,
	startTimeUnix: number,
	endTimeUnix: number = new Date().getTime()
): Promise<void> => {
	const remainingWaitMs = calcRemainingWaitMs(minimumWaitFromStartTimeMs, startTimeUnix, endTimeUnix);

	if (remainingWaitMs > 0) {
		await delay(remainingWaitMs);
	}
};

/**
 * starts counting how much time has passed
 * up until called again
 */
export const createDelayer = () => {
	const startTimeUnix: number = new Date().getTime();

	return {
		startTimeUnix,
		delayIfNotEnoughTimePassedFromStartAsync: async (minimumWaitTimeFromStartTimeMs: number): Promise<void> => {
			const endTimeUnix: number = new Date().getTime();

			await delayIfNotEnoughTimePassedFromStartAsync(minimumWaitTimeFromStartTimeMs, startTimeUnix, endTimeUnix);
		},
	};
};
