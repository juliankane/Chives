/** 
 * @file deploy-commands.js 
 * Deploy commands and events to be public across all application connections
 */
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));


async function authenticate(){
    try{
        let auth = await import('../../shared/secrets.mjs');
        const secrets = await auth.fetchSecrets();
        return secrets;
    }catch(err){
        throw err;
    }
}

authenticate().then(secret => {
    for (const file of commandFiles) {
        const filePath = path.join(foldersPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {

        }
    }
    
    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(secret.BOT_TOKEN);
    
    (async () => {
        try {

    
            const data = await rest.put(
                Routes.applicationCommands(secret.CLIENT_ID),
                { body: commands },
            );
    

        } catch (error) {
            console.error(error);
        }
    })()

})


