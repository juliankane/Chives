/**
 * @file ready.js
 * Dispatches when the client becomes ready to start working
 */


const { Events } = require('discord.js')
const ClientVariables = require('../ClientVariables')


module.exports = {
    name: Events.ClientReady,
    execute(client){
        ClientVariables.displayAvatar = client.user.displayAvatarURL({extension:'png'});
        ClientVariables.displayName = client.user.displayName;
    },
};