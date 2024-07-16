import pymysql
from datetime import datetime

# Configuración de la conexión a la base de datos
timeout = 10
connection = pymysql.connect(
    charset="utf8mb4",
    connect_timeout=timeout,
    cursorclass=pymysql.cursors.DictCursor,
    db="defaultdb",
    host="liboodbmain-libooproject.i.aivencloud.com",
    password="AVNS_w7vWJY4HASI_xHfkRwT",
    read_timeout=timeout,
    port=20813,
    user="avnadmin",
    write_timeout=timeout,
)

cursor = connection.cursor()

# Crear la tabla si no existe
create_table_query = """
CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255),
    username VARCHAR(255),
    email VARCHAR(255),
    emailVerified BOOLEAN,
    role VARCHAR(255),
    level INT,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    profilePhoto VARCHAR(255),
    phone VARCHAR(255),
    referralCode VARCHAR(255),
    referralCount INT,
    points INT,
    dailyFreeBoosters INT,
    dailyBoostersExp DATETIME,
    boostRefillEndTime DATETIME,
    telegramTaskDone BOOLEAN,
    twitterTaskDone BOOLEAN,
    highestReferralBonusClaimed INT,
    createdAt DATETIME,
    updatedAt DATETIME
)
"""
cursor.execute(create_table_query)

# Datos de ejemplo
data = [
    {"id":"0f7cd664-2f72-46d1-a54f-240fe2e2cf03","userId":"625250960","username":"simlex_x","email":None,"emailVerified":False,"role":"user","level":3,"firstName":None,"lastName":None,"profilePhoto":None,"phone":None,"referralCode":"simlex_x625250960","referralCount":252,"points":1140697,"dailyFreeBoosters":0,"dailyBoostersExp":"2024-07-16T14:39:07.246Z","boostRefillEndTime":"2024-07-15T19:31:15.000Z","telegramTaskDone":True,"twitterTaskDone":True,"highestReferralBonusClaimed":200,"createdAt":"2024-07-12T23:58:37.879Z","updatedAt":"2024-07-15T18:31:05.506Z"},
    # ... añadir otros registros aquí ...
]

# Función para convertir el formato de fecha
def convert_date_format(date_str):
    if date_str:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S')
    return None

# Convertir las fechas al formato adecuado
for record in data:
    record['dailyBoostersExp'] = convert_date_format(record['dailyBoostersExp'])
    record['boostRefillEndTime'] = convert_date_format(record['boostRefillEndTime'])
    record['createdAt'] = convert_date_format(record['createdAt'])
    record['updatedAt'] = convert_date_format(record['updatedAt'])

# Definir la consulta de inserción
query = """
INSERT INTO Users (
    id, userId, username, email, emailVerified, role, level, firstName, lastName, profilePhoto, phone,
    referralCode, referralCount, points, dailyFreeBoosters, dailyBoostersExp, boostRefillEndTime,
    telegramTaskDone, twitterTaskDone, highestReferralBonusClaimed, createdAt, updatedAt
) VALUES (
    %(id)s, %(userId)s, %(username)s, %(email)s, %(emailVerified)s, %(role)s, %(level)s, %(firstName)s, %(lastName)s, %(profilePhoto)s, %(phone)s,
    %(referralCode)s, %(referralCount)s, %(points)s, %(dailyFreeBoosters)s, %(dailyBoostersExp)s, %(boostRefillEndTime)s,
    %(telegramTaskDone)s, %(twitterTaskDone)s, %(highestReferralBonusClaimed)s, %(createdAt)s, %(updatedAt)s
)
"""

# Insertar datos
for record in data:
    cursor.execute(query, record)

# Confirmar cambios
connection.commit()

# Cerrar conexión
cursor.close()
connection.close()

print("Datos insertados exitosamente.")
