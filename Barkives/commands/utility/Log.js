/** Class Log for commands/log.js */
const response_options = require('./response-options.json');
const {EmbedBuilder} = require("@discordjs/builders");
const {hyperlink, blockQuote, quote, underline, italic, bold} = require('discord.js');

class Log{
    // init Log - fields align with as they are in  SQL database
    constructor(){
        this.authorId = null;
        this.date_time = new Date().toISOString().replace('T', ' ').split('.')[0];
        this.logged_users = [];
        this.entry = null;
        this.event_name = null;
        this.location_name = null;
        this.point_action = null;
        this.attachment = null;
        this.url = null;
    }

    toEmbed(userObj){
        /** Create an embed for a Log to be sent by the bot to a TextChannel */

        const userAvatarURL = userObj.displayAvatarURL({extension: 'png'}); // Author's Discord Photo
        const author_name = getNameFromID(this.authorId);  // Author's discord name 
        const logged_user_names = getNameFromID(this.logged_users).join(', '); // Reported user's discord names
        
        // Create embed
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)  // Embed color
            .setAuthor({name: userObj.displayName, iconURL: userAvatarURL})
            .setTitle(bold(response_options.EmbededStrings.description[this.point_action]))
            .addFields( 
                {name: bold(response_options.EmbededStrings.logged_users[this.point_action]),  value: logged_user_names, inline: true},   // Set field for 'reward' or 'report'
                {name: bold(('Location')), value: quote(this.location_name), inline:true},
                {name: bold(('Reason')), value: quote(this.event_name), inline:true},
                {name: bold(underline('Details: ')), value: blockQuote(this.entry),inline: false}
            )
            
            .setTimestamp(new Date(this.date_time))
            .setFooter({text: `written by ${userObj.displayName}`});
        
        try{
            if (this.attachment.contentType?.startsWith('image/')) {
                embed.setImage(this.attachment.url);
            } else{
                embed.addFields({name: 'Video: ', value: this.attachment.url})
            }
        }catch(err){
            console.log(err)
        }
      

        try{
            if (this.url){
                embed.addFields({name: 'URL: ', value: this.url});
            }
        }
        catch(err){
            console.log(err);
        }



        
        
        return embed;

    }

    toJSON(){
        return {
            authorId: this.authorId,
            date_time: this.date_time,
            tagged_members: this.logged_users,
            entry: this.entry,
            event_name: this.event_name,
            location_name: this.location_name,
            point_action: this.point_action
        };
    };

    isFilled() {
        if (
            !this.logged_users || this.logged_users.length === 0 || 
            !this.event_name || 
            !this.location_name || 
            !this.point_action 
        ) {
            return false;
        }
        
        return true
    }
}


function getNameFromID(ids) {
    /** Get a user's discord name userId */
    if (Array.isArray(ids)) {
        return ids.map(id => `<@${id}>`); // return a list
    } else {
        return `<@${ids}>`; // return a string
    }
}



// Exports
module.exports = {Log};