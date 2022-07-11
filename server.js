const { WebhookClient } = require('discord.js');
const { TwitterApi } = require('twitter-api-v2');
const { watchForTransfers } = require('./utils/watcher');
const { formatDiscordMessage, formatTwitterMessage } = require('./utils/format');

require('dotenv').config();
const {
	DISCORD_ID, DISCORD_TOKEN,
	TWITTER_API_KEY, TWITTER_API_KEY_SECRET, TWITTER_ACCESS_TOKEN_KEY, TWITTER_ACCESS_TOKEN_SECRET
} = process.env;

const webhookClient = new WebhookClient({id: DISCORD_ID, token: DISCORD_TOKEN});
const _twitterClient = new TwitterApi({
	appKey: TWITTER_API_KEY,
	appSecret: TWITTER_API_KEY_SECRET,
	accessToken: TWITTER_ACCESS_TOKEN_KEY,
	accessSecret: TWITTER_ACCESS_TOKEN_SECRET
});
const twitterClient = _twitterClient.readWrite;

const handleTwitterError = (msg, error) => {
	console.log(JSON.stringify(msg))
	console.log(error)
}

const transferHandler = async ({ data, totalPrice, buyer, seller, ethPrice, currency, platforms }) => {
	// post to discord
	const discordMsg = await formatDiscordMessage({ data, totalPrice, buyer, seller, ethPrice, currency, platforms });
	webhookClient.send(discordMsg).catch(console.error);

	// tweet
	const [twitterMessage, mediaId] = await formatTwitterMessage(twitterClient, { data, totalPrice, buyer, seller, ethPrice, currency, platforms });
	twitterClient.v1.tweet(twitterMessage, { media_ids: mediaId }).catch(err => { handleTwitterError(twitterMessage, err ) });
};

watchForTransfers(transferHandler);