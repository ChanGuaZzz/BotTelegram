require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const apiKey = process.env.apiKeySong;

async function getLyrics(SongArtist) {
    try {
      const response = await axios.get(
        `https://api.genius.com/search?q=${encodeURIComponent(
          `${SongArtist}`
        )}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      // Extraer la URL de la letra desde la respuesta
      const url = response.data.response.hits[0].result.url;
      return url;
    } catch (error) {
      console.error("Error al obtener la letra:", error);
      return null;
    }
  }


try {
  

  let waitingForLyrics = false;
  //token del bot para la comunicacion
  const token = "6773824406:AAGxVOHc8Kkuo6d3h5Kj-kfI645Zcnb39sg";
  const bot = new TelegramBot(token, { polling: true });

  //iniciar chat con el bot callback
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "¡Hola! Soy LyricsRythmBot🎧 , \n\n tu asistente musical🎵 . Estoy aquí para ayudarte con letras de canciones y recomendaciones de géneros musicales. \n\n Utiliza /menu para ver las opciones disponibles 🎙🎤."
    );
  });

  bot.onText(/\/menu/, (msg) => {
    const chatId = msg.chat.id;
    const menuMessage = "¡Bienvenido al menú!\n";

    const menuKeyboard = {
      keyboard: [
        [{ text: "Géneros Musicales", callback_data: "/gender" }],
        [{ text: "Letras de Canciones", callback_data: "/lyrics" }]
      ],
    };
    const options = {
      reply_markup: menuKeyboard,
    };

    bot.sendMessage(chatId, menuMessage, options);
  });


  bot.on('polling_error', (error) => {
    console.error('Error de polling:', error);
  });
  
  bot.onText(/\/gender/, (msg) => {
    const chatId = msg.chat.id;
    const generosMessage = "Elige un género musical:\n";

    const menu = {
      keyboard: [
        [{ text: "/Pop"}],
        [{ text: "/Rock"}],
        [{ text: "/HipHop"}],
        [{ text: "/Boleros"}],
        [{ text: "/Indie"}],
        [{ text: "/Techno"}]
      ],
    };

    const options = {
      reply_markup: menu,
    };
    bot.sendMessage(chatId, generosMessage, options);
  });

  bot.onText(/\/lyrics/, (msg) => {
    const chatId = msg.chat.id;
    waitingForLyrics = true;
    bot.sendMessage(
      chatId,
      'Por favor, proporciona el nombre de la canción para obtener la letra de esta manera \n\n  "NombreCancion NombreAutor"'
    );
  });

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    if (waitingForLyrics && !message.startsWith("/")) {
      // Lógica para manejar el nombre de la canción aquí
      bot.sendMessage(chatId, `Obteniendo la letra para: ${message}`);

      getLyrics(message)
      .then((res) => {
        bot.sendMessage(chatId, `${res}`);
      })
      .catch((error)=>{
        console.log(error);
        bot.sendMessage(chatId, ` Hubo un error al encontrar la letra de ${m}`);
      });

      waitingForLyrics = false;
    }
  });


} catch (error) {
  console.error("Error:", error);
}
