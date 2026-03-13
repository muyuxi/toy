import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'u146906977_toyshow',
  password: '1N$9hd>@xyf',
  database: 'u146906977_toyshow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
