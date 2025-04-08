import sys
import os
import json
import mysql.connector
import multiprocessing as mp

def process_transaction(data):
   
    with open('config.json') as config_file:
        config = json.load(config_file)

    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password= os.getenv('DB_PASS'),
        database=os.getenv('DB_NAME'),
        connection_timeout=10
    )
    cursor = conn.cursor()
    print("Successfully connected to database")



    logs_json = json.dumps(data)
    cursor.callproc('insertGuildLogs', (logs_json,))
    conn.commit()



    cursor.close()
    conn.close()

if __name__ == "__main__":
    
    if len(sys.argv) < 2:
        print("No json file provided")
        sys.exit(1)
    
    print(f'{sys.argv[1]} argument received')
    json_file = sys.argv[1]
    print('JSON FOUND')


    with open(json_file) as file:
        data = json.load(file)
        process_transaction(data)
