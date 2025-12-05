export function toRad(value: number) {
	return (value * Math.PI) / 180;
}

export function haversineMeters(
	a: { latitude: number; longitude: number },
	b: { latitude: number; longitude: number }
) {
	const earthRadiusMeters = 6371000;
	const distLatitudeRad = toRad(b.latitude - a.latitude);
	const distLongitudeRad = toRad(b.longitude - a.longitude);
	const lat1 = toRad(a.latitude);
	const lat2 = toRad(b.latitude);
	const sinDlat = Math.sin(distLatitudeRad / 2);
	const sinDlon = Math.sin(distLongitudeRad / 2);
	const aa = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
	const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
	return earthRadiusMeters * c;
}

export function sumDistanceMeters(route: Array<{ latitude: number; longitude: number }>) {
	let total = 0;
	for (let i = 1; i < route.length; i++) {
		total += haversineMeters(route[i - 1], route[i]);
	}
	return total;
}
