
import {
    SecretsManagerClient,
    GetSecretValueCommand,
  } from "@aws-sdk/client-secrets-manager";
  
  
  export async function fetchSecrets() { 
    const secret_name = "var/chives/bot_creds";
  
    const client = new SecretsManagerClient({
      region: "us-east-1",
      });
      
      let response;
      
      try {
      response = await client.send(
          new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: "AWSCURRENT", 
          })
      );
      } catch (error) {
        throw error;
      }
      
      const secret = response.SecretString;
      return JSON.parse(secret);
  }