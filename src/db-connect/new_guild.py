import sys
import os
import json
import mysql.connector
import threading
lock = threading.Lock()

from botocore.exceptions import ClientError
import boto3

def get_secret():
    secret_name = "var/chives/mysql"
    region_name = "us-east-1"

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e

    secret = get_secret_value_response['SecretString']
    return secret



def process_users(data):
    with lock:
        try:
            s = get_secret()
            conn = mysql.connector.connect( 
                host= s.host,
                user= s.username,
                password= s.password,
                database= s.dbname,
                port= s.port,
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



