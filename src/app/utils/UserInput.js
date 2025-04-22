/**
 * @file Log.js
 * @description This file contains the Log class, which is used to create and manage a log for the application.
 */

const {EmbedBuilder} = require("@discordjs/builders");
const { blockQuote, quote, underline, bold} = require('discord.js');
const ClientVariables = require('../ClientVariables');






class Archive{
    constructor(type, data){
        this.type = type
        this.data = data
        
    }

    toEmbed(options) {
        const logged_user_names = getNameFromID(this.logged_users).join(', '); 
        const userAvatarURL = this.anon ? ClientVariables.displayAvatar : userObj.displayAvatarURL({ extension: 'png' }); 
        const authorName = this.anon ? 'anonymous' : (userObj.nickname || userObj.displayName); 

        const embed = new EmbedBuilder()
            .setColor(embed_strings.colors(this.point_action))  // Embed color
            .setTitle(`${embed_strings.embd_title(this.points, this.point_action)}`)
            .addFields(
                { name: bold(embed_strings.mmheading), value: logged_user_names, inline: false },
                { name: bold((embed_strings.loc_fname)), value: quote(this.location_name), inline: true },
                { name: bold((embed_strings.evnt_fname)), value: quote(this.event_name), inline: true },
                { name: bold(underline(embed_strings.entry_fname)), value: blockQuote(this.entry), inline: false }
            )
            .setTimestamp(new Date(this.date_time))
            .setFooter({ text: embed_strings.footer(authorName) })
            .setAuthor({ name: authorName, iconURL: userAvatarURL });
    
        try {
            if (this.attachment.contentType?.startsWith('image/')) {
                embed.setImage(this.attachment.url);
            } else {
                embed.addFields({ name: '', value: this.attachment.url });
            }
    
            if (this.url) {
                embed.addFields({ name: 'Link', value: this.url });
            }
    
        } catch (err) {

        }
    
        return embed;  
    }

    toJSON(){
        


        let js = {
            authorId: this.authorId,
            date_time: this.date_time,
            tagged_members: this.logged_users,
            entry: this.entry,
            event_name: this.event_name,
            location_name: this.location_name,
            points: (this.point_action === 'report') ? -parseInt(this.points) : parseInt(this.points),
            point_action: this.point_action,
            anon: this.anon,
        }

        return js
    };

    isFilled() {
        if (
            !this.logged_users || this.logged_users.length === 0 || 
            !this.event_name
        ) {
            return false;
        }
        
        return true
    }
}


function getNameFromID(ids) {
    if (Array.isArray(ids)) {
        return ids.map(id => `<@${id}>`); // return a list
    } else {
        return `<@${ids}>`; // return a string
    }
}



// Exports
module.exports = {UserInput};