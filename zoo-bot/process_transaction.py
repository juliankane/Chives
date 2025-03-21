import sys
import json
import mysql.connector

with open('config.json') as config_file:
    config = json.load(config_file)

def process_transaction(data):
    try:
        conn = mysql.connector.connect(
            host=config['mysql']['host'],
            user=config['mysql']['user'],
            password=config['mysql']['password'],
            database=config['mysql']['database'],
            connection_timeout=config['mysql']['connection_timeout']
        )
        cursor = conn.cursor()
        print("Successfully connected to database")

    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        sys.exit(1)
    
    try:
        logs = data['logs']
        logs_json = json.dumps(logs)

        for log in logs:
            print(f'{log}')
            
        cursor.callproc('insert_log', (logs_json,))

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
    print('JSON FOUND')

    try:
        with open(json_file) as file:
            data = json.load(file)
            print("Received json Data:", data)
            process_transaction(data)

    except Exception as e:
        print(f"Error reading JSON file: {e}")
