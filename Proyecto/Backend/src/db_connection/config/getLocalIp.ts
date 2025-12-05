import os from "os";

function getLocalIP() {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		const iface = interfaces[name];
		if (!iface) {continue;}

		for (const info of iface) {
			// Filtra direcciones IPv4 que no sean internas (localhost)
			if (info.family === "IPv4" && !info.internal) {
				return info.address;
			}
		}
	}
	return "No se pudo determinar la IP local";
}

export default getLocalIP;