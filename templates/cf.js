// i got this idea from chooks22
"use modules";

import { 
    InteractionResponseFlags,
    InteractionType,
    verifyKey,
    InteractionResponseType
} from 'discord-interactions';
//this will import all the modules statically

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      "use handle";
    // Most user commands will come as `APPLICATION_COMMAND`.
//    switch (interaction.data.name.toLowerCase()) {
//      case AWW_COMMAND.name.toLowerCase(): {
//        const cuteUrl = await getCuteUrl();
//        return new JsonResponse({
//          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
//          data: {
//            content: cuteUrl,
//          },
//        });
//      }
//      case INVITE_COMMAND.name.toLowerCase(): {
//        const applicationId = env.DISCORD_APPLICATION_ID;
//        const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
//        return new JsonResponse({
//          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
//          data: {
//            content: INVITE_URL,
//            flags: InteractionResponseFlags.EPHEMERAL,
//          },
//        });
//      }
//      default:
//        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
//    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));


async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}


const server = {
  verifyDiscordRequest: verifyDiscordRequest,
  fetch: async function (request, env) {
    return router.handle(request, env);
  },
};
export default server;
