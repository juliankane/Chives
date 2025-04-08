import sys
import os
import json
import mysql.connector
import threading
lock = threading.Lock()

with open('config.json') as config_file:
    config = json.load(config_file)

def process_users(data):
    with lock:
        try:
            conn = mysql.connector.connect(
                host=os.getenv('DB_HOST'),
                user=os.getenv('DB_USER'),
                password= os.getenv('DB_PASS'),
                database=os.getenv('DB_NAME'),
                connection_timeout=10
            )
            cursor = conn.cursor()
            print("Successfully connected to database")
            
        except mysql.connector.Error as err:
            print(f"Error connecting to database: {err}")
            sys.exit(1)
        
        try:
            guild = data['guild']
            guilds_json = json.dumps(data)

            print(f'New guild joined!\n Guild ID: {guild['g_id']} Name: {guild['g_name']}')
            print('Processing members...')
            cursor.callproc('initGuild', (guilds_json,))
            conn.commit()
            print("Transaction committed successfully.")

        except Exception as e:
            print(f'Error occurred: {e}')
            sys.exit(1)  # Exit with an error code to terminate the proces
        finally:
            cursor.close()
            conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("No json file provided")
        sys.exit(1)
    
    json_file = sys.argv[1]

    try: 
        data = json.loads(sys.argv[1])
        print("Received JSON from process")
        process_users(data)
        
    except Exception as e:
        print(f"...")
        try:
            with open(json_file) as file:
                data = json.load(file)
                print("Received json Data:", data)
                process_users(data)

        except Exception as e:
            print(f"Error reading JSON file: {e}")



