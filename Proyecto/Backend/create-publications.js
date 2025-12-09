const mysql = require('mysql2/promise');

async function createPublications() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Werkzeuge_2357',
    database: 'Ghost_Running'
  });

  try {
    console.log('🔍 Obteniendo entrenamientos sin publicaciones...');
    
    // Get all trainings
    const [trainings] = await connection.query(`
      SELECT t.tra_Counter, t.user_Email, t.rou_Id, t.tra_Datetime
      FROM Training t
      WHERE NOT EXISTS (
        SELECT 1 FROM Publication p 
        WHERE p.tra_Counter = t.tra_Counter 
        AND p.user_Email = t.user_Email
      )
      ORDER BY t.tra_Counter
    `);

    console.log(`📊 Encontrados ${trainings.length} entrenamientos sin publicaciones`);

    if (trainings.length === 0) {
      console.log('✅ Todos los entrenamientos ya tienen publicaciones');
      await connection.end();
      return;
    }

    // Create publications for each training
    for (const training of trainings) {
      const pubDatetime = training.tra_Datetime || new Date();
      
      await connection.query(`
        INSERT INTO Publication (user_Email, tra_Counter, rou_Id, pub_Privacity, pub_Datetime, pub_RouteImage, pub_Likes)
        VALUES (?, ?, ?, 0, ?, NULL, 0)
      `, [
        training.user_Email,
        training.tra_Counter,
        training.rou_Id,
        pubDatetime
      ]);

      console.log(`✅ Publicación creada para entrenamiento ${training.tra_Counter} de ${training.user_Email}`);
    }

    // Show created publications
    const [publications] = await connection.query(`
      SELECT pub_Counter, user_Email, tra_Counter, rou_Id, pub_Datetime 
      FROM Publication 
      ORDER BY pub_Datetime DESC
    `);

    console.log('\n📋 Publicaciones creadas:');
    console.log(JSON.stringify(publications, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

createPublications();
