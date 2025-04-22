import sys
import json
import mysql.connector
import threading
lock = threading.Lock()
import db_auth
s = db_auth.get_secret()

def process_users(data):
    with lock:
        try:
            print("connection to database")
            conn = mysql.connector.connect( 
                host= s.host,
                user= s.username,
                password= s.password,
                database= s.dbname,
                port= s.port,
                connection_timeout=10
            )
            
            cursor = conn.cursor()

        except mysql.connector.Error as err:
            print(f"Error connecting to database: {err}")
            sys.exit(1)
        
        try:
            guilds_json = json.dumps(data)
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



