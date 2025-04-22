import sys
import json
import mysql.connector
import logging

logging.basicConfig(level=logging.INFO)

import db_auth
s = db_auth.get_secret()


def process_transaction(data):
    conn = mysql.connector.connect( 
        host = s['host'] ,
        user = s['username'],
        password = s['password'],
        database = s['dbname'],
        port = s['port'],
        connection_timeout=10
    )

    cursor = conn.cursor()
    logs_json = json.dumps(data)
    cursor.callproc('insertGuildLogs', (logs_json,))
    conn.commit()

    cursor.close()
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("No json file provided")
        sys.exit(1)
    
    json_file = sys.argv[1]

    with open(json_file) as file:
        data = json.load(file)
        process_transaction(data)
