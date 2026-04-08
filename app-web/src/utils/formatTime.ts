export function formatTime(seconds: number): string {
	if (seconds < 0) throw new Error("Seconds cannot be negative");

	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	const formattedMins = hrs > 0 ? String(mins).padStart(2, "0") : String(mins);
	const formattedSecs = String(secs).padStart(2, "0");

	return hrs > 0
		? `${hrs}:${formattedMins}:${formattedSecs}`
		: `${formattedMins}:${formattedSecs}`;
}
