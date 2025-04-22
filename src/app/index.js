require('./setup')





const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

async function authenticate() {
    try {
        let auth = await import('../shared/secrets.mjs');
        const secrets = await auth.fetchSecrets();

        console.log(secrets)
        return secrets;


    } catch (err) {
        throw err;
    }

}


authenticate().then(secret => {

    const token = secret.BOT_TOKEN;

    client.commands = new Collection();
    const foldersPath = path.join(__dirname, 'commands');

    const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(foldersPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {

        }
    }

    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }


    client.login(token);

});


