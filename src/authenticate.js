import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
  

const secret_name = "var/chives/bot_creds";

const client = new SecretsManagerClient({
region: "us-east-1",
});

let response;

try {
response = await client.send(
    new GetSecretValueCommand({
    SecretId: secret_name,
    VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
);
} catch (error) {
// For a list of exceptions thrown, see
// https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
throw error;
}

const secret = response.SecretString;


module.exports = {secret}