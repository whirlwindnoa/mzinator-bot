"use strict";

const { Configuration, OpenAIApi } = require("openai");
const { Client, Events, GatewayIntentBits } = require('discord.js');
const fs = require("fs");

//const config = require('../config.json');

const client = new Client({ intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const configuration = new Configuration({
    apiKey: "",
  });

const openai = new OpenAIApi(configuration);

let context = "";
let modelName = "text-ada-001";

let params = [1.0, 64];

// const modifyParams = (parameter, value) => {
//     let params;
//     fs.readFile("../config.json", (error, data) => {
//         if (error) {
//             console.log(error);
//             throw error;
//         }
//         console.log(JSON.stringify(data));
//     });
// }
// modifyParams();

async function query(message) {
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: modelName,
        prompt: context + `\nQ: ${message.content}\nA: `,
        max_tokens: params[1],
        temperature: params[0]
    });

    message.channel.send(response.data.choices[0].text);
}

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.content.includes('mzinator') && message.author != client.user) {
        try {
            query(message);
        }
        catch {
            message.channel.send("oops, there was an error! try again later")
        }
    }
    // you can change the id with yours or allow anyone with admin permissions to use these
    else if (message.author.id == "") {
        if (message.content.startsWith("!model")) {
            let args = message.content.split(" ");

            if (args.length <= 1) {
                message.channel.send("Error, no argument provided!");
                return;
            }
            modelName = args[1];
            message.channel.send(`Model has been successfully modified to ${modelName}`);
        }
        else if (message.content.startsWith("!context")) {
            if (message.content == "!context") message.channel.send("Current context is:\n\n```" + context + "```");
            else {
                context = message.content.slice(9);
                message.channel.send("Context has been sucessfully modified to:\n\n```" + context + "```");
            }
        }
        else if (message.content.startsWith("!params")) {
            let args = message.content.split(" ");
            if (args.length <= 1) {
                message.channel.send(`Current parameters:\n\nModel: \`${modelName}\`\nTemperature: \`${params[0]}\`\nMax tokens: \`${params[1]}\``);
                return;
            }
            switch (args[1]) {
                case "temp":
                    if (isNaN(args[2])) message.channel.send("error: not a number");
                    else {
                        params[0] = parseFloat(args[2]);
                        message.channel.send(`Modified temperature to ${params[0]}`);
                    }
                    break;
                case "max-tokens":
                    if (isNaN(args[2])) message.channel.send("error: not a number");
                    else {
                        params[1] = parseInt(args[2]);
                        message.channel.send(`Modified max_tokens to ${params[1]}`);
                    }
                    break;
            }
        }
    }
});
client.login("");
