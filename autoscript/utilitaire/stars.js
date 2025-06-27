const STAR_EMOJI = "⭐";
const SKULL_EMOJI = "💀";
const REQUIRED_REACTIONS = 5;
const STARBOARD_CHANNEL_ID = "1332366656428572693";

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.message.channelId !== STARBOARD_CHANNEL_ID) return;
    if (user.bot) return;

    const message = reaction.message;
    const member = await message.guild.members
      .fetch(message.author.id)
      .catch(() => null);
    if (!member) return;

    const currentName = member.displayName;
    const cleanName = currentName.replace(/⭐+$/, "");
    const currentStars = (currentName.match(/⭐/g) || []).length;

    if (reaction.emoji.name === STAR_EMOJI) {
      const count = message.reactions.cache.get(STAR_EMOJI)?.count || 0;
      if (count === REQUIRED_REACTIONS) {
        const newStars = currentStars + 1;
        const newName = `${cleanName}${"⭐".repeat(newStars)}`;

        await member.setNickname(newName).catch(console.error);
        await message.channel.send(
          `Bravo ${member}, ton message a été étoilé ${REQUIRED_REACTIONS} fois ! ⭐`
        );
      }
    }

    if (reaction.emoji.name === SKULL_EMOJI) {
      const count = message.reactions.cache.get(SKULL_EMOJI)?.count || 0;
      if (count === REQUIRED_REACTIONS) {
        if (currentStars > 0) {
          const newStars = currentStars - 1;
          const newName =
            newStars > 0 ? `${cleanName}${"⭐".repeat(newStars)}` : cleanName;

          await member.setNickname(newName).catch(console.error);
          await message.channel.send(
            `${member}, ton message est vraiment nul 💀. Tu perds une étoile...`
          );
        } else {
          await message.channel.send(
            `${member}, ton message est à chier 💀 mais tu n'avais aucune étoile à perdre.`
          );
        }
      }
    }
  },
};
