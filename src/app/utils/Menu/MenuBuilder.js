/**
 * @file MenuComponentBuilder.js
 * @description Depreciated
 */

const {UserSelectMenuBuilder, StringSelectMenuBuilder, ButtonBuilder, MessageFlags, ActionRowBuilder} = require('discord.js')
const {EModalBuilder} = require('./ModalHelper.js')



const path = require('path'); const fs = require('fs'); const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync(path.join(__dirname, '../../config/log-config.yml'), 'utf8'));




const ComponentMap ={
    UserSelect: (data) => {return new UserSelectMenuBuilder(data)},
    StringSelect: (data) => {return new StringSelectMenuBuilder(data)},
    Button: (data) => {return new ButtonBuilder(data)}
}

class MenuBuilder {
    constructor(){
        this.action_rows = []
    }       
    
    build(components) {  // components is menu_components in the yaml
        for (const [rowKey, rowConfig] of Object.entries(components)) {
            if (rowConfig.components) {
                let c = []
                rowConfig.components.forEach( (component) => {
                    c.push(ComponentMap[component.typeId](component))
                });  
                this.action_rows.push(new ActionRowBuilder().addComponents(c));
            }
            else{
                this.action_rows.push(new ActionRowBuilder().addComponents(ComponentMap[rowConfig.typeId](rowConfig)))
            }
        }
    }   


    async show(interaction, editReply = false, emb = []){
        console.log(emb)
        if (editReply){ 
            const response = await interaction.editReply({
                components: this.action_rows});
            return response

        } else{
            const response = await interaction.reply({
                embeds: [emb],
                components: this.action_rows,
                withResponse:true,
                flags: MessageFlags.Ephemeral});




            return response
        }
    }


    async GetInputFromModal(interaction, modal, inputs = ""){
        let m = await this.Modal(modal)
        const n = await this.ShowModal(inputs, m, interaction)
        console.log(n)
        return n
    }

    async addMenuOptions(id, option){
        console.log(option)
        this.action_rows.forEach( (row) => {
            row.components.forEach( (component) => {
                if (component.data.custom_id === id){
                    component.addTempOption(option)
                    return;
                }
            })
        })    
    }


    async updateComponent(id, options){
        this.action_rows.forEach( (row) => {
            row.components.forEach( (component) => {
                if (component.data.custom_id === id){
                    component.setEmoji(options.emoji)
                    component.setLabel(options.label)
                    return;
                }
            })
        })    
    }




    async Modal(config) {
        const m = new EModalBuilder(config);
        return m
    }

    async ShowModal(i = "", modal, interaction){
        await interaction.showModal(modal);
        console.log(i)
        try{
            const modalResponse = await interaction.awaitModalSubmit({ 
                time: 30_000,
                filter: (modalInteraction) =>
                    modalInteraction.user.id === interaction.user.id &&
                    modalInteraction.customId === modal.data.custom_id
                });
            
            if (modalResponse){ 
                modalResponse.deferUpdate();
                let res = (modalResponse.fields.getTextInputValue(i) || "");
                return res
          
                

            } else{ console.log("modal canceled")}

        } catch (err) { return null }
    }



    setEnabled(id){
        this.action_rows.forEach( (row) => {
            row.components.forEach( (component) => {
                if (component.data.custom_id === id){
                    component.setEnabled(true)
                    return
                }
            })
        })    
    }















}


module.exports = { MenuBuilder };