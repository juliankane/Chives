import sys
import os
import json
import mysql.connector

import boto3
from botocore.exceptions import ClientError


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


def process_transaction(data):
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
