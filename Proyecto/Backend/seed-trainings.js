const mysql = require('mysql2/promise');

async function insertTraining(conn, { email, distanceKm, duration, avgSpeed, maxSpeed, rithm, calories, elevationGain, trainingType }) {
  // 1) Route
  const [routeRes] = await conn.execute('INSERT INTO Route (rou_Distance) VALUES (?);', [distanceKm]);
  const routeId = routeRes.insertId;

  // 2) Coordinates (minimal 2 points)
  const coords = [
    { lat: 4.61, lon: -74.08, alt: 2600 },
    { lat: 4.62, lon: -74.081, alt: 2605 },
    { lat: 4.63, lon: -74.082, alt: 2610 }
  ];
  const coordIds = [];
  for (const c of coords) {
    const [r] = await conn.execute('INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (?,?,?);', [c.lat, c.lon, c.alt]);
    coordIds.push(r.insertId);
  }
  for (const cid of coordIds) {
    await conn.execute('INSERT INTO Route_has_Coordinate (rou_Id, coo_Id) VALUES (?, ?);', [routeId, cid]);
  }

  // 3) Training
  const [trainRes] = await conn.execute(
    `INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost)
     VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, 0);`,
    [email, routeId, duration, rithm, maxSpeed, avgSpeed, calories, elevationGain, trainingType]
  );
  return trainRes.insertId;
}

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Werkzeuge_2357',
    database: 'Ghost_Running'
  });

  const users = ['angel@runner.com', 'diegoGo@runner.com'];
  const templates = [
    { distanceKm: 5.2, duration: '00:28:40', avgSpeed: 10.9, maxSpeed: 14.2, rithm: 5.5, calories: 420, elevationGain: 30, trainingType: 'Running' },
    { distanceKm: 8.0, duration: '00:46:10', avgSpeed: 10.4, maxSpeed: 13.8, rithm: 5.8, calories: 610, elevationGain: 45, trainingType: 'Running' },
    { distanceKm: 12.3, duration: '01:05:00', avgSpeed: 11.4, maxSpeed: 15.0, rithm: 5.2, calories: 820, elevationGain: 55, trainingType: 'Running' },
  ];

  for (const email of users) {
    for (const t of templates) {
      const id = await insertTraining(conn, { email, ...t });
      console.log(`✅ Inserted training ${id} for ${email}`);
    }
  }

  await conn.end();
}

main().catch(err => {
  console.error('Error seeding trainings', err);
  process.exit(1);
});
